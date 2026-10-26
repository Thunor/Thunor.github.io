//
//  icosahedralMap.js
//  Estrelas (web)
//
//  The Traveller-style world map: the globe projected onto an icosahedron and unfolded into a strip of 20 triangles,
//  five around the north pole, ten around the equator and five around the south pole. Each face is a gnomonic
//  projection from the centre of the world. A port of IcosahedralMap.swift.
//

/** Height of a row of triangles, in units of a triangle's edge */
export const rowHeight = Math.sqrt(3) / 2;
/** The net is five and a half triangles wide and three rows high */
export const layoutSize = { width: 5.5, height: 3 * rowHeight };

const ringLatitude = Math.atan(0.5) * 180 / Math.PI;

export function unitVector(latitude, longitude) {
    const lat = latitude * Math.PI / 180, lon = longitude * Math.PI / 180;
    return [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)];
}

/** The 20 faces: corners in the flat layout (in triangle edges) and the matching icosahedron vertices */
export const faces = (() => {
    const north = unitVector(90, 0), south = unitVector(-90, 0);
    const upper = [0, 1, 2, 3, 4].map((i) => unitVector(ringLatitude, i * 72));
    const lower = [0, 1, 2, 3, 4].map((i) => unitVector(-ringLatitude, 36 + i * 72));
    const h = rowHeight;
    const result = [];
    for (let i = 0; i < 5; i++) {
        const x = i, next = (i + 1) % 5;
        result.push({ corners: [[x, h], [x + 1, h], [x + 0.5, 0]], vertices: [upper[i], upper[next], north] });
        result.push({ corners: [[x, h], [x + 1, h], [x + 0.5, 2 * h]], vertices: [upper[i], upper[next], lower[i]] });
        result.push({ corners: [[x + 0.5, 2 * h], [x + 1.5, 2 * h], [x + 1, h]], vertices: [lower[i], lower[next], upper[next]] });
        result.push({ corners: [[x + 0.5, 2 * h], [x + 1.5, 2 * h], [x + 1, 3 * h]], vertices: [lower[i], lower[next], south] });
    }
    return result;
})();

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** Latitude and longitude (0–360° east) of a direction from the world's centre */
export function coordinate(p) {
    const length = Math.hypot(...p);
    const latitude = Math.asin(Math.min(Math.max(p[2] / length, -1), 1)) * 180 / Math.PI;
    let longitude = Math.atan2(p[1], p[0]) * 180 / Math.PI;
    if (longitude < 0) longitude += 360;
    return { latitude, longitude };
}

/** Where a spot on the globe lands in the net, in triangle edges */
export function layoutPoint(latitude, longitude) {
    const p = unitVector(latitude, longitude);
    let face = faces[0], best = -Infinity;
    for (const f of faces) {
        const c = [0, 1, 2].map((k) => f.vertices[0][k] + f.vertices[1][k] + f.vertices[2][k]);
        const d = dot(c, p);
        if (d > best) { best = d; face = f; }
    }
    const [a, b, c] = face.vertices;
    const normal = cross(sub(b, a), sub(c, a));
    const k = dot(normal, a) / dot(normal, p);
    const q = p.map((v) => v * k);
    const v0 = sub(b, a), v1 = sub(c, a), v2 = sub(q, a);
    const d00 = dot(v0, v0), d01 = dot(v0, v1), d11 = dot(v1, v1), d20 = dot(v2, v0), d21 = dot(v2, v1);
    const denominator = d00 * d11 - d01 * d01;
    const v = (d11 * d20 - d01 * d21) / denominator, w = (d00 * d21 - d01 * d20) / denominator;
    const u = 1 - v - w;
    const corners = face.corners;
    return [u * corners[0][0] + v * corners[1][0] + w * corners[2][0], u * corners[0][1] + v * corners[1][1] + w * corners[2][1]];
}

/**
 * Reprojects an equirectangular RGBA image ({ width, height, pixels }) onto the net, `edge` pixels to a triangle's
 * side; outside the triangles the image is transparent
 */
export function renderNet(source, edge) {
    const sw = source.width, sh = source.height, src = source.pixels;
    const width = Math.ceil(layoutSize.width * edge), height = Math.ceil(layoutSize.height * edge);
    const pixels = new Uint8ClampedArray(width * height * 4);
    const tolerance = -0.75 / edge;
    for (const face of faces) {
        const [a, b, c] = face.corners.map(([x, y]) => [x * edge, y * edge]);
        const v0 = [b[0] - a[0], b[1] - a[1]], v1 = [c[0] - a[0], c[1] - a[1]];
        const denominator = v0[0] * v1[1] - v1[0] * v0[1];
        const minX = Math.max(Math.trunc(Math.min(a[0], b[0], c[0])) - 1, 0), maxX = Math.min(Math.trunc(Math.max(a[0], b[0], c[0])) + 1, width - 1);
        const minY = Math.max(Math.trunc(Math.min(a[1], b[1], c[1])) - 1, 0), maxY = Math.min(Math.trunc(Math.max(a[1], b[1], c[1])) + 1, height - 1);
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const px = x + 0.5 - a[0], py = y + 0.5 - a[1];
                const v = (px * v1[1] - v1[0] * py) / denominator;
                const w = (v0[0] * py - px * v0[1]) / denominator;
                const u = 1 - v - w;
                if (u < tolerance || v < tolerance || w < tolerance) continue;
                const point = [0, 1, 2].map((k) => face.vertices[0][k] * u + face.vertices[1][k] * v + face.vertices[2][k] * w);
                const { latitude, longitude } = coordinate(point);
                sample(src, sw, sh, longitude / 360 * sw - 0.5, (90 - latitude) / 180 * sh - 0.5, pixels, (y * width + x) * 4);
            }
        }
    }
    return { width, height, pixels };
}

function sample(source, width, height, x, y, output, offset) {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = x - x0, fy = y - y0;
    const left = ((x0 % width) + width) % width, right = (left + 1) % width;
    const top = Math.min(Math.max(y0, 0), height - 1), bottom = Math.min(Math.max(y0 + 1, 0), height - 1);
    const tl = (top * width + left) * 4, tr = (top * width + right) * 4, bl = (bottom * width + left) * 4, br = (bottom * width + right) * 4;
    for (let channel = 0; channel < 4; channel++) {
        const upper = source[tl + channel] * (1 - fx) + source[tr + channel] * fx;
        const lower = source[bl + channel] * (1 - fx) + source[br + channel] * fx;
        output[offset + channel] = Math.round(upper * (1 - fy) + lower * fy);
    }
}
