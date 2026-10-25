//
//  dataStore.js
//  Estrelas (web)
//
//  Reads and writes one universe's documents. Everything is generated once — the star field the first time the
//  universe is opened, each surface the first time it's needed — then always loaded from the folder, so this app,
//  the macOS app and any other client see the same universe. A port of DataStore.swift.
//

import {
    Format, version, encodeJSON, parseJSON, isoDate, check, manifestPath, starFieldPath, surfacePath, topologyPath,
    normalizeStarField, starFieldDocument, savedStarFieldDocument, sectorPath, advisoriesPath, legacyAdvisoriesPath,
    advisoriesDocument,
    annotationsPath, emptyAnnotations, normalizeAnnotations, annotationsAreEmpty, parsecsPerUnit, isSectored,
    needsNebulae,
} from './savedData.js';
import { generateStarField, halfLength } from '../gen/systemStars.js';
import { nebulaVersion, nebulaeForSavedSector } from '../gen/nebulaGenerator.js';
import { decodeTemplates } from '../surface/surfaceTemplate.js';
import { randomSeed } from '../gen/random.js';
import { generateSocial, socialIsMissing, travelAdvisory } from '../gen/socialGenerator.js';
import { generateRotations, rotationIsMissing } from '../gen/rotationGenerator.js';
import { sectorSeed, sameSector } from '../gen/sectors.js';
import * as SurfaceMap from '../surface/surfaceMap.js';
import { icosphere } from '../surface/voronoiSurface.js';
import { decodePNG, encodePNG, bytesFromBase64, base64FromBytes } from '../surface/png.js';

// MARK: surface workers

const workers = [];
let nextCall = 0;
const calls = new Map();

function workerPool() {
    if (workers.length === 0) {
        // At least two, so a slow cloud map never holds up a globe
        const count = Math.min(Math.max((navigator.hardwareConcurrency || 2) - 1, 2), 8);
        for (let i = 0; i < count; i++) {
            const worker = new Worker(new URL('../surface/surfaceWorker.js', import.meta.url), { type: 'module' });
            worker.busy = 0;
            worker.onmessage = ({ data }) => {
                const call = calls.get(data.id);
                if (!call) return;
                if (data.progress !== undefined) {
                    call.progress?.(data.progress);
                    return;
                }
                calls.delete(data.id);
                worker.busy -= 1;
                if (data.error) call.reject(new Error(data.error));
                else call.resolve(data.result);
            };
            worker.onerror = (event) => console.error('Surface worker failed', event.message);
            workers.push(worker);
        }
    }
    return workers;
}

/** Plans a route in a worker, over the systems' positions (a Float32Array of x, y, z per system) */
/** A settlement's ground by day, drawn in a worker: { color, opacity, size } */
export function drawCityGround(parameters) {
    return draw({ op: 'cityGround', ...parameters });
}

/** What the ground is and how high it stands at a point on a world: { terrain, height } */
export function terrainInWorker(point, style, detailOctaves = 0) {
    return draw({ op: 'terrain', point, style, detailOctaves });
}

/** The weather over a whole world (see weatherMap.js), worked out in a worker */
export function weatherInWorker(parameters) {
    return draw({ op: 'weather', ...parameters });
}

/** The ground's heights over a contour map's grid (see contourMap.js), worked out across the workers */
export async function contourHeightsInWorker(style, grid, count) {
    const parts = workerPool().length * 2;
    const size = Math.ceil(count / parts);
    const jobs = [];
    for (let start = 0; start < count; start += size) {
        jobs.push(draw({ op: 'contourHeights', style, grid, start, end: Math.min(start + size, count) }));
    }
    const pieces = await Promise.all(jobs);
    const heights = new Float64Array(count);
    let offset = 0;
    for (const piece of pieces) {
        heights.set(piece, offset);
        offset += piece.length;
    }
    return heights;
}

export function planRouteInWorker(positions, waypoints, parsecsPerUnit, range) {
    return draw({ op: 'route', positions, waypoints, parsecsPerUnit, range });
}

/** Runs a drawing job on the least busy worker */
function draw(message, progress) {
    const pool = workerPool();
    const worker = pool.reduce((best, w) => (w.busy < best.busy ? w : best), pool[0]);
    const id = ++nextCall;
    worker.busy += 1;
    return new Promise((resolve, reject) => {
        calls.set(id, { resolve, reject, progress });
        worker.postMessage({ id, ...message });
    });
}

