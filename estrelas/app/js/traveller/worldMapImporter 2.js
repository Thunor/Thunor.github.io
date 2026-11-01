//
//  worldMapImporter.js
//  Estrelas (web) — Traveller module
//
//  Reads the world maps TravellerMap has for some worlds into surface templates, so the world's globe keeps the seas,
//  continents, mountains, deserts and ice of its map. The maps were drawn by many hands over decades: most are
//  icosahedral nets (five triangles across with the north pole at their top apexes, a band of ten across the middle,
//  and five below with the south pole at their bottom apexes), some cut to wrap round the image's sides and some
//  whole, a few plain rectangular maps; in colour or in shades of grey, on white or black.
//
//  The layout is found from where the image is covered (see locateNet). Each template cell is then unfolded from the
//  map, and its colour taken as the median of the pixels round it, so the hex grid, labels and symbols drop out. Water
//  is told from land by how blue (or, in grey maps, how dark) the cells are, split where the colours divide nearest the
//  share of water the world's profile gives it. Elevation comes from the distance to the coast, raised where the map
//  draws mountains. A port of WorldMapImporter.swift.
//

/** The template's size: about 1.4° a cell, finer than the maps draw */
export const templateWidth = 256;
export const templateHeight = 128;
const width = templateWidth, height = templateHeight;

// MARK: the net

const point = (latitude, longitude) => [Math.cos(latitude) * Math.cos(longitude), Math.cos(latitude) * Math.sin(longitude),
    Math.sin(latitude)];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const normalize = (v) => {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
};

/** The inverse of the matrix with columns a, b and c, as rows */
function inverse(a, b, c) {
    const m = [[a[0], b[0], c[0]], [a[1], b[1], c[1]], [a[2], b[2], c[2]]];
    const det = m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
        + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const i = (r, col) => {
        const rows = [0, 1, 2].filter((x) => x !== col), cols = [0, 1, 2].filter((x) => x !== r);
        const minor = m[rows[0]][cols[0]] * m[rows[1]][cols[1]] - m[rows[0]][cols[1]] * m[rows[1]][cols[0]];
        return ((r + col) % 2 ? -1 : 1) * minor / det;
    };
    return [[i(0, 0), i(0, 1), i(0, 2)], [i(1, 0), i(1, 1), i(1, 2)], [i(2, 0), i(2, 1), i(2, 2)]];
}

/**
 * The twenty faces: corners in the net, in triangle edges (x) and heights (y) from the top apexes, centre on the
 * sphere, and what turns a point on the sphere into its barycentric coordinates. The north triangle k has its apex at
 * x = k and spans longitudes (k ± ½) × 72°; the upper ring's vertices lie at x = j + ½, the lower ring's at x = j.
 */
const faces = (() => {
    const ring = Math.atan(0.5);
    const north = [0, 0, 1], south = [0, 0, -1];
    const upper = (j) => point(ring, (j + 0.5) * Math.PI * 2 / 5);
    const lower = (j) => point(-ring, j * Math.PI * 2 / 5);
    const list = [];
    const add = (a, b, c, na, nb, nc) => list.push({ net: [na, nb, nc], centre: normalize([0, 1, 2].map((k) => a[k] + b[k] + c[k])),
        inverse: inverse(a, b, c) });
    for (let k = 0; k < 5; k++) {
        const x = k;
        add(north, upper(k - 1), upper(k), [x, 0], [x - 0.5, 1], [x + 0.5, 1]);
        add(upper(k - 1), upper(k), lower(k), [x - 0.5, 1], [x + 0.5, 1], [x, 2]);
        add(lower(k), lower(k + 1), upper(k), [x, 2], [x + 1, 2], [x + 0.5, 1]);
        add(lower(k), lower(k + 1), south, [x, 2], [x + 1, 2], [x + 0.5, 3]);
    }
    return list;
})();

/** Where a point on the sphere lies in the net, and how far it is from its face's edges (smallest barycentric weight) */
function netPosition(p) {
    let face = faces[0], best = -Infinity;
    for (const f of faces) {
        const d = dot(f.centre, p);
        if (d > best) {
            best = d;
            face = f;
        }
    }
    // Through the gnomonic projection onto the face's plane
    let w = face.inverse.map((row) => dot(row, p));
    const sum = w[0] + w[1] + w[2];
    w = w.map((x) => x / sum);
    const [a, b, c] = face.net;
    return { position: [a[0] * w[0] + b[0] * w[1] + c[0] * w[2], a[1] * w[0] + b[1] * w[1] + c[1] * w[2]],
        edgeness: Math.min(w[0], w[1], w[2]) };
}

