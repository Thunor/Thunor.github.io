//
//  biomeSurface.js
//  Estrelas (web)
//
//  Climate-driven surfaces for rocky worlds with seas: oceans and lakes, rivers along the edges between cells,
//  temperature and moisture spreading between neighbours, and Whittaker's biomes. The climate is worked out once on
//  a fixed set of cells; finer cells take theirs from the climate cell they fall in. A port of BiomeSurface.swift.
//

import {
    color as surfaceColor, elevation as elevationAt, detailNoise, seaLevel as seaLevelFor, mixColor, shaded,
    climateSubdivisions, cloudAltitude, coldness, fbm, seaIce, snow, detailedOctaves,
} from './surfaceMap.js';
import { cells, icosphere, NearestSite } from './voronoiSurface.js';
import { out, addSmall } from './u64.js';
import { templateElevation, templateIce, templateAridity, templateGreenery } from './surfaceTemplate.js';

const MASK64 = (1n << 64n) - 1n;
const f32 = Math.fround;

export const riverColor = [0.2, 0.44, 0.68];
const lakeColor = [0.16, 0.4, 0.62];
export const Terrain = { land: 0, ocean: 1, lake: 2 };

/** The tallest relief, as a fraction of the planet's radius: kept under the cloud layer */
export const maximumRelief = f32(cloudAltitude * f32(0.8));

/**
 * Colours, relief and rivers for cells at `sites` (flat Float64Array), which may be the globe's cells or the detailed
 * map's finer ones. `style` must be prepared.
 */
export function biomeSurface(style, sites, triangles, detailOctaves, minimumCraterRadius, progress) {
    const sea = seaLevelFor(style, icosphere);
    const climate = new Climate(style, sea);
    const count = sites.length / 3;
    const lookup = count === climate.count ? null : new NearestSite(climate.sites);
    const ground = { ...style, waterFraction: 0, iceCapLatitude: 90, vegetation: false };

    const colors = new Float64Array(count * 3);
    const wet = new Uint8Array(count);
    for (let index = 0; index < count; index++) {
        const px = sites[index * 3], py = sites[index * 3 + 1], pz = sites[index * 3 + 2];
        const cell = lookup ? lookup.nearest(px, py, pz) : index;
        const [c, isWet] = cellColor(px, py, pz, cell, climate, style, ground, sea, detailOctaves, minimumCraterRadius);
        colors[index * 3] = c[0]; colors[index * 3 + 1] = c[1]; colors[index * 3 + 2] = c[2];
        wet[index] = isWet ? 1 : 0;
        if (progress && (index & 8191) === 0) progress(0.1 + 0.8 * index / count);
    }
    const rivers = riverEdges(climate, sites, triangles, wet);
    return { colors, heights: reliefHeights(style, sites, sea), rivers, wet };
}

/**
 * The colours of cells `start..<end` of `sites`, and whether each is water, so a detailed map's cells can be coloured
 * by several workers at once. The same values biomeSurface gives them.
 */
export function biomeCellColors(style, sites, start, end, detailOctaves, minimumCraterRadius, progress) {
    const sea = seaLevelFor(style, icosphere);
    const climate = new Climate(style, sea);
    const count = sites.length / 3;
    const lookup = count === climate.count ? null : new NearestSite(climate.sites);
    const ground = { ...style, waterFraction: 0, iceCapLatitude: 90, vegetation: false };
    const colors = new Float64Array((end - start) * 3);
    const wet = new Uint8Array(end - start);
    for (let index = start; index < end; index++) {
        const px = sites[index * 3], py = sites[index * 3 + 1], pz = sites[index * 3 + 2];
        const cell = lookup ? lookup.nearest(px, py, pz) : index;
        const [c, isWet] = cellColor(px, py, pz, cell, climate, style, ground, sea, detailOctaves, minimumCraterRadius);
        const k = (index - start) * 3;
        colors[k] = c[0]; colors[k + 1] = c[1]; colors[k + 2] = c[2];
        wet[index - start] = isWet ? 1 : 0;
        if (progress && (index & 8191) === 0) progress((index - start) / (end - start));
    }
    return { colors, wet };
}

