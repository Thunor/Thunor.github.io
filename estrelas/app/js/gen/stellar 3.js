//
//  stellar.js
//  Estrelas (web)
//
//  Spectral classes, stellar types, random draws, and the physical properties of stars from standard astrophysical
//  relations: the main-sequence mass–luminosity relation, effective temperatures by spectral type, the
//  Stefan–Boltzmann law for radius, white dwarf cooling (Mestel's law) and the Chandrasekhar-limited white dwarf
//  mass–radius relation, and main-sequence lifetimes. Ported from SpectralClass.swift, StellarType.swift, Dice.swift,
//  StellarData.swift and Int+RomanNumeral.swift.
//

import { rng } from './random.js';

// MARK: spectral classes and stellar types, by their Swift raw values

/**
 * A star's spectral class: the Harvard sequence O B A F G K M, the brown dwarfs L T Y below it, white dwarfs (D),
 * Wolf–Rayet stars (W), carbon (C) and S-type giants, neutron stars (N, saved "NS") and black holes (X, saved "BH")
 */
export const SpectralClass = { D: 3, M: 4, K: 5, G: 6, F: 7, A: 8, B: 9, O: 10, L: 11, T: 12, Y: 13, W: 14, C: 15, S: 16,
    N: 17, X: 18 };
export const spectralLetter = Object.fromEntries(Object.entries(SpectralClass).map(([k, v]) => [v, k]));
spectralLetter[SpectralClass.N] = 'NS';
spectralLetter[SpectralClass.X] = 'BH';
const spectralByLetter = Object.fromEntries(Object.entries(spectralLetter).map(([v, k]) => [k, Number(v)]));

/** Below the hydrogen-burning limit: never a true star */
export const isBrownDwarf = (c) => c === SpectralClass.L || c === SpectralClass.T || c === SpectralClass.Y;
/** What's left after a massive star dies, too dense to shine by fusion */
export const isCompactRemnant = (c) => c === SpectralClass.N || c === SpectralClass.X;
/** Shines by fusion, or did until it became a white dwarf */
export const isOrdinaryClass = (c) => c >= SpectralClass.M && c <= SpectralClass.O;
/** The subclasses a class runs through, hottest first */
export function subclassRange(c) {
    if (c === SpectralClass.O) return [2, 9];
    if (c === SpectralClass.Y) return [0, 4];
    return [0, 9];
}

/** Luminosity classes; Iab and hypergiants (saved "Ia+") and the remnants of collapsed stars came later */
export const StellarType = { d: 1, VI: 2, V: 3, IV: 4, III: 5, II: 6, Ib: 7, Ia: 8, Iab: 9, hypergiant: 10, remnant: 11 };
export const stellarName = Object.fromEntries(Object.entries(StellarType).map(([k, v]) => [v, k]));
stellarName[StellarType.hypergiant] = 'Ia+';
const stellarByName = Object.fromEntries(Object.entries(stellarName).map(([v, k]) => [k, Number(v)]));

/** Giants, supergiants and hypergiants */
export const isEvolved = (t) => [StellarType.III, StellarType.II, StellarType.Ib, StellarType.Iab, StellarType.Ia,
    StellarType.hypergiant].includes(t);
export const isSupergiant = (t) => [StellarType.Ib, StellarType.Iab, StellarType.Ia, StellarType.hypergiant].includes(t);

/** Saved values are letters; very old saves used the raw numbers */
export function spectralValue(saved) {
    if (saved === undefined || saved === null) return undefined;
    return typeof saved === 'number' ? saved : spectralByLetter[saved];
}

export function stellarValue(saved) {
    if (saved === undefined || saved === null) return undefined;
    return typeof saved === 'number' ? saved : stellarByName[saved];
}

