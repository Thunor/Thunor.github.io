//
//  lzfse.js
//  Estrelas (web)
//
//  Apple's LZFSE compression, which the Mac app uses for universes exported for players (NSData.compressed(using:
//  .lzfse)). Browsers don't have it, so this decodes every kind of LZFSE block (v1 and v2 FSE blocks, LZVN blocks and
//  uncompressed ones) after the reference implementation, and encodes as LZVN blocks, which every LZFSE decoder
//  reads.
//

const MAGIC = {
    end: 0x24787662, // 'bvx$'
    uncompressed: 0x2d787662, // 'bvx-'
    v1: 0x31787662, // 'bvx1'
    v2: 0x32787662, // 'bvx2'
    lzvn: 0x6e787662, // 'bvxn'
};

const L_SYMBOLS = 20, M_SYMBOLS = 20, D_SYMBOLS = 64, LITERAL_SYMBOLS = 256;
const L_STATES = 64, M_STATES = 64, D_STATES = 256, LITERAL_STATES = 1024;

const lExtraBits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 5, 8];
const lBaseValue = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 20, 28, 60];
const mExtraBits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 8, 11];
const mBaseValue = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 24, 56, 312];
const dExtraBits = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7,
    8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15];
const dBaseValue = [0, 1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 28, 36, 44, 52, 60, 76, 92, 108, 124, 156, 188, 220, 252,
    316, 380, 444, 508, 636, 764, 892, 1020, 1276, 1532, 1788, 2044, 2556, 3068, 3580, 4092, 5116, 6140, 7164, 8188,
    10236, 12284, 14332, 16380, 20476, 24572, 28668, 32764, 40956, 49148, 57340, 65532, 81916, 98300, 114684, 131068,
    163836, 196604, 229372];

// MARK: decoding

const u32 = (bytes, at) => (bytes[at] | (bytes[at + 1] << 8) | (bytes[at + 2] << 16) | (bytes[at + 3] << 24)) >>> 0;
const u16 = (bytes, at) => bytes[at] | (bytes[at + 1] << 8);

/** Bits of a little-endian byte string, read from the top down, as the FSE streams are */
class BackwardBits {
    constructor(bytes, start, length, extraBits) {
        this.bytes = bytes;
        this.start = start;
        // extraBits is 0…-7: the unused high bits of the last byte
        this.position = length * 8 + extraBits;
        if (this.position < 0) throw new Error('Bad LZFSE stream');
    }

    pull(count) {
        if (count === 0) return 0;
        this.position -= count;
        if (this.position < 0) throw new Error('LZFSE stream overrun');
        const byteIndex = this.start + (this.position >> 3);
        const shift = this.position & 7;
        const b = this.bytes;
        const value = b[byteIndex] + (b[byteIndex + 1] ?? 0) * 256 + (b[byteIndex + 2] ?? 0) * 65536 +
            (b[byteIndex + 3] ?? 0) * 16777216 + (b[byteIndex + 4] ?? 0) * 4294967296;
        return Math.floor(value / 2 ** shift) % 2 ** count;
    }
}

function clz32(value) {
    return Math.clz32(value);
}

/** Literal decoder: entries of { k, symbol, delta } */
function literalTable(nstates, freq) {
    const table = [];
    const nClz = clz32(nstates);
    let sum = 0;
    freq.forEach((f, symbol) => {
        if (f === 0) return;
        sum += f;
        if (sum > nstates) throw new Error('Bad LZFSE frequencies');
        const k = clz32(f) - nClz;
        const j0 = ((2 * nstates) >> k) - f;
        for (let j = 0; j < f; j++) {
            if (j < j0) table.push({ k, symbol, delta: ((f + j) << k) - nstates });
            else table.push({ k: k - 1, symbol, delta: (j - j0) << (k - 1) });
        }
    });
    return table;
}

