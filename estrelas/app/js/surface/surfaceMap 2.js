//
//  surfaceMap.js
//  Estrelas (web)
//
//  Procedural surface styles for planets and moons, and the noise they're drawn from. Rocky and icy worlds are
//  coloured cell by cell on a spherical Voronoi surface (voronoiSurface.js); gas giants and moons get equirectangular
//  textures; worlds with atmospheres get cloud layers. A port of SurfaceMap.swift that draws the same surfaces.
//

import { luminosityScale, environmentTemperature, hasLiquidWater, isIcyGiant } from '../model/planetarySystem.js';
import {
    out, mul, add, addSmall, split, unit, splitMix, stableHash, int64Hi, GOLDEN, KY, KZ, FMIX,
} from './u64.js';
import { shore as templateShore, templateElevation } from './surfaceTemplate.js';
import { volcanismFor, volcanicRelief, volcanoVersion } from './volcanism.js';

export const width = 1024;
export const height = 512;
/** The detailed map shown when zoomed into a planet: four times the globe's resolution, with finer noise on top */
export const detailedWidth = 4096;
export const detailedHeight = 2048;
export const detailedOctaves = 3;

/** Size of a detailed map drawn `scale` times finer than the standard one; `scale` is 1, 2 or 4 */
export function detailedSize(scale = 1) {
    return { width: detailedWidth * scale, height: detailedHeight * scale };
}
/** Voronoi cells on a rocky or icy globe (163,842) and on its detailed map (655,362), as icosphere subdivisions */
export const globeSubdivisions = 7;
export const detailedSubdivisions = 8;
/** Cells the climate of biome surfaces is worked out on (40,962) */
export const climateSubdivisions = 6;
export const cloudWidth = 2048;
export const cloudHeight = 1024;
export const cloudAltitude = Math.fround(0.025);
/** Bumped whenever the way clouds are drawn changes, so cloud maps saved by an earlier version are drawn again */
export const cloudVersion = 2;

/**
 * How rocky worlds' surfaces are generated, chosen in Settings: 'classic', 'biomes' (climate and biomes) or 'polygons'
 * (Amit Patel's polygonal map generation)
 */
let surfaceGenerator = 'biomes';
export function setSurfaceGenerator(value) {
    surfaceGenerator = value === 'biomes' || value === 'polygons' ? value : 'classic';
}
export function currentSurfaceGenerator() {
    return surfaceGenerator;
}

/** Whether every solid moon is drawn like a planet, as chosen in Settings */
let moonsLikePlanets = false;
export function setMoonsLikePlanets(value) {
    moonsLikePlanets = !!value;
}

/** Bumped whenever the way ice over water is coloured changes. 2: frozen seas drawn as sea ice rather than snow. */
export const seaIceVersion = 2;
/** Bumped whenever climate and biome surfaces change. 2: mountain ranges. 3: rougher mountains. 4: broken ground. */
export const climateVersion = 4;
/** Bumped whenever the way craters are struck changes. 2: struck after the surface is generated. */
export const craterVersion = 2;
/** Snow lying on land: bright, flat and matte */
export const snow = [0.92, 0.94, 0.97];

const MASK64 = (1n << 64n) - 1n;
const TWO_PI = 2 * Math.PI;

export { stableHash };

/** A style object. Seeds are BigInts, split into hi and lo for the hot loops. */
function makeStyle(fields) {
    const style = {
        kind: 'rocky', seed: 0n, waterFraction: 0, iceCapLatitude: 90, vegetation: false, base: [0, 0, 0],
        accent: [0, 0, 0], bands: 0, stormColor: undefined, stormLatitude: 0, stormLongitude: 0, craterDensity: 0, maria: 0,
        biomes: false, polygonMap: false, frozenOver: false, template: undefined, ...fields,
    };
    return style;
}

/** Recomputes the cached hi/lo halves of a style's seed (styles may travel to workers as plain objects) */
export function prepared(style) {
    const seed = BigInt(style.seed);
    const [hi, lo] = split(seed);
    return { ...style, seed, seedHi: hi, seedLo: lo, phase: Number(seed % 628n) / 100 };
}

/** Whether a world gets a detailed surface map: rocky and icy worlds do; gas giants and belts have no surface */
export function hasDetailedMap(world) {
    const style = styleFor(world);
    return !!style && style.kind !== 'gasGiant';
}

/**
 * Where the star stands overhead on a world locked to it, on the unit sphere of the world's own surface: the map's
 * longitude 180° on the equator, so the open day side sits in the middle of the detailed map
 */
export const substellarPoint = [-1, 0, 0];

/** Frozen moons with plenty of water, and unsurveyed ones beyond the snow line, are icy */
function isIcy(environment, au, sqrtL) {
    return environment ? environmentTemperature(environment) === 'frozen' && environment.waterPercent >= 30 : au >= 2.7 * sqrtL;
}

/** A map style for planets; belts have none */
export function styleFor(world) {
    const seed = stableHash(world.designation);
    const sqrtL = luminosityScale(world);
    if (world.gasGiant) return gasGiantStyle(world.gasGiant, seed, world.au < 0.1 * sqrtL);
    if (world.type !== 'terrestrial') return undefined;
    const environment = world.environment;

    // Unsurveyed worlds beyond the snow line are taken to be icy crusts. Surveyed frozen worlds are drawn as they are:
    // rock and snow, with any seas frozen over.
    if (!environment && world.au >= 2.7 * sqrtL) {
        const tints = [[0.88, 0.92, 0.97], [0.9, 0.87, 0.78], [0.8, 0.86, 0.92]];
        const style = makeStyle({ kind: 'icy', seed, waterFraction: 0, iceCapLatitude: 0, vegetation: false,
            base: tints[Number(seed % BigInt(tints.length))] });
        // Ice resurfaces itself, so craters are fewer than on rock, and fewer still under a thick haze
        style.craterDensity = (environment?.pressureBar ?? 0) >= 0.3 ? 0.1 : 0.4;
        return style;
    }
    const rocks = [[0.55, 0.36, 0.26], [0.5, 0.48, 0.45], [0.62, 0.52, 0.38], [0.4, 0.36, 0.33]];
    const style = rockyStyle(seed, rocks[Number(seed % BigInt(rocks.length))], environment);
    // A world keeping one face to its star freezes over on its night side rather than at its poles; worlds in a 3:2
    // resonance, like Mercury, still see every side lit in turn, so they keep polar caps
    if (world.rotation?.tidalLock === 'star') style.substellarPoint = substellarPoint.slice();
    // A surface known from a map keeps its seas and land, ice and deserts
    const template = world.surfaceTemplate?.decoded;
    if (template) {
        style.template = template;
        if (style.waterFraction > 0 || template.waterFraction > 0.01) style.waterFraction = Math.max(template.waterFraction, 0.01);
    } else {
        // Volcanoes, and on the hottest worlds lava seas, where the world would have them
        const volcanic = volcanismFor(world, seed, world.tidallyHeated);
        if (volcanic) {
            style.volcanism = volcanic.volcanism;
            style.lavaSeas = volcanic.lavaSeas;
            const radius = (world.radiusKm ?? 6371) / 6371;
            style.gravity = Math.round((world.massEarths ?? Math.pow(radius, 3.7)) / (radius * radius) * 100) / 100;
            // Lava paves over old craters: a very volcanic world keeps few
            style.craterDensity = Math.round(style.craterDensity * (1 - 0.8 * volcanic.volcanism * volcanic.volcanism) * 100) / 100;
        }
    }
    // Climate needs water to work with; dry worlds look the same either way
    style.biomes = surfaceGenerator !== 'classic' && style.waterFraction > 0;
    style.polygonMap = surfaceGenerator === 'polygons' && style.biomes;
    return style;
}

