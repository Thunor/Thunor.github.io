//
//  polygonSurface.js
//  Estrelas (web)
//
//  Surfaces for rocky worlds with seas after Amit Patel's "Polygonal Map Generation for Games" (Red Blob Games, 2010),
//  adapted from one island to a whole planet: polygons relaxed over the sphere; land and water decided at their
//  corners by the world's height noise; oceans and lakes; elevation as the distance from the coast, redistributed so
//  peaks are rare; rivers down the steepest edges to the sea; moisture from fresh water; and the article's biomes.
//  The polygon map is worked out once on the climate's cells, so the globe and the detailed map show the same rivers,
//  lakes and biomes. A port of PolygonSurface.swift.
//

import {
    elevation as elevationAt, detailNoise, seaLevel as seaLevelFor, mixColor, climateSubdivisions, coldness, fbm,
    seaIce, snow, color as surfaceColor,
} from './surfaceMap.js';
import { cells, icosphere, NearestSite } from './voronoiSurface.js';
import { MinHeap, CornerGraph, maximumRelief } from './biomeSurface.js';
import { out, addSmall } from './u64.js';

const MASK64 = (1n << 64n) - 1n;
const f32 = Math.fround;

export const PolygonBiome = {
    ocean: 0, lake: 1, marsh: 2, ice: 3, beach: 4, snow: 5, tundra: 6, bare: 7, scorched: 8, taiga: 9, shrubland: 10,
    temperateDesert: 11, temperateRainForest: 12, temperateDeciduousForest: 13, grassland: 14, tropicalRainForest: 15,
    tropicalSeasonalForest: 16, subtropicalDesert: 17,
};
export const polygonBiomeNames = Object.keys(PolygonBiome);
const biomePalette = [
    [0.08, 0.22, 0.45], [0.2, 0.4, 0.6], [0.18, 0.4, 0.4], [0.82, 0.9, 0.96], [0.63, 0.56, 0.47], snow,
    [0.73, 0.73, 0.67], [0.53, 0.53, 0.53], [0.33, 0.33, 0.33], [0.6, 0.67, 0.47], [0.53, 0.6, 0.47],
    [0.79, 0.82, 0.61], [0.27, 0.53, 0.33], [0.4, 0.58, 0.35], [0.53, 0.67, 0.33], [0.2, 0.47, 0.33],
    [0.33, 0.6, 0.27], [0.82, 0.73, 0.55],
];

/** A land polygon's biome from the article's table: rows by temperature zone, columns by moisture zone */
function landBiome(temperature, moisture, elevation) {
    const B = PolygonBiome;
    if (temperature < 0) return B.snow;
    if (temperature < 0.2) {
        if (elevation < 0.5) return moisture > 0.8 ? B.snow : B.tundra;
        return moisture > 0.5 ? B.snow : moisture > 0.33 ? B.tundra : moisture > 0.16 ? B.bare : B.scorched;
    }
    if (temperature < 0.45) return moisture > 0.66 ? B.taiga : moisture > 0.33 ? B.shrubland : B.temperateDesert;
    if (temperature < 0.75) {
        return moisture > 0.83 ? B.temperateRainForest : moisture > 0.5 ? B.temperateDeciduousForest
            : moisture > 0.16 ? B.grassland : B.temperateDesert;
    }
    return moisture > 0.66 ? B.tropicalRainForest : moisture > 0.33 ? B.tropicalSeasonalForest
        : moisture > 0.16 ? B.grassland : B.subtropicalDesert;
}

export const PolygonKind = { land: 0, ocean: 1, lake: 2 };

const riverSources = 25;
const drawnFlow = 3;
const polygonLapse = 0.35;
const deepOcean = 25.0;

/** A steady random number in 0..<1 for a corner */
function cornerRandom(index, seed) {
    let z = (BigInt(index) + seed * 0x9E3779B97F4A7C15n) & MASK64;
    z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & MASK64;
    z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & MASK64;
    return Number((z ^ (z >> 31n)) >> 11n) / 2 ** 53;
}

const edgeKey = (a, b) => Math.min(a, b) * 4294967296 + Math.max(a, b);

