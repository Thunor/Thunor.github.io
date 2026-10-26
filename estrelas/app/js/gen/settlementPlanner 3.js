//
//  settlementPlanner.js
//  Estrelas (web)
//
//  Places a world's capital, cities, towns and villages on its map, where people settle: on the coast and on rivers,
//  on low, level ground, and where the climate is mild, never on the sea, the ice or high mountains. The capital
//  takes the best site, the cities spread out over the good land, and the towns and villages gather round them.
//  There are as many cities as the world's data counts of a million people or more (the capital among them), and two
//  to three times as many towns and villages. A port of SettlementPlanner.swift.
//

import { prepared, elevation, coldness, coordinate } from '../surface/surfaceMap.js';
import { seaLevelKept } from '../surface/surfaceTerrain.js';
import { groundHeight } from '../surface/biomeSurface.js';
import { NearestSite, waterTest } from '../surface/voronoiSurface.js';
import { placeName } from './placeNames.js';
import { randomUUID } from './random.js';

/** The most cities placed, so even the most crowded world's map stays legible and its globe quick to draw */
export const maximumCities = 24;

/** Points tried over the whole sphere; the habitable ones are kept */
const candidateCount = 6000;

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const normalize = (v) => {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
};
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/**
 * What the world offers to settle on: its style, and with its globe (as dataStore.globe gives it), the globe's rivers
 * (each edge's two ends and its middle), its cells' colours, to tell green land from desert, and its water
 */
export function settlementTerrain(style, globe = null) {
    const terrain = { style, rivers: [], cells: null, water: null };
    if (!globe) return terrain;
    const { sites, triangles, colors } = globe;
    if (style.vegetation) terrain.cells = { lookup: new NearestSite(sites), colors };
    terrain.water = waterTest(globe, style);
    const corner = (triangle) => {
        const a = triangles[triangle * 3], b = triangles[triangle * 3 + 1], c = triangles[triangle * 3 + 2];
        return normalize([0, 1, 2].map((i) => sites[a * 3 + i] + sites[b * 3 + i] + sites[c * 3 + i]));
    };
    for (const river of globe.rivers ?? []) {
        const a = corner(river.from), b = corner(river.to);
        terrain.rivers.push({ point: a, halfWidth: river.halfWidth },
            { point: normalize([a[0] + b[0], a[1] + b[1], a[2] + b[2]]), halfWidth: river.halfWidth },
            { point: b, halfWidth: river.halfWidth });
    }
    return terrain;
}

/**
 * New places for a world with `society` and `population` people: its capital, cities, towns and villages, named and
 * peopled, avoiding the names in `taken`. Empty for a world nobody lives on, or with nowhere to live. `generator` is a
 * SwiftRandom-like generator (random.js).
 */
