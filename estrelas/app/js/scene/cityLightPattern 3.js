//
//  cityLightPattern.js
//  Estrelas (web)
//
//  Draws the lights of one city as seen from orbit at night: a ragged, many-lobed core glowing white-gold, highways
//  running out from it strung with lights and the towns along them, satellite towns and villages scattered about and
//  linked by fainter roads, a dust of tiny lights over the countryside, and a soft halo of scattered light. Every city
//  gets its own pattern, drawn from a seed, so neighbours never look alike and a city always looks the same.
//  A port of CityLightPattern.swift, rolling the same SplitMix64 sequence.
//

import { out, add, mixState, GOLDEN, split, stableHash } from '../surface/u64.js';
import { spherePoint, cloudAltitude } from '../surface/surfaceMap.js';

/** Pixels across the square the pattern is drawn in; the city fills the circle inside it */
export const size = 256;

const scales = {
    capital: { highways: 9, satellites: 34, core: 0.2, specks: 9000 },
    city: { highways: 7, satellites: 22, core: 0.17, specks: 6000 },
    town: { highways: 5, satellites: 10, core: 0.14, specks: 2500 },
    village: { highways: 3, satellites: 4, core: 0.12, specks: 900 },
};

/** A stable seed from a place's identifier, the same on every launch */
export function seedFor(id) {
    return stableHash(id);
}

/**
 * How brightly each pixel of the `size` square is lit: the city's whole layout. The same for the same seed, so its
 * lights by night and its streets and fields by day lie in just the same places.
 */