/** Smallest radius, in km, a gas giant's moon needs to be drawn like a planet: about the Moon's and up */
export const worldlikeMoonRadius = 1500;

/**
 * Whether a moon gets a planet's globe, clouds and detailed map instead of a shared moon texture: a gas giant's large
 * moons, or with the Settings option every rocky or icy moon
 */
export function isWorldlike(moon, planet) {
    if (moon.gasGiant) return false;
    return isLargeWorldlike(moon, planet) || moonsLikePlanets;
}

/** Whether a moon is drawn like a planet whatever the Settings say: one of a gas giant's large moons */
export function isLargeWorldlike(moon, planet) {
    return planet.type === 'gasGiant' && !moon.gasGiant && moon.radiusKm >= worldlikeMoonRadius;
}

/** One of a planet's moons as a world of its own, at the planet's distance from its star(s) */
export function worldlike(planet, moon) {
    return {
        ...planet, designation: moon.designation, type: 'terrestrial', radiusKm: moon.radiusKm, massEarths: moon.massEarths,
        gasGiant: undefined, anomaly: undefined, resonance: undefined, rings: 0, moons: [], environment: moon.environment,
        isPrincipal: moon.isPrincipal, social: moon.social, rotation: moon.rotation, surfaceTemplate: moon.surfaceTemplate,
        // Kneaded by a gas giant's tides, and so perhaps volcanic
        tidallyHeated: planet.type === 'gasGiant',
    };
}

// MARK: moons

export const MoonTemplates = ['rocky', 'rockyMaria', 'rockyMariaHeavy', 'rockyThinAir', 'rockySmooth', 'icy',
    'icyDarkTerrain', 'icyHazy', 'gasGiant', 'gasGiantFine'];
const neutral = 0.9;

export function moonTemplateStyle(template) {
    const style = makeStyle({ kind: 'rocky', seed: stableHash(`moon template ${template}`), waterFraction: 0,
        iceCapLatitude: 90, vegetation: false, base: [neutral, neutral, neutral] });
    switch (template) {
        case 'rocky': style.craterDensity = 1; break;
        case 'rockyMaria': style.craterDensity = 1; style.maria = 0.25; break;
        case 'rockyMariaHeavy': style.craterDensity = 1; style.maria = 0.4; break;
        case 'rockyThinAir': style.craterDensity = 0.5; break;
        case 'rockySmooth': style.craterDensity = 0; break;
        case 'icy': style.kind = 'icy'; style.craterDensity = 0.7; break;
        case 'icyDarkTerrain': style.kind = 'icy'; style.craterDensity = 0.7; style.maria = 0.3; break;
        case 'icyHazy': style.kind = 'icy'; style.craterDensity = 0.15; break;
        default:
            style.kind = 'gasGiant';
            style.accent = [neutral * 0.75, neutral * 0.75, neutral * 0.75];
            style.bands = template === 'gasGiant' ? 7 : 11;
    }
    return style;
}

/** xorshift from a seed, so one hash gives several independent choices */
function xorshift(seed) {
    let generator = BigInt(seed);
    return () => {
        generator ^= (generator << 13n) & MASK64;
        generator ^= generator >> 7n;
        generator ^= (generator << 17n) & MASK64;
        return Number(generator >> 11n) / 2 ** 53;
    };
}

export const mixColor = (a, b, t) => {
    const k = Math.min(Math.max(t, 0), 1);
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
};

/** A moon's look: which shared grey template it wears, and the tint that gives it its colour */
export function moonAppearance(moon, planet) {
    const seed = stableHash(moon.designation);
    const sqrtL = luminosityScale(planet);
    const next = xorshift(seed | 1n);

    let template;
    let color;
    const environment = moon.environment;
    const pressure = environment?.pressureBar ?? 0;
    // Moons share their planet's distance from the star, so the snow line goes by the planet's orbit
    const icy = isIcy(environment, planet.au, sqrtL);
    if (moon.gasGiant) {
        template = next() < 0.5 ? 'gasGiant' : 'gasGiantFine';
        color = gasGiantStyle(moon.gasGiant, seed, planet.au < 0.1 * sqrtL).base;
    } else if (icy) {
        const tints = [[0.92, 0.93, 0.95], [0.78, 0.74, 0.68], [0.86, 0.8, 0.7], [0.7, 0.72, 0.76]];
        color = tints[Number(seed % BigInt(tints.length))];
        template = pressure >= 0.01 ? 'icyHazy' : next() < 0.5 ? 'icyDarkTerrain' : 'icy';
    } else {
        const rocks = [[0.5, 0.49, 0.47], [0.42, 0.4, 0.38], [0.58, 0.54, 0.48], [0.52, 0.44, 0.36]];
        const style = rockyStyle(seed, rocks[Number(seed % BigInt(rocks.length))], environment);
        color = style.base;
        color = mixColor(color, [0.2, 0.38, 0.62], style.waterFraction * 0.6);
        if (style.vegetation) color = mixColor(color, [0.25, 0.42, 0.22], 0.35);
        if (pressure < 0.01) {
            // Moons under about 600 km are too small to have had the lava for maria
            const choices = moon.radiusKm >= 600 ? ['rocky', 'rockyMaria', 'rockyMariaHeavy'] : ['rocky'];
            template = choices[Math.min(Math.trunc(next() * choices.length), choices.length - 1)];
        } else if (pressure < 0.3) {
            template = 'rockyThinAir';
        } else {
            template = 'rockySmooth';
        }
    }
    const drift = [0.94 + 0.12 * next(), 0.94 + 0.12 * next(), 0.94 + 0.12 * next()];
    color = [color[0] * drift[0], color[1] * drift[1], color[2] * drift[2]];
    const tint = color.map((c) => Math.min(Math.max(c / neutral, 0), 1));
    return { template, tint };
}

