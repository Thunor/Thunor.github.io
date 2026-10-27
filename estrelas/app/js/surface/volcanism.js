//
//  volcanism.js
//  Estrelas (web)
//
//  Volcanoes on rocky worlds that would have them: broad shield volcanoes, chains of them trailing from a hotspot
//  (islands and seamounts where there's a sea), arcs of steep cones along the edges of the land, calderas, and on active
//  worlds lava lakes glowing in them and fresh flows down their flanks. The hottest worlds, hot enough to melt rock,
//  have seas of lava in their lowlands. How volcanic a world is follows from its mass (bigger worlds keep their heat
//  longer), tidal heating (moons of gas giants) and its surface temperature.
//
//  Volcanoes raise the height noise itself (surfaceMap.elevation), so the sea level, relief, rivers, contours and
//  altitudes all see them; their colours are painted over a finished surface, after its craters.
//

import { fbm, mixColor, shaded } from './surfaceMap.js';
import { out, addSmall } from './u64.js';

/** Bumped whenever volcanoes are drawn differently, so surfaces saved with earlier ones are drawn again */
export const volcanoVersion = 1;

const smoothstep = (a, b, x) => {
    const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
    return t * t * (3 - 2 * t);
};

/** A small, fast generator of 0..<1 from a 32-bit seed (mulberry32) */
function generator(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const seed32 = (seed, salt) => Number(BigInt.asUintN(32, BigInt(seed) ^ (BigInt(seed) >> 32n))) ^ salt;

/**
 * How volcanic a rocky world is: { volcanism (0…1), lavaSeas (the fraction of its surface under lava) }, or null for a
 * quiet one. `tidallyHeated` is for a moon kneaded by a gas giant, like Io.
 */
export function volcanismFor(world, seed, tidallyHeated = false) {
    // A minor planet is far too small to have kept any heat inside it
    if (world.minorPlanet) return null;
    // Worlds share their noise by designation, so their size and orbit set them apart too
    const random = generator(seed32(seed, 0x701CA40 ^ Math.round((world.radiusKm ?? 0) * 7 + (world.au ?? 0) * 100003)));
    const radius = world.radiusKm ?? 6371;
    const mass = world.massEarths ?? Math.pow(radius / 6371, 3.7);
    // Bigger worlds keep the heat of their making for longer; some are quieter than others all the same
    const r = random();
    let level = smoothstep(0.03, 1.5, mass) * (0.15 + 0.85 * r * r);
    // A moon close in to a gas giant can be heated from within by its tides, more volcanic than any planet
    const heated = random();
    if (tidallyHeated && heated < 0.35) level = Math.max(level, 0.75 + 0.25 * random());
    // Hot enough to melt rock: the lowlands lie under lava
    const kelvin = world.environment?.temperatureK ?? 0;
    const lavaSeas = kelvin >= 900 ? 0.05 + 0.3 * smoothstep(900, 2000, kelvin) : 0;
    if (lavaSeas > 0) level = Math.max(level, 0.6);
    if (level < 0.12) return null;
    return { volcanism: Math.round(level * 1000) / 1000, lavaSeas: Math.round(lavaSeas * 1000) / 1000 };
}

// MARK: the volcanoes

const lists = new Map();

/** A random point on the unit sphere */
function randomPoint(random) {
    const z = 2 * random() - 1, phi = 2 * Math.PI * random(), r = Math.sqrt(1 - z * z);
    return [r * Math.cos(phi), z, r * Math.sin(phi)];
}

/** A random direction along the sphere at `p` */
function randomTangent(p, random) {
    const q = randomPoint(random);
    const d = q[0] * p[0] + q[1] * p[1] + q[2] * p[2];
    const t = [q[0] - d * p[0], q[1] - d * p[1], q[2] - d * p[2]];
    const l = Math.hypot(...t) || 1;
    return [t[0] / l, t[1] / l, t[2] / l];
}

/** The point `angle` radians from `p` along the great circle heading `direction` */
const along = (p, direction, angle) => [0, 1, 2].map((k) => p[k] * Math.cos(angle) + direction[k] * Math.sin(angle));

/**
 * A world's volcanoes, each { x, y, z, radius (radians), height (of the height noise), caldera (fraction of the
 * radius), steep (a cone rather than a shield), active }, with a lookup of those near any point
 */
function volcanoesOf(style) {
    const key = `${style.seed}|${style.volcanism}|${style.waterFraction}|${style.gravity ?? 1}`;
    let found = lists.get(key);
    if (found) return found;
    const random = generator(seed32(style.seed, 0x5EAB0175 ^ Math.round(style.volcanism * 1e6) ^ Math.round((style.gravity ?? 1) * 7919)));
    const level = style.volcanism;
    // Low gravity lets volcanoes grow broader and taller, as on Mars
    const size = Math.min(Math.max(1 / Math.sqrt(style.gravity ?? 1), 0.7), 1.8);
    const activeChance = level * level * 0.8;
    const list = [];
    const add = (p, radius, height, steep, active) => list.push({ x: p[0], y: p[1], z: p[2], radius, height,
        caldera: steep ? 0.1 : 0.14 + 0.08 * random(), steep, active });
    // Chains trailing from hotspots: youngest, largest and most likely alive at one end
    const chains = Math.round(level * 4 * (0.5 + random()));
    for (let chain = 0; chain < chains; chain++) {
        const start = randomPoint(random), heading = randomTangent(start, random);
        const count = 4 + Math.trunc(random() * 6);
        const radius = (0.045 + 0.05 * random()) * size, height = 0.22 + 0.2 * random();
        let angle = 0;
        for (let i = 0; i < count; i++) {
            const age = i / count;
            const r = radius * (1 - 0.55 * age) * (0.85 + 0.3 * random());
            add(along(start, heading, angle), r, height * (1 - 0.5 * age) * (0.85 + 0.3 * random()), false,
                i < 2 && random() < activeChance * (i === 0 ? 1.4 : 0.8));
            angle += r * (1.3 + 0.6 * random());
        }
    }
    // Lone shields, now and then a giant
    const singles = Math.round(level * 7 * (0.5 + random()));
    for (let i = 0; i < singles; i++) {
        const giant = random() < 0.15;
        add(randomPoint(random), (giant ? 0.13 + 0.07 * random() : 0.04 + 0.05 * random()) * size,
            (giant ? 0.45 : 0.18) + 0.2 * random(), false, random() < activeChance);
    }
    // Arcs of steep cones where plates meet, on worlds with seas
    if (style.waterFraction > 0 && level > 0.2) {
        const arcs = Math.round(level * 3 * (0.5 + random()));
        for (let arc = 0; arc < arcs; arc++) {
            const start = randomPoint(random);
            let heading = randomTangent(start, random);
            const count = 6 + Math.trunc(random() * 7);
            let p = start;
            for (let i = 0; i < count; i++) {
                const r = (0.025 + 0.02 * random()) * size;
                add(p, r, 0.25 + 0.15 * random(), true, random() < activeChance * 1.2);
                const step = r * (2 + 2 * random());
                const next = along(p, heading, step);
                // Arcs curve gently
                const bend = randomTangent(next, random);
                heading = [0, 1, 2].map((k) => heading[k] * Math.cos(step) - p[k] * Math.sin(step) + bend[k] * 0.15);
                const d = heading[0] * next[0] + heading[1] * next[1] + heading[2] * next[2];
                heading = heading.map((v, k) => v - d * next[k]);
                const l = Math.hypot(...heading) || 1;
                heading = heading.map((v) => v / l);
                p = next;
            }
        }
    }
    // A lookup of the volcanoes reaching each cube of a grid over the sphere
    const extent = 1.4;
    const largest = Math.max(0.02, ...list.map((v) => v.radius * extent));
    const bucket = largest * 2;
    const dimension = Math.ceil(2 / bucket) + 1;
    const index = (value) => Math.min(Math.max(Math.trunc((value + 1) / bucket), 0), dimension - 1);
    const buckets = new Map();
    for (const v of list) {
        v.cosReach = Math.cos(v.radius * extent);
        const span = v.radius * extent;
        for (let z = index(v.z - span); z <= index(v.z + span); z++) {
            for (let y = index(v.y - span); y <= index(v.y + span); y++) {
                for (let x = index(v.x - span); x <= index(v.x + span); x++) {
                    const k = (z * dimension + y) * dimension + x;
                    if (!buckets.has(k)) buckets.set(k, []);
                    buckets.get(k).push(v);
                }
            }
        }
    }
    found = { list, near: (px, py, pz) => buckets.get((index(pz) * dimension + index(py)) * dimension + index(px)) ?? none };
    if (lists.size >= 8) lists.delete(lists.keys().next().value);
    lists.set(key, found);
    return found;
}
const none = [];

/** A volcano's distance over its radius at a point, its outline roughened so it isn't a perfect circle */
function reach(style, v, px, py, pz, dot) {
    addSmall(style.seedHi, style.seedLo, 0x0B1A);
    const n = fbm(px * 40, py * 40, pz * 40, out.hi, out.lo, 3);
    return Math.acos(Math.min(dot, 1)) / v.radius * (0.75 + 0.5 * n);
}

/** The volcano nearest to being under a point, as { volcano, t (distance over its radius) }, or null */
export function volcanoAt(style, px, py, pz) {
    if (!(style.volcanism > 0)) return null;
    let best = null;
    for (const v of volcanoesOf(style).near(px, py, pz)) {
        const dot = px * v.x + py * v.y + pz * v.z;
        if (dot < v.cosReach) continue;
        const t = reach(style, v, px, py, pz, dot);
        if (!best || t < best.t) best = { volcano: v, t };
    }
    return best;
}

/** A volcano's height at `t` of its radius from its centre: a shield or a cone, with its caldera sunk in the top */
function profile(v, t) {
    if (t >= 1) return 0;
    const shape = v.steep ? Math.pow(1 - t, 2.2) : Math.pow(1 - t * t, 1.6);
    const pit = t < v.caldera ? 0.3 * Math.sqrt(1 - t / v.caldera) * (v.steep ? 0.6 : 1) : 0;
    return v.height * Math.max(shape - pit, 0);
}

/** How much the volcanoes raise the height noise at a point on the unit sphere */
export function volcanicRelief(style, px, py, pz) {
    let raised = 0;
    for (const v of volcanoesOf(style).near(px, py, pz)) {
        const dot = px * v.x + py * v.y + pz * v.z;
        if (dot < v.cosReach) continue;
        // Overlapping volcanoes merge into one massif rather than stacking
        raised = Math.max(raised, profile(v, reach(style, v, px, py, pz, dot)));
    }
    return raised;
}

// MARK: lava seas

const lavaLevels = new Map();

/** The height below which a world's lowlands are lava, so the right fraction is */
function lavaLevel(style, icosphere) {
    const key = `${style.seed}|${style.lavaSeas}`;
    if (lavaLevels.has(key)) return lavaLevels.get(key);
    const vertices = icosphere(5).vertices;
    const count = vertices.length / 3;
    const heights = new Float64Array(count);
    for (let i = 0; i < count; i++) heights[i] = fbm(vertices[i * 3] * 2.2, vertices[i * 3 + 1] * 2.2, vertices[i * 3 + 2] * 2.2, style.seedHi, style.seedLo, 5);
    heights.sort();
    const level = heights[Math.min(Math.trunc(style.lavaSeas * count), count - 1)];
    if (lavaLevels.size >= 8) lavaLevels.delete(lavaLevels.keys().next().value);
    lavaLevels.set(key, level);
    return level;
}

/** Whether a point lies under a lava sea; `height` is the height noise there */
export function isLava(style, height, icosphere) {
    return style.lavaSeas > 0 && height < lavaLevel(style, icosphere);
}

// MARK: colours

const basalt = [0.16, 0.145, 0.135];
const freshBasalt = [0.07, 0.065, 0.065];
const lavaBright = [1, 0.62, 0.18];
const lavaDeep = [0.78, 0.18, 0.05];
const crust = [0.11, 0.075, 0.065];

/**
 * Molten rock under a dark crust, glowing through a web of cracks where the crust breaks; `cover` is how much of it the
 * crust hides (0 a molten lake, 1 a crusted sea)
 */
function lava(style, px, py, pz, cover, scale = 24) {
    addSmall(style.seedHi, style.seedLo, 0x1A7A);
    const n = fbm(px * scale, py * scale, pz * scale, out.hi, out.lo, 4);
    const crack = 1 - Math.abs(2 * n - 1);
    const glow = mixColor(lavaDeep, lavaBright, smoothstep(0.9, 1, crack));
    return mixColor(glow, crust, cover * (1 - smoothstep(0.82, 0.95, crack)));
}

/** Lava flows radiating down a volcano's flanks from its summit, 0…1: streaks round it, drawn out downhill */
function flows(style, v, px, py, pz, t) {
    // Which way round the summit the point lies
    const [ax, ay, az] = Math.abs(v.y) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    let e1x = ay * v.z - az * v.y, e1y = az * v.x - ax * v.z, e1z = ax * v.y - ay * v.x;
    const l = Math.hypot(e1x, e1y, e1z);
    e1x /= l; e1y /= l; e1z /= l;
    const e2x = v.y * e1z - v.z * e1y, e2y = v.z * e1x - v.x * e1z, e2z = v.x * e1y - v.y * e1x;
    const angle = Math.atan2(px * e2x + py * e2y + pz * e2z, px * e1x + py * e1y + pz * e1z);
    addSmall(style.seedHi, style.seedLo, 0xF10E);
    return fbm(Math.cos(angle) * 4.5, Math.sin(angle) * 4.5, t * 1.4 + v.x * 13, out.hi, out.lo, 4);
}

/**
 * The colour of a point once its volcanoes and lava are painted over `c`, the surface's own colour there; `wet` if the
 * point is under water (seamounts don't show). `height` is the height noise there.
 */
export function volcanicColor(style, c, px, py, pz, wet, height, icosphere) {
    if (!wet && isLava(style, height, icosphere)) return lava(style, px, py, pz, 0.92);
    const found = volcanoAt(style, px, py, pz);
    if (!found || wet || found.t >= 1) return c;
    const { volcano: v, t } = found;
    // Snow on a high summit stays white, but for the caldera
    const bright = (c[0] + c[1] + c[2]) / 3 > 0.82;
    if (t < v.caldera) return v.active ? lava(style, px, py, pz, 0.35, 90) : mixColor(c, freshBasalt, 0.7);
    // Darker rock than the plains round about, with flows of it streaming down from the summit
    const rock = mixColor([c[0] * 0.6, c[1] * 0.58, c[2] * 0.56], basalt, 0.3);
    let colour = mixColor(c, rock, (bright ? 0.1 : 0.75) * Math.pow(1 - t, 0.7));
    const flow = bright ? 0 : smoothstep(0.5, 0.66, flows(style, v, px, py, pz, t)) * Math.pow(1 - t, 0.5);
    colour = mixColor(colour, freshBasalt, flow * (v.active ? 0.85 : 0.4));
    // Lit from the north-west like the craters, so the cone stands up from the plain
    const shade = slopeShade(v, t, px, py, pz);
    colour = shaded(colour, shade > 0 ? shade * 0.4 : shade);
    // Glowing where a fresh flow is still moving, high on an active volcano
    if (v.active && t < 0.5) colour = mixColor(colour, lavaDeep, flow * smoothstep(0.5, 0.15, t) * 0.9);
    return colour;
}

/** Light and shade on a volcano's flank at `t` of its radius: its slope facing toward or away from the north-west */
function slopeShade(v, t, px, py, pz) {
    // east = cross(point, up), north = cross(east, point), and the light from between north and west
    let ex = -pz, ez = px;
    const el = Math.hypot(ex, ez);
    if (!(el > 1e-6)) return 0;
    ex /= el; ez /= el;
    const nx = -ez * py, ny = ez * px - ex * pz, nz = ex * py;
    let lx = nx - ex, ly = ny, lz = nz - ez;
    const ll = Math.hypot(lx, ly, lz);
    lx /= ll; ly /= ll; lz /= ll;
    // Outward from the summit, along the ground
    let rx = px - v.x, ry = py - v.y, rz = pz - v.z;
    const rl = Math.hypot(rx, ry, rz);
    if (!(rl > 1e-9)) return 0;
    rx /= rl; ry /= rl; rz /= rl;
    const slope = v.steep ? 2.2 * Math.pow(1 - t, 1.2) : 3.2 * t * Math.pow(1 - t * t, 0.6);
    // Slopes facing the light (outward away from it) are lit; facing away, shaded
    return 0.22 * slope * Math.min(v.height * 4, 1.5) * (rx * lx + ry * ly + rz * lz);
}

/** The ground's name at a point, for pins, if a volcano or lava gives it one */
export function volcanicTerrain(style, px, py, pz, height, icosphere) {
    if (isLava(style, height, icosphere)) return 'lavaSea';
    const found = volcanoAt(style, px, py, pz);
    if (!found || found.t >= 0.75) return null;
    if (found.t < found.volcano.caldera) return found.volcano.active ? 'lavaLake' : 'caldera';
    return found.volcano.active ? 'activeVolcano' : 'volcano';
}
