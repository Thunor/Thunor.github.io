//
//  cityScene.js
//  Estrelas (web)
//
//  Turns a generated city layout into three.js meshes. Everything that shares a material is merged into one mesh, so
//  a city of thousands of buildings and trees is a couple of dozen objects. The layout's x (east) and y (north) map
//  to three.js x and −z, with y up, in metres. A port of CityScene.swift.
//

import * as THREE from '../../vendor/three.module.min.js';
import { Geometry, CityPalette } from '../gen/cityGenerator.js';
import { seaLevel, riverLevel } from '../gen/cityTerrain.js';

const Layer = { grass: 0.15, pavement: 0.2, garden: 0.23, plaza: 0.25, shore: 0.27, water: 0.3, path: 0.32, road: 0.4, marking: 0.46 };

const v3 = (p, height) => [p[0], height, -p[1]];
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const centroid = (points) => points.reduce((s, p) => [s[0] + p[0] / points.length, s[1] + p[1] / points.length], [0, 0]);
const dist2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/**
 * Flat-shaded triangles for one material. Shapes laid on the ground follow `terrain`, at their height above it;
 * everything else (walls, roofs, water, decks) is at the absolute height it's given.
 */
class MeshBuilder {
    constructor(terrain = null) {
        this.positions = [];
        this.normals = [];
        this.indices = [];
        this.terrain = terrain;
    }

    /** A point `offset` above the ground at `p` */
    draped(p, offset) {
        return v3(p, (this.terrain ? this.terrain.height(p) : 0) + offset);
    }

    get isEmpty() {
        return this.indices.length === 0;
    }

    addPolygon(points, outward) {
        if (points.length < 3) return;
        let normal = cross(sub3(points[1], points[0]), sub3(points[2], points[0]));
        const length = Math.hypot(...normal);
        if (!(length > 1e-6)) return;
        normal = scale3(normal, 1 / length);
        let ordered = points;
        if (dot3(normal, outward) < 0) {
            ordered = [...points].reverse();
            normal = scale3(normal, -1);
        }
        const start = this.positions.length / 3;
        for (const p of ordered) {
            this.positions.push(...p);
            this.normals.push(...normal);
        }
        for (let k = 1; k < ordered.length - 1; k++) this.indices.push(start, start + k, start + k + 1);
    }

    /** A convex shape lying on the ground, `height` above it, cut into triangles small enough to follow the lie of the land */
    addFlat(polygon, height) {
        if (polygon.length < 3) return;
        const terrain = this.terrain;
        if (!terrain || terrain.count <= 2) {
            this.addFlatAbsolute(polygon, height);
            return;
        }
        // About as fine as the ground's own triangles, so a shape bends with the land
        const longest = Math.max(terrain.spacing, 4);
        const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const add = (a, b, c, depth) => {
            if (depth < 7 && Math.max(dist2(a, b), dist2(b, c), dist2(c, a)) > longest) {
                const mab = mid(a, b), mbc = mid(b, c), mca = mid(c, a);
                add(a, mab, mca, depth + 1);
                add(mab, b, mbc, depth + 1);
                add(mca, mbc, c, depth + 1);
                add(mab, mbc, mca, depth + 1);
                return;
            }
            this.addPolygon([this.draped(a, height), this.draped(b, height), this.draped(c, height)], [0, 1, 0]);
        };
        for (let k = 1; k < polygon.length - 1; k++) add(polygon[0], polygon[k], polygon[k + 1], 0);
    }

    /** A flat shape at the absolute `height`, facing up: water, lids and decks */
    addFlatAbsolute(polygon, height) {
        this.addPolygon(polygon.map((p) => v3(p, height)), [0, 1, 0]);
    }

    /** The ground's lowest point under a footprint */
    groundUnder(footprint) {
        if (!this.terrain) return 0;
        return Math.min(...[...footprint, centroid(footprint)].map((p) => this.terrain.height(p)));
    }

