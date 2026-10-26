//
//  nebulaGenerator.js
//  Estrelas (web)
//
//  The nebulae of one sector of a generated universe. Star-forming clouds are placed first, from the sector's seed:
//  now and then an emission nebula round a cluster of young stars, often beside the dark cloud it formed from; dark
//  clouds and small Bok globules; and reflection nebulae round a few blue A and B stars. Stars inside an emission
//  nebula are made young, and one hot O or B star at least lights it. Then, once the sector's stars have their
//  temperatures, each white dwarf still hot from blowing off its shell gets a planetary nebula, and each young neutron
//  star, and the odd black hole, the remnant of its supernova. A port of NebulaGenerator.swift and Nebula.swift: the
//  same seed gives the same nebulae as the macOS app.
//
//  Its rolls come from SplitMix64 sequences of its own, so the sector's star rolls are the same with or without it.
//

import { SplitMix64 } from './random.js';
import { SpectralClass, StellarType, isOrdinaryClass, spectralValue, stellarValue } from './stellar.js';
import { placeNames } from './placeNames.js';

/** Bumped whenever the rules for placing nebulae change. 2: far fewer planetary nebulae and supernova remnants. */
export const nebulaVersion = 2;

export const nebulaKinds = ['emission', 'reflection', 'dark', 'planetary', 'supernovaRemnant'];
export const nebulaKindNames = {
    emission: 'Emission nebula', reflection: 'Reflection nebula', dark: 'Dark nebula', planetary: 'Planetary nebula',
    supernovaRemnant: 'Supernova remnant',
};
export const nebulaKindSummaries = {
    emission: 'Glowing hydrogen where young, hot stars are being born',
    reflection: 'Dust lit blue by the light of a nearby star',
    dark: 'A cold cloud of dust that hides the stars behind it',
    planetary: 'A shell of gas blown off by a dying star, lit by the white dwarf it left',
    supernovaRemnant: 'The expanding wreck of a supernova',
};

const f = Math.fround;
/** SystemStars.halfLength */
const halfLength = 10;

/** NebulaRandom: SplitMix64 seeded with the sector's seed mixed with a salt */
class NebulaRandom extends SplitMix64 {
    constructor(seed, salt) {
        super(BigInt(seed >>> 0) ^ salt);
    }

    uniform(lower, upper) {
        return this.float(lower, upper);
    }

    chance(p) {
        return this.doubleBelow(0, 1) < p;
    }

    /** UInt8.random(in: 0...255): the low byte of a draw */
    byte() {
        return Number(this.next64() & 0xFFn);
    }

