//
//  voronoiSurface.js
//  Estrelas (web)
//
//  A rocky or icy planet's surface as a spherical Voronoi diagram: cells spread evenly over the sphere, each
//  coloured from the world's surface style at its centre. A port of VoronoiSurface.swift.
//

import { out, split, unit, add, mixState, mul, GOLDEN } from './u64.js';
import { color, prepared, seaLevel, coordinate, cratered, isUnderwater, elevation } from './surfaceMap.js';
import { biomeSurface, biomeCellColors, riverColor } from './biomeSurface.js';
import { polygonSurface, polygonCellColors } from './polygonSurface.js';
import { volcanicColor } from './volcanism.js';

const icosphereCache = new Map();

/**
 * A geodesic sphere: an icosahedron with each triangle split into four `subdivisions` times. Vertices are a flat
 * Float64Array (x, y, z), triangles a flat Int32Array. Built the same way as the macOS app, so vertex i is the same
 * point and the triangles are the same in both.
 */
export function icosphere(subdivisions) {
    const cached = icosphereCache.get(subdivisions);
    if (cached) return cached;
    const t = (1 + Math.sqrt(5.0)) / 2;
    const finalVertices = 10 * 4 ** subdivisions + 2;
    const vertices = new Float64Array(finalVertices * 3);
    let count = 0;
    const push = (x, y, z) => {
        const r = 1 / Math.sqrt(x * x + y * y + z * z);
        vertices[count * 3] = x * r;
        vertices[count * 3 + 1] = y * r;
        vertices[count * 3 + 2] = z * r;
        return count++;
    };
    for (const [x, y, z] of [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t],
        [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]]) push(x, y, z);
    let triangles = Int32Array.from([0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2,
        10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1]);
    for (let level = 0; level < subdivisions; level++) {
        const midpoints = new Map();
        const midpoint = (a, b) => {
            const key = Math.min(a, b) * 4294967296 + Math.max(a, b);
            const found = midpoints.get(key);
            if (found !== undefined) return found;
            const index = push(vertices[a * 3] + vertices[b * 3], vertices[a * 3 + 1] + vertices[b * 3 + 1],
                vertices[a * 3 + 2] + vertices[b * 3 + 2]);
            midpoints.set(key, index);
            return index;
        };
        const split4 = new Int32Array(triangles.length * 4);
        for (let i = 0, o = 0; i < triangles.length; i += 3) {
            const x = triangles[i], y = triangles[i + 1], z = triangles[i + 2];
            const ab = midpoint(x, y), bc = midpoint(y, z), ca = midpoint(z, x);
            split4.set([x, ab, ca, y, bc, ab, z, ca, bc, ab, bc, ca], o);
            o += 12;
        }
        triangles = split4;
    }
    const result = { vertices, triangles, count };
    icosphereCache.set(subdivisions, result);
    return result;
}

/** A point moved a random distance (up to `distance`) in a random direction along the sphere, the same every time */
function jittered(px, py, pz, distance, seedHi, seedLo, index) {
    mul(0, index >>> 0, GOLDEN[0], GOLDEN[1]);
    let shi = (seedHi ^ out.hi) >>> 0, slo = (seedLo ^ out.lo) >>> 0;
    const next = () => {
        add(shi, slo, GOLDEN[0], GOLDEN[1]);
        shi = out.hi; slo = out.lo;
        mixState(shi, slo);
        return unit(out.hi, out.lo);
    };
    const [rx, ry, rz] = Math.abs(py) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    // east = normalize(cross(reference, point)), north = cross(point, east)
    let ex = ry * pz - rz * py, ey = rz * px - rx * pz, ez = rx * py - ry * px;
    let r = 1 / Math.sqrt(ex * ex + ey * ey + ez * ez);
    ex *= r; ey *= r; ez *= r;
    const nx = py * ez - pz * ey, ny = pz * ex - px * ez, nz = px * ey - py * ex;
    const angle = next() * 2 * Math.PI;
    const reach = Math.sqrt(next()) * distance;
    const c = Math.cos(angle), s = Math.sin(angle);
    const x = px + (ex * c + nx * s) * reach, y = py + (ey * c + ny * s) * reach, z = pz + (ez * c + nz * s) * reach;
    r = 1 / Math.sqrt(x * x + y * y + z * z);
    return [x * r, y * r, z * r];
}