function rockyStyle(seed, base, environment) {
    let iceCap = 90.0;
    const band = environment ? environmentTemperature(environment) : undefined;
    switch (band) {
        case 'cold': iceCap = 50; break;
        case 'temperate': iceCap = 72; break;
        case 'hot': iceCap = 86; break;
        case 'boiling': base = [base[0] * 0.7 + 0.12, base[1] * 0.7 + 0.02, base[2] * 0.7 + 0]; break;
        default: break;
    }
    const water = band === 'boiling' ? 0 : (environment?.waterPercent ?? 0) / 100;
    // Too cold for liquid water anywhere: the seas are ice-bound and the land snowbound, pole to pole
    const frozenOver = band === 'frozen' && water > 0;
    // Plants grow wherever there's a living biosphere: oxygen in the air, and liquid water
    const vegetation = environment ? environment.atmosphere === 'nitrogenOxygen' && hasLiquidWater(environment) : false;
    const style = makeStyle({ kind: 'rocky', seed, waterFraction: water, iceCapLatitude: iceCap, vegetation, base });
    style.frozenOver = frozenOver;
    // Airless worlds keep every crater; thin air erodes some, and anything thicker wipes them away
    const pressure = environment?.pressureBar ?? 0;
    if (pressure < 0.01) style.craterDensity = 1;
    else if (pressure < 0.3) style.craterDensity = 0.5;
    else style.craterDensity = 0;
    return style;
}

function gasGiantStyle(gasGiant, seed, hot) {
    const next = xorshift(seed);
    const style = makeStyle({ kind: 'gasGiant', seed, waterFraction: 0, iceCapLatitude: 90, vegetation: false });
    if (hot) {
        style.base = [0.5, 0.33, 0.26];
        style.accent = [0.24, 0.14, 0.12];
        style.bands = 8 + next() * 4;
    } else if (isIcyGiant(gasGiant.giantClass)) {
        style.base = next() < 0.5 ? [0.62, 0.84, 0.88] : [0.38, 0.58, 0.88];
        style.accent = style.base.map((c) => c * 0.82);
        style.bands = 5 + next() * 4;
        if (next() < 0.4) style.stormColor = [0.16, 0.26, 0.52];
    } else if (next() < 0.6) {
        style.base = [0.92, 0.87, 0.75];
        style.accent = [0.7, 0.5, 0.34];
        style.bands = 11 + next() * 5;
        if (next() < 0.6) style.stormColor = [0.78, 0.4, 0.27];
    } else {
        style.base = [0.92, 0.84, 0.62];
        style.accent = [0.8, 0.68, 0.46];
        style.bands = 13 + next() * 5;
    }
    const sign = next() < 0.5 ? -1 : 1;
    style.stormLatitude = sign * (12 + next() * 20) * Math.PI / 180;
    style.stormLongitude = next() * 2 * Math.PI;
    return style;
}

/** The settings a surface was drawn from, as saved with it (SurfaceStyleRecord) */
export function styleRecord(style) {
    const record = {
        kind: style.kind, seed: BigInt.asUintN(64, BigInt(style.seed)).toString(16).padStart(16, '0'),
        waterFraction: style.waterFraction, iceCapLatitude: style.iceCapLatitude, vegetation: style.vegetation,
        base: style.base.slice(), accent: style.accent.slice(), bands: style.bands,
        stormLatitude: style.stormLatitude * 180 / Math.PI, stormLongitude: style.stormLongitude * 180 / Math.PI,
        craterDensity: style.craterDensity, maria: style.maria, biomes: !!style.biomes,
        relief: style.biomes ? true : undefined, edgeRivers: style.biomes ? true : undefined,
        substellarPoint: style.substellarPoint ? style.substellarPoint.slice() : undefined, mapOrientation,
        frozenOver: style.frozenOver ? true : undefined, seaIceVersion, polygonMap: style.polygonMap ? true : undefined,
        craterVersion, climateVersion: style.biomes && !style.polygonMap ? climateVersion : undefined,
        templateFingerprint: style.template?.fingerprint,
        volcanism: style.volcanism > 0 ? style.volcanism : undefined, lavaSeas: style.lavaSeas > 0 ? style.lavaSeas : undefined,
        volcanoVersion: style.volcanism > 0 ? volcanoVersion : undefined,
    };
    if (style.stormColor) record.stormColor = style.stormColor.slice();
    return record;
}

/**
 * Whether a surface saved with `saved` looks the way one with `current` would be drawn now: the same kind of world
 * from the same data, frozen over or not, by the same generator and template, and if it has craters or ice over water
 * that are drawn differently now, by the same versions of them (SurfaceStyleRecord.matches)
 */
export function recordMatches(saved, current) {
    if (!saved) return false;
    const same = (a, b) => (a ?? null) === (b ?? null);
    const sameColor = (a, b) => (a ?? []).length === (b ?? []).length && (a ?? []).every((v, i) => v === b[i]);
    if (saved.kind !== current.kind || !same(saved.frozenOver, current.frozenOver) ||
        !same(saved.polygonMap, current.polygonMap) || saved.vegetation !== current.vegetation ||
        saved.waterFraction !== current.waterFraction || saved.iceCapLatitude !== current.iceCapLatitude ||
        !sameColor(saved.base, current.base) || saved.craterDensity !== current.craterDensity) return false;
    const cratersChanged = current.craterDensity > 0 &&
        (current.iceCapLatitude < 90 || current.frozenOver === true || current.biomes === true);
    if (cratersChanged && !same(saved.craterVersion, current.craterVersion)) return false;
    if (!same(saved.climateVersion, current.climateVersion)) return false;
    if (!same(saved.templateFingerprint, current.templateFingerprint)) return false;
    if (!same(saved.volcanism, current.volcanism) || !same(saved.lavaSeas, current.lavaSeas) ||
        !same(saved.volcanoVersion, current.volcanoVersion)) return false;
    const hasSeaIce = current.frozenOver === true || (current.iceCapLatitude < 90 && current.waterFraction > 0);
    return !hasSeaIce || same(saved.seaIceVersion, current.seaIceVersion);
}

// MARK: noise

/** The lattice value from its hash h = seed ^ x·G ^ y·KY ^ z·KZ */
function latticeFinish(hhi, hlo) {
    // h ^= h >> 33
    hlo = (hlo ^ (hhi >>> 1)) >>> 0;
    mul(hhi, hlo, FMIX[0], FMIX[1]);
    hhi = out.hi; hlo = out.lo;
    hlo = (hlo ^ (hhi >>> 1)) >>> 0;
    return unit(hhi, hlo);
}