/** The rivers along cell edges, once every cell is known to be wet or dry */
export function biomeRivers(style, sites, triangles, wet) {
    const climate = new Climate(style, seaLevelFor(style, icosphere));
    return riverEdges(climate, sites, triangles, wet);
}

function cellColor(px, py, pz, cell, climate, style, ground, sea, detailOctaves, minimumCraterRadius) {
    // Height is the point's own, so the detailed map keeps its finer coastlines and mountain ridges
    const elevation = terrainHeight(style, px, py, pz, sea, detailOctaves);
    const detail = detailNoise(style, px, py, pz, detailOctaves);
    const temperature = climate.temperature[cell];
    const frozen = temperature < 0;
    if (elevation < sea) {
        // Frozen seas are sea ice, not snow
        if (frozen) return [seaIce(style, px, py, pz, detailOctaves), true];
        if (climate.terrain[cell] === Terrain.lake) return [lakeColor, true];
        const depth = elevation / Math.max(sea, 0.0001);
        return [mixColor([0.04, 0.12, 0.32], [0.12, 0.34, 0.58], depth * depth), true];
    }
    if (climate.terrain[cell] === Terrain.lake) return [frozen ? seaIce(style, px, py, pz, detailOctaves) : lakeColor, true];
    return [landColor(px, py, pz, cell, climate, style, ground, sea, elevation, detail, detailOctaves,
        minimumCraterRadius), false];
}

function landColor(px, py, pz, cell, climate, style, ground, sea, elevation, detail, detailOctaves) {
    const height = landHeight(elevation, sea);
    // The climate cell's temperature, colder still on a peak rising above the cell's own height
    const temperature = climate.temperature[cell] - lapse * Math.max(height - climate.height[cell], 0);
    const shade = hillShade(px, py, pz, elevation, style, sea, detailOctaves);
    if (temperature < 0) {
        // Snow, shaded by the slopes beneath it so snowy ranges still read as mountains
        const d = (detail - 0.5) * 0.05;
        return shaded([snow[0] + d, snow[1] + d, snow[2] + d], shade * 0.6);
    }
    // Bare rock: the world's own ground, greyer and harder on the mountains
    const bare = () => {
        const g = surfaceColor(ground, px, py, pz, sea, detailOctaves);
        const d = (detail - 0.5) * 0.1;
        const m = mixColor(g, [0.42, 0.4, 0.38], 0.45);
        const rock = [m[0] + d, m[1] + d, m[2] + d];
        return mixColor(g, rock, Math.min(Math.max((height - treeLine) / 0.2, 0), 1));
    };
    if (!style.vegetation) return shaded(bare(), shade);
    let c = biomeColor(temperature, climate.moisture[cell]);
    // Uplands a little lighter, and fine variation so biomes aren't flat
    const k = 0.88 + 0.3 * Math.min(height, treeLine);
    const d = (detail - 0.5) * 0.08;
    c = [c[0] * k + d, c[1] * k + d, c[2] * k + d];
    // The mountains are bare rock above the tree line
    const land = height > treeLine ? mixColor(c, bare(), Math.min((height - treeLine) / 0.12, 1)) : c;
    return shaded(land, shade);
}

// MARK: mountains

/** Height above sea level where trees give way to bare rock, as a fraction of the land's height range */
export const treeLine = 0.42;
/** How much colder each unit of land height makes the ground */
export const lapse = 0.6;
/** How high mountain ranges rise above the land they stand on */
const mountainHeight = 0.42;

/** Height above sea level as a fraction of the land's range: 0 at the shore, about 1 on the highest peaks */
export function landHeight(elevation, sea) {
    return Math.min(Math.max((elevation - sea) / Math.max(1 - sea, 0.0001), 0), 1);
}

export function smoothstep(edge0, edge1, x) {
    const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
    return t * t * (3 - 2 * t);
}

