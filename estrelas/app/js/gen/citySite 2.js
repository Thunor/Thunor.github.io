//
//  citySite.js
//  Estrelas (web)
//
//  What surrounds a settlement on its world, read from the world's globe where the place is marked: whether the sea
//  or a lake lies close by and in which direction, whether a river runs past and which way it flows, how hilly the
//  land is and which way it falls, how green and wooded it is, and how hot and dry its climate. A city map is a few
//  kilometres across while one of the globe's cells is tens, so this is the place's setting rather than its exact
//  ground; the city's own terrain is drawn to match it (see cityGenerator.js). Directions are on the city map, x east
//  and y north. A port of CitySite.swift.
//

import { prepared, spherePoint, elevation, coldness } from '../surface/surfaceMap.js';
import { seaLevelKept, climateSample } from '../surface/surfaceTerrain.js';
import { groundHeight } from '../surface/biomeSurface.js';
import { NearestSite, waterTest, reliefTest } from '../surface/voronoiSurface.js';

/**
 * A temperate place on level ground with nothing round it, for worlds without a globe to read. `shore` is
 * { kind: 'sea' | 'lake', bearing: [x, y] }, `river` { direction: [x, y], size }.
 */
export const plainSite = Object.freeze({
    shore: null, river: null, hilliness: 0.15, downhill: [1, 0], greenery: 0.6, forest: 0.3, heat: 0.5, aridity: 0.3,
    biome: null,
});

/** The architecture its climate calls for, before technology frees builders from it */
export function climateArchitecture(site) {
    // The biome says it best, where the world has one
    switch (site.biome) {
        case 'tundra': case 'coldDesert': case 'taiga': return 'cold';
        case 'temperateDesert': case 'subtropicalDesert': case 'savanna': return 'arid';
        case 'tropicalSeasonalForest': case 'tropicalRainforest': return 'tropical';
        case 'grassland': case 'temperateForest': case 'temperateRainforest': return 'temperate';
        default: break;
    }
    if (site.heat < 0.3) return 'cold';
    if (site.heat > 0.55 && site.aridity > 0.6) return 'arid';
    if (site.heat > 0.68 && site.aridity < 0.4 && site.greenery > 0.5) return 'tropical';
    return 'temperate';
}

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const normalize = (v) => {
    const l = Math.hypot(...v) || 1;
    return v.map((x) => x / l);
};