    /** UUID(uuid:) from 16 random bytes, version 4 */
    uuid() {
        const bytes = [];
        for (let i = 0; i < 16; i++) bytes.push(this.byte());
        bytes[6] = (bytes[6] & 0x0F) | 0x40;
        bytes[8] = (bytes[8] & 0x3F) | 0x80;
        const hex = bytes.map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
}

/** simd_distance on SIMD3<Float> */
export function floatDistance(a, b) {
    const dx = f(a[0] - b[0]), dy = f(a[1] - b[1]), dz = f(a[2] - b[2]);
    return f(Math.sqrt(f(f(f(dx * dx) + f(dy * dy)) + f(dz * dz))));
}

/** Whether `point` lies within the nebula */
export function nebulaContains(nebula, point) {
    return floatDistance(point, nebula.position) < nebula.radius;
}

const zero = [0, 0, 0];

/**
 * The sector's star-forming and dark clouds and its reflection nebulae, before its planetary systems are rolled.
 * `systems` are in generation form (numeric classes, Float32Array positions). With `rejuvenate`, stars inside an
 * emission nebula are made young.
 */
export function nebulaClouds(seed, sector, systems, rejuvenate = null) {
    const random = new NebulaRandom(seed, 0x4EEB01A5EEDn);
    const nebulae = [];
    const side = halfLength * 2;
    const centre = [sector.x * side, sector.y * side, sector.z * side].map(f);
    const reach = f(halfLength * 0.7);
    const somewhere = () => {
        const offset = [random.uniform(-reach, reach), random.uniform(-reach, reach), random.uniform(-reach, reach)];
        return centre.map((c, i) => f(c + offset[i]));
    };
    const add = (kind, position, radius, systemID = undefined) => {
        const id = random.uuid();
        nebulae.push({ id, kind, name: '', position: Float32Array.from(position), radius: f(radius),
            seed: random.next64(), systemID });
    };

    // An H II region round a young cluster, with its parent molecular cloud beside it as often as not
    if (random.chance(0.15)) {
        const position = somewhere();
        const radius = random.uniform(3, 7);
        add('emission', position, radius);
        if (random.chance(0.5)) {
            const v = [random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(-1, 1)].map((x) => f(x + f(0.001)));
            const length = f(Math.sqrt(f(f(f(v[0] * v[0]) + f(v[1] * v[1])) + f(v[2] * v[2]))));
            const inverse = f(1 / length);
            const away = v.map((x) => f(x * inverse));
            const at = position.map((p, i) => f(p + f(f(away[i] * radius) * f(0.9))));
            add('dark', at, f(radius * random.uniform(0.5, 0.8)));
        }
        // Its stars are young, and at least one is hot enough to make it glow
        if (rejuvenate) {
            const limit = f(radius * f(0.85));
            const inside = [];
            systems.forEach((system, index) => {
                if (floatDistance(system.position ?? zero, position) < limit) inside.push(index);
            });
            for (const index of inside) {
                const stars = systems[index].stars;
                if (!stars) continue;
                for (const star of stars) {
                    if (random.chance(0.6)) rejuvenate(star, random);
                }
            }
            const hasHotStar = inside.some((index) => systems[index].stars?.some((s) =>
                s.spectralClass === SpectralClass.O || s.spectralClass === SpectralClass.B));
            if (!hasHotStar && inside.length > 0) {
                let nearest = inside[0];
                for (const index of inside) {
                    if (floatDistance(systems[index].position ?? zero, position) <
                        floatDistance(systems[nearest].position ?? zero, position)) nearest = index;
                }
                const stars = systems[nearest].stars;
                if (stars && stars.length > 0) {
                    const star = stars[0];
                    star.stellarType = StellarType.V;
                    star.spectralClass = random.chance(0.3) ? SpectralClass.O : SpectralClass.B;
                    star.subClass = star.spectralClass === SpectralClass.O ? random.int(4, 9) : random.int(0, 3);
                    star.variant = undefined;
                    star.variability = undefined;
                    star.mass = undefined;
                }
            }
        }
    }
    // Dark clouds, and the small, dense globules that may one day collapse into stars
    if (random.chance(0.25)) {
        const position = somewhere();
        add('dark', position, random.uniform(2, 6));
    }
    if (random.chance(0.25)) {
        const position = somewhere();
        add('dark', position, random.uniform(0.2, 0.5));
    }
    // Dust round a blue star, lit by it
    if (random.chance(0.3)) {
        const blue = systems.filter((system) =>
            system.stars?.some((s) => (s.spectralClass === SpectralClass.B || s.spectralClass === SpectralClass.A) &&
                s.stellarType !== StellarType.d) &&
            !nebulae.some((n) => n.kind === 'emission' && nebulaContains(n, system.position ?? zero)));
        if (blue.length > 0) {
            const host = blue[random.intBelow(0, blue.length)];
            if (host.position) {
                const offset = [random.uniform(-0.3, 0.3), random.uniform(-0.3, 0.3), random.uniform(-0.3, 0.3)];
                const position = Array.from(host.position, (p, i) => f(p + offset[i]));
                add('reflection', position, random.uniform(0.5, 2), host.id);
            }
        }
    }
    return nebulae;
}

/** Makes a star young, as stars are in the cluster an emission nebula glows round */
export function makeYoung(star, random) {
    if (star.stellarType !== StellarType.V || !isOrdinaryClass(star.spectralClass) || star.variant) return;
    const spectralClass = star.spectralClass ?? SpectralClass.M;
    if (random.chance(0.12)) {
        star.variant = 'protostar';
    } else if (spectralClass === SpectralClass.B || spectralClass === SpectralClass.A) {
        star.variant = 'herbigAeBe';
    } else if ([SpectralClass.F, SpectralClass.G, SpectralClass.K, SpectralClass.M].includes(spectralClass)) {
        star.variant = 'tTauri';
    }
    star.variability = undefined;
}

/**
 * Planetary nebulae round the sector's hottest white dwarfs, and supernova remnants round its young neutron stars and
 * now and then a black hole. `systems` may be in generation or saved form.
 */
export function nebulaRemnants(seed, systems) {
    const random = new NebulaRandom(seed, 0x54E0BAD0DEADn);
    const nebulae = [];
    for (const system of systems) {
        if (!system.position) continue;
        for (const star of system.stars ?? []) {
            const temperature = star.tempEffective ?? 0;
            const spectralClass = spectralValue(star.spectralClass);
            let kind = null, radius = 0;
            if (spectralClass === SpectralClass.D && temperature > 100000 && random.chance(0.4)) {
                kind = 'planetary';
                radius = random.uniform(0.15, 0.6);
            } else if (spectralClass === SpectralClass.N && temperature > 7e5 && random.chance(0.5)) {
                const youth = f(Math.min((temperature - 5e5) / 7e5, 1));
                kind = 'supernovaRemnant';
                radius = f(f(f(8) - f(youth * 6)) + random.uniform(-0.5, 0.5));
            } else if (spectralClass === SpectralClass.X && random.chance(0.08)) {
                kind = 'supernovaRemnant';
                radius = random.uniform(3, 8);
            }
            if (kind) {
                const id = random.uuid();
                nebulae.push({ id, kind, name: '', position: Float32Array.from(system.position), radius: f(radius),
                    seed: random.next64(), systemID: system.id });
            }
        }
    }
    return nebulae;
}

/** Names every nebula: "Vorath Nebula", "Kesh Cloud", "Ilun Remnant"…, none taken by the universe's systems */
export function nameNebulae(nebulae, seed, taken) {
    const random = new NebulaRandom(seed, 0x4A3E50FC10Dn);
    const names = placeNames(nebulae.length, random, taken);
    nebulae.forEach((nebula, index) => {
        const base = names[index];
        switch (nebula.kind) {
            case 'dark': nebula.name = nebula.radius < 1 ? `${base} Globule` : `${base} Cloud`; break;
            case 'supernovaRemnant': nebula.name = `${base} Remnant`; break;
            default: nebula.name = `${base} Nebula`;
        }
    });
}

/** The nebulae of a sector saved before nebulae existed (or by earlier rules), its stars left as they were */
export function nebulaeForSavedSector(seed, sector, systems, taken) {
    const copies = systems.map((s) => ({ ...s, stars: (s.stars ?? []).map((star) => ({ ...star,
        spectralClass: spectralValue(star.spectralClass), stellarType: stellarValue(star.stellarType) })) }));
    const nebulae = [...nebulaClouds(seed, sector, copies), ...nebulaRemnants(seed, systems)];
    nameNebulae(nebulae, seed, taken);
    return nebulae;
}
