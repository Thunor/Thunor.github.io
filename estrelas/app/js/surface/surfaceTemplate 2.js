//
//  surfaceTemplate.js
//  Estrelas (web)
//
//  A world's surface known beforehand, typically read from a map someone drew of it, laid over the sphere as an
//  equirectangular grid: how high the ground is (the shore at the middle value), where ice lies, how dry and how green
//  the land is. A world drawn from a template keeps the template's seas, continents, mountains, ice and deserts, with
//  the world's own noise adding only fine detail. A port of SurfaceTemplate.swift.
//
//  Saved (in the star field, on a world or moon) as { width, height, compression: "zlib", elevation, ice, aridity,
//  greenery? }, each field compressed with Apple's zlib (raw DEFLATE) and base64. Decoded templates carry their
//  fields as Uint8Arrays, kept beside the saved form so the star field is written back exactly as it was read.
//

/** The shore's height in the template, 0 to 1 */
export const shore = 128 / 255;

function base64Bytes(text) {
    const binary = atob(text);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

async function inflateRaw(bytes) {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** The decoded fields of a saved template, or null if it can't be read */
export async function decodeTemplate(saved) {
    if (!saved || !(saved.width > 0) || !(saved.height > 0)) return null;
    try {
        const zlib = saved.compression === 'zlib';
        const field = async (text) => {
            const bytes = base64Bytes(text);
            return zlib ? inflateRaw(bytes) : bytes;
        };
        const template = {
            width: saved.width, height: saved.height,
            elevation: await field(saved.elevation), ice: await field(saved.ice), aridity: await field(saved.aridity),
            greenery: saved.greenery != null ? await field(saved.greenery) : null,
        };
        const size = template.width * template.height;
        if (![template.elevation, template.ice, template.aridity, template.greenery].every((f) => f === null || f.length === size)) {
            return null;
        }
        template.fingerprint = fingerprint(template);
        template.waterFraction = waterFraction(template);
        return template;
    } catch (error) {
        console.warn(`Couldn't read a surface template: ${error}`);
        return null;
    }
}

/**
 * Decodes every world's and moon's template in a star field's systems, setting a non-enumerable `decoded` on each
 * saved template, so the saved form goes back to disk untouched
 */
export async function decodeTemplates(systems) {
    const jobs = [];
    for (const system of systems ?? []) {
        for (const world of system.planetarySystem?.worlds ?? []) {
            for (const body of [world, ...(world.moons ?? [])]) {
                const saved = body.surfaceTemplate;
                if (saved && !saved.decoded) {
                    jobs.push(decodeTemplate(saved).then((decoded) => {
                        Object.defineProperty(saved, 'decoded', { value: decoded, enumerable: false, writable: true });
                    }));
                }
            }
        }
    }
    await Promise.all(jobs);
}

/** The value of a field at a point on the unit sphere, 0 to 1, blended between the four nearest samples */
export function sample(template, field, px, py, pz) {
    const length = Math.max(Math.sqrt(px * px + py * py + pz * pz), Number.MIN_VALUE);
    const latitude = Math.asin(Math.min(Math.max(py / length, -1), 1));
    let longitude = Math.atan2(-pz, px);
    if (longitude < 0) longitude += 2 * Math.PI;
    const { width, height } = template;
    const x = longitude / (2 * Math.PI) * width - 0.5;
    const y = (0.5 - latitude / Math.PI) * height - 0.5;
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = x - x0, fy = y - y0;
    const at = (column, row) => {
        const c = ((column % width) + width) % width;
        const r = Math.min(Math.max(row, 0), height - 1);
        return field[r * width + c] / 255;
    };
    const top = at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx;
    const bottom = at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx;
    return top * (1 - fy) + bottom * fy;
}

export const templateElevation = (t, x, y, z) => sample(t, t.elevation, x, y, z);
export const templateIce = (t, x, y, z) => sample(t, t.ice, x, y, z);
export const templateAridity = (t, x, y, z) => sample(t, t.aridity, x, y, z);
export const templateGreenery = (t, x, y, z) => (t.greenery ? sample(t, t.greenery, x, y, z) : 0);

/** The share of the surface under water, each row weighted by the area it covers */
function waterFraction(template) {
    let wet = 0, total = 0;
    for (let row = 0; row < template.height; row++) {
        const latitude = (0.5 - (row + 0.5) / template.height) * Math.PI;
        const weight = Math.cos(latitude);
        for (let column = 0; column < template.width; column++) {
            total += weight;
            if (template.elevation[row * template.width + column] / 255 < shore) wet += weight;
        }
    }
    return total > 0 ? wet / total : 0;
}

/** FNV-1a over everything, so surfaces drawn from an earlier template can be told apart */
function fingerprint(template) {
    let hi = 0xCBF29CE4 >>> 0, lo = 0x84222325 >>> 0;
    // 64-bit multiply by 0x100000001B3 in 32-bit halves
    const step = (byte) => {
        lo = (lo ^ byte) >>> 0;
        const loLo = (lo & 0xFFFF) * 0x1B3, loHi = (lo >>> 16) * 0x1B3;
        const low = loLo + (loHi & 0xFFFF) * 65536;
        const carry = Math.floor(low / 0x100000000) + (loHi >>> 16);
        const newHi = (Math.imul(hi, 0x1B3) + carry + lo * 0x100) >>> 0;
        hi = newHi;
        lo = low >>> 0;
    };
    step(template.width & 0xFF);
    step(template.height & 0xFF);
    for (const field of [template.elevation, template.ice, template.aridity, template.greenery ?? new Uint8Array(0)]) {
        for (let i = 0; i < field.length; i++) step(field[i]);
    }
    return (BigInt(hi) << 32n | BigInt(lo)).toString(16);
}
