//
//  cityTerrain.js
//  Estrelas (web)
//
//  The ground a city map is built on, drawn to match the setting the globe gives the place (see citySite.js): hills
//  as rough as the country round about, falling gently the way the land falls, down to the shore where the sea or a
//  lake lies along one side, and a valley worn along any river that runs through. Heights are in metres above the
//  water's level, worked out once on a grid that every road, block, building and tree then stands on. A port of
//  CityTerrain.swift.
//

/** The water's level: the sea or lake at 0, and the river a little above its bed */
export const seaLevel = 0;
export const riverLevel = 0.9;
/** The floor of a river's valley, just above its water */
export const valleyFloor = 1.1;

function distanceToSegment(p, a, b) {
    const abx = b[0] - a[0], aby = b[1] - a[1];
    const lengthSquared = abx * abx + aby * aby;
    if (!(lengthSquared > 0)) return Math.hypot(p[0] - a[0], p[1] - a[1]);
    const t = Math.min(Math.max(((p[0] - a[0]) * abx + (p[1] - a[1]) * aby) / lengthSquared, 0), 1);
    return Math.hypot(p[0] - a[0] - abx * t, p[1] - a[1] - aby * t);
}

/** Where open water, sea or lake, lies along one side of a city: `bearing` toward it, its `distance` from the centre and how far it `wander`s */
export class CityShoreline {
    constructor(bearing, distance, wander, noise) {
        this.bearing = bearing;
        this.distance = distance;
        this.wander = wander;
        this.noise = noise;
    }

    /** How far into the water a point is, in metres; negative on land */
    depth(p) {
        const along = p[0] * -this.bearing[1] + p[1] * this.bearing[0];
        const wobble = this.noise.at(along / 700, 3.1) + 0.45 * this.noise.at(along / 230, 9.7);
        return p[0] * this.bearing[0] + p[1] * this.bearing[1] - this.distance - wobble * this.wander;
    }
}

export class CityTerrain {
    /** The grid's south-west corner, the spacing between its samples, how many there are each way, and its heights row by row from the south */
    constructor(origin, spacing, count, heights, shoreline = null) {
        this.origin = origin;
        this.spacing = spacing;
        this.count = count;
        this.heights = heights;
        this.shoreline = shoreline;
    }

    /** Level ground everywhere, as cities were drawn before they had terrain */
    static level(radius) {
        return new CityTerrain([-radius * 2.6, -radius * 2.6], radius * 5.2, 2,
            new Float32Array([valleyFloor, valleyFloor, valleyFloor, valleyFloor]), null);
    }

    /**
     * The ground for a city `radius` across, from its setting: `hilliness` 0…1, the way the land falls, an optional
     * shoreline, and an optional river ({ points, halfWidth }); `noise` is a ValueNoise of the city's own
     */
    static make({ radius, hilliness, downhill, shoreline, river, noise }) {
        const half = radius * 2.6;
        const count = 321;
        const spacing = 2 * half / (count - 1);
        const origin = [-half, -half];
        // Hills tens of metres high in hill country, a few metres of swell on the plains
        const amplitude = 4 + 90 * Math.pow(hilliness, 1.3);
        const wavelength = 500 + 350 * hilliness;
        const slope = 0.002 + 0.012 * hilliness;
        // Out from the water, the land takes this long to rise to its full height
        const rise = 120 + 400 * hilliness;
        // Valleys broaden in hill country
        const valley = (river?.halfWidth ?? 0) + 40 + 220 * hilliness;
        // Each stretch of river, with a box round it beyond which it can't shape the ground
        const stretches = [];
        if (river) {
            for (let k = 0; k < river.points.length - 1; k++) {
                const a = river.points[k], b = river.points[k + 1];
                stretches.push({ a, b, low: [Math.min(a[0], b[0]) - valley, Math.min(a[1], b[1]) - valley],
                    high: [Math.max(a[0], b[0]) + valley, Math.max(a[1], b[1]) + valley] });
            }
        }
        const heights = new Float32Array(count * count);
        for (let j = 0; j < count; j++) {
            for (let i = 0; i < count; i++) {
                const p = [origin[0] + i * spacing, origin[1] + j * spacing];
                // Rolling ground, falling the way the land does
                const qx = p[0] / wavelength, qy = p[1] / wavelength;
                const swell = noise.at(qx, qy) + 0.5 * noise.at(qx * 2.1 + 17.3, qy * 2.1 + 17.3)
                    + 0.25 * noise.at(qx * 4.3 + 41.9, qy * 4.3 + 41.9);
                let h = amplitude * (swell + 0.9) / 1.8 + slope * (half - (p[0] * downhill[0] + p[1] * downhill[1])) + 1.5;
                // Down to the shore, and under the water beyond it
                if (shoreline) {
                    const depth = shoreline.depth(p);
                    if (depth > 0) {
                        h = -0.6 - Math.min(depth * 0.04, 14);
                    } else {
                        const inland = -depth;
                        const t = Math.min(inland / rise, 1);
                        h = h * t * t * (3 - 2 * t) + 0.9 * Math.min(inland / 30, 1);
                    }
                }
                // A valley worn along the river, its bed just under the water
                if (river) {
                    let nearest = Infinity;
                    for (const s of stretches) {
                        if (p[0] >= s.low[0] && p[0] <= s.high[0] && p[1] >= s.low[1] && p[1] <= s.high[1]) {
                            nearest = Math.min(nearest, distanceToSegment(p, s.a, s.b));
                        }
                    }
                    if (nearest < river.halfWidth) {
                        h = Math.min(h, riverLevel - 1.4);
                    } else if (nearest < valley) {
                        const t = (nearest - river.halfWidth) / (valley - river.halfWidth);
                        h = Math.min(h, valleyFloor + (Math.max(h, valleyFloor) - valleyFloor) * t * t * (3 - 2 * t));
                    }
                }
                heights[j * count + i] = h;
            }
        }
        return new CityTerrain(origin, spacing, count, heights, shoreline);
    }

    /**
     * The ground's height at `p`, in metres, on the same flat triangles the ground is drawn with: each grid square
     * cut corner to corner from its south-east to its north-west, so whatever's laid on the ground lies exactly on it
     */
    height(p) {
        const { origin, spacing, count, heights } = this;
        const x = Math.min(Math.max((p[0] - origin[0]) / spacing, 0), count - 1 - 0.001);
        const y = Math.min(Math.max((p[1] - origin[1]) / spacing, 0), count - 1 - 0.001);
        const i = Math.trunc(x), j = Math.trunc(y);
        const fx = x - i, fy = y - j;
        const a = heights[j * count + i], b = heights[j * count + i + 1];
        const c = heights[(j + 1) * count + i], d = heights[(j + 1) * count + i + 1];
        if (fx + fy <= 1) return a + (b - a) * fx + (c - a) * fy;
        return d + (c - d) * (1 - fx) + (b - d) * (1 - fy);
    }

    /** How steep the ground is at `p`: rise over run */
    slope(p) {
        const step = Math.max(this.spacing, 4);
        const dx = this.height([p[0] + step, p[1]]) - this.height([p[0] - step, p[1]]);
        const dy = this.height([p[0], p[1] + step]) - this.height([p[0], p[1] - step]);
        return Math.hypot(dx, dy) / (2 * step);
    }

    /** Whether `p` is in the sea or lake along the shore */
    isOpenWater(p) {
        return this.shoreline ? this.shoreline.depth(p) > 0 : false;
    }
}