/** The polygon map of a world, worked out on the climate's cells */
export class PolygonMap {
    constructor(style, sea) {
        const base = cells(style, climateSubdivisions);
        const triangles = base.triangles;
        const count = base.sites.length / 3;
        const cornerCount = triangles.length / 3;
        this.seed = BigInt(style.seed);
        this.seedHi = style.seedHi; this.seedLo = style.seedLo;
        this.warp = 1.2 * Math.sqrt(4 * Math.PI / count);

        // The graph: each polygon's corners and neighbours, each corner's neighbouring corners
        const cellCorners = Array.from({ length: count }, () => []);
        for (let corner = 0; corner < cornerCount; corner++) {
            cellCorners[triangles[corner * 3]].push(corner);
            cellCorners[triangles[corner * 3 + 1]].push(corner);
            cellCorners[triangles[corner * 3 + 2]].push(corner);
        }
        const edgeTriangles = new Map();
        for (let corner = 0; corner < cornerCount; corner++) {
            const a = triangles[corner * 3], b = triangles[corner * 3 + 1], c = triangles[corner * 3 + 2];
            for (const [p, q] of [[a, b], [b, c], [c, a]]) {
                const key = edgeKey(p, q);
                const list = edgeTriangles.get(key);
                if (list) list.push(corner); else edgeTriangles.set(key, [corner]);
            }
        }
        const cellNeighbours = Array.from({ length: count }, () => []);
        const cornerNeighbours = Array.from({ length: cornerCount }, () => []);
        for (const [key, pair] of edgeTriangles) {
            const a = Math.floor(key / 4294967296), b = key % 4294967296;
            cellNeighbours[a].push(b);
            cellNeighbours[b].push(a);
            if (pair.length === 2) {
                cornerNeighbours[pair[0]].push(pair[1]);
                cornerNeighbours[pair[1]].push(pair[0]);
            }
        }
        for (const list of cellNeighbours) list.sort((p, q) => p - q);
        for (const list of cornerNeighbours) list.sort((p, q) => p - q);

        // 1. Two rounds of approximate Lloyd relaxation
        let sites = base.sites;
        let corners = null;
        const cornersOf = (from) => {
            const result = new Float64Array(cornerCount * 3);
            for (let t = 0; t < cornerCount; t++) {
                const a = triangles[t * 3], b = triangles[t * 3 + 1], c = triangles[t * 3 + 2];
                const x = from[a * 3] + from[b * 3] + from[c * 3];
                const y = from[a * 3 + 1] + from[b * 3 + 1] + from[c * 3 + 1];
                const z = from[a * 3 + 2] + from[b * 3 + 2] + from[c * 3 + 2];
                const r = 1 / Math.sqrt(x * x + y * y + z * z);
                result[t * 3] = x * r; result[t * 3 + 1] = y * r; result[t * 3 + 2] = z * r;
            }
            return result;
        };
        for (let round = 0; round < 2; round++) {
            corners = cornersOf(sites);
            const next = new Float64Array(count * 3);
            for (let cell = 0; cell < count; cell++) {
                let x = 0, y = 0, z = 0;
                for (const corner of cellCorners[cell]) {
                    x += corners[corner * 3]; y += corners[corner * 3 + 1]; z += corners[corner * 3 + 2];
                }
                const r = 1 / Math.sqrt(x * x + y * y + z * z);
                next[cell * 3] = x * r; next[cell * 3 + 1] = y * r; next[cell * 3 + 2] = z * r;
            }
            sites = next;
        }
        corners = cornersOf(sites);
        this.sites = sites;
        this.triangles = triangles;
        this.corners = corners;

        // 2. Land and water at the corners, and polygons water if half or more of their corners are
        const cornerUnderwater = new Uint8Array(cornerCount);
        for (let c = 0; c < cornerCount; c++) {
            cornerUnderwater[c] = elevationAt(style, corners[c * 3], corners[c * 3 + 1], corners[c * 3 + 2], 0) < sea ? 1 : 0;
        }
        const water = cellCorners.map((list) => 2 * list.filter((c) => cornerUnderwater[c]).length >= list.length);

        // 3. Bodies of water: the large ones are oceans, the small ones lakes
        const kind = new Uint8Array(count);
        const visited = new Uint8Array(count);
        let largest = [];
        let anyOcean = false;
        for (let start = 0; start < count; start++) {
            if (!water[start] || visited[start]) continue;
            const body = [start];
            visited[start] = 1;
            for (let next = 0; next < body.length; next++) {
                for (const neighbour of cellNeighbours[body[next]]) {
                    if (water[neighbour] && !visited[neighbour]) {
                        visited[neighbour] = 1;
                        body.push(neighbour);
                    }
                }
            }
            const isOcean = body.length >= Math.trunc(count / 400);
            anyOcean = anyOcean || isOcean;
            for (const cell of body) kind[cell] = isOcean ? PolygonKind.ocean : PolygonKind.lake;
            if (body.length > largest.length) largest = body;
        }
        if (!anyOcean) for (const cell of largest) kind[cell] = PolygonKind.ocean;
        const coast = new Uint8Array(count);
        for (let cell = 0; cell < count; cell++) {
            coast[cell] = kind[cell] === PolygonKind.land && cellNeighbours[cell].some((n) => kind[n] === PolygonKind.ocean) ? 1 : 0;
        }
        const cornerOcean = new Uint8Array(cornerCount);
        const cornerCoast = new Uint8Array(cornerCount);
        const cornerLake = new Uint8Array(cornerCount);
        for (let corner = 0; corner < cornerCount; corner++) {
            const kinds = [kind[triangles[corner * 3]], kind[triangles[corner * 3 + 1]], kind[triangles[corner * 3 + 2]]];
            const oceans = kinds.filter((k) => k === PolygonKind.ocean).length;
            const lands = kinds.filter((k) => k === PolygonKind.land).length;
            cornerOcean[corner] = oceans === 3 ? 1 : 0;
            cornerCoast[corner] = oceans > 0 && lands > 0 ? 1 : 0;
            cornerLake[corner] = !cornerCoast[corner] && oceans === 0 && lands < 3 ? 1 : 0;
        }
        const cornerWater = (c) => cornerOcean[c] || cornerLake[c];

        // 4. Elevation: the distance from the coast
        const jitterSeed = this.seed ^ 0xE1E7n;
        const jitter = new Float64Array(cornerCount);
        for (let c = 0; c < cornerCount; c++) jitter[c] = cornerRandom(c, jitterSeed);
        const distance = new Float64Array(cornerCount).fill(Infinity);
        const heap = new MinHeap();
        for (let corner = 0; corner < cornerCount; corner++) {
            if (cornerOcean[corner]) {
                distance[corner] = 0;
                heap.push(0, corner);
            }
        }
        for (let item = heap.pop(); item; item = heap.pop()) {
            const [reached, corner] = item;
            if (!(reached <= distance[corner])) continue;
            for (const next of cornerNeighbours[corner]) {
                let step = 0.01;
                if (!cornerWater(corner) && !cornerWater(next)) step += 1 + 0.4 * jitter[next];
                if (reached + step < distance[next]) {
                    distance[next] = reached + step;
                    heap.push(distance[next], next);
                }
            }
        }
        const landCorners = [];
        for (let c = 0; c < cornerCount; c++) if (!cornerOcean[c] && !cornerCoast[c]) landCorners.push(c);
        const cornerElevation = new Float64Array(cornerCount);
        const byElevation = landCorners.slice().sort((p, q) => distance[p] - distance[q]);
        byElevation.forEach((corner, rank) => {
            const y = byElevation.length > 1 ? rank / (byElevation.length - 1) : 0;
            cornerElevation[corner] = Math.min(Math.sqrt(1.1) - Math.sqrt(1.1 * (1 - y)), 1);
        });
        const elevation = new Float64Array(count);
        for (let cell = 0; cell < count; cell++) {
            const list = cellCorners[cell];
            let sum = 0;
            for (const c of list) sum += cornerElevation[c];
            elevation[cell] = sum / list.length;
        }

        // How far out to sea
        const hops = new Float64Array(cornerCount).fill(Infinity);
        const queue = [];
        for (let c = 0; c < cornerCount; c++) {
            if (cornerCoast[c]) {
                queue.push(c);
                hops[c] = 0;
            }
        }
        for (let head = 0; head < queue.length; head++) {
            const corner = queue[head];
            for (const next of cornerNeighbours[corner]) {
                if (cornerOcean[next] && hops[next] === Infinity) {
                    hops[next] = hops[corner] + 1;
                    queue.push(next);
                }
            }
        }
        const depth = new Float64Array(count);
        for (let cell = 0; cell < count; cell++) {
            const list = cellCorners[cell];
            let total = 0;
            for (const c of list) total += Math.min((hops[c] === Infinity ? deepOcean : hops[c]) / deepOcean, 1);
            depth[cell] = total / list.length;
        }

        // Temperature
        const iceCap = Math.max(style.iceCapLatitude, 1);
        const equator = iceCap <= 72 ? 0.5 + 0.5 * (iceCap - 50) / 22 : 1 + 0.4 * (iceCap - 72) / 14;
        const temperature = new Float64Array(count);
        for (let cell = 0; cell < count; cell++) {
            const x = sites[cell * 3], y = sites[cell * 3 + 1], z = sites[cell * 3 + 2];
            const cold = coldness(style, x, y, z);
            const ragged = (detailNoise(style, x, y, z, 0) - 0.5) * 0.15;
            const frozenOver = style.frozenOver ? 3 : 0;
            temperature[cell] = equator * (1 - cold / iceCap) - polygonLapse * elevation[cell] + ragged - frozenOver;
        }
        const cornerTemperature = new Float64Array(cornerCount);
        for (let t = 0; t < cornerCount; t++) {
            cornerTemperature[t] = (temperature[triangles[t * 3]] + temperature[triangles[t * 3 + 1]] +
                temperature[triangles[t * 3 + 2]]) / 3;
        }

        // 5. Rivers
        const downslope = new Int32Array(cornerCount);
        for (let corner = 0; corner < cornerCount; corner++) {
            let lowest = corner;
            for (const next of cornerNeighbours[corner]) if (distance[next] < distance[lowest]) lowest = next;
            downslope[corner] = lowest;
        }
        const riverFlow = new Map();
        const cornerRiver = new Int32Array(cornerCount);
        let random = BigInt.asUintN(64, this.seed ^ 0x524956455253n);
        const starts = landCorners.filter((c) => !cornerLake[c]);
        const attempts = starts.length === 0 ? 0 : Math.trunc(starts.length / riverSources);
        for (let i = 0; i < attempts; i++) {
            random = (random * 6364136223846793005n + 1442695040888963407n) & MASK64;
            let corner = starts[Number((random >> 33n) % BigInt(starts.length))];
            const e = cornerElevation[corner];
            if (!(e >= 0.3 && e <= 0.9) || !(cornerTemperature[corner] >= 0)) continue;
            let steps = 0;
            while (!cornerCoast[corner] && !cornerOcean[corner] && steps < 10000) {
                const next = downslope[corner];
                if (next === corner) break;
                const key = edgeKey(corner, next);
                riverFlow.set(key, (riverFlow.get(key) ?? 0) + 1);
                cornerRiver[corner] += 1;
                corner = next;
                steps += 1;
            }
        }

        // 6. Moisture: fresh water wets the land around it, fading by a tenth each step away
        const cornerMoisture = new Float64Array(cornerCount);
        const wetQueue = [];
        for (let corner = 0; corner < cornerCount; corner++) {
            if (cornerLake[corner] || cornerRiver[corner] > 0) {
                cornerMoisture[corner] = cornerRiver[corner] > 0 ? Math.min(3, 0.2 * cornerRiver[corner]) : 1;
                wetQueue.push(corner);
            }
        }
        for (let head = 0; head < wetQueue.length; head++) {
            const corner = wetQueue[head];
            const spread = cornerMoisture[corner] * 0.9;
            for (const next of cornerNeighbours[corner]) {
                if (spread > cornerMoisture[next]) {
                    cornerMoisture[next] = spread;
                    wetQueue.push(next);
                }
            }
        }
        for (let corner = 0; corner < cornerCount; corner++) {
            if (cornerOcean[corner] || cornerCoast[corner]) cornerMoisture[corner] = 1;
        }
        const byMoisture = landCorners.slice().sort((p, q) => cornerMoisture[p] - cornerMoisture[q]);
        byMoisture.forEach((corner, rank) => {
            cornerMoisture[corner] = byMoisture.length > 1 ? rank / (byMoisture.length - 1) : 0;
        });
        const moisture = new Float64Array(count);
        for (let cell = 0; cell < count; cell++) {
            const list = cellCorners[cell];
            let sum = 0;
            for (const c of list) sum += cornerMoisture[c];
            moisture[cell] = sum / list.length;
        }

        // 7. Biomes
        const B = PolygonBiome;
        const biome = new Uint8Array(count);
        for (let cell = 0; cell < count; cell++) {
            const t = temperature[cell];
            switch (kind[cell]) {
                case PolygonKind.ocean: biome[cell] = t < 0 ? B.ice : B.ocean; break;
                case PolygonKind.lake: biome[cell] = t < 0 ? B.ice : elevation[cell] < 0.1 ? B.marsh : B.lake; break;
                default:
                    if (t < 0) biome[cell] = B.snow;
                    else if (coast[cell]) biome[cell] = B.beach;
                    else biome[cell] = landBiome(t, moisture[cell], elevation[cell]);
            }
        }

        this.kind = kind;
        this.coast = coast;
        this.elevation = elevation;
        this.moisture = moisture;
        this.temperature = temperature;
        this.depth = depth;
        this.biome = biome;
        this.cornerElevation = cornerElevation;
        this.cornerOcean = cornerOcean;
        this.cornerCoast = cornerCoast;
        this.cornerLake = cornerLake;
        this.riverFlow = riverFlow;
    }

