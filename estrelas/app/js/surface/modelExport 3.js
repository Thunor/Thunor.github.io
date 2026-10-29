//
//  modelExport.js
//  Estrelas (web)
//
//  Writing a world's globe, its relief and its flat-coloured cells, as a 3D model other apps can open: Wavefront OBJ
//  (for Blender and most other 3D tools, with each cell's colour on its vertices) or STL (for slicers, to 3D print
//  it), with a stand or a loop to hang it by if wanted. A port of ModelExport.swift.
//

import { globeMesh } from './voronoiSurface.js';

export const modelFormats = [
    { id: 'obj', title: 'OBJ Model…', extension: 'obj', type: 'model/obj' },
    { id: 'stl', title: 'STL Model for 3D Printing…', extension: 'stl', type: 'model/stl' },
];
export const mounts = [
    { id: 'none', title: 'None' }, { id: 'stand', title: 'Stand at the south pole' }, { id: 'loop', title: 'Loop at the north pole' },
];

/** The globe's radius in the model, in metres, so it opens at a sensible size */
const radius = 1;
/** The printed globe's radius in millimetres: 100 mm across, which most printers take and a slicer can scale */
const printRadius = 50;
/** The mount's colour: a dark bronze, like a desk globe's fittings */
const mountColor = [0.45, 0.33, 0.18];
const segments = 48;

/** A world's globe (as dataStore.globe gives it) as a mesh: positions, normals, colours, indices, and how many indices are ground */
function meshOf(globe) {
    const mesh = globeMesh(globe.sites, globe.colors, globe.triangles, radius, globe.heights, globe.rivers);
    // Every cell's fan comes first, three indices for each of its corners: as many as the triangles have corners
    mesh.groundIndexCount = Math.min(globe.triangles.length * 3, mesh.indices.length);
    return mesh;
}

/**
 * A stand or hanging loop for an exported globe, sized to the globe and fixed to its pole. North is +y. Each part sinks
 * a little into the globe (and into the next part), so a print comes out in one piece.
 */
function mountMesh(mount, mesh) {
    if (mount === 'none') return null;
    const positions = [], normals = [], indices = [];
    const addVertex = (p, n) => {
        positions.push(p);
        normals.push(n);
    };
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    // Wound so the triangle faces the way its vertices' normals point
    const addTriangle = (a, b, c) => {
        const facing = cross(sub(positions[b], positions[a]), sub(positions[c], positions[a]));
        const n = [0, 1, 2].map((k) => normals[a][k] + normals[b][k] + normals[c][k]);
        if (facing[0] * n[0] + facing[1] * n[1] + facing[2] * n[2] >= 0) indices.push(a, b, c);
        else indices.push(a, c, b);
    };
    const ring = Array.from({ length: segments }, (_, index) => {
        const angle = index / segments * 2 * Math.PI;
        return [Math.cos(angle), 0, Math.sin(angle)];
    });
    const addCylinder = (r, bottom, top) => {
        const side = positions.length;
        for (const d of ring) {
            addVertex([d[0] * r, bottom, d[2] * r], d);
            addVertex([d[0] * r, top, d[2] * r], d);
        }
        for (let index = 0; index < segments; index++) {
            const next = (index + 1) % segments;
            const b0 = side + index * 2, t0 = b0 + 1, b1 = side + next * 2, t1 = b1 + 1;
            addTriangle(b0, t0, t1);
            addTriangle(b0, t1, b1);
        }
        for (const [y, normal] of [[bottom, [0, -1, 0]], [top, [0, 1, 0]]]) {
            const centre = positions.length;
            addVertex([0, y, 0], normal);
            for (const d of ring) addVertex([d[0] * r, y, d[2] * r], normal);
            for (let index = 0; index < segments; index++) addTriangle(centre, centre + 1 + index, centre + 1 + (index + 1) % segments);
        }
    };
    const addTorus = (centre, r, tube) => {
        const around = segments, across = segments / 2;
        const first = positions.length;
        for (let step = 0; step < around; step++) {
            const angle = step / around * 2 * Math.PI;
            const outward = [Math.cos(angle), Math.sin(angle), 0];
            for (let t = 0; t < across; t++) {
                const tubeAngle = t / across * 2 * Math.PI;
                const n = [outward[0] * Math.cos(tubeAngle), outward[1] * Math.cos(tubeAngle), Math.sin(tubeAngle)];
                addVertex([0, 1, 2].map((k) => centre[k] + outward[k] * r + n[k] * tube), n);
            }
        }
        for (let step = 0; step < around; step++) {
            for (let t = 0; t < across; t++) {
                const a = first + step * across + t, b = first + ((step + 1) % around) * across + t;
                const c = first + ((step + 1) % around) * across + (t + 1) % across, d = first + step * across + (t + 1) % across;
                addTriangle(a, b, c);
                addTriangle(a, c, d);
            }
        }
    };
    // The ground's heights along the axis, leaving out the rivers' strips raised over it
    let lowest = Infinity, highest = -Infinity;
    for (let k = 0; k < mesh.groundIndexCount; k++) {
        const y = mesh.positions[mesh.indices[k] * 3 + 1];
        lowest = Math.min(lowest, y);
        highest = Math.max(highest, y);
    }
    if (mount === 'stand') {
        const south = Number.isFinite(lowest) ? lowest : -radius;
        const rodBottom = south - 0.35 * radius;
        // A collar where the rod meets the globe, a thin rod, and a broad, flat foot
        addCylinder(0.06 * radius, south - 0.03 * radius, south + 0.04 * radius);
        addCylinder(0.025 * radius, rodBottom, south + 0.05 * radius);
        addCylinder(0.4 * radius, rodBottom - 0.05 * radius, rodBottom + 0.005 * radius);
    } else {
        const north = Number.isFinite(highest) ? highest : radius;
        const stemTop = north + 0.05 * radius;
        const ringRadius = 0.1 * radius, tubeRadius = 0.018 * radius;
        addCylinder(0.03 * radius, north - 0.03 * radius, stemTop);
        addTorus([0, stemTop + ringRadius - tubeRadius, 0], ringRadius, tubeRadius);
    }
    return { positions, normals, indices };
}