/**
 * The eight corners' hashes share their products: (c + 1)·K is c·K + K, so each axis needs one multiplication and an
 * addition rather than four multiplications. The values are bit for bit the same as multiplying each corner's.
 */
function valueNoise(px, py, pz, seedHi, seedLo) {
    const cx = Math.floor(px), cy = Math.floor(py), cz = Math.floor(pz);
    const fx = px - cx, fy = py - cy, fz = pz - cz;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), sz = fz * fz * (3 - 2 * fz);
    mul(int64Hi(cx), cx >>> 0, GOLDEN[0], GOLDEN[1]);
    const x0h = out.hi, x0l = out.lo;
    add(x0h, x0l, GOLDEN[0], GOLDEN[1]);
    const x1h = out.hi, x1l = out.lo;
    mul(int64Hi(cy), cy >>> 0, KY[0], KY[1]);
    const y0h = out.hi, y0l = out.lo;
    add(y0h, y0l, KY[0], KY[1]);
    const y1h = out.hi, y1l = out.lo;
    mul(int64Hi(cz), cz >>> 0, KZ[0], KZ[1]);
    const z0h = (seedHi ^ out.hi) >>> 0, z0l = (seedLo ^ out.lo) >>> 0;
    add(out.hi, out.lo, KZ[0], KZ[1]);
    const z1h = (seedHi ^ out.hi) >>> 0, z1l = (seedLo ^ out.lo) >>> 0;
    const c000 = latticeFinish((x0h ^ y0h ^ z0h) >>> 0, (x0l ^ y0l ^ z0l) >>> 0);
    const c100 = latticeFinish((x1h ^ y0h ^ z0h) >>> 0, (x1l ^ y0l ^ z0l) >>> 0);
    const c010 = latticeFinish((x0h ^ y1h ^ z0h) >>> 0, (x0l ^ y1l ^ z0l) >>> 0);
    const c110 = latticeFinish((x1h ^ y1h ^ z0h) >>> 0, (x1l ^ y1l ^ z0l) >>> 0);
    const c001 = latticeFinish((x0h ^ y0h ^ z1h) >>> 0, (x0l ^ y0l ^ z1l) >>> 0);
    const c101 = latticeFinish((x1h ^ y0h ^ z1h) >>> 0, (x1l ^ y0l ^ z1l) >>> 0);
    const c011 = latticeFinish((x0h ^ y1h ^ z1h) >>> 0, (x0l ^ y1l ^ z1l) >>> 0);
    const c111 = latticeFinish((x1h ^ y1h ^ z1h) >>> 0, (x1l ^ y1l ^ z1l) >>> 0);
    const x00 = c000 + (c100 - c000) * sx;
    const x10 = c010 + (c110 - c010) * sx;
    const x01 = c001 + (c101 - c001) * sx;
    const x11 = c011 + (c111 - c011) * sx;
    const y0 = x00 + (x10 - x00) * sy;
    const y1 = x01 + (x11 - x01) * sy;
    return y0 + (y1 - y0) * sz;
}

/** Fractal value noise, roughly 0...1; extra octaves add finer detail without shifting the base value */
export function fbm(px, py, pz, seedHi, seedLo, octaves, extraOctaves = 0) {
    let sum = 0, amplitude = 0.5, total = 0;
    let x = px, y = py, z = pz;
    for (let octave = 0; octave < octaves; octave++) {
        addSmall(seedHi, seedLo, octave);
        sum += valueNoise(x, y, z, out.hi, out.lo) * amplitude;
        total += amplitude;
        amplitude *= 0.5;
        x *= 2.03; y *= 2.03; z *= 2.03;
    }
    for (let octave = octaves; octave < octaves + extraOctaves; octave++) {
        addSmall(seedHi, seedLo, octave);
        sum += (valueNoise(x, y, z, out.hi, out.lo) - 0.5) * amplitude;
        amplitude *= 0.5;
        x *= 2.03; y *= 2.03; z *= 2.03;
    }
    return sum / total;
}

// MARK: colour at a point

/** Height below which a rocky surface is under water, so the right fraction is ocean */
export function seaLevel(style, icosphere) {
    // A template puts its shore at a set height
    if (style.template) return style.kind === 'rocky' && style.waterFraction > 0 ? templateShore : 0;
    if (style.kind !== 'rocky' || !(style.waterFraction > 0)) return 0;
    const vertices = icosphere(5).vertices;
    const count = vertices.length / 3;
    const heights = new Float64Array(count);
    for (let i = 0; i < count; i++) {
        heights[i] = fbm(vertices[i * 3] * 2.2, vertices[i * 3 + 1] * 2.2, vertices[i * 3 + 2] * 2.2,
            style.seedHi, style.seedLo, 5);
    }
    heights.sort();
    return heights[Math.min(Math.trunc(style.waterFraction * count), count - 1)];
}

/** Height noise at a point on the unit sphere, roughly 0...1; sea level is measured against it */
export function elevation(style, px, py, pz, detailOctaves) {
    if (style.template) {
        // The template's ground, with the world's noise roughening it a little, so coasts wander naturally
        const detail = fbm(px * 6, py * 6, pz * 6, style.seedHi, style.seedLo, 4, detailOctaves) - 0.5;
        return templateElevation(style.template, px, py, pz) + detail * 0.07;
    }
    const height = fbm(px * 2.2, py * 2.2, pz * 2.2, style.seedHi, style.seedLo, 5, detailOctaves);
    return style.volcanism > 0 ? height + volcanicRelief(style, px, py, pz) : height;
}

/** Fine noise, roughly 0...1, that roughens colours and the edges of ice caps */
export function detailNoise(style, px, py, pz, detailOctaves) {
    addSmall(style.seedHi, style.seedLo, 1);
    return fbm(px * 9, py * 9, pz * 9, out.hi, out.lo, 3, detailOctaves);
}

function mariaCover(px, py, pz, style) {
    if (!(style.maria > 0)) return 0;
    addSmall(style.seedHi, style.seedLo, 5);
    const plains = fbm(px * 1.4, py * 1.4, pz * 1.4, out.hi, out.lo, 4);
    const threshold = 0.5 - (0.5 - style.maria) * 0.18;
    const t = Math.min(Math.max((threshold - plains) / 0.04, 0), 1);
    return t * t * (3 - 2 * t);
}

const rsqrtNormalize = (x, y, z) => {
    const r = 1 / Math.sqrt(x * x + y * y + z * z);
    return [x * r, y * r, z * r];
};

