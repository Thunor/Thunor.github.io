//
//  weatherMap.js
//  Estrelas (web)
//
//  The weather over a whole world at one moment, sampled on a grid of latitude and longitude from the cloud shader's
//  weather (cloudModel.js), and drawn as map layers: precipitation radar and temperature, with the night side shaded.
//  Laid out like the surface maps: longitude 0° to 360° east across, north at the top. A port of WeatherMap.swift.
//

import { cloudSettings, sampleClouds, spherePoint, activeSpiral, spirals } from './cloudModel.js';
import {
    temperature, onGround, precipitationIntensity, precipitationKind, windVector, peakWind, hurricaneCategory,
} from './localWeather.js';
import { terrainAt, landHeightAt } from './surfaceTerrain.js';
import { coordinate } from './surfaceMap.js';

export const weatherWidth = 360;
export const weatherHeight = 180;
export const weatherLayers = ['radar', 'temperature'];
export const weatherLayerTitles = { radar: 'Radar', temperature: 'Temperature' };

const kindCodes = { rain: 0, sleet: 1, snow: 2, methaneRain: 3, methaneSnow: 4, acidVirga: 5 };
const noKind = 255;

/** The point on the unit sphere a grid sample stands for, in the world's own space */
function gridPoint(x, y) {
    const latitude = (0.5 - (y + 0.5) / weatherHeight) * Math.PI;
    return spherePoint(latitude, (x + 0.5) / weatherWidth);
}

/** Latitude and longitude of a grid sample's centre, in degrees */
export function gridCoordinate(x, y) {
    return [90 - (y + 0.5) / weatherHeight * 180, (x + 0.5) / weatherWidth * 360];
}

const groundGrids = [];

/** The ground under each point of the weather grid, as the world's surface draws it, worked out once per world */
function groundGrid(style) {
    const s = style.substellarPoint ? style.substellarPoint.join(',') : '-';
    const key = `${style.kind}|${style.seed}|${style.waterFraction}|${style.iceCapLatitude}|${style.vegetation}|` +
        `${style.biomes}|${style.polygonMap}|${style.frozenOver}|${s}|${style.template?.fingerprint ?? ''}`;
    const found = groundGrids.find((entry) => entry.key === key);
    if (found) return found.grid;
    const count = weatherWidth * weatherHeight;
    const heights = new Array(count);
    const terrains = new Array(count);
    for (let y = 0; y < weatherHeight; y++) {
        for (let x = 0; x < weatherWidth; x++) {
            const index = y * weatherWidth + x;
            const point = gridPoint(x, y);
            heights[index] = landHeightAt(point, style, 0);
            terrains[index] = terrainAt(point, style, 0);
        }
    }
    const grid = { heights, terrains };
    groundGrids.unshift({ key, grid });
    if (groundGrids.length > 4) groundGrids.pop();
    return grid;
}

/**
 * The weather on a world when the weather clock reads `time`: samples row by row from the north, and its spiral
 * storms. `sunDirection` is its nearest star's direction in the world's own space; `surface` its surface style.
 */
export function makeWeatherSnapshot({ clouds, environment, time, sunDirection, faceLocked = false, surface = null }) {
    const settings = cloudSettings(clouds, faceLocked);
    const count = weatherWidth * weatherHeight;
    const ground = surface ? groundGrid(surface) : null;
    const cloud = new Float32Array(count);
    const precipitation = new Float32Array(count);
    const kinds = new Uint8Array(count).fill(noKind);
    const kelvin = new Float32Array(count);
    const windEast = new Float32Array(count), windNorth = new Float32Array(count);
    const sun = new Float32Array(count);
    for (let y = 0; y < weatherHeight; y++) {
        for (let x = 0; x < weatherWidth; x++) {
            const index = y * weatherWidth + x;
            const point = gridPoint(x, y);
            const sample = sampleClouds(point, time, settings);
            const elevation = sunDirection ? point[0] * sunDirection[0] + point[1] * sunDirection[1] + point[2] * sunDirection[2] : null;
            const k = onGround(temperature(environment, Math.asin(point[1]), elevation, sample.cloud, faceLocked), environment,
                ground?.heights[index] ?? null, ground?.terrains[index] ?? null);
            cloud[index] = sample.cloud;
            precipitation[index] = precipitationIntensity(sample);
            const kind = precipitationKind(environment, k);
            kinds[index] = kind ? kindCodes[kind] : noKind;
            kelvin[index] = k;
            const flow = windVector(sample, point, settings);
            windEast[index] = flow[0];
            windNorth[index] = flow[1];
            sun[index] = elevation ?? 0;
        }
    }
    const storms = [];
    for (let index = 0; index < spirals; index++) {
        const spiral = activeSpiral(index, time, settings);
        if (!spiral || !(spiral.strength > 0.2)) continue;
        const peak = peakWind(spiral.tropical, spiral.strength);
        let name;
        if (spiral.tropical) {
            const category = hurricaneCategory(peak);
            name = category > 0 ? { key: 'Tropical cyclone, category %lld', value: category } : { key: 'Tropical storm' };
        } else {
            name = { key: 'Cyclone' };
        }
        const [latitude, longitude] = coordinate(...spiral.centre);
        storms.push({ id: index, name, latitude: latitude * 180 / Math.PI, longitude: longitude * 180 / Math.PI, wind: peak });
    }
    return { cloud, precipitation, kinds, kelvin, windEast, windNorth, sun: sunDirection ? sun : null, storms };
}