/** L, M and D decoders: entries of { totalBits, valueBits, delta, base } */
function valueTable(nstates, freq, extraBits, baseValue) {
    const table = [];
    const nClz = clz32(nstates);
    freq.forEach((f, symbol) => {
        if (f === 0) return;
        const k = clz32(f) - nClz;
        const j0 = ((2 * nstates) >> k) - f;
        const valueBits = extraBits[symbol], base = baseValue[symbol];
        for (let j = 0; j < f; j++) {
            if (j < j0) table.push({ totalBits: k + valueBits, valueBits, delta: ((f + j) << k) - nstates, base });
            else table.push({ totalBits: k - 1 + valueBits, valueBits, delta: (j - j0) << (k - 1), base });
        }
    });
    return table;
}

function freqValue(bits) {
    const nbitsTable = [2, 3, 2, 5, 2, 3, 2, 8, 2, 3, 2, 5, 2, 3, 2, 14, 2, 3, 2, 5, 2, 3, 2, 8, 2, 3, 2, 5, 2, 3, 2, 14];
    const valueTable = [0, 2, 1, 4, 0, 3, 1, -1, 0, 2, 1, 5, 0, 3, 1, -1, 0, 2, 1, 6, 0, 3, 1, -1, 0, 2, 1, 7, 0, 3, 1, -1];
    const b = bits & 31;
    const n = nbitsTable[b];
    if (n === 8) return [8 + ((bits >>> 4) & 0xf), n];
    if (n === 14) return [24 + ((bits >>> 4) & 0x3ff), n];
    return [valueTable[b], n];
}

/** Reads a v1 or v2 block header into a common shape; returns [header, headerSize] */
function readFSEHeader(bytes, at, magic) {
    const h = { lFreq: new Array(L_SYMBOLS).fill(0), mFreq: new Array(M_SYMBOLS).fill(0),
        dFreq: new Array(D_SYMBOLS).fill(0), literalFreq: new Array(LITERAL_SYMBOLS).fill(0) };
    if (magic === MAGIC.v1) {
        let p = at + 4;
        const next32 = () => { const v = u32(bytes, p); p += 4; return v; };
        h.nRawBytes = next32();
        next32(); // n_payload_bytes
        h.nLiterals = next32();
        h.nMatches = next32();
        h.nLiteralPayloadBytes = next32();
        h.nLMDPayloadBytes = next32();
        h.literalBits = next32() | 0;
        h.literalState = [u16(bytes, p), u16(bytes, p + 2), u16(bytes, p + 4), u16(bytes, p + 6)];
        p += 8;
        h.lmdBits = next32() | 0;
        h.lState = u16(bytes, p); h.mState = u16(bytes, p + 2); h.dState = u16(bytes, p + 4);
        p += 6;
        for (const table of [h.lFreq, h.mFreq, h.dFreq, h.literalFreq]) {
            for (let i = 0; i < table.length; i++, p += 2) table[i] = u16(bytes, p);
        }
        return [h, p + ((4 - ((p - at) % 4)) % 4) - at];
    }
    // v2: three packed 64-bit fields, then the frequency tables, compressed
    const field = (offset, start, count) => {
        // Fields never straddle 32-bit halves in a way that needs more than 53 bits of precision
        const lo = u32(bytes, at + offset), hi = u32(bytes, at + offset + 4);
        const value = BigInt(hi) << 32n | BigInt(lo);
        return Number((value >> BigInt(start)) & ((1n << BigInt(count)) - 1n));
    };
    h.nRawBytes = u32(bytes, at + 4);
    h.nLiterals = field(8, 0, 20);
    h.nLiteralPayloadBytes = field(8, 20, 20);
    h.nMatches = field(8, 40, 20);
    h.literalBits = field(8, 60, 3) - 7;
    h.literalState = [field(16, 0, 10), field(16, 10, 10), field(16, 20, 10), field(16, 30, 10)];
    h.nLMDPayloadBytes = field(16, 40, 20);
    h.lmdBits = field(16, 60, 3) - 7;
    const headerSize = field(24, 0, 32);
    h.lState = field(24, 32, 10);
    h.mState = field(24, 42, 10);
    h.dState = field(24, 52, 10);
    let src = at + 32;
    const end = at + headerSize;
    if (src !== end) {
        let accum = 0, accumBits = 0;
        const tables = [h.lFreq, h.mFreq, h.dFreq, h.literalFreq];
        for (const table of tables) {
            for (let i = 0; i < table.length; i++) {
                while (src < end && accumBits + 8 <= 32) {
                    accum = (accum | (bytes[src] << accumBits)) >>> 0;
                    accumBits += 8;
                    src += 1;
                }
                const [value, nbits] = freqValue(accum);
                if (nbits > accumBits) throw new Error('Bad LZFSE frequency table');
                table[i] = value;
                accum = accum >>> nbits;
                accumBits -= nbits;
            }
        }
    }
    return [h, headerSize];
}