/** Ridged noise: noise folded about its middle, peaking in sharp crests */
function ridged(style, px, py, pz, frequency, salt, octaves, detailOctaves, sharpness) {
    addSmall(style.seedHi, style.seedLo, salt);
    const fold = 2 * fbm(px * frequency, py * frequency, pz * frequency, out.hi, out.lo, octaves, detailOctaves) - 1;
    return Math.pow(1 - Math.min(Math.abs(fold), 1), sharpness);
}

/**
 * The ground's height: the world's height noise, with mountain ranges raised from its land in long ridged belts, and
 * high ground broken up. Ranges are added only above sea level, so coastlines stay where the noise puts them.
 */
export function terrainHeight(style, px, py, pz, sea, detailOctaves) {
    const base = elevationAt(style, px, py, pz, detailOctaves);
    if (!(base > sea)) return base;
    addSmall(style.seedHi, style.seedLo, 0x6D0);
    let band = 1 - Math.abs(2 * fbm(px * 1.1, py * 1.1, pz * 1.1, out.hi, out.lo, 3) - 1);
    // A template's mountains are where its ground stands highest
    if (style.template) {
        const high = smoothstep(0.7, 0.85, templateElevation(style.template, px, py, pz));
        band = 0.75 + 0.2 * high;
    }
    const ranges = smoothstep(0.8, 0.94, band) * smoothstep(sea, sea + 0.04, base);
    const range = Math.max(1 - sea, 0.0001);
    const upland = smoothstep(sea + 0.12 * range, sea + 0.4 * range, base);
    if (!(ranges > 0) && !(upland > 0)) return base;
    const main = ranges > 0 ? ridged(style, px, py, pz, 4.5, 0x6D1, 4, detailOctaves, 4) : 0;
    const spurs = ridged(style, px, py, pz, 11, 0x6D2, 3, detailOctaves, 2);
    const crags = ridged(style, px, py, pz, 26, 0x6D3, 3, detailOctaves, 1.5);
    const rubble = ridged(style, px, py, pz, 60, 0x6D4, 2, detailOctaves, 1.2);
    const ridges = main * (0.55 + 0.3 * spurs + 0.15 * spurs * crags);
    const broken = 0.16 * (spurs * crags - 0.25) + 0.07 * (rubble - 0.5);
    const rugged = Math.max(ranges * Math.sqrt(main), upland);
    return base + mountainHeight * (ranges * ridges + rugged * broken);
}

/**
 * The ground's height at a point as the map draws it, against the same sea level: on climate and biome surfaces with
 * their mountain ranges raised, elsewhere the height noise alone (SurfaceMap.groundHeight)
 */
export function groundHeight(style, px, py, pz, sea, detailOctaves) {
    return style.biomes ? terrainHeight(style, px, py, pz, sea, detailOctaves) : elevationAt(style, px, py, pz, detailOctaves);
}

/** Brightness change from the slope of the ground, lit from the north-west like the craters */
function hillShade(px, py, pz, elevation, style, sea, detailOctaves) {
    // east = cross(point, up)
    let ex = -pz, ey = 0, ez = px;
    const length = Math.sqrt(ex * ex + ey * ey + ez * ez);
    if (!(length > 1e-6)) return 0;
    const r = 1 / Math.sqrt(ex * ex + ey * ey + ez * ez);
    ex *= r; ey *= r; ez *= r;
    // north = cross(east, point)
    const nx = ey * pz - ez * py, ny = ez * px - ex * pz, nz = ex * py - ey * px;
    // The slope across about two of the map's pixels, halved for each finer map
    const step = 0.003 * Math.pow(0.5, Math.max(detailOctaves - detailedOctaves, 0));
    const rise = (dx, dy, dz) => {
        let qx = px + dx * step, qy = py + dy * step, qz = pz + dz * step;
        const q = 1 / Math.sqrt(qx * qx + qy * qy + qz * qz);
        qx *= q; qy *= q; qz *= q;
        return (terrainHeight(style, qx, qy, qz, sea, detailOctaves) - elevation) / step;
    };
    const slope = (rise(nx, ny, nz) - rise(ex, ey, ez)) / Math.sqrt(2);
    // Easing off toward its limit, so the steepest flanks keep their shapes
    return 0.42 * Math.tanh(slope * 0.1 / 0.42);
}