/** A world's cell sites (flat Float64Array) and their triangulation, the same every time for the same style */
export function cells(style, subdivisions) {
    style = prepared(style);
    const { vertices, triangles, count } = icosphere(subdivisions);
    const spacing = Math.sqrt(4 * Math.PI / count);
    const [mixHi, mixLo] = split(0x5EED0000n + BigInt(subdivisions));
    const seedHi = (style.seedHi ^ mixHi) >>> 0, seedLo = (style.seedLo ^ mixLo) >>> 0;
    const sites = new Float64Array(count * 3);
    for (let i = 0; i < count; i++) {
        const p = jittered(vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2], spacing * 0.3, seedHi, seedLo, i);
        sites[i * 3] = p[0]; sites[i * 3 + 1] = p[1]; sites[i * 3 + 2] = p[2];
    }
    return { sites, triangles };
}

/**
 * Generates a surface: sites (Float64Array, flat x y z), colours (Float64Array, flat r g b, 0…1), the icosphere
 * triangles and, for climate and biome surfaces, heights (Float32Array) and rivers ({ from, to, halfWidth } along cell
 * edges). `progress(fraction)` is called now and then.
 */
export function generateVoronoiSurface(style, subdivisions, detailOctaves, progress) {
    style = prepared(style);
    const { sites, triangles } = cells(style, subdivisions);
    const count = sites.length / 3;
    const spacing = Math.sqrt(4 * Math.PI / count);
    let result;
    if (style.biomes) {
        const generate = style.polygonMap ? polygonSurface : biomeSurface;
        const { colors, heights, rivers, wet } = generate(style, sites, triangles, detailOctaves, spacing * 2, progress);
        result = { sites, colors, triangles, heights, rivers, wet };
    } else {
        const sea = seaLevel(style, icosphere);
        const colors = new Float64Array(count * 3);
        const wet = new Uint8Array(count);
        for (let i = 0; i < count; i++) {
            const px = sites[i * 3], py = sites[i * 3 + 1], pz = sites[i * 3 + 2];
            const c = color(style, px, py, pz, sea, detailOctaves);
            colors[i * 3] = c[0]; colors[i * 3 + 1] = c[1]; colors[i * 3 + 2] = c[2];
            wet[i] = isUnderwater(style, px, py, pz, sea, detailOctaves) ? 1 : 0;
            if (progress && (i & 4095) === 0) progress(i / count);
        }
        result = { sites, colors, triangles, heights: null, rivers: [], wet };
    }
    // Then the craters, into the finished surface, at least two cells across, on everything but water and sea ice
    strikeCraters(style, sites, result.colors, result.wet, 0, count, spacing * 2);
    // And the volcanoes, younger than the craters
    paintVolcanoes(style, sites, result.colors, result.wet, 0, count, detailOctaves);
    delete result.wet;
    return result;
}

/** Strikes craters into cells `start..<end` of a finished surface's colours (indexed from `start`), skipping water */
export function strikeCraters(style, sites, colors, wet, start, end, minimumRadius) {
    if (!(style.craterDensity > 0)) return;
    for (let i = start; i < end; i++) {
        const k = i - start;
        if (wet && wet[k]) continue;
        const c = cratered([colors[k * 3], colors[k * 3 + 1], colors[k * 3 + 2]], style,
            sites[i * 3], sites[i * 3 + 1], sites[i * 3 + 2], minimumRadius);
        colors[k * 3] = c[0]; colors[k * 3 + 1] = c[1]; colors[k * 3 + 2] = c[2];
    }
}

/** Paints volcanoes and lava over cells `start..<end` of a finished surface's colours (indexed from `start`) */
export function paintVolcanoes(style, sites, colors, wet, start, end, detailOctaves) {
    if (!(style.volcanism > 0)) return;
    for (let i = start; i < end; i++) {
        const k = i - start;
        const px = sites[i * 3], py = sites[i * 3 + 1], pz = sites[i * 3 + 2];
        const c = volcanicColor(style, [colors[k * 3], colors[k * 3 + 1], colors[k * 3 + 2]], px, py, pz,
            !!(wet && wet[k]), style.lavaSeas > 0 ? elevation(style, px, py, pz, detailOctaves) : 1, icosphere);
        colors[k * 3] = c[0]; colors[k * 3 + 1] = c[1]; colors[k * 3 + 2] = c[2];
    }
}

