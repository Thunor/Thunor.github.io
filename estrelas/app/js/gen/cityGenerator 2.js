//
//  cityGenerator.js
//  Estrelas (web)
//
//  Lays out a city, town or village marked on a surface map: a street grid that's warped and organic in early eras
//  and regular in later ones, avenues, a river with bridges and parkland, a central square with a monument and
//  a landmark beside it, parks, small squares, and blocks divided into lots whose buildings rise toward the centre
//  and with the world's technological era. Drawn from a seed taken from the place, so a place always gets the same city.
//  Distances are in metres, x east and y north. A port of CityGenerator.swift; its random draws come in the same
//  order, so a place gets the same city in both apps.
//

import { eraRank } from './socialGenerator.js';
import { environmentTemperature } from '../model/planetarySystem.js';
import { plainSite, climateArchitecture } from './citySite.js';
import { CityTerrain, CityShoreline } from './cityTerrain.js';
import { filledCityStyle } from '../model/savedData.js';

const MASK64 = (1n << 64n) - 1n;
const f = Math.fround;

export const settlementKinds = new Set(['capital', 'city', 'town', 'village']);

/** Whether a world has no air to breathe or hold a pressure: its settlements live under glass */
export function isAirless(environment) {
    if (!environment) return false;
    return environment.atmosphere === 'none' || environment.atmosphere === 'trace' || (environment.pressureBar ?? 1) < 0.05;
}

/** The broad look of a city's buildings and streets, from the world's technological era */
export function cityEra(era) {
    const rank = eraRank(era);
    if (rank <= eraRank('earlyModern')) return 'preindustrial';
    if (era === 'industrial' || era === 'electrical') return 'industrial';
    if (era === 'interstellar') return 'advanced';
    return 'modern';
}

export const eraNames = { preindustrial: 'Pre-industrial', industrial: 'Industrial', modern: 'Modern', advanced: 'Advanced' };

export function defaultPopulation(kind) {
    switch (kind) {
        case 'capital': return 800000;
        case 'city': return 150000;
        case 'town': return 12000;
        default: return 600;
    }
}

function stableHash(text) {
    let hash = 0xCBF29CE484222325n;
    for (const byte of new TextEncoder().encode(text)) hash = ((hash ^ BigInt(byte)) * 0x100000001B3n) & MASK64;
    return hash;
}

/**
 * What a city is generated from, for a place on a world: in `site` (citySite.js) if its setting has been read, in the
 * place's own style over `worldStyle` (CityStyle: values left out are chosen automatically)
 */
export function cityParameters(place, world, site = null, worldStyle = null) {
    let population = place.population ?? defaultPopulation(place.kind);
    const total = world.social?.population;
    if (total > 0) population = Math.min(population, total);
    return {
        kind: place.kind, population, era: world.social?.techEra ?? 'information',
        waterPercent: world.environment?.waterPercent ?? 0,
        temperature: world.environment ? environmentTemperature(world.environment) : 'temperate',
        seed: stableHash(`${world.designation}/${place.id}`), airless: isAirless(world.environment),
        site: site ?? plainSite, siteIsKnown: !!site, style: filledCityStyle(place.cityStyle, worldStyle),
    };
}

// MARK: resolved style

/** The architecture: as chosen, or as the climate calls for */
export function resolvedArchitecture(parameters) {
    return parameters.style?.architecture ?? climateArchitecture(parameters.site ?? plainSite);
}

/**
 * How much the architecture shows, 0 to 1: fully in traditional building, less as industry brings the same materials
 * and methods everywhere, and little once technology lets anything be built anywhere. An architecture chosen by hand
 * shows strongly whatever the era.
 */
export function climateWeight(parameters) {
    const era = parameters.era;
    let weight;
    if (eraRank(era) <= eraRank('earlyModern')) weight = 1;
    else weight = { industrial: 0.85, electrical: 0.7, atomic: 0.5, information: 0.5, interplanetary: 0.3 }[era] ?? 0.15;
    return parameters.style?.architecture == null ? weight : Math.max(weight, 0.75);
}

/**
 * The street layout: as chosen, or as the era, the ground and the kind of place suit. Old towns and villages grow
 * organically, as do towns on steep ground until they can reshape it; industrial towns are gridded; modern capitals
 * are sometimes laid out on a grand plan, and some cities radially.
 */
export function resolvedStreetLayout(parameters) {
    if (parameters.style?.layout) return parameters.style.layout;
    const era = cityEra(parameters.era);
    const seed = BigInt(parameters.seed);
    const site = parameters.site ?? plainSite;
    if (parameters.kind === 'village' && era !== 'advanced') return 'organic';
    if (site.hilliness > 0.45 && eraRank(parameters.era) < eraRank('interplanetary')) return 'organic';
    switch (era) {
        case 'preindustrial': return 'organic';
        case 'industrial': return 'grid';
        case 'modern': return parameters.kind === 'capital' && seed % 3n === 0n ? 'grand' : (seed % 5n === 0n ? 'radial' : 'grid');
        default: return parameters.kind === 'capital' ? 'grand' : (seed % 3n === 0n ? 'radial' : 'grid');
    }
}

/**
 * How alike the buildings are: as chosen, or by era. Traditional builders use the same local materials and forms,
 * so old towns are of a piece; industrial and modern cities mix more; planned future cities are of a piece again.
 */
export function resolvedHarmony(parameters) {
    if (parameters.style?.harmony) return parameters.style.harmony;
    const seed = BigInt(parameters.seed);
    switch (cityEra(parameters.era)) {
        case 'preindustrial': return 'uniform';
        case 'industrial': return 'balanced';
        case 'modern': return seed % 5n === 0n ? 'eclectic' : 'balanced';
        default: return seed % 2n === 0n ? 'uniform' : 'balanced';
    }
}

// MARK: randomness

/** SplitMix64 */
class CityRandom {
    constructor(seed) {
        this.state = BigInt.asUintN(64, BigInt(seed));
    }

    next() {
        this.state = (this.state + 0x9E3779B97F4A7C15n) & MASK64;
        let z = this.state;
        z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & MASK64;
        z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & MASK64;
        return z ^ (z >> 31n);
    }

    /** Float in lower..<upper, in single precision as the Mac draws it */
    float(lower, upper) {
        const x = f(Number(this.next() >> 40n));
        return f(f(lower) + f(f(f(f(upper) - f(lower)) * x) / 16777216));
    }

    below(bound) {
        return Number(this.next() % BigInt(bound));
    }
}

/** Smooth 2D value noise, roughly −0.5…0.5 */
class ValueNoise {
    constructor(seed) {
        this.seed = BigInt.asUintN(64, BigInt(seed));
    }

    hash(x, y, channel = 0) {
        let h = this.seed ^ ((BigInt(channel) * 0xD6E8FEB86659FD93n) & MASK64);
        h ^= (BigInt.asUintN(64, BigInt(x)) * 0x9E3779B97F4A7C15n) & MASK64;
        h ^= (BigInt.asUintN(64, BigInt(y)) * 0xC2B2AE3D27D4EB4Fn) & MASK64;
        h = ((h ^ (h >> 30n)) * 0xBF58476D1CE4E5B9n) & MASK64;
        h = ((h ^ (h >> 27n)) * 0x94D049BB133111EBn) & MASK64;
        h ^= h >> 31n;
        return f(Number(h >> 40n) / 16777216);
    }

    at(px, py) {
        const cx = Math.floor(px), cy = Math.floor(py);
        const fx = px - cx, fy = py - cy;
        const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
        const h00 = this.hash(cx, cy), h10 = this.hash(cx + 1, cy), h01 = this.hash(cx, cy + 1), h11 = this.hash(cx + 1, cy + 1);
        const bottom = h00 + (h10 - h00) * sx;
        const top = h01 + (h11 - h01) * sx;
        return bottom + (top - bottom) * sy - 0.5;
    }
}

