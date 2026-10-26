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
export const rows = 90;
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

export function rowCells(row) {
    const latitude = -Math.PI / 2 + (row + 0.5) * rowHeight;
    return Math.max(3, Math.round(2 * rows * Math.cos(latitude)));
}

export function nearestCell(dir, time, circulation, locked, seed) {
    const latitude = Math.asin(Math.min(Math.max(dir[1], -1), 1));
    const longitude = Math.atan2(-dir[2], dir[0]) / tau;
    const home = Math.min(Math.max(Math.floor((latitude + Math.PI / 2) / rowHeight), 0), rows - 1);
    let best = { centre: [0, 1, 0], latitude: 0, row: home, index: 0 };
    let nearest = -2;
    for (let row = Math.max(home - 1, 0); row <= Math.min(home + 1, rows - 1); row++) {
        const rowLatitude = -Math.PI / 2 + (row + 0.5) * rowHeight;
        const count = rowCells(row);
        const speed = Math.round(wind(rowLatitude, circulation, locked) * period) / period;
        const shift = fract(speed * time);
        const middle = Math.floor((longitude - shift) * count);
        for (let step = -2; step <= 2; step++) {
            const index = (((middle + step) % count) + count) % count;
            const jitter = random3(row, index, (seed ^ 0x27D4EB2F) >>> 0).map((v) => v - 0.5);
            const cellLatitude = rowLatitude + 0.8 * jitter[1] * rowHeight;
            const cellLongitude = (index + 0.5 + 0.8 * jitter[0]) / count + shift;
            const centre = spherePoint(cellLatitude, cellLongitude);
            const closeness = dot(dir, centre);
            if (closeness > nearest) {
                nearest = closeness;
                best = { centre, latitude: cellLatitude, row, index };
            }
        }
    }
    return best;
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
    const member = smoothstep(0, 0.12, 1 - distance + 0.5 * (own[2] - 0.5));
    const thickness = 0.6 + 0.3 * own[1] + (distance < 0.5 ? 0.1 : 0);
    return { value: member * thickness * Math.min(strength * 3, 1), member, distance };
}

export const massEdge = (coverage) => 1 - 1.6 * coverage;

function lockedCloud(cell, own, swing, time, settings, result) {
    const { coverage, circulation, seed } = settings;
    const around = Math.atan2(cell.centre[2], cell.centre[1]);
    const shape = random3(-3, -3, (seed ^ 0x3C6EF372) >>> 0);
    const lobes = 0.12 * Math.sin(3 * around + tau * shape[0] + rhythm(37) * time)
        + 0.08 * Math.sin(5 * around + tau * shape[1] - rhythm(23) * time);
    const facing = dot(cell.centre, substellar) + lobes + 0.1 * (own[0] - 0.5);
    const edge = massEdge(coverage);
    const mass = smoothstep(edge - 0.3, edge + 0.3, facing);
    const fringe = Math.exp(-Math.pow((facing - edge + 0.35) / 0.18, 2));
    const threshold = 1 - (0.97 * mass + 0.25 * coverage * fringe);
    let cloud = smoothstep(threshold, threshold + 0.08, swing) * (0.35 + 0.25 * own[1] + 0.15 * mass);
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
        if (dot(cell.centre, centre) < Math.cos(Math.min(radius * 1.6, 1.5))) continue;
        const found = cluster(cell.centre, centre, radius, 1, a, b, own, strength);
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
    const cell = nearestCell(dir, time, circulation, locked, seed);
    const own = random3(cell.row, cell.index, (seed ^ 0x165667B1) >>> 0);
    const result = { cloud: 0, latitude: cell.latitude, storm: 0, stormStrength: 0, stormCore: 0,
        patch: fract(own[0] * 31 + own[2] * 17), spiral: null };
    const share = coverage * (1 - 0.8 * circulation);
    const swing = 1 - Math.abs(2 * fract(rhythm(3 + 6 * own[0]) * time / tau + own[2]) - 1);
    if (locked) {
        result.cloud = saturate(lockedCloud(cell, own, swing, time, settings, result));
        return result;
    }
    const threshold = 1 - share - circulation * climate(cell.latitude);
    let cloud = smoothstep(threshold, threshold + 0.08, swing) * (0.45 + 0.35 * own[1]);
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
        if (dot(cell.centre, centre) < Math.cos(Math.min(radius * 1.6, 1.5))) continue;
        const found = cluster(cell.centre, centre, radius, 0.65, a, b, own, strength);
        if (found.value > cloud) {
            cloud = found.value;
            result.storm = found.member;
            result.stormStrength = strength;
            result.stormCore = saturate(1 - found.distance);
        }
    }
    for (let index = 0; index < spirals; index++) {
        const spiral = activeSpiral(index, time, settings);
        if (!spiral || dot(cell.centre, spiral.centre) < Math.cos(spiral.radius)) continue;
        const { tropical, hemisphere } = spiral;
        const offset = offsetFrom(spiral.centre, cell.centre);
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
