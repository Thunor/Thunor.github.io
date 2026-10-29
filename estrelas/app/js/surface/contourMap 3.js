//
//  contourMap.js
//  Estrelas (web)
//
//  A world's ground as contour lines, for maps printed as line drawings in the manner of a topographic map: the
//  coastline, contours over the land (every fifth an index contour, drawn bolder) and a few depth contours at sea.
//  Heights are sampled on a grid (in the surface workers) and the lines traced through it by marching squares, then
//  chained into runs so they print as smooth curves. A port of ContourMap.swift.
//

import { prepared, spherePoint, detailedOctaves } from './surfaceMap.js';
import { seaLevelKept } from './surfaceTerrain.js';
import { groundHeight } from './biomeSurface.js';
import { icosphere } from './voronoiSurface.js';
import { faces as netFaces, coordinate as netCoordinate } from './icosahedralMap.js';

/** Contours on land, between the shore (or the lowest ground on a world without seas) and the highest peak */
const landContours = 15;
/** How many depth contours at sea */
const depthContours = 3;
/** Samples across the equirectangular map */
export const mapColumns = 1024;
/** Samples along each edge of the icosahedral map's triangles */
export const faceSamples = 192;

// MARK: grids

/**
 * Where each sample of a grid lies on the sphere. `grid` is { kind: 'equirectangular' } (mapColumns + 1 by
 * mapColumns / 2 + 1 samples) or { kind: 'face', face } (a face of the icosahedral map, with a sample's margin round it).
 */
export function gridShape(grid) {
    if (grid.kind === 'equirectangular') {
        const columns = mapColumns + 1, rows = mapColumns / 2 + 1;
        return { columns, rows, point: (index) => {
            const column = index % columns, row = Math.trunc(index / columns);
            return spherePoint((0.5 - row / (rows - 1)) * Math.PI, column / (columns - 1) * 2 * Math.PI);
        } };
    }
    const face = netFaces[grid.face];
    const corners = face.corners;
    const lower = [Math.min(...corners.map((c) => c[0])), Math.min(...corners.map((c) => c[1]))];
    const upper = [Math.max(...corners.map((c) => c[0])), Math.max(...corners.map((c) => c[1]))];
    // A sample's margin past the triangle on every side
    const step = 1 / faceSamples;
    const origin = [lower[0] - step, lower[1] - step];
    const columns = Math.ceil((upper[0] - lower[0]) / step) + 3;
    const rows = Math.ceil((upper[1] - lower[1]) / step) + 3;
    const v0 = [corners[1][0] - corners[0][0], corners[1][1] - corners[0][1]];
    const v1 = [corners[2][0] - corners[0][0], corners[2][1] - corners[0][1]];
    const denominator = v0[0] * v1[1] - v1[0] * v0[1];
    return { columns, rows, origin, step, point: (index) => {
        // Weights within the face's plane, carried on past its edges, so the gnomonic projection extends smoothly
        const px = origin[0] + (index % columns) * step - corners[0][0];
        const py = origin[1] + Math.trunc(index / columns) * step - corners[0][1];
        const v = (px * v1[1] - v1[0] * py) / denominator;
        const w = (v0[0] * py - px * v0[1]) / denominator;
        const direction = [0, 1, 2].map((k) => face.vertices[0][k] * (1 - v - w) + face.vertices[1][k] * v + face.vertices[2][k] * w);
        const { latitude, longitude } = netCoordinate(direction);
        return spherePoint(latitude * Math.PI / 180, longitude * Math.PI / 180);
    } };
}

/** The ground's heights at samples `start..<end` of a grid, as the surface workers work them out */
export function gridHeights(style, grid, start, end) {
    style = prepared(style);
    const sea = seaLevelKept(style);
    const { point } = gridShape(grid);
    const heights = new Float64Array(end - start);
    for (let index = start; index < end; index++) {
        const [x, y, z] = point(index);
        heights[index - start] = groundHeight(style, x, y, z, sea, detailedOctaves);
    }
    return heights;
}

// MARK: levels

/** The heights the lines are drawn at: { seaLevel (null without seas), land: [{ height, isIndex }], depths } */
export function contourLevels(style) {
    style = prepared(style);
    const sea = seaLevelKept(style);
    const vertices = icosphere(5).vertices;
    let lowest = Infinity, highest = -Infinity;
    for (let i = 0; i < vertices.length; i += 3) {
        const height = groundHeight(style, vertices[i], vertices[i + 1], vertices[i + 2], sea, detailedOctaves);
        lowest = Math.min(lowest, height);
        highest = Math.max(highest, height);
    }
    const hasSeas = style.kind === 'rocky' && style.waterFraction > 0;
    const base = hasSeas ? sea : lowest;
    // Closer together low down, where most of the land lies, and wider apart up the mountains
    const land = [];
    for (let step = 1; step <= landContours; step++) {
        land.push({ height: base + (highest - base) * Math.pow(step / (landContours + 1), 1.5), isIndex: step % 5 === 0 });
    }
    const depths = [];
    if (hasSeas) for (let step = 1; step <= depthContours; step++) depths.push(sea - (sea - lowest) * step / (depthContours + 1));
    return { seaLevel: hasSeas ? sea : null, land, depths };
}