// Each crater cell's crater (or none), worked out once per style rather than for every pixel near it
const craterCaches = new Map();
function craterCells(seedHi, seedLo, threshold) {
    const key = `${seedHi}:${seedLo}:${threshold}`;
    let cells = craterCaches.get(key);
    if (!cells) {
        if (craterCaches.size >= 4) craterCaches.delete(craterCaches.keys().next().value);
        cells = new Map();
        craterCaches.set(key, cells);
    }
    return cells;
}

/** The crater in one cell, as [centre x, y, z on the sphere, radius], or null if the cell has none */
function craterIn(cx, cy, cz, scaleHi, scaleLo, cellSize, threshold) {
    // cellHash
    mul(int64Hi(cx), cx >>> 0, GOLDEN[0], GOLDEN[1]);
    let hhi = (scaleHi ^ out.hi) >>> 0, hlo = (scaleLo ^ out.lo) >>> 0;
    mul(int64Hi(cy), cy >>> 0, KY[0], KY[1]);
    hhi = (hhi ^ out.hi) >>> 0; hlo = (hlo ^ out.lo) >>> 0;
    mul(int64Hi(cz), cz >>> 0, KZ[0], KZ[1]);
    hhi = (hhi ^ out.hi) >>> 0; hlo = (hlo ^ out.lo) >>> 0;
    splitMix(hhi, hlo);
    // next()
    splitMix(out.hi, out.lo);
    if (!(unit(out.hi, out.lo) < threshold)) return null;
    splitMix(out.hi, out.lo);
    const rx = unit(out.hi, out.lo);
    splitMix(out.hi, out.lo);
    const ry = unit(out.hi, out.lo);
    splitMix(out.hi, out.lo);
    const rz = unit(out.hi, out.lo);
    const spotX = (cx + rx) * cellSize, spotY = (cy + ry) * cellSize, spotZ = (cz + rz) * cellSize;
    const length = Math.sqrt(spotX * spotX + spotY * spotY + spotZ * spotZ);
    if (!(Math.abs(length - 1) < cellSize * 0.5)) return null;
    splitMix(out.hi, out.lo);
    const r1 = unit(out.hi, out.lo);
    splitMix(out.hi, out.lo);
    const r2 = unit(out.hi, out.lo);
    return [spotX / length, spotY / length, spotZ / length, cellSize * (0.15 + 0.2 * r1 * r2)];
}

/** Brightness change from impact craters: positive lights, negative shades */
function craterShade(px, py, pz, style, minimumRadius) {
    if (!(style.craterDensity > 0)) return 0;
    // east = cross(point, up) with up = (0, 1, 0)
    let ex = py * 0 - pz * 1, ey = pz * 0 - px * 0, ez = px * 1 - py * 0;
    const eastLength = Math.sqrt(ex * ex + ey * ey + ez * ez);
    if (!(eastLength > 1e-6)) return 0;
    [ex, ey, ez] = rsqrtNormalize(ex, ey, ez);
    // north = cross(east, point)
    const nx = ey * pz - ez * py, ny = ez * px - ex * pz, nz = ex * py - ey * px;
    const [lx, ly, lz] = rsqrtNormalize(nx - ex, ny - ey, nz - ez);

    const strength = 0.22;
    const rimHeight = 0.25;
    let shade = 0.0;
    let cellSize = 0.5;
    const threshold = style.craterDensity * 0.6;
    const cells = craterCells(style.seedHi, style.seedLo, threshold);
    for (let scale = 0; scale < 6; scale++) {
        if (!(cellSize * 0.35 >= minimumRadius)) continue;
        const sx = px / cellSize, sy = py / cellSize, sz = pz / cellSize;
        const bx = Math.floor(sx), by = Math.floor(sy), bz = Math.floor(sz);
        // seed &+ 0xC7A7E125 &+ scale
        addSmall(style.seedHi, style.seedLo, 0xC7A7E125);
        addSmall(out.hi, out.lo, scale);
        const scaleHi = out.hi, scaleLo = out.lo;
        for (let dz = -1; dz <= 1; dz++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const cx = bx + dx, cy = by + dy, cz = bz + dz;
                    const key = ((scale * 256 + cx + 128) * 256 + cy + 128) * 256 + cz + 128;
                    let crater = cells.get(key);
                    if (crater === undefined) {
                        crater = craterIn(cx, cy, cz, scaleHi, scaleLo, cellSize, threshold);
                        cells.set(key, crater);
                    }
                    if (crater === null) continue;
                    const radius = crater[3];
                    const ox = px - crater[0], oy = py - crater[1], oz = pz - crater[2];
                    const distance = Math.sqrt(ox * ox + oy * oy + oz * oz);
                    const x = distance / radius;
                    if (!(radius >= minimumRadius) || !(x < 1.4) || !(distance > 1e-9)) continue;
                    const slope = x < 1 ? 2 * x : -2 * rimHeight * (1 - (x - 1) / 0.4) / 0.4;
                    const dot = (ox / distance) * lx + (oy / distance) * ly + (oz / distance) * lz;
                    shade -= strength * slope * dot;
                }
            }
        }
        cellSize *= 0.5;
    }
    return shade;
}

export function shaded(c, shade) {
    if (shade < 0) {
        const k = Math.max(1 + shade, 0);
        return [c[0] * k, c[1] * k, c[2] * k];
    }
    return mixColor(c, [1, 1, 1], shade * 0.8);
}

function gasGiantColor(style, px, py, pz, latitude, longitude, detail) {
    addSmall(style.seedHi, style.seedLo, 3);
    const warp = (fbm(px * 3, py * 3, pz * 3, out.hi, out.lo, 4) - 0.5) * 0.35;
    const phase = style.phase;
    const band = Math.sin((latitude + warp) * style.bands + phase);
    const t = 0.5 + 0.5 * (band >= 0 ? Math.pow(band, 0.6) : -Math.pow(-band, 0.6));
    let color = mixColor(style.base, style.accent, t);

    addSmall(style.seedHi, style.seedLo, 4);
    const streaks = fbm(px * 2, py * 22, pz * 2, out.hi, out.lo, 3);
    let k = 0.9 + 0.2 * streaks;
    color = [color[0] * k, color[1] * k, color[2] * k];
    k = 0.82 + 0.18 * Math.cos(latitude);
    color = [color[0] * k, color[1] * k, color[2] * k];

    if (style.stormColor) {
        let deltaLongitude = Math.abs(longitude - style.stormLongitude);
        deltaLongitude = Math.min(deltaLongitude, 2 * Math.PI - deltaLongitude);
        const distance = Math.sqrt(Math.pow(deltaLongitude * Math.cos(latitude) / 0.2, 2) +
            Math.pow((latitude - style.stormLatitude) / 0.08, 2));
        if (distance < 1.2) {
            const strength = Math.min(Math.max((1.2 - distance) / 0.4, 0), 1) * (0.85 + 0.15 * detail);
            color = mixColor(color, style.stormColor, strength);
        }
    }
    return color;
}

