//
//  travellerData.js
//  Estrelas (web) — Traveller module
//
//  A world as TravellerMap lists it, read from its tab-delimited Second Survey data, and what its codes mean for the
//  core: the principal world's size, air and water, its people and port, its stars, and its system's gas giants and
//  belts. A port of TravellerData.swift.
//
//  Traveller is a registered trademark of Far Future Enterprises. Sector data and world maps come from
//  TravellerMap.com and its contributors, used under FFE's fair use policy.
//

import { rng } from '../gen/random.js';
import { Dice, SpectralClass, StellarType, subclassRange } from '../gen/stellar.js';
import { estimateMass, determineMainSeqType, newStar } from '../gen/systemStars.js';
import { LegacySocial } from '../model/savedData.js';

/** Extended hexadecimal: 0–9, then A–Z without I and O */
export const uwpDigits = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function uwpValue(character) {
    const index = uwpDigits.indexOf(String(character ?? '').toUpperCase());
    return index >= 0 ? index : 0;
}

/** A world's Universal World Profile, e.g. "A788899-C" */
export function parseUWP(text) {
    const c = [...(text ?? '')];
    const code = (index) => (index < c.length ? uwpValue(c[index]) : 0);
    return {
        starport: c[0] ?? 'X',
        // "S" is a small world rather than a digit
        size: c.length > 1 && c[1] === 'S' ? -1 : code(1),
        atmosphere: code(2), hydrographics: code(3), population: code(4), government: code(5), law: code(6),
        techLevel: code(8),
    };
}

/** Column 1–32 and row 1–40 in the sector */
export const worldColumn = (world) => Number.parseInt(world.hex.slice(0, 2), 10) || 0;
export const worldRow = (world) => Number.parseInt(world.hex.slice(2), 10) || 0;
/** Trade and other remarks, e.g. "Ri", "Sa" */
export const remarkCodes = (world) => world.remarks.split(' ').filter(Boolean);

/** Tab-delimited Second Survey data, as TravellerMap's API gives it: one world a hex */
export function parseSecondSurvey(text) {
    const lines = String(text ?? '').split(/\r?\n|\r/).filter((line) => line.length);
    if (!lines.length) return [];
    const header = lines[0].split('\t');
    const column = (name) => header.indexOf(name);
    const worlds = [];
    for (const line of lines.slice(1)) {
        const fields = line.split('\t');
        const field = (name) => {
            const index = column(name);
            return index >= 0 && index < fields.length ? fields[index].trim() : '';
        };
        const hex = field('Hex');
        if (hex.length !== 4) continue;
        worlds.push({ hex, name: field('Name'), uwp: field('UWP'), bases: field('Bases'), remarks: field('Remarks'),
            zone: field('Zone'), pbg: field('PBG'), allegiance: field('Allegiance'), stars: field('Stars'),
            subsector: field('SS'), importance: field('{Ix}'), economics: field('(Ex)'), culture: field('[Cx]'),
            nobility: field('Nobility'), worlds: field('W') });
    }
    return worlds;
}

export const worldFields = ['hex', 'name', 'uwp', 'bases', 'remarks', 'zone', 'pbg', 'allegiance', 'stars', 'subsector',
    'importance', 'economics', 'culture', 'nobility', 'worlds'];
export const sameWorld = (a, b) => worldFields.every((key) => a[key] === b[key]);

// MARK: what the codes mean

/** The atmosphere codes as gases, pressure and whether the air is tainted */
export function air(code) {
    switch (code) {
        case 0: return ['none', 0, false];
        case 1: return ['trace', 0.005, false];
        case 2: return ['nitrogenOxygen', 0.2, true];
        case 3: return ['nitrogenOxygen', 0.25, false];
        case 4: return ['nitrogenOxygen', 0.55, true];
        case 5: return ['nitrogenOxygen', 0.6, false];
        case 6: return ['nitrogenOxygen', 1, false];
        case 7: return ['nitrogenOxygen', 1, true];
        case 8: return ['nitrogenOxygen', 1.8, false];
        case 9: return ['nitrogenOxygen', 1.8, true];
        // Exotic: unbreathable but otherwise harmless
        case 10: return ['nitrogen', 1.2, false];
        // Corrosive
        case 11: return ['carbonDioxide', 12, true];
        // Insidious
        case 12: return ['sulfuric', 60, true];
        // Dense, breathable only on high ground
        case 13: return ['nitrogenOxygen', 3, false];
        // Thin, breathable only in lowlands
        case 14: return ['nitrogenOxygen', 0.4, false];
        default: return ['methane', 1.5, true];
    }
}