/**
 * An image drawn in bands of rows across the workers, then put together and encoded. `message(rowStart, rowEnd)` is
 * the job for one band.
 */
async function drawInBands(message, width, height, alpha, progress) {
    const bands = workerPool().length * 2;
    const done = new Array(bands).fill(0);
    const report = () => progress?.(done.reduce((a, b) => a + b, 0) / bands);
    const parts = await Promise.all(Array.from({ length: bands }, (_, k) => {
        const rowStart = Math.round(k * height / bands), rowEnd = Math.round((k + 1) * height / bands);
        return draw(message(rowStart, rowEnd), (f) => { done[k] = f; report(); })
            .then((result) => ({ rowStart, band: result.band }));
    }));
    const pixels = new Uint8Array(width * height * 4);
    for (const { rowStart, band } of parts) pixels.set(band, rowStart * width * 4);
    return { width, height, pixels, png: await encodePNG(pixels, width, height, alpha) };
}

/** A cloud map, drawn in bands */
function drawCloudsInBands(clouds, progress) {
    return drawInBands((rowStart, rowEnd) => ({ op: 'cloudRows', clouds, rowStart, rowEnd }),
        SurfaceMap.cloudWidth, SurfaceMap.cloudHeight, true, progress);
}

/** A texture the size of a globe's, drawn in bands */
function drawTextureInBands(fields) {
    return drawInBands((rowStart, rowEnd) => ({ op: 'pixelRows', width: SurfaceMap.width, height: SurfaceMap.height, ...fields, rowStart, rowEnd }),
        SurfaceMap.width, SurfaceMap.height, false);
}

/**
 * A detailed map `scale` times finer than standard (1, 2 or 4): its cells are coloured by all the workers at once, then
 * one works out rivers and draws the map. Each doubling has twice the pixels across, four times the cells and an
 * octave more noise.
 */
async function drawDetailedMap(style, progress, scale = 1) {
    const steps = Math.max(Math.round(Math.log2(Math.max(scale, 1))), 0);
    const subdivisions = SurfaceMap.detailedSubdivisions + steps;
    const detailOctaves = SurfaceMap.detailedOctaves + steps;
    const { width, height } = SurfaceMap.detailedSize(scale);
    // An icosphere's vertex count, without building it here on the main thread
    const count = 10 * 4 ** subdivisions + 2;
    const parts = workerPool().length * 2;
    const done = new Array(parts).fill(0);
    const report = () => progress?.(0.8 * done.reduce((a, b) => a + b, 0) / parts);
    const colors = new Float64Array(count * 3);
    const wet = style.biomes ? new Uint8Array(count) : null;
    await Promise.all(Array.from({ length: parts }, (_, k) => {
        const start = Math.round(k * count / parts), end = Math.round((k + 1) * count / parts);
        return draw({ op: 'cellColors', style, subdivisions, detailOctaves, start, end },
            (f) => { done[k] = f; report(); }).then((result) => {
            colors.set(result.colors, start * 3);
            if (wet) wet.set(result.wet, start);
        });
    }));
    return draw({ op: 'mapFromColors', style, subdivisions, colors, wet, width, height }, (f) => progress?.(0.8 + 0.2 * f));
}

// MARK: universe documents

export async function readManifest(folder) {
    const text = await folder.readText(manifestPath);
    if (text === null) return null;
    return check(parseJSON(text), Format.universe);
}

export async function writeManifest(folder, manifest) {
    await folder.writeText(manifestPath, encodeJSON({ ...manifest, format: Format.universe, version }, true));
}

/** The seed a readable star field was made from: undefined if unreadable, null if it predates seeds */
export async function readStarFieldSeed(folder) {
    try {
        const text = await folder.readText(starFieldPath);
        if (text === null) return undefined;
        const document = parseJSON(text);
        check(document, Format.starField);
        if (!Array.isArray(document.systems)) return undefined;
        return document.seed ?? null;
    } catch {
        return undefined;
    }
}