    /** The terrain itself, as one smooth surface, with a skirt reaching out flat to well past the horizon */
    addGround(terrain) {
        const n = terrain.count;
        const start = this.positions.length / 3;
        // A little below the heights everything else is laid at, more where the grid is coarse, so a shape laid across
        // a fold in the ground never dips beneath it
        const sink = 0.35 + terrain.spacing * 0.025;
        const at = (i, j) => [terrain.origin[0] + i * terrain.spacing, terrain.origin[1] + j * terrain.spacing];
        const heights = terrain.heights;
        for (let j = 0; j < n; j++) {
            for (let i = 0; i < n; i++) {
                this.positions.push(...v3(at(i, j), heights[j * n + i] - sink));
                const left = heights[j * n + Math.max(i - 1, 0)], right = heights[j * n + Math.min(i + 1, n - 1)];
                const down = heights[Math.max(j - 1, 0) * n + i], up = heights[Math.min(j + 1, n - 1) * n + i];
                // x east, −z north, y up
                const normal = [left - right, 2 * terrain.spacing, up - down];
                const length = Math.hypot(...normal);
                this.normals.push(normal[0] / length, normal[1] / length, normal[2] / length);
            }
        }
        for (let j = 0; j < n - 1; j++) {
            for (let i = 0; i < n - 1; i++) {
                // Anticlockwise seen from above, so the ground faces up
                const a = start + j * n + i, b = a + 1, c = a + n, d = c + 1;
                this.indices.push(a, b, c, b, d, c);
            }
        }
        // The skirt: each edge vertex drawn straight out from the centre to a far square at the same height
        const ring = [];
        for (let i = 0; i < n - 1; i++) ring.push([i, 0]);
        for (let j = 0; j < n - 1; j++) ring.push([n - 1, j]);
        for (let i = n - 1; i > 0; i--) ring.push([i, n - 1]);
        for (let j = n - 1; j > 0; j--) ring.push([0, j]);
        const reach = 3;
        const skirtStart = this.positions.length / 3;
        for (const [i, j] of ring) {
            const p = at(i, j);
            this.positions.push(...v3([p[0] * reach, p[1] * reach], heights[j * n + i] - sink));
            this.normals.push(0, 1, 0);
        }
        for (let k = 0; k < ring.length; k++) {
            const next = (k + 1) % ring.length;
            const innerA = start + ring[k][1] * n + ring[k][0], innerB = start + ring[next][1] * n + ring[next][0];
            const outerA = skirtStart + k, outerB = skirtStart + next;
            this.indices.push(innerA, outerA, innerB, innerB, outerA, outerB);
        }
    }

    addRibbon(a, b, width, height, extend = 0, absolute = false) {
        const length = dist2(a, b);
        if (!(length > 0.01)) return;
        const d = [(b[0] - a[0]) / length, (b[1] - a[1]) / length];
        const side = [-d[1] * width / 2, d[0] * width / 2];
        const s = [a[0] - d[0] * extend, a[1] - d[1] * extend], e = [b[0] + d[0] * extend, b[1] + d[1] * extend];
        const quad = [[s[0] - side[0], s[1] - side[1]], [e[0] - side[0], e[1] - side[1]], [e[0] + side[0], e[1] + side[1]],
            [s[0] + side[0], s[1] + side[1]]];
        if (absolute) this.addFlatAbsolute(quad, height);
        else this.addFlat(quad, height);
    }

    /** A flat band between two lines, such as a river between its banks: on the ground, or at the absolute `height` for water */
    addStrip(one, other, height, absolute = false) {
        for (let k = 0; k < Math.min(one.length, other.length) - 1; k++) {
            for (const triangle of [[one[k], one[k + 1], other[k + 1]], [one[k], other[k + 1], other[k]]]) {
                if (absolute) this.addFlatAbsolute(triangle, height);
                else this.addFlat(triangle, height);
            }
        }
    }

    addPrism(footprint, bottom, top, lid = true) {
        const centre = centroid(footprint);
        footprint.forEach((a, k) => {
            const b = footprint[(k + 1) % footprint.length];
            const middle = [(a[0] + b[0]) / 2 - centre[0], (a[1] + b[1]) / 2 - centre[1]];
            this.addPolygon([v3(a, bottom), v3(b, bottom), v3(b, top), v3(a, top)], v3(middle, 0));
        });
        if (lid) this.addFlatAbsolute(footprint, top);
    }