/**
 * Whether a point on the unit sphere lies in a cell drawn as water, just as the globe shows it: sea, frozen or open,
 * wherever the cell's site is below sea level, and lakes, told by their colour (every lake is a strong blue no land is)
 */
export function waterTest(surface, style) {
    style = prepared(style);
    const { sites, colors } = surface;
    const count = sites.length / 3;
    const lookup = new NearestSite(sites);
    const sea = seaLevel(style, icosphere);
    const hasSeas = style.kind === 'rocky' && style.waterFraction > 0;
    const wet = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
        const r = colors[i * 3], g = colors[i * 3 + 1], b = colors[i * 3 + 2];
        wet[i] = (hasSeas && elevation(style, sites[i * 3], sites[i * 3 + 1], sites[i * 3 + 2], 0) < sea) ||
            (b > 0.25 && b - r > 0.25 && b > g + 0.08) ? 1 : 0;
    }
    return (x, y, z) => wet[lookup.nearest(x, y, z)] === 1;
}

/**
 * The height of the globe's ground above its sphere at a point on the unit sphere, as a fraction of its radius, just
 * as globeMesh builds it; zero everywhere on a smooth globe
 */
export function reliefTest(surface) {
    const { sites, triangles, heights } = surface;
    if (!heights) return () => 0;
    const count = sites.length / 3;
    const triangleCount = triangles.length / 3;
    const centres = new Float64Array(triangleCount * 3);
    const centreHeights = new Float32Array(triangleCount);
    const incident = Array.from({ length: count }, () => []);
    for (let t = 0; t < triangleCount; t++) {
        const a = triangles[t * 3], b = triangles[t * 3 + 1], c = triangles[t * 3 + 2];
        const x = sites[a * 3] + sites[b * 3] + sites[c * 3];
        const y = sites[a * 3 + 1] + sites[b * 3 + 1] + sites[c * 3 + 1];
        const z = sites[a * 3 + 2] + sites[b * 3 + 2] + sites[c * 3 + 2];
        const r = 1 / Math.sqrt(x * x + y * y + z * z);
        centres[t * 3] = x * r; centres[t * 3 + 1] = y * r; centres[t * 3 + 2] = z * r;
        centreHeights[t] = (heights[a] + heights[b] + heights[c]) / 3;
        incident[a].push(t); incident[b].push(t); incident[c].push(t);
    }
    const fans = incident.map((list, i) => {
        const sx = sites[i * 3], sy = sites[i * 3 + 1], sz = sites[i * 3 + 2];
        const [rx, ry, rz] = Math.abs(sy) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        let ex = ry * sz - rz * sy, ey = rz * sx - rx * sz, ez = rx * sy - ry * sx;
        const er = 1 / Math.sqrt(ex * ex + ey * ey + ez * ez);
        ex *= er; ey *= er; ez *= er;
        const nx = sy * ez - sz * ey, ny = sz * ex - sx * ez, nz = sx * ey - sy * ex;
        const angle = (t) => Math.atan2(centres[t * 3] * nx + centres[t * 3 + 1] * ny + centres[t * 3 + 2] * nz,
            centres[t * 3] * ex + centres[t * 3 + 1] * ey + centres[t * 3 + 2] * ez);
        return list.sort((p, q) => angle(p) - angle(q));
    });
    const lookup = new NearestSite(sites);
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    return (x, y, z) => {
        const length = Math.sqrt(x * x + y * y + z * z);
        const d = [x / length, y / length, z / length];
        const cell = lookup.nearest(d[0], d[1], d[2]);
        const fan = fans[cell];
        const k = 1 + heights[cell];
        const apex = [sites[cell * 3] * k, sites[cell * 3 + 1] * k, sites[cell * 3 + 2] * k];
        for (let corner = 0; corner < fan.length; corner++) {
            const first = fan[corner], second = fan[(corner + 1) % fan.length];
            const kb = 1 + centreHeights[first], kc = 1 + centreHeights[second];
            const b = [centres[first * 3] * kb, centres[first * 3 + 1] * kb, centres[first * 3 + 2] * kb];
            const c = [centres[second * 3] * kc, centres[second * 3 + 1] * kc, centres[second * 3 + 2] * kc];
            const normal = cross(sub(b, apex), sub(c, apex));
            const along = dot(normal, d);
            if (!(Math.abs(along) > 1e-12)) continue;
            const scale = dot(normal, apex) / along;
            const hit = [d[0] * scale, d[1] * scale, d[2] * scale];
            const edges = [[apex, b], [b, c], [c, apex]].map(([p, q]) => dot(cross(sub(q, p), sub(hit, p)), normal));
            if (edges.every((e) => e >= -1e-12) || edges.every((e) => e <= 1e-12)) {
                return Math.sqrt(dot(hit, hit)) - 1;
            }
        }
        return heights[cell];
    };
}

