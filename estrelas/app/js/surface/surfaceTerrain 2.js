//
//  surfaceTerrain.js
//  Estrelas (web)
//
//  What the ground is at a point on a world, as its surface shows it there: ocean, sea ice, a lake, snow, bare rock,
//  mountains, or one of the biomes; and the climate there. Each generator is asked the same questions its colouring
//  asks, in the same order. A port of SurfaceTerrain.swift and SurfaceClimate (BiomeSurface.swift).
//

import { prepared, elevation as elevationAt, detailNoise, coldness, seaLevel as seaLevelFor } from './surfaceMap.js';
import { icosphere, NearestSite } from './voronoiSurface.js';
import { Climate, Terrain, terrainHeight, landHeight, lapse, treeLine, biome, groundHeight } from './biomeSurface.js';
import { PolygonMap, PolygonKind, PolygonBiome } from './polygonSurface.js';
import { volcanicTerrain } from './volcanism.js';

/** Display names of the kinds of ground (SurfaceTerrain) */
export const terrainNames = {
    ocean: 'Ocean', seaIce: 'Sea ice', lake: 'Lake', frozenLake: 'Frozen lake', marsh: 'Marsh', snow: 'Snow and ice',
    iceCrust: 'Ice crust', bareGround: 'Bare ground', mountains: 'Mountains', beach: 'Coast', tundra: 'Tundra',
    coldDesert: 'Cold desert', taiga: 'Taiga', shrubland: 'Shrubland', scorched: 'Scorched rock',
    temperateDesert: 'Temperate desert', grassland: 'Grassland', temperateForest: 'Temperate forest',
    temperateRainforest: 'Temperate rainforest', subtropicalDesert: 'Subtropical desert', savanna: 'Savanna',
    tropicalSeasonalForest: 'Tropical seasonal forest', tropicalRainforest: 'Tropical rainforest',
    volcano: 'Volcano', activeVolcano: 'Active volcano', caldera: 'Caldera', lavaLake: 'Lava lake', lavaSea: 'Lava sea',
};

const capacity = 4;
const seaLevels = [];
const climates = [];
const maps = [];

function key(style) {
    const s = style.substellarPoint ? style.substellarPoint.join(',') : '-';
    return `${style.seed}|${style.waterFraction}|${style.iceCapLatitude}|${style.vegetation}|${!!style.frozenOver}|` +
        `${!!style.polygonMap}|${s}|${style.template?.fingerprint ?? ''}`;
}

function kept(list, k, make, limit) {
    const found = list.find((entry) => entry.key === k);
    if (found) return found.value;
    const value = make();
    list.unshift({ key: k, value });
    if (list.length > limit) list.pop();
    return value;
}

function seaLevelOf(style) {
    return kept(seaLevels, key(style), () => seaLevelFor(style, icosphere), capacity * 4);
}

function climateOf(style, sea) {
    return kept(climates, key(style), () => {
        const climate = new Climate(style, sea);
        return { climate, lookup: new NearestSite(climate.sites) };
    }, capacity);
}

function polygonMapOf(style, sea) {
    return kept(maps, key(style), () => {
        const map = new PolygonMap(style, sea);
        return { map, lookup: new NearestSite(map.sites) };
    }, capacity);
}

function unit(point) {
    const length = Math.hypot(point[0], point[1], point[2]) || 1;
    return [point[0] / length, point[1] / length, point[2] / length];
}

/**
 * What the ground is at `point` of a world drawn with `style`, at the detail its globe (0) or detailed map draws; null
 * for gas giants. Climate and polygon surfaces work out the world's climate the first time, so ask off the main
 * thread where possible; it's kept for the next few questions about the same world.
 */
