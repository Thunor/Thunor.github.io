//
//  png.js
//  Estrelas (web)
//
//  A small PNG encoder for RGBA pixels. Canvas encoding premultiplies alpha, which would lose cloud colours where
//  the cloud is thin, so images are encoded directly. Works in pages and workers (CompressionStream).
//

const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c >>> 0;
    }
    return table;
})();

function crc32(bytes, start, end) {
    let c = 0xFFFFFFFF;
    for (let i = start; i < end; i++) c = crcTable[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
}

async function deflate(data) {
    const stream = new Blob([data]).stream().pipeThrough(new CompressionStream('deflate'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
}

function chunk(type, data) {
    const bytes = new Uint8Array(12 + data.length);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, data.length);
    for (let i = 0; i < 4; i++) bytes[4 + i] = type.charCodeAt(i);
    bytes.set(data, 8);
    view.setUint32(8 + data.length, crc32(bytes, 4, 8 + data.length));
    return bytes;
}

/** PNG bytes for RGBA pixels. With `alpha` false the alpha channel is dropped (opaque RGB). */
export async function encodePNG(pixels, width, height, alpha = true) {
    const channels = alpha ? 4 : 3;
    const stride = width * channels;
    const raw = new Uint8Array((stride + 1) * height);
    for (let y = 0; y < height; y++) {
        const row = y * (stride + 1);
        raw[row] = 1; // Sub filter: each byte minus the one a pixel to the left
        for (let x = 0; x < width; x++) {
            for (let c = 0; c < channels; c++) {
                const value = pixels[(y * width + x) * 4 + c];
                const left = x > 0 ? pixels[(y * width + x - 1) * 4 + c] : 0;
                raw[row + 1 + x * channels + c] = (value - left) & 0xFF;
            }
        }
    }
    const header = new Uint8Array(13);
    const view = new DataView(header.buffer);
    view.setUint32(0, width);
    view.setUint32(4, height);
    header[8] = 8;
    header[9] = alpha ? 6 : 2;
    const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header),
        chunk('IDAT', await deflate(raw)), chunk('IEND', new Uint8Array(0))];
    const total = parts.reduce((sum, p) => sum + p.length, 0);
    const png = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
        png.set(part, offset);
        offset += part.length;
    }
    return png;
}

export function base64FromBytes(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(binary);
}

export function bytesFromBase64(text) {
    const binary = atob(text);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

async function inflate(data) {
    const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
}

/**
 * Decodes an 8-bit, non-interlaced PNG (grey, grey+alpha, RGB, RGBA or palette) to straight (not premultiplied)
 * RGBA pixels, so cloud colours survive where alpha is low. Returns null for anything else, so callers can fall back
 * to the browser's decoder.
 */
export async function decodePNG(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let offset = 8;
    let width = 0, height = 0, depth = 0, type = 0, interlace = 0;
    let palette = null, transparency = null;
    const idat = [];
    while (offset < bytes.length) {
        const length = view.getUint32(offset);
        const name = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
        const data = bytes.subarray(offset + 8, offset + 8 + length);
        if (name === 'IHDR') {
            width = view.getUint32(offset + 8);
            height = view.getUint32(offset + 12);
            depth = data[8]; type = data[9]; interlace = data[12];
        } else if (name === 'PLTE') palette = data;
        else if (name === 'tRNS') transparency = data;
        else if (name === 'IDAT') idat.push(data);
        else if (name === 'IEND') break;
        offset += 12 + length;
    }
    if (depth !== 8 || interlace !== 0) return null;
    const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[type];
    if (!channels) return null;
    const compressed = new Uint8Array(idat.reduce((s, d) => s + d.length, 0));
    let o = 0;
    for (const d of idat) { compressed.set(d, o); o += d.length; }
    const raw = await inflate(compressed);
    const stride = width * channels;
    const rows = new Uint8Array(stride * height);
    let previous = new Uint8Array(stride);
    for (let y = 0; y < height; y++) {
        const filter = raw[y * (stride + 1)];
        const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
        const current = rows.subarray(y * stride, (y + 1) * stride);
        for (let i = 0; i < stride; i++) {
            const a = i >= channels ? current[i - channels] : 0;
            const b = previous[i];
            const c = i >= channels ? previous[i - channels] : 0;
            let value = line[i];
            switch (filter) {
                case 1: value += a; break;
                case 2: value += b; break;
                case 3: value += (a + b) >> 1; break;
                case 4: {
                    const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
                    value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
                    break;
                }
                default: break;
            }
            current[i] = value & 0xFF;
        }
        previous = current;
    }
    const pixels = new Uint8Array(width * height * 4);
    for (let i = 0; i < width * height; i++) {
        const s = i * channels, d = i * 4;
        switch (type) {
            case 0: pixels[d] = pixels[d + 1] = pixels[d + 2] = rows[s]; pixels[d + 3] = 255; break;
            case 4: pixels[d] = pixels[d + 1] = pixels[d + 2] = rows[s]; pixels[d + 3] = rows[s + 1]; break;
            case 2: pixels[d] = rows[s]; pixels[d + 1] = rows[s + 1]; pixels[d + 2] = rows[s + 2]; pixels[d + 3] = 255; break;
            case 6: pixels.set(rows.subarray(s, s + 4), d); break;
            case 3: {
                const index = rows[s];
                pixels[d] = palette[index * 3]; pixels[d + 1] = palette[index * 3 + 1]; pixels[d + 2] = palette[index * 3 + 2];
                pixels[d + 3] = transparency && index < transparency.length ? transparency[index] : 255;
                break;
            }
            default: break;
        }
    }
    return { width, height, pixels };
}