/** Each cell's height above sea level as a fraction of the planet's radius; seas are flat */
export function reliefHeights(style, sites, sea) {
    const count = sites.length / 3;
    const heights = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        const elevation = terrainHeight(style, sites[i * 3], sites[i * 3 + 1], sites[i * 3 + 2], sea, 0);
        if (!(elevation > sea)) continue;
        heights[i] = Math.min(f32(f32(Math.pow(landHeight(elevation, sea), 1.5)) * f32(0.045)), maximumRelief);
    }
    return heights;
}

// MARK: biomes

const biomeColors = {
    tundra: [0.55, 0.56, 0.46], coldDesert: [0.64, 0.62, 0.52], taiga: [0.2, 0.36, 0.26],
    temperateDesert: [0.76, 0.7, 0.5], grassland: [0.5, 0.6, 0.3], temperateForest: [0.24, 0.46, 0.2],
    temperateRainforest: [0.13, 0.38, 0.22], subtropicalDesert: [0.86, 0.73, 0.5], savanna: [0.66, 0.64, 0.33],
    tropicalSeasonalForest: [0.3, 0.5, 0.18], tropicalRainforest: [0.1, 0.37, 0.13],
};

export function biome(temperature, moisture) {
    if (temperature < 0.15) return 'tundra';
    if (temperature < 0.35) return moisture < 0.12 ? 'coldDesert' : 'taiga';
    if (temperature < 0.7) {
        if (moisture < 0.1) return 'temperateDesert';
        if (moisture < 0.22) return 'grassland';
        if (moisture < 0.42) return 'temperateForest';
        return 'temperateRainforest';
    }
    if (moisture < 0.1) return 'subtropicalDesert';
    if (moisture < 0.22) return 'savanna';
    if (moisture < 0.42) return 'tropicalSeasonalForest';
    return 'tropicalRainforest';
}

function biomeColor(temperature, moisture) {
    return biomeColors[biome(temperature, moisture)];
}

// MARK: heap

/** A binary min-heap by level, the same as the Mac app's so ties break the same way */
export class MinHeap {
    constructor() {
        this.levels = [];
        this.cells = [];
    }

    push(level, cell) {
        const levels = this.levels, cells = this.cells;
        levels.push(level);
        cells.push(cell);
        let child = levels.length - 1;
        while (child > 0) {
            const parent = (child - 1) >> 1;
            if (!(levels[child] < levels[parent])) break;
            [levels[child], levels[parent]] = [levels[parent], levels[child]];
            [cells[child], cells[parent]] = [cells[parent], cells[child]];
            child = parent;
        }
    }

    /** [level, cell], or null when empty */
    pop() {
        const levels = this.levels, cells = this.cells;
        if (levels.length === 0) return null;
        const first = [levels[0], cells[0]];
        const lastLevel = levels.pop(), lastCell = cells.pop();
        if (levels.length > 0) {
            levels[0] = lastLevel;
            cells[0] = lastCell;
            let parent = 0;
            for (;;) {
                const left = 2 * parent + 1, right = left + 1;
                let smallest = parent;
                if (left < levels.length && levels[left] < levels[smallest]) smallest = left;
                if (right < levels.length && levels[right] < levels[smallest]) smallest = right;
                if (smallest === parent) break;
                [levels[parent], levels[smallest]] = [levels[smallest], levels[parent]];
                [cells[parent], cells[smallest]] = [cells[smallest], cells[parent]];
                parent = smallest;
            }
        }
        return first;
    }
}

// MARK: climate

const riverFlow = 3;
const temperaturePasses = 20;
const moisturePasses = 40;

