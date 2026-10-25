//
//  surfaceWorker.js
//  Estrelas (web)
//
//  Draws surfaces off the main thread: globe cells, gas giant and moon textures, detailed maps and cloud layers,
//  each returned with its PNG (for images) ready to save. Also generates star field sectors and plans jump routes.
//

import * as SurfaceMap from './surfaceMap.js';
import { generateVoronoiSurface, icosphere, mapPixels, cells, cellColors } from './voronoiSurface.js';
import { encodePNG } from './png.js';
import { biomeRivers } from './biomeSurface.js';
import { polygonRivers } from './polygonSurface.js';
import { groundHeight } from './biomeSurface.js';
import { seaLevelKept, terrainAt, landHeightAt, altitudeAt } from './surfaceTerrain.js';
import { makeWeatherSnapshot } from './weatherMap.js';
import { gridHeights } from './contourMap.js';
import { dayPixels, fieldStyle, patchPoint } from '../scene/cityLightPattern.js';
import { generateStarField } from '../gen/systemStars.js';
import { StarFieldWindow } from '../scene/starFieldWindow.js';
import { planRoute } from '../scene/starRoute.js';


self.onmessage = async ({ data }) => {
    const { id, op } = data;
    const progress = (fraction) => self.postMessage({ id, progress: fraction });
    try {
        let result;
        let transfer = [];
        switch (op) {
            case 'globe': {
                const surface = generateVoronoiSurface(data.style, data.subdivisions, 0, progress);
                result = { sites: surface.sites, colors: surface.colors, triangles: surface.triangles.slice(),
                    heights: surface.heights, rivers: surface.rivers };
                transfer = [result.sites.buffer, result.colors.buffer, result.triangles.buffer];
                if (result.heights) transfer.push(result.heights.buffer);
                break;
            }
            case 'texture': {
                const pixels = SurfaceMap.drawnPixels(data.style, SurfaceMap.width, SurfaceMap.height, 0, 0, icosphere);
                result = { width: SurfaceMap.width, height: SurfaceMap.height, pixels, png: await encodePNG(pixels, SurfaceMap.width, SurfaceMap.height, false) };
                break;
            }
            case 'moonTemplate': {
                const pixels = SurfaceMap.moonPixels(SurfaceMap.moonTemplateStyle(data.template), icosphere);
                result = { width: SurfaceMap.width, height: SurfaceMap.height, pixels, png: await encodePNG(pixels, SurfaceMap.width, SurfaceMap.height, false) };
                break;
            }
            case 'detailedMap': {
                const surface = generateVoronoiSurface(data.style, SurfaceMap.detailedSubdivisions, SurfaceMap.detailedOctaves,
                    (f) => progress(f * 0.6));
                const w = SurfaceMap.detailedWidth, h = SurfaceMap.detailedHeight;
                const pixels = mapPixels(surface, w, h, (f) => progress(0.6 + f * 0.3));
                result = { width: w, height: h, pixels, png: await encodePNG(pixels, w, h, false) };
                break;
            }
            case 'clouds': {
                const pixels = SurfaceMap.cloudPixels(data.clouds, icosphere, SurfaceMap.cloudWidth, SurfaceMap.cloudHeight, progress);
                const w = SurfaceMap.cloudWidth, h = SurfaceMap.cloudHeight;
                result = { width: w, height: h, pixels, png: await encodePNG(pixels, w, h, true) };
                break;
            }
            case 'cloudRows': {
                // A band of a cloud map, drawn alongside the other bands in other workers
                const pixels = SurfaceMap.cloudPixels(data.clouds, icosphere, SurfaceMap.cloudWidth, SurfaceMap.cloudHeight, progress,
                    data.rowStart, data.rowEnd);
                result = { band: pixels };
                transfer = [pixels.buffer];
                break;
            }
            case 'pixelRows': {
                // A band of a texture, drawn alongside the other bands in other workers
                const style = data.template ? SurfaceMap.moonTemplateStyle(data.template) : data.style;
                const pixels = SurfaceMap.drawnPixels(style, data.width, data.height, data.detailOctaves ?? 0,
                    data.minimumCraterRadius ?? 0, icosphere, data.rowStart, data.rowEnd);
                result = { band: pixels };
                transfer = [pixels.buffer];
                break;
            }
            case 'cellColors': {
                // The colours of a range of a detailed map's cells
                const { colors, wet } = cellColors(data.style, data.subdivisions, data.detailOctaves, data.start, data.end, progress);
                result = { colors, wet };
                transfer = wet ? [colors.buffer, wet.buffer] : [colors.buffer];
                break;
            }
            case 'mapFromColors': {
                // A detailed map from its cells' colours, worked out in bands by the workers
                const style = SurfaceMap.prepared(data.style);
                const { sites, triangles } = cells(style, data.subdivisions);
                // Climate and biome maps have rivers along their cells' edges, worked out once every cell is known
                const rivers = data.wet ? (style.polygonMap ? polygonRivers : biomeRivers)(style, sites, triangles, data.wet) : [];
                const w = data.width ?? SurfaceMap.detailedWidth, h = data.height ?? SurfaceMap.detailedHeight;
                const pixels = mapPixels({ sites, colors: data.colors, triangles, heights: null, rivers }, w, h, progress);
                result = { width: w, height: h, pixels, png: await encodePNG(pixels, w, h, false) };
                break;
            }
            case 'cityGround': {
                // A settlement's streets and fields by day, over the lie of the land
                const style = data.style ? SurfaceMap.prepared(data.style) : null;
                const sea = style ? seaLevelKept(style) : 0;
                const point = patchPoint(data.latitude, data.longitude, data.kind);
                const landHeight = style ? (x, y) => {
                    const [px, py, pz] = point(x, y);
                    return (groundHeight(style, px, py, pz, sea, 0) - sea) / Math.max(1 - sea, 0.0001);
                } : null;
                result = dayPixels(BigInt(data.seed), data.kind, data.isElectric, fieldStyle(data.era, BigInt(data.seed)), landHeight);
                transfer = [result.color.buffer, result.opacity.buffer];
                break;
            }
            case 'terrain': {
                // What the ground is, and how high it stands, at a point on a world
                result = { terrain: terrainAt(data.point, data.style, data.detailOctaves ?? 0),
                    height: landHeightAt(data.point, data.style, data.detailOctaves ?? 0),
                    altitude: altitudeAt(data.point, data.style, data.detailOctaves ?? 0) };
                break;
            }
            case 'contourHeights': {
                // The ground's heights on part of a grid, for contour lines
                result = gridHeights(data.style, data.grid, data.start, data.end);
                transfer = [result.buffer];
                break;
            }
            case 'weather': {
                // The weather over a whole world at one moment
                result = makeWeatherSnapshot(data);
                break;
            }
            case 'sector': {
                // A sector of star field, generated off the main thread from its own seed
                result = generateStarField(data.seed, data.sector, data.reservedNames ?? []);
                break;
            }
            case 'route': {
                // A jump route, planned off the main thread over the systems' positions
                result = planRoute(data.waypoints, new StarFieldWindow(data.positions), data.parsecsPerUnit, data.range);
                break;
            }
            default:
                throw new Error(`Unknown operation ${op}`);
        }
        if (result?.pixels && result.png) transfer = [result.pixels.buffer, result.png.buffer];
        self.postMessage({ id, result }, transfer);
    } catch (error) {
        self.postMessage({ id, error: String(error?.stack ?? error) });
    }
};
