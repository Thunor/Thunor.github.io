//
//  library.js
//  Estrelas (web)
//
//  The universes the app knows about. Each is a folder in the browser's private storage, at
//  Estrelas/Universes/<id>/, laid out exactly as on the Mac. One universe is open at a time; universes can be created,
//  renamed and deleted, opened from a folder (or zip) anywhere, which copies it in, and saved as a copy to a folder
//  (or as a zip), e.g. to open in the macOS app. A port of UniverseLibrary.swift.
//

import { HandleFolder, MemoryFolder, copyFolder, privateStorageRoot, canPickFolders } from './folders.js';
import { readManifest, writeManifest, readStarFieldSeed } from './dataStore.js';
import { isoDate } from './savedData.js';
import { randomUUID, randomSeed } from '../gen/random.js';
import { zipFolder, unzip } from './zip.js';
import { t } from '../ui/i18n.js';
import * as Settings from '../ui/settings.js';
import { canEdit, isGMEdition, storagePrefix, libraryFolder } from '../edition.js';
import { UniverseStore } from './dataStore.js';
import { makePlayerArchive, readPlayerArchive, installPlayerArchive, fileExtension } from './playerArchive.js';

const currentKey = `${storagePrefix}.currentUniverseID`;
const kindKey = `${storagePrefix}.mapKind`;

/** The built-in kind of universe: a 3D star field generated from a seed, going on in sectors without end */
export const starFieldKind = 'starField';
/** Every kind of universe this app can chart (see UniverseProviders.swift), the 3D star field first */
export const universeKinds = [starFieldKind, 'travellerHexMap'];
/** Kinds whose universes players may make themselves, as well as open those their GM sends */
const playersCanCreateKinds = new Set(['travellerHexMap']);

/** The universe last open of each kind but the 3D star field's, which keeps the original key */
const currentKeyFor = (kind) => (kind === starFieldKind ? currentKey : `${currentKey}.${kind}`);

function stored(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function store(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Remembering the choice is a convenience only
    }
}

/** The players' edition's own universe, the same for every player: always there, never changed, never deleted */
export const defaultPlayerUniverseID = 'estrelas-default';
const defaultPlayerUniverseSeed = 5238;

export class UniverseLibrary extends EventTarget {
    constructor() {
        super();
        /** Oldest first: { id, name, createdAt, seed, kind, source, folder } */
        this.universes = [];
        this.currentID = '';
        /** The kind of universe being worked with, chosen at startup; null while the chooser is showing */
        this.chosenKind = null;
        /** The kind chosen last time, offered first in the chooser */
        this.lastKind = universeKinds.includes(stored(kindKey)) ? stored(kindKey) : starFieldKind;
        /** Set when a new universe of the chosen kind should be asked for, there being none of it yet */
        this.isAskingForNewUniverse = false;
        /** True when the library is kept in memory only, because the browser has no private storage */
        this.isTemporary = false;
        /** Counts the open universe's files being replaced (a newer export from the GM), so its scene is rebuilt */
        this.revision = 0;
    }

    get current() {
        return this.universes.find((u) => u.id === this.currentID && u.kind === this.chosenKind) ?? null;
    }

    /** The universes of the kind being worked with */
    get visibleUniverses() {
        return this.universes.filter((u) => u.kind === this.chosenKind);
    }

    universesOf(kind) {
        return this.universes.filter((u) => u.kind === kind);
    }

    /** Whether a new universe of the kind being worked with can be made in this edition */
    get canCreateUniverse() {
        return isGMEdition || playersCanCreateKinds.has(this.chosenKind);
    }

    /**
     * Works with universes of `kind` from now on, opening the one last open of that kind. With none of that kind yet,
     * a first 3D star field is made at once (it needs nothing but a seed); any other kind asks for one.
     */
    async choose(kind) {
        this.chosenKind = kind;
        this.lastKind = kind;
        store(kindKey, kind);
        const ofKind = this.universesOf(kind);
        const remembered = stored(currentKeyFor(kind));
        const found = ofKind.find((u) => u.id === remembered) ?? ofKind[0];
        if (found) {
            this.select(found.id);
        } else if (kind === starFieldKind && isGMEdition) {
            await this.newUniverse(this.suggestedName(), randomSeed());
        } else {
            this.currentID = '';
            this.isAskingForNewUniverse = isGMEdition || playersCanCreateKinds.has(kind);
            this.changed();
        }
    }