function decodeFSEBlock(bytes, at, magic, output) {
    const [h, headerSize] = readFSEHeader(bytes, at, magic);
    const payload = at + headerSize;

    // Literals, four interleaved streams read backwards from the end of their payload
    const literalDecoder = literalTable(LITERAL_STATES, h.literalFreq);
    const literals = new Uint8Array(h.nLiterals + 64);
    const literalBits = new BackwardBits(bytes, payload, h.nLiteralPayloadBytes, h.literalBits);
    const states = h.literalState.slice();
    for (let i = 0; i < h.nLiterals; i += 4) {
        for (let s = 0; s < 4; s++) {
            const entry = literalDecoder[states[s]];
            if (!entry) throw new Error('Bad LZFSE literal state');
            states[s] = entry.delta + literalBits.pull(entry.k);
            literals[i + s] = entry.symbol;
        }
    }

    // Literal, match and distance triples
    const lDecoder = valueTable(L_STATES, h.lFreq, lExtraBits, lBaseValue);
    const mDecoder = valueTable(M_STATES, h.mFreq, mExtraBits, mBaseValue);
    const dDecoder = valueTable(D_STATES, h.dFreq, dExtraBits, dBaseValue);
    const bits = new BackwardBits(bytes, payload + h.nLiteralPayloadBytes, h.nLMDPayloadBytes, h.lmdBits);
    const decodeValue = (table, state) => {
        const entry = table[state.value];
        if (!entry) throw new Error('Bad LZFSE state');
        const pulled = bits.pull(entry.totalBits);
        state.value = entry.delta + Math.floor(pulled / 2 ** entry.valueBits);
        return entry.base + (pulled % 2 ** entry.valueBits);
    };
    const lState = { value: h.lState }, mState = { value: h.mState }, dState = { value: h.dState };
    let literal = 0;
    let distance = -1;
    const start = output.length;
    for (let symbol = 0; symbol < h.nMatches; symbol++) {
        const L = decodeValue(lDecoder, lState);
        const M = decodeValue(mDecoder, mState);
        const D = decodeValue(dDecoder, dState);
        if (D !== 0) distance = D;
        for (let i = 0; i < L; i++) output.push(literals[literal++]);
        if (M > 0) {
            if (distance <= 0 || distance > output.length) throw new Error('Bad LZFSE match distance');
            const from = output.length - distance;
            for (let i = 0; i < M; i++) output.push(output.get(from + i));
        }
    }
    if (output.length - start !== h.nRawBytes) throw new Error('LZFSE block size mismatch');
    return headerSize + h.nLiteralPayloadBytes + h.nLMDPayloadBytes;
}