/** Surface colour at a point on the unit sphere; craters under `minimumCraterRadius` (radians) are left out */
export function color(style, px, py, pz, sea, detailOctaves) {
    const [latitude, longitude] = coordinate(px, py, pz);
    const elevationNoise = elevation(style, px, py, pz, detailOctaves);
    addSmall(style.seedHi, style.seedLo, 1);
    const detail = fbm(px * 9, py * 9, pz * 9, out.hi, out.lo, 3, detailOctaves);
    let c;

    switch (style.kind) {
        case 'gasGiant':
            c = gasGiantColor(style, px, py, pz, latitude, longitude, detail);
            break;
        case 'icy': {
            addSmall(style.seedHi, style.seedLo, 2);
            const ridge = 1 - Math.abs(2 * fbm(px * 4, py * 4, pz * 4, out.hi, out.lo, 4, detailOctaves) - 1);
            const crack = Math.pow(ridge, 14);
            const k = 0.85 + 0.25 * elevationNoise;
            const b = style.base;
            c = [b[0] * k - 0.05 * detail, b[1] * k - 0.05 * detail, b[2] * k - 0.02 * detail];
            c = mixColor(c, [0.55, 0.42, 0.32], crack * 0.8);
            c = mixColor(c, [b[0] * 0.55 + 0.06, b[1] * 0.55 + 0.04, b[2] * 0.55 + 0.02], mariaCover(px, py, pz, style) * 0.8);
            break;
        }
        default: {
            const b = style.base;
            if (style.waterFraction > 0 && elevationNoise < sea) {
                const depth = elevationNoise / Math.max(sea, 0.0001);
                c = mixColor([0.04, 0.12, 0.32], [0.12, 0.34, 0.58], depth * depth);
            } else {
                const elevation = (elevationNoise - sea) / Math.max(1 - sea, 0.0001);
                const k = 0.65 + 0.6 * elevation;
                const d = (detail - 0.5) * 0.18;
                c = [b[0] * k + d, b[1] * k + d, b[2] * k + d];
                if (style.vegetation) c = mixColor([0.18, 0.38, 0.16], c, Math.min(elevation * 1.6, 1));
                c = mixColor(c, [b[0] * 0.42 + 0.01, b[1] * 0.42 + 0.01, b[2] * 0.42 + 0.02], mariaCover(px, py, pz, style) * 0.85);
            }
            // Ice caps with ragged edges, or a locked world's night side, or the whole of a frozen world: sea ice over
            // the seas, snow over the land
            if (style.frozenOver || coldness(style, px, py, pz) > style.iceCapLatitude + (detail - 0.5) * 12) {
                const isSea = style.waterFraction > 0 && elevationNoise < sea;
                c = isSea ? seaIce(style, px, py, pz, detailOctaves) : snow;
            }
        }
    }
    return c;
}

/**
 * Sea ice over a frozen sea: bluish and uneven, thick floes pale, thinner ice greyer, dark leads cracking between
 * the floes and bright pressure ridges where they've pushed together
 */
export function seaIce(style, px, py, pz, detailOctaves) {
    const noise = (scale, salt, octaves) => {
        addSmall(style.seedHi, style.seedLo, salt);
        return fbm(px * scale, py * scale, pz * scale, out.hi, out.lo, octaves, detailOctaves);
    };
    const thickness = noise(3.5, 41, 4);
    let c = mixColor([0.55, 0.68, 0.79], [0.82, 0.9, 0.96], Math.min(Math.max((thickness - 0.3) / 0.45, 0), 1));
    const mottle = noise(24, 43, 3) - 0.5;
    c = [c[0] - 0.02 * mottle, c[1], c[2] + 0.02 * mottle];
    const crack = 1 - Math.abs(2 * noise(6, 45, 4) - 1);
    c = mixColor(c, [0.2, 0.31, 0.43], Math.pow(crack, 28) * 0.7);
    const ridge = 1 - Math.abs(2 * noise(11, 47, 3) - 1);
    c = mixColor(c, [0.95, 0.97, 1], Math.pow(ridge, 24) * 0.7);
    return c;
}

/**
 * A finished surface's colour at a point with its craters struck in: impacts land on whatever the surface has
 * become. Open water and sea ice keep none, so callers leave those alone. Craters smaller than `minimumRadius`
 * (radians) are left out.
 */
export function cratered(c, style, px, py, pz, minimumRadius) {
    if (!(style.craterDensity > 0) || style.kind === 'gasGiant') return c;
    // Ice slowly slumps, softening crater relief
    const softness = style.kind === 'icy' ? 0.6 : 1;
    return shaded(c, softness * craterShade(px, py, pz, style, minimumRadius));
}

/** Whether a point of a plain (not climate or polygon) surface is under water, which craters don't mark */
export function isUnderwater(style, px, py, pz, sea, detailOctaves) {
    return style.kind === 'rocky' && style.waterFraction > 0 && elevation(style, px, py, pz, detailOctaves) < sea;
}

/**
 * Point on the unit sphere for a latitude and longitude in radians. Longitude 0 is +x and runs east toward −z,
 * counterclockwise seen from above the north pole (+y), so a map read left to right runs east as on the globe.
 */
export function spherePoint(latitude, longitude) {
    return [Math.cos(latitude) * Math.cos(longitude), Math.sin(latitude), -Math.cos(latitude) * Math.sin(longitude)];
}

/** Latitude (−π/2…π/2) and longitude (0…2π) in radians of a point on the unit sphere, the inverse of spherePoint */
export function coordinate(px, py, pz) {
    const length = Math.max(Math.sqrt(px * px + py * py + pz * pz), Number.MIN_VALUE);
    let longitude = Math.atan2(-pz, px);
    if (longitude < 0) longitude += 2 * Math.PI;
    return [Math.asin(Math.min(Math.max(py / length, -1), 1)), longitude];
}

/** The longitude convention of flat images: maps saved before it ran east on the globe are drawn again */
export const mapOrientation = 2;

/**
 * How far a point is from the warmth, in degrees measured against `iceCapLatitude`: ice lies beyond it. On a turning
 * world that's its latitude; on a world locked to its star it grows with the angle from the point under the star.
 */