    /** Back to the chooser (File ▸ Switch Map Type…) */
    chooseAgain() {
        this.chosenKind = null;
        this.changed();
    }

    changed() {
        this.dispatchEvent(new Event('change'));
    }

    /** Reads the open universe again, as after a provider has rewritten part of it */
    filesChanged() {
        this.revision += 1;
        this.changed();
    }

    async load() {
        const root = await privateStorageRoot();
        if (root) {
            try {
                this.directory = await root.subfolder(libraryFolder, true);
            } catch {
                this.directory = null;
            }
        }
        if (!this.directory) {
            this.directory = new MemoryFolder('Universes');
            this.isTemporary = true;
        }
        await this.reload();
        if (!isGMEdition) {
            // Players start in the shared default universe, alongside any the GM has sent them
            if (!this.universes.some((u) => u.id === defaultPlayerUniverseID)) {
                try {
                    const folder = await this.directory.subfolder(defaultPlayerUniverseID, true);
                    // Foundation's Date.distantPast, so it always sorts first
                    const manifest = { id: defaultPlayerUniverseID, name: t('Estrelas'), createdAt: '0001-01-01T00:00:00Z',
                        seed: defaultPlayerUniverseSeed };
                    await writeManifest(folder, manifest);
                    this.universes.unshift({ ...manifest, kind: starFieldKind, folder });
                } catch (error) {
                    this.showError(t("Couldn't create a new universe"), error);
                }
            }
        }
        // The chooser asks which kind of universe to work with; nothing is opened until then
        this.changed();
    }

    select(id) {
        const universe = this.universes.find((u) => u.id === id);
        if (!universe) return;
        // A universe of another kind, picked from Manage Universes, switches to its kind
        if (this.chosenKind !== universe.kind) {
            this.chosenKind = universe.kind;
            this.lastKind = universe.kind;
            store(kindKey, universe.kind);
        }
        this.isAskingForNewUniverse = false;
        this.currentID = id;
        store(currentKeyFor(universe.kind), id);
        this.changed();
    }

    /** "Universe 1", "Universe 2"… skipping names already taken */
    suggestedName() {
        const names = new Set(this.universes.map((u) => u.name));
        let number = this.visibleUniverses.length + 1;
        while (names.has(t('Universe %lld', number))) number += 1;
        return t('Universe %lld', number);
    }

    /**
     * Creates a universe of `kind` (the 3D star field unless said otherwise), lets `populate(folder, progress)` fill its
     * folder (fetching and generating whatever it needs), and opens it. Nothing is left behind if `populate` fails,
     * which then throws.
     */
    async newUniverse(name, seed, { kind = starFieldKind, source = null, populate = null } = {}) {
        const trimmed = name.trim();
        const id = randomUUID();
        let folder;
        try {
            folder = await this.directory.subfolder(id, true);
            const manifest = { id, name: trimmed || this.suggestedName(), createdAt: isoDate(), seed };
            if (kind !== starFieldKind) manifest.kind = kind;
            if (source) manifest.source = source;
            await writeManifest(folder, manifest);
            if (populate) await populate(folder);
            this.universes.push({ ...manifest, kind, folder });
            this.select(id);
        } catch (error) {
            try {
                await this.directory.remove(id);
            } catch {
                // Nothing was made
            }
            if (populate) throw error;
            this.showError(t("Couldn't create a new universe"), error);
        }
    }

    async rename(id, name) {
        name = name.trim();
        const universe = this.universes.find((u) => u.id === id);
        if (!name || !universe || universe.name === name) return;
        try {
            // Edit the file on disk rather than rewriting it from memory, so nothing else in it is lost
            const manifest = (await readManifest(universe.folder)) ?? { id, createdAt: universe.createdAt };
            manifest.name = name;
            await writeManifest(universe.folder, manifest);
            universe.name = name;
            universe.seed = manifest.seed;
            this.changed();
        } catch (error) {
            this.showError(t("Couldn't rename the universe"), error);
        }
    }

    /** Deletes a universe from this browser. Deleting the open universe opens another, or a new one if it was the last. */
    async delete(id) {
        const universe = this.universes.find((u) => u.id === id);
        if (!universe || !this.canDelete(id)) return;
        try {
            await this.directory.remove(id);
        } catch (error) {
            this.showError(t("Couldn't delete the universe"), error);
            return;
        }
        this.universes = this.universes.filter((u) => u.id !== id);
        if (this.currentID === id) {
            const next = this.universesOf(universe.kind)[0];
            if (next) this.select(next.id);
            else await this.choose(universe.kind);
        } else {
            this.changed();
        }
    }