function decodeLZVN(bytes, at, payloadSize, rawSize, output) {
    const end = at + payloadSize;
    const target = output.length + rawSize;
    let p = at;
    let distance = 0;
    const copyLiterals = (count) => {
        for (let i = 0; i < count; i++) output.push(bytes[p++]);
    };
    const copyMatch = (count) => {
        if (distance <= 0 || distance > output.length) throw new Error('Bad LZVN match distance');
        const from = output.length - distance;
        for (let i = 0; i < count; i++) output.push(output.get(from + i));
    };
    while (p < end && output.length < target) {
        const opc = bytes[p];
        if (opc === 0x06) break; // end of stream
        if (opc === 0x0e || opc === 0x16) { p += 1; continue; } // nop
        if ((opc >= 0x70 && opc <= 0x7f) || (opc >= 0xd0 && opc <= 0xdf) || [0x1e, 0x26, 0x2e, 0x36, 0x3e].includes(opc)) {
            throw new Error('Undefined LZVN opcode');
        }
        if (opc >= 0xa0 && opc <= 0xbf) { // med_d
            const b1 = bytes[p + 1], b2 = bytes[p + 2];
            const L = (opc >> 3) & 3;
            const M = (((opc & 7) << 2) | (b1 & 3)) + 3;
            p += 3;
            copyLiterals(L);
            distance = (b1 >> 2) | (b2 << 6);
            copyMatch(M);
        } else if (opc === 0xe0) { // lrg_l
            const L = bytes[p + 1] + 16;
            p += 2;
            copyLiterals(L);
        } else if (opc >= 0xe1 && opc <= 0xef) { // sml_l
            p += 1;
            copyLiterals(opc & 0xf);
        } else if (opc === 0xf0) { // lrg_m
            const M = bytes[p + 1] + 16;
            p += 2;
            copyMatch(M);
        } else if (opc >= 0xf1) { // sml_m
            p += 1;
            copyMatch(opc & 0xf);
        } else if ((opc & 7) === 7) { // lrg_d
            const L = opc >> 6, M = ((opc >> 3) & 7) + 3;
            const d = bytes[p + 1] | (bytes[p + 2] << 8);
            p += 3;
            copyLiterals(L);
            distance = d;
            copyMatch(M);
        } else if ((opc & 7) === 6) { // pre_d
            const L = opc >> 6, M = ((opc >> 3) & 7) + 3;
            p += 1;
            copyLiterals(L);
            copyMatch(M);
        } else { // sml_d
            const L = opc >> 6, M = ((opc >> 3) & 7) + 3;
            const d = ((opc & 7) << 8) | bytes[p + 1];
            p += 2;
            copyLiterals(L);
            distance = d;
            copyMatch(M);
        }
    }
    if (output.length !== target) throw new Error('LZVN block size mismatch');
}

/** A growable byte buffer */
class Output {
    constructor(capacity = 1 << 16) {
        this.buffer = new Uint8Array(capacity);
        this.length = 0;
    }

    push(byte) {
        if (this.length === this.buffer.length) {
            const bigger = new Uint8Array(this.buffer.length * 2);
            bigger.set(this.buffer);
            this.buffer = bigger;
        }
        this.buffer[this.length++] = byte;
    }

    get(index) {
        return this.buffer[index];
    }

    bytes() {
        return this.buffer.slice(0, this.length);
    }
}

/** Decompresses an LZFSE stream */
export function lzfseDecode(bytes) {
    const output = new Output(Math.max(bytes.length * 4, 1 << 16));
    let at = 0;
    while (at + 4 <= bytes.length) {
        const magic = u32(bytes, at);
        if (magic === MAGIC.end) return output.bytes();
        if (magic === MAGIC.uncompressed) {
            const size = u32(bytes, at + 4);
            for (let i = 0; i < size; i++) output.push(bytes[at + 8 + i]);
            at += 8 + size;
        } else if (magic === MAGIC.lzvn) {
            const raw = u32(bytes, at + 4), payload = u32(bytes, at + 8);
            decodeLZVN(bytes, at + 12, payload, raw, output);
            at += 12 + payload;
        } else if (magic === MAGIC.v1 || magic === MAGIC.v2) {
            at += decodeFSEBlock(bytes, at, magic, output);
        } else {
            throw new Error('Not an LZFSE stream');
        }
    }
    throw new Error('LZFSE stream ended early');
}

// MARK: encoding (LZVN blocks)

const BLOCK_SIZE = 1 << 20;
const MAX_DISTANCE = 0xffff;
const HASH_BITS = 15;