export function planSettlements({ population, society, terrain, taken = [], generator }) {
    if (!(population > 0)) return [];
    const candidates = sites(terrain, generator);
    if (!candidates.length) return [];

    // The capital among the cities of a million or more, or alone if there are none
    const cityCount = Math.min(Math.max(society.citiesOverMillion ?? 0, 1), maximumCities);
    const townCount = Math.round(cityCount * generator.double(2, 3));
    // Room for each city on the world's habitable land, as an angle on the sphere
    const landArea = 4 * Math.PI * candidates.length / candidateCount;
    const citySpacing = Math.min(Math.max(Math.sqrt(landArea / cityCount) * 0.6, 0.035), 0.45);
    const townSpacing = Math.max(citySpacing * 0.35, 0.015);

    const chosen = [];
    // The best remaining site at least `spacing` from every place chosen so far, with `bonus` added to each site's own
    // score; spacing shrinks if nothing fits
    const pick = (startSpacing, bonus = () => 0) => {
        let spacing = startSpacing;
        for (let attempt = 0; attempt < 4; attempt++) {
            const threshold = Math.cos(spacing);
            let best = null, bestScore = -Infinity;
            for (const candidate of candidates) {
                if (!chosen.every((c) => dot(c.point, candidate.point) < threshold)) continue;
                const score = candidate.score + bonus(candidate.point);
                if (score > bestScore) {
                    bestScore = score;
                    best = candidate;
                }
            }
            if (best) return best.point;
            spacing *= 0.7;
        }
        return null;
    };
    // More for sites near cities (or, for villages, near towns too), so the countryside fills in round them
    const nearness = (kinds, reach) => (point) => {
        let nearest = Infinity;
        for (const c of chosen) {
            if (kinds.has(c.kind)) nearest = Math.min(nearest, Math.acos(Math.min(Math.max(dot(c.point, point), -1), 1)));
        }
        return 0.9 * Math.exp(-Math.pow(nearest / reach, 2));
    };

    for (let index = 0; index < cityCount; index++) {
        const point = pick(citySpacing);
        if (!point) break;
        chosen.push({ point, kind: index === 0 ? 'capital' : 'city' });
    }
    const cities = new Set(['capital', 'city']);
    const citiesAndTowns = new Set(['capital', 'city', 'town']);
    // The larger places towns, the rest villages
    const towns = Math.round(townCount * 0.4);
    for (let index = 0; index < townCount; index++) {
        const isTown = index < towns;
        const spacing = isTown ? townSpacing : townSpacing * 0.65;
        const near = isTown ? nearness(cities, citySpacing * 0.8) : nearness(citiesAndTowns, citySpacing * 0.6);
        const point = pick(spacing, near);
        if (!point) break;
        chosen.push({ point, kind: isTown ? 'town' : 'village' });
    }

    // Peopled by the rank-size rule from the largest city down, towns and villages smaller than any city
    const names = new Set(taken);
    const places = [];
    const largest = Math.max(society.largestCity ?? 0, 1);
    let rank = 0;
    for (const { point, kind } of chosen) {
        rank += 1;
        let people;
        switch (kind) {
            case 'capital': people = largest; break;
            case 'city': people = Math.max(Math.trunc(largest / rank), Math.min(1000000, largest - 1)); break;
            case 'town':
                people = Math.min(Math.trunc(Math.min(Math.trunc(largest / rank), 900000) * generator.double(0.25, 1)),
                    Math.trunc(largest / 3));
                break;
            default: people = Math.min(generator.int(800, 15000), Math.max(Math.trunc(largest / 20), 50));
        }
        const name = placeName(kind, null, names, generator);
        names.add(name);
        const [latitude, longitude] = coordinate(point[0], point[1], point[2]);
        places.push({ id: randomUUID(), name, kind, latitude: latitude * 180 / Math.PI, longitude: longitude * 180 / Math.PI,
            population: Math.max(rounded(people), 1) });
    }
    return places;
}