// MARK: pixels

/** An RGBA image, and the colour of the space round the map */
class Pixels {
    constructor(imageData) {
        this.width = imageData.width;
        this.height = imageData.height;
        this.bytes = imageData.data;
        this.background = [255, 255, 255];
        this.background = this.findBackground();
    }

    rgb(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
        const i = (y * this.width + x) * 4;
        return [this.bytes[i], this.bytes[i + 1], this.bytes[i + 2]];
    }

    /** Whether a pixel is the background's colour */
    isBlank(x, y) {
        const c = this.rgb(x, y);
        if (!c) return true;
        const b = this.background;
        return Math.abs(c[0] - b[0]) + Math.abs(c[1] - b[1]) + Math.abs(c[2] - b[2]) < 45;
    }

    /** The colour most of the corners share, which is the space round a net (white, mostly; black on a few) */
    findBackground() {
        const size = Math.max(Math.trunc(Math.min(this.width, this.height) / 40), 3);
        const median = (values) => values.sort((a, b) => a - b)[Math.trunc(values.length / 2)];
        const corners = [[0, 0], [this.width - size, 0], [0, this.height - size], [this.width - size, this.height - size]].map(([x0, y0]) => {
            const r = [], g = [], b = [];
            for (let y = y0; y < y0 + size; y++) {
                for (let x = x0; x < x0 + size; x++) {
                    const c = this.rgb(x, y);
                    if (c) { r.push(c[0]); g.push(c[1]); b.push(c[2]); }
                }
            }
            return [median(r), median(g), median(b)];
        });
        const close = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 60;
        let best = corners[0];
        for (const candidate of corners) {
            const cb = corners.filter((c) => close(c, best)).length, cc = corners.filter((c) => close(c, candidate)).length;
            if (cc > cb || (cc === cb && candidate[0] + candidate[1] + candidate[2] > best[0] + best[1] + best[2])) best = candidate;
        }
        return best ?? [255, 255, 255];
    }
}

// MARK: finding the map

/** The pixel showing a point on the sphere, and how far it is from the net's edges (⅓ on rectangular maps) */
function netPixel(net, latitude, longitude, imageWidth, imageHeight) {
    if (net.rectangular) return [longitude / (2 * Math.PI) * imageWidth, (0.5 - latitude / Math.PI) * imageHeight, 1 / 3];
    const { position, edgeness } = netPosition(point(latitude, longitude));
    let x = net.apex + position[0] * net.edge;
    if (net.wraps) {
        x %= imageWidth;
        if (x < 0) x += imageWidth;
    }
    return [x, net.top + position[1] * net.triangle, edgeness];
}

/** Finds the map, read both ways, whichever finds the net more clearly */
export function locateNet(pixels) {
    const plain = locateNetBy(pixels, false);
    if (!plain.rectangular && plain.score >= 0.8) return plain;
    const flooded = locateNetBy(pixels, true);
    return flooded.score > plain.score ? flooded : plain;
}

/**
 * Finds the map, taking either every pixel of the background's colour as uncovered or (`flooding`) only those reached
 * from the image's edges, so white land inside the net's outlines counts as covered. Across each row, the share of the
 * image a net covers traces a trapezoid: rising through the north triangles, level across the band and falling
 * through the south ones, which gives the top and the triangles' height. The apexes are then where the north
 * triangles' middle rows are covered; a map with no such teeth along its top is taken to be rectangular.
 */
