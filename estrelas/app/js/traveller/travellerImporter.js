//
//  travellerImporter.js
//  Estrelas (web) — Traveller module
//
//  Turns TravellerMap sectors into a universe: every listed hex becomes a star system laid out flat, one parsec a hex,
//  built round the world TravellerMap lists — its stars, size, air, water, people, port and bases — with everything
//  TravellerMap doesn't list (the rest of the system, the details of the society) generated. Each hex has its own
//  seed, from the universe's seed, its sector and its hex, so it always comes out the same and can be redone alone.
//
//  What was fetched is kept beside the star field in charts/travellerHexMap/source.json (see TRAVELLER_DATA_FORMAT.md):
//  each sector's data as TravellerMap gave it, every version fetched, and which one the universe was built from.
//  Ports TravellerImporter.swift and the redoing half of TravellerUpdates.swift; universes made by either app open in
//  the other.
//

import { rng } from '../gen/random.js';
import { assignOrbits, nameStars, savedStar, halfLength } from '../gen/systemStars.js';
import { PlanetarySystemGenerator } from '../gen/planetarySystemGenerator.js';
import '../gen/principalWorld.js';
import { placeNames } from '../gen/placeNames.js';
import { generateSocial } from '../gen/socialGenerator.js';
import { generateRotations } from '../gen/rotationGenerator.js';
import { nebulaVersion } from '../gen/nebulaGenerator.js';
import {
    encodeJSON, parseJSON, isoDate, starFieldDocument, starFieldPath, normalizeStarField,
} from '../model/savedData.js';
import {
    parseSecondSurvey, requirementsFor, societyFor, starsFor, worldColumn, worldRow, parseUWP, sameWorld,
} from './travellerData.js';
import * as Client from './travellerMapClient.js';
import { templateFromImage, savedTemplate } from './worldMapImporter.js';
import { t } from '../ui/i18n.js';

export const kind = 'travellerHexMap';
/** universe.json's `source` for universes charted from TravellerMap */
export const sourceName = 'travellermap.com';
export const columns = 32;
export const rows = 40;
/** Between columns' centres, with neighbouring hexes' centres a parsec apart */
export const columnSpacing = Math.fround(0.8660254);
/** The share of main worlds the tides would lock that are left locked */
export const principalLockChance = 0.15;
export const currentRotationVersion = 2;

const chartFolder = `charts/${kind}`;
export const sourcePath = `${chartFolder}/source.json`;

// MARK: hashes

const encoder = new TextEncoder();
const MASK64 = (1n << 64n) - 1n;

/** FNV-1a over bytes, as 16 hex digits */
function fnv64(bytes) {
    let hash = 0xCBF29CE484222325n;
    for (const byte of bytes) hash = ((hash ^ BigInt(byte)) * 0x100000001B3n) & MASK64;
    return hash.toString(16).padStart(16, '0');
}

/** A snapshot's id: FNV-1a over its data and subsector names */
export function snapshotHash(data, metadata) {
    const names = Object.entries(metadata.subsectorNames ?? {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, value]) => `${key}=${value}`);
    return fnv64(encoder.encode(`${data}\u0001${names.join('\u0002')}`));
}

/** FNV-1a of an image, as 16 hex digits */
export const imageHash = (bytes) => fnv64(bytes);

function fnv32(text) {
    let hash = 2166136261;
    for (const byte of encoder.encode(text)) hash = Math.imul(hash ^ byte, 16777619) >>> 0;
    return hash >>> 0;
}

// MARK: the source document

export function makeSnapshot(data, metadata, fetchedAt = new Date()) {
    return { id: snapshotHash(data, metadata), fetchedAt: isoDate(fetchedAt), data, metadata };
}

/** The snapshot a sector's systems were built from */
export const currentSnapshot = (sector) => sector.snapshots.find((s) => s.id === sector.inUse) ?? sector.snapshots[sector.snapshots.length - 1] ?? null;

const worldsCache = new WeakMap();
/** A snapshot's worlds, parsed once */
export function snapshotWorlds(snapshot) {
    if (!snapshot) return [];
    let worlds = worldsCache.get(snapshot);
    if (!worlds) {
        worlds = parseSecondSurvey(snapshot.data);
        worldsCache.set(snapshot, worlds);
    }
    return worlds;
}

export const sectorID = (sector) => Client.listingID(sector.listing);
export const layoutOf = (source, systemID) => source.layouts?.[systemID] ?? 0;
export const isDataOnly = (source) => source?.dataOnly === true;