/** The principal world's size, air and water, and the system's gas giants and belts (see principalWorld.js) */
export function requirementsFor(world) {
    const uwp = parseUWP(world.uwp);
    const pbg = [...world.pbg];
    const belts = pbg.length > 1 ? uwpValue(pbg[1]) : null;
    const giants = pbg.length > 2 ? uwpValue(pbg[2]) : null;
    // Size 0 is a belt; "S" a small body; otherwise 1,600 km of diameter a step
    const radiusKm = uwp.size === 0 ? 0 : (uwp.size < 0 ? 300 : uwp.size * 800);
    const [atmosphere, pressureBar, contaminated] = air(uwp.atmosphere);
    const waterPercent = uwp.size === 0 ? 0 : Math.min(uwp.hydrographics, 10) * 10;
    return { radiusKm, atmosphere, pressureBar, contaminated, waterPercent, isMoon: remarkCodes(world).includes('Sa'),
        gasGiants: giants, belts: belts === null ? null : Math.max(belts - (uwp.size === 0 ? 1 : 0), 0) };
}

const any = (text, letters) => [...text].some((c) => letters.includes(c));

/** What's known of the people: their number, era, government, arms laws, port and bases, and any zone */
export function societyFor(world) {
    const uwp = parseUWP(world.uwp);
    const multiplier = world.pbg.length ? Math.max(uwpValue(world.pbg[0]), 1) : 1;
    const population = uwp.population === 0 ? 0 : multiplier * LegacySocial.population(uwp.population);
    const advisory = world.zone === 'A' ? 'essentialOnly' : world.zone === 'R' ? 'noTravel' : null;
    return {
        population, techEra: LegacySocial.techEra(uwp.techLevel),
        governmentForm: population > 0 ? LegacySocial.governmentForm(uwp.government) : null, regime: null,
        armsControl: population > 0 ? LegacySocial.armsControl(uwp.law) : null,
        portTier: LegacySocial.portTier(String(uwp.starport)),
        orbitalStation: uwp.starport === 'A' || uwp.starport === 'B',
        // Naval, military, depots and other forces' bases
        militaryBase: any(world.bases, 'NKMDCT'),
        // Survey bases and way stations
        researchStation: any(world.bases, 'SWX'),
        advisory,
    };
}

const ordinaryClasses = { O: SpectralClass.O, B: SpectralClass.B, A: SpectralClass.A, F: SpectralClass.F, G: SpectralClass.G,
    K: SpectralClass.K, M: SpectralClass.M };
const luminosities = { Ia: StellarType.Ia, Iab: StellarType.Iab, Ib: StellarType.Ib, II: StellarType.II, III: StellarType.III,
    IV: StellarType.IV, V: StellarType.V, VI: StellarType.VI };

const randomSubclass = (spectralClass) => {
    const [lower, upper] = subclassRange(spectralClass);
    return rng.int(lower, upper);
};

/**
 * The stars listed, e.g. "G2 V M1 V", "K9 III D", "BD", in their generation form; an empty list gets one ordinary star
 * rolled for it
 */
export function starsFor(world, systemID) {
    const stars = [];
    const tokens = world.stars.split(' ').filter(Boolean);
    while (tokens.length) {
        const token = tokens.shift();
        const star = newStar();
        star.systemID = systemID;
        if (token === 'BD') {
            star.spectralClass = Dice.weighted([[SpectralClass.L, 0.45], [SpectralClass.T, 0.45], [SpectralClass.Y, 0.1]]);
            star.subClass = randomSubclass(star.spectralClass);
            star.stellarType = StellarType.V;
        } else if (token.startsWith('D')) {
            star.spectralClass = SpectralClass.D;
            star.stellarType = StellarType.d;
            star.subClass = 5;
        } else if (ordinaryClasses[token[0]] !== undefined) {
            const spectralClass = ordinaryClasses[token[0]];
            star.spectralClass = spectralClass;
            const digit = Number.parseInt(token.slice(1, 2), 10);
            star.subClass = Number.isFinite(digit) ? Math.min(Math.max(digit, subclassRange(spectralClass)[0]), 9) : 5;
            // The luminosity class that follows, if any
            if (tokens.length && luminosities[tokens[0]] !== undefined) star.stellarType = luminosities[tokens.shift()];
            else star.stellarType = StellarType.V;
        } else {
            continue;
        }
        star.mass = estimateMass(star);
        stars.push(star);
    }
    if (!stars.length) {
        const star = newStar();
        star.systemID = systemID;
        star.stellarType = StellarType.V;
        star.spectralClass = determineMainSeqType();
        star.subClass = randomSubclass(star.spectralClass);
        star.mass = estimateMass(star);
        stars.push(star);
    }
    stars.forEach((star, index) => { star.id = `${systemID}-${index}`; });
    return stars;
}

/** An Imperial express boat route: those of no other polity, unless they're marked as something else */
export function isXboat(route) {
    if (route.type) return route.type.toLowerCase() === 'xboat';
    return route.allegiance ? route.allegiance.startsWith('Im') : true;
}