// MARK: marching squares

/**
 * Runs of points where the heights cross `level`, in grid coordinates [column, row]. Each crossing lies on an edge
 * between two samples; edge 2 × sample runs right of the sample and 2 × sample + 1 down from it.
 */
export function trace(heights, columns, rows, level) {
    if (columns < 2 || rows < 2) return [];
    const point = (edge) => {
        const sample = edge >> 1, column = sample % columns, row = Math.trunc(sample / columns);
        const other = edge % 2 === 0 ? sample + 1 : sample + columns;
        const a = heights[sample], b = heights[other];
        const t = a === b ? 0.5 : Math.min(Math.max((level - a) / (b - a), 0), 1);
        return edge % 2 === 0 ? [column + t, row] : [column, row + t];
    };
    const neighbours = new Map();
    const join = (a, b) => {
        if (!neighbours.has(a)) neighbours.set(a, []);
        if (!neighbours.has(b)) neighbours.set(b, []);
        neighbours.get(a).push(b);
        neighbours.get(b).push(a);
    };
    for (let row = 0; row < rows - 1; row++) {
        for (let column = 0; column < columns - 1; column++) {
            const topLeft = row * columns + column;
            const c0 = heights[topLeft], c1 = heights[topLeft + 1], c2 = heights[topLeft + columns + 1], c3 = heights[topLeft + columns];
            const shape = (c0 > level ? 8 : 0) | (c1 > level ? 4 : 0) | (c2 > level ? 2 : 0) | (c3 > level ? 1 : 0);
            if (shape === 0 || shape === 15) continue;
            const top = 2 * topLeft, bottom = 2 * (topLeft + columns);
            const left = 2 * topLeft + 1, right = 2 * (topLeft + 1) + 1;
            // Where two opposite corners are above, the cell's middle decides which way the lines run
            const middleAbove = (c0 + c1 + c2 + c3) / 4 > level;
            switch (shape) {
                case 1: case 14: join(left, bottom); break;
                case 2: case 13: join(bottom, right); break;
                case 3: case 12: join(left, right); break;
                case 4: case 11: join(top, right); break;
                case 6: case 9: join(top, bottom); break;
                case 7: case 8: join(left, top); break;
                case 5:
                    if (middleAbove) { join(left, top); join(bottom, right); } else { join(top, right); join(left, bottom); }
                    break;
                case 10:
                    if (middleAbove) { join(top, right); join(left, bottom); } else { join(left, top); join(bottom, right); }
                    break;
                default: break;
            }
        }
    }
    // Chained into runs: open ones from their loose ends first, then the closed loops left over
    const runs = [];
    const visited = new Set();
    const walk = (start) => {
        const run = [start];
        let previous = -1, current = start;
        visited.add(start);
        for (;;) {
            const next = neighbours.get(current)?.find((n) => n !== previous && !visited.has(n));
            if (next === undefined) break;
            run.push(next);
            visited.add(next);
            previous = current;
            current = next;
        }
        // Back round to the start, closing a loop
        if (run.length > 2 && neighbours.get(current)?.includes(start)) run.push(start);
        if (run.length > 1) runs.push(run.map(point));
    };
    for (const [edge, joined] of neighbours) if (joined.length === 1 && !visited.has(edge)) walk(edge);
    for (const edge of neighbours.keys()) if (!visited.has(edge)) walk(edge);
    return runs;
}

/** Every level's lines through a grid of heights, placed by `place` from grid coordinates: { coast, index, contours, depths } */
export function contourLines(levels, heights, columns, rows, place) {
    const lines = { coast: [], index: [], contours: [], depths: [] };
    const placed = (level) => trace(heights, columns, rows, level).map((run) => run.map(([x, y]) => place(x, y)));
    if (levels.seaLevel !== null) lines.coast.push(...placed(levels.seaLevel));
    for (const { height, isIndex } of levels.land) (isIndex ? lines.index : lines.contours).push(...placed(height));
    for (const depth of levels.depths) lines.depths.push(...placed(depth));
    return lines;
}

/**
 * Draws contour lines in the manner of a topographic map: brown contours over the land, every fifth bolder, dashed
 * blue depth contours at sea, and the coastline heavy and dark over them. `scale` is canvas pixels a layout point.
 */
export function drawContours(context, lines, scale) {
    const stroke = (runs, colour, width, dash = []) => {
        context.beginPath();
        for (const run of runs) {
            if (run.length < 2) continue;
            context.moveTo(run[0][0], run[0][1]);
            for (let k = 1; k < run.length; k++) context.lineTo(run[k][0], run[k][1]);
        }
        context.strokeStyle = colour;
        context.lineWidth = width * scale;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.setLineDash(dash.map((d) => d * scale));
        context.stroke();
        context.setLineDash([]);
    };
    stroke(lines.depths, 'rgb(51 102 179 / 0.7)', 0.5, [3, 2]);
    stroke(lines.contours, 'rgb(140 92 51 / 0.8)', 0.4);
    stroke(lines.index, 'rgb(140 92 51)', 0.9);
    stroke(lines.coast, 'black', 1.4);
}