/** The colours of classic cells `start..<end`, so a detailed map's cells can be coloured by several workers at once */
export function cellColors(style, subdivisions, detailOctaves, start, end, progress) {
    style = prepared(style);
    const { sites } = cells(style, subdivisions);
    const count = sites.length / 3;
    const spacing = Math.sqrt(4 * Math.PI / count);
    if (style.biomes) {
        const colour = style.polygonMap ? polygonCellColors : biomeCellColors;
        const result = colour(style, sites, start, end, detailOctaves, spacing * 2, progress);
        strikeCraters(style, sites, result.colors, result.wet, start, end, spacing * 2);
        paintVolcanoes(style, sites, result.colors, result.wet, start, end, detailOctaves);
        return result;
    }
    const sea = seaLevel(style, icosphere);
    const colors = new Float64Array((end - start) * 3);
    const wet = new Uint8Array(end - start);
    for (let i = start; i < end; i++) {
        const px = sites[i * 3], py = sites[i * 3 + 1], pz = sites[i * 3 + 2];
        const c = color(style, px, py, pz, sea, detailOctaves);
        const k = (i - start) * 3;
        colors[k] = c[0]; colors[k + 1] = c[1]; colors[k + 2] = c[2];
        wet[i - start] = isUnderwater(style, px, py, pz, sea, detailOctaves) ? 1 : 0;
        if (progress && (i & 4095) === 0) progress((i - start) / (end - start));
    }
    strikeCraters(style, sites, colors, wet, start, end, spacing * 2);
    paintVolcanoes(style, sites, colors, wet, start, end, detailOctaves);
    return { colors, wet: null };
}

/** Finds the cell a point on the sphere falls in (its nearest site) quickly, for sites spread evenly over it */
export class NearestSite {
    constructor(sites) {
        const count = sites.length / 3;
        const spacing = Math.sqrt(4 * Math.PI / count);
        this.sites = sites;
        this.bucketSize = spacing * 1.6;
        this.dimension = Math.trunc(Math.ceil(2 / this.bucketSize)) + 1;
        const d = this.dimension;
        const starts = new Int32Array(d * d * d + 1);
        const keys = new Int32Array(count);
        for (let i = 0; i < count; i++) {
            keys[i] = this.key(this.bucket(sites[i * 3]), this.bucket(sites[i * 3 + 1]), this.bucket(sites[i * 3 + 2]));
            starts[keys[i] + 1] += 1;
        }
        for (let k = 1; k < starts.length; k++) starts[k] += starts[k - 1];
        const members = new Int32Array(count);
        const fill = starts.slice();
        for (let i = 0; i < count; i++) members[fill[keys[i]]++] = i;
        this.starts = starts;
        this.members = members;
    }

    bucket(value) {
        return Math.min(Math.max(Math.trunc((value + 1) / this.bucketSize), 0), this.dimension - 1);
    }

    key(x, y, z) {
        return (z * this.dimension + y) * this.dimension + x;
    }