function locateNetBy(pixels, flooding) {
    const rectangular = { edge: 0, triangle: 0, top: 0, apex: 0, wraps: true, rectangular: true, score: 0 };
    const step = 2;
    const columns = Math.trunc(pixels.width / step), rows = Math.trunc(pixels.height / step);
    if (columns <= 50 || rows <= 30) return rectangular;
    const covered = new Uint8Array(columns * rows).fill(1);
    const queue = [];
    // Blank, and not just a thin white line, as the grids drawn over seas are, which would let the flood in
    const open = (x, y) => pixels.isBlank(x, y) && (!flooding || (pixels.isBlank(x - 2, y) && pixels.isBlank(x + 2, y)
        && pixels.isBlank(x, y - 2) && pixels.isBlank(x, y + 2)));
    const reach = (column, row) => {
        const index = row * columns + column;
        if (!covered[index] || !open(column * step, row * step)) return;
        covered[index] = 0;
        queue.push(index);
    };
    if (!flooding) {
        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                if (pixels.isBlank(column * step, row * step)) covered[row * columns + column] = 0;
            }
        }
    } else {
        for (let column = 0; column < columns; column++) { reach(column, 0); reach(column, rows - 1); }
        for (let row = 0; row < rows; row++) { reach(0, row); reach(columns - 1, row); }
    }
    for (let head = 0; head < queue.length; head++) {
        const index = queue[head];
        const column = index % columns, row = Math.trunc(index / columns);
        if (column > 0) reach(column - 1, row);
        if (column < columns - 1) reach(column + 1, row);
        if (row > 0) reach(column, row - 1);
        if (row < rows - 1) reach(column, row + 1);
    }
    let coverage = [];
    for (let row = 0; row < rows; row++) {
        let count = 0;
        for (let column = 0; column < columns; column++) count += covered[row * columns + column];
        coverage.push(count / columns);
    }
    // A median over a few rows removes the dashed lines some maps draw between the triangles
    coverage = coverage.map((_, row) => {
        const window = [];
        for (let r = Math.max(row - 3, 0); r <= Math.min(row + 3, rows - 1); r++) window.push(coverage[r]);
        window.sort((a, b) => a - b);
        return window[Math.trunc(window.length / 2)];
    });
    const full = [...coverage].sort((a, b) => a - b)[Math.trunc(rows * 9 / 10)];
    if (!(full > 0.3)) return rectangular;
    let best = { error: Infinity, top: 0, height: 0 };
    for (let h = Math.trunc(rows / 5); h <= Math.trunc(rows / 3) + 1; h++) {
        for (let top = 0; top <= Math.max(rows - 3 * h, 0); top++) {
            let error = 0;
            for (let row = 0; row < rows; row++) {
                const t = (row - top) / h;
                const expected = t < 0 ? 0 : t < 1 ? t * full : t < 2 ? full : t < 3 ? (3 - t) * full : 0;
                const difference = coverage[row] - expected;
                error += difference * difference;
            }
            if (error < best.error) best = { error, top, height: h };
        }
    }
    let triangle = best.height * step;
    const top = best.top * step;
    let edge = triangle * 2 / Math.sqrt(3);
    // A net five triangles across fills the width and wraps, exactly; a whole one leaves part of it uncovered
    const wraps = edge * 5 >= pixels.width * 0.96;
    if (wraps) {
        edge = pixels.width / 5;
        triangle = edge * Math.sqrt(3) / 2;
    }
    // Each column's coverage through the north triangles' middle rows, where each is half an edge wide
    const bandTop = Math.trunc((top + triangle * 0.35) / step), bandBottom = Math.trunc((top + triangle * 0.65) / step);
    if (!(bandBottom > bandTop)) return rectangular;
    const columnCoverage = [];
    for (let column = 0; column < columns; column++) {
        let count = 0;
        for (let row = bandTop; row < Math.min(bandBottom, rows); row++) count += covered[row * columns + column];
        columnCoverage.push(count / (bandBottom - bandTop));
    }
    let bestApex = { score: -Infinity, apex: 0 };
    const edgeColumns = edge / step;
    for (let candidate = 0; candidate < edgeColumns; candidate += 0.5) {
        let inside = 0, insideCount = 0, outside = 0, outsideCount = 0;
        for (let column = 0; column < columns; column++) {
            // Distance to the nearest apex, in edges
            const offset = (column - candidate) / edgeColumns;
            const k = Math.round(offset);
            if (!wraps && (k < 0 || k > 4)) continue;
            if (Math.abs(offset - k) < 0.2) {
                inside += columnCoverage[column]; insideCount += 1;
            } else if (Math.abs(offset - k) > 0.3) {
                outside += columnCoverage[column]; outsideCount += 1;
            }
        }
        const score = inside / Math.max(insideCount, 1) - outside / Math.max(outsideCount, 1);
        if (score > bestApex.score) bestApex = { score, apex: candidate * step };
    }
    // No teeth: the map isn't a net
    if (!(bestApex.score > 0.35)) return { ...rectangular, score: bestApex.score };
    return { edge, triangle, top, apex: bestApex.apex, wraps, rectangular: false, score: bestApex.score };
}