    /** The polygon a finer cell takes its biome from: the one under a point shifted a little by noise */
    polygon(px, py, pz, lookup) {
        const x = px * 5, y = py * 5, z = pz * 5;
        addSmall(this.seedHi, this.seedLo, 71);
        const sx = fbm(x, y, z, out.hi, out.lo, 3) - 0.5;
        addSmall(this.seedHi, this.seedLo, 73);
        const sy = fbm(x, y, z, out.hi, out.lo, 3) - 0.5;
        addSmall(this.seedHi, this.seedLo, 79);
        const sz = fbm(x, y, z, out.hi, out.lo, 3) - 0.5;
        let qx = px + sx * 2 * this.warp, qy = py + sy * 2 * this.warp, qz = pz + sz * 2 * this.warp;
        const r = 1 / Math.sqrt(qx * qx + qy * qy + qz * qz);
        qx *= r; qy *= r; qz *= r;
        return lookup.nearest(qx, qy, qz);
    }

    /** A finer cell's colour, its height for the globe's relief, and whether it's water */
    color(px, py, pz, lookup, style, ground, sea, detailOctaves) {
        const polygon = this.polygon(px, py, pz, lookup);
        const detail = detailNoise(style, px, py, pz, detailOctaves);
        const grain = (detail - 0.5) * 0.06;
        const frozen = this.temperature[polygon] < 0;
        const underwater = elevationAt(style, px, py, pz, detailOctaves) < sea;
        if (underwater) {
            if (frozen) return [seaIce(style, px, py, pz, detailOctaves), 0, true];
            if (this.kind[polygon] === PolygonKind.ocean) {
                const shallow = 1 - this.depth[polygon];
                return [mixColor([0.04, 0.12, 0.32], [0.12, 0.34, 0.58], 0.3 + 0.7 * shallow * shallow), 0, true];
            }
            const inland = biomePalette[this.biome[polygon] === PolygonBiome.marsh ? PolygonBiome.marsh : PolygonBiome.lake];
            return [[inland[0] + grain, inland[1] + grain, inland[2] + grain], 0, true];
        }
        const height = Math.min(f32(f32(Math.pow(this.elevation[polygon], 1.5)) * f32(0.045)), maximumRelief);
        if (frozen) {
            const g = grain * 0.8;
            return [[snow[0] + g, snow[1] + g, snow[2] + g], height, false];
        }
        if (!style.vegetation) {
            const bare = surfaceColor(ground, px, py, pz, sea, detailOctaves);
            const shade = (0.85 + 0.3 * this.elevation[polygon]) * (1 - 0.15 * this.moisture[polygon]);
            return [[bare[0] * shade, bare[1] * shade, bare[2] * shade], height, false];
        }
        const land = biomePalette[this.kind[polygon] === PolygonKind.land ? this.biome[polygon] : PolygonBiome.beach];
        return [[land[0] + grain, land[1] + grain, land[2] + grain], height, false];
    }