    addBox(centre, size, angle, bottom, top) {
        this.addPrism(rectangle(centre, size, angle), bottom, top);
    }

    /** A roof pitched on all four sides over a four-sided footprint, its short ridge running along the longer sides */
    addHipRoof(footprint, base, rise) {
        if (footprint.length !== 4) {
            this.addFlatAbsolute(footprint, base);
            return;
        }
        let q = footprint;
        if (dist2(q[0], q[1]) < dist2(q[1], q[2])) q = [q[1], q[2], q[3], q[0]];
        const centre2 = centroid(q);
        const length = dist2(q[0], q[1]), width = dist2(q[1], q[2]);
        const along = [(q[1][0] - q[0][0]) / length, (q[1][1] - q[0][1]) / length];
        const half = Math.max((length - width) / 2, 0);
        const ridgeStart = v3([centre2[0] - along[0] * half, centre2[1] - along[1] * half], base + rise);
        const ridgeEnd = v3([centre2[0] + along[0] * half, centre2[1] + along[1] * half], base + rise);
        const corners = q.map((p) => v3(p, base));
        const centre = v3(centre2, base);
        const out = (a, b) => add3([0, 1, 0], sub3(scale3(add3(a, b), 0.5), centre));
        this.addPolygon([corners[0], corners[1], ridgeEnd, ridgeStart], out(corners[0], corners[1]));
        this.addPolygon([corners[2], corners[3], ridgeStart, ridgeEnd], out(corners[2], corners[3]));
        this.addPolygon([corners[1], corners[2], ridgeEnd], out(corners[1], corners[2]));
        this.addPolygon([corners[3], corners[0], ridgeStart], out(corners[3], corners[0]));
    }

    addGableRoof(footprint, base, rise) {
        if (footprint.length !== 4) {
            this.addFlatAbsolute(footprint, base);
            return;
        }
        let q = footprint;
        if (dist2(q[0], q[1]) < dist2(q[1], q[2])) q = [q[1], q[2], q[3], q[0]];
        const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const ridgeStart = v3(mid(q[0], q[3]), base + rise), ridgeEnd = v3(mid(q[1], q[2]), base + rise);
        const corners = q.map((p) => v3(p, base));
        const centre = v3(centroid(q), base);
        const half = (a, b) => scale3(add3(a, b), 0.5);
        this.addPolygon([corners[0], corners[1], ridgeEnd, ridgeStart], add3([0, 1, 0], sub3(half(corners[0], corners[1]), centre)));
        this.addPolygon([corners[2], corners[3], ridgeStart, ridgeEnd], add3([0, 1, 0], sub3(half(corners[2], corners[3]), centre)));
        this.addPolygon([corners[1], corners[2], ridgeEnd], sub3(half(corners[1], corners[2]), centre));
        this.addPolygon([corners[3], corners[0], ridgeStart], sub3(half(corners[3], corners[0]), centre));
    }

    addDome(centre, radius, base, sides = 12, rings = 4) {
        const middle = v3(centre, base);
        const ring = (r, k) => {
            const elevation = r / rings * Math.PI / 2, angle = k / sides * 2 * Math.PI;
            return add3(middle, scale3([Math.cos(angle) * Math.cos(elevation), Math.sin(elevation), -Math.sin(angle) * Math.cos(elevation)], radius));
        };
        for (let r = 0; r < rings; r++) {
            for (let k = 0; k < sides; k++) {
                const a = ring(r, k), b = ring(r, k + 1), c = ring(r + 1, k + 1), d = ring(r + 1, k);
                const outward = sub3(scale3(add3(add3(a, b), add3(c, d)), 0.25), middle);
                this.addPolygon(r === rings - 1 ? [a, b, c] : [a, b, c, d], outward);
            }
        }
    }