/** Terrain, rivers, temperature and moisture of the climate's cells */
export class Climate {
    constructor(style, sea) {
        const { sites, triangles } = cells(style, climateSubdivisions);
        const count = sites.length / 3;
        this.sites = sites;
        this.count = count;

        // Neighbouring cells share a triangle edge, in the order the Mac app finds them
        const neighbours = Array.from({ length: count }, () => []);
        for (let t = 0; t < triangles.length; t += 3) {
            const a = triangles[t], b = triangles[t + 1], c = triangles[t + 2];
            for (const [p, q] of [[a, b], [b, c], [c, a]]) {
                if (!neighbours[p].includes(q)) neighbours[p].push(q);
                if (!neighbours[q].includes(p)) neighbours[q].push(p);
            }
        }
        // The ground's height with its mountain ranges, so the climate is colder on them and rivers run off them
        const elevation = new Float64Array(count);
        const height = new Float64Array(count);
        for (let i = 0; i < count; i++) {
            elevation[i] = terrainHeight(style, sites[i * 3], sites[i * 3 + 1], sites[i * 3 + 2], sea, 0);
            height[i] = landHeight(elevation[i], sea);
        }
        const underwater = new Uint8Array(count);
        const surface = new Float64Array(count);
        for (let i = 0; i < count; i++) {
            underwater[i] = elevation[i] < sea ? 1 : 0;
            surface[i] = Math.max(elevation[i], sea);
        }

        // 1. Drainage by priority flood; hollows filled deeply enough are lakes
        const downstream = new Int32Array(count).fill(-1);
        const fill = Float64Array.from(surface);
        const reached = Uint8Array.from(underwater);
        const heap = new MinHeap();
        for (let cell = 0; cell < count; cell++) if (underwater[cell]) heap.push(sea, cell);
        for (let item = heap.pop(); item; item = heap.pop()) {
            const [level, cell] = item;
            for (const next of neighbours[cell]) {
                if (reached[next]) continue;
                reached[next] = 1;
                fill[next] = Math.max(elevation[next], level);
                downstream[next] = cell;
                heap.push(fill[next], next);
            }
        }
        // Hollows in the lowlands fill into lakes; the valleys between a range's ridges drain through them instead
        const terrain = new Uint8Array(count);
        for (let cell = 0; cell < count; cell++) {
            if (underwater[cell] || !(fill[cell] - elevation[cell] > 0.008)) continue;
            const noise = elevationAt(style, sites[cell * 3], sites[cell * 3 + 1], sites[cell * 3 + 2], 0);
            if (elevation[cell] - noise < 0.01) terrain[cell] = Terrain.lake;
        }
        const visited = new Uint8Array(count);
        for (let start = 0; start < count; start++) {
            if (!underwater[start] || visited[start]) continue;
            const body = [start];
            visited[start] = 1;
            for (let next = 0; next < body.length; next++) {
                for (const neighbour of neighbours[body[next]]) {
                    if (underwater[neighbour] && !visited[neighbour]) {
                        visited[neighbour] = 1;
                        body.push(neighbour);
                    }
                }
            }
            const kind = body.length < Math.trunc(count / 400) ? Terrain.lake : Terrain.ocean;
            for (const cell of body) terrain[cell] = kind;
        }

        // 2. Temperature from latitude and height, spreading between neighbours
        const iceCap = Math.max(style.iceCapLatitude, 1);
        const equator = iceCap <= 72 ? 0.5 + 0.5 * (iceCap - 50) / 22 : 1 + 0.4 * (iceCap - 72) / 14;
        let temperature = new Float64Array(count);
        for (let cell = 0; cell < count; cell++) {
            const x = sites[cell * 3], y = sites[cell * 3 + 1], z = sites[cell * 3 + 2];
            const cold = coldness(style, x, y, z);
            const ragged = (detailNoise(style, x, y, z, 0) - 0.5) * 0.15;
            // A world frozen over is below freezing everywhere; a template's ice stays frozen
            const frozenOver = style.frozenOver ? 3 : 0;
            const templateCold = style.template ? smoothstep(0.35, 0.65, templateIce(style.template, x, y, z)) * 2 : 0;
            temperature[cell] = equator * (1 - cold / iceCap) - lapse * height[cell] + ragged - frozenOver - templateCold;
        }
        for (let pass = 0; pass < temperaturePasses; pass++) {
            const previous = temperature;
            temperature = new Float64Array(count);
            for (let cell = 0; cell < count; cell++) {
                const wetCell = terrain[cell] !== Terrain.land;
                let sum = previous[cell], weights = 1;
                for (const neighbour of neighbours[cell]) {
                    const neighbourWet = terrain[neighbour] !== Terrain.land;
                    const kind = wetCell && neighbourWet ? 0.75 : !wetCell && !neighbourWet ? 0.25 : 0.5;
                    const weight = kind / (1 + 20 * Math.abs(surface[cell] - surface[neighbour]));
                    sum += previous[neighbour] * weight;
                    weights += weight;
                }
                temperature[cell] = sum / weights;
            }
        }

        // 3. Rivers start at random unfrozen land cells and run down to the sea, gathering flow
        const flow = new Int32Array(count);
        const land = [];
        for (let cell = 0; cell < count; cell++) if (terrain[cell] === Terrain.land && temperature[cell] >= 0) land.push(cell);
        let random = BigInt.asUintN(64, BigInt(style.seed) ^ 0x51DE0F2140n);
        const sources = Math.trunc(land.length / 12);
        for (let i = 0; i < sources; i++) {
            random = (random * 6364136223846793005n + 1442695040888963407n) & MASK64;
            let cell = land[Number((random >> 33n) % BigInt(land.length))];
            while (cell >= 0 && !underwater[cell]) {
                flow[cell] += 1;
                cell = downstream[cell];
            }
        }

        // 4. Moisture from oceans, lakes and rivers spreads over the land, less easily uphill
        let moisture = new Float64Array(count);
        for (let cell = 0; cell < count; cell++) {
            if (terrain[cell] === Terrain.ocean) moisture[cell] = 0.5;
            else if (terrain[cell] === Terrain.lake) moisture[cell] = 1;
            else moisture[cell] = flow[cell] >= riverFlow ? Math.min(0.5 * flow[cell] / riverFlow, 1) : 0;
        }
        for (let pass = 0; pass < moisturePasses; pass++) {
            const previous = moisture;
            moisture = Float64Array.from(previous);
            for (let cell = 0; cell < count; cell++) {
                if (terrain[cell] !== Terrain.land) continue;
                let sum = 0, wettest = 0;
                for (const neighbour of neighbours[cell]) {
                    const climb = Math.max(surface[cell] - surface[neighbour], 0);
                    const incoming = previous[neighbour] / (1 + 60 * climb);
                    sum += incoming;
                    wettest = Math.max(wettest, incoming);
                }
                const spread = 0.96 * (0.6 * wettest + 0.4 * sum / Math.max(neighbours[cell].length, 1));
                moisture[cell] = Math.max(previous[cell], spread);
            }
        }

        // A template's deserts stay dry, and its green land green
        if (style.template) {
            for (let cell = 0; cell < count; cell++) {
                if (terrain[cell] !== Terrain.land) continue;
                const x = sites[cell * 3], y = sites[cell * 3 + 1], z = sites[cell * 3 + 2];
                moisture[cell] *= 1 - 0.9 * templateAridity(style.template, x, y, z);
                moisture[cell] = Math.max(moisture[cell], 0.32 * templateGreenery(style.template, x, y, z));
            }
        }

        this.terrain = terrain;
        this.flow = flow;
        this.downstream = downstream;
        this.temperature = temperature;
        this.moisture = moisture;
        this.height = height;
    }