export async function loadSource(folder) {
    try {
        const text = await folder.readText(sourcePath);
        if (text === null) return null;
        const document = parseJSON(text);
        return document?.format === 'estrelas.traveller.source' ? document : null;
    } catch {
        return null;
    }
}

export async function saveSource(folder, source) {
    await folder.writeText(sourcePath, encodeJSON(source, true));
}

// MARK: systems

/**
 * A system's id: its sector and hex, so it stays the same whenever the hex is redone, and the notes, places and
 * surfaces kept under it stay with it
 */
export function systemID(listing, hex) {
    const safe = [...listing.abbreviation].filter((c) => /^[A-Za-z0-9]$/.test(c)).join('');
    return `${safe || `S${listing.x}_${listing.y}`}-${hex}`;
}

/** Where a hex lies in the scene: flat, x across the columns and z down the rows, even columns half a hex lower */
export function position(column, row, listing, source) {
    const x = (listing.x - source.originX) * columns + column - 1;
    const z = (listing.y - source.originY) * rows + row - 1;
    return [Math.fround(x * columnSpacing), 0, Math.fround(z + (column % 2 === 0 ? 0.5 : 0))];
}

/** One hex's system, in its saved form, always the same for the same world, place and seed */
export function systemFor(world, listing, source, seed, template = null) {
    const id = systemID(listing, world.hex);
    // The first layout's seed is the one systems have always had; later ones mix in their number
    const layout = layoutOf(source, id);
    const hexSeed = fnv32(layout === 0 ? `${seed}/${id}` : `${seed}/${id}/${layout}`);
    rng.reseed(hexSeed);
    const name = world.name || (placeNames(1, rng, [])[0] ?? world.hex);
    const stars = starsFor(world, id);
    assignOrbits(stars);
    const planetarySystem = new PlanetarySystemGenerator().generate(stars, requirementsFor(world));
    nameStars(stars, name, planetarySystem);
    const system = { id, name, position: position(worldColumn(world), worldRow(world), listing, source),
        stars: stars.map(savedStar), planetarySystem,
        chart: { grid: listing.name, column: worldColumn(world), row: worldRow(world) } };
    generateSocial([system], hexSeed, { [id]: societyFor(world) });
    // The worlds of the charts mostly have days and nights of their own: few main worlds are tidally locked
    generateRotations([system], principalLockChance);
    if (template) applyTemplate(template, system);
    return system;
}

/** Draws a system's principal world (planet or moon) to a surface read from its world map */
export function applyTemplate(template, system) {
    for (const world of system.planetarySystem?.worlds ?? []) {
        if (world.isPrincipal) world.surfaceTemplate = template;
        for (const moon of world.moons ?? []) if (moon.isPrincipal) moon.surfaceTemplate = template;
    }
}

/** The surface read from a map of the system's principal world, if it has one */
export function principalTemplate(system) {
    for (const world of system.planetarySystem?.worlds ?? []) {
        if (world.isPrincipal && world.surfaceTemplate) return world.surfaceTemplate;
        const moon = world.moons?.find((m) => m.isPrincipal);
        if (moon?.surfaceTemplate) return moon.surfaceTemplate;
    }
    return null;
}

