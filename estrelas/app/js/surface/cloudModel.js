//
//  cloudModel.js
//  Estrelas (web)
//
//  The weather the cloud shader draws (shaders.js, cloudFragment), worked out again on the CPU for any point, so what
//  the app reports (local weather, radar, temperature, storms) is what the clouds show. A port of CloudModel.swift,
//  in single precision like the shader.
//

const f = Math.fround;

export const period = 1024;
export const rows = 180;
export const rowHeight = f(Math.PI / rows);
export const storms = 40;
export const spirals = 4;
export const convectiveStorms = 16;
export const tau = f(6.2831853);
export const substellar = [-1, 0, 0];

/** The settings the shader is given for a world's clouds */
export function cloudSettings(clouds, faceLocked = false) {
    const seed = Number(BigInt.asUintN(64, BigInt(clouds.seed)) % 4096n);
    return {
        coverage: f(Math.min(Math.max(clouds.coverage, 0), 1)),
        circulation: f(Math.min(Math.max(clouds.circulation ?? 0, 0), 1)),
        hurricanes: Math.min(Math.max(clouds.hurricanes ?? 0, 0), 3),
        faceLocked,
        seed: Math.imul(seed, 2654435761) >>> 0,
    };
}

/** The shader's w setting: the seed, whether the world is locked face-on to its star, and its hurricanes */
export function packedSettings(clouds, faceLocked) {
    const seed = Number(BigInt.asUintN(64, BigInt(clouds.seed)) % 4096n);
    return seed * 8 + (faceLocked ? 4 : 0) + Math.min(Math.max(clouds.hurricanes ?? 0, 0), 3);
}

// MARK: the shader's helpers

export function hash3(a, b, c, seed) {
    let x = (Math.imul(a >>> 0, 1664525) + 1013904223 + seed) >>> 0;
    let y = (Math.imul(b >>> 0, 1664525) + 1013904223 + seed) >>> 0;
    let z = (Math.imul(c >>> 0, 1664525) + 1013904223 + seed) >>> 0;
    x = (x + Math.imul(y, z)) >>> 0; y = (y + Math.imul(z, x)) >>> 0; z = (z + Math.imul(x, y)) >>> 0;
    x = (x ^ (x >>> 16)) >>> 0; y = (y ^ (y >>> 16)) >>> 0; z = (z ^ (z >>> 16)) >>> 0;
    x = (x + Math.imul(y, z)) >>> 0; y = (y + Math.imul(z, x)) >>> 0; z = (z + Math.imul(x, y)) >>> 0;
    return [x, y, z];
}

export function random3(a, b, seed) {
    const [x, y, z] = hash3(a | 0, b | 0, 0, seed >>> 0);
    const k = f(1.0 / 4294967295.0);
    return [f(f(x) * k), f(f(y) * k), f(f(z) * k)];
}

export function bump(degrees, centre, width) {
    const x = (degrees - centre) / width;
    return Math.exp(-x * x);
}

/** The wind at a latitude, m/s east; on a world locked face-on to its star, just its jet along the equator */
export function windSpeed(latitude, circulation, locked = false) {
    const degrees = Math.abs(latitude) * 57.29578;
    const metres = locked ? 8 * Math.cos(latitude) * Math.cos(latitude)
        : -6 * bump(degrees, 10, 14) + 13 * bump(degrees, 46, 13) - 4 * bump(degrees, 76, 9);
    return f(metres * (0.4 + 0.6 * circulation));
}

/** The wind in turns round the world a day, as the shader moves cloud by it */
export function wind(latitude, circulation, locked = false) {
    return f(windSpeed(latitude, circulation, locked) * 0.00216 / Math.max(Math.cos(latitude), 0.15));
}

export function climate(latitude) {
    const degrees = Math.abs(latitude) * 57.29578;
    return 0.18 * bump(degrees, 0, 8) - 0.2 * bump(degrees, 25, 9) + 0.14 * bump(degrees, 52, 12) + 0.05 * bump(degrees, 80, 10);
}

