//
//  folders.js
//  Estrelas (web)
//
//  Folders the app reads universes from and writes them to, behind one small interface:
//    • HandleFolder: a File System Access directory, either in the browser's private storage (where the library
//      lives, like Application Support on the Mac) or a real folder the user picked (Chromium browsers)
//    • MemoryFolder: files held in memory, e.g. a folder chosen with a plain file input, or the contents of a zip
//  Paths are relative and use "/".
//

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function parts(path) {
    return path.split('/').filter((p) => p && p !== '.');
}

/** A folder backed by a FileSystemDirectoryHandle */
export class HandleFolder {
    /** `opfsPath` is the folder's path from the private storage root, when it's in private storage */
    constructor(handle, opfsPath = null) {
        this.handle = handle;
        this.opfsPath = opfsPath;
        this.name = handle.name;
    }

    async directory(segments, create) {
        let handle = this.handle;
        for (const segment of segments) handle = await handle.getDirectoryHandle(segment, { create });
        return handle;
    }

    async subfolder(path, create = false) {
        const segments = parts(path);
        const handle = await this.directory(segments, create);
        return new HandleFolder(handle, this.opfsPath ? this.opfsPath.concat(segments) : null);
    }

    async fileHandle(path, create = false) {
        const segments = parts(path);
        const directory = await this.directory(segments.slice(0, -1), create);
        return directory.getFileHandle(segments[segments.length - 1], { create });
    }

    async readFile(path) {
        try {
            return await (await this.fileHandle(path)).getFile();
        } catch (error) {
            if (error.name === 'NotFoundError' || error.name === 'TypeMismatchError') return null;
            throw error;
        }
    }

    async readText(path) {
        const file = await this.readFile(path);
        return file ? file.text() : null;
    }

    async readBytes(path) {
        const file = await this.readFile(path);
        return file ? new Uint8Array(await file.arrayBuffer()) : null;
    }

    async exists(path) {
        try {
            await this.fileHandle(path);
            return true;
        } catch {
            try {
                await this.directory(parts(path), false);
                return true;
            } catch {
                return false;
            }
        }
    }

    /** Writes a whole file. Writable streams only replace the file once closed, so readers never see half a file. */
    async writeBytes(path, bytes) {
        const handle = await this.fileHandle(path, true);
        if (handle.createWritable) {
            const writable = await handle.createWritable();
            await writable.write(bytes);
            await writable.close();
            return;
        }
        // Safari's private storage only offers synchronous access handles, which live in workers
        if (!this.opfsPath) throw new Error('This browser can’t write to that folder');
        await writeInWorker(this.opfsPath.concat(parts(path)), bytes);
    }

    async writeText(path, text) {
        await this.writeBytes(path, encoder.encode(text));
    }

    /** Names and kinds of the entries directly inside */
    async entries() {
        const result = [];
        for await (const [name, handle] of this.handle.entries()) result.push({ name, kind: handle.kind });
        return result.sort((a, b) => (a.name < b.name ? -1 : 1));
    }

    async remove(name) {
        await this.handle.removeEntry(name, { recursive: true });
    }
}

let worker = null;
let workerCalls = 0;
const pending = new Map();

function writeInWorker(path, bytes) {
    if (!worker) {
        worker = new Worker(new URL('./opfsWriteWorker.js', import.meta.url), { type: 'module' });
        worker.onmessage = ({ data }) => {
            const call = pending.get(data.id);
            pending.delete(data.id);
            if (data.error) call.reject(new Error(data.error));
            else call.resolve();
        };
    }
    const id = ++workerCalls;
    return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        const copy = bytes.slice();
        worker.postMessage({ id, path, bytes: copy }, [copy.buffer]);
    });
}

/** A folder held in memory: a map from paths to Files, Blobs or byte arrays */
export class MemoryFolder {
    constructor(name = 'Folder', files = new Map()) {
        this.name = name;
        this.files = files;
    }

    /** A folder chosen with <input webkitdirectory>; the chosen folder's own name is the first path segment */
    static fromFileList(fileList) {
        const files = new Map();
        let name = 'Folder';
        for (const file of fileList) {
            const segments = parts(file.webkitRelativePath || file.name);
            if (segments.length > 1) {
                name = segments[0];
                files.set(segments.slice(1).join('/'), file);
            } else {
                files.set(segments.join('/'), file);
            }
        }
        return new MemoryFolder(name, files);
    }

    async subfolder(path) {
        const prefix = parts(path).join('/') + '/';
        const files = new Map();
        for (const [key, value] of this.files) if (key.startsWith(prefix)) files.set(key.slice(prefix.length), value);
        return new MemoryFolder(parts(path).pop(), files);
    }

    async readBytes(path) {
        const value = this.files.get(parts(path).join('/'));
        if (value === undefined) return null;
        if (value instanceof Uint8Array) return value;
        return new Uint8Array(await value.arrayBuffer());
    }

    async readText(path) {
        const bytes = await this.readBytes(path);
        return bytes ? decoder.decode(bytes) : null;
    }

    async exists(path) {
        const key = parts(path).join('/');
        if (this.files.has(key)) return true;
        for (const k of this.files.keys()) if (k.startsWith(key + '/')) return true;
        return false;
    }

    async writeBytes(path, bytes) {
        this.files.set(parts(path).join('/'), bytes.slice());
    }

    async writeText(path, text) {
        await this.writeBytes(path, encoder.encode(text));
    }

    async entries() {
        const names = new Map();
        for (const key of this.files.keys()) {
            const [first, ...rest] = key.split('/');
            names.set(first, rest.length ? 'directory' : 'file');
        }
        return [...names].map(([name, kind]) => ({ name, kind })).sort((a, b) => (a.name < b.name ? -1 : 1));
    }

    async remove(name) {
        for (const key of [...this.files.keys()]) if (key === name || key.startsWith(name + '/')) this.files.delete(key);
    }
}

/** Every file path under a folder, recursively, skipping hidden files */
export async function listFiles(folder, prefix = '') {
    const result = [];
    for (const entry of await folder.entries()) {
        if (entry.name.startsWith('.')) continue;
        const path = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.kind === 'directory') {
            result.push(...await listFiles(await folder.subfolder(entry.name), path));
        } else {
            result.push(path);
        }
    }
    return result;
}

/** Copies everything in `source` into `destination`, reporting progress as (done, total) */
export async function copyFolder(source, destination, progress) {
    const files = await listFiles(source);
    let done = 0;
    for (const path of files) {
        await destination.writeBytes(path, await source.readBytes(path));
        done += 1;
        progress?.(done, files.length);
    }
}

/** The browser's private storage, where the library lives; null if the browser has none */
export async function privateStorageRoot() {
    try {
        if (!navigator.storage?.getDirectory) return null;
        const root = await navigator.storage.getDirectory();
        // Ask the browser not to clear it under storage pressure; it may decline
        navigator.storage.persist?.().catch(() => {});
        return new HandleFolder(root, []);
    } catch {
        return null;
    }
}

export const canPickFolders = typeof window !== 'undefined' && 'showDirectoryPicker' in window;