/** LZVN for one block: greedy matching with a hash of the last place each 4-byte sequence was seen */
function encodeLZVN(input, start, end) {
    const out = [];
    const table = new Int32Array(1 << HASH_BITS).fill(-1);
    const hash = (i) => (Math.imul(input[i] | (input[i + 1] << 8) | (input[i + 2] << 16) | (input[i + 3] << 24),
        2654435761) >>> (32 - HASH_BITS));
    let literalStart = start;
    let i = start;
    let previousDistance = 0;

    const emitLiterals = (from, count) => {
        while (count > 0) {
            if (count >= 16) {
                const n = Math.min(count, 271);
                out.push(0xe0, n - 16);
                for (let k = 0; k < n; k++) out.push(input[from + k]);
                from += n; count -= n;
            } else {
                out.push(0xe0 | count);
                for (let k = 0; k < count; k++) out.push(input[from + k]);
                from += count; count = 0;
            }
        }
    };

    while (i + 4 <= end) {
        const h = hash(i);
        const candidate = table[h];
        table[h] = i;
        if (candidate >= start && i - candidate <= MAX_DISTANCE && input[candidate] === input[i] &&
            input[candidate + 1] === input[i + 1] && input[candidate + 2] === input[i + 2] &&
            input[candidate + 3] === input[i + 3]) {
            let length = 4;
            while (i + length < end && input[candidate + length] === input[i + length]) length += 1;
            const distance = i - candidate;
            // Literals before the match: all but up to three go out on their own
            const literals = i - literalStart;
            const carried = Math.min(literals, 3);
            // Opcodes with literals can only carry so long a match before they'd collide with other opcodes
            // (med_d, the literal and match opcodes, and undefined ones); the rest follows as a match of its own
            const first = Math.min(length, [10, 8, 6, 4][carried]);
            const mmm = first - 3;
            emitLiterals(literalStart, literals - carried);
            const carriedFrom = i - carried;
            if (distance === previousDistance && carried > 0) {
                out.push((carried << 6) | (mmm << 3) | 6); // pre_d
            } else {
                out.push((carried << 6) | (mmm << 3) | 7, distance & 0xff, distance >> 8); // lrg_d
            }
            for (let k = 0; k < carried; k++) out.push(input[carriedFrom + k]);
            previousDistance = distance;
            let remaining = length - first;
            while (remaining > 0) {
                if (remaining >= 16) {
                    const n = Math.min(remaining, 271);
                    out.push(0xf0, n - 16);
                    remaining -= n;
                } else {
                    out.push(0xf0 | remaining);
                    remaining = 0;
                }
            }
            // Remember a few places inside the match too
            for (let k = i + 1; k < i + length && k + 4 <= end; k += 3) table[hash(k)] = k;
            i += length;
            literalStart = i;
        } else {
            i += 1;
        }
    }
    emitLiterals(literalStart, end - literalStart);
    out.push(0x06, 0, 0, 0, 0, 0, 0, 0);
    return Uint8Array.from(out);
}

/** Compresses bytes as an LZFSE stream of LZVN blocks */
export function lzfseEncode(input) {
    const parts = [];
    let total = 0;
    for (let start = 0; start < input.length; start += BLOCK_SIZE) {
        const end = Math.min(start + BLOCK_SIZE, input.length);
        const payload = encodeLZVN(input, start, end);
        const header = new Uint8Array(12);
        const view = new DataView(header.buffer);
        view.setUint32(0, MAGIC.lzvn, true);
        view.setUint32(4, end - start, true);
        view.setUint32(8, payload.length, true);
        parts.push(header, payload);
        total += 12 + payload.length;
    }
    const trailer = new Uint8Array(4);
    new DataView(trailer.buffer).setUint32(0, MAGIC.end, true);
    parts.push(trailer);
    total += 4;
    const result = new Uint8Array(total);
    let at = 0;
    for (const part of parts) {
        result.set(part, at);
        at += part.length;
    }
    return result;
}