/** Whether hardly any of the map has colour to it */
function isGreyscale(pixels) {
    let coloured = 0, counted = 0;
    for (let y = 0; y < pixels.height; y += 4) {
        for (let x = 0; x < pixels.width; x += 4) {
            const c = pixels.rgb(x, y);
            if (!c || pixels.isBlank(x, y)) continue;
            counted += 1;
            if (Math.max(...c) - Math.min(...c) > 30) coloured += 1;
        }
    }
    return counted === 0 || coloured / counted < 0.05;
}

// MARK: reading the map

/** Tan desert; not the bright yellow some maps shade highlands with, which has hardly any blue */
const isDesert = (r, g, b) => r > 150 && r >= g && r - b > 35 && r - g < 50 && g - b > 15 && b > 80;
/** The blue-grey dots some maps draw ice with: greyish, unlike the clear blues of seas */
const isIce = (r, g, b) => r >= 105 && r <= 165 && g > r && g < 192 && b > r + 15 && b - r < 70 && g - r < 45;

/** The pixels of a JPEG (or any image the browser reads) */
async function decodeImage(bytes) {
    const bitmap = await createImageBitmap(new Blob([bytes]));
    const canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(bitmap.width, bitmap.height)
        : Object.assign(document.createElement('canvas'), { width: bitmap.width, height: bitmap.height });
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(bitmap, 0, 0);
    bitmap.close?.();
    return context.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * A surface template from a TravellerMap world map image's bytes, as { width, height, elevation, ice, aridity, greenery }
 * (Uint8Arrays), or null if it can't be read as one. `waterPercent`, the world's share of water, settles where water
 * ends and land begins; without it, wherever the colours divide.
 */
export async function templateFromImage(bytes, waterPercent = null) {
    let pixels;
    try {
        pixels = new Pixels(await decodeImage(bytes));
    } catch {
        return null;
    }
    const net = locateNet(pixels);
    const greyscale = isGreyscale(pixels);
    const count = width * height;

    // Each cell's colour (null where only lines and lettering were found), and what else the map shows
    const colours = new Array(count).fill(null);
    const desert = new Uint8Array(count), green = new Uint8Array(count), ice = new Uint8Array(count);
    const darkness = new Float64Array(count);
    const scale = net.rectangular ? pixels.width / 5 : net.edge;
    const window = Math.max(Math.trunc(scale / 60), 2);
    // Big images are sampled sparsely: no more than 9 × 9 pixels a cell
    const stride = Math.max(Math.trunc(window / 4), 1);
    const median = (values) => values.sort((a, b) => a - b)[Math.trunc(values.length / 2)];
    for (let row = 0; row < height; row++) {
        const latitude = (0.5 - (row + 0.5) / height) * Math.PI;
        for (let column = 0; column < width; column++) {
            const longitude = (column + 0.5) / width * 2 * Math.PI;
            const [x, y, edgeness] = netPixel(net, latitude, longitude, pixels.width, pixels.height);
            const reds = [], greens = [], blues = [];
            let dark = 0, icy = 0, counted = 0;
            for (let dy = -window; dy <= window; dy += stride) {
                for (let dx = -window; dx <= window; dx += stride) {
                    let px = Math.trunc(x) + dx;
                    if (net.wraps) px = (px + pixels.width) % pixels.width;
                    const c = pixels.rgb(px, Math.trunc(y) + dy);
                    if (!c) continue;
                    const [r, g, b] = c;
                    counted += 1;
                    // Lines and lettering are left out of the colour
                    if (Math.trunc((r * 3 + g * 6 + b) / 10) < 70) {
                        dark += 1;
                        continue;
                    }
                    reds.push(r); greens.push(g); blues.push(b);
                    if (!greyscale && isIce(r, g, b)) icy += 1;
                }
            }
            const index = row * width + column;
            // The net's own edges are drawn as lines too, which aren't mountains
            darkness[index] = counted > 0 && edgeness > 0.07 ? dark / counted : 0;
            if (!reds.length) continue;
            const r = median(reds), g = median(greens), b = median(blues);
            colours[index] = [r, g, b];
            desert[index] = !greyscale && isDesert(r, g, b) ? 1 : 0;
            green[index] = !greyscale && g - r > 25 && g - b > 5 ? 1 : 0;
            // The net's edges and the hex grid are drawn in about ice's grey-blue, but as thin lines: ice only where it
            // fills much of the window, as the maps' dotted ice does
            ice[index] = icy >= counted * 0.5 ? 1 : 0;
        }
    }
    if (!colours.some((c) => c !== null)) return null;
    const isLand = landAndWater(colours, greyscale, waterPercent);
    smooth(isLand);
    return build(isLand, desert, green, ice, darkness);
}

// MARK: cleaning up

const neighbourTable = (() => {
    const table = new Array(width * height);
    for (let index = 0; index < width * height; index++) {
        const row = Math.trunc(index / width), column = index % width;
        const result = [];
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const r = row + dy;
                if (r < 0 || r >= height) continue;
                result.push(r * width + (column + dx + width) % width);
            }
        }
        table[index] = result;
    }
    return table;
})();