    /** The map's rivers traced along the edges between finer cells */
    rivers(sites, triangles, wet) {
        const graph = new CornerGraph(sites, triangles);
        const count = sites.length / 3;
        const spacing = Math.sqrt(4 * Math.PI / count);
        const onShore = (corner) =>
            wet[triangles[corner * 3]] || wet[triangles[corner * 3 + 1]] || wet[triangles[corner * 3 + 2]];
        const c = graph.centres;
        const fineCorner = (px, py, pz, hint) => {
            const cell = graph.nearestSite(px, py, pz, Math.min(hint, count - 1));
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
        const t = this.triangles, temperature = this.temperature, corners = this.corners;
        const frozenCorner = (corner) => temperature[t[corner * 3]] + temperature[t[corner * 3 + 1]] + temperature[t[corner * 3 + 2]] < 0;
        const widest = new Map();
        for (const [key, flow] of this.riverFlow) {
            if (flow < drawnFlow) continue;
            const a = Math.floor(key / 4294967296), b = key % 4294967296;
            const [up, down] = this.cornerElevation[a] >= this.cornerElevation[b] ? [a, b] : [b, a];
            if (frozenCorner(up)) continue;
            const from = [corners[up * 3], corners[up * 3 + 1], corners[up * 3 + 2]];
            const to = [corners[down * 3], corners[down * 3 + 1], corners[down * 3 + 2]];
            const start = fineCorner(from[0], from[1], from[2], t[up * 3]);
            const reachesWater = this.cornerCoast[down] || this.cornerOcean[down] || this.cornerLake[down];
            const target = reachesWater ? null : fineCorner(to[0], to[1], to[2], t[down * 3]);
            const path = graph.route(start, target, onShore, [...from, ...to], spacing, (p, q) => wet[p] && wet[q]);
            if (!path) continue;
            const halfWidth = f32(spacing * Math.min(0.05 * Math.sqrt(flow), 0.25));
            for (let i = 0; i + 1 < path.length; i++) {
                const edge = edgeKey(path[i], path[i + 1]);
                widest.set(edge, Math.max(widest.get(edge) ?? 0, halfWidth));
            }
        }
        return [...widest.entries()].sort((p, q) => p[0] - q[0]).map(([key, halfWidth]) =>
            ({ from: Math.floor(key / 4294967296), to: key % 4294967296, halfWidth }));
    }
}

/** Bare ground for worlds without life, whose seas and ice come from the map instead */
function groundStyle(style) {
    return { ...style, waterFraction: 0, iceCapLatitude: 90, vegetation: false, frozenOver: false };
}

/** Colours, relief, rivers and wetness for cells at `sites` (flat Float64Array); `style` must be prepared */
export function polygonSurface(style, sites, triangles, detailOctaves, minimumCraterRadius, progress) {
    const sea = seaLevelFor(style, icosphere);
    const map = new PolygonMap(style, sea);
    const lookup = new NearestSite(map.sites);
    const ground = groundStyle(style);
    const count = sites.length / 3;
    const colors = new Float64Array(count * 3);
    const heights = new Float32Array(count);
    const wet = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
        const [c, h, isWet] = map.color(sites[i * 3], sites[i * 3 + 1], sites[i * 3 + 2], lookup, style, ground, sea, detailOctaves);
        colors[i * 3] = c[0]; colors[i * 3 + 1] = c[1]; colors[i * 3 + 2] = c[2];
        heights[i] = h;
        wet[i] = isWet ? 1 : 0;
        if (progress && (i & 8191) === 0) progress(0.1 + 0.8 * i / count);
    }
    return { colors, heights, rivers: map.rivers(sites, triangles, wet), wet };
}

/** The colours of cells `start..<end`, and whether each is water, for detailed maps coloured in bands */
export function polygonCellColors(style, sites, start, end, detailOctaves, minimumCraterRadius, progress) {
    const sea = seaLevelFor(style, icosphere);
    const map = new PolygonMap(style, sea);
    const lookup = new NearestSite(map.sites);
    const ground = groundStyle(style);
    const colors = new Float64Array((end - start) * 3);
    const wet = new Uint8Array(end - start);
    for (let i = start; i < end; i++) {
        const [c, , isWet] = map.color(sites[i * 3], sites[i * 3 + 1], sites[i * 3 + 2], lookup, style, ground, sea, detailOctaves);
        const k = (i - start) * 3;
        colors[k] = c[0]; colors[k + 1] = c[1]; colors[k + 2] = c[2];
        wet[i - start] = isWet ? 1 : 0;
        if (progress && (i & 8191) === 0) progress((i - start) / (end - start));
    }
    return { colors, wet };
}

/** The rivers along cell edges, once every cell is known to be wet or dry */
export function polygonRivers(style, sites, triangles, wet) {
    const map = new PolygonMap(style, seaLevelFor(style, icosphere));
    return map.rivers(sites, triangles, wet);
}