/** FNV-1a over UTF-8, 32-bit, as the Mac app hashes a system id into a stand-in seed */
function fnv1a32(text) {
    let hash = 2166136261;
    for (const byte of new TextEncoder().encode(text)) hash = Math.imul(hash ^ byte, 16777619) >>> 0;
    return hash >>> 0;
}

export class UniverseStore {
    /** `folder` holds the universe's files; `readOnly` for a players' copy, which never rewrites its own files */
    constructor(folder, { readOnly = false } = {}) {
        this.folder = folder;
        this.readOnly = readOnly;
        this.loads = new Map();
    }

    /**
     * The saved star field, or a newly generated one (saved first) if the universe doesn't have one yet. The
     * document gains `parsecsPerUnit` and `sectorSeed` (the universe's seed if it goes on in generated sectors,
     * otherwise null). Star fields saved before social characteristics or rotation get them once, and are saved again.
     */
    async starField(onStatus) {
        const document = await this.loadStarField(onStatus);
        document.parsecsPerUnit = parsecsPerUnit(document, halfLength);
        document.sectorSeed = isSectored(document, halfLength) ? document.seed : null;
        // A generated universe's origin saved before nebulae existed (or placed by earlier rules) gets its own now
        if (needsNebulae(document, nebulaVersion) && document.sectorSeed !== null && document.seed != null) {
            const taken = await this.savedSystemNames();
            document.nebulae = nebulaeForSavedSector(document.seed, { x: 0, y: 0, z: 0 }, document.systems, [...taken]);
            document.nebulaVersion = nebulaVersion;
            if (!this.readOnly) {
                try {
                    await this.folder.writeText(starFieldPath, encodeJSON(savedStarFieldDocument(document), true));
                } catch (error) {
                    console.warn(`Couldn't save the star field's nebulae: ${error}`);
                }
            }
        }
        document.nebulae ??= [];
        // Worlds known from maps carry their surfaces, decoded once here
        await decodeTemplates(document.systems);
        return document;
    }

    async loadStarField(onStatus) {
        const text = await this.folder.readText(starFieldPath);
        if (text !== null) {
            try {
                const document = normalizeStarField(parseJSON(text));
                return await this.addingMissingCharacteristics(document, onStatus);
            } catch (error) {
                // Moved aside rather than overwritten, so a new one can be generated without losing it
                const stamp = isoDate().replaceAll(':', '-');
                await this.folder.writeText(`starfield-unreadable-${stamp}.json`, text);
                console.warn(`Couldn't read the saved star field (${error}); kept a copy as starfield-unreadable-${stamp}.json`);
            }
        }
        onStatus?.('generating');
        let manifest = null;
        try {
            manifest = await readManifest(this.folder);
        } catch {
            manifest = null;
        }
        const seed = manifest?.seed ?? randomSeed();
        if (manifest && manifest.seed === undefined) {
            manifest.seed = seed;
            await writeManifest(this.folder, manifest);
        }
        // Let the status show before the (short) synchronous generation
        await new Promise((resolve) => setTimeout(resolve, 30));
        const generated = await this.generatingSystems(async (reserved) => generateStarField(seed, undefined, [...reserved]));
        const document = starFieldDocument(generated.systems, seed, halfLength, undefined, 'parsec', generated.nebulae,
            nebulaVersion);
        await this.folder.writeText(starFieldPath, encodeJSON(document, true));
        return normalizeStarField(parseJSON(encodeJSON(document)));
    }

    /**
     * Star fields saved by earlier versions, or before societies or rotation existed, get what they're missing once
     * (societies from the universe's seed) and are saved again in the current layout. Earlier files' worlds were
     * converted to physical units as they were read; their societies are drawn again.
     */
    async addingMissingCharacteristics(document, onStatus) {
        const missingSocial = socialIsMissing(document.systems);
        if (!missingSocial && !rotationIsMissing(document.systems) && !((document.version ?? 1) < version) &&
            !document.converted) return document;
        onStatus?.('updating');
        await new Promise((resolve) => setTimeout(resolve, 30));
        if (missingSocial) {
            let manifestSeed;
            try {
                manifestSeed = (await readManifest(this.folder))?.seed;
            } catch {
                manifestSeed = undefined;
            }
            // Universes from other tools may have no seed; their first system's id stands in for one
            const seed = document.seed ?? manifestSeed ?? fnv1a32(document.systems[0]?.id ?? '');
            generateSocial(document.systems, seed);
        }
        generateRotations(document.systems);
        document.version = version;
        if (!this.readOnly) {
            try {
                await this.folder.writeText(starFieldPath, encodeJSON(savedStarFieldDocument(document), true));
            } catch (error) {
                console.warn(`Couldn't save the star field's new characteristics: ${error}`);
            }
        }
        return document;
    }