function rowWeight(y) {
    return Math.cos((0.5 - (y + 0.5) / weatherHeight) * Math.PI);
}

function areaFraction(included) {
    let inside = 0, total = 0;
    for (let y = 0; y < weatherHeight; y++) {
        const w = rowWeight(y);
        for (let x = 0; x < weatherWidth; x++) {
            total += w;
            if (included(y * weatherWidth + x)) inside += w;
        }
    }
    return total > 0 ? inside / total : 0;
}

/** The snapshot's totals, each sample weighted by the area it stands for */
export function weatherSummary(snapshot) {
    const { cloud, precipitation, kinds, kelvin, windEast, windNorth } = snapshot;
    let coldest = Infinity, hottest = -Infinity, total = 0, weight = 0;
    for (let y = 0; y < weatherHeight; y++) {
        const w = rowWeight(y);
        for (let x = 0; x < weatherWidth; x++) {
            const k = kelvin[y * weatherWidth + x];
            coldest = Math.min(coldest, k);
            hottest = Math.max(hottest, k);
            total += k * w;
            weight += w;
        }
    }
    let best = 0, bestIndex = 0;
    for (let i = 0; i < windEast.length; i++) {
        const speed = Math.hypot(windEast[i], windNorth[i]);
        if (speed > best) { best = speed; bestIndex = i; }
    }
    const [latitude, longitude] = gridCoordinate(bestIndex % weatherWidth, Math.trunc(bestIndex / weatherWidth));
    return {
        cloudCover: areaFraction((i) => cloud[i] > 0.15),
        precipitationCover: areaFraction((i) => precipitation[i] > 0 && kinds[i] !== noKind && kinds[i] !== kindCodes.acidVirga),
        coldest, hottest, meanKelvin: weight > 0 ? total / weight : 0,
        strongestWind: { speed: best, latitude, longitude },
    };
}

export const rainColours = [[0.45, 0.85, 0.4], [0.1, 0.65, 0.2], [0.95, 0.9, 0.2], [1, 0.55, 0.1], [0.9, 0.15, 0.1],
    [0.85, 0.1, 0.65]];
export const temperatureColours = [[0.45, 0.2, 0.7], [0.2, 0.35, 0.9], [0.2, 0.75, 0.9], [0.3, 0.8, 0.35],
    [0.95, 0.9, 0.25], [1, 0.55, 0.15], [0.85, 0.15, 0.1]];

const mix3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** A colour `fraction` (0...1) of the way along evenly spaced `colours` */
export function ramp(colours, fraction) {
    const position = Math.min(Math.max(fraction, 0), 1) * (colours.length - 1);
    const index = Math.min(Math.trunc(position), colours.length - 2);
    return mix3(colours[index], colours[index + 1], position - index);
}

/** RGBA pixels (not premultiplied) of the grid, each sample's colour and opacity from `colour(index)` */
function image(colour) {
    const pixels = new Uint8ClampedArray(weatherWidth * weatherHeight * 4);
    for (let index = 0; index < weatherWidth * weatherHeight; index++) {
        const [r, g, b, a] = colour(index);
        pixels[index * 4] = Math.trunc(Math.min(Math.max(r, 0), 1) * 255);
        pixels[index * 4 + 1] = Math.trunc(Math.min(Math.max(g, 0), 1) * 255);
        pixels[index * 4 + 2] = Math.trunc(Math.min(Math.max(b, 0), 1) * 255);
        pixels[index * 4 + 3] = Math.trunc(Math.min(Math.max(a, 0), 1) * 255);
    }
    return pixels;
}

/** Precipitation as a weather radar shows it, cloud faintly beneath */
export function radarPixels(snapshot) {
    const { precipitation, kinds, cloud } = snapshot;
    return image((index) => {
        const intensity = precipitation[index];
        if (!(intensity > 0) || kinds[index] === noKind) return [1, 1, 1, 0.18 * cloud[index]];
        switch (kinds[index]) {
            case kindCodes.rain: case kindCodes.methaneRain: return [...ramp(rainColours, intensity), 0.85];
            case kindCodes.sleet: return [...mix3([1, 0.65, 0.82], [0.8, 0.25, 0.6], intensity), 0.85];
            case kindCodes.snow: case kindCodes.methaneSnow: return [...mix3([0.7, 0.88, 1], [0.15, 0.35, 0.95], intensity), 0.85];
            default: return [0.92, 0.85, 0.4, 0.35];
        }
    });
}

/** Temperature, coloured from `lower` (coldest) to `upper` (hottest) kelvin */
export function temperaturePixels(snapshot, lower, upper) {
    const span = Math.max(upper - lower, 1);
    return image((index) => [...ramp(temperatureColours, (snapshot.kelvin[index] - lower) / span), 0.62]);
}

/** The night side darkened, deepening through twilight */
export function nightPixels(snapshot) {
    if (!snapshot.sun) return null;
    return image((index) => {
        const t = Math.min(Math.max((0.05 - snapshot.sun[index]) / 0.15, 0), 1);
        return [0, 0, 0.04, 0.4 * t * t * (3 - 2 * t)];
    });
}

/** The map of a layer as it's drawn */
export function layerPixels(snapshot, layer) {
    if (layer === 'temperature') {
        let coldest = Infinity, hottest = -Infinity;
        for (const k of snapshot.kelvin) { coldest = Math.min(coldest, k); hottest = Math.max(hottest, k); }
        return temperaturePixels(snapshot, coldest, hottest);
    }
    return radarPixels(snapshot);
}