/** The setting of a place at `latitude` and `longitude` (degrees) on a world of `style`, from its `globe` */
export function readSite(latitude, longitude, style, globe) {
    style = prepared(style);
    const lat = latitude * Math.PI / 180, lon = longitude * Math.PI / 180;
    const centre = spherePoint(lat, lon);
    // East and north on the globe there, so directions come out on the city map
    const east = normalize([-Math.sin(lon), 0, -Math.cos(lon)]);
    const north = normalize([-Math.sin(lat) * Math.cos(lon), Math.cos(lat), Math.sin(lat) * Math.sin(lon)]);
    const onMap = (v) => [dot(v, east), dot(v, north)];
    // The point `distance` radians from the centre at `bearing` (radians, anticlockwise from east)
    const around = (distance, bearing) => normalize([0, 1, 2].map((i) => centre[i] * Math.cos(distance)
        + (east[i] * Math.cos(bearing) + north[i] * Math.sin(bearing)) * Math.sin(distance)));
    const { sites, triangles, colors, rivers } = globe;
    const cellCount = sites.length / 3;
    // The globe's cells are about this far apart
    const spacing = Math.sqrt(4 * Math.PI / cellCount);
    const water = waterTest(globe, style);
    const isWater = (p) => water(p[0], p[1], p[2]);
    const reliefAt = reliefTest(globe);
    const relief = (p) => reliefAt(p[0], p[1], p[2]);
    const sea = seaLevelKept(style);

    // The shore: water within about a cell, the way most of it lies
    let shore = null;
    const bearings = Array.from({ length: 16 }, (_, k) => k / 16 * 2 * Math.PI);
    for (const distance of [0.35, 0.7, 1.1]) {
        if (shore) break;
        const wet = bearings.filter((b) => isWater(around(spacing * distance, b)));
        if (!wet.length || wet.length >= bearings.length) continue;
        const toward = wet.reduce((sum, b) => [sum[0] + Math.cos(b), sum[1] + Math.sin(b)], [0, 0]);
        const length = Math.hypot(toward[0], toward[1]);
        if (!(length > 0.01)) continue;
        // The sea lies below sea level; water above it is a lake
        const point = around(spacing * distance, Math.atan2(toward[1], toward[0]));
        const kind = elevation(style, point[0], point[1], point[2], 0) < sea ? 'sea' : 'lake';
        shore = { kind, bearing: [toward[0] / length, toward[1] / length] };
    }

    // The river: the nearest stretch of river within about half a cell
    let river = null;
    if (rivers?.length) {
        const corner = (triangle) => {
            const a = triangles[triangle * 3], b = triangles[triangle * 3 + 1], c = triangles[triangle * 3 + 2];
            return normalize([0, 1, 2].map((i) => sites[a * 3 + i] + sites[b * 3 + i] + sites[c * 3 + i]));
        };
        const widest = rivers.reduce((m, r) => Math.max(m, r.halfWidth), 0) || 1;
        let best = null;
        const reach = Math.cos(spacing * 2);
        for (const edge of rivers) {
            const a = corner(edge.from);
            if (!(dot(a, centre) > reach)) continue;
            const b = corner(edge.to);
            // Distance from the centre to the stretch, close enough on so short a stretch to measure flat
            const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
            const ca = [centre[0] - a[0], centre[1] - a[1], centre[2] - a[2]];
            const t = Math.min(Math.max(dot(ca, ab) / Math.max(dot(ab, ab), 1e-12), 0), 1);
            const distance = Math.hypot(ca[0] - ab[0] * t, ca[1] - ab[1] * t, ca[2] - ab[2] * t);
            if (distance < (best?.distance ?? spacing * 0.6)) best = { distance, direction: ab, halfWidth: edge.halfWidth };
        }
        if (best) {
            const direction = onMap(best.direction);
            const length = Math.hypot(direction[0], direction[1]);
            if (length > 1e-6) river = { direction: [direction[0] / length, direction[1] / length], size: Math.min(best.halfWidth / widest, 1) };
        }
    }

    // Hills: how much the ground rises and falls round about, and how high it stands
    const here = relief(centre);
    let lowest = here, highest = here;
    let fall = [0, 0];
    for (const bearing of bearings) {
        for (const distance of [0.5, 1.0]) {
            const height = relief(around(spacing * distance, bearing));
            lowest = Math.min(lowest, height);
            highest = Math.max(highest, height);
            fall = [fall[0] + Math.cos(bearing) * (here - height), fall[1] + Math.sin(bearing) * (here - height)];
        }
    }
    const ground = groundHeight(style, centre[0], centre[1], centre[2], sea, 0);
    const landHeight = (ground - sea) / Math.max(1 - sea, 0.0001);
    const hilliness = Math.min(Math.max(Math.max((highest - lowest) / 0.008, (landHeight - 0.05) / 0.3), 0), 1);
    const fallLength = Math.hypot(fall[0], fall[1]);
    let downhill = fallLength > 1e-9 ? [fall[0] / fallLength, fall[1] / fallLength] : [1, 0];
    if (shore) {
        const d = [downhill[0] * 0.4 + shore.bearing[0], downhill[1] * 0.4 + shore.bearing[1]];
        const l = Math.hypot(d[0], d[1]) || 1;
        downhill = [d[0] / l, d[1] / l];
    }

    // Climate and growth: from the world's climate where it has one, else its latitude and colours
    const cell = new NearestSite(sites).nearest(centre[0], centre[1], centre[2]);
    const r = colors[cell * 3], g = colors[cell * 3 + 1], b = colors[cell * 3 + 2];
    const green = Math.min(Math.max((g - (r + b) / 2) / 0.2, 0), 1);
    let heat, aridity, greenery, forest, biome = null;
    const climate = climateSample(centre, style);
    if (climate) {
        biome = climate.biome;
        heat = Math.min(Math.max(climate.temperature, 0), 1.1) / 1.1;
        aridity = Math.min(Math.max(1 - climate.moisture / 0.35, 0), 1);
        [greenery, forest] = {
            tundra: [0.25, 0.02], coldDesert: [0.15, 0], taiga: [0.6, 0.75], temperateDesert: [0.15, 0.02],
            grassland: [0.65, 0.12], temperateForest: [0.8, 0.6], temperateRainforest: [0.9, 0.8],
            subtropicalDesert: [0.05, 0], savanna: [0.45, 0.12], tropicalSeasonalForest: [0.85, 0.55],
            tropicalRainforest: [1, 0.85],
        }[biome] ?? [0.6, 0.3];
    } else {
        const cold = coldness(style, centre[0], centre[1], centre[2]);
        heat = style.iceCapLatitude < 90 ? Math.min(Math.max(1 - cold / style.iceCapLatitude, 0), 1) : 1;
        greenery = style.vegetation ? green : 0;
        forest = greenery * 0.4;
        aridity = style.vegetation ? 1 - greenery : 1;
    }
    return { shore, river, hilliness, downhill, greenery, forest, heat, aridity, biome };
}