    nearest(px, py, pz) {
        const { sites, starts, members, dimension } = this;
        const bx = this.bucket(px), by = this.bucket(py), bz = this.bucket(pz);
        let nearest = 0, nearestDistance = Infinity;
        for (let z = Math.max(bz - 1, 0); z <= Math.min(bz + 1, dimension - 1); z++) {
            for (let y = Math.max(by - 1, 0); y <= Math.min(by + 1, dimension - 1); y++) {
                for (let x = Math.max(bx - 1, 0); x <= Math.min(bx + 1, dimension - 1); x++) {
                    const k = this.key(x, y, z);
                    for (let slot = starts[k]; slot < starts[k + 1]; slot++) {
                        const site = members[slot];
                        const dx = px - sites[site * 3], dy = py - sites[site * 3 + 1], dz = pz - sites[site * 3 + 2];
                        const distance = dx * dx + dy * dy + dz * dz;
                        if (distance < nearestDistance) {
                            nearestDistance = distance;
                            nearest = site;
                        }
                    }
                }
            }
        }
        return nearest;
    }
}

/**
 * RGBA pixels of an equirectangular map: each pixel takes the colour of the cell it falls in. As in the Mac app, the
 * search walks from the previous pixel's cell to whichever neighbouring cell is nearer until none is, so both apps
 * give every pixel the same cell even where a pixel lies right on an edge.
 */
export function mapPixels(surface, w, h, progress) {
    const { sites, colors, triangles } = surface;
    const count = sites.length / 3;
    if (w <= 0 || h <= 0 || count === 0) return new Uint8Array(0);
    const starts = new Int32Array(count + 1);
    for (let i = 0; i < triangles.length; i++) starts[triangles[i] + 1] += 1;
    for (let cell = 0; cell < count; cell++) starts[cell + 1] += starts[cell];
    const members = new Int32Array(starts[count]);
    const fill = starts.slice();
    for (let t = 0; t < triangles.length; t += 3) {
        const a = triangles[t], b = triangles[t + 1], c = triangles[t + 2];
        members[fill[a]++] = b;
        members[fill[b]++] = c;
        members[fill[c]++] = a;
    }
    const byte = (value) => Math.trunc(Math.min(Math.max(value, 0), 1) * 255);
    const palette = new Uint8Array(count * 3);
    for (let i = 0; i < count * 3; i++) palette[i] = byte(colors[i]);
    const rowCos = new Float64Array(h), rowSin = new Float64Array(h);
    for (let y = 0; y < h; y++) {
        const latitude = (0.5 - (y + 0.5) / h) * Math.PI;
        rowCos[y] = Math.cos(latitude); rowSin[y] = Math.sin(latitude);
    }
    const columnCos = new Float64Array(w), columnSin = new Float64Array(w);
    for (let x = 0; x < w; x++) {
        const longitude = (x + 0.5) / w * 2 * Math.PI;
        // As spherePoint: longitude runs east toward −z
        columnCos[x] = Math.cos(longitude); columnSin[x] = -Math.sin(longitude);
    }
    const walk = (start, px, py, pz) => {
        let current = start;
        let dx = sites[current * 3] - px, dy = sites[current * 3 + 1] - py, dz = sites[current * 3 + 2] - pz;
        let currentDistance = dx * dx + dy * dy + dz * dz;
        for (;;) {
            let best = current;
            for (let slot = starts[current]; slot < starts[current + 1]; slot++) {
                const neighbour = members[slot];
                dx = sites[neighbour * 3] - px; dy = sites[neighbour * 3 + 1] - py; dz = sites[neighbour * 3 + 2] - pz;
                const candidate = dx * dx + dy * dy + dz * dz;
                if (candidate < currentDistance) {
                    currentDistance = candidate;
                    best = neighbour;
                }
            }
            if (best === current) return current;
            current = best;
        }
    };
    // The first pixel's cell by a full search, then down the left edge row by row
    const fx = rowCos[0] * columnCos[0], fy = rowSin[0], fz = rowCos[0] * columnSin[0];
    const rowStarts = new Int32Array(h);
    let nearest = Infinity;
    for (let cell = 0; cell < count; cell++) {
        const dx = sites[cell * 3] - fx, dy = sites[cell * 3 + 1] - fy, dz = sites[cell * 3 + 2] - fz;
        const candidate = dx * dx + dy * dy + dz * dz;
        if (candidate < nearest) {
            nearest = candidate;
            rowStarts[0] = cell;
        }
    }
    for (let row = 1; row < h; row++) {
        rowStarts[row] = walk(rowStarts[row - 1], rowCos[row] * columnCos[0], rowSin[row], rowCos[row] * columnSin[0]);
    }
    const pixels = new Uint8Array(w * h * 4).fill(255);
    for (let row = 0; row < h; row++) {
        let cell = rowStarts[row];
        const cosLat = rowCos[row], sinLat = rowSin[row];
        for (let column = 0; column < w; column++) {
            cell = walk(cell, cosLat * columnCos[column], sinLat, cosLat * columnSin[column]);
            const index = (row * w + column) * 4;
            pixels[index] = palette[cell * 3];
            pixels[index + 1] = palette[cell * 3 + 1];
            pixels[index + 2] = palette[cell * 3 + 2];
        }
        if (progress && (row & 31) === 0) progress(row / h);
    }
    drawRivers(surface, pixels, w, h);
    return pixels;
}

