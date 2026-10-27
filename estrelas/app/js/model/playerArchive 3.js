//
//  playerArchive.js
//  Estrelas (web)
//
//  A universe the GM hands to players: one .estrelasuniverse file, an LZFSE-compressed binary property list of
//  the universe's own files (manifest, star field, generated sectors, travel advisories, annotations and a charted
//  universe's charts/ folder) with every
//  note the GM hasn't shared taken out. Surfaces aren't carried: they're drawn from the same seeds wherever the
//  universe is opened. A port of PlayerUniverseArchive.swift; files made by either app open in the other.
//

import {
    Format, version, encodeJSON, parseJSON, check, isoDate, manifestPath, starFieldPath, advisoriesPath,
    annotationsForPlayers, annotationsAreEmpty,
} from './savedData.js';
import { readManifest } from './dataStore.js';
import { listFiles } from './folders.js';
import { lzfseDecode, lzfseEncode } from './lzfse.js';
import { readBinaryPlist, writeBinaryPlist } from './plist.js';

export const fileExtension = 'estrelasuniverse';

/** Builds the archive bytes for the universe in `store`, for players: unshared notes left out */
export async function makePlayerArchive(store, id, name) {
    const folder = store.folder;
    if (!(await folder.exists(starFieldPath))) {
        throw new Error("The universe's star field hasn't been made yet. Open the universe first.");
    }
    const exportedAt = new Date(Math.floor(Date.now() / 1000) * 1000);
    const files = {};
    let manifest;
    try {
        manifest = await readManifest(folder);
    } catch {
        manifest = null;
    }
    manifest = manifest ?? { id, name, createdAt: isoDate() };
    manifest = { ...manifest, format: Format.universe, version, exportedAt: isoDate(exportedAt) };
    const encoder = new TextEncoder();
    files[manifestPath] = encoder.encode(encodeJSON(manifest, true));
    files[starFieldPath] = await folder.readBytes(starFieldPath);
    for (const path of await store.sectorFiles()) files[path] = await folder.readBytes(path);
    // Converts an earlier version's advisories file first, if it has one
    await store.travelAdvisories();
    if (await folder.exists(advisoriesPath)) files[advisoriesPath] = await folder.readBytes(advisoriesPath);
    // A charted universe's own data, kept by its provider under charts/
    if (await folder.exists('charts')) {
        const charts = await folder.subfolder('charts');
        for (const path of await listFiles(charts)) files[`charts/${path}`] = await charts.readBytes(path);
    }
    for (const document of Object.values(await store.allAnnotations())) {
        const shared = annotationsForPlayers(document);
        if (annotationsAreEmpty(shared)) continue;
        files[`annotations/${shared.systemID}.json`] = encoder.encode(encodeJSON(shared, true));
    }
    const archive = { format: Format.playerUniverse, version, id: manifest.id, name: manifest.name, exportedAt, files };
    return lzfseEncode(writeBinaryPlist(archive));
}

/** The archive in a file's bytes, checked; throws if it isn't a universe exported for players */
export function readPlayerArchive(bytes) {
    let archive;
    try {
        archive = readBinaryPlist(lzfseDecode(bytes));
    } catch {
        throw new Error("The file isn't a universe exported for players.");
    }
    if (archive?.format !== Format.playerUniverse || !archive.files?.[starFieldPath] || typeof archive.id !== 'string') {
        throw new Error("The file isn't a universe exported for players.");
    }
    return archive;
}

/**
 * Writes the archive's files into `folder`. Annotations are replaced wholesale; surfaces already drawn are kept, as
 * they don't change.
 */
export async function installPlayerArchive(archive, folder) {
    if (await folder.exists('annotations')) await folder.remove('annotations');
    for (const [path, data] of Object.entries(archive.files)) {
        if (path.startsWith('/') || path.split('/').includes('..')) continue;
        await folder.writeBytes(path, data instanceof Uint8Array ? data : new Uint8Array(data));
    }
}

/** Reads a players' copy's manifest fields we need when listing it */
export function exportedAtOf(manifest) {
    if (!manifest?.exportedAt) return null;
    const date = new Date(manifest.exportedAt);
    return Number.isNaN(date.getTime()) ? null : date;
}

export { check, parseJSON };