const areaWeight = (index) => Math.cos((0.5 - (Math.trunc(index / width) + 0.5) / height) * Math.PI);

/**
 * Cells where nothing but lines and lettering was found take the average of those round them, growing in from their
 * edges, and every cell is then softened a little with its neighbours, which clears the hex grid's texture
 */
function fill(input) {
    const values = [...input];
    let pending = values.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0);
    while (pending.length) {
        const filled = [];
        for (const index of pending) {
            const known = neighbourTable[index].map((n) => values[n]).filter((v) => v !== null);
            if (known.length) filled.push([index, known.reduce((a, b) => a + b, 0) / known.length]);
        }
        if (!filled.length) break;
        for (const [index, value] of filled) values[index] = value;
        pending = pending.filter((i) => values[i] === null);
    }
    const known = values.map((v) => v ?? 0);
    return known.map((value, index) => {
        const around = neighbourTable[index];
        return (value * 4 + around.reduce((sum, n) => sum + known[n], 0)) / (around.length + 4);
    });
}

/**
 * Which cells are land. The waterier cells are water, up to where the wateriness divides most cleanly (the greatest
 * variance between the two sides), looked for near the world's share of water, or anywhere without one.
 */
function split(wateriness, waterPercent) {
    const order = wateriness.map((_, i) => i).sort((a, b) => wateriness[b] - wateriness[a] || a - b);
    const total = order.reduce((sum, i) => sum + areaWeight(i), 0);
    const wanted = waterPercent === null || waterPercent === undefined ? null : Math.min(Math.max(waterPercent / 100, 0), 1);
    if (wanted === 0) return { isLand: new Uint8Array(wateriness.length).fill(1), clarity: 1 };
    const [low, high] = wanted === null ? [0.02, 0.98] : [Math.max(wanted - 0.12, 0.01), Math.min(wanted + 0.12, 1)];
    const mean = order.reduce((sum, i) => sum + wateriness[i] * areaWeight(i), 0) / total;
    let wet = 0, wetSum = 0;
    let best = { score: -Infinity, count: 0 };
    order.forEach((index, position) => {
        wet += areaWeight(index);
        wetSum += wateriness[index] * areaWeight(index);
        const share = wet / total;
        if (share < low || share > high) return;
        const dryShare = 1 - share;
        const wetMean = wetSum / wet;
        const dryMean = dryShare > 1e-9 ? (mean * total - wetSum) / (total - wet) : wetMean;
        const score = share * dryShare * (wetMean - dryMean) * (wetMean - dryMean);
        if (score > best.score) best = { score, count: position + 1 };
    });
    const isLand = new Uint8Array(wateriness.length).fill(1);
    for (const index of order.slice(0, best.count)) isLand[index] = 0;
    // How much of the variance the split explains: near 1 where water and land are drawn in distinct colours
    const variance = order.reduce((sum, i) => sum + Math.pow(wateriness[i] - mean, 2) * areaWeight(i), 0) / total;
    return { isLand, clarity: variance > 1e-9 ? Math.max(best.score, 0) / variance : 0 };
}

/**
 * Which cells are land. Maps draw water in many ways — blue, darker, or in a colour on white land — so each measure is
 * tried, and the one that divides the map most cleanly near the world's share of water is taken, blueness first among
 * near equals. Greyscale maps can only be read by their shades, the darker being water.
 */
function landAndWater(colours, greyscale, waterPercent) {
    const blueness = ([r, g, b]) => b - (r + g) / 2;
    const darkness = ([r, g, b]) => 255 - Math.trunc((r * 3 + g * 6 + b) / 10);
    const saturation = ([r, g, b]) => Math.max(r, g, b) - Math.min(r, g, b);
    const measures = greyscale ? [[0.85, darkness]] : [[1, blueness], [0.85, darkness], [0.75, saturation]];
    let best = null;
    for (const [weight, measure] of measures) {
        const values = fill(colours.map((c) => (c ? measure(c) : null)));
        const { isLand, clarity } = split(values, waterPercent);
        const score = clarity * weight;
        if (score > (best?.score ?? -1)) best = { score, isLand };
    }
    return best?.isLand ?? new Uint8Array(colours.length).fill(1);
}