    /**
     * The systems of one sector of a generated universe away from the origin: loaded, or generated (in a worker) from
     * the universe's seed and saved the first time
     */
    sectorSystems(sector, universeSeed) {
        const path = sectorPath(sector);
        return this.once(path, async () => {
            const text = await this.folder.readText(path);
            if (text !== null) {
                try {
                    const saved = normalizeStarField(parseJSON(text));
                    if (saved.sector && sameSector(saved.sector, sector)) {
                        // Sectors saved by earlier versions, or before societies, rotation or nebulae existed, get
                        // what they're missing once and are saved in the current layout
                        const missingSocial = socialIsMissing(saved.systems);
                        const missingNebulae = needsNebulae(saved, nebulaVersion);
                        if (missingSocial || rotationIsMissing(saved.systems) || missingNebulae || (saved.version ?? 1) < version ||
                            saved.converted) {
                            const seed = sectorSeed(sector, universeSeed);
                            if (missingSocial) generateSocial(saved.systems, seed);
                            generateRotations(saved.systems);
                            if (missingNebulae) {
                                const taken = await this.savedSystemNames();
                                saved.nebulae = nebulaeForSavedSector(seed, sector, saved.systems, [...taken]);
                                saved.nebulaVersion = nebulaVersion;
                            }
                            saved.version = version;
                            if (!this.readOnly) await this.save(path, savedStarFieldDocument(saved));
                        }
                        await decodeTemplates(saved.systems);
                        return { systems: saved.systems, nebulae: saved.nebulae ?? [] };
                    }
                } catch (error) {
                    console.warn(`Couldn't read ${path}: ${error}`);
                }
            }
            const seed = sectorSeed(sector, universeSeed);
            const generated = await this.generatingSystems((reserved) =>
                draw({ op: 'sector', seed, sector, reservedNames: [...reserved] }));
            const document = starFieldDocument(generated.systems, seed, halfLength, { x: sector.x, y: sector.y, z: sector.z },
                'parsec', generated.nebulae, nebulaVersion);
            // Only into a universe that's still there
            if (await this.folder.exists(manifestPath)) await this.save(path, document);
            const saved = normalizeStarField(parseJSON(encodeJSON(document)));
            return { systems: saved.systems, nebulae: saved.nebulae ?? [] };
        });
    }

    /**
     * Generates a star field or sector with `generate`, which is handed every system name the universe already has so
     * none is given out again. One at a time, so two sectors generated at once can't both take the same name.
     */
    generatingSystems(generate) {
        const run = async () => {
            if (!this.systemNames) this.systemNames = await this.savedSystemNames();
            const generated = await generate(this.systemNames);
            for (const system of generated.systems) if (system.name) this.systemNames.add(system.name);
            return generated;
        };
        const result = (this.nameQueue ?? Promise.resolve()).then(run, run);
        this.nameQueue = result.catch(() => {});
        return result;
    }

    /** The names of the systems in the universe's saved star field and sectors */
    async savedSystemNames() {
        const names = new Set();
        for (const path of [starFieldPath, ...(await this.sectorFiles())]) {
            try {
                const text = await this.folder.readText(path);
                if (text === null) continue;
                for (const system of parseJSON(text).systems ?? []) if (system.name) names.add(system.name);
            } catch {
                // An unreadable file has no names to keep
            }
        }
        return names;
    }

    // MARK: travel advisories and annotations

    /**
     * The advisories put on the universe's systems, by system id. A universe from an earlier version has its travel
     * zones file converted the first time.
     */
    async travelAdvisories() {
        const document = await this.readDocument(advisoriesPath, Format.advisories);
        if (document) return document.advisories ?? {};
        let legacy = null;
        try {
            const text = await this.folder.readText(legacyAdvisoriesPath);
            legacy = text === null ? null : parseJSON(text);
        } catch {
            legacy = null;
        }
        if (!legacy?.zones) return {};
        const advisories = Object.fromEntries(Object.entries(legacy.zones).map(([id, zone]) => [id, travelAdvisory(zone)]));
        if (!this.readOnly) {
            await this.saveTravelAdvisories(advisories);
            try {
                if (await this.folder.exists(advisoriesPath)) await this.folder.remove(legacyAdvisoriesPath);
            } catch {
                // Left in place; it's ignored once advisories.json exists
            }
        }
        return advisories;
    }