function lightField(seed, kind, isElectric) {
    let [hi, lo] = split(BigInt(seed) | 1n);
    const next = () => {
        add(hi, lo, GOLDEN[0], GOLDEN[1]);
        hi = out.hi; lo = out.lo;
        mixState(hi, lo);
        // The top 24 bits
        return (out.hi >>> 8) / 16777216;
    };
    const random = (low, high) => low + (high - low) * next();

    const light = new Float32Array(size * size);
    const pixel = 2 / size;

    const splat = (px, py, radius, intensity) => {
        const sigma = Math.max(radius, pixel * 0.6);
        const reach = Math.ceil(sigma * 3 / pixel);
        const cx = Math.trunc((px + 1) / pixel), cy = Math.trunc((py + 1) / pixel);
        if (cx + reach < 0 || cx - reach >= size || cy + reach < 0 || cy - reach >= size) return;
        for (let y = Math.max(cy - reach, 0); y <= Math.min(cy + reach, size - 1); y++) {
            for (let x = Math.max(cx - reach, 0); x <= Math.min(cx + reach, size - 1); x++) {
                const qx = (x + 0.5) * pixel - 1, qy = (y + 0.5) * pixel - 1;
                const d2 = ((qx - px) ** 2 + (qy - py) ** 2) / (sigma * sigma);
                if (d2 < 9) light[y * size + x] += intensity * Math.exp(-d2);
            }
        }
    };
    const speck = (px, py, intensity) => {
        const x = Math.trunc((px + 1) / pixel), y = Math.trunc((py + 1) / pixel);
        if (x < 0 || y < 0 || x >= size || y >= size) return;
        light[y * size + x] += intensity;
    };
    const road = (ax, ay, bx, by, intensity) => {
        const length = Math.hypot(bx - ax, by - ay);
        const steps = Math.max(Math.trunc(length / (pixel * 0.7)), 1);
        let sx = ay - by + 1e-6, sy = bx - ax + 1e-6;
        const sl = Math.hypot(sx, sy);
        sx /= sl; sy /= sl;
        for (let k = 0; k <= steps; k++) {
            const px = ax + (bx - ax) * k / steps, py = ay + (by - ay) * k / steps;
            splat(px, py, pixel * 0.5, intensity * 0.12);
            if (next() < 0.5) speck(px, py, intensity * random(0.5, 1.4));
            if (next() < 0.08) {
                const offset = random(-4, 4) * pixel;
                speck(px + sx * offset, py + sy * offset, intensity * random(0.3, 0.9));
            }
        }
    };
    const town = (px, py, radius, intensity) => {
        splat(px, py, radius, intensity);
        splat(px, py, radius * 2.2, intensity * 0.1);
        for (let i = 0, n = Math.trunc(radius * 2200); i < n; i++) {
            const angle = random(0, 2 * Math.PI), distance = radius * 2.6 * Math.pow(next(), 0.7);
            speck(px + Math.cos(angle) * distance, py + Math.sin(angle) * distance, random(0.25, 0.8) * intensity);
        }
        for (let i = 0, n = Math.trunc(random(1, 3.9)); i < n; i++) {
            const angle = random(0, 2 * Math.PI), length = radius * random(2, 4.5);
            road(px, py, px + Math.cos(angle) * length, py + Math.sin(angle) * length, 0.35 * intensity);
        }
    };

    const scale = scales[kind] ?? scales.village;
    // Before electric light, streets are dark and only the centre's lamps and fires show from orbit
    const reach = isElectric ? 1 : 0.45;

    // The core: a bright, ragged blob with several lobes, and a broad halo of scattered light
    const lobes = [];
    for (let frequency = 2; frequency <= 6; frequency++) {
        const amplitude = random(0.1, 0.5) / Math.sqrt(frequency);
        lobes.push({ amplitude, frequency, phase: random(0, 2 * Math.PI) });
    }
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const px = (x + 0.5) * pixel - 1, py = (y + 0.5) * pixel - 1;
            const r = Math.hypot(px, py), angle = Math.atan2(py, px);
            let shape = 1;
            for (const lobe of lobes) shape += lobe.amplitude * Math.sin(lobe.frequency * angle + lobe.phase);
            const radius = scale.core * Math.max(shape, 0.35);
            const grain = 0.65 + 0.35 * next();
            light[y * size + x] += 1.7 * grain * Math.exp(-((r / radius) ** 2) * 2)
                + 0.14 * Math.exp(-((r / (scale.core * 2.2)) ** 2));
        }
    }

    // Districts bulging out of the core
    for (let i = 0, n = Math.trunc(random(2, 5.9)); i < n; i++) {
        const angle = random(0, 2 * Math.PI), distance = scale.core * random(0.4, 1.1);
        const k = distance * Math.sqrt(reach);
        splat(Math.cos(angle) * k, Math.sin(angle) * k, scale.core * random(0.25, 0.5), random(0.4, 0.8));
    }

    // Highways, strung with lights and the towns along them
    const roadside = [[0, 0]];
    const firstAngle = random(0, 2 * Math.PI);
    for (let index = 0; index < scale.highways; index++) {
        const heading = firstAngle + index / scale.highways * 2 * Math.PI + random(-0.35, 0.35);
        const length = random(0.55, 0.98) * reach;
        const bend = random(-0.22, 0.22), wiggle = random(2, 5), wigglePhase = random(0, 2 * Math.PI);
        let t = scale.core * 0.5;
        let previous = [Math.cos(heading) * t, Math.sin(heading) * t];
        while (t < length) {
            t += pixel * 0.8;
            const angle = heading + bend * t + 0.02 * Math.sin(t * wiggle * 6 + wigglePhase);
            const point = [Math.cos(angle) * t, Math.sin(angle) * t];
            const busy = 1 - 0.7 * t / Math.max(length, 0.01);
            road(previous[0], previous[1], point[0], point[1], 0.75 * busy);
            if (t < scale.core * 2.6 && next() < 0.5) {
                const side = random(-1, 1) * 0.05 * (1 - t / (scale.core * 2.6));
                speck(point[0] - Math.sin(angle) * side, point[1] + Math.cos(angle) * side, random(0.3, 0.9));
            }
            if (next() < 0.006) town(point[0], point[1], random(0.008, 0.022), random(0.6, 1.1) * busy);
            if (next() < 0.02) roadside.push(point);
            previous = point;
        }
    }

    // Towns and villages round about, most on a road to the nearest highway or the city
    for (let i = 0, n = Math.trunc(scale.satellites * reach); i < n; i++) {
        const angle = random(0, 2 * Math.PI);
        const distance = scale.core * 1.4 + (0.92 * reach - scale.core * 1.4) * Math.pow(next(), 0.85);
        const px = Math.cos(angle) * distance, py = Math.sin(angle) * distance;
        const near = 1 - distance;
        town(px, py, random(0.006, 0.02) * (0.6 + 0.6 * near), random(0.45, 1) * (0.6 + 0.5 * near));
        if (isElectric && next() < 0.6) {
            let link = null, linkDistance = Infinity;
            for (const point of roadside) {
                const d = Math.hypot(point[0] - px, point[1] - py);
                if (d < linkDistance) { link = point; linkDistance = d; }
            }
            if (link && linkDistance < 0.3) road(px, py, link[0], link[1], 0.3);
        }
    }

    // A sparse dust of tiny lights, thickest near the city
    for (let i = 0, n = Math.trunc(scale.specks * reach * 0.35); i < n; i++) {
        const angle = random(0, 2 * Math.PI);
        const distance = reach * Math.min(-Math.log(Math.max(next(), 1e-4)) * 0.3, 1);
        speck(Math.cos(angle) * distance, Math.sin(angle) * distance, random(0.15, 0.7));
    }

    return light;
}

