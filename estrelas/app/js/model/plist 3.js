//
//  plist.js
//  Estrelas (web)
//
//  Binary property lists (bplist00), as Foundation's PropertyListEncoder writes them with the binary format. Values
//  map to JavaScript as: dictionary → object, array → Array, string → string, integer → number (or BigInt past
//  2⁵³), real → number, date → Date, data → Uint8Array, boolean → boolean.
//

const referenceDate = Date.UTC(2001, 0, 1);

// MARK: reading

export function readBinaryPlist(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const header = new TextDecoder().decode(bytes.subarray(0, 8));
    if (!header.startsWith('bplist0')) throw new Error('Not a binary property list');
    const trailer = bytes.length - 32;
    const offsetSize = bytes[trailer + 6];
    const refSize = bytes[trailer + 7];
    const objectCount = Number(view.getBigUint64(trailer + 8));
    const topObject = Number(view.getBigUint64(trailer + 16));
    const offsetTable = Number(view.getBigUint64(trailer + 24));
    const readUInt = (at, size) => {
        let value = 0;
        for (let i = 0; i < size; i++) value = value * 256 + bytes[at + i];
        return value;
    };
    const offsets = new Array(objectCount);
    for (let i = 0; i < objectCount; i++) offsets[i] = readUInt(offsetTable + i * offsetSize, offsetSize);

    const parsed = new Map();
    const readObject = (index) => {
        if (parsed.has(index)) return parsed.get(index);
        const at = offsets[index];
        const marker = bytes[at];
        const type = marker >> 4, info = marker & 0xf;
        const lengthAndStart = () => {
            if (info !== 0xf) return [info, at + 1];
            const intMarker = bytes[at + 1];
            const size = 1 << (intMarker & 0xf);
            return [readUInt(at + 2, size), at + 2 + size];
        };
        let value;
        switch (type) {
            case 0x0:
                value = info === 0x8 ? false : info === 0x9 ? true : null;
                break;
            case 0x1: {
                const size = 1 << info;
                if (size === 8) {
                    const big = view.getBigInt64(at + 1);
                    value = big >= BigInt(Number.MIN_SAFE_INTEGER) && big <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(big) : big;
                } else if (size === 16) {
                    value = Number(view.getBigInt64(at + 9));
                } else {
                    value = readUInt(at + 1, size);
                }
                break;
            }
            case 0x2:
                value = info === 2 ? view.getFloat32(at + 1) : view.getFloat64(at + 1);
                break;
            case 0x3:
                value = new Date(referenceDate + view.getFloat64(at + 1) * 1000);
                break;
            case 0x4: {
                const [length, start] = lengthAndStart();
                value = bytes.slice(start, start + length);
                break;
            }
            case 0x5: {
                const [length, start] = lengthAndStart();
                value = String.fromCharCode(...bytes.subarray(start, start + length));
                break;
            }
            case 0x6: {
                const [length, start] = lengthAndStart();
                let text = '';
                for (let i = 0; i < length; i++) text += String.fromCharCode(view.getUint16(start + i * 2));
                value = text;
                break;
            }
            case 0x8:
                value = { uid: readUInt(at + 1, info + 1) };
                break;
            case 0xa: {
                const [length, start] = lengthAndStart();
                value = [];
                parsed.set(index, value);
                for (let i = 0; i < length; i++) value.push(readObject(readUInt(start + i * refSize, refSize)));
                return value;
            }
            case 0xd: {
                const [length, start] = lengthAndStart();
                value = {};
                parsed.set(index, value);
                for (let i = 0; i < length; i++) {
                    const key = readObject(readUInt(start + i * refSize, refSize));
                    value[key] = readObject(readUInt(start + (length + i) * refSize, refSize));
                }
                return value;
            }
            default:
                throw new Error(`Unsupported property list object 0x${marker.toString(16)}`);
        }
        parsed.set(index, value);
        return value;
    };
    return readObject(topObject);
}

// MARK: writing