    async saveTravelAdvisories(advisories) {
        try {
            await this.folder.writeText(advisoriesPath, encodeJSON(advisoriesDocument(advisories), true));
        } catch (error) {
            console.warn(`Couldn't save the travel advisories: ${error}`);
        }
    }

    /** Every system's annotations, by system id */
    async allAnnotations() {
        const result = {};
        let folder;
        try {
            if (!(await this.folder.exists('annotations'))) return result;
            folder = await this.folder.subfolder('annotations');
        } catch {
            return result;
        }
        for (const entry of await folder.entries()) {
            if (entry.kind !== 'file' || !entry.name.endsWith('.json')) continue;
            try {
                const document = check(parseJSON(await folder.readText(entry.name)), Format.annotations);
                if (!document.systemID) continue;
                result[document.systemID] = normalizeAnnotations(document);
                // Files from earlier versions are saved again converted, so the Mac app reads the same places
                if ((document.version ?? version) < version && !this.readOnly) {
                    await this.saveAnnotations(result[document.systemID]);
                }
            } catch (error) {
                console.warn(`Couldn't read annotations/${entry.name}: ${error}`);
            }
        }
        return result;
    }

    /** Rewritten whenever anything added by hand changes; a system with nothing left added has its file removed */
    async saveAnnotations(document) {
        const path = annotationsPath(document.systemID);
        try {
            if (annotationsAreEmpty(document)) {
                if (await this.folder.exists(path)) {
                    const folder = await this.folder.subfolder('annotations');
                    await folder.remove(`${document.systemID}.json`);
                }
            } else {
                await this.folder.writeText(path, encodeJSON(document, true));
            }
        } catch (error) {
            console.warn(`Couldn't save the annotations: ${error}`);
        }
    }

    /** Every sector file saved so far, by its path in the universe */
    async sectorFiles() {
        try {
            if (!(await this.folder.exists('sectors'))) return [];
            const folder = await this.folder.subfolder('sectors');
            return (await folder.entries()).filter((e) => e.kind === 'file' && e.name.endsWith('.json'))
                .map((e) => `sectors/${e.name}`);
        } catch {
            return [];
        }
    }

    /** One load per file at a time, however many parts of the app ask for it */
    once(path, load) {
        if (!this.loads.has(path)) {
            const promise = load().catch((error) => {
                this.loads.delete(path);
                throw error;
            });
            this.loads.set(path, promise);
        }
        return this.loads.get(path);
    }

    async readDocument(path, format) {
        const text = await this.folder.readText(path);
        if (text === null) return null;
        try {
            return check(parseJSON(text), format);
        } catch (error) {
            console.warn(`Couldn't read ${path}: ${error}`);
            return null;
        }
    }

    async save(path, document) {
        try {
            await this.folder.writeText(path, encodeJSON(document));
        } catch (error) {
            console.warn(`Couldn't save ${path}: ${error}`);
        }
    }