/** RGBA colour pixels (opaque) and RGBA opacity pixels (grey), each `size` square; `seed` is a BigInt */
export function cityLightPixels(seed, kind, isElectric) {
    const light = lightField(seed, kind, isElectric);
    const pixel = 2 / size;
    // To colour and opacity: white-gold where it's brightest, deepening to amber at the fringes
    const fringe = isElectric ? [1, 0.6, 0.2] : [1, 0.42, 0.12];
    const heart = isElectric ? [1, 0.95, 0.8] : [1, 0.72, 0.38];
    const color = new Uint8Array(size * size * 4).fill(255);
    const opacity = new Uint8Array(size * size * 4).fill(255);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const px = (x + 0.5) * pixel - 1, py = (y + 0.5) * pixel - 1;
            const r = Math.hypot(px, py);
            const edge = Math.min(Math.max((1 - r) / 0.16, 0), 1);
            const value = light[y * size + x] * edge * edge * (3 - 2 * edge);
            const alpha = 1 - Math.exp(-1.7 * value);
            const mix = Math.min(Math.max((value - 0.45) / 1.1, 0), 1);
            const index = (y * size + x) * 4;
            for (let c = 0; c < 3; c++) color[index + c] = Math.trunc((fringe[c] + (heart[c] - fringe[c]) * mix) * 255);
            const a = Math.trunc(Math.min(Math.max(alpha, 0), 1) * 255);
            opacity[index] = opacity[index + 1] = opacity[index + 2] = a;
        }
    }
    return { color, opacity };
}

// MARK: by day

/** How the farmland round a settlement is laid out for its era: 'patchwork', 'squares' or 'circles'; null before farming */
export function fieldStyle(era, seed) {
    switch (era) {
        case 'stoneAge': return null;
        case 'bronzeIron': case 'medieval': case 'earlyModern': return 'patchwork';
        case 'industrial': case 'electrical': return 'squares';
        default: return Number((BigInt.asUintN(64, BigInt(seed)) >> 17n) % 5n) < 2 ? 'circles' : 'squares';
    }
}

/** Angular radius on the globe of a settlement's lights and ground, in degrees */
export function spreadOf(kind) {
    return { capital: 9, city: 6.5, town: 4 }[kind] ?? 2.5;
}