    addCone(centre, radius, base, height, sides = 6) {
        const ring = circle(centre, radius, sides).map((p) => v3(p, base));
        const apex = v3(centre, base + height), middle = v3(centre, base);
        for (let k = 0; k < sides; k++) {
            const a = ring[k], b = ring[(k + 1) % sides];
            this.addPolygon([a, b, apex], add3(sub3(scale3(add3(a, b), 0.5), middle), [0, radius * radius / Math.max(height, 0.01), 0]));
        }
        this.addPolygon(ring, [0, -1, 0]);
    }

    addBall(centre, radius) {
        for (const [a, b, c] of icosahedronFaces) {
            const corners = [a, b, c].map((v) => add3(centre, [v[0] * radius[0], v[1] * radius[1], v[2] * radius[2]]));
            this.addPolygon(corners, sub3(scale3(add3(add3(corners[0], corners[1]), corners[2]), 1 / 3), centre));
        }
    }

    geometry() {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(this.normals, 3));
        geometry.setIndex(this.positions.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(this.indices, 1) : this.indices);
        geometry.computeBoundingSphere();
        return geometry;
    }
}

function rectangle(centre, size, angle) {
    const u = [Math.cos(angle) * size[0] / 2, Math.sin(angle) * size[0] / 2];
    const v = [-Math.sin(angle) * size[1] / 2, Math.cos(angle) * size[1] / 2];
    return [[centre[0] - u[0] - v[0], centre[1] - u[1] - v[1]], [centre[0] + u[0] - v[0], centre[1] + u[1] - v[1]],
        [centre[0] + u[0] + v[0], centre[1] + u[1] + v[1]], [centre[0] - u[0] + v[0], centre[1] - u[1] + v[1]]];
}

function circle(centre, radius, sides) {
    return Array.from({ length: sides }, (_, k) => {
        const angle = k / sides * 2 * Math.PI;
        return [centre[0] + Math.cos(angle) * radius, centre[1] + Math.sin(angle) * radius];
    });
}

/** The icosahedron's faces as the world map uses them, in three.js axes */
const icosahedronFaces = (() => {
    const unit = (lat, lon) => {
        const a = lat * Math.PI / 180, o = lon * Math.PI / 180;
        // Map space (x, y, z with z north) to three.js (x, z, y)
        return [Math.cos(a) * Math.cos(o), Math.sin(a), Math.cos(a) * Math.sin(o)];
    };
    const ring = Math.atan(0.5) * 180 / Math.PI;
    const north = unit(90, 0), south = unit(-90, 0);
    const upper = [0, 1, 2, 3, 4].map((i) => unit(ring, i * 72));
    const lower = [0, 1, 2, 3, 4].map((i) => unit(-ring, 36 + i * 72));
    const faces = [];
    for (let i = 0; i < 5; i++) {
        const n = (i + 1) % 5;
        faces.push([upper[i], upper[n], north], [upper[i], upper[n], lower[i]], [lower[i], lower[n], upper[n]], [lower[i], lower[n], south]);
    }
    return faces;
})();

