//
//  random.js
//  Estrelas (web)
//
//  The macOS app rolls everything from drand48 through Swift's standard library random APIs. This reproduces both
//  exactly, so the same seed generates the same star field (ids included) in either app.
//
//  Swift's generator: OnyxRandomGen.next() = UInt64(drand48() * Double(UInt64.max)), which is the 48-bit drand48
//  state shifted left 16 bits. Int.random(in:), Double.random(in:) and Float.random(in:) then follow the Swift
//  standard library's algorithms (Lemire's nearly divisionless method for bounded integers).
//

const MASK48 = (1n << 48n) - 1n;
const MASK64 = (1n << 64n) - 1n;
const MASK32 = (1n << 32n) - 1n;
const DRAND_A = 0x5DEECE66Dn;
const DRAND_C = 0xBn;

/** Swift's standard library random APIs over a source of 64-bit draws (`next64()`, a BigInt) */
export class SwiftRandom {

    /** RandomNumberGenerator.next<UInt32>() truncates a 64-bit draw */
    next32() {
        return this.next64() & MASK32;
    }

    /** next(upperBound:) for a 64-bit (bits = 64) or 32-bit (bits = 32) unsigned bound, as a BigInt */
    nextBelow(bound, bits = 64) {
        bound = BigInt(bound);
        const mask = bits === 64 ? MASK64 : MASK32;
        const shift = BigInt(bits);
        const draw = () => (bits === 64 ? this.next64() : this.next32());
        let random = draw();
        let m = random * bound;
        if ((m & mask) < bound) {
            const t = ((mask + 1n) - bound) % bound;
            while ((m & mask) < t) {
                random = draw();
                m = random * bound;
            }
        }
        return m >> shift;
    }

    /** Int.random(in: lower...upper) */
    int(lower, upper) {
        const delta = BigInt(upper - lower) + 1n;
        return lower + Number(this.nextBelow(delta));
    }

    /** Int.random(in: lower..<upper) */
    intBelow(lower, upper) {
        return lower + Number(this.nextBelow(BigInt(upper - lower)));
    }

    /** Double.random(in: lower...upper) */
    double(lower, upper) {
        const delta = upper - lower;
        const max = 1n << 53n;
        const rand = this.nextBelow(max + 1n);
        if (rand === max) return upper;
        return delta * (Number(rand) * 2 ** -53) + lower;
    }

    /** Double.random(in: lower..<upper) */
    doubleBelow(lower, upper) {
        const delta = upper - lower;
        for (;;) {
            const rand = this.next64() & ((1n << 53n) - 1n);
            const value = delta * (Number(rand) * 2 ** -53) + lower;
            if (value !== upper) return value;
        }
    }

    /** Float.random(in: lower...upper), in single precision */
    float(lower, upper) {
        const f = Math.fround;
        const delta = f(f(upper) - f(lower));
        const max = 1n << 24n;
        const rand = this.nextBelow(max + 1n, 32);
        if (rand === max) return f(upper);
        return f(f(delta * f(Number(rand) * 2 ** -24)) + f(lower));
    }

    /** Float.random(in: lower..<upper), in single precision */
    floatBelow(lower, upper) {
        const f = Math.fround;
        const delta = f(f(upper) - f(lower));
        for (;;) {
            const rand = this.next32() & ((1n << 24n) - 1n);
            const value = f(f(delta * f(Number(rand) * 2 ** -24)) + f(lower));
            if (value !== f(upper)) return value;
        }
    }

    /** Array.shuffled(using:) */
    shuffled(array) {
        const result = array.slice();
        if (result.length < 2) return result;
        let amount = result.length;
        let current = 0;
        while (amount > 1) {
            const random = this.intBelow(0, amount);
            amount -= 1;
            const other = current + random;
            [result[current], result[other]] = [result[other], result[current]];
            current += 1;
        }
        return result;
    }
}

/** drand48 with Swift's wrapper: every draw is a UInt64 */
export class SwiftDrand48 extends SwiftRandom {
    constructor(seed = 0) {
        super();
        this.reseed(seed);
    }

    /** srand48: the low 32 bits of the seed, above 0x330E */
    reseed(seed) {
        this.state = ((BigInt(seed) & MASK32) << 16n) | 0x330En;
    }

    /** OnyxRandomGen.next() */
    next64() {
        this.state = (DRAND_A * this.state + DRAND_C) & MASK48;
        return this.state << 16n;
    }
}

/** SplitMix64 as a Swift RandomNumberGenerator, e.g. for belt layouts */
export class SplitMix64 extends SwiftRandom {
    constructor(seed) {
        super();
        this.state = BigInt.asUintN(64, BigInt(seed));
    }

    next64() {
        this.state = (this.state + 0x9E3779B97F4A7C15n) & MASK64;
        let z = this.state;
        z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & MASK64;
        z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & MASK64;
        return z ^ (z >> 31n);
    }
}

/** The shared generator behind every roll (OnyxRandomGen.randGen) */
export const rng = new SwiftDrand48(0);

/** UUID strings for systems and stars that follow a universe's seed (SplitMix64, separate from the rolls) */
export class SeededIDs {
    constructor(seed) {
        this.state = BigInt(seed) ^ 0x1D5EED00C0FFEE00n;
    }

    nextValue() {
        this.state = (this.state + 0x9E3779B97F4A7C15n) & MASK64;
        let z = this.state;
        z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & MASK64;
        z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & MASK64;
        return z ^ (z >> 31n);
    }

    next() {
        const high = this.nextValue(), low = this.nextValue();
        const bytes = [];
        for (const value of [high, low]) {
            for (let shift = 56n; shift >= 0n; shift -= 8n) bytes.push(Number((value >> shift) & 0xFFn));
        }
        bytes[6] = (bytes[6] & 0x0F) | 0x40;
        bytes[8] = (bytes[8] & 0x3F) | 0x80;
        const hex = bytes.map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
}

/** A random UUID in Foundation's upper-case form */
export function randomUUID() {
    return crypto.randomUUID().toUpperCase();
}

/** A random universe seed, 0...4294967295 */
export function randomSeed() {
    return crypto.getRandomValues(new Uint32Array(1))[0];
}

/** Swift's .rounded(): halves round away from zero */
export function roundSwift(value) {
    return value < 0 ? -Math.round(-value) : Math.round(value);
}

/** Int(_ double): truncates toward zero */
export function trunc(value) {
    return Math.trunc(value);
}