/** A cell nearly all of whose neighbours are the other of land and water joins them */
function smooth(isLand) {
    const before = Uint8Array.from(isLand);
    for (let index = 0; index < before.length; index++) {
        const land = neighbourTable[index].filter((n) => before[n]).length;
        if (before[index] && land <= 1) isLand[index] = 0;
        if (!before[index] && land >= 7) isLand[index] = 1;
    }
}

/** Steps from each cell to the nearest cell where `isTarget` holds, across the sides */
function distance(isTarget) {
    const result = new Int32Array(width * height).fill(0x7FFFFFFF);
    const queue = [];
    for (let index = 0; index < result.length; index++) {
        if (isTarget(index)) {
            result[index] = 0;
            queue.push(index);
        }
    }
    for (let head = 0; head < queue.length; head++) {
        const index = queue[head];
        for (const n of neighbourTable[index]) {
            if (result[n] === 0x7FFFFFFF) {
                result[n] = result[index] + 1;
                queue.push(n);
            }
        }
    }
    return result;
}

function blur(input, passes) {
    let values = Float64Array.from(input);
    for (let pass = 0; pass < passes; pass++) {
        const before = values;
        values = new Float64Array(before.length);
        for (let index = 0; index < before.length; index++) {
            const around = neighbourTable[index];
            values[index] = (before[index] * 2 + around.reduce((sum, n) => sum + before[n], 0)) / (around.length + 2);
        }
    }
    return values;
}

// MARK: building the template

function build(isLand, desert, green, ice, darkness) {
    const count = width * height;
    const toSea = distance((i) => !isLand[i]);
    const toLand = distance((i) => isLand[i]);
    // Mountain symbols only count on land, spread a little round each one, and only beyond the land's usual darkness,
    // which is its hex grid (and other lines) where the map draws one over it
    const landDarkness = [];
    for (let i = 0; i < count; i++) if (isLand[i]) landDarkness.push(darkness[i]);
    landDarkness.sort((a, b) => a - b);
    const baseline = landDarkness.length ? landDarkness[Math.trunc(landDarkness.length * 3 / 4)] : 0;
    const mountains = blur(Array.from({ length: count }, (_, i) => (isLand[i] ? Math.min(Math.max(darkness[i] - baseline, 0) * 6, 1) : 0)), 3);

    const elevation = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
        let value;
        if (isLand[i]) {
            // Rising inland, steeply under the mountains
            const inland = Math.min(toSea[i], 40);
            value = 132 + Math.min(inland * 2.5, 45) + mountains[i] * 90;
        } else {
            // Deepening offshore
            const offshore = Math.min(toLand[i], 60);
            value = 124 - Math.min(offshore * 5, 100);
        }
        elevation[i] = Math.min(Math.max(Math.round(value), 0), 255);
    }
    const bytes = (values) => Uint8Array.from(values, (v) => Math.min(Math.max(Math.trunc(v), 0), 255));
    return {
        width, height, elevation,
        ice: bytes(blur(Array.from(ice, (v) => (v ? 255 : 0)), 1)),
        aridity: bytes(blur(Array.from({ length: count }, (_, i) => (isLand[i] && desert[i] ? 255 : 0)), 2)),
        // Land the map draws green stays green, except high in the mountains
        greenery: bytes(blur(Array.from({ length: count }, (_, i) => (isLand[i] && green[i] ? 255 * (1 - mountains[i] * 0.6) : 0)), 1)),
    };
}

// MARK: saving

async function deflateRaw(bytes) {
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
}

function base64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(binary);
}

/** A template in its saved form (see surfaceTemplate.js): each field zlib-compressed (raw DEFLATE) and base64 */
export async function savedTemplate(template) {
    const field = async (bytes) => base64(await deflateRaw(bytes));
    const saved = { width: template.width, height: template.height, compression: 'zlib',
        elevation: await field(template.elevation), ice: await field(template.ice), aridity: await field(template.aridity) };
    if (template.greenery) saved.greenery = await field(template.greenery);
    return saved;
}