/** Texels to a degree of the globe in a settlement's ground by day */
export const dayTexelsPerDegree = 40;
/** A field's side on the ground, in degrees, before it's varied */
export const fieldDegrees = 0.16;

/** Pixels across a settlement's ground by day */
export function daySize(kind) {
    return Math.round(2 * spreadOf(kind) * dayTexelsPerDegree);
}

/**
 * RGBA colour and opacity pixels of the settlement as seen from orbit by day, `daySize` square, over the same layout
 * as its lights: grey built-up ground, threads of road, and fields round it. `landHeight(x, y)` gives the land's height
 * above the sea (0 shore to 1 peaks) at a point of the pattern (−1…1 each way); no fields in the mountains or at sea.
 */
export function dayPixels(seed, kind, isElectric, fields, landHeight = null) {
    const light = lightField(seed, kind, isElectric);
    const lightSize = size;
    const daySide = daySize(kind);
    const pixel = 2 / daySide;
    const degreesPerPixel = 2 * spreadOf(kind) / daySide;
    const [saltHi, saltLo] = split(BigInt.asUintN(64, BigInt(seed) ^ 0xF1E1D5F1E1D5n));
    // A whole number (|n| < 2⁵³) as the halves of its 64-bit two's complement
    const hiOf = (n) => Math.floor(n / 4294967296) >>> 0;
    const hash = (i, j, k = 0) => {
        const a = i * 73856093, b = j * 19349663, c = k * 83492791;
        const mixedHi = (hiOf(a) ^ hiOf(b) ^ hiOf(c)) >>> 0, mixedLo = ((a >>> 0) ^ (b >>> 0) ^ (c >>> 0)) >>> 0;
        add(saltHi, saltLo, mixedHi, mixedLo);
        mixState(out.hi, out.lo);
        return (out.hi >>> 8) / 16777216;
    };
    const smoothNoise = (dx, dy, scale, k) => {
        const qx = dx / scale, qy = dy / scale;
        const i = Math.floor(qx), j = Math.floor(qy);
        let fx = qx - i, fy = qy - j;
        fx = fx * fx * (3 - 2 * fx);
        fy = fy * fy * (3 - 2 * fy);
        const top = hash(i, j, k) * (1 - fx) + hash(i + 1, j, k) * fx;
        const bottom = hash(i, j + 1, k) * (1 - fx) + hash(i + 1, j + 1, k) * fx;
        return top * (1 - fy) + bottom * fy;
    };
    const lit = (px, py) => {
        const x = Math.min(Math.max((px + 1) / 2 * lightSize - 0.5, 0), lightSize - 1);
        const y = Math.min(Math.max((py + 1) / 2 * lightSize - 0.5, 0), lightSize - 1);
        const x0 = Math.trunc(x), y0 = Math.trunc(y);
        const x1 = Math.min(x0 + 1, lightSize - 1), y1 = Math.min(y0 + 1, lightSize - 1);
        const fx = x - x0, fy = y - y0;
        const top = light[y0 * lightSize + x0] * (1 - fx) + light[y0 * lightSize + x1] * fx;
        const bottom = light[y1 * lightSize + x0] * (1 - fx) + light[y1 * lightSize + x1] * fx;
        return top * (1 - fy) + bottom * fy;
    };

    // The land's height on a coarse grid a quarter of a degree apart, and how broken it is round each point
    const step = 0.25;
    const grid = Math.ceil(2 * spreadOf(kind) / step) + 1;
    const heights = new Float32Array(grid * grid);
    if (landHeight) {
        for (let j = 0; j < grid; j++) {
            for (let i = 0; i < grid; i++) heights[j * grid + i] = landHeight(i / (grid - 1) * 2 - 1, j / (grid - 1) * 2 - 1);
        }
    }
    const roughness = new Float32Array(grid * grid);
    for (let j = 0; j < grid; j++) {
        for (let i = 0; i < grid; i++) {
            let low = Infinity, high = -Infinity;
            for (let dj = -1; dj <= 1; dj++) {
                for (let di = -1; di <= 1; di++) {
                    const h = Math.max(heights[Math.min(Math.max(j + dj, 0), grid - 1) * grid + Math.min(Math.max(i + di, 0), grid - 1)], 0);
                    low = Math.min(low, h);
                    high = Math.max(high, h);
                }
            }
            roughness[j * grid + i] = high - low;
        }
    }
    const terrain = (px, py) => {
        const x = (px + 1) / 2 * (grid - 1), y = (py + 1) / 2 * (grid - 1);
        const x0 = Math.min(Math.trunc(x), grid - 2), y0 = Math.min(Math.trunc(y), grid - 2);
        const fx = x - x0, fy = y - y0;
        const mix = (values) => {
            const a = values[y0 * grid + x0], b = values[y0 * grid + x0 + 1];
            const c = values[(y0 + 1) * grid + x0], d = values[(y0 + 1) * grid + x0 + 1];
            return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
        };
        return [mix(heights), mix(roughness)];
    };

    const angle = hash(-1, -1) * Math.PI / 2;
    const cosine = Math.cos(angle), sine = Math.sin(angle);
    const placeScale = 0.75 + 0.6 * hash(-2, -2);
    const terracing = hash(-3, -3) < 0.3;
    const farmland = { capital: 0.85, city: 0.8, town: 0.7 }[kind] ?? 0.55;
    const crops = [[0.36, 0.48, 0.24], [0.44, 0.54, 0.28], [0.62, 0.58, 0.36], [0.5, 0.42, 0.3], [0.4, 0.5, 0.26],
        [0.56, 0.56, 0.34]];

    const color = new Uint8Array(daySide * daySide * 4).fill(255);
    const opacity = new Uint8Array(daySide * daySide * 4).fill(255);
    for (let y = 0; y < daySide; y++) {
        for (let x = 0; x < daySide; x++) {
            const px = (x + 0.5) * pixel - 1, py = (y + 0.5) * pixel - 1;
            const r = Math.hypot(px, py);
            const edge = Math.min(Math.max((1 - r) / 0.16, 0), 1);
            const value = lit(px, py);
            const dx = x * degreesPerPixel, dy = y * degreesPerPixel;
            let field = [0, 0, 0], fieldAlpha = 0;
            const [height, rough] = terrain(px, py);
            const mountain = height > 0.45 || rough > 0.14;
            const wet = landHeight !== null && height <= 0;
            if (fields && r < farmland && !mountain && !wet) {
                const hilly = rough > 0.05 || height > 0.15;
                const districtX = (dx * cosine + dy * sine) / 1.5, districtY = (dy * cosine - dx * sine) / 1.5;
                const regional = 0.7 + 0.7 * hash(Math.floor(districtX), Math.floor(districtY), 11);
                const fieldSize = fieldDegrees * placeScale * regional * (hilly ? 0.6 : 1) / degreesPerPixel;
                let u = (x * cosine + y * sine) / fieldSize;
                let v = (y * cosine - x * sine) / fieldSize;
                if (hilly) {
                    u += 0.9 * (smoothNoise(dx, dy, 0.35, 2) - 0.5);
                    v += 0.9 * (smoothNoise(dx, dy, 0.35, 3) - 0.5);
                }
                const i = Math.floor(u), j = Math.floor(v);
                const fu = u - i, fv = v - j;
                const farmed = hash(i, j) < 0.95 * (1 - Math.pow(r / farmland, 2.5));
                if (farmed) {
                    const crop = crops[Math.trunc(hash(j, i) * crops.length) % crops.length];
                    const dim = (k) => crop.map((c) => c * k);
                    if (hilly && terracing) {
                        const band = (height * 70) % 1;
                        field = band < 0.3 ? dim(0.72) : crop;
                        fieldAlpha = 0.55;
                    } else if (hilly || fields === 'patchwork') {
                        const lane = 0.16;
                        const edgeOfField = fu < lane || fv < lane;
                        field = edgeOfField ? dim(0.75) : crop;
                        fieldAlpha = edgeOfField ? 0.35 : 0.48;
                    } else if (fields === 'circles') {
                        if (Math.hypot(fu - 0.5, fv - 0.5) < 0.47) {
                            field = crop;
                            fieldAlpha = 0.62;
                        } else {
                            field = [0.6, 0.53, 0.4];
                            fieldAlpha = 0.18;
                        }
                    } else {
                        const edgeOfField = fu < 0.1 || fv < 0.1;
                        field = edgeOfField ? dim(0.75) : crop;
                        fieldAlpha = edgeOfField ? 0.35 : 0.6;
                    }
                }
            }
            const built = Math.min(Math.max((value - 0.45) / 0.9, 0), 1);
            const thread = Math.min(Math.max((value - 0.06) / 0.3, 0), 1) * 0.3;
            const grain = 0.9 + 0.2 * hash(x, y, 7);
            const t = Math.min(Math.max((value - 0.8) / 1.2, 0), 1);
            const grey = [0.58 + (0.42 - 0.58) * t, 0.57 + (0.42 - 0.57) * t, 0.54 + (0.42 - 0.54) * t].map((c) => c * grain);
            const builtAlpha = Math.max(Math.pow(built, 0.6) * 0.92, thread);
            const alpha = builtAlpha + fieldAlpha * (1 - builtAlpha);
            const tint = alpha > 0
                ? grey.map((g, c) => (g * builtAlpha + field[c] * fieldAlpha * (1 - builtAlpha)) / alpha) : grey;
            const shown = alpha * edge * edge * (3 - 2 * edge);
            const index = (y * daySide + x) * 4;
            for (let c = 0; c < 3; c++) color[index + c] = Math.trunc(Math.min(Math.max(tint[c], 0), 1) * 255);
            const a = Math.trunc(Math.min(Math.max(shown, 0), 1) * 255);
            opacity[index] = opacity[index + 1] = opacity[index + 2] = a;
        }
    }
    return { color, opacity, size: daySide };
}