    isRiver(cell) {
        return this.terrain[cell] === Terrain.land && this.flow[cell] >= riverFlow;
    }
}

// MARK: rivers

/** The corners of a set of cells (the centres of the triangles between their sites) and the edges between them */
export class CornerGraph {
    constructor(sites, triangles) {
        this.sites = sites;
        this.triangles = triangles;
        const count = sites.length / 3;
        const triangleCount = triangles.length / 3;
        const centres = new Float64Array(triangleCount * 3);
        for (let t = 0; t < triangleCount; t++) {
            const a = triangles[t * 3], b = triangles[t * 3 + 1], c = triangles[t * 3 + 2];
            const x = sites[a * 3] + sites[b * 3] + sites[c * 3];
            const y = sites[a * 3 + 1] + sites[b * 3 + 1] + sites[c * 3 + 1];
            const z = sites[a * 3 + 2] + sites[b * 3 + 2] + sites[c * 3 + 2];
            const r = 1 / Math.sqrt(x * x + y * y + z * z);
            centres[t * 3] = x * r; centres[t * 3 + 1] = y * r; centres[t * 3 + 2] = z * r;
        }
        this.centres = centres;
        const starts = new Int32Array(count + 1);
        for (let i = 0; i < triangles.length; i++) starts[triangles[i] + 1] += 1;
        for (let s = 0; s < count; s++) starts[s + 1] += starts[s];
        const ends = new Int32Array(starts[count]);
        const owners = new Int32Array(starts[count]);
        const fillAt = starts.slice();
        for (let t = 0; t < triangleCount; t++) {
            const a = triangles[t * 3], b = triangles[t * 3 + 1], c = triangles[t * 3 + 2];
            for (const [p, q] of [[a, b], [b, c], [c, a]]) {
                const slot = fillAt[p]++;
                ends[slot] = q;
                owners[slot] = t;
            }
        }
        this.starts = starts;
        this.ends = ends;
        this.owners = owners;
    }