/** What sets a star apart within its class (StellarVariant.swift), with display names */
export const variantNames = {
    da: 'Hydrogen white dwarf', db: 'Helium white dwarf', do: 'Hot helium white dwarf', dq: 'Carbon white dwarf',
    dz: 'Metal-polluted white dwarf', dc: 'Featureless white dwarf', wn: 'Nitrogen Wolf–Rayet star',
    wc: 'Carbon Wolf–Rayet star', wo: 'Oxygen Wolf–Rayet star', cR: 'Early carbon star', cN: 'Carbon star',
    cJ: 'Carbon-13 star', s: 'S-type star', ms: 'MS-type star', sc: 'SC-type star', tTauri: 'T Tauri star',
    herbigAeBe: 'Herbig Ae/Be star', protostar: 'Protostar', be: 'Be star', ap: 'Ap star', bp: 'Bp star', am: 'Am star',
    blueStraggler: 'Blue straggler', pulsar: 'Pulsar', magnetar: 'Magnetar',
};
export const isYoungVariant = (v) => v === 'tTauri' || v === 'herbigAeBe' || v === 'protostar';
export const isWhiteDwarfVariant = (v) => ['da', 'db', 'do', 'dq', 'dz', 'dc'].includes(v);

/** How a star's light varies (StellarVariability), with display names and typical periods */
export const variabilityNames = { cepheid: 'Cepheid variable', rrLyrae: 'RR Lyrae variable', mira: 'Mira variable',
    flare: 'Flare star' };
export const variabilityPeriods = { cepheid: 'pulses every 1 to 100 days', rrLyrae: 'pulses every half a day or so',
    mira: 'brightens and dims over about a year', flare: 'flares without warning' };

// MARK: random draws (all from the shared seeded generator)

export const Dice = {
    roll1D6: () => rng.int(1, 6),
    roll2D6: () => Dice.roll1D6() + Dice.roll1D6(),
    roll3D6: () => Dice.roll1D6() + Dice.roll1D6() + Dice.roll1D6(),
    roll(count) {
        let sum = 0;
        for (let i = 0; i < Math.max(count, 0); i++) sum += Dice.roll1D6();
        return sum;
    },
    rollD3: () => rng.int(1, 3),
    rollD10: () => rng.int(1, 10),
    rollD100: () => rng.int(1, 100),

    /** Double.random(in: lower...upper) */
    uniform: (lower, upper) => rng.double(lower, upper),
    /** True with probability `p` */
    chance: (p) => rng.double(0, 1) < p,
    /** Box–Muller standard normal draw, scaled; with `range`, kept within it */
    normal(mean = 0, sd = 1, range) {
        const u1 = Math.max(rng.double(0, 1), Number.MIN_VALUE);
        const u2 = rng.double(0, 1);
        const value = mean + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return range ? Math.min(Math.max(value, range[0]), range[1]) : value;
    },
    /** Uniform in the logarithm, so each factor of ten is as likely as the next */
    logUniform: (lower, upper) => Math.exp(rng.double(Math.log(lower), Math.log(upper))),
    /** Poisson-distributed count with mean `lambda` (Knuth's method) */
    poisson(lambda) {
        if (!(lambda > 0)) return 0;
        const limit = Math.exp(-lambda);
        let count = 0;
        let product = rng.double(0, 1);
        while (product > limit && count < 100) {
            count += 1;
            product *= rng.double(0, 1);
        }
        return count;
    },
    /** One of `options` ([value, weight] pairs), each as likely as its weight */
    weighted(options) {
        const total = options.reduce((sum, [, weight]) => sum + Math.max(weight, 0), 0);
        if (!(total > 0) || options.length === 0) return options[0][0];
        let remaining = rng.double(0, total);
        for (const [option, weight] of options) {
            if (!(weight > 0)) continue;
            if (remaining <= weight) return option;
            remaining -= weight;
        }
        return options[options.length - 1][0];
    },
};

// MARK: Roman numerals