export function coldness(style, px, py, pz) {
    const substellar = style.substellarPoint;
    if (!substellar) return Math.abs(Math.asin(Math.min(Math.max(py, -1), 1))) * 180 / Math.PI;
    if (!(style.iceCapLatitude < 90)) return 0;
    const dot = px * substellar[0] + py * substellar[1] + pz * substellar[2];
    const fromStar = Math.acos(Math.min(Math.max(dot, -1), 1)) * 180 / Math.PI;
    const iceEdge = 40 + (style.iceCapLatitude - 50) * 70 / 36;
    return fromStar * style.iceCapLatitude / Math.max(iceEdge, 1);
}

const byte = (value) => Math.trunc(Math.min(Math.max(value, 0), 1) * 255);

/** RGBA pixels of an equirectangular map, coloured point by point (gas giants and moon templates) */
export function drawnPixels(style, w, h, detailOctaves, minimumCraterRadius = 0, icosphere, rowStart = 0, rowEnd = h) {
    style = prepared(style);
    const sea = seaLevel(style, icosphere);
    // Just the rows asked for, so an image can be drawn in bands by several workers at once
    const pixels = new Uint8Array(w * (rowEnd - rowStart) * 4).fill(255);
    for (let y = rowStart; y < rowEnd; y++) {
        const latitude = (0.5 - (y + 0.5) / h) * Math.PI;
        const cosLat = Math.cos(latitude), sinLat = Math.sin(latitude);
        for (let x = 0; x < w; x++) {
            const longitude = (x + 0.5) / w * 2 * Math.PI;
            const px = cosLat * Math.cos(longitude), py = sinLat, pz = -cosLat * Math.sin(longitude);
            let c = color(style, px, py, pz, sea, detailOctaves);
            // Then the craters, into the finished surface
            if (!isUnderwater(style, px, py, pz, sea, detailOctaves)) c = cratered(c, style, px, py, pz, minimumCraterRadius);
            const index = ((y - rowStart) * w + x) * 4;
            pixels[index] = byte(c[0]);
            pixels[index + 1] = byte(c[1]);
            pixels[index + 2] = byte(c[2]);
        }
    }
    return pixels;
}

/** A moon template's texture; craters under about a pixel and a half across are left out */
export function moonPixels(style, icosphere, rowStart = 0, rowEnd = height) {
    return drawnPixels(style, width, height, 0, moonCraterRadius, icosphere, rowStart, rowEnd);
}

/** Craters under about a pixel and a half across are left out of moon templates */
export const moonCraterRadius = 1.5 * Math.PI / width;

// MARK: clouds

/**
 * Clouds for terrestrial worlds with at least a hundredth of a bar of air. Nitrogen air clouds over more the more water
 * a world has; carbon dioxide, methane and sulfuric atmospheres are hazy decks tinted by what they're made of.
 */
export function cloudsFor(world) {
    // Minor planets are far too small to hold on to air
    if (world.type !== 'terrestrial' || world.gasGiant || !world.environment || world.minorPlanet) return undefined;
    const environment = world.environment;
    const seed = stableHash(world.designation) ^ 0xC10D5EED00000000n;
    const white = [0.97, 0.97, 0.98];
    const water = Math.min(Math.max(environment.waterPercent, 0), 100) / 10;
    const band = environmentTemperature(environment);
    const isWarm = band === 'temperate' || band === 'hot';
    const hurricanes = isWarm && water >= 5 && hasLiquidWater(environment)
        ? Number(stableHash(world.designation + '/storms') % 3n) : 0;
    const make = (coverage, color, opacity, circulation = 0, storms = 0) =>
        ({ seed, coverage, color, opacity, circulation, hurricanes: storms });
    const pressure = environment.pressureBar;
    // No clouds or weather without air enough to carry them: under 0.05 bar a world counts as airless, as its towns do
    // (cityGenerator.js isAirless)
    if (!(pressure >= 0.05) || environment.atmosphere === 'none' || environment.atmosphere === 'trace') return undefined;
    switch (environment.atmosphere) {
        case 'sulfuric': return make(0.97, [0.93, 0.84, 0.58], 0.97);
        case 'carbonDioxide':
            if (pressure > 10) return make(0.9, [0.9, 0.86, 0.72], 0.93, 0.4);
            break;
        case 'methane': return make(0.75, [0.86, 0.66, 0.4], 0.85, 0.3);
        case 'hydrogen': return make(0.9, [0.86, 0.9, 0.84], 0.9, 0.5);
        default: break;
    }
    if (pressure < 0.3) return make(0.08, white, 0.55, 0.3);
    if (pressure > 4) return make(0.85, white, 0.95, 0.6, hurricanes);
    return make(Math.min(0.2 + 0.05 * water, 0.75), white, 0.92, 0.5 + 0.05 * water, hurricanes);
}

export function cloudRecord(clouds) {
    return { seed: BigInt.asUintN(64, BigInt(clouds.seed)).toString(16).padStart(16, '0'), coverage: clouds.coverage,
        color: clouds.color.slice(), opacity: clouds.opacity, circulation: clouds.circulation ?? 0,
        hurricanes: clouds.hurricanes ?? 0, cloudVersion };
}

/** A world's weather: its storms, drawn once from the seed and shared by every pixel */
function cloudWeather(clouds) {
    let state = BigInt.asUintN(64, BigInt(clouds.seed) ^ 0x570F3DA1C92E44n);
    const next = () => {
        state = (state + 0x9E3779B97F4A7C15n) & MASK64;
        let z = state;
        z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & MASK64;
        z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & MASK64;
        return Number((z ^ (z >> 31n)) >> 11n) / 2 ** 53;
    };
    const axis = (latitudeDegrees) => spherePoint(latitudeDegrees * Math.PI / 180, next() * 2 * Math.PI);
    const vortices = [];
    const circulation = clouds.circulation ?? 0;
    const cyclones = Math.trunc(roundHalfAway(circulation * 6));
    for (let i = 0; i < cyclones; i++) {
        const hemisphere = next() < 0.5 ? -1 : 1;
        const a = axis(hemisphere * (38 + next() * 24));
        const radius = 0.2 + next() * 0.15;
        const twist = hemisphere * (2.5 + next() * 1.8);
        vortices.push({ axis: a, radius, twist, boost: 0.05 * circulation, eye: 0 });
    }
    for (let i = 0; i < (clouds.hurricanes ?? 0); i++) {
        const hemisphere = next() < 0.5 ? -1 : 1;
        const a = axis(hemisphere * (11 + next() * 12));
        const radius = 0.13 + next() * 0.06;
        const twist = hemisphere * (5 + next() * 2);
        const eye = 0.007 + next() * 0.005;
        vortices.push({ axis: a, radius, twist, boost: 0.32, eye });
    }
    return vortices;
}

function roundHalfAway(value) {
    return value < 0 ? -Math.round(-value) : Math.round(value);
}