export function terrainAt(point, style, detailOctaves = 0) {
    style = prepared(style);
    const [px, py, pz] = unit(point);
    if (style.kind === 'gasGiant') return null;
    if (style.kind === 'icy') return 'iceCrust';
    const sea = seaLevelOf(style);
    // Volcanoes and lava, above water
    if (style.volcanism > 0) {
        const height = elevationAt(style, px, py, pz, detailOctaves);
        if (!(style.waterFraction > 0 && height < sea)) {
            const volcanic = volcanicTerrain(style, px, py, pz, height, icosphere);
            if (volcanic) return volcanic;
        }
    }
    if (style.biomes && style.polygonMap) {
        const { map, lookup } = polygonMapOf(style, sea);
        const polygon = map.polygon(px, py, pz, lookup);
        const frozen = map.temperature[polygon] < 0;
        if (elevationAt(style, px, py, pz, detailOctaves) < sea) {
            if (frozen) return 'seaIce';
            if (map.kind[polygon] === PolygonKind.ocean) return 'ocean';
            return map.biome[polygon] === PolygonBiome.marsh ? 'marsh' : 'lake';
        }
        if (frozen) return 'snow';
        if (!style.vegetation) return 'bareGround';
        if (map.kind[polygon] !== PolygonKind.land) return 'beach';
        const names = ['ocean', 'lake', 'marsh', 'frozenLake', 'beach', 'snow', 'tundra', 'mountains', 'scorched', 'taiga',
            'shrubland', 'temperateDesert', 'temperateRainforest', 'temperateForest', 'grassland', 'tropicalRainforest',
            'tropicalSeasonalForest', 'subtropicalDesert'];
        return names[map.biome[polygon]];
    }
    if (style.biomes) {
        const { climate, lookup } = climateOf(style, sea);
        const cell = lookup.nearest(px, py, pz);
        const elevation = terrainHeight(style, px, py, pz, sea, detailOctaves);
        const frozen = climate.temperature[cell] < 0;
        if (elevation < sea) {
            if (frozen) return 'seaIce';
            return climate.terrain[cell] === Terrain.lake ? 'lake' : 'ocean';
        }
        if (climate.terrain[cell] === Terrain.lake) return frozen ? 'frozenLake' : 'lake';
        const height = landHeight(elevation, sea);
        const temperature = climate.temperature[cell] - lapse * Math.max(height - climate.height[cell], 0);
        if (temperature < 0) return 'snow';
        const rocky = height > treeLine + 0.06;
        if (!style.vegetation) return rocky ? 'mountains' : 'bareGround';
        if (rocky) return 'mountains';
        const kind = biome(temperature, climate.moisture[cell]);
        return { temperateForest: 'temperateForest', temperateRainforest: 'temperateRainforest' }[kind] ?? kind;
    }
    // The classic surface's ground, as `color` draws it
    const elevationNoise = elevationAt(style, px, py, pz, detailOctaves);
    const detail = detailNoise(style, px, py, pz, detailOctaves);
    const isSea = style.waterFraction > 0 && elevationNoise < sea;
    if (style.frozenOver || coldness(style, px, py, pz) > style.iceCapLatitude + (detail - 0.5) * 12) {
        return isSea ? 'seaIce' : 'snow';
    }
    if (isSea) return 'ocean';
    const height = (elevationNoise - sea) / Math.max(1 - sea, 0.0001);
    if (style.vegetation && height * 1.6 < 0.7) return 'temperateForest';
    return height > 0.7 ? 'mountains' : 'bareGround';
}

/**
 * How high the ground stands at `point` above sea level, 0 at the shore to about 1 on the highest peaks, as the surface
 * draws it; 0 at sea, and null for gas giants and icy crusts
 */
export function landHeightAt(point, style, detailOctaves = 0) {
    style = prepared(style);
    const [px, py, pz] = unit(point);
    if (style.kind !== 'rocky') return null;
    const sea = seaLevelOf(style);
    if (style.biomes && style.polygonMap) {
        const { map, lookup } = polygonMapOf(style, sea);
        if (!(elevationAt(style, px, py, pz, detailOctaves) >= sea)) return 0;
        return map.elevation[map.polygon(px, py, pz, lookup)];
    }
    const height = style.biomes ? terrainHeight(style, px, py, pz, sea, detailOctaves)
        : elevationAt(style, px, py, pz, detailOctaves);
    return landHeight(height, sea);
}

/** The highest land, as weather's lapse rate reckons it (LocalWeather.highestPeaks): 1 of land height is 8 km */
const highestPeaksMetres = 8000;
/** The deepest sea floor, where the height noise reaches 0 */
const deepestSeaMetres = 11000;
const lowestPoints = [];

/** The lowest ground on a world, over the cells of a fine icosphere */
function lowestOf(style, sea) {
    return kept(lowestPoints, `${key(style)}|${style.kind}|${!!style.biomes}`, () => {
        const vertices = icosphere(5).vertices;
        let lowest = Infinity;
        for (let i = 0; i < vertices.length; i += 3) {
            lowest = Math.min(lowest, groundHeight(style, vertices[i], vertices[i + 1], vertices[i + 2], sea, 0));
        }
        return lowest;
    }, capacity * 4);
}

/**
 * How high the ground stands at `point`, in metres: { metres, reference } where reference is 'sea' (above or below sea
 * level, on worlds with seas) or 'lowest' (above the world's lowest point, on worlds without). Null for gas giants.
 */
export function altitudeAt(point, style, detailOctaves = 0) {
    style = prepared(style);
    if (style.kind === 'gasGiant') return null;
    const [px, py, pz] = unit(point);
    const sea = seaLevelOf(style);
    const height = groundHeight(style, px, py, pz, sea, detailOctaves);
    if (style.kind === 'rocky' && style.waterFraction > 0) {
        const metres = height >= sea ? highestPeaksMetres * (height - sea) / Math.max(1 - sea, 0.0001)
            : -deepestSeaMetres * (sea - height) / Math.max(sea, 0.0001);
        return { metres, reference: 'sea' };
    }
    const lowest = Math.min(lowestOf(style, sea), height);
    return { metres: highestPeaksMetres * (height - lowest) / Math.max(1 - lowest, 0.0001), reference: 'lowest' };
}

/**
 * The climate at `point` on a world drawn with climate and biome surfaces: { temperature, moisture, biome, isWater,
 * riverFlow }, or null for other surfaces (SurfaceClimate.sample)
 */
export function climateSample(point, style) {
    style = prepared(style);
    if (!style.biomes) return null;
    const [px, py, pz] = unit(point);
    const { climate, lookup } = climateOf(style, seaLevelOf(style));
    const cell = lookup.nearest(px, py, pz);
    const temperature = climate.temperature[cell], moisture = climate.moisture[cell];
    return {
        temperature, moisture, biome: biome(temperature, moisture), isWater: climate.terrain[cell] !== Terrain.land,
        riverFlow: climate.isRiver(cell) ? climate.flow[cell] : 0,
    };
}

/** The world's sea level, kept for the next few questions about it */
export function seaLevelKept(style) {
    return seaLevelOf(prepared(style));
}