    corners(site) {
        const result = [];
        for (let slot = this.starts[site]; slot < this.starts[site + 1]; slot++) result.push(this.owners[slot]);
        return result;
    }

    triangleFrom(a, b) {
        for (let slot = this.starts[a]; slot < this.starts[a + 1]; slot++) if (this.ends[slot] === b) return this.owners[slot];
        return -1;
    }

    /** [corner, cellA, cellB] for each corner one edge away */
    neighbours(corner) {
        const t = this.triangles;
        const a = t[corner * 3], b = t[corner * 3 + 1], c = t[corner * 3 + 2];
        const result = [];
        for (const [p, q] of [[a, b], [b, c], [c, a]]) {
            const across = this.triangleFrom(q, p);
            if (across >= 0) result.push([across, p, q]);
        }
        return result;
    }

    nearestSite(px, py, pz, start) {
        const s = this.sites;
        const distance = (i) => {
            const dx = px - s[i * 3], dy = py - s[i * 3 + 1], dz = pz - s[i * 3 + 2];
            return dx * dx + dy * dy + dz * dz;
        };
        let current = start;
        let currentDistance = distance(current);
        for (;;) {
            let best = current;
            for (let slot = this.starts[current]; slot < this.starts[current + 1]; slot++) {
                const neighbour = this.ends[slot];
                const d = distance(neighbour);
                if (d < currentDistance) {
                    currentDistance = d;
                    best = neighbour;
                }
            }
            if (best === current) return current;
            current = best;
        }
    }