    /**
     * A rocky or icy world's globe cells at a resolution (1, 2 or 4): { sites, colors (0…1), triangles, heights, rivers }.
     * Each resolution has a file of its own ("<world>-globe.json", "<world>-globe@2x.json"), so every one drawn stays
     * saved.
     */
    globe(systemID, world, style, scale = 1, coarse = false) {
        // `coarse` draws a small globe ("<world>-globe@small.json"), with a sixteenth of the cells, for a small moon
        // drawn like a planet while it isn't zoomed to
        const path = surfacePath(systemID, world, surfaceArtifact('globe', style) + (coarse ? '@small' : resolutionSuffix(scale)));
        return this.once(path, async () => {
            const subdivisions = coarse ? SurfaceMap.globeSubdivisions - 2 : SurfaceMap.globeSubdivisions + resolutionSteps(scale);
            const saved = await this.readDocument(path, Format.globe);
            // Climate and biome globes need their relief and edge rivers; ones saved before they had them are redrawn,
            // as are those of worlds locked to their star saved before their ice went to the night side, those drawn as
            // another kind of world, and those whose ice over water was coloured by an earlier version of the sea ice
            if (saved && saved.subdivisions === subdivisions && saved.sites?.length === saved.cellCount * 3 &&
                sameVector(saved.style?.substellarPoint, style.substellarPoint) &&
                SurfaceMap.recordMatches(saved.style, SurfaceMap.styleRecord(style)) &&
                saved.colors?.length === saved.cellCount * 3 &&
                (!style.biomes || (saved.heights?.length === saved.cellCount && saved.riverHalfWidths != null &&
                    saved.riverCorners?.length === (saved.riverHalfWidths?.length ?? 0) * 2))) {
                const topology = icosphere(subdivisions);
                if (topology.count === saved.cellCount) {
                    const colors = Float64Array.from(saved.colors, (c) => (c + 0.5) / 255);
                    const corners = saved.riverCorners ?? [], halfWidths = saved.riverHalfWidths ?? [];
                    const rivers = halfWidths.map((halfWidth, index) =>
                        ({ from: corners[index * 2], to: corners[index * 2 + 1], halfWidth: Math.fround(halfWidth) }));
                    return { sites: Float64Array.from(saved.sites), colors, triangles: topology.triangles,
                        heights: saved.heights ? Float32Array.from(saved.heights) : null, rivers };
                }
            }
            const surface = await draw({ op: 'globe', style, subdivisions });
            await this.saveTopologyIfNeeded(subdivisions, surface.sites.length / 3, surface.triangles);
            await this.save(path, {
                format: Format.globe, version, systemID, world, style: SurfaceMap.styleRecord(style), subdivisions,
                cellCount: surface.sites.length / 3, sites: Float32Array.from(surface.sites),
                colors: Uint8Array.from(surface.colors, (c) => Math.trunc(Math.min(Math.max(c, 0), 1) * 255)),
                topology: topologyPath(subdivisions), heights: surface.heights ?? undefined,
                riverCorners: style.biomes ? Int32Array.from(surface.rivers.flatMap((r) => [r.from, r.to])) : undefined,
                riverHalfWidths: style.biomes ? Float32Array.from(surface.rivers.map((r) => r.halfWidth)) : undefined,
            });
            return surface;
        });
    }

    async saveTopologyIfNeeded(subdivisions, vertexCount, triangles) {
        const path = topologyPath(subdivisions);
        if (await this.folder.exists(path)) return;
        await this.save(path, { format: Format.topology, version, subdivisions, vertexCount, triangles });
    }

    /** A gas giant's banded globe texture: { width, height, pixels } */
    gasGiantTexture(systemID, world, style) {
        return this.image(systemID, world, 'texture', 'texture', SurfaceMap.styleRecord(style), undefined,
            () => drawTextureInBands({ style }), SurfaceMap.width, SurfaceMap.height);
    }

    /** One of the grey textures every moon shares */
    moonTemplate(template) {
        const style = SurfaceMap.moonTemplateStyle(template);
        return this.image('templates', `moon_${template}`, 'texture', 'moonTemplate', SurfaceMap.styleRecord(style),
            undefined, () => drawTextureInBands({ template, minimumCraterRadius: SurfaceMap.moonCraterRadius }),
            SurfaceMap.width, SurfaceMap.height);
    }

    /**
     * A rocky or icy world's detailed surface map at a resolution (1, 2 or 4). Finer maps keep their PNG in a file of
     * its own beside the JSON ("<world>-map@2x.png" and "<world>-map@2x.json").
     */
    detailedMap(systemID, world, style, progress, scale = 1) {
        const { width, height } = SurfaceMap.detailedSize(scale);
        return this.image(systemID, world, surfaceArtifact('map', style) + resolutionSuffix(scale), 'detailedMap',
            SurfaceMap.styleRecord(style), undefined, () => drawDetailedMap(style, progress, scale), width, height,
            scale === 1 ? undefined : scale);
    }