/** Every habitable point among `candidateCount` spread evenly over the world, each scored by how well people would like to live there */
function sites(terrain, generator) {
    const style = prepared(terrain.style);
    const hasSeas = style.kind === 'rocky' && style.waterFraction > 0;
    const sea = seaLevelKept(style);
    // The globe's own water, its lakes too, so a lakeshore is a shore; without one, the sea its noise puts there
    const isWater = (p) => (terrain.water ? terrain.water(p[0], p[1], p[2])
        : hasSeas && elevation(style, p[0], p[1], p[2], 0) < sea);
    const widest = terrain.rivers.reduce((m, r) => Math.max(m, r.halfWidth), 0) || 1;
    // The rivers in boxes a little wider than the reach looked over, so each site checks only the boxes round it
    const box = 0.04;
    const key = (p) => `${Math.floor(p[0] / box)},${Math.floor(p[1] / box)},${Math.floor(p[2] / box)}`;
    const riverBoxes = new Map();
    for (const stretch of terrain.rivers) {
        const k = key(stretch.point);
        if (!riverBoxes.has(k)) riverBoxes.set(k, []);
        riverBoxes.get(k).push(stretch);
    }
    // Points on a golden-angle spiral, nudged a little so they don't line up
    const golden = Math.PI * (3 - Math.sqrt(5));
    const result = [];
    const reach = Math.cos(0.02);
    for (let index = 0; index < candidateCount; index++) {
        const y = 1 - 2 * (index + 0.5) / candidateCount;
        const across = Math.sqrt(1 - y * y);
        const angle = golden * index + generator.double(-0.02, 0.02);
        const point = normalize([across * Math.cos(angle), y, across * Math.sin(angle)]);
        if (isWater(point)) continue;

        // Low, level ground; nobody builds cities on the mountains
        const ground = groundHeight(style, point[0], point[1], point[2], sea, 0);
        const height = (ground - sea) / Math.max(1 - sea, 0.0001);
        if (!(height < 0.45)) continue;
        const lowland = 1 - Math.max(height, 0) / 0.45;

        // A mild climate, clear of the ice: on a world with ice caps, about halfway from the equator (or the point
        // under the star) to the ice; on a world too warm for ice, the cooler the better
        const cold = coldness(style, point[0], point[1], point[2]);
        const ice = style.iceCapLatitude;
        let climate;
        if (ice < 90) {
            if (!(cold < ice - 3)) continue;
            climate = Math.exp(-Math.pow((cold - 0.45 * ice) / (0.4 * ice), 2));
        } else {
            climate = 0.3 + 0.7 * Math.min(cold / 70, 1);
        }

        // The coast: open sea close by, for harbours and trade
        let coast = 0;
        if (hasSeas || terrain.water) {
            for (const [distance, weight] of [[0.02, 1], [0.055, 0.5]]) {
                if (coast !== 0) break;
                if (ring(point, distance).some(isWater)) coast = weight;
            }
        }

        // A river close by, more for a bigger one
        let river = 0;
        if (riverBoxes.size) {
            const bx = Math.floor(point[0] / box), by = Math.floor(point[1] / box), bz = Math.floor(point[2] / box);
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dz = -1; dz <= 1; dz++) {
                        for (const stretch of riverBoxes.get(`${bx + dx},${by + dy},${bz + dz}`) ?? []) {
                            if (dot(stretch.point, point) > reach) {
                                river = Math.max(river, 0.5 + 0.5 * Math.min(stretch.halfWidth / widest * 2, 1));
                            }
                        }
                    }
                }
            }
        }

        // Green, growing land rather than desert or bare rock, as the globe colours it, on worlds with life
        let fertile = 0;
        if (terrain.cells) {
            const cell = terrain.cells.lookup.nearest(point[0], point[1], point[2]);
            const c = terrain.cells.colors;
            fertile = Math.min(Math.max((c[cell * 3 + 1] - (c[cell * 3] + c[cell * 3 + 2]) / 2) / 0.2, 0), 1);
        }

        const score = 1.2 * climate + coast + 0.8 * river + 0.6 * lowland + 0.9 * fertile + generator.double(0, 0.35);
        result.push({ point, score });
    }
    return result;
}

/** Eight points `distance` radians round `point` */
function ring(point, distance) {
    const reference = Math.abs(point[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const east = normalize(cross(reference, point)), north = cross(point, east);
    const points = [];
    for (let step = 0; step < 8; step++) {
        const bearing = step * Math.PI / 4;
        points.push([0, 1, 2].map((i) => point[i] * Math.cos(distance)
            + (east[i] * Math.cos(bearing) + north[i] * Math.sin(bearing)) * Math.sin(distance)));
    }
    return points;
}

/** To three significant figures, as populations are usually given */
function rounded(people) {
    if (people < 1000) return people;
    const magnitude = Math.pow(10, Math.floor(Math.log10(people)) - 2);
    return Math.round(people / magnitude) * magnitude;
}