// MARK: geometry

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const scale = (a, k) => [a[0] * k, a[1] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const length = (a) => Math.hypot(a[0], a[1]);
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const normalize = (a) => scale(a, 1 / length(a));
const average = (points) => scale(points.reduce(add, [0, 0]), 1 / points.length);

export const Geometry = {
    distanceToSegment(p, a, b) {
        const ab = sub(b, a);
        const lengthSquared = dot(ab, ab);
        if (!(lengthSquared > 0)) return distance(p, a);
        const t = Math.min(Math.max(dot(sub(p, a), ab) / lengthSquared, 0), 1);
        return distance(p, add(a, scale(ab, t)));
    },

    segmentDistance(a, b, c, d) {
        const side = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
        if (side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0) return 0;
        return Math.min(Geometry.distanceToSegment(a, c, d), Geometry.distanceToSegment(b, c, d),
            Geometry.distanceToSegment(c, a, b), Geometry.distanceToSegment(d, a, b));
    },

    polygonToPolyline(polygon, line) {
        if (line.length < 2) return Infinity;
        if (line.some((p) => Geometry.contains(polygon, p))) return 0;
        let best = Infinity;
        for (let k = 0; k < line.length - 1; k++) {
            for (let e = 0; e < polygon.length; e++) {
                best = Math.min(best, Geometry.segmentDistance(line[k], line[k + 1], polygon[e], polygon[(e + 1) % polygon.length]));
                if (best === 0) return 0;
            }
        }
        return best;
    },

    area(polygon) {
        let sum = 0;
        for (let k = 0; k < polygon.length; k++) {
            const a = polygon[k], b = polygon[(k + 1) % polygon.length];
            sum += a[0] * b[1] - b[0] * a[1];
        }
        return sum / 2;
    },

    contains(polygon, p, margin = 0) {
        for (let k = 0; k < polygon.length; k++) {
            const a = polygon[k], b = polygon[(k + 1) % polygon.length];
            const edge = normalize(sub(b, a));
            const to = sub(p, a);
            if (edge[0] * to[1] - edge[1] * to[0] < margin) return false;
        }
        return true;
    },

    inset(polygon, distances) {
        const count = polygon.length;
        if (count < 3 || distances.length !== count || !(Geometry.area(polygon) > 0)) return null;
        const lines = [];
        for (let k = 0; k < count; k++) {
            const a = polygon[k], b = polygon[(k + 1) % count];
            const len = distance(a, b);
            if (!(len > 0.01)) return null;
            const direction = scale(sub(b, a), 1 / len);
            const inward = [-direction[1], direction[0]];
            lines.push({ point: add(a, scale(inward, distances[k])), direction });
        }
        const result = [];
        for (let k = 0; k < count; k++) {
            const previous = lines[(k + count - 1) % count], current = lines[k];
            const denominator = previous.direction[0] * current.direction[1] - previous.direction[1] * current.direction[0];
            if (Math.abs(denominator) < 1e-4) {
                result.push(current.point);
            } else {
                const offset = sub(current.point, previous.point);
                const t = (offset[0] * current.direction[1] - offset[1] * current.direction[0]) / denominator;
                result.push(add(previous.point, scale(previous.direction, t)));
            }
        }
        if (!(Geometry.area(result) > 0.5)) return null;
        for (let k = 0; k < count; k++) {
            if (dot(sub(result[(k + 1) % count], result[k]), lines[k].direction) <= 0) return null;
        }
        return result;
    },
};

// MARK: palette

const surface = (color, metallic = 0, roughness = 0.85) => ({ color, metallic, roughness });

export const CityPalette = {
    walls: {
        preindustrial: [surface([0.92, 0.89, 0.82]), surface([0.82, 0.66, 0.42]), surface([0.78, 0.70, 0.56]),
            surface([0.55, 0.42, 0.30]), surface([0.62, 0.60, 0.56])],
        industrial: [surface([0.62, 0.30, 0.22]), surface([0.45, 0.24, 0.19]), surface([0.68, 0.66, 0.60]),
            surface([0.86, 0.82, 0.70]), surface([0.45, 0.45, 0.45])],
        modern: [surface([0.72, 0.72, 0.70]), surface([0.90, 0.90, 0.88]), surface([0.35, 0.50, 0.62], 0.6, 0.25),
            surface([0.80, 0.74, 0.62]), surface([0.55, 0.58, 0.62], 0.4, 0.4)],
        advanced: [surface([0.94, 0.95, 0.96], 0, 0.5), surface([0.55, 0.75, 0.82], 0.7, 0.15),
            surface([0.75, 0.77, 0.80], 0.8, 0.3), surface([0.62, 0.82, 0.78]), surface([0.92, 0.88, 0.82], 0, 0.6)],
    },
    roofs: {
        preindustrial: [surface([0.70, 0.33, 0.22]), surface([0.33, 0.35, 0.38]), surface([0.66, 0.56, 0.34])],
        industrial: [surface([0.33, 0.35, 0.38]), surface([0.25, 0.25, 0.27]), surface([0.38, 0.60, 0.52], 0.3)],
        modern: [surface([0.40, 0.40, 0.42]), surface([0.25, 0.26, 0.28]), surface([0.70, 0.33, 0.22])],
        advanced: [surface([0.94, 0.95, 0.96]), surface([0.70, 0.72, 0.74]), surface([0.12, 0.16, 0.28], 0.5, 0.2)],
    },
    glass(era) {
        if (era === 'advanced') {
            return [surface([0.62, 0.80, 0.88], 0.8, 0.1), surface([0.82, 0.86, 0.90], 0.9, 0.12),
                surface([0.40, 0.62, 0.70], 0.8, 0.1)];
        }
        return [surface([0.30, 0.45, 0.58], 0.7, 0.18), surface([0.22, 0.30, 0.36], 0.75, 0.15),
            surface([0.48, 0.58, 0.55], 0.6, 0.2), surface([0.55, 0.47, 0.36], 0.7, 0.2)];
    },
    counts(era) {
        return { walls: this.walls[era].length, roofs: this.roofs[era].length, glass: this.glass(era).length };
    },
    /**
     * The era's walls, with the climate's own in place of as many of them as `weight` (0…1) gives it: all of them in
     * a traditional town, a few in a modern city. Temperate architecture is the era's own.
     */
    blendedWalls(era, architecture, weight) {
        return blend(this.walls[era], vernacularWalls[architecture] ?? [], weight);
    },
    blendedRoofs(era, architecture, weight) {
        return blend(this.roofs[era], vernacularRoofs[architecture] ?? [], weight);
    },
};

function blend(era, local, weight) {
    if (!local.length) return era;
    const count = Math.round(era.length * Math.min(Math.max(weight, 0), 1));
    return era.map((surface, index) => (index < count ? local[index % local.length] : surface));
}

/**
 * Walls built of what the climate offers: mud brick, sandstone and whitewash where it's dry; timber, dark stone and
 * red-painted boards where it's cold; pale plaster and pastel paint where it's hot and wet
 */
const vernacularWalls = {
    arid: [surface([0.90, 0.84, 0.70]), surface([0.95, 0.93, 0.88]), surface([0.80, 0.64, 0.45]),
        surface([0.72, 0.56, 0.40]), surface([0.86, 0.76, 0.60])],
    cold: [surface([0.36, 0.26, 0.18]), surface([0.66, 0.24, 0.18]), surface([0.58, 0.56, 0.52]),
        surface([0.48, 0.36, 0.25]), surface([0.84, 0.80, 0.72])],
    tropical: [surface([0.96, 0.89, 0.70]), surface([0.98, 0.97, 0.94]), surface([0.78, 0.90, 0.85]),
        surface([0.96, 0.80, 0.72]), surface([0.72, 0.83, 0.92])],
};

/** Roofs to match: flat roofs of packed earth and plaster where it's dry, slate and dark shingle where it's cold, terracotta and thatch where it's hot and wet */
const vernacularRoofs = {
    arid: [surface([0.84, 0.76, 0.62]), surface([0.90, 0.87, 0.80]), surface([0.28, 0.46, 0.62])],
    cold: [surface([0.22, 0.24, 0.27]), surface([0.30, 0.30, 0.31]), surface([0.20, 0.17, 0.15])],
    tropical: [surface([0.72, 0.34, 0.22]), surface([0.64, 0.54, 0.36]), surface([0.46, 0.32, 0.22])],
};

// MARK: generation

// `sea` is the open water along a shore; `riverbank` is any bank or waterfront; `wild` is ground too steep to build on,
// left wooded
const Cell = { outside: 0, water: 1, riverbank: 2, plaza: 3, park: 4, square: 5, landmark: 6, built: 7, sea: 8, wild: 9 };

export function generateCity(parameters) {
    const random = new CityRandom(parameters.seed);
    const noise = new ValueNoise(BigInt.asUintN(64, BigInt(parameters.seed) ^ 0x5DEECE66D1CE4E5Bn));
    const noiseAt = (p) => noise.at(p[0], p[1]);
    const era = cityEra(parameters.era);
    const kind = parameters.kind;
    const isVillage = kind === 'village';
    const site = parameters.site ?? plainSite;
    const architecture = resolvedArchitecture(parameters);
    const weight = climateWeight(parameters);
    const streetLayout = resolvedStreetLayout(parameters);
    const harmony = resolvedHarmony(parameters);
    // How strongly each climate shows in the streets and buildings, 0 to 1
    const arid = architecture === 'arid' ? weight : 0;
    const cold = architecture === 'cold' ? weight : 0;
    const tropical = architecture === 'tropical' ? weight : 0;

    const density = isVillage ? 1500 : (era === 'preindustrial' ? 12000 : 7000);
    const area = Math.max(parameters.population, 20) / density;
    const radius = Math.min(Math.max(Math.sqrt(area / Math.PI) * 1000, 110), isVillage ? 420 : 2200);
    const eraScale = { preindustrial: 1, industrial: 1.05, modern: 1.15, advanced: 1.25 }[era];
    const baseBlockSize = { capital: 96, city: 86, town: 64 }[kind] ?? 44;
    // Hot, dry towns pack close together along narrow, shaded lanes; tropical ones spread out among their gardens
    const blockSize = eraScale * baseBlockSize * (1 - 0.22 * arid) * (1 + 0.12 * tropical);
    const streetWidth = (isVillage || era === 'preindustrial' ? 5 : (era === 'advanced' ? 10 : 8)) * (1 - 0.3 * arid);
    const avenueWidth = isVillage ? streetWidth : (era === 'preindustrial' ? 9 : (era === 'advanced' ? 22 : 16));
    const arterialEvery = 4;
    const eraOrganic = { preindustrial: 0.42, industrial: 0.25, modern: 0.1, advanced: 0.06 }[era];
    // How far the street grid wanders from straight: freely when it grows organically, more in hill country
    const organic = { organic: Math.max(eraOrganic, 0.4) + 0.15 * site.hilliness, grid: 0.05, radial: 0.04, grand: 0.02 }[streetLayout];
    const sidewalk = era === 'preindustrial' ? 1 : 2.5;
    // The streets line up with the land: square to the waterfront, along the contours in hill country, or with the river
    let gridAngle = random.float(0, f(Math.PI / 2));
    if (site.shore) gridAngle = Math.atan2(site.shore.bearing[1], site.shore.bearing[0]);
    else if (parameters.siteIsKnown && site.hilliness > 0.3) gridAngle = Math.atan2(site.downhill[1], site.downhill[0]);
    else if (site.river) gridAngle = Math.atan2(site.river.direction[1], site.river.direction[0]);

    const layout = {
        era, temperature: parameters.temperature, radius, terrain: CityTerrain.level(radius), water: null, architecture,
        climateWeight: weight, streetLayout, harmony, piers: [], roads: [], bridges: [], river: null, blocks: [], plazas: [],
        greens: [], gardens: [], ponds: [], buildings: [], landmark: null, trees: [], monuments: [], parkCount: 0,
    };

    // Street grid nodes, warped for an organic layout
    const n = Math.trunc(Math.ceil(radius * 1.15 / blockSize)) + 1;
    const side = 2 * n + 1;
    const cosA = Math.cos(gridAngle), sinA = Math.sin(gridAngle);
    const nodes = new Array(side * side);
    for (let j = -n; j <= n; j++) {
        for (let i = -n; i <= n; i++) {
            const bx = i * blockSize, by = j * blockSize;
            // simd_float2x2 with columns (cos, sin) and (-sin, cos)
            let base = [cosA * bx - sinA * by, sinA * bx + cosA * by];
            if (streetLayout === 'radial' && (i !== 0 || j !== 0)) {
                // The grid's square rings drawn round into circles, crossed by its middle lines as spokes
                base = scale(normalize(base), Math.max(Math.abs(i), Math.abs(j)) * blockSize);
            }
            const p = scale(base, 1 / (blockSize * 4));
            const warp = scale([noiseAt(p), noiseAt(add(p, [37.1, 37.1]))], 2 * organic * blockSize);
            const jitter = scale([noise.hash(i, j, 1) - 0.5, noise.hash(i, j, 2) - 0.5], 0.25 * organic * blockSize);
            nodes[(j + n) * side + (i + n)] = add(add(base, warp), jitter);
        }
    }
    const node = (i, j) => nodes[(j + n) * side + (i + n)];
    const extent = (p) => {
        const len = length(p);
        if (!(len > 1)) return radius;
        return radius * (0.85 + 0.5 * noiseAt(add(scale(p, 1.6 / len), [5.3, 5.3])));
    };
    const centrality = (p) => Math.min(Math.max(1 - length(p) / extent(p), 0), 1);

    // River
    const riverChance = parameters.waterPercent === 0 ? 0 : Math.min(f(f(0.25) + f(f(parameters.waterPercent) * f(0.006))), f(0.8));
    // The river the globe shows running past, flowing toward the water if there's a shore; on a world with no globe
    // to read, one rolled from how much water it has
    const rolled = random.float(0, 1) < riverChance;
    if (parameters.siteIsKnown ? !!site.river : rolled) {
        const baseWidth = { capital: 60, city: 40, town: 22 }[kind] ?? 10;
        const size = site.river?.size ?? 0.5;
        const width = random.float(0.85, 1.15) * baseWidth * (0.6 + 0.9 * size);
        let heading = random.float(0, f(Math.PI));
        if (site.river) {
            let flow = site.river.direction;
            if (site.shore && dot(flow, site.shore.bearing) < 0) flow = [-flow[0], -flow[1]];
            heading = Math.atan2(flow[1], flow[0]);
        }
        const direction = [Math.cos(heading), Math.sin(heading)];
        const normal = [-direction[1], direction[0]];
        const offset = random.float(-0.2, 0.2) * radius;
        const phase = random.float(0, f(2 * Math.PI));
        const points = [];
        for (let k = 0; k <= 96; k++) {
            const t = (-1.6 + 3.2 * k / 96) * radius;
            const lateral = offset + 0.18 * radius * Math.sin(t / radius * 2.3 + phase) +
                0.25 * radius * noiseAt([t / radius * 1.5, 91.7]);
            points.push(add(scale(direction, t), scale(normal, lateral)));
        }
        const hasQuays = !isVillage && era !== 'preindustrial';
        const narrowest = hasQuays ? 0.82 : 0.6;
        const count = points.length - 1;
        const bank = (sign, channel) => {
            const water = [], shore = [];
            for (let k = 0; k < points.length; k++) {
                const before = points[Math.max(k - 1, 0)], after = points[Math.min(k + 1, points.length - 1)];
                const along = normalize(sub(after, before));
                const sideVector = scale([-along[1], along[0]], sign);
                const s = k / count;
                const sweep = noiseAt([s * 9, channel]) + 0.5;
                const wiggle = noiseAt([s * 37, channel + 17.3]) + 0.5;
                const reach = width / 2 * (narrowest + (1 - narrowest) * (0.7 * sweep + 0.3 * wiggle));
                const shoreWidth = hasQuays ? 1.6 : 1.5 + 3.5 * (noiseAt([s * 23, channel + 41.9]) + 0.5);
                water.push(add(points[k], scale(sideVector, reach)));
                shore.push(add(points[k], scale(sideVector, reach + shoreWidth)));
            }
            return { water, shore };
        };
        const left = bank(1, 211.7), right = bank(-1, 307.1);
        layout.river = { points, width, left: left.water, right: right.water, shoreLeft: left.shore,
            shoreRight: right.shore, hasQuays };
    }
    // The ground, with the sea or lake along the shore the globe shows
    let shoreline = null;
    if (site.shore) {
        shoreline = new CityShoreline(site.shore.bearing, radius * random.float(0.35, 0.8), radius * 0.12,
            new ValueNoise(BigInt.asUintN(64, BigInt(parameters.seed) ^ 0x5408E11En)));
        layout.water = site.shore.kind;
    }
    const terrain = CityTerrain.make({ radius, hilliness: site.hilliness, downhill: site.downhill, shoreline,
        river: layout.river ? { points: layout.river.points, halfWidth: layout.river.width / 2 } : null,
        noise: new ValueNoise(BigInt.asUintN(64, BigInt(parameters.seed) ^ 0x7E44A1F00D5E3A11n)) });
    layout.terrain = terrain;
    // Too steep to build streets on: left wooded, though later builders can cut terraces into steeper ground
    const steepest = { preindustrial: 0.25, industrial: 0.2, modern: 0.25, advanced: 0.35 }[era];

    const river = layout.river;
    const riverDistance = (p) => {
        if (!river) return Infinity;
        let best = Infinity;
        for (let k = 0; k < river.points.length - 1; k++) {
            best = Math.min(best, Geometry.distanceToSegment(p, river.points[k], river.points[k + 1]));
        }
        return best;
    };
    const riverHalfWidth = (river?.width ?? 0) / 2;

    // Cells
    const cellSide = 2 * n;
    const cells = new Uint8Array(cellSide * cellSide);
    const group = new Int32Array(cellSide * cellSide).fill(-1);
    const cellIndex = (i, j) => (i >= -n && i < n && j >= -n && j < n ? (j + n) * cellSide + (i + n) : null);
    const corners = (i, j) => [node(i, j), node(i + 1, j), node(i + 1, j + 1), node(i, j + 1)];
    const centre = (i, j) => average(corners(i, j));

    for (let j = -n; j < n; j++) {
        for (let i = -n; i < n; i++) {
            const c = centre(i, j);
            const index = cellIndex(i, j);
            if (!(length(c) < extent(c)) || index === null) continue;
            const nearest = river ? Geometry.polygonToPolyline(corners(i, j), river.points) : Infinity;
            if (terrain.isOpenWater(c)) cells[index] = Cell.sea;
            else if (riverDistance(c) < riverHalfWidth) cells[index] = Cell.water;
            // The riverbank, or the waterfront along the shore
            else if (nearest < riverHalfWidth + 6 || corners(i, j).some((p) => terrain.isOpenWater(p))) cells[index] = Cell.riverbank;
            else if (terrain.slope(c) > steepest) cells[index] = Cell.wild;
            else cells[index] = Cell.built;
        }
    }

    // Central square, with its landmark beside it
    let centreCell = [0, 0];
    let bestDistance = Infinity;
    for (let j = -n; j < n; j++) {
        for (let i = -n; i < n; i++) {
            const index = cellIndex(i, j);
            if (index === null || cells[index] !== Cell.built) continue;
            const d = length(centre(i, j));
            if (d < bestDistance) {
                bestDistance = d;
                centreCell = [i, j];
            }
        }
    }
    const plazaOffsets = kind === 'capital' ? [[0, 0], [1, 0], [0, 1], [1, 1]] : kind === 'city' ? [[0, 0], [1, 0]] : [[0, 0]];
    const plazaCells = [];
    for (const [di, dj] of plazaOffsets) {
        const i = centreCell[0] + di, j = centreCell[1] + dj;
        const index = cellIndex(i, j);
        if (index === null || cells[index] !== Cell.built) continue;
        cells[index] = isVillage ? Cell.park : Cell.plaza;
        group[index] = 0;
        plazaCells.push([i, j]);
    }
    let landmarkCell = null;
    for (const [di, dj] of [[0, -1], [-1, 0], [0, 2], [2, 0], [0, 1], [1, 0]]) {
        const i = centreCell[0] + di, j = centreCell[1] + dj;
        const index = cellIndex(i, j);
        if (index !== null && cells[index] === Cell.built) {
            cells[index] = Cell.landmark;
            landmarkCell = [i, j];
            break;
        }
    }

    // Parks and small squares
    let nextGroup = 1;
    if (kind === 'city' || kind === 'capital') {
        const heading = random.float(0, f(2 * Math.PI));
        const target = scale([Math.cos(heading), Math.sin(heading)], radius * 0.45);
        let parkCell = null;
        let nearest = Infinity;
        for (let j = -n; j < n - 1; j++) {
            for (let i = -n; i < n - 1; i++) {
                const d = distance(centre(i, j), target);
                const all = [[0, 0], [1, 0], [0, 1], [1, 1]].every(([di, dj]) => {
                    const index = cellIndex(i + di, j + dj);
                    return index !== null && cells[index] === Cell.built;
                });
                if (all && d < nearest) {
                    nearest = d;
                    parkCell = [i, j];
                }
            }
        }
        if (parkCell) {
            for (const [di, dj] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
                const index = cellIndex(parkCell[0] + di, parkCell[1] + dj);
                if (index !== null) {
                    cells[index] = Cell.park;
                    group[index] = nextGroup;
                }
            }
            nextGroup += 1;
        }
    }
    for (let j = -n; j < n; j++) {
        for (let i = -n; i < n; i++) {
            const index = cellIndex(i, j);
            if (index === null || cells[index] !== Cell.built) continue;
            const c = centre(i, j);
            const parkNoise = noiseAt(add(scale(c, 1 / (blockSize * 3.5)), [71.3, 71.3]));
            // Fewer parks where water is scarce
            if (!isVillage && (parkNoise > 0.26 + 0.14 * arid || random.float(0, 1) < 0.03 * (1 - arid))) {
                cells[index] = Cell.park;
            } else if (!isVillage && centrality(c) > 0.3 && random.float(0, 1) < 0.025) {
                cells[index] = Cell.square;
            }
        }
    }

    // Streets, avenues and bridges
    const edgeWidths = new Map();
    const edgeKey = (horizontal, i, j) => `${horizontal ? 'h' : 'v'}${i},${j}`;
    const isCity = (i, j) => {
        const index = cellIndex(i, j);
        return index !== null && cells[index] !== Cell.outside && cells[index] !== Cell.water && cells[index] !== Cell.sea &&
            cells[index] !== Cell.wild;
    };
    const sameGroup = (a, b) => {
        const ia = cellIndex(a[0], a[1]), ib = cellIndex(b[0], b[1]);
        return ia !== null && ib !== null && group[ia] >= 0 && group[ia] === group[ib];
    };
    for (const horizontal of [true, false]) {
        for (let j = -n; j <= n; j++) {
            for (let i = -n; i <= n; i++) {
                if (horizontal && i === n) continue;
                if (!horizontal && j === n) continue;
                const sideA = horizontal ? [i, j - 1] : [i - 1, j];
                const sideB = [i, j];
                if (!(isCity(sideA[0], sideA[1]) || isCity(sideB[0], sideB[1])) || sameGroup(sideA, sideB)) continue;
                const a = node(i, j);
                const b = horizontal ? node(i + 1, j) : node(i, j + 1);
                // No streets out over the sea
                if (terrain.isOpenWater(a) || terrain.isOpenWater(b)) continue;
                const line = horizontal ? j : i;
                let isAvenue = !isVillage && line % arterialEvery === 0;
                if (streetLayout === 'radial' && !isVillage) {
                    // Avenues round every third ring, and out along the spokes through the centre
                    const ringA = Math.max(Math.abs(i), Math.abs(j));
                    const ringB = horizontal ? Math.max(Math.abs(i + 1), Math.abs(j)) : Math.max(Math.abs(i), Math.abs(j + 1));
                    isAvenue = ringA === ringB ? ringA % 3 === 0 : line === 0;
                }
                // A grand plan's two main axes are its broadest avenues
                const isAxis = streetLayout === 'grand' && line === 0;
                const width = isAxis ? avenueWidth * 1.6 : (isAvenue ? avenueWidth : streetWidth);
                if (isAxis) isAvenue = true;
                const road = { a, b, width, kind: isAvenue ? 'avenue' : 'street' };
                if (river) {
                    let wet = false;
                    for (let k = 0; k <= 8 && !wet; k++) {
                        wet = riverDistance(add(a, scale(sub(b, a), k / 8))) < riverHalfWidth + width / 2;
                    }
                    if (wet) {
                        const dryEnds = riverDistance(a) > riverHalfWidth + 3 && riverDistance(b) > riverHalfWidth + 3;
                        if (dryEnds && (isAvenue || random.float(0, 1) < 0.3)) {
                            layout.bridges.push(road);
                            edgeWidths.set(edgeKey(horizontal, i, j), width);
                        }
                        continue;
                    }
                }
                layout.roads.push(road);
                edgeWidths.set(edgeKey(horizontal, i, j), width);
            }
        }
    }

    // What fills each cell
    const palette = CityPalette.counts(era);
    const maxFloors = eraRank(parameters.era) <= eraRank('earlyModern') ? 4
        : { industrial: 6, electrical: 10, atomic: 25, information: 50, interplanetary: 90 }[parameters.era] ?? 160;
    const kindFactor = { capital: 1, city: 0.8, town: 0.35 }[kind] ?? 0.1;
    // The trees of the place's own climate: conifers in the cold, palms in the heat
    let coniferShare = { frozen: 0.85, cold: 0.6, temperate: 0.12, hot: 0.03, boiling: 0.03 }[parameters.temperature] ?? 0.12;
    let palmShare = 0;
    if (parameters.siteIsKnown || parameters.style?.architecture != null) {
        switch (architecture) {
            case 'cold': coniferShare = 0.8; break;
            case 'temperate': coniferShare = Math.min(coniferShare, 0.2); break;
            case 'arid': coniferShare = 0; palmShare = 0.6; break;
            case 'tropical': coniferShare = 0; palmShare = 0.4; break;
            default: break;
        }
    }
    const tree = (p, treeScale = 1) => makeTree(p, treeScale, coniferShare, random, palmShare);
    // How the buildings' colours and heights are chosen: one or two wall colours and one roof colour for a uniform
    // town, a colour for each district for a balanced one, any colour for an eclectic one
    const look = new BlockLook({ harmony, arid, cold, tropical, greenery: site.greenery, palmShare, noise, blockSize,
        walls: [random.below(palette.walls), random.below(palette.walls)], roof: random.below(palette.roofs) });
    // Fewer trees in a dry town, more in a lush one
    const treeDensity = Math.min(Math.max(0.35 + 0.9 * site.greenery - 0.5 * arid, 0.15), 1.3);
    const context = { layout, random, era, kind, isVillage, maxFloors, kindFactor, palette, coniferShare, palmShare,
        blockSize, riverDistance, riverHalfWidth, terrain, look };

    for (let j = -n; j < n; j++) {
        for (let i = -n; i < n; i++) {
            const index = cellIndex(i, j);
            if (index === null) continue;
            const cellKind = cells[index];
            if (cellKind === Cell.outside) continue;
            const quad = corners(i, j);
            if (cellKind === Cell.water) {
                layout.greens.push(quad);
                continue;
            }
            // The open water draws itself
            if (cellKind === Cell.sea) continue;
            const c = centre(i, j);
            const centralness = centrality(c);
            const streets = [edgeWidths.get(edgeKey(true, i, j)) ?? 0, edgeWidths.get(edgeKey(false, i + 1, j)) ?? 0,
                edgeWidths.get(edgeKey(true, i, j + 1)) ?? 0, edgeWidths.get(edgeKey(false, i, j)) ?? 0].map((w) => w / 2);
            switch (cellKind) {
                case Cell.plaza:
                    layout.plazas.push(quad);
                    break;
                case Cell.park:
                case Cell.riverbank:
                case Cell.wild: {
                    const green = Geometry.inset(quad, streets.map((s) => Math.max(s, 0.5)));
                    if (!green) break;
                    layout.greens.push(cellKind === Cell.park && group[index] >= 0 ? quad : green);
                    // Slopes too steep to build on are left as woodland, or scrub where it's dry
                    const density = cellKind === Cell.wild ? (0.5 + 0.5 * site.forest) * (1 - 0.7 * arid) : treeDensity;
                    fillPark(green, context, cellKind === Cell.riverbank, cellKind === Cell.wild, density);
                    break;
                }
                case Cell.square: {
                    const square = Geometry.inset(quad, streets.map((s) => Math.max(s, 0.5)));
                    if (!square) break;
                    layout.plazas.push(square);
                    layout.monuments.push({ position: c, kind: 'fountain', size: 4 });
                    for (const point of Geometry.inset(square, [5, 5, 5, 5]) ?? []) layout.trees.push(tree(point, 0.8));
                    break;
                }
                case Cell.landmark: {
                    const base = Geometry.inset(quad, streets.map((s) => s + sidewalk));
                    const footprint = base && Geometry.inset(base, [6, 6, 6, 6]);
                    if (!base || !footprint) break;
                    layout.blocks.push(Geometry.inset(quad, streets) ?? base);
                    const size = Math.sqrt(Math.abs(Geometry.area(footprint)));
                    const height = era === 'preindustrial' ? 16 : Math.min(18 + maxFloors * 1.2, 60);
                    layout.landmark = { footprint, height, domeRadius: size * (kind === 'capital' ? 0.32 : 0.24),
                        centre: average(footprint) };
                    break;
                }
                case Cell.built: {
                    const pavement = Geometry.inset(quad, streets);
                    const buildable = pavement && Geometry.inset(pavement, [sidewalk, sidewalk, sidewalk, sidewalk]);
                    if (!pavement || !buildable) break;
                    layout.blocks.push(pavement);
                    const isIndustrial = !isVillage && era !== 'preindustrial' && centralness >= 0.12 && centralness <= 0.5 &&
                        noiseAt(add(scale(c, 1 / (blockSize * 4)), [133.7, 133.7])) > 0.18;
                    if (isIndustrial) fillIndustrialBlock(buildable, context);
                    else fillBlock(buildable, centralness, context);
                    break;
                }
                default:
                    break;
            }
        }
    }

    // Monuments and trees on the central square
    if (plazaCells.length) {
        const squareCentre = average(plazaCells.map(([i, j]) => centre(i, j)));
        const monument = kind === 'capital' ? 'obelisk' : kind === 'city' || kind === 'town' ? 'fountain' : 'statue';
        layout.monuments.push({ position: squareCentre, kind: monument, size: kind === 'capital' ? 8 : (isVillage ? 2.5 : 6) });
        if (!isVillage) {
            for (const [i, j] of plazaCells) {
                for (const point of Geometry.inset(corners(i, j), [9, 9, 9, 9]) ?? []) layout.trees.push(tree(point, 0.8));
            }
        }
    }
    if (!landmarkCell) layout.landmark = null;

    // Street trees along the avenues
    if (era !== 'preindustrial') {
        for (const road of layout.roads) {
            if (road.kind !== 'avenue') continue;
            const len = distance(road.a, road.b);
            if (!(len > 24)) continue;
            const direction = scale(sub(road.b, road.a), 1 / len);
            const normal = [-direction[1], direction[0]];
            for (let t = 10; t < len - 10; t += 16) {
                for (const sign of [-1, 1]) {
                    const p = add(add(road.a, scale(direction, t)), scale(normal, sign * (road.width / 2 + 1.3)));
                    if (riverDistance(p) > riverHalfWidth + 3) layout.trees.push({ position: p, height: 7, crown: 2, isConifer: false });
                }
            }
        }
    }
    // A planned city's circles and boulevards
    if ((streetLayout === 'grand' || streetLayout === 'radial') && !isVillage && plazaCells.length) {
        const hub = average(plazaCells.map(([i, j]) => centre(i, j)));
        const cuts = [];
        const circles = [{ centre: hub, radius: blockSize * (kind === 'capital' ? 0.75 : 0.55) }];
        if (streetLayout === 'grand') {
            // Boulevards out on the diagonals from the central circle, with a smaller circle where each passes
            // halfway, so every long view ends on a monument
            for (let k = 0; k < 4; k++) {
                const angle = gridAngle + Math.PI / 4 + k * Math.PI / 2;
                const direction = [Math.cos(angle), Math.sin(angle)];
                let end = hub;
                for (let t = blockSize; t < radius * 1.1; t += blockSize / 4) {
                    const p = add(hub, scale(direction, t));
                    if (length(p) > extent(p) || terrain.isOpenWater(p) || riverDistance(p) < riverHalfWidth + 4) break;
                    end = p;
                }
                if (!(distance(end, hub) > blockSize * 2)) continue;
                cuts.push({ a: hub, b: end, width: avenueWidth * 1.2 });
                circles.push({ centre: scale(add(hub, end), 0.5), radius: blockSize * 0.4 });
            }
        }
        const cut = (footprint) => cuts.some((c) => Geometry.polygonToPolyline(footprint, [c.a, c.b]) < c.width / 2 + 3)
            || circles.some((circle) => footprint.some((p) => distance(p, circle.centre) < circle.radius + 3));
        layout.buildings = layout.buildings.filter((b) => !cut(b.footprint));
        layout.trees = layout.trees.filter((t) => !(cuts.some((c) => Geometry.distanceToSegment(t.position, c.a, c.b) < c.width / 2 + 1)
            || circles.some((circle) => distance(t.position, circle.centre) < circle.radius)));
        if (layout.landmark && cut(layout.landmark.footprint)) layout.landmark = null;
        for (const boulevard of cuts) layout.roads.push({ a: boulevard.a, b: boulevard.b, width: boulevard.width, kind: 'avenue' });
        circles.forEach((circle, index) => {
            layout.plazas.push(circlePolygon(circle.centre, circle.radius, 24));
            layout.monuments.push({ position: circle.centre, kind: index === 0 ? 'obelisk' : 'fountain', size: index === 0 ? 7 : 4 });
            // A ring of trees round each circle
            const ring = Math.trunc(circle.radius * 2 * Math.PI / 9);
            for (let k = 0; k < ring; k++) {
                const angle = k / ring * 2 * Math.PI;
                layout.trees.push(tree(add(circle.centre, scale([Math.cos(angle), Math.sin(angle)], circle.radius - 3)), 0.7));
            }
        });
        // The old central square's monument gives way to the circle's
        const old = centre(plazaCells[0][0], plazaCells[0][1]);
        layout.monuments = layout.monuments.filter((m) => !(distance(m.position, old) < blockSize && distance(m.position, hub) > 1));
    }

    // Piers and jetties out from the waterfront
    if (shoreline && (!isVillage || era !== 'preindustrial')) {
        const along = [-shoreline.bearing[1], shoreline.bearing[0]];
        const spacing = blockSize * (era === 'preindustrial' ? 2 : 3);
        for (let s = -radius; s < radius; s += spacing * random.float(0.8, 1.25)) {
            // March out toward the water from inland until it's reached
            let r = -radius;
            while (r < radius * 2 && !terrain.isOpenWater(add(scale(along, s), scale(shoreline.bearing, r)))) r += 4;
            const edge = add(scale(along, s), scale(shoreline.bearing, r));
            if (!(r < radius * 2) || !(length(edge) < extent(edge) * 1.05) || !(random.float(0, 1) < 0.7)) continue;
            // Stone or concrete piers once there's industry to build them; timber jetties before
            const pierLength = era === 'preindustrial' ? random.float(14, 30) : random.float(35, 90);
            const width = era === 'preindustrial' ? 3 : (kind === 'capital' || kind === 'city' ? 10 : 6);
            layout.piers.push({ a: sub(edge, scale(shoreline.bearing, 6)), b: add(edge, scale(shoreline.bearing, pierLength)),
                width, kind: 'street' });
        }
    }

    // The country round about, wooded as the land is
    const woodland = site.forest * (1 - 0.8 * arid);
    const country = Math.PI * (Math.pow(radius * 2.2, 2) - Math.pow(radius, 2));
    const woodCount = Math.min(Math.trunc(woodland * country / 700), 4500);
    for (let k = 0; k < woodCount; k++) {
        const angle = random.float(0, f(2 * Math.PI));
        const r = Math.sqrt(random.float(Math.pow(radius * 0.8, 2), Math.pow(radius * 2.2, 2)));
        const p = [Math.cos(angle) * r, Math.sin(angle) * r];
        // Thickest in clumps and on the slopes, clear of the water and the city
        if (!(r > extent(p) + 12) || terrain.isOpenWater(p) || !(riverDistance(p) > riverHalfWidth + 5) ||
            !(noiseAt(add(scale(p, 1 / 260), [211.3, 211.3])) + 0.25 * terrain.slope(p) > -0.1)) continue;
        layout.trees.push(tree(p));
    }

    // On a world without air, everything lives under glass
    if (parameters.airless) enclose(layout, parameters, extent, terrain);

    layout.roadLength = [...layout.roads, ...layout.bridges].filter((r) => r.kind !== 'path')
        .reduce((sum, r) => sum + distance(r.a, r.b), 0) / 1000;
    return layout;
}

// MARK: airless worlds

/**
 * Puts a city on an airless world under glass, after the rest of it is laid out and with draws of its own, so its
 * streets and buildings are the ones it would have had. Most are domed: one dome over a village or town, a cluster of
 * them over a city, linked by glass-roofed roads; buildings out from under them go, and those under them stay low
 * enough to fit. Some are built instead as sealed, pressurized buildings along open roads, with nothing growing
 * outside. Either way their farmland lies in glass bubbles round about. Sets `layout.enclosure` ('domes' or 'sealed'),
 * `layout.domes` and `layout.farmDomes` ({ centre, radius }), and marks covered roads.
 */
function enclose(layout, parameters, extent, terrain) {
    const random = new CityRandom(BigInt.asUintN(64, BigInt(parameters.seed) ^ 0xA1E55D0E5n));
    const kind = parameters.kind;
    const radius = layout.radius;
    const sealed = kind !== 'village' && random.float(0, 1) < 0.3;
    layout.enclosure = sealed ? 'sealed' : 'domes';
    layout.domes = [];
    layout.farmDomes = [];
    layout.water = null;
    layout.ponds = [];
    const centroidOf = (polygon) => scale(polygon.reduce((s, p) => add(s, p), [0, 0]), 1 / polygon.length);

    if (sealed) {
        // Nothing grows in the open; roofs are flat, some crowned with a glass dome over an atrium, and the avenues
        // are glass-roofed so people can cross the city without suits
        layout.trees = [];
        layout.greens = [];
        layout.gardens = [];
        for (const building of layout.buildings) {
            if (building.kind === 'skyscraper' || building.kind === 'warehouse' || building.kind === 'factory') continue;
            building.roof = random.float(0, 1) < 0.15 ? 'dome' : 'flat';
            building.eaves = 0;
        }
        for (const road of layout.roads) if (road.kind === 'avenue') road.covered = true;
    } else {
        // Domes where the buildings are: one over a small place, otherwise a honeycomb of them
        const centres = layout.buildings.map((b) => centroidOf(b.footprint));
        if (radius <= 420) {
            layout.domes.push({ centre: [0, 0], radius: Math.max(radius * 1.2, 90) });
        } else {
            const spacing = Math.min(Math.max(radius / 2.4, 260), 520);
            const domeRadius = spacing * 0.62;
            const rows = Math.ceil(radius * 1.2 / (spacing * 0.866));
            for (let j = -rows; j <= rows; j++) {
                for (let i = -rows - 1; i <= rows + 1; i++) {
                    const centre = [(i + (j % 2 ? 0.5 : 0)) * spacing, j * spacing * 0.866];
                    if (length(centre) > radius * 1.15) continue;
                    const under = centres.filter((c) => distance(c, centre) < domeRadius * 0.85).length;
                    if (under >= 4 || length(centre) < 1) layout.domes.push({ centre, radius: domeRadius });
                }
            }
        }
        const domeOver = (p, margin = 0) => layout.domes.find((d) => distance(p, d.centre) < d.radius - margin) ?? null;
        // Buildings under a dome, and short enough to stand under its curve; the rest go
        const fits = (footprint, height) => {
            const dome = domeOver(centroidOf(footprint));
            if (!dome) return null;
            const farthest = Math.max(...footprint.map((p) => distance(p, dome.centre)));
            if (!(farthest < dome.radius * 0.94)) return null;
            return Math.sqrt(dome.radius * dome.radius - farthest * farthest) * 0.9;
        };
        layout.buildings = layout.buildings.filter((building) => {
            const room = fits(building.footprint, building.height);
            if (room === null) return false;
            const total = building.height + (building.spire ?? 0) + 6;
            if (total > room) {
                building.spire = 0;
                building.height = Math.max(Math.min(building.height, room - 6), 3);
                if (building.tiers > 1 && building.height < 70) building.tiers = 1;
            }
            return true;
        });
        if (layout.landmark) {
            const room = fits(layout.landmark.footprint, layout.landmark.height);
            if (room === null || layout.landmark.height + layout.landmark.domeRadius * 2 > room) layout.landmark = null;
        }
        const covered = (p) => domeOver(p, 2) !== null;
        layout.trees = layout.trees.filter((tree) => covered(tree.position));
        layout.greens = layout.greens.filter((g) => covered(centroidOf(g)));
        layout.gardens = layout.gardens.filter((g) => covered(centroidOf(g)));
        layout.plazas = layout.plazas.filter((p) => covered(centroidOf(p)));
        layout.monuments = layout.monuments.filter((m) => covered(m.position));
        layout.blocks = layout.blocks.filter((b) => covered(centroidOf(b)));
        // Streets under the domes stay; out in the open only the main roads between them, under glass
        layout.roads = layout.roads.filter((road) => {
            const middle = scale(add(road.a, road.b), 0.5);
            if (covered(middle)) return true;
            if (road.kind !== 'avenue' || !(covered(road.a) || covered(road.b) || length(middle) < radius)) return false;
            road.covered = true;
            return true;
        });
    }

    // The farms: glass bubbles round about, each joined to the town by a covered road
    const count = { capital: 14, city: 10, town: 6 }[kind] ?? 3;
    const [smallest, largest] = kind === 'village' ? [30, 55] : [50, 110];
    const occupied = [...layout.domes];
    const townEdge = sealed ? radius : Math.max(radius, ...layout.domes.map((d) => length(d.centre) + d.radius));
    for (let attempt = 0; attempt < count * 12 && layout.farmDomes.length < count; attempt++) {
        const farmRadius = random.float(smallest, largest);
        const angle = random.float(0, 2 * Math.PI);
        const reach = townEdge + farmRadius + random.float(15, Math.max(townEdge * 0.7, 120));
        const centre = [Math.cos(angle) * reach, Math.sin(angle) * reach];
        if (terrain?.isOpenWater?.(centre)) continue;
        if (occupied.some((d) => distance(d.centre, centre) < d.radius + farmRadius + 12)) continue;
        if (sealed && !(length(centre) > extent(centre) + farmRadius + 10)) continue;
        const farm = { centre, radius: farmRadius, rowAngle: random.float(0, Math.PI) };
        layout.farmDomes.push(farm);
        occupied.push(farm);
        // A covered road in to the edge of the town
        const inward = normalize(scale(centre, -1));
        const start = add(centre, scale(inward, farmRadius - 2));
        const end = scale(normalize(centre), sealed ? Math.min(extent(centre), length(centre)) : Math.max(townEdge - 30, 0));
        if (length(start) > length(end) + 5) layout.roads.push({ a: start, b: end, width: 7, kind: 'street', covered: true });
    }
}

/** A polygon of `sides` round a circle */
export function circlePolygon(centre, radius, sides) {
    return Array.from({ length: sides }, (_, k) => {
        const angle = k / sides * 2 * Math.PI;
        return [centre[0] + Math.cos(angle) * radius, centre[1] + Math.sin(angle) * radius];
    });
}

function makeTree(p, treeScale, coniferShare, random, palmShare = 0) {
    const roll = random.float(0, 1);
    const isConifer = roll < coniferShare;
    const isPalm = !isConifer && roll < coniferShare + palmShare;
    const height = (isPalm ? random.float(8, 15) : random.float(6, 13)) * treeScale;
    const crown = height * (isPalm ? 0.22 : (isConifer ? 0.28 : random.float(0.3, 0.42)));
    return { position: p, height, crown, isConifer, isPalm };
}

/**
 * Trees, and a pond or paths, in a park, riverbank or waterfront, or woodland on a slope too steep to build on.
 * `density` scales how many trees there are.
 */
function fillPark(park, context, isRiverbank, isWild = false, density = 1) {
    const { layout, random, blockSize, riverDistance, riverHalfWidth, coniferShare, palmShare, terrain } = context;
    const isPark = !isRiverbank && !isWild;
    if (isPark) layout.parkCount += 1;
    const centre = average(park);
    let pond = null;
    let paths = [];
    if (isPark && random.float(0, 1) < 0.2) {
        pond = { centre, radius: blockSize * random.float(0.14, 0.22) };
        layout.ponds.push(pond);
    } else if (isPark && park.length === 4) {
        paths = [{ a: park[0], b: park[2], width: 2.5, kind: 'path' }, { a: park[1], b: park[3], width: 2.5, kind: 'path' }];
        layout.roads.push(...paths);
    }
    const spacing = 11;
    const xs = park.map((p) => p[0]), ys = park.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    for (let y = minY + spacing / 2; y < maxY; y += spacing) {
        for (let x = minX + spacing / 2; x < maxX;) {
            const p = [x + random.float(-3, 3), y + random.float(-3, 3)];
            x += spacing;
            const chance = (isWild ? 0.85 : (isRiverbank ? 0.4 : 0.55)) * density;
            if (!(random.float(0, 1) < chance) || !Geometry.contains(park, p, 2)) continue;
            if (pond && distance(p, pond.centre) < pond.radius + 3) continue;
            if (paths.some((path) => Geometry.distanceToSegment(p, path.a, path.b) < 3.5)) continue;
            if (riverDistance(p) < riverHalfWidth + 3 || terrain.isOpenWater(p)) continue;
            layout.trees.push(makeTree(p, 1, coniferShare, random, palmShare));
        }
    }
}

function oriented(block) {
    let q = block;
    const lengthU = (distance(q[0], q[1]) + distance(q[3], q[2])) / 2;
    const lengthV = (distance(q[0], q[3]) + distance(q[1], q[2])) / 2;
    if (lengthV > lengthU) q = [q[1], q[2], q[3], q[0]];
    return { q, along: Math.max(lengthU, lengthV), across: Math.min(lengthU, lengthV) };
}

function pointIn(q, u, v) {
    return [
        q[0][0] * (1 - u) * (1 - v) + q[1][0] * u * (1 - v) + q[2][0] * u * v + q[3][0] * (1 - u) * v,
        q[0][1] * (1 - u) * (1 - v) + q[1][1] * u * (1 - v) + q[2][1] * u * v + q[3][1] * (1 - u) * v,
    ];
}

/** How a city's buildings are made to look of a piece, or not, and how its climate shapes them */
class BlockLook {
    constructor({ harmony, arid, cold, tropical, greenery, palmShare, noise, blockSize, walls, roof }) {
        Object.assign(this, { harmony, arid, cold, tropical, greenery, palmShare, noise, blockSize, walls, roof });
    }

    /**
     * A wall colour for a building at `p`. A uniform town uses its two colours, district by district; a balanced one
     * gives each district a colour most of its buildings share; an eclectic one picks freely.
     */
    wall(p, count, random) {
        const district = this.noise.at(p[0] / (this.blockSize * 3) + 501.7, p[1] / (this.blockSize * 3) + 501.7);
        switch (this.harmony) {
            case 'uniform': return this.walls[district > 0 ? 0 : 1] % count;
            case 'balanced': {
                const local = Math.trunc((district + 0.5) * count * 2) % count;
                return random.float(0, 1) < 0.65 ? local : random.below(count);
            }
            default: return random.below(count);
        }
    }

    roofColor(count, random) {
        switch (this.harmony) {
            case 'uniform': return this.roof % count;
            case 'balanced': return random.float(0, 1) < 0.7 ? this.roof % count : random.below(count);
            default: return random.below(count);
        }
    }

    /**
     * How much one building's height may differ from its neighbours': little in a uniform town, so its skyline rises
     * and falls smoothly, much in an eclectic one
     */
    get heightSpread() {
        return { uniform: [0.88, 1.12], balanced: [0.72, 1.25], eclectic: [0.45, 1.5] }[this.harmony] ?? [0.72, 1.25];
    }
}

function fillBlock(block, d, context) {
    const { layout, random, era, kind, isVillage, maxFloors, kindFactor, palette, coniferShare, look } = context;
    const tree = (p, treeScale) => makeTree(p, treeScale, coniferShare, random, look.palmShare);
    if (block.length !== 4) return;
    const { q, along, across } = oriented(block);
    const point = (u, v) => pointIn(q, u, v);

    const towerCore = kind === 'capital' ? 0.5 : 0.62;
    if ((kind === 'city' || kind === 'capital') && maxFloors >= 25 && d > towerCore && random.float(0, 1) < 0.8) {
        fillTowerBlock(q, along, across, d, context);
        return;
    }

    const isDowntown = d > 0.6 && (era === 'modern' || era === 'advanced') && !isVillage;
    const eraFrontage = { preindustrial: 1, industrial: 1.1, modern: 1.4, advanced: 1.8 }[era];
    const frontage = isDowntown ? 38 : (16 + (9 - 16) * d) * eraFrontage * (isVillage ? 1.6 : 1);
    // Where it's hot and dry, houses are shallow ranges round courtyards, shaded and cool; anywhere else courtyards
    // come only with deep blocks
    const maxDepth = isDowntown ? across / 2 : (22 + (16 - 22) * d) * (isVillage ? 1.3 : 1) * (1 - 0.4 * look.arid);

    let rows;
    if (across > 2 * maxDepth + 8) {
        const depth = maxDepth / across;
        rows = [[0, depth], [1 - depth, 1]];
        const courtyard = [point(0.04, depth), point(0.96, depth), point(0.96, 1 - depth), point(0.04, 1 - depth)];
        // Paved, with a tree or two for shade, where it's dry; a garden elsewhere
        if (look.arid > 0.5) layout.plazas.push(courtyard);
        else layout.gardens.push(courtyard);
        const middle = average(courtyard);
        const treeCount = Math.trunc(random.float(1, 4 - 2 * look.arid));
        for (let k = 0; k < treeCount; k++) {
            const ox = random.float(-0.3, 0.3), oy = random.float(-0.3, 0.3);
            layout.trees.push(tree(add(middle, [ox * along, oy * (across - 2 * maxDepth)]), 1));
        }
    } else if (across > 20) {
        rows = [[0, 0.5], [0.5, 1]];
    } else {
        rows = [[0, 1]];
    }
    const lotCount = Math.max(1, Math.trunc(roundHalfAway(along / frontage)));
    // Houses stand wall to wall where it's hot and dry, and well apart among their gardens where it's hot and wet
    const gap = (isDowntown ? 3 : (era === 'preindustrial' ? 0.15 + 2.5 * (1 - d) : 0.4 + 4 * (1 - d)) * (isVillage ? 1.8 : 1))
        * (1 - 0.75 * look.arid) * (1 + 0.6 * look.tropical);
    const emptyChance = 0.04 + 0.32 * (1 - d) * (isVillage ? 1.4 : 1);
    const isSuburban = isVillage || d < 0.55;
    // Dry yards rather than lawns where it's arid
    if (isSuburban && look.arid < 0.5) layout.gardens.push(block);
    const buildingDepth = isDowntown || d > 0.75 ? Infinity : 10 + 10 * d;
    const frontSetback = isSuburban ? 1.5 + 3 * (1 - d) : 0;

    for (const [v0, v1] of rows) {
        const frontsNear = v0 === 0;
        const rowDepth = (v1 - v0) * across;
        const depth = Math.min(buildingDepth, rowDepth - frontSetback) / across;
        const setback = Math.min(frontSetback, rowDepth * 0.3) / across;
        const [b0, b1] = rows.length === 1 ? [v0, v1]
            : (frontsNear ? [v0 + setback, v0 + setback + depth] : [v1 - setback - depth, v1 - setback]);
        const cuts = [0];
        for (let k = 1; k < lotCount; k++) cuts.push((k + random.float(-0.25, 0.25)) / lotCount);
        cuts.push(1);
        for (let k = 0; k < lotCount; k++) {
            const u0 = cuts[k], u1 = cuts[k + 1];
            const lot = [point(u0, v0), point(u1, v0), point(u1, v1), point(u0, v1)];
            if (random.float(0, 1) < emptyChance) {
                if (random.float(0, 1) < 0.7 * (0.4 + 0.8 * look.greenery)) layout.trees.push(tree(average(lot), 0.8));
                continue;
            }
            let floors = 1 + (maxFloors - 1) * Math.pow(d, 2.2) * kindFactor;
            floors *= random.float(...look.heightSpread);
            if (isVillage) floors = Math.min(floors, 2);
            const floorCount = Math.max(1, Math.trunc(roundHalfAway(floors)));
            const buildingKind = isDowntown ? 'office' : floorCount >= 4 ? 'apartment' : isSuburban ? 'house' : 'terrace';
            const plot = [point(u0, b0), point(u1, b0), point(u1, b1), point(u0, b1)];
            const sideGap = buildingKind === 'terrace' ? 0 : gap;
            const footprint = Geometry.inset(plot, [gap, sideGap, gap, sideGap]);
            if (!footprint || !(Math.abs(Geometry.area(footprint)) > 18)) continue;
            if (isSuburban && rows.length > 1 && random.float(0, 1) < 0.3 * (0.4 + 1.2 * look.greenery)) {
                const back = frontsNear ? (b1 + v1) / 2 : (v0 + b0) / 2;
                if (Math.abs(back - (frontsNear ? b1 : b0)) * across > 3) layout.trees.push(tree(point((u0 + u1) / 2, back), 0.8));
            }
            const height = floorCount * 3.2 + 0.8;
            const isHouse = buildingKind === 'house' || buildingKind === 'terrace';
            // Pitched roofs shed snow and rain, steeper where it's cold; flat roofs are for sleeping out and drying crops
            // where it's hot and dry, often with a small dome; broad hipped roofs with deep eaves keep off the tropical
            // sun and rain
            const pitchedLimit = era === 'preindustrial' ? 4 : (look.cold > 0.4 ? 3 : 2);
            const pitched = isHouse && floorCount <= pitchedLimit && era !== 'advanced' &&
                random.float(0, 1) < 0.8 * (1 - look.arid) + 0.15 * look.cold;
            let roof;
            if (pitched) roof = random.float(0, 1) < look.tropical ? 'hip' : 'gable';
            else if (isHouse && floorCount <= 3 && random.float(0, 1) < 0.12 * look.arid) roof = 'dome';
            else roof = 'flat';
            const isGlass = buildingKind === 'office' && random.float(0, 1) < (era === 'advanced' ? 0.8 : 0.55);
            const wall = isGlass ? random.below(palette.glass) : look.wall(average(footprint), palette.walls, random);
            const roofColor = look.roofColor(palette.roofs, random);
            const hasRooftopPlant = roof === 'flat' && floorCount >= 4 && random.float(0, 1) < (buildingKind === 'office' ? 0.6 : 0.35);
            layout.buildings.push({ kind: buildingKind, footprint, height, roof, wall, roofColor, isGlass, hasRooftopPlant,
                tiers: 1, spire: 0, eaves: roof === 'hip' ? 0.6 + 0.6 * look.tropical : (roof === 'gable' ? 0.3 + 0.4 * look.cold : 0) });
        }
    }
}

function fillTowerBlock(q, along, across, d, context) {
    const { layout, random, kind, maxFloors, palette, look } = context;
    const count = along > across * 1.6 ? 2 : 1;
    const isGlass = random.float(0, 1) < 0.85;
    const leastFloors = 20;
    for (let k = 0; k < count; k++) {
        const u0 = k / count, u1 = (k + 1) / count;
        const plot = [pointIn(q, u0, 0), pointIn(q, u1, 0), pointIn(q, u1, 1), pointIn(q, u0, 1)];
        const margins = [0, 1, 2, 3].map(() => random.float(3, 9));
        const footprint = Geometry.inset(plot, margins);
        if (!footprint || !(Math.abs(Geometry.area(footprint)) > 150)) continue;
        // Towers rise toward the very centre: smoothly in a uniform city, unevenly in an eclectic one
        let floors = maxFloors * (kind === 'capital' ? 1 : 0.7) * (0.45 + 0.55 * d) * random.float(...look.heightSpread);
        floors = Math.min(Math.max(floors, leastFloors), maxFloors);
        const height = roundHalfAway(floors) * 3.6 + 2;
        let tiers = height > 300 ? 4 : (height > 150 ? 3 : (height > 70 ? 2 : 1));
        if (random.float(0, 1) < 0.3) tiers = 1;
        const spire = height > 60 && random.float(0, 1) < 0.3 ? height * random.float(0.08, 0.18) : 0;
        const wall = isGlass ? random.below(palette.glass) : look.wall(average(footprint), palette.walls, random);
        const roofColor = look.roofColor(palette.roofs, random);
        const hasRooftopPlant = spire === 0 && random.float(0, 1) < 0.5;
        layout.buildings.push({ kind: 'skyscraper', footprint, height, roof: 'flat', wall, roofColor, isGlass,
            hasRooftopPlant, tiers, spire });
    }
}

function fillIndustrialBlock(block, context) {
    const { layout, random, era, palette } = context;
    if (block.length !== 4) return;
    const { q, along } = oriented(block);
    const count = Math.max(1, Math.min(3, Math.trunc(roundHalfAway(along / 45))));
    const factoryChance = { industrial: 0.45, modern: 0.2 }[era] ?? 0;
    for (let k = 0; k < count; k++) {
        const u0 = k / count, u1 = (k + 1) / count;
        const plot = [pointIn(q, u0, 0), pointIn(q, u1, 0), pointIn(q, u1, 1), pointIn(q, u0, 1)];
        const margins = [0, 1, 2, 3].map(() => random.float(2.5, 6));
        const footprint = Geometry.inset(plot, margins);
        if (!footprint || !(Math.abs(Geometry.area(footprint)) > 60)) continue;
        const isFactory = random.float(0, 1) < factoryChance;
        const height = isFactory ? random.float(8, 14) : random.float(6, 10);
        const wall = random.below(palette.walls);
        const roofColor = random.below(palette.roofs);
        layout.buildings.push({ kind: isFactory ? 'factory' : 'warehouse', footprint, height, roof: 'flat', wall,
            roofColor, isGlass: false, hasRooftopPlant: false, tiers: 1, spire: 0 });
    }
}

function roundHalfAway(value) {
    return value < 0 ? -Math.round(-value) : Math.round(value);
}