/** The meshes for every surface in a city */
export function cityGeometry(layout) {
    const terrain = layout.terrain ?? null;
    const builders = new Map();
    const add = (surface, body) => {
        if (!builders.has(surface)) builders.set(surface, new MeshBuilder(terrain));
        body(builders.get(surface));
    };
    const ground = (p) => (terrain ? terrain.height(p) : 0);
    const far = layout.radius * 2.6 * 3;

    // The ground, out to the horizon the camera can reach
    if (terrain) add('ground', (b) => b.addGround(terrain));
    else add('ground', (b) => b.addFlat(circle([0, 0], layout.radius * 5, 64), 0));
    // The sea or lake, wherever the ground dips below its level
    if (layout.water) add('water', (b) => b.addFlatAbsolute([[-far, -far], [far, -far], [far, far], [-far, far]], seaLevel));
    add('pavement', (b) => layout.blocks.forEach((block) => b.addFlat(block, Layer.pavement)));
    add('plaza', (b) => layout.plazas.forEach((plaza) => b.addFlat(plaza, Layer.plaza)));
    add('grass', (b) => {
        layout.greens.forEach((g) => b.addFlat(g, Layer.grass));
        layout.gardens.forEach((g) => b.addFlat(g, Layer.garden));
    });
    const river = layout.river;
    if (river) {
        add(river.hasQuays ? 'quay' : 'shore', (b) => {
            b.addStrip(river.shoreLeft, river.left, Layer.shore);
            b.addStrip(river.right, river.shoreRight, Layer.shore);
        });
    }
    add('water', (b) => {
        // The river's water lies level in its valley
        if (river) b.addStrip(river.right, river.left, terrain ? riverLevel : Layer.water, true);
        layout.ponds.forEach((pond) => b.addFlatAbsolute(circle(pond.centre, pond.radius, 18), ground(pond.centre) + Layer.water));
    });

    for (const road of layout.roads) {
        if (road.kind === 'path') {
            add('path', (b) => b.addRibbon(road.a, road.b, road.width, Layer.path));
            continue;
        }
        add('road', (b) => b.addRibbon(road.a, road.b, road.width, Layer.road, road.width / 2));
        if (road.kind === 'avenue' && layout.era !== 'preindustrial') {
            add('marking', (b) => {
                const length = dist2(road.a, road.b);
                const d = [(road.b[0] - road.a[0]) / Math.max(length, 0.01), (road.b[1] - road.a[1]) / Math.max(length, 0.01)];
                for (let t = road.width / 2 + 2; t + 3 < length - road.width / 2; t += 9) {
                    b.addRibbon([road.a[0] + d[0] * t, road.a[1] + d[1] * t], [road.a[0] + d[0] * (t + 3), road.a[1] + d[1] * (t + 3)], 0.3, Layer.marking);
                }
            });
        }
    }

    for (const bridge of layout.bridges) {
        const length = dist2(bridge.a, bridge.b);
        if (!(length > 1)) continue;
        const d = [(bridge.b[0] - bridge.a[0]) / length, (bridge.b[1] - bridge.a[1]) / length];
        const angle = Math.atan2(d[1], d[0]);
        const middle = [(bridge.a[0] + bridge.b[0]) / 2, (bridge.a[1] + bridge.b[1]) / 2];
        const deckTop = terrain ? Math.max(ground(bridge.a), ground(bridge.b), riverLevel) + 1.6 : 1.6;
        add('bridge', (b) => {
            b.addBox(middle, [length + bridge.width, bridge.width + 1.5], angle, deckTop - 1.2, deckTop);
            for (const sign of [-1, 1]) {
                const offset = [-d[1] * sign * (bridge.width / 2 + 0.5), d[0] * sign * (bridge.width / 2 + 0.5)];
                b.addBox([middle[0] + offset[0], middle[1] + offset[1]], [length + bridge.width, 0.5], angle, deckTop, deckTop + 1.1);
            }
            for (let t = 12; t < length - 12; t += 18) {
                const foot = [bridge.a[0] + d[0] * t, bridge.a[1] + d[1] * t];
                b.addBox(foot, [2.5, bridge.width + 1], angle, terrain ? Math.min(ground(foot), riverLevel) - 1 : -1, deckTop - 1.2);
            }
        });
        add('road', (b) => b.addRibbon(bridge.a, bridge.b, bridge.width, deckTop + 0.05, bridge.width / 2, true));
    }

    // Piers and jetties out over the sea or lake, on piles
    for (const pier of layout.piers ?? []) {
        const length = dist2(pier.a, pier.b);
        if (!(length > 1)) continue;
        const d = [(pier.b[0] - pier.a[0]) / length, (pier.b[1] - pier.a[1]) / length];
        const angle = Math.atan2(d[1], d[0]);
        const deckTop = Math.max(ground(pier.a) + 0.3, seaLevel + 1.4);
        add(layout.era === 'preindustrial' ? 'trunk' : 'quay', (b) => {
            b.addBox([(pier.a[0] + pier.b[0]) / 2, (pier.a[1] + pier.b[1]) / 2], [length, pier.width], angle, deckTop - 0.8, deckTop);
            for (let t = 4; t < length; t += 7) {
                for (const sign of [-1, 1]) {
                    const foot = [pier.a[0] + d[0] * t - d[1] * sign * (pier.width / 2 - 0.4), pier.a[1] + d[1] * t + d[0] * sign * (pier.width / 2 - 0.4)];
                    b.addBox(foot, [0.6, 0.6], angle, ground(foot) - 0.5, deckTop - 0.8);
                }
            }
        });
    }

    // Buildings, each on a foundation down to the lowest ground under it
    const footings = new MeshBuilder(terrain);
    for (const building of layout.buildings) {
        const footing = footings.groundUnder(building.footprint);
        const base = footing + Layer.pavement;
        const walls = building.isGlass ? `glass:${building.wall}` : `wall:${building.wall}`;
        if (building.kind === 'skyscraper') {
            add(walls, (b) => b.addPrism(building.footprint, footing - 1, base));
            addTower(building, base, walls, add);
            continue;
        }
        if (building.kind === 'warehouse' || building.kind === 'factory') {
            const top = base + building.height;
            add(walls, (b) => b.addPrism(building.footprint, footing - 1, top, false));
            add(`roof:${building.roofColor}`, (b) => b.addFlatAbsolute(building.footprint, top));
            if (building.kind === 'factory') {
                const c = centroid(building.footprint);
                const stack = [c[0] + (building.footprint[0][0] - c[0]) * 0.65, c[1] + (building.footprint[0][1] - c[1]) * 0.65];
                add('smokestack', (b) => b.addPrism(circle(stack, 1.6, 10), top, top + 16 + building.height));
            }
            continue;
        }
        const top = base + building.height;
        add(walls, (b) => b.addPrism(building.footprint, footing - 1, top));
        const f = building.footprint;
        // A pitched roof reaches out past the walls over its eaves
        const roofline = building.eaves > 0 ? Geometry.inset(f, Array(f.length).fill(-building.eaves)) ?? f : f;
        const span = f.length === 4 ? Math.min(dist2(f[0], f[1]), dist2(f[1], f[2])) : 6;
        if (building.roof === 'gable') {
            // Steeper where snow must slide off
            const pitch = 0.38 + 0.25 * (layout.architecture === 'cold' ? (layout.climateWeight ?? 0) : 0);
            add(`roof:${building.roofColor}`, (b) => b.addGableRoof(roofline, top, Math.min(span * pitch, 9)));
        } else if (building.roof === 'hip') {
            add(`roof:${building.roofColor}`, (b) => b.addHipRoof(roofline, top, Math.min(span * 0.24, 5)));
        } else if (building.roof === 'dome') {
            add(`roof:${building.roofColor}`, (b) => b.addDome(centroid(f), span * 0.32, top));
        } else if (building.hasRooftopPlant) {
            const c = centroid(f);
            const edge = [f[1][0] - f[0][0], f[1][1] - f[0][1]];
            add('rooftop', (b) => b.addBox(c, [5, 4], Math.atan2(edge[1], edge[0]), top, top + 2.5));
        }
    }

    const landmark = layout.landmark;
    if (landmark) {
        const footing = footings.groundUnder(landmark.footprint);
        const base = footing + Layer.pavement;
        add('landmark', (b) => b.addPrism(landmark.footprint, footing - 1, base + landmark.height));
        const top = base + landmark.height;
        add('dome', (b) => {
            b.addPrism(circle(landmark.centre, landmark.domeRadius, 12), top, top + landmark.domeRadius * 0.5, false);
            b.addDome(landmark.centre, landmark.domeRadius, top + landmark.domeRadius * 0.5);
            b.addCone(landmark.centre, landmark.domeRadius * 0.12, top + landmark.domeRadius * 1.45, landmark.domeRadius * 0.6);
        });
    }

    for (const monument of layout.monuments) {
        const p = monument.position, s = monument.size;
        const plaza = ground(p) + Layer.plaza, lawn = ground(p) + Layer.grass;
        if (monument.kind === 'obelisk') {
            add('stone', (b) => {
                b.addBox(p, [s * 1.6, s * 1.6], 0, plaza - 0.5, plaza + 1.5);
                b.addPrism(circle(p, s * 0.32, 4), plaza + 1.5, plaza + s * 4, false);
                b.addCone(p, s * 0.32, plaza + s * 4, s * 0.5, 4);
            });
        } else if (monument.kind === 'fountain') {
            add('stone', (b) => {
                b.addPrism(circle(p, s, 12), plaza - 0.5, plaza + 0.7, false);
                b.addPrism(circle(p, s * 0.15, 8), plaza, plaza + 2.2);
            });
            add('fountainWater', (b) => b.addFlatAbsolute(circle(p, s * 0.95, 12), plaza + 0.55));
        } else {
            add('stone', (b) => {
                b.addBox(p, [s, s], 0, lawn - 0.5, lawn + 1.2);
                b.addPrism(circle(p, s * 0.18, 6), lawn + 1.2, lawn + 1.2 + s * 0.9);
            });
        }
    }

    // Trees, standing on the ground wherever it is
    for (const tree of layout.trees) {
        const foot = ground(tree.position) + Layer.grass;
        if (tree.isPalm) {
            // A tall, slender trunk with a spray of fronds at the top
            const trunkHeight = tree.height * 0.85;
            add('trunk', (b) => b.addBox(tree.position, [0.35, 0.35], 0, foot - 0.3, foot + trunkHeight));
            add('palm', (b) => b.addBall(v3(tree.position, foot + trunkHeight), [tree.crown * 1.6, tree.crown * 0.45, tree.crown * 1.6]));
            continue;
        }
        const trunk = tree.height * (tree.isConifer ? 0.2 : 0.4);
        add('trunk', (b) => b.addBox(tree.position, [0.5, 0.5], 0, foot - 0.3, foot + trunk));
        if (tree.isConifer) {
            add('conifer', (b) => b.addCone(tree.position, tree.crown, foot + trunk, tree.height - trunk));
        } else {
            const crown = (tree.height - trunk) / 2;
            add('foliage', (b) => b.addBall(v3(tree.position, foot + trunk + crown * 0.9), [tree.crown, crown, tree.crown]));
        }
    }
    return new Map([...builders].filter(([, b]) => !b.isEmpty));
}