/** Draws the rivers over a map's pixels as round-ended strokes along the cells' edges */
function drawRivers(surface, pixels, w, h) {
    const { sites, triangles, rivers } = surface;
    if (!rivers || rivers.length === 0) return;
    const byte = (value) => Math.trunc(Math.min(Math.max(value, 0), 1) * 255);
    const red = byte(riverColor[0]), green = byte(riverColor[1]), blue = byte(riverColor[2]);
    const xScale = w / (2 * Math.PI), yScale = h / Math.PI;
    const corner = (t) => {
        const a = triangles[t * 3], b = triangles[t * 3 + 1], c = triangles[t * 3 + 2];
        const x = sites[a * 3] + sites[b * 3] + sites[c * 3];
        const y = sites[a * 3 + 1] + sites[b * 3 + 1] + sites[c * 3 + 1];
        const z = sites[a * 3 + 2] + sites[b * 3 + 2] + sites[c * 3 + 2];
        const r = 1 / Math.sqrt(x * x + y * y + z * z);
        return [x * r, y * r, z * r];
    };
    for (const river of rivers) {
        const a = corner(river.from), b = corner(river.to);
        const angle = Math.acos(Math.min(Math.max(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1), 1));
        const radius = river.halfWidth;
        const steps = Math.max(Math.trunc(angle * yScale * 2) + 1, 1);
        for (let step = 0; step <= steps; step++) {
            const t = step / steps;
            let px = a[0] + (b[0] - a[0]) * t, py = a[1] + (b[1] - a[1]) * t, pz = a[2] + (b[2] - a[2]) * t;
            const r = 1 / Math.sqrt(px * px + py * py + pz * pz);
            px *= r; py *= r; pz *= r;
            const [latitude, longitude] = coordinate(px, py, pz);
            const x = longitude * xScale - 0.5, y = (Math.PI / 2 - latitude) * yScale - 0.5;
            const ry = Math.max(radius * yScale, 0.6), rx = Math.max(radius * xScale / Math.max(Math.cos(latitude), 0.02), 0.6);
            const top = Math.max(Math.ceil(y - ry), 0), bottom = Math.min(Math.floor(y + ry), h - 1);
            const left = Math.ceil(x - rx), right = Math.floor(x + rx);
            if (!(top <= bottom && left <= right)) continue;
            for (let row = top; row <= bottom; row++) {
                const dy = (row - y) / ry;
                for (let column = left; column <= right; column++) {
                    const dx = (column - x) / rx;
                    if (!(dx * dx + dy * dy <= 1)) continue;
                    const index = (row * w + (((column % w) + w) % w)) * 4;
                    pixels[index] = red;
                    pixels[index + 1] = green;
                    pixels[index + 2] = blue;
                }
            }
        }
    }
}

/**
 * Geometry for a globe built from the cells: each cell a flat-coloured polygon fanned out from its site, its corners
 * at the centres of the triangles around the site, so neighbouring cells share edges exactly. Returns flat arrays
 * ready for a three.js BufferGeometry, with one colour per vertex.
 */