export function writeBinaryPlist(root) {
    const objects = [];
    const flatten = (value) => {
        const index = objects.length;
        const entry = { value, refs: null };
        objects.push(entry);
        if (Array.isArray(value)) {
            entry.refs = value.map(flatten);
        } else if (value && typeof value === 'object' && !(value instanceof Date) && !(value instanceof Uint8Array)) {
            const keys = Object.keys(value).filter((k) => value[k] !== undefined);
            entry.keys = keys.map(flatten);
            entry.refs = keys.map((k) => flatten(value[k]));
        }
        return index;
    };
    flatten(root);
    const refSize = objects.length < 256 ? 1 : objects.length < 65536 ? 2 : 4;

    const chunks = [new TextEncoder().encode('bplist00')];
    let length = 8;
    const offsets = [];
    const push = (array) => {
        chunks.push(array);
        length += array.length;
    };
    const sizedMarker = (type, count) => {
        if (count < 15) return [Uint8Array.of((type << 4) | count)];
        return [Uint8Array.of((type << 4) | 0xf), intBytes(count)];
    };
    const refBytes = (refs) => {
        const out = new Uint8Array(refs.length * refSize);
        refs.forEach((ref, i) => {
            for (let b = 0; b < refSize; b++) out[i * refSize + b] = (ref >> ((refSize - 1 - b) * 8)) & 0xff;
        });
        return out;
    };
    for (const entry of objects) {
        offsets.push(length);
        const value = entry.value;
        if (value === null || value === undefined) {
            push(Uint8Array.of(0x00));
        } else if (value === false || value === true) {
            push(Uint8Array.of(value ? 0x09 : 0x08));
        } else if (typeof value === 'number' && Number.isInteger(value)) {
            push(intBytes(value));
        } else if (typeof value === 'bigint') {
            const out = new Uint8Array(9);
            out[0] = 0x13;
            new DataView(out.buffer).setBigInt64(1, value);
            push(out);
        } else if (typeof value === 'number') {
            const out = new Uint8Array(9);
            out[0] = 0x23;
            new DataView(out.buffer).setFloat64(1, value);
            push(out);
        } else if (value instanceof Date) {
            const out = new Uint8Array(9);
            out[0] = 0x33;
            new DataView(out.buffer).setFloat64(1, (value.getTime() - referenceDate) / 1000);
            push(out);
        } else if (value instanceof Uint8Array) {
            for (const part of sizedMarker(0x4, value.length)) push(part);
            push(value);
        } else if (typeof value === 'string') {
            if (/^[\x00-\x7f]*$/.test(value)) {
                for (const part of sizedMarker(0x5, value.length)) push(part);
                push(Uint8Array.from(value, (c) => c.charCodeAt(0)));
            } else {
                for (const part of sizedMarker(0x6, value.length)) push(part);
                const out = new Uint8Array(value.length * 2);
                const dv = new DataView(out.buffer);
                for (let i = 0; i < value.length; i++) dv.setUint16(i * 2, value.charCodeAt(i));
                push(out);
            }
        } else if (Array.isArray(value)) {
            for (const part of sizedMarker(0xa, entry.refs.length)) push(part);
            push(refBytes(entry.refs));
        } else {
            for (const part of sizedMarker(0xd, entry.refs.length)) push(part);
            push(refBytes(entry.keys));
            push(refBytes(entry.refs));
        }
    }
    const offsetTable = length;
    const offsetSize = offsetTable < 256 ? 1 : offsetTable < 65536 ? 2 : offsetTable < 2 ** 32 ? 4 : 8;
    const table = new Uint8Array(offsets.length * offsetSize);
    offsets.forEach((offset, i) => {
        for (let b = 0; b < offsetSize; b++) table[i * offsetSize + b] = Math.floor(offset / 2 ** ((offsetSize - 1 - b) * 8)) & 0xff;
    });
    push(table);
    const trailer = new Uint8Array(32);
    const view = new DataView(trailer.buffer);
    trailer[6] = offsetSize;
    trailer[7] = refSize;
    view.setBigUint64(8, BigInt(objects.length));
    view.setBigUint64(16, 0n);
    view.setBigUint64(24, BigInt(offsetTable));
    push(trailer);
    const result = new Uint8Array(length);
    let at = 0;
    for (const chunk of chunks) {
        result.set(chunk, at);
        at += chunk.length;
    }
    return result;
}

/** An integer object: the smallest of 1, 2, 4 or 8 bytes; negatives always take 8 */
function intBytes(value) {
    if (value >= 0 && value < 256) return Uint8Array.of(0x10, value);
    if (value >= 0 && value < 65536) return Uint8Array.of(0x11, value >> 8, value & 0xff);
    if (value >= 0 && value < 2 ** 32) {
        const out = new Uint8Array(5);
        out[0] = 0x12;
        new DataView(out.buffer).setUint32(1, value);
        return out;
    }
    const out = new Uint8Array(9);
    out[0] = 0x13;
    new DataView(out.buffer).setBigInt64(1, BigInt(value));
    return out;
}