/** A point turned about each storm's axis, the more the nearer the centre; and the cloud each piles up there */
function swirled(px, py, pz, vortices) {
    let x = px, y = py, z = pz;
    let boost = 0;
    for (const vortex of vortices) {
        const [kx, ky, kz] = vortex.axis;
        const distance = Math.acos(Math.min(Math.max(px * kx + py * ky + pz * kz, -1), 1));
        if (!(distance < vortex.radius)) continue;
        const nearness = 1 - distance / vortex.radius;
        const falloff = nearness * nearness;
        const angle = vortex.twist * falloff;
        const c = Math.cos(angle), s = Math.sin(angle);
        // Rodrigues' rotation about the storm's axis
        const cx = ky * z - kz * y, cy = kz * x - kx * z, cz = kx * y - ky * x;
        const dot = kx * x + ky * y + kz * z;
        const nx = x * c + cx * s + kx * dot * (1 - c);
        const ny = y * c + cy * s + ky * dot * (1 - c);
        const nz = z * c + cz * s + kz * dot * (1 - c);
        x = nx; y = ny; z = nz;
        boost += vortex.boost * Math.sqrt(nearness) * nearness;
        if (vortex.eye > 0 && distance < vortex.eye * 2.5) boost += distance < vortex.eye ? -1 : vortex.boost;
    }
    return [x, y, z, boost];
}

/** Extra cloud (or clear sky) by latitude in an Earth-like circulation */
function circulationBias(latitude) {
    const degrees = Math.abs(latitude) * 180 / Math.PI;
    const bump = (centre, w) => Math.exp(-Math.pow((degrees - centre) / w, 2));
    return 0.06 * bump(0, 7) - 0.07 * bump(25, 9) + 0.05 * bump(52, 12) + 0.02 * bump(80, 10);
}

const noiseOut = [0, 0, 0, 0];

/** Domain-warped noise wound into the storms; fills noiseOut with [value, warped x, y, z] */
function cloudNoise(clouds, vortices, px, py, pz) {
    const [sx, sy, sz, boost] = swirled(px, py, pz, vortices);
    const { seedHi, seedLo } = clouds;
    addSmall(seedHi, seedLo, 1);
    const wx = fbm(sx * 1.7, sy * 1.7, sz * 1.7, out.hi, out.lo, 3) - 0.5;
    addSmall(seedHi, seedLo, 2);
    const wy = fbm(sx * 1.7, sy * 1.7, sz * 1.7, out.hi, out.lo, 3) - 0.5;
    addSmall(seedHi, seedLo, 3);
    const wz = fbm(sx * 1.7, sy * 1.7, sz * 1.7, out.hi, out.lo, 3) - 0.5;
    const ex = sx + wx * 0.9, ey = sy + wy * 0.9, ez = sz + wz * 0.9;
    const value = fbm(ex * 2.2, ey * 4, ez * 2.2, seedHi, seedLo, 6);
    const latitude = Math.asin(Math.min(Math.max(py, -1), 1));
    noiseOut[0] = value + (clouds.circulation ?? 0) * circulationBias(latitude) + boost;
    noiseOut[1] = ex; noiseOut[2] = ey; noiseOut[3] = ez;
    return noiseOut;
}

/** 0 (clear) to 1 (thickest), with frayed edges and billows */
function cloudDensity(clouds, vortices, px, py, pz, threshold) {
    const [noise, ex, ey, ez] = cloudNoise(clouds, vortices, px, py, pz);
    addSmall(clouds.seedHi, clouds.seedLo, 11);
    const fray = fbm(ex * 26, ey * 26, ez * 26, out.hi, out.lo, 4) - 0.5;
    const t = Math.min(Math.max((noise - threshold + 0.09 * fray) / 0.09, 0), 1);
    const edge = t * t * (3 - 2 * t);
    if (!(edge > 0)) return 0;
    addSmall(clouds.seedHi, clouds.seedLo, 17);
    const billow = 1 - Math.abs(2 * fbm(ex * 13, ey * 13, ez * 13, out.hi, out.lo, 3) - 1);
    const body = Math.min(Math.max(0.8 + 0.6 * (noise - 0.5), 0), 1);
    return edge * body * (0.9 + 0.1 * billow);
}

/** RGBA pixels of a cloud map: the cloud colour throughout, alpha giving how thick the cloud is */
export function cloudPixels(cloudStyle, icosphere, w = cloudWidth, h = cloudHeight, progress, rowStart = 0, rowEnd = h) {
    const [seedHi, seedLo] = split(cloudStyle.seed);
    const clouds = { ...cloudStyle, seedHi, seedLo };
    const vortices = cloudWeather(cloudStyle);
    const vertices = icosphere(4).vertices;
    const count = vertices.length / 3;
    const values = new Float64Array(count);
    for (let i = 0; i < count; i++) {
        values[i] = cloudNoise(clouds, vortices, vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2])[0];
    }
    values.sort();
    const threshold = values[Math.min(Math.max(Math.trunc((1 - clouds.coverage) * count), 0), count - 1)];
    const r = Math.trunc(Math.min(Math.max(clouds.color[0], 0), 1) * 255);
    const g = Math.trunc(Math.min(Math.max(clouds.color[1], 0), 1) * 255);
    const b = Math.trunc(Math.min(Math.max(clouds.color[2], 0), 1) * 255);
    // Just the rows asked for, so a map can be drawn in bands by several workers at once
    const pixels = new Uint8Array(w * (rowEnd - rowStart) * 4);
    for (let y = rowStart; y < rowEnd; y++) {
        const latitude = (0.5 - (y + 0.5) / h) * Math.PI;
        const cosLat = Math.cos(latitude), sinLat = Math.sin(latitude);
        for (let x = 0; x < w; x++) {
            const longitude = (x + 0.5) / w * 2 * Math.PI;
            const density = cloudDensity(clouds, vortices, cosLat * Math.cos(longitude), sinLat, -cosLat * Math.sin(longitude),
                threshold);
            const index = ((y - rowStart) * w + x) * 4;
            pixels[index] = r;
            pixels[index + 1] = g;
            pixels[index + 2] = b;
            pixels[index + 3] = byte(density * clouds.opacity);
        }
        if (progress && (y & 31) === 0) progress((y - rowStart) / (rowEnd - rowStart));
    }
    return pixels;
}

/** How bright each pixel of a cloud map's cloud is (grey, 0…255): thick tops brightest, thin veils dimmer */
export function cloudShadeValue(alpha) {
    return Math.trunc((0.8 + 0.2 * Math.pow(alpha / 255, 0.6)) * 255);
}

export { TWO_PI };