/** Every listed hex's system, from each sector's snapshot in use; yields now and then so the page stays responsive */
export async function generate(sectors, source, seed, templates = {}, progress = () => {}) {
    const all = sectors.flatMap((sector) => snapshotWorlds(currentSnapshot(sector)).map((world) => [sector.listing, world]));
    const systems = [];
    for (const [index, [listing, world]] of all.entries()) {
        systems.push(systemFor(world, listing, source, seed, templates[systemID(listing, world.hex)] ?? null));
        if (index % 25 === 0) {
            progress(index / Math.max(all.length, 1));
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    }
    return systems;
}

/** The amber and red zones as the universe's travel advisories, by system id */
export function advisories(sectors) {
    const result = {};
    for (const sector of sectors) {
        for (const world of snapshotWorlds(currentSnapshot(sector))) {
            const advisory = societyFor(world).advisory;
            if (advisory) result[systemID(sector.listing, world.hex)] = advisory;
        }
    }
    return result;
}

// MARK: fetching

/** A sector's current data and metadata */
export async function fetchSnapshot(listing) {
    const data = await Client.sectorData(listing);
    const metadata = await Client.metadata(listing);
    return makeSnapshot(data, metadata);
}

export const mapPath = (listing, hex) => `${chartFolder}/maps/${systemID(listing, hex)}.jpg`;

/**
 * Looks for a world map for every listed world with a surface, a few at a time, keeping each found in the universe
 * and noting it in its sector; returns the surfaces read from them (saved form), by system id. A map that can't be
 * fetched is taken not to exist, so a dropped connection costs maps rather than the whole import. Without
 * `readTemplates`, the maps are only kept.
 */
export async function fetchMaps(sectors, folder, { readTemplates = true, progress = () => {} } = {}) {
    const wanted = [];
    sectors.forEach((sector, index) => {
        for (const world of snapshotWorlds(currentSnapshot(sector))) {
            if (parseUWP(world.uwp).size > 0) wanted.push({ index, listing: sector.listing, hex: world.hex, water: requirementsFor(world).waterPercent });
        }
    });
    const templates = {};
    const found = new Map();
    let next = 0, done = 0;
    const work = async () => {
        while (next < wanted.length) {
            const job = wanted[next++];
            let data = null;
            try {
                data = await Client.worldMap(job.listing.abbreviation, job.hex);
            } catch {
                data = null;
            }
            if (data) {
                try {
                    await folder.writeBytes(mapPath(job.listing, job.hex), data);
                } catch (error) {
                    console.warn(`Couldn't keep a world map: ${error}`);
                }
                if (!found.has(job.index)) found.set(job.index, {});
                found.get(job.index)[job.hex] = imageHash(data);
                if (readTemplates) {
                    const template = await templateFromImage(data, job.water);
                    if (template) templates[systemID(job.listing, job.hex)] = await savedTemplate(template);
                }
            }
            done += 1;
            progress(done / Math.max(wanted.length, 1));
        }
    };
    // Polite: never more than a few requests at once, as more make a busy TravellerMap drop connections
    await Promise.all([work(), work(), work()]);
    sectors.forEach((sector, index) => { sector.maps = found.get(index) ?? {}; });
    return templates;
}

// MARK: the star field

async function readStarField(folder) {
    const text = await folder.readText(starFieldPath);
    if (text === null) throw new Error(t("The universe's TravellerMap data couldn't be read"));
    return normalizeStarField(parseJSON(text));
}

/** The star field file: not sectored (no generated systems round the chart), and without nebulae */
export async function saveStarField(folder, systems, seed) {
    const extent = systems.reduce((m, s) => Math.max(m, Math.abs(s.position[0]), Math.abs(s.position[2])), 1);
    // Never the app's own sector size, which would make it a sectored universe
    const document = starFieldDocument(systems, seed, Math.fround(Math.max(extent + 1, halfLength + 1)), undefined, 'parsec', [],
        nebulaVersion);
    await folder.writeText(starFieldPath, encodeJSON(document, false));
}

async function readAdvisories(store) {
    return store.travelAdvisories();
}

/**
 * Fetches the sectors (one at a time) and fills a new universe's folder: its star field and its source document.
 * `progress(text, fraction)` hears what's happening. With `dataOnly`, as in the players' edition, nothing is
 * generated: the universe holds TravellerMap's data and world maps alone.
 */
export async function populate(store, { listings, milieu, seed, dataOnly = false, progress = () => {} }) {
    const folder = store.folder;
    const sectors = [];
    for (const [index, listing] of listings.entries()) {
        progress(t('Fetching %@…', listing.name), index / listings.length * 0.4);
        const snapshot = await fetchSnapshot(listing);
        sectors.push({ listing, snapshots: [snapshot], inUse: snapshot.id });
    }
    progress(t('Looking for world maps…'), 0.4);
    const templates = await fetchMaps(sectors, folder, { readTemplates: !dataOnly,
        progress: (done) => progress(t('Reading world maps…'), 0.4 + done * (dataOnly ? 0.55 : 0.35)) });
    const source = { format: 'estrelas.traveller.source', version: 1, milieu,
        originX: Math.min(...listings.map((l) => l.x)), originY: Math.min(...listings.map((l) => l.y)), sectors,
        rotationVersion: currentRotationVersion };
    let systems = [];
    if (dataOnly) {
        if (!sectors.some((s) => snapshotWorlds(currentSnapshot(s)).length)) throw new Error(t('The chosen sectors have no worlds listed'));
        source.dataOnly = true;
    } else {
        progress(t('Generating star systems…'), 0.75);
        systems = await generate(sectors, source, seed, templates, (done) => progress(t('Generating star systems…'), 0.75 + done * 0.2));
        if (!systems.length) throw new Error(t('The chosen sectors have no worlds listed'));
    }
    progress(t('Saving…'), 0.97);
    // An empty star field for data alone, so the app has nothing to generate when the universe opens
    await saveStarField(folder, systems, seed);
    await saveSource(folder, source);
    await store.saveTravelAdvisories(advisories(sectors));
}

// MARK: redoing part of a universe

/** What differs about each hex between two versions of a sector's data */
export function changesBetween(oldWorlds, newWorlds) {
    const before = new Map(), after = new Map();
    for (const w of oldWorlds) if (!before.has(w.hex)) before.set(w.hex, w);
    for (const w of newWorlds) if (!after.has(w.hex)) after.set(w.hex, w);
    const changes = [];
    for (const hex of [...new Set([...before.keys(), ...after.keys()])].sort()) {
        const a = before.get(hex), b = after.get(hex);
        if (!a && b) changes.push({ hex, name: b.name, kind: 'added', fields: [] });
        else if (a && !b) changes.push({ hex, name: a.name, kind: 'removed', fields: [] });
        else if (a && b && !sameWorld(a, b)) {
            const pairs = [['Name', 'name'], ['UWP', 'uwp'], ['Bases', 'bases'], ['Remarks', 'remarks'], ['Zone', 'zone'],
                ['PBG', 'pbg'], ['Allegiance', 'allegiance'], ['Stars', 'stars'], ['Importance', 'importance'],
                ['Economics', 'economics'], ['Culture', 'culture'], ['Nobility', 'nobility'], ['Worlds', 'worlds']];
            const fields = pairs.filter(([, key]) => a[key] !== b[key]).map(([field, key]) => ({ field, old: a[key], new: b[key] }));
            if (fields.length) changes.push({ hex, name: b.name, kind: 'changed', fields });
        }
    }
    return changes;
}

/** Whether a change touches what the system is generated from, rather than only what's shown about it */
export const regenerates = (change) => change.kind !== 'changed' ||
    change.fields.some((f) => ['UWP', 'Bases', 'Remarks', 'Zone', 'PBG', 'Stars', 'Name'].includes(f.field));

/** Puts another version of a sector's data in use, redoing the hexes whose systems depend on what changed */
export async function switchVersion(store, id, snapshotID) {
    const folder = store.folder;
    const source = await loadSource(folder);
    const field = await readStarField(folder);
    const sector = source?.sectors.find((s) => sectorID(s) === id);
    const old = sector && currentSnapshot(sector);
    const fresh = sector?.snapshots.find((s) => s.id === snapshotID);
    if (!old || !fresh) throw new Error(t("The universe's TravellerMap data couldn't be read"));
    sector.inUse = snapshotID;
    const changes = changesBetween(snapshotWorlds(old), snapshotWorlds(fresh)).filter(regenerates);
    const seed = field.seed ?? 0;
    const worlds = new Map(snapshotWorlds(fresh).map((w) => [w.hex, w]));
    // Hexes newly listed may have world maps of their own
    const templates = {};
    for (const change of changes) {
        const world = worlds.get(change.hex);
        if (change.kind !== 'added' || !world || !(parseUWP(world.uwp).size > 0)) continue;
        let data = null;
        try {
            data = await Client.worldMap(sector.listing.abbreviation, change.hex);
        } catch {
            data = null;
        }
        if (!data) continue;
        await folder.writeBytes(mapPath(sector.listing, change.hex), data);
        sector.maps = { ...(sector.maps ?? {}), [change.hex]: imageHash(data) };
        // A universe of TravellerMap's data alone only keeps the map
        if (isDataOnly(source)) continue;
        const template = await templateFromImage(data, requirementsFor(world).waterPercent);
        if (template) templates[systemID(sector.listing, change.hex)] = await savedTemplate(template);
    }
    if (!isDataOnly(source)) {
        const systems = field.systems;
        for (const change of changes) {
            const sid = systemID(sector.listing, change.hex);
            const existing = systems.findIndex((s) => s.id === sid);
            const world = worlds.get(change.hex);
            if (change.kind === 'removed' || !world) {
                if (existing >= 0) systems.splice(existing, 1);
                continue;
            }
            // A changed world keeps the surface read from its map
            const template = templates[sid] ?? (existing >= 0 ? principalTemplate(systems[existing]) : null);
            const system = systemFor(world, sector.listing, source, seed, template);
            if (existing >= 0) systems[existing] = system;
            else systems.push(system);
        }
    }
    await saveStarField(folder, field.systems, seed);
    await saveSource(folder, source);
    // The zones of the hexes redone follow the data now in use
    const current = await readAdvisories(store);
    const zones = advisories([sector]);
    for (const change of changes) {
        const sid = systemID(sector.listing, change.hex);
        if (zones[sid]) current[sid] = zones[sid];
        else delete current[sid];
    }
    await store.saveTravelAdvisories(current);
}

/** Adds sectors to a universe: fetched, their maps read and their systems generated, laid out from the same origin */
export async function addSectors(store, listings) {
    const folder = store.folder;
    const source = await loadSource(folder);
    const field = await readStarField(folder);
    if (!source) throw new Error(t("The universe's TravellerMap data couldn't be read"));
    const added = [];
    for (const listing of listings) {
        if (source.sectors.some((s) => sectorID(s) === Client.listingID(listing))) continue;
        const snapshot = await fetchSnapshot(listing);
        added.push({ listing, snapshots: [snapshot], inUse: snapshot.id });
    }
    const templates = await fetchMaps(added, folder, { readTemplates: !isDataOnly(source) });
    source.sectors.push(...added);
    const seed = field.seed ?? 0;
    const systems = isDataOnly(source) ? [] : await generate(added, source, seed, templates);
    field.systems.push(...systems);
    await saveStarField(folder, field.systems, seed);
    await saveSource(folder, source);
    await store.saveTravelAdvisories({ ...(await readAdvisories(store)), ...advisories(added) });
}

/**
 * Lays a system out again from another of its layouts: what TravellerMap lists stays as it is, with the surface read
 * from the world's map, and everything generated round it is drawn again. Every other system is left as it was.
 */
export async function relayout(store, id, layout) {
    const folder = store.folder;
    const source = await loadSource(folder);
    const field = await readStarField(folder);
    const sector = source?.sectors.find((s) => id.startsWith(systemID(s.listing, '')));
    const world = sector && snapshotWorlds(currentSnapshot(sector)).find((w) => systemID(sector.listing, w.hex) === id);
    const index = field.systems.findIndex((s) => s.id === id);
    if (!world || index < 0 || field.seed == null) throw new Error(t("The universe's TravellerMap data couldn't be read"));
    const layouts = { ...(source.layouts ?? {}) };
    if (layout > 0) layouts[id] = layout;
    else delete layouts[id];
    if (Object.keys(layouts).length) source.layouts = layouts;
    else delete source.layouts;
    field.systems[index] = systemFor(world, sector.listing, source, field.seed, principalTemplate(field.systems[index]));
    await saveStarField(folder, field.systems, field.seed);
    await saveSource(folder, source);
}

/**
 * Universes imported while main worlds locked as freely as any other world have them drawn again, so few are; and
 * systems whose added worlds went round no star are generated again. False if there was nothing to do.
 */
export async function mend(store) {
    const folder = store.folder;
    const source = await loadSource(folder);
    if (!source || isDataOnly(source)) return false;
    let field;
    try {
        field = await readStarField(folder);
    } catch {
        return false;
    }
    let changed = false;
    if ((source.rotationVersion ?? 1) < currentRotationVersion) {
        for (const system of field.systems) {
            for (const world of system.planetarySystem?.worlds ?? []) {
                if (world.isPrincipal) world.rotation = undefined;
                for (const moon of world.moons ?? []) if (moon.isPrincipal) moon.rotation = undefined;
            }
        }
        generateRotations(field.systems, principalLockChance);
        source.rotationVersion = currentRotationVersion;
        changed = true;
    }
    if (field.seed != null) {
        field.systems.forEach((system, index) => {
            if (!system.planetarySystem?.worlds?.some((w) => !(w.orbitedStarIDs?.length))) return;
            const sector = source.sectors.find((s) => system.id?.startsWith(systemID(s.listing, '')));
            const world = sector && snapshotWorlds(currentSnapshot(sector)).find((w) => systemID(sector.listing, w.hex) === system.id);
            if (!world) return;
            field.systems[index] = systemFor(world, sector.listing, source, field.seed, principalTemplate(system));
            changed = true;
        });
    }
    if (!changed) return false;
    await saveStarField(folder, field.systems, field.seed);
    await saveSource(folder, source);
    return true;
}
