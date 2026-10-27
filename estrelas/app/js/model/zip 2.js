//
//  zip.js
//  Estrelas (web)
//
//  Minimal zip archives, so browsers that can't pick folders can still save a universe (as a .zip of its folder)
//  and open one (from a .zip made here or by Finder's Compress). Entries are deflated when the browser supports it.
//

import { MemoryFolder, listFiles } from './folders.js';

const encoder = new TextEncoder();

const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c >>> 0;
    }
    return table;
})();

function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
}

async function transform(bytes, stream) {
    return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
}

/** A zip of every file in `folder`, each under `root/` */
export async function zipFolder(folder, root, progress) {
    const files = await listFiles(folder);
    const chunks = [];
    const central = [];
    let offset = 0;
    const now = new Date();
    const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
    const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    let done = 0;
    for (const path of files) {
        const data = await folder.readBytes(path);
        const name = encoder.encode(`${root}/${path}`);
        const crc = crc32(data);
        let method = 0;
        let stored = data;
        try {
            const deflated = await transform(data, new CompressionStream('deflate-raw'));
            if (deflated.length < data.length) {
                stored = deflated;
                method = 8;
            }
        } catch {
            // Stored uncompressed
        }
        const header = new Uint8Array(30 + name.length);
        const h = new DataView(header.buffer);
        h.setUint32(0, 0x04034B50, true);
        h.setUint16(4, 20, true);
        h.setUint16(6, 0x0800, true);
        h.setUint16(8, method, true);
        h.setUint16(10, time, true);
        h.setUint16(12, date, true);
        h.setUint32(14, crc, true);
        h.setUint32(18, stored.length, true);
        h.setUint32(22, data.length, true);
        h.setUint16(26, name.length, true);
        header.set(name, 30);

        const entry = new Uint8Array(46 + name.length);
        const e = new DataView(entry.buffer);
        e.setUint32(0, 0x02014B50, true);
        e.setUint16(4, 20, true);
        e.setUint16(6, 20, true);
        e.setUint16(8, 0x0800, true);
        e.setUint16(10, method, true);
        e.setUint16(12, time, true);
        e.setUint16(14, date, true);
        e.setUint32(16, crc, true);
        e.setUint32(20, stored.length, true);
        e.setUint32(24, data.length, true);
        e.setUint16(28, name.length, true);
        e.setUint32(42, offset, true);
        entry.set(name, 46);
        central.push(entry);

        chunks.push(header, stored);
        offset += header.length + stored.length;
        done += 1;
        progress?.(done, files.length);
    }
    const centralSize = central.reduce((s, c) => s + c.length, 0);
    const end = new Uint8Array(22);
    const d = new DataView(end.buffer);
    d.setUint32(0, 0x06054B50, true);
    d.setUint16(8, files.length, true);
    d.setUint16(10, files.length, true);
    d.setUint32(12, centralSize, true);
    d.setUint32(16, offset, true);
    return new Blob([...chunks, ...central, end], { type: 'application/zip' });
}

/**
 * The files in a zip, as a MemoryFolder. If every entry sits in one top-level folder (as when a folder is zipped),
 * that folder becomes the root and gives the name. Hidden files and macOS resource forks are skipped.
 */
export async function unzip(blob, fallbackName = 'Universe') {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const view = new DataView(bytes.buffer);
    let end = -1;
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
        if (view.getUint32(i, true) === 0x06054B50) { end = i; break; }
    }
    if (end < 0) throw new Error('Not a zip archive');
    const count = view.getUint16(end + 10, true);
    let p = view.getUint32(end + 16, true);
    const entries = [];
    const decoder = new TextDecoder();
    for (let i = 0; i < count; i++) {
        if (view.getUint32(p, true) !== 0x02014B50) throw new Error('Damaged zip archive');
        const method = view.getUint16(p + 10, true);
        const compressedSize = view.getUint32(p + 20, true);
        const nameLength = view.getUint16(p + 28, true);
        const extraLength = view.getUint16(p + 30, true);
        const commentLength = view.getUint16(p + 32, true);
        const local = view.getUint32(p + 42, true);
        const name = decoder.decode(bytes.subarray(p + 46, p + 46 + nameLength));
        p += 46 + nameLength + extraLength + commentLength;
        if (name.endsWith('/') || name.startsWith('__MACOSX/') || name.split('/').some((s) => s.startsWith('.'))) continue;
        const dataStart = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
        entries.push({ name, method, data: bytes.subarray(dataStart, dataStart + compressedSize) });
    }
    const tops = new Set(entries.map((e) => e.name.split('/')[0]));
    const single = tops.size === 1 && entries.every((e) => e.name.includes('/')) ? [...tops][0] : null;
    const files = new Map();
    for (const entry of entries) {
        let data = entry.data;
        if (entry.method === 8) data = await transform(data, new DecompressionStream('deflate-raw'));
        else if (entry.method !== 0) throw new Error('Unsupported zip compression');
        files.set(single ? entry.name.slice(single.length + 1) : entry.name, data);
    }
    return new MemoryFolder(single ?? fallbackName, files);
}