function addTower(building, base, walls, add) {
    const shares = building.tiers === 3 ? [0.55, 0.28, 0.17] : building.tiers === 2 ? [0.68, 0.32] : [1];
    const f = building.footprint;
    const narrowest = Math.min(...f.map((p, i) => dist2(p, f[(i + 1) % f.length])));
    let tier = f;
    let bottom = base;
    for (const [index, share] of shares.entries()) {
        const top = bottom + building.height * share;
        const current = tier;
        add(walls, (b) => b.addPrism(current, bottom, top));
        if (index < shares.length - 1) {
            const next = Geometry.inset(tier, Array(tier.length).fill(narrowest * 0.14));
            if (!next) {
                bottom = top;
                break;
            }
            add('rooftop', (b) => b.addPrism(next, top, top + 1.2));
            tier = next;
        }
        bottom = top;
    }
    const roof = bottom;
    const c = centroid(tier);
    if (building.spire > 0) {
        add('rooftop', (b) => {
            b.addPrism(circle(c, 1.4, 8), roof, roof + building.spire * 0.35);
            b.addCone(c, 0.9, roof + building.spire * 0.35, building.spire * 0.65);
        });
    } else if (building.hasRooftopPlant) {
        const edge = [tier[1][0] - tier[0][0], tier[1][1] - tier[0][1]];
        add('rooftop', (b) => b.addBox(c, [Math.min(narrowest * 0.4, 12), Math.min(narrowest * 0.3, 9)], Math.atan2(edge[1], edge[0]), roof, roof + 4));
    }
}