    /** The cloud layer over a world's globe (RGBA, alpha being the cloud's thickness) */
    cloudMap(systemID, world, clouds, progress) {
        return this.image(systemID, world, 'clouds', 'clouds', undefined, SurfaceMap.cloudRecord(clouds),
            () => drawCloudsInBands(clouds, progress), SurfaceMap.cloudWidth, SurfaceMap.cloudHeight);
    }

    /** An image loaded, or drawn and saved. With a `scale`, the PNG goes in a file of its own beside the JSON. */
    image(systemID, world, artifact, purpose, style, clouds, generate, width, height, scale) {
        const path = surfacePath(systemID, world, artifact);
        const pngPath = path.replace(/\.json$/, '.png');
        const result = this.once(path, async () => {
            const saved = await this.readDocument(path, Format.surfaceImage);
            // Images drawn at another resolution, before biome surfaces had relief and edge rivers, before locked
            // worlds' ice went to their night side, with longitudes running the other way, or (for clouds) by another
            // version of the cloud drawing, are drawn again
            if (saved && saved.style?.relief === style?.relief && saved.style?.edgeRivers === style?.edgeRivers &&
                (!style || SurfaceMap.recordMatches(saved.style, style)) &&
                saved.style?.mapOrientation === style?.mapOrientation &&
                sameVector(saved.style?.substellarPoint, style?.substellarPoint) &&
                saved.clouds?.cloudVersion === clouds?.cloudVersion) {
                let bytes = saved.data ? bytesFromBase64(saved.data) : null;
                if (!bytes && saved.file) {
                    const folder = path.slice(0, path.lastIndexOf('/') + 1);
                    bytes = await this.folder.readBytes(folder + saved.file).catch(() => null);
                }
                const image = bytes ? await decodeImage(bytes, saved.mediaType) : null;
                if (image && image.width === width && image.height === height) return image;
            }
            const drawn = await generate();
            const document = {
                format: Format.surfaceImage, version, systemID, world, style, clouds, purpose,
                width: drawn.width, height: drawn.height, mediaType: 'image/png',
            };
            if (scale) {
                // The image first, so the JSON never names a file that isn't there yet
                try {
                    await this.folder.writeBytes(pngPath, drawn.png);
                } catch (error) {
                    console.warn(`Couldn't save ${pngPath}: ${error}`);
                    return { width: drawn.width, height: drawn.height, pixels: drawn.pixels };
                }
                document.file = pngPath.slice(pngPath.lastIndexOf('/') + 1);
                document.scale = scale;
            } else {
                document.data = base64FromBytes(drawn.png);
            }
            await this.save(path, document);
            return { width: drawn.width, height: drawn.height, pixels: drawn.pixels };
        });
        // 4× maps are too large to hold for every world, so they're read back from the universe each time
        if (scale >= 4) result.finally(() => this.loads.delete(path)).catch(() => {});
        return result;
    }
}

/**
 * The file name a world's globe or detailed map is saved under, by how its surface is generated, so each generator's
 * surfaces are kept apart and switching between them in Settings redraws none of them
 */
export function surfaceArtifact(base, style) {
    if (!style.biomes) return base;
    return base + (style.polygonMap ? '-polygons' : '-biomes');
}

/** Doublings past the standard resolution: each has four times the cells */
export const resolutionSteps = (scale) => Math.max(Math.round(Math.log2(Math.max(scale, 1))), 0);

/** Added to a saved surface's file name for resolutions finer than standard, e.g. "@2x" */
export const resolutionSuffix = (scale) => (scale > 1 ? `@${scale}x` : '');

/** Two saved vectors the same, or both missing */
function sameVector(a, b) {
    if (!a || !b) return !a && !b;
    return a.length === b.length && a.every((value, index) => value === b[index]);
}

/** Straight RGBA pixels from saved image bytes, using the browser's decoder for anything ours doesn't handle */
async function decodeImage(bytes, mediaType = 'image/png') {
    try {
        const decoded = await decodePNG(bytes);
        if (decoded) return decoded;
    } catch {
        // Fall through to the browser
    }
    try {
        const bitmap = await createImageBitmap(new Blob([bytes], { type: mediaType }), { premultiplyAlpha: 'none' });
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const context = canvas.getContext('2d');
        context.drawImage(bitmap, 0, 0);
        const data = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
        return { width: bitmap.width, height: bitmap.height, pixels: new Uint8Array(data.buffer) };
    } catch {
        return null;
    }
}