    /** Players can remove universes the GM sent them, but not their own default one */
    canDelete(id) {
        return isGMEdition || id !== defaultPlayerUniverseID;
    }

    // MARK: universes for players

    /** Writes the universe for players as one file, without the notes the GM hasn't shared */
    async exportForPlayers(id) {
        if (!canEdit) return undefined;
        const universe = this.universes.find((u) => u.id === id);
        if (!universe) return undefined;
        try {
            const bytes = await makePlayerArchive(new UniverseStore(universe.folder), universe.id, universe.name);
            const fileName = `${safeFolderName(universe.name)}.${fileExtension}`;
            if (typeof window.showSaveFilePicker === 'function') {
                let handle;
                try {
                    const options = { suggestedName: fileName, id: 'estrelas-players',
                        types: [{ description: t('Universe for players'), accept: { 'application/octet-stream': [`.${fileExtension}`] } }] };
                    const start = await Settings.universesFolder();
                    if (start) options.startIn = start;
                    handle = await window.showSaveFilePicker(options);
                } catch (error) {
                    if (error.name === 'AbortError') return undefined;
                    throw error;
                }
                const writable = await handle.createWritable();
                await writable.write(bytes);
                await writable.close();
                return t('Exported “%@” for players.', universe.name);
            }
            download(new Blob([bytes], { type: 'application/octet-stream' }), fileName);
            return t('Downloaded “%@”.', fileName);
        } catch (error) {
            this.showError(t("Couldn't export the universe"), error);
        }
        return undefined;
    }