    route(start, target, isEnd, course, spacing, blocked) {
        const [ax, ay, az, bx, by, bz] = course;
        const sx = bx - ax, sy = by - ay, sz = bz - az;
        const spanSquared = Math.max(sx * sx + sy * sy + sz * sz, 1e-18);
        const offset = (x, y, z) => {
            const t = Math.min(Math.max(((x - ax) * sx + (y - ay) * sy + (z - az) * sz) / spanSquared, 0), 1);
            const dx = x - (ax + sx * t), dy = y - (ay + sy * t), dz = z - (az + sz * t);
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        };
        const c = this.centres;
        const cost = new Map([[start, 0]]);
        const previous = new Map();
        const heap = new MinHeap();
        heap.push(0, start);
        let expanded = 0;
        for (let item = heap.pop(); item; item = heap.pop()) {
            const [reached, corner] = item;
            if (!(reached <= (cost.get(corner) ?? Infinity))) continue;
            if (target !== null ? target === corner : isEnd(corner)) {
                const path = [corner];
                while (previous.has(path[path.length - 1])) path.push(previous.get(path[path.length - 1]));
                return path.reverse();
            }
            expanded += 1;
            if (expanded > 4000) return null;
            for (const [next, cellA, cellB] of this.neighbours(corner)) {
                if (blocked(cellA, cellB)) continue;
                const px = c[corner * 3], py = c[corner * 3 + 1], pz = c[corner * 3 + 2];
                const qx = c[next * 3], qy = c[next * 3 + 1], qz = c[next * 3 + 2];
                const dx = px - qx, dy = py - qy, dz = pz - qz;
                const total = reached + Math.sqrt(dx * dx + dy * dy + dz * dz) *
                    (1 + 3 * offset((px + qx) / 2, (py + qy) / 2, (pz + qz) / 2) / spacing);
                if (total < (cost.get(next) ?? Infinity)) {
                    cost.set(next, total);
                    previous.set(next, corner);
                    heap.push(total, next);
                }
            }
        }
        return null;
    }
}

/**
 * Rivers along the edges between cells: [{ from, to, halfWidth }] with corners by triangle index, sorted by edge so
 * the same world always saves the same file
 */
function riverEdges(climate, sites, triangles, wet) {
    const graph = new CornerGraph(sites, triangles);
    const count = sites.length / 3;
    const spacing = Math.sqrt(4 * Math.PI / count);
    const onShore = (corner) =>
        wet[triangles[corner * 3]] || wet[triangles[corner * 3 + 1]] || wet[triangles[corner * 3 + 2]];
    const c = graph.centres;
    const cornerNear = (px, py, pz, start) => {
        const cell = graph.nearestSite(px, py, pz, Math.min(start, count - 1));
        let best = 0, bestDistance = Infinity, first = true;
        for (const corner of graph.corners(cell)) {
            const dx = c[corner * 3] - px, dy = c[corner * 3 + 1] - py, dz = c[corner * 3 + 2] - pz;
            const d = dx * dx + dy * dy + dz * dz;
            if (first || d < bestDistance) {
                best = corner;
                bestDistance = d;
                first = false;
            }
        }
        return best;
    };

    const widest = new Map();
    const cs = climate.sites;
    for (let cell = 0; cell < climate.count; cell++) {
        if (!(climate.isRiver(cell) && climate.temperature[cell] >= 0)) continue;
        const next = climate.downstream[cell];
        if (next < 0) continue;
        const fx = cs[cell * 3], fy = cs[cell * 3 + 1], fz = cs[cell * 3 + 2];
        const tx = cs[next * 3], ty = cs[next * 3 + 1], tz = cs[next * 3 + 2];
        const start = cornerNear(fx, fy, fz, cell);
        const target = climate.terrain[next] === Terrain.land ? cornerNear(tx, ty, tz, next) : null;
        const path = graph.route(start, target, onShore, [fx, fy, fz, tx, ty, tz], spacing,
            (a, b) => wet[a] && wet[b]);
        if (!path) continue;
        const flowRatio = climate.flow[cell] / riverFlow;
        const halfWidth = f32(spacing * Math.min(0.08 + 0.04 * Math.log2(flowRatio), 0.25));
        for (let i = 0; i + 1 < path.length; i++) {
            const a = path[i], b = path[i + 1];
            const key = Math.min(a, b) * 4294967296 + Math.max(a, b);
            widest.set(key, Math.max(widest.get(key) ?? 0, halfWidth));
        }
    }
    return [...widest.entries()].sort((a, b) => a[0] - b[0]).map(([key, halfWidth]) => ({
        from: Math.floor(key / 4294967296), to: key % 4294967296, halfWidth,
    }));
}