/**
 * Where a point of a settlement's patch (−1…1 each way, as its day pixels are laid out: x along a row, y down the rows)
 * lies on its world, as a unit vector [x, y, z]
 */
export function patchPoint(latitude, longitude, kind) {
    const site = spherePoint(latitude * Math.PI / 180, longitude * Math.PI / 180);
    const lift = 1 + cloudAltitude * 0.86;
    const position = site.map((c) => c * lift);
    // The rotation taking +y to the site, by Rodrigues' formula about y × site
    const ax = site[2], az = -site[0];
    const sine = Math.hypot(ax, az), cosine = site[1];
    const rotate = (v) => {
        if (sine < 1e-9) return cosine >= 0 ? v : [v[0], -v[1], -v[2]];
        const kx = ax / sine, kz = az / sine;
        // k · v and k × v with k = (kx, 0, kz)
        const kv = kx * v[0] + kz * v[2];
        const cx = -kz * v[1], cy = kz * v[0] - kx * v[2], cz = kx * v[1];
        return [v[0] * cosine + cx * sine + kx * kv * (1 - cosine), v[1] * cosine + cy * sine,
            v[2] * cosine + cz * sine + kz * kv * (1 - cosine)];
    };
    const scale = spreadOf(kind) * Math.PI / 180;
    return (x, y) => {
        const r = rotate([x, 0, y]);
        const p = [position[0] + r[0] * scale, position[1] + r[1] * scale, position[2] + r[2] * scale];
        const l = Math.hypot(p[0], p[1], p[2]);
        return [p[0] / l, p[1] / l, p[2] / l];
    };
}