export function globeMesh(sites, colors, triangles, radius, heights = null, rivers = []) {
    const count = sites.length / 3;
    const triangleCount = triangles.length / 3;
    const centres = new Float64Array(triangleCount * 3);
    const incidentCount = new Int32Array(count + 1);
    for (let t = 0; t < triangleCount; t++) {
        const a = triangles[t * 3], b = triangles[t * 3 + 1], c = triangles[t * 3 + 2];
        const x = sites[a * 3] + sites[b * 3] + sites[c * 3];
        const y = sites[a * 3 + 1] + sites[b * 3 + 1] + sites[c * 3 + 1];
        const z = sites[a * 3 + 2] + sites[b * 3 + 2] + sites[c * 3 + 2];
        const r = 1 / Math.sqrt(x * x + y * y + z * z);
        centres[t * 3] = x * r; centres[t * 3 + 1] = y * r; centres[t * 3 + 2] = z * r;
        incidentCount[a + 1]++; incidentCount[b + 1]++; incidentCount[c + 1]++;
    }
    const centreHeights = heights ? new Float32Array(triangleCount) : null;
    if (heights) {
        for (let t = 0; t < triangleCount; t++) {
            centreHeights[t] = (heights[triangles[t * 3]] + heights[triangles[t * 3 + 1]] + heights[triangles[t * 3 + 2]]) / 3;
        }
    }
    for (let i = 1; i <= count; i++) incidentCount[i] += incidentCount[i - 1];
    const incident = new Int32Array(triangles.length);
    const fill = incidentCount.slice();
    for (let t = 0; t < triangleCount; t++) {
        for (let k = 0; k < 3; k++) incident[fill[triangles[t * 3 + k]]++] = t;
    }

    const vertexTotal = count + triangles.length + (rivers?.length ?? 0) * 4;
    const positions = new Float32Array(vertexTotal * 3);
    const normals = new Float32Array(vertexTotal * 3);
    const vertexColors = new Float32Array(vertexTotal * 3);
    const indices = new Uint32Array(triangles.length * 3 + (rivers?.length ?? 0) * 6);
    let v = 0, n = 0;
    const corner = [];
    for (let i = 0; i < count; i++) {
        const sx = sites[i * 3], sy = sites[i * 3 + 1], sz = sites[i * 3 + 2];
        const [rx, ry, rz] = Math.abs(sy) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        let ex = ry * sz - rz * sy, ey = rz * sx - rx * sz, ez = rx * sy - ry * sx;
        const er = 1 / Math.sqrt(ex * ex + ey * ey + ez * ez);
        ex *= er; ey *= er; ez *= er;
        const nx = sy * ez - sz * ey, ny = sz * ex - sx * ez, nz = sx * ey - sy * ex;
        corner.length = 0;
        for (let k = incidentCount[i]; k < incidentCount[i + 1]; k++) {
            const t = incident[k];
            const cx = centres[t * 3], cy = centres[t * 3 + 1], cz = centres[t * 3 + 2];
            corner.push({ t, angle: Math.atan2(cx * nx + cy * ny + cz * nz, cx * ex + cy * ey + cz * ez) });
        }
        corner.sort((a, b) => a.angle - b.angle);

        const base = v;
        const cr = Math.min(Math.max(colors[i * 3], 0), 1), cg = Math.min(Math.max(colors[i * 3 + 1], 0), 1),
            cb = Math.min(Math.max(colors[i * 3 + 2], 0), 1);
        const addVertex = (x, y, z, height) => {
            const r = 1 / Math.sqrt(x * x + y * y + z * z);
            const lifted = radius * (1 + height);
            normals[v * 3] = x * r; normals[v * 3 + 1] = y * r; normals[v * 3 + 2] = z * r;
            positions[v * 3] = x * r * lifted; positions[v * 3 + 1] = y * r * lifted; positions[v * 3 + 2] = z * r * lifted;
            vertexColors[v * 3] = cr; vertexColors[v * 3 + 1] = cg; vertexColors[v * 3 + 2] = cb;
            v++;
        };
        addVertex(sx, sy, sz, heights ? heights[i] : 0);
        for (const c of corner) addVertex(centres[c.t * 3], centres[c.t * 3 + 1], centres[c.t * 3 + 2], heights ? centreHeights[c.t] : 0);
        const m = corner.length;
        for (let k = 0; k < m; k++) {
            const first = base + 1 + k, second = base + 1 + ((k + 1) % m);
            // Wind each triangle to face outward
            const ax = positions[base * 3], ay = positions[base * 3 + 1], az = positions[base * 3 + 2];
            const bx = positions[first * 3] - ax, by = positions[first * 3 + 1] - ay, bz = positions[first * 3 + 2] - az;
            const qx = positions[second * 3] - ax, qy = positions[second * 3 + 1] - ay, qz = positions[second * 3 + 2] - az;
            const outward = (by * qz - bz * qy) * ax + (bz * qx - bx * qz) * ay + (bx * qy - by * qx) * az;
            if (outward >= 0) { indices[n++] = base; indices[n++] = first; indices[n++] = second; }
            else { indices[n++] = base; indices[n++] = second; indices[n++] = first; }
        }
    }
    // Rivers: thin strips along cell edges, raised just clear of the ground on either side
    if (rivers && rivers.length) {
        const [rr, rg, rb] = riverColor.map((value) => Math.min(Math.max(value, 0), 1));
        for (const river of rivers) {
            const first = river.from, second = river.to;
            const ax = centres[first * 3], ay = centres[first * 3 + 1], az = centres[first * 3 + 2];
            const bx = centres[second * 3], by = centres[second * 3 + 1], bz = centres[second * 3 + 2];
            let heightA = 0, heightB = 0, lift = 0.0005;
            if (heights) {
                heightA = centreHeights[first];
                heightB = centreHeights[second];
                const ends = [triangles[first * 3], triangles[first * 3 + 1], triangles[first * 3 + 2]];
                const shared = [triangles[second * 3], triangles[second * 3 + 1], triangles[second * 3 + 2]].filter((x) => ends.includes(x));
                const ground = shared.length ? Math.max(...shared.map((x) => heights[x])) : 0;
                lift += Math.max(ground - Math.min(heightA, heightB), 0) * 0.35;
            }
            let lx = bx - ax, ly = by - ay, lz = bz - az;
            let r = 1 / Math.sqrt(lx * lx + ly * ly + lz * lz);
            lx *= r; ly *= r; lz *= r;
            let mx = ax + bx, my = ay + by, mz = az + bz;
            r = 1 / Math.sqrt(mx * mx + my * my + mz * mz);
            mx *= r; my *= r; mz *= r;
            let qx = ly * mz - lz * my, qy = lz * mx - lx * mz, qz = lx * my - ly * mx;
            r = river.halfWidth / Math.sqrt(qx * qx + qy * qy + qz * qz);
            qx *= r; qy *= r; qz *= r;
            const o = river.halfWidth * 0.8;
            const ox = lx * o, oy = ly * o, oz = lz * o;
            const base = v;
            for (const [x, y, z, height] of [[ax - ox + qx, ay - oy + qy, az - oz + qz, heightA],
                [ax - ox - qx, ay - oy - qy, az - oz - qz, heightA], [bx + ox - qx, by + oy - qy, bz + oz - qz, heightB],
                [bx + ox + qx, by + oy + qy, bz + oz + qz, heightB]]) {
                const k = 1 / Math.sqrt(x * x + y * y + z * z);
                const lifted = radius * (1 + height + lift);
                normals[v * 3] = x * k; normals[v * 3 + 1] = y * k; normals[v * 3 + 2] = z * k;
                positions[v * 3] = x * k * lifted; positions[v * 3 + 1] = y * k * lifted; positions[v * 3 + 2] = z * k * lifted;
                vertexColors[v * 3] = rr; vertexColors[v * 3 + 1] = rg; vertexColors[v * 3 + 2] = rb;
                v++;
            }
            for (const [p0, p1, p2] of [[base, base + 1, base + 2], [base, base + 2, base + 3]]) {
                const px = positions[p0 * 3], py = positions[p0 * 3 + 1], pz = positions[p0 * 3 + 2];
                const ux = positions[p1 * 3] - px, uy = positions[p1 * 3 + 1] - py, uz = positions[p1 * 3 + 2] - pz;
                const wx = positions[p2 * 3] - px, wy = positions[p2 * 3 + 1] - py, wz = positions[p2 * 3 + 2] - pz;
                const outward = (uy * wz - uz * wy) * px + (uz * wx - ux * wz) * py + (ux * wy - uy * wx) * pz;
                if (outward >= 0) { indices[n++] = p0; indices[n++] = p1; indices[n++] = p2; }
                else { indices[n++] = p0; indices[n++] = p2; indices[n++] = p1; }
            }
        }
    }
    return { positions: positions.subarray(0, v * 3), normals: normals.subarray(0, v * 3),
        colors: vertexColors.subarray(0, v * 3), indices: indices.subarray(0, n) };
}