export function spherePoint(latitude, longitude) {
    const c = Math.cos(latitude), angle = longitude * tau;
    return [c * Math.cos(angle), Math.sin(latitude), -c * Math.sin(angle)];
}

export function rhythm(days) {
    return tau * Math.max(Math.round(period / days), 1) / period;
}

export const fract = (x) => x - Math.floor(x);
export const saturate = (x) => Math.min(Math.max(x, 0), 1);
export function smoothstep(edge0, edge1, x) {
    const t = saturate((x - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
}
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const length2 = (v) => Math.sqrt(v[0] * v[0] + v[1] * v[1]);

// MARK: the cloud field, drawn the way the Gaia Engine draws its clouds

/**
 * Days each layer of the cloud field lasts: the field is two layers, each carried by the winds for this long and
 * crossfaded into the next, so the winds' shear never stretches it into streaks. Divides the weather clock's period.
 */
export const layerDays = 2;
const layerCycles = period / layerDays;
/** The blended field's mean, and its value at each 1/32 of the way through its distribution (see uniform) */
export const fieldMean = 0.484;
export const fieldQuantiles = [
    0.0, 0.28752, 0.31972, 0.34176, 0.35915, 0.37375, 0.38697, 0.39895, 0.40997, 0.42038, 0.43045,
    0.44009, 0.44934, 0.45836, 0.46722, 0.47603, 0.48462, 0.49332, 0.502, 0.5108, 0.51986, 0.52908,
    0.53846, 0.54844, 0.55864, 0.56973, 0.58169, 0.59464, 0.60964, 0.62692, 0.6488, 0.68126, 1.0];

/** A lattice point's random value, 0–1: one integer hash, the same on the GPU */
export function lattice(x, y, z, seed) {
    let h = (Math.imul(x | 0, 0x8DA6B343) ^ Math.imul(y | 0, 0xD8163841) ^ Math.imul(z | 0, 0xCB1AB31F) ^ seed) >>> 0;
    h = Math.imul(h ^ (h >>> 16), 0x7FEB352D) >>> 0;
    h = Math.imul(h ^ (h >>> 15), 0x846CA68B) >>> 0;
    h = (h ^ (h >>> 16)) >>> 0;
    return f(f(h) * f(1 / 4294967295));
}

/** Value noise, smoothly interpolated between lattice points */
export function valueNoise(px, py, pz, seed) {
    const ix = Math.floor(px), iy = Math.floor(py), iz = Math.floor(pz);
    let fx = px - ix, fy = py - iy, fz = pz - iz;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
    const mix = (a, b, t) => a + (b - a) * t;
    const v = (dx, dy, dz) => lattice(ix + dx, iy + dy, iz + dz, seed);
    return mix(mix(mix(v(0, 0, 0), v(1, 0, 0), fx), mix(v(0, 1, 0), v(1, 1, 0), fx), fy),
        mix(mix(v(0, 0, 1), v(1, 0, 1), fx), mix(v(0, 1, 1), v(1, 1, 1), fx), fy), fz);
}

/** Five octaves of value noise, each twice as fine and half as strong */
export function fbm(px, py, pz, seed) {
    let value = 0, amplitude = 0.5;
    for (let octave = 0; octave < 5; octave++) {
        value += amplitude * valueNoise(px, py, pz, seed);
        px = px * 2.03 + 1.7; py = py * 2.03 + 9.2; pz = pz * 2.03 + 3.1;
        amplitude *= 0.5;
    }
    return value;
}

/**
 * The cloud field at a point, as the Gaia Engine draws clouds: noise warped by noise, carried by the winds and
 * slowly churning. { field, warp }, each blended from the two layers so its spread stays the same as they crossfade.
 */
export function cloudField(latitude, longitude, time, circulation, locked, seed) {
    const speed = wind(latitude, circulation, locked);
    let field = 0, warp = 0, weights = 0;
    for (let layer = 0; layer < 2; layer++) {
        const phase = time / layerDays + 0.5 * layer;
        const whole = Math.floor(phase);
        const age = phase - whole;
        const cycle = whole - Math.floor(whole / layerCycles) * layerCycles;
        const days = age * layerDays;
        const weight = 1 - Math.abs(2 * age - 1);
        const p = spherePoint(latitude, longitude - speed * days);
        const offset = random3(cycle, 64 + layer, (seed ^ 0x51ED270B) >>> 0);
        const qx = p[0] * 2.3 + offset[0] * 61 + days * 0.03;
        const qy = p[1] * 2.3 + offset[1] * 61 + days * 0.01;
        const qz = p[2] * 2.3 + offset[2] * 61 + days * 0.02;
        const w = fbm(qx * 1.6, qy * 1.6, qz * 1.6, seed);
        const c = fbm(qx * 2.6 + w * 1.9, qy * 2.6 + w * 1.9, qz * 2.6 + w * 1.9, (seed ^ 0x2C1B3C6D) >>> 0);
        field += weight * (c - fieldMean);
        warp += weight * (w - fieldMean);
        weights += weight * weight;
    }
    const spread = Math.sqrt(Math.max(weights, 1e-6));
    return { field: fieldMean + field / spread, warp: fieldMean + warp / spread };
}

/** Where a field value falls in the field's distribution, 0–1, so a share of the world can be clouded by threshold */
export function uniform(value) {
    const q = fieldQuantiles;
    if (value <= q[0]) return 0;
    for (let i = 1; i < q.length; i++) {
        if (value < q[i]) return (i - 1 + (value - q[i - 1]) / Math.max(q[i] - q[i - 1], 1e-6)) / (q.length - 1);
    }
    return 1;
}

/** What a point's cloud is made of: its place in the field, and the grain the storms and patches take from it */
export function cloudTexture(dir, time, circulation, locked, seed) {
    const latitude = Math.asin(Math.min(Math.max(dir[1], -1), 1));
    const longitude = Math.atan2(-dir[2], dir[0]) / tau;
    const { field, warp } = cloudField(latitude, longitude, time, circulation, locked, seed);
    const grain = saturate((warp - 0.25) / 0.5);
    return { latitude, swing: uniform(field), own: [1 - grain, grain, uniform(field)] };
}

export function life(time, days, offset) {
    const clock = (time + offset * days) / days;
    const cycle = Math.floor(clock);
    return { age: clock - cycle, cycle: Math.trunc(cycle % (period / days)), days: (clock - cycle) * days };
}

export function offsetFrom(centre, point) {
    let east = [centre[2], 0, -centre[0]];
    const el = Math.hypot(east[0], east[1], east[2]) || 1;
    east = east.map((v) => v / el);
    const north = [centre[1] * east[2] - centre[2] * east[1], centre[2] * east[0] - centre[0] * east[2],
        centre[0] * east[1] - centre[1] * east[0]];
    const z = dot(point, centre);
    return [Math.atan2(dot(point, east), z), Math.atan2(dot(point, north), z)];
}

export function cluster(point, centre, radius, stretch, a, b, own, strength) {
    const o = offsetFrom(centre, point);
    const offset = [o[0] * stretch, o[1]];
    const angle = Math.atan2(offset[1], offset[0]);
    const lobes = 1 + 0.3 * Math.sin(3 * angle + tau * b[2]) + 0.2 * Math.sin(5 * angle + tau * a[1] * 3);
    const distance = length2(offset) / Math.max(radius * lobes, 1e-4);
    // Its edge follows the cloud field's grain, so it frays the way the field's clouds do
    const member = smoothstep(0, 0.12, 1 - distance + 1.2 * (own[2] - 0.5));
    const thickness = 0.5 + 0.4 * own[1] + (distance < 0.5 ? 0.1 : 0);
    return { value: member * thickness * Math.min(strength * 3, 1), member, distance };
}

export const massEdge = (coverage) => 1 - 1.6 * coverage;

function lockedCloud(point, own, swing, time, settings, result) {
    const { coverage, circulation, seed } = settings;
    const around = Math.atan2(point[2], point[1]);
    const shape = random3(-3, -3, (seed ^ 0x3C6EF372) >>> 0);
    const lobes = 0.12 * Math.sin(3 * around + tau * shape[0] + rhythm(37) * time)
        + 0.08 * Math.sin(5 * around + tau * shape[1] - rhythm(23) * time);
    const facing = dot(point, substellar) + lobes + 0.1 * (own[0] - 0.5);
    const edge = massEdge(coverage);
    const mass = smoothstep(edge - 0.3, edge + 0.3, facing);
    const fringe = Math.exp(-Math.pow((facing - edge + 0.35) / 0.18, 2));
    const threshold = 1 - (0.97 * mass + 0.25 * coverage * fringe);
    let cloud = smoothstep(threshold - 0.15, threshold + 0.15, swing) * (0.35 + 0.25 * own[1] + 0.15 * mass);
    const reach = Math.max(edge, 0.2);
    for (let storm = 0; storm < convectiveStorms; storm++) {
        const slot = random3(storm, -2, (seed ^ 0x2545F491) >>> 0);
        const now = life(time, slot[0] < 0.5 ? 4 : 8, slot[1]);
        const a = random3(storm, now.cycle, (seed ^ 0x9E3779B1) >>> 0);
        const span = 0.5 + 0.45 * a[1];
        if (a[0] > 0.5 + 0.4 * circulation || now.age > span) continue;
        const strength = Math.sin(Math.PI * now.age / span);
        const b = random3(storm, now.cycle, (seed ^ 0x7FEB352D) >>> 0);
        const cosine = 1 + (reach - 1) * b[0];
        const sine = Math.sqrt(Math.max(1 - cosine * cosine, 0));
        const turn = tau * b[1];
        const centre = [substellar[0] * cosine, sine * Math.cos(turn), sine * Math.sin(turn)];
        const radius = (0.1 + 0.12 * b[2]) * (0.6 + 0.4 * strength);
        if (dot(point, centre) < Math.cos(Math.min(radius * 1.6, 1.5))) continue;
        const found = cluster(point, centre, radius, 1, a, b, own, strength);
        if (found.value > cloud) {
            cloud = found.value;
            result.storm = found.member;
            result.stormStrength = strength;
            result.stormCore = saturate(1 - found.distance);
        }
    }
    return cloud;
}

/**
 * The cloud at `dir` (a unit vector in the world's own space) when the weather clock reads `time`: { cloud, latitude,
 * storm, stormStrength, stormCore, patch, spiral }
 */
export function sampleClouds(dir, time, settings) {
    const { coverage, circulation, seed } = settings;
    const locked = settings.faceLocked;
    const { latitude, swing, own } = cloudTexture(dir, time, circulation, locked, seed);
    const result = { cloud: 0, latitude, storm: 0, stormStrength: 0, stormCore: 0, patch: own[1], spiral: null };
    const share = coverage * (1 - 0.8 * circulation);
    if (locked) {
        result.cloud = saturate(lockedCloud(dir, own, swing, time, settings, result));
        return result;
    }
    const threshold = 1 - share - circulation * climate(latitude);
    let cloud = smoothstep(threshold - 0.15, threshold + 0.15, swing) * (0.45 + 0.35 * own[1]);
    const spread = Math.sqrt(Math.max(coverage - share, 0) / 0.2);
    for (let storm = 0; storm < storms; storm++) {
        const slot = random3(storm, -1, (seed ^ 0x9E3779B9) >>> 0);
        const now = life(time, slot[0] < 0.5 ? 8 : 16, slot[1]);
        const a = random3(storm, now.cycle, (seed ^ 0x85EBCA6B) >>> 0);
        const span = 0.5 + 0.45 * a[1];
        if (a[0] > 0.45 + 0.5 * circulation || now.age > span) continue;
        const strength = Math.sin(Math.PI * now.age / span);
        const b = random3(storm, now.cycle, (seed ^ 0xC2B2AE35) >>> 0);
        let degrees = b[0] < 0.3 ? 14 * b[1] : (b[0] < 0.4 ? 15 + 15 * b[1] : 35 + 28 * b[1]);
        degrees = Math.asin(b[1]) * 57.29578 * 0.9 * (1 - circulation) + degrees * circulation;
        const latitude = (a[2] < 0.5 ? -1 : 1) * degrees / 57.29578;
        const centre = spherePoint(latitude, b[2] + wind(latitude, circulation) * now.days);
        const radius = (0.12 + 0.18 * fract(b[1] * 13 + b[2])) * spread * (0.6 + 0.4 * strength);
        if (dot(dir, centre) < Math.cos(Math.min(radius * 1.6, 1.5))) continue;
        const found = cluster(dir, centre, radius, 0.65, a, b, own, strength);
        if (found.value > cloud) {
            cloud = found.value;
            result.storm = found.member;
            result.stormStrength = strength;
            result.stormCore = saturate(1 - found.distance);
        }
    }
    for (let index = 0; index < spirals; index++) {
        const spiral = activeSpiral(index, time, settings);
        if (!spiral || dot(dir, spiral.centre) < Math.cos(spiral.radius)) continue;
        const { tropical, hemisphere } = spiral;
        const offset = offsetFrom(spiral.centre, dir);
        const distance = length2(offset) / spiral.radius;
        const angle = Math.atan2(offset[1], offset[0]);
        const winding = hemisphere * (tropical ? 2.2 : 2.0);
        const turn = hemisphere * spiral.days * 1.5;
        const arm = Math.cos(2 * (angle + winding * Math.log(Math.max(distance, 0.02))) - turn);
        const core = tropical ? 1.2 : 0.9;
        const band = smoothstep(0.1, 0.5, arm + core * (1 - distance) - 0.35 + 0.4 * (own[0] - 0.5));
        const eye = tropical ? smoothstep(0.08, 0.14, distance) : 1;
        const thickness = band * eye * (0.7 + 0.3 * saturate(1 - distance));
        const hold = smoothstep(1, 0.75, distance) * Math.min(spiral.strength * 2.5, 1);
        cloud = cloud + (thickness - cloud) * hold;
        if (hold > 0) {
            result.spiral = { tropical, strength: spiral.strength, distance, centre: spiral.centre, radius: spiral.radius,
                hemisphere, hold };
        }
    }
    result.cloud = saturate(cloud);
    return result;
}

/** Spiral storm `index` of the shader's few, if it's under way when the weather clock reads `time` */
export function activeSpiral(index, time, settings) {
    if (settings.faceLocked) return null;
    const { circulation, seed } = settings;
    const tropical = index < 2;
    const chance = tropical ? 0.18 * settings.hurricanes : 0.3 * saturate((circulation - 0.45) / 0.5);
    const now = life(time, 16, random3(index, -1, (seed ^ 0x68E31DA4) >>> 0)[0]);
    const a = random3(index, now.cycle, (seed ^ 0xB5297A4D) >>> 0);
    const span = 0.4 + 0.3 * a[1];
    if (a[0] >= chance || now.age > span) return null;
    const strength = Math.sin(Math.PI * now.age / span);
    const b = random3(index, now.cycle, (seed ^ 0x1B873593) >>> 0);
    const hemisphere = a[2] < 0.5 ? -1 : 1;
    const degrees = tropical ? 10 + 10 * b[0] + 0.4 * now.days : 40 + 18 * b[0];
    const latitude = hemisphere * degrees / 57.29578;
    const centre = spherePoint(latitude, b[2] + wind(latitude, circulation) * now.days);
    const radius = (tropical ? 0.26 + 0.06 * b[1] : 0.3 + 0.1 * b[1]) * (0.6 + 0.4 * strength);
    return { tropical, strength, centre, radius, hemisphere, days: now.days };
}

// MARK: the weather clock

/** Simulated days of weather so far; the shader sees it wrapped at `period` */
export const WeatherClock = {
    days: 0,
    /** The weather follows the simulation clock, but no faster than two simulated days a second */
    maximumRate: 2 * 86400,
    get time() {
        return this.days - Math.floor(this.days / period) * period;
    },
};