    /** Asks for a universe the GM exported for players, and opens it */
    async openPlayerUniverse() {
        const file = await new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = `.${fileExtension}`;
            input.onchange = () => resolve(input.files?.[0] ?? null);
            input.addEventListener('cancel', () => resolve(null));
            input.click();
        });
        if (file) await this.openPlayerUniverseFile(file);
    }

    /** A newer export of a universe already here replaces it, keeping its surfaces */
    async openPlayerUniverseFile(file) {
        try {
            const archive = readPlayerArchive(new Uint8Array(await file.arrayBuffer()));
            const folder = await this.directory.subfolder(archive.id, true);
            await installPlayerArchive(archive, folder);
            await this.reload();
            this.revision += 1;
            this.select(archive.id);
        } catch (error) {
            this.showError(t("Couldn't open the universe"), error);
        }
    }

    // MARK: opening and saving copies

    /** Asks for a universe folder (or, without folder access, a zip), copies it into the library and opens it */
    async openUniverse(progress) {
        let source;
        if (canPickFolders) {
            try {
                const options = { id: 'estrelas-universes', mode: 'read' };
                const start = await Settings.universesFolder();
                if (start) options.startIn = start;
                source = new HandleFolder(await window.showDirectoryPicker(options));
            } catch (error) {
                if (error.name === 'AbortError') return;
                throw error;
            }
        } else {
            source = await pickWithInput();
            if (!source) return;
        }
        await this.importUniverse(source, progress);
    }

    /** Copies a universe folder (any readable folder with a starfield.json) into the library and opens it */
    async importUniverse(source, progress) {
        const starFieldSeed = await readStarFieldSeed(source);
        if (starFieldSeed === undefined) {
            this.showError(t("Couldn't open the universe"), null,
                t('“%@” doesn\'t contain a readable starfield.json.', source.name));
            return;
        }
        let manifest = null;
        try {
            manifest = await readManifest(source);
        } catch {
            manifest = null;
        }
        // Keep the universe's own id unless the library already has it (e.g. opening the same folder twice)
        let id = manifest?.id ?? randomUUID();
        if (this.universes.some((u) => u.id === id)) id = randomUUID();
        const document = {
            id, name: manifest?.name ?? source.name, createdAt: manifest?.createdAt ?? isoDate(),
            seed: manifest?.seed ?? starFieldSeed ?? undefined,
        };
        if (manifest?.kind) document.kind = manifest.kind;
        if (manifest?.source) document.source = manifest.source;
        let destination;
        try {
            destination = await this.directory.subfolder(id, true);
            await copyFolder(source, destination, progress);
            await writeManifest(destination, { ...(manifest ?? {}), ...document });
        } catch (error) {
            try {
                await this.directory.remove(id);
            } catch {
                // Nothing was made
            }
            this.showError(t("Couldn't open the universe"), error);
            return;
        }
        this.universes.push({ ...document, kind: document.kind ?? starFieldKind, folder: destination });
        this.universes.sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0));
        this.select(id);
    }

    /**
     * Writes a copy of a universe's folder: into a folder the user picks (named after the universe), or, where the
     * browser can't write folders, as a zip download
     */
    async saveCopy(id, progress) {
        if (!canEdit) return undefined;
        const universe = this.universes.find((u) => u.id === id);
        if (!universe) return;
        const folderName = safeFolderName(universe.name);
        try {
            if (canPickFolders) {
                const options = { id: 'estrelas-universes', mode: 'readwrite' };
                const start = await Settings.universesFolder();
                if (start) options.startIn = start;
                let parent;
                try {
                    parent = await window.showDirectoryPicker(options);
                } catch (error) {
                    if (error.name === 'AbortError') return;
                    throw error;
                }
                let exists = true;
                try {
                    await parent.getDirectoryHandle(folderName);
                } catch {
                    exists = false;
                }
                if (exists) {
                    if (!window.confirm(t('“%@” already exists in that folder. Replace it?', folderName))) return;
                    await parent.removeEntry(folderName, { recursive: true });
                }
                const destination = new HandleFolder(await parent.getDirectoryHandle(folderName, { create: true }));
                await copyFolder(universe.folder, destination, progress);
                return t('Saved “%@” to %@.', universe.name, `${parent.name}/${folderName}`);
            }
            const blob = await zipFolder(universe.folder, folderName, progress);
            download(blob, `${folderName}.zip`);
            return t('Downloaded “%@”. Unzip it to get a folder the macOS app can open.', `${folderName}.zip`);
        } catch (error) {
            this.showError(t("Couldn't save the universe"), error);
        }
        return undefined;
    }

    /** Reads every universe folder's manifest; folders without a readable one are skipped */
    async reload() {
        const universes = [];
        for (const entry of await this.directory.entries()) {
            if (entry.kind !== 'directory' || entry.name.startsWith('.')) continue;
            try {
                const folder = await this.directory.subfolder(entry.name);
                const manifest = await readManifest(folder);
                if (!manifest) continue;
                universes.push({ id: manifest.id, name: manifest.name, createdAt: manifest.createdAt, seed: manifest.seed,
                    exportedAt: manifest.exportedAt, kind: universeKinds.includes(manifest.kind) ? manifest.kind : starFieldKind,
                    source: manifest.source, folder });
            } catch {
                // Not a universe
            }
        }
        this.universes = universes.sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0));
    }

    showError(message, error, detail) {
        this.dispatchEvent(new CustomEvent('error', {
            detail: { message, detail: detail ?? (error ? String(error.message ?? error) : '') },
        }));
        if (error) console.error(error);
    }
}

function download(blob, fileName) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 60000);
}

/** A name usable as a folder name everywhere */
function safeFolderName(name) {
    const cleaned = name.replace(/[/\\:*?"<>|]/g, '-').trim();
    return cleaned || 'Universe';
}

/** A folder from <input webkitdirectory>, or a .zip, for browsers without folder pickers */
function pickWithInput() {
    return new Promise((resolve) => {
        const chooser = document.getElementById('open-choice');
        chooser.showModal();
        chooser.onclose = async () => {
            const choice = chooser.returnValue;
            if (choice !== 'folder' && choice !== 'zip') {
                resolve(null);
                return;
            }
            const input = document.createElement('input');
            input.type = 'file';
            if (choice === 'folder') input.webkitdirectory = true;
            else input.accept = '.zip,application/zip';
            input.onchange = async () => {
                if (!input.files?.length) {
                    resolve(null);
                } else if (choice === 'folder') {
                    resolve(MemoryFolder.fromFileList(input.files));
                } else {
                    const file = input.files[0];
                    try {
                        resolve(await unzip(file, file.name.replace(/\.zip$/i, '')));
                    } catch (error) {
                        console.error(error);
                        resolve(new MemoryFolder(file.name));
                    }
                }
            };
            input.addEventListener('cancel', () => resolve(null));
            input.click();
        };
    });
}