const number = (value) => String(Math.round(value * 1e6) / 1e6);

/** The model as OBJ text, each vertex carrying its cell's colour */
function objText(mesh, mount, name) {
    const parts = [`# ${name}\no globe\n`];
    let chunk = '';
    const push = (line) => {
        chunk += line;
        if (chunk.length > 1 << 20) {
            parts.push(chunk);
            chunk = '';
        }
    };
    const count = mesh.positions.length / 3;
    for (let i = 0; i < count; i++) {
        const p = mesh.positions, c = mesh.colors;
        push(`v ${number(p[i * 3])} ${number(p[i * 3 + 1])} ${number(p[i * 3 + 2])} ${number(c[i * 3])} ${number(c[i * 3 + 1])} ${number(c[i * 3 + 2])}\n`);
    }
    for (let i = 0; i < count; i++) {
        const n = mesh.normals;
        push(`vn ${number(n[i * 3])} ${number(n[i * 3 + 1])} ${number(n[i * 3 + 2])}\n`);
    }
    push('s off\n');
    // OBJ counts from 1
    for (let k = 0; k + 2 < mesh.indices.length; k += 3) {
        const a = mesh.indices[k] + 1, b = mesh.indices[k + 1] + 1, c = mesh.indices[k + 2] + 1;
        push(`f ${a}//${a} ${b}//${b} ${c}//${c}\n`);
    }
    if (mount) {
        // The mount as an object of its own, its vertices numbered on from the globe's
        push('o mount\n');
        for (const p of mount.positions) push(`v ${number(p[0])} ${number(p[1])} ${number(p[2])} ${mountColor.join(' ')}\n`);
        for (const n of mount.normals) push(`vn ${number(n[0])} ${number(n[1])} ${number(n[2])}\n`);
        push('s 1\n');
        for (let k = 0; k + 2 < mount.indices.length; k += 3) {
            const [a, b, c] = [mount.indices[k], mount.indices[k + 1], mount.indices[k + 2]].map((i) => i + count + 1);
            push(`f ${a}//${a} ${b}//${b} ${c}//${c}\n`);
        }
    }
    parts.push(chunk);
    return new Blob(parts, { type: 'model/obj' });
}

/**
 * A binary STL for slicers, in millimetres with z up and resting on the bed. STL has no colour, so it's the shape
 * alone, and only the ground: the rivers' strips are open sheets floating over it that can't be printed.
 */
function stlBlob(mesh, mount) {
    const scale = printRadius / radius;
    // The app's y-up to the printer's z-up, turned about x so the south pole (and any stand) sits on the bed
    const printed = (x, y, z) => [x * scale, -z * scale, y * scale];
    const shells = [{ position: (i) => printed(mesh.positions[i * 3], mesh.positions[i * 3 + 1], mesh.positions[i * 3 + 2]),
        indices: mesh.indices.subarray(0, mesh.groundIndexCount) }];
    if (mount) shells.push({ position: (i) => printed(...mount.positions[i]), indices: mount.indices });
    let floor = Infinity, triangles = 0;
    for (const shell of shells) {
        for (const i of shell.indices) floor = Math.min(floor, shell.position(i)[2]);
        triangles += Math.trunc(shell.indices.length / 3);
    }
    const buffer = new ArrayBuffer(84 + triangles * 50);
    const view = new DataView(buffer);
    // An 80-byte header, which mustn't begin "solid" or readers take it for ASCII STL, then the count
    new Uint8Array(buffer).set(new TextEncoder().encode('Estrelas globe'));
    view.setUint32(80, triangles, true);
    let offset = 84;
    const write = (v) => {
        view.setFloat32(offset, v[0], true);
        view.setFloat32(offset + 4, v[1], true);
        view.setFloat32(offset + 8, v[2], true);
        offset += 12;
    };
    for (const shell of shells) {
        for (let k = 0; k + 2 < shell.indices.length; k += 3) {
            const [a, b, c] = [0, 1, 2].map((j) => {
                const p = shell.position(shell.indices[k + j]);
                return [p[0], p[1], p[2] - floor];
            });
            const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
            const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
            const length = Math.hypot(...n);
            write(length > 0 ? n.map((x) => x / length) : [0, 0, 0]);
            write(a);
            write(b);
            write(c);
            view.setUint16(offset, 0, true);
            offset += 2;
        }
    }
    return new Blob([buffer], { type: 'model/stl' });
}

/** The model file of a globe, in a format, with any mount */
export function modelFile(globe, format, mount = 'none', name = 'globe') {
    const mesh = meshOf(globe);
    const mountParts = mountMesh(mount, mesh);
    return format === 'stl' ? stlBlob(mesh, mountParts) : objText(mesh, mountParts, name);
}

/** The cells of an icosphere globe at a number of subdivisions */
export const cellCount = (subdivisions) => 10 * (1 << (2 * subdivisions)) + 2;
