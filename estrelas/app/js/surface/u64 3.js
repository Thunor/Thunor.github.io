//
//  u64.js
//  Estrelas (web)
//
//  Fast unsigned 64-bit arithmetic on (hi, lo) pairs of 32-bit numbers, for the noise and hash functions that run
//  millions of times per surface. BigInt would give the same results but far too slowly. Functions return their
//  result through `out.hi` and `out.lo` to avoid allocating.
//

export const out = { hi: 0, lo: 0 };

/** High 32 bits of the 64-bit product of two unsigned 32-bit numbers */
function mulHigh32(a, b) {
    const a0 = a & 0xFFFF, a1 = a >>> 16, b0 = b & 0xFFFF, b1 = b >>> 16;
    const t = a0 * b0;
    const mid1 = a1 * b0 + (t >>> 16);
    const mid2 = a0 * b1 + (mid1 & 0xFFFF);
    return (a1 * b1 + (mid1 >>> 16) + (mid2 >>> 16)) >>> 0;
}

/** Low 64 bits of a × b */
export function mul(ahi, alo, bhi, blo) {
    const hi = (mulHigh32(alo, blo) + Math.imul(alo, bhi) + Math.imul(ahi, blo)) >>> 0;
    out.lo = Math.imul(alo, blo) >>> 0;
    out.hi = hi;
}

/** a + b, wrapping */
export function add(ahi, alo, bhi, blo) {
    const lo = alo + blo;
    out.lo = lo >>> 0;
    out.hi = (ahi + bhi + (lo > 0xFFFFFFFF ? 1 : 0)) >>> 0;
}

/** a + n for a small non-negative integer n, wrapping */
export function addSmall(ahi, alo, n) {
    const lo = alo + n;
    out.lo = lo >>> 0;
    out.hi = (ahi + (lo > 0xFFFFFFFF ? 1 : 0)) >>> 0;
}

/** Splits a BigInt into [hi, lo] */
export function split(value) {
    value = BigInt.asUintN(64, BigInt(value));
    return [Number(value >> 32n), Number(value & 0xFFFFFFFFn)];
}

/** The top 53 bits as a double in 0..<1: Double(x >> 11) / 2⁵³ */
export function unit(hi, lo) {
    return (hi * 2097152 + (lo >>> 11)) / 9007199254740992;
}

// Constants, as [hi, lo]
export const GOLDEN = split(0x9E3779B97F4A7C15n);
export const MIX1 = split(0xBF58476D1CE4E5B9n);
export const MIX2 = split(0x94D049BB133111EBn);
export const KY = split(0xC2B2AE3D27D4EB4Fn);
export const KZ = split(0x165667B19E3779F9n);
export const FMIX = split(0xFF51AFD7ED558CCDn);

/** SplitMix64's output function applied to (v + golden ratio), as SurfaceMap.splitMix */
export function splitMix(hi, lo) {
    add(hi, lo, GOLDEN[0], GOLDEN[1]);
    mixState(out.hi, out.lo);
}

/** SplitMix64's mixing of a state that has already been advanced */
export function mixState(zhi, zlo) {
    // z = (z ^ (z >> 30)) * MIX1
    let shi = zhi >>> 30, slo = ((zlo >>> 30) | (zhi << 2)) >>> 0;
    mul((zhi ^ shi) >>> 0, (zlo ^ slo) >>> 0, MIX1[0], MIX1[1]);
    zhi = out.hi; zlo = out.lo;
    // z = (z ^ (z >> 27)) * MIX2
    shi = zhi >>> 27; slo = ((zlo >>> 27) | (zhi << 5)) >>> 0;
    mul((zhi ^ shi) >>> 0, (zlo ^ slo) >>> 0, MIX2[0], MIX2[1]);
    zhi = out.hi; zlo = out.lo;
    // z ^ (z >> 31)
    shi = zhi >>> 31; slo = ((zlo >>> 31) | (zhi << 1)) >>> 0;
    out.hi = (zhi ^ shi) >>> 0;
    out.lo = (zlo ^ slo) >>> 0;
}

/** An Int64 (from a small whole double) as the [hi, lo] of its bit pattern */
export function int64Hi(value) {
    return value < 0 ? 0xFFFFFFFF : 0;
}

/** FNV-1a over the UTF-8 bytes of `text`, as a BigInt */
export function stableHash(text) {
    let hash = 0xCBF29CE484222325n;
    for (const byte of new TextEncoder().encode(text)) {
        hash = BigInt.asUintN(64, (hash ^ BigInt(byte)) * 0x100000001B3n);
    }
    return hash;
}