const S = (color, metallic = 0, roughness = 0.85) => ({ color, metallic, roughness });

function palette(surface, layout, groundColor) {
    const era = layout.era;
    const frozen = layout.temperature === 'frozen';
    const [kind, index] = surface.split(':');
    switch (kind) {
        case 'ground': return S(groundColor, 0, 1);
        case 'grass':
            // Parched where it's dry, unless watered
            if (layout.architecture === 'arid' && layout.climateWeight > 0.5) return S([0.56, 0.54, 0.34], 0, 1);
            return { frozen: S([0.86, 0.89, 0.92], 0, 0.9), cold: S([0.40, 0.50, 0.34], 0, 1), temperate: S([0.33, 0.52, 0.25], 0, 1) }[layout.temperature]
                ?? S([0.60, 0.58, 0.32], 0, 1);
        case 'pavement': return S(era === 'preindustrial' ? [0.66, 0.62, 0.54] : [0.70, 0.70, 0.68]);
        case 'plaza': return S([0.80, 0.76, 0.68], 0, 0.7);
        case 'road':
            return { preindustrial: S([0.55, 0.50, 0.42], 0, 1), industrial: S([0.40, 0.39, 0.38], 0, 0.95),
                modern: S([0.22, 0.22, 0.23], 0, 0.9), advanced: S([0.32, 0.34, 0.38], 0, 0.6) }[era];
        case 'marking': return S([0.95, 0.93, 0.85], 0, 0.7);
        case 'path': return S([0.76, 0.68, 0.52], 0, 1);
        case 'water': case 'fountainWater':
            return frozen ? S([0.76, 0.86, 0.93], 0, 0.2) : S([0.18, 0.36, 0.50], 0.2, 0.12);
        case 'bridge': case 'stone': return S(era === 'advanced' ? [0.85, 0.86, 0.88] : [0.66, 0.63, 0.57], 0, 0.8);
        case 'wall': {
            const walls = CityPalette.blendedWalls(era, layout.architecture ?? 'temperate', layout.climateWeight ?? 0);
            return walls[Number(index) % walls.length];
        }
        case 'glass': { const glass = CityPalette.glass(era); return glass[Number(index) % glass.length]; }
        case 'shore': return frozen ? S([0.88, 0.90, 0.93], 0, 0.9) : S([0.62, 0.55, 0.42], 0, 1);
        case 'quay': return S(era === 'advanced' ? [0.82, 0.83, 0.85] : [0.58, 0.56, 0.52], 0, 0.85);
        case 'smokestack': return S([0.48, 0.24, 0.18], 0, 0.95);
        case 'roof': {
            const roofs = CityPalette.blendedRoofs(era, layout.architecture ?? 'temperate', layout.climateWeight ?? 0);
            return roofs[Number(index) % roofs.length];
        }
        case 'rooftop': return S([0.48, 0.49, 0.50], 0.3, 0.6);
        case 'landmark': return S(era === 'advanced' ? [0.96, 0.96, 0.98] : [0.88, 0.84, 0.74], 0, 0.7);
        case 'dome':
            return era === 'preindustrial' || era === 'industrial' ? S([0.40, 0.62, 0.54], 0.4, 0.5) : S([0.85, 0.72, 0.38], 0.9, 0.3);
        case 'trunk': return S([0.36, 0.26, 0.18], 0, 1);
        case 'foliage':
            return layout.temperature === 'hot' || layout.temperature === 'boiling' ? S([0.36, 0.48, 0.22], 0, 1) : S([0.22, 0.42, 0.18], 0, 1);
        case 'conifer': return S([0.14, 0.30, 0.18], 0, 1);
        case 'palm': return S([0.30, 0.50, 0.20], 0, 1);
        default: return S([0.6, 0.6, 0.6]);
    }
}

const flatSurfaces = new Set(['ground', 'marking', 'water', 'fountainWater', 'pavement', 'plaza', 'grass', 'path', 'road', 'shore']);

/** A group holding a mesh per surface */
export function cityObject(builders, layout, groundColor) {
    const root = new THREE.Group();
    root.name = 'city';
    for (const [surface, builder] of builders) {
        const style = palette(surface, layout, groundColor);
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(...style.color), metalness: style.metallic * 0.6, roughness: style.roughness,
            side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(builder.geometry(), material);
        // Flat layers laid on the ground, and open water, cast no shadows of their own
        mesh.castShadow = !flatSurfaces.has(surface);
        mesh.receiveShadow = true;
        root.add(mesh);
    }
    return root;
}

/** Half the width of the square a top-down image covers, in metres */
export function topDownHalfExtent(layout) {
    return layout.radius * 1.15;
}