export function romanNumeral(value) {
    const table = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
        [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let remaining = value;
    let result = '';
    for (const [amount, numeral] of table) {
        while (remaining >= amount) {
            result += numeral;
            remaining -= amount;
        }
    }
    return result;
}

// MARK: StellarData

export const solTemperature = 5772.0;
const auPerSolarRadius = 0.00465;
/** Age of the universe's oldest stars, billions of years */
export const maximumAge = 13.0;

// Effective temperatures of main-sequence dwarfs at subclasses 0 and 5 of each class, O0 to M5, and M9
const dwarfTemperatures = [52000, 41400, 31400, 15700, 9700, 8180, 7220, 6510, 5920, 5660, 5280, 4440, 3850, 3060, 2400];

/** Luminosity of a hydrogen-burning dwarf of a given mass, from the piecewise mass–luminosity relation */
export function mainSequenceLuminosity(mass) {
    const m = Math.max(mass, 0.08);
    if (m < 0.43) return 0.23 * Math.pow(m, 2.3);
    if (m < 2) return Math.pow(m, 4);
    if (m < 55) return 1.4 * Math.pow(m, 3.5);
    return 32000 * m;
}

/** Properties of a star that hasn't yet died, from its spectral type, mass, and anything special about it */
export function stellarProperties(spectralClass, subClass, stellarType, mass, variant = null, variability = null) {
    const sub = Math.min(Math.max(subClass, 0), 9);
    // A star of `temperature` and `diameter` (solar), its luminosity from the Stefan–Boltzmann law
    const sized = (temperature, d) => {
        const luminosity = d * d * Math.pow(temperature / solTemperature, 4);
        return { mass, luminosity, temperature, diameter: d, innerLimitAU: innerLimitAU(d, luminosity), isPostStellar: false };
    };
    // A star of `temperature` and `luminosity`, its diameter from the Stefan–Boltzmann law
    const shining = (temperature, luminosity) => {
        const d = diameter(luminosity, temperature);
        return { mass, luminosity, temperature, diameter: d, innerLimitAU: innerLimitAU(d, luminosity), isPostStellar: false };
    };
    switch (spectralClass) {
        // Brown dwarfs: all about Jupiter's size, glowing faintly as they cool
        case SpectralClass.L: return sized(2200 - sub / 9 * 900, 0.1);
        case SpectralClass.T: return sized(1300 - sub / 9 * 750, 0.095);
        case SpectralClass.Y: return sized(500 - Math.min(sub, 4) / 4 * 250, 0.09);
        // Wolf–Rayet stars: hot, compact helium cores blowing off their envelopes
        case SpectralClass.W: {
            const temperature = variant === 'wc' ? 120000 - (Math.max(sub, 4) - 4) / 5 * 75000
                : variant === 'wo' ? 210000 - (Math.min(Math.max(sub, 1), 4) - 1) / 3 * 60000
                    : 90000 - (Math.max(sub, 2) - 2) / 7 * 60000;
            return shining(temperature, 1e5 * Math.pow(mass / 10, 2));
        }
        // Carbon and S-type giants: cool, swollen and very red
        case SpectralClass.C: {
            const temperature = variant === 'cR' ? 5100 - sub / 9 * 1100 : variant === 'cJ' ? 3400 - sub / 9 * 600
                : 3200 - sub / 9 * 700;
            return shining(temperature, 3000 * mass);
        }
        case SpectralClass.S: return shining(3600 - sub / 9 * 1200, 4000 * mass);
        case SpectralClass.D: case SpectralClass.N: case SpectralClass.X:
            return whiteDwarf(mass, 1);
        default: break;
    }

    const dwarfTemperature = dwarfTemperatureFor(spectralClass, subClass);
    // Young stars first, still settling onto the main sequence
    if (variant === 'protostar') return sized(3600 - sub / 9 * 800, 3 + mass * 3);
    if (variant === 'tTauri') return shining(dwarfTemperature * 0.95, mainSequenceLuminosity(mass) * (3 + 5 * (1 - sub / 9)));
    if (variant === 'herbigAeBe') return shining(dwarfTemperature * 0.97, mainSequenceLuminosity(mass) * 1.6);
    // Old, low-mass giants on the horizontal branch, pulsing
    if (variability === 'rrLyrae') return shining(dwarfTemperature * 0.97, 45);
    // Swollen red giants near the end, pulsing over a year
    if (variability === 'mira') return shining(dwarfTemperature * 0.85, 5000 * Math.pow(mass, 0.8));

    let luminosity, temperature;
    switch (stellarType) {
        case StellarType.VI:
            if (spectralClass === SpectralClass.O || spectralClass === SpectralClass.B) {
                // Hot subdwarfs: helium-burning cores stripped of their envelopes, small and very hot
                const hot = spectralClass === SpectralClass.O ? 80000 - (Math.max(sub, 2) - 2) / 7 * 40000 : 40000 - sub / 9 * 18000;
                return sized(hot, spectralClass === SpectralClass.O ? 0.15 : 0.22);
            }
            luminosity = mainSequenceLuminosity(mass) * 0.4;
            temperature = dwarfTemperature * 1.05;
            break;
        case StellarType.IV:
            luminosity = mainSequenceLuminosity(mass) * 2.5;
            temperature = dwarfTemperature * 0.95;
            break;
        case StellarType.III: case StellarType.II: case StellarType.Ib: case StellarType.Iab: case StellarType.Ia:
        case StellarType.hypergiant: {
            temperature = dwarfTemperature * (dwarfTemperature > 6000 ? 0.92 : 0.9);
            const baseRadius = 15 * Math.pow(solTemperature / temperature, 1.5);
            const classFactor = { [StellarType.II]: 4, [StellarType.Ib]: 8, [StellarType.Iab]: 11, [StellarType.Ia]: 15,
                [StellarType.hypergiant]: 25 }[stellarType] ?? 1;
            const radius = baseRadius * classFactor;
            luminosity = radius * radius * Math.pow(temperature / solTemperature, 4);
            break;
        }
        default:
            // A Be star's disc adds a little light
            luminosity = mainSequenceLuminosity(mass) * (variant === 'be' ? 1.1 : 1);
            temperature = dwarfTemperature;
    }
    return shining(temperature, luminosity);
}

/** A neutron star `age` billion years after its supernova: about 24 km across, cooling from millions of kelvin */
export function neutronStar(mass, age) {
    const d = 24.0 / 1391400;
    const years = Math.max(age, 1e-6) * 1e9;
    const temperature = Math.max(1.2e6 * Math.pow(Math.max(years / 1e4, 1), -0.25), 2e4);
    const luminosity = d * d * Math.pow(temperature / solTemperature, 4);
    return { mass, luminosity, temperature, diameter: d, innerLimitAU: Math.max(innerLimitAU(d, luminosity), 0.01),
        isPostStellar: true };
}

/** A black hole of `mass` Suns: its event horizon 5.9 km across per solar mass, no light of its own */
export function blackHole(mass) {
    const d = 5.9 * mass / 1391400;
    return { mass, luminosity: 1e-9, temperature: 0, diameter: d, innerLimitAU: 0.02 * mass, isPostStellar: true };
}

/** Diameter in solar units from the Stefan–Boltzmann law, L = D² × (T ÷ 5,772)⁴ */
export function diameter(luminosity, temperature) {
    return Math.sqrt(luminosity) * Math.pow(solTemperature / temperature, 2);
}

/** Closest a planet can orbit: outside about twice the star's radius, and outside where its surface would boil off */
export function innerLimitAU(d, luminosity) {
    return Math.max(2 * d * auPerSolarRadius, 0.015 * Math.sqrt(Math.max(luminosity, 0)), 0.0005);
}

function dwarfTemperatureFor(spectralClass, subClass) {
    const classIndex = SpectralClass.O - Math.min(spectralClass, SpectralClass.O);
    const sub = Math.min(Math.max(subClass, 0), 9);
    const position = spectralClass === SpectralClass.M && sub > 5 ? 13 + (sub - 5) / 4 : Math.min(classIndex * 2 + sub / 5, 14);
    const lower = Math.floor(position);
    const upper = Math.min(lower + 1, dwarfTemperatures.length - 1);
    const t = position - lower;
    return dwarfTemperatures[lower] + (dwarfTemperatures[upper] - dwarfTemperatures[lower]) * t;
}

/** A white dwarf that has been cooling for `coolingAge` billion years */
export function whiteDwarf(mass, coolingAge) {
    const ratio = Math.min(Math.max(mass, 0.2), 1.39) / 1.44;
    const radius = 0.0126 * Math.sqrt(Math.max(Math.pow(ratio, -2.0 / 3) - Math.pow(ratio, 2.0 / 3), 0.01));
    const years = Math.max(coolingAge, 0.001) * 1e9;
    const luminosity = Math.pow(years / (8.8e6 * Math.pow(mass, 5.0 / 7)), -1.4);
    const temperature = solTemperature * Math.pow(luminosity / (radius * radius), 0.25);
    const d = radius;
    return { mass, luminosity, temperature, diameter: d, innerLimitAU: innerLimitAU(d, luminosity), isPostStellar: true };
}

/** The mass of the star a white dwarf grew from, by the initial–final mass relation */
export function progenitorMass(whiteDwarfMass) {
    return Math.min(Math.max((whiteDwarfMass - 0.49) / 0.08, 0.9), 8);
}

/** Time a star spends on the main sequence, about 10 billion years × M^-2.5 */
export function mainSequenceLifespan(mass) {
    return 10 / Math.pow(Math.max(mass, 0.01), 2.5);
}
