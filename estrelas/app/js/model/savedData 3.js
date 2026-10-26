//
//  savedData.js
//  Estrelas (web)
//
//  The JSON documents a universe is made of (see SAVED_DATA_FORMAT.md in the macOS project), written the way the
//  macOS app writes them: sorted keys, missing values left out, ISO 8601 dates without fractions (which the Mac's
//  decoder requires), non-finite numbers as strings, and single-precision values in their shortest form.
//

import { upgradePlanetarySystem, legacyAtmosphere } from './planetarySystem.js';

/**
 * Bumped whenever a document's layout changes in a way older readers can't handle. Version 2 described worlds in
 * physical units and societies with real-world measures; version 3 ran longitudes east on the globe (places saved
 * before then are mirrored to stay where they were). Earlier files are converted when they're opened.
 */
export const version = 3;

export const Format = {
    universe: 'estrelas.universe',
    starField: 'estrelas.starfield',
    globe: 'estrelas.globe',
    topology: 'estrelas.icosphere',
    surfaceImage: 'estrelas.surfaceImage',
    advisories: 'estrelas.advisories',
    annotations: 'estrelas.annotations',
    playerUniverse: 'estrelas.player-universe',
};

/** Marks a number to be written as a single-precision float */
export class F32 {
    constructor(value) {
        this.value = value;
    }
}

/** Shortest decimal that reads back as the same single-precision value */
export function float32String(value) {
    const f = Math.fround(value);
    if (!Number.isFinite(f)) return JSON.stringify(nonFinite(f));
    if (Number.isInteger(f) && Math.abs(f) < 2 ** 24) return String(f);
    for (let precision = 1; precision <= 9; precision++) {
        let text = f.toPrecision(precision);
        if (Math.fround(Number(text)) !== f) continue;
        // toPrecision rounds a tie up; Swift picks the even digit, as it should when the value lies exactly halfway
        const exact = f.toPrecision(100).replace(/0+(e|$)/, '$1');
        const digits = exact.replace(/^-/, '').replace(/e.*$/, '').replace('.', '').replace(/^0+/, '');
        if (digits.length === precision + 1 && digits.endsWith('5')) {
            const truncated = f.toPrecision(precision + 1).replace(/5(e|$)/, '$1');
            const lastDigit = Number(truncated.replace(/e.*$/, '').replace(/\D/g, '').slice(-1));
            const candidate = Number(truncated);
            if (lastDigit % 2 === 0 && Math.fround(candidate) === f) text = truncated;
        }
        const shortest = Number(text);
        return swiftStyle(f, String(shortest), shortest.toExponential(), 2 ** 24);
    }
    return String(f);
}

function nonFinite(value) {
    if (Number.isNaN(value)) return 'NaN';
    return value > 0 ? 'Infinity' : '-Infinity';
}

function numberString(value) {
    return Number.isFinite(value) ? swiftStyle(value, String(value), value.toExponential(), 2 ** 53) : JSON.stringify(nonFinite(value));
}

/**
 * Foundation writes numbers below 0.0001, and at or beyond the precision limit (2⁵³, or 2²⁴ in single precision), in
 * exponent form with at least two exponent digits ("8.7e-05"); everything else in plain decimal
 */
function swiftStyle(value, plain, exponential, limit) {
    const magnitude = Math.abs(value);
    if (magnitude === 0 || (magnitude >= 0.0001 && magnitude < limit)) return plain;
    return exponential.replace(/e([+-])(\d)$/, 'e$10$2');
}

/** JSON text in the macOS app's style: sorted keys, and with `pretty`, its indentation and `"key" : value` */
export function encodeJSON(value, pretty = false) {
    const parts = [];
    const write = (v, indent) => {
        if (v instanceof F32) {
            parts.push(float32String(v.value));
        } else if (v instanceof Float32Array) {
            writeArray(Array.from(v, (x) => new F32(x)), indent);
        } else if (ArrayBuffer.isView(v)) {
            writeArray(Array.from(v), indent);
        } else if (Array.isArray(v)) {
            writeArray(v, indent);
        } else if (v === null) {
            parts.push('null');
        } else if (typeof v === 'number') {
            parts.push(numberString(v));
        } else if (typeof v === 'bigint') {
            parts.push(v.toString());
        } else if (typeof v === 'string' || typeof v === 'boolean') {
            parts.push(JSON.stringify(v));
        } else if (typeof v === 'object') {
            const keys = Object.keys(v).filter((k) => v[k] !== undefined && typeof v[k] !== 'function').sort(compareKeys);
            if (keys.length === 0) {
                parts.push(pretty ? '{\n\n' + ' '.repeat(indent) + '}' : '{}');
                return;
            }
            parts.push('{');
            keys.forEach((key, i) => {
                if (pretty) parts.push('\n' + ' '.repeat(indent + 2));
                parts.push(JSON.stringify(key), pretty ? ' : ' : ':');
                write(v[key], indent + 2);
                if (i < keys.length - 1) parts.push(',');
            });
            parts.push(pretty ? '\n' + ' '.repeat(indent) + '}' : '}');
        }
    };
    const writeArray = (array, indent) => {
        if (array.length === 0) {
            parts.push(pretty ? '[\n\n' + ' '.repeat(indent) + ']' : '[]');
            return;
        }
        parts.push('[');
        array.forEach((item, i) => {
            if (pretty) parts.push('\n' + ' '.repeat(indent + 2));
            write(item === undefined ? null : item, indent + 2);
            if (i < array.length - 1) parts.push(',');
        });
        parts.push(pretty ? '\n' + ' '.repeat(indent) + ']' : ']');
    };
    write(value, 0);
    return parts.join('');
}

/** Foundation sorts keys by their UTF-16 code units, as JavaScript's default comparison does */
function compareKeys(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}

/** Parses a saved document, turning "Infinity", "-Infinity" and "NaN" strings back into numbers */
export function parseJSON(text) {
    // Nebula seeds are 64-bit integers, past what a double holds exactly; they're read as BigInts
    if (text.includes('"seed"')) {
        text = text.replace(/("seed"\s*:\s*)(\d{16,})/g, (match, key, digits) =>
            (BigInt(digits) > 9007199254740991n ? `${key}"@@bigint:${digits}"` : match));
    }
    return JSON.parse(text, (key, value) => {
        if (typeof value === 'string' && value.startsWith('@@bigint:')) return BigInt(value.slice(9));
        if (value === 'Infinity') return Infinity;
        if (value === '-Infinity') return -Infinity;
        if (value === 'NaN') return NaN;
        return value;
    });
}

/** ISO 8601 without fractional seconds, e.g. "2026-10-06T17:04:15Z" */
export function isoDate(date = new Date()) {
    return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/** Checks a document's format and version */
export function check(document, format) {
    if (!document || typeof document !== 'object') throw new Error('Not a JSON object');
    if (document.format !== undefined && document.format !== format) throw new Error(`Expected ${format}, found ${document.format}`);
    if (typeof document.version === 'number' && document.version > version) {
        throw new Error(`${format} version ${document.version} is newer than this app understands`);
    }
    return document;
}

// MARK: paths

export const manifestPath = 'universe.json';
export const starFieldPath = 'starfield.json';
export const advisoriesPath = 'advisories.json';
/** The file earlier versions kept advisories in, read once to convert it */
export const legacyAdvisoriesPath = 'travelzones.json';

export function sectorPath(sector) {
    return `sectors/sector_${sector.x}_${sector.y}_${sector.z}.json`;
}

export function annotationsPath(systemID) {
    return `annotations/${systemID}.json`;
}

/** Designations become file-safe by replacing anything other than ASCII letters and digits with "_" */
export function surfacePath(systemID, world, artifact) {
    const safe = Array.from(world, (ch) => (/^[A-Za-z0-9]$/.test(ch) ? ch : '_')).join('');
    return `surfaces/${systemID}/${safe}-${artifact}.json`;
}

export function topologyPath(subdivisions) {
    return `surfaces/topology/icosphere-${subdivisions}.json`;
}

// MARK: star field

/** A star field read from disk, tidied for the app: positions as arrays, class names as letters */
export function normalizeStarField(document) {
    check(document, Format.starField);
    let converted = false;
    const letters = { 3: 'D', 4: 'M', 5: 'K', 6: 'G', 7: 'F', 8: 'A', 9: 'B', 10: 'O', 11: 'L', 12: 'T', 13: 'Y', 14: 'W',
        15: 'C', 16: 'S', 17: 'NS', 18: 'BH' };
    const types = { 1: 'd', 2: 'VI', 3: 'V', 4: 'IV', 5: 'III', 6: 'II', 7: 'Ib', 8: 'Ia', 9: 'Iab', 10: 'Ia+', 11: 'remnant' };
    for (const system of document.systems ?? []) {
        system.position = Array.isArray(system.position) ? system.position : [0, 0, 0];
        system.stars = system.stars ?? [];
        for (const star of system.stars) {
            if (typeof star.spectralClass === 'number') star.spectralClass = letters[star.spectralClass];
            if (typeof star.stellarType === 'number') star.stellarType = types[star.stellarType];
        }
        if (upgradePlanetarySystem(system.planetarySystem)) converted = true;
    }
    document.systems = document.systems ?? [];
    for (const nebula of document.nebulae ?? []) {
        nebula.position = Array.isArray(nebula.position) ? nebula.position : [0, 0, 0];
        if (typeof nebula.seed === 'number') nebula.seed = BigInt(nebula.seed);
    }
    // Not saved: whether worlds were converted from an earlier layout as they were read
    Object.defineProperty(document, 'converted', { value: converted, enumerable: false, writable: true });
    return document;
}

/** The star field document as saved: positions in single precision. `sector` only in a sector's own file. */
export function starFieldDocument(systems, seed, halfLength, sector, distanceUnit = 'parsec', nebulae = undefined,
    nebulaVersion = undefined) {
    return {
        format: Format.starField, version, createdAt: isoDate(), seed, halfLength, distanceUnit, sector,
        systems: systems.map((system) => ({ ...system, position: Float32Array.from(system.position) })),
        nebulae: nebulae?.map(savedNebula), nebulaVersion,
    };
}

/** A nebula as saved: its position in single precision */
function savedNebula(nebula) {
    return { ...nebula, position: Float32Array.from(nebula.position), radius: new F32(nebula.radius) };
}

/** Whether a star field's or sector's nebulae are missing, or were placed by earlier rules */
export function needsNebulae(document, currentVersion) {
    return document.nebulae == null || (document.nebulaVersion ?? 1) < currentVersion;
}

/** The star field document as it goes back to disk after being read and changed */
export function savedStarFieldDocument(document) {
    const letters = { D: 'D', M: 'M', K: 'K', G: 'G', F: 'F', A: 'A', B: 'B', O: 'O' };
    return {
        ...document,
        systems: document.systems.map((system) => ({
            ...system, position: Float32Array.from(system.position),
            stars: system.stars.map((star) => ({ ...star, spectralClass: letters[star.spectralClass] ?? star.spectralClass })),
        })),
        nebulae: document.nebulae?.map(savedNebula),
    };
}

export const parsecsPerLightYear = 1 / 3.261563777;

/** Parsecs per scene unit, for jump distances: the app's own universes are in parsecs, catalogues in light-years */
export function parsecsPerUnit(document, appHalfLength = 10) {
    const generated = document.seed != null || document.halfLength === appHalfLength;
    const unit = document.distanceUnit ?? (generated ? 'parsec' : 'lightYear');
    return unit === 'lightYear' ? Math.fround(parsecsPerLightYear) : 1;
}

/** Whether the universe goes on past this star field in generated sectors: only the app's own universes do */
export function isSectored(document, appHalfLength = 10) {
    return document.seed != null && document.halfLength === appHalfLength && parsecsPerUnit(document, appHalfLength) === 1;
}

// MARK: travel advisories and annotations

export function advisoriesDocument(advisories) {
    return { format: Format.advisories, version, advisories };
}

/** A system's annotations as saved: `worlds` always present, the rest only when set */
export function emptyAnnotations(systemID) {
    return { format: Format.annotations, version, systemID, worlds: {} };
}

const noteIsEmpty = (note) => !note || note.text.trim().length === 0;
const nameIsEmpty = (name) => name == null || name === '';

export function subjectIsEmpty(subject) {
    return !subject || (nameIsEmpty(subject.name) && noteIsEmpty(subject.note));
}

export const overrideKeys = ['radiusKm', 'massEarths', 'atmosphere', 'pressureBar', 'waterPercent', 'headcount',
    'governmentForm', 'regime', 'armsControl', 'techEra'];

/** How settlements' city maps are built (CityStyle): each value left out is chosen automatically */
export const architectureStyles = ['arid', 'temperate', 'cold', 'tropical'];
export const architectureNames = { arid: 'Arid', temperate: 'Temperate', cold: 'Cold', tropical: 'Tropical' };
export const architectureSummaries = {
    arid: 'Flat roofs, thick pale walls, shaded courtyards and narrow lanes',
    temperate: 'Pitched tile and slate roofs, brick, stone and render',
    cold: 'Steep roofs, dark timber and stone, conifers',
    tropical: 'Light walls, broad low roofs with deep eaves, lush planting',
};
export const streetLayouts = ['organic', 'grid', 'radial', 'grand'];
export const streetLayoutNames = { organic: 'Organic', grid: 'Grid', radial: 'Radial', grand: 'Grand plan' };
export const harmonies = ['uniform', 'balanced', 'eclectic'];
export const harmonyNames = { uniform: 'Uniform', balanced: 'Balanced', eclectic: 'Eclectic' };

export function cityStyleIsEmpty(style) {
    return !style || (style.architecture == null && style.layout == null && style.harmony == null);
}

/** A settlement's style with each value it leaves out taken from its world's */
export function filledCityStyle(style, fallback) {
    return { architecture: style?.architecture ?? fallback?.architecture, layout: style?.layout ?? fallback?.layout,
        harmony: style?.harmony ?? fallback?.harmony };
}

export function overridesAreEmpty(overrides) {
    return !overrides || overrideKeys.every((key) => overrides[key] == null);
}

export function portIsEmpty(port) {
    return !port || (port.tier == null && port.orbitalStation == null && port.militaryBase == null &&
        port.researchStation == null);
}

export function worldAnnotationsAreEmpty(world) {
    return !world || ((world.places ?? []).length === 0 && portIsEmpty(world.port) && nameIsEmpty(world.name) &&
        noteIsEmpty(world.note) && overridesAreEmpty(world.overrides) && cityStyleIsEmpty(world.cityStyle));
}

/**
 * Whether anything in the system has notes that can be seen here: the system, a star, a world or moon, or a place on
 * one. `canSee` decides, so in the players' edition only shared notes count.
 */
export function hasVisibleNotes(document, canSee) {
    if (!document) return false;
    if (canSee(document.system?.note)) return true;
    if (Object.values(document.stars ?? {}).some((star) => canSee(star.note))) return true;
    return Object.values(document.worlds ?? {}).some((world) => canSee(world.note) ||
        (world.places ?? []).some((place) => canSee(place.notes != null ? { text: place.notes, shared: place.notesShared } : null)));
}

export function annotationsAreEmpty(document) {
    return subjectIsEmpty(document.system) && Object.values(document.stars ?? {}).every(subjectIsEmpty) &&
        Object.values(document.worlds ?? {}).every(worldAnnotationsAreEmpty);
}

/**
 * Tidies a read annotations document into its saved, current shape: hand-set values from earlier versions converted,
 * and (before version 3, when maps ran longitudes the other way) places mirrored so they stay on the same ground
 */
export function normalizeAnnotations(document) {
    const documentVersion = document.version ?? version;
    const normalized = { format: Format.annotations, version, systemID: document.systemID, system: document.system,
        stars: document.stars, worlds: {} };
    for (const [designation, world] of Object.entries(document.worlds ?? {})) {
        const places = (world.places ?? []).map((place) => {
            const result = { ...place, kind: placeKind(place.kind, documentVersion) };
            if (documentVersion < 3) {
                const mirrored = (360 - place.longitude) % 360;
                result.longitude = mirrored < 0 ? mirrored + 360 : mirrored;
            }
            if (result.kind !== 'landmark') delete result.landmarkType;
            return result;
        });
        const entry = { ...world, places, overrides: upgradeOverrides(world.overrides), port: upgradePort(world.port) };
        if (!entry.overrides) delete entry.overrides;
        if (!entry.port) delete entry.port;
        normalized.worlds[designation] = entry;
    }
    return normalized;
}

/** Earlier versions had a larger and a smaller kind of port under other names */
function placeKind(raw, documentVersion) {
    if (documentVersion < 3) {
        if (raw === 'starport') return 'spaceport';
        if (raw === 'spaceport') return 'landingPad';
    }
    if (raw === 'starport') return 'spaceport';
    return placeKinds.includes(raw) ? raw : 'landmark';
}

const legacyGovernmentForms = ['stateless', 'charteredCompany', 'directDemocracy', 'oligarchy', 'parliamentaryRepublic',
    'technocracy', 'administeredTerritory', 'presidentialRepublic', 'technocracy', 'oligarchy', 'personalistDictatorship',
    'militaryJunta', 'oneParty', 'theocracy', 'theocracy', 'oneParty'];

function legacyArmsControl(code) {
    if (code <= 0) return 'unrestricted';
    if (code <= 3) return 'permissive';
    if (code <= 6) return 'licensed';
    if (code <= 8) return 'restrictive';
    return 'prohibited';
}

function legacyTechEra(code) {
    const eras = ['stoneAge', 'bronzeIron', 'medieval', 'earlyModern', 'industrial', 'electrical', 'atomic', 'information'];
    if (code <= 0) return 'stoneAge';
    if (code <= 7) return eras[code];
    return code <= 11 ? 'interplanetary' : 'interstellar';
}

function legacyPortTier(grade) {
    switch (grade) {
        case 'A': return 'hub';
        case 'B': return 'international';
        case 'C': case 'F': return 'regional';
        case 'D': case 'E': case 'G': case 'H': return 'landingField';
        default: return 'none';
    }
}

/** Hand-set world data in the current keys, converting the integer codes earlier versions stored */
function upgradeOverrides(overrides) {
    if (!overrides) return undefined;
    const result = {
        radiusKm: overrides.radiusKm ?? (overrides.size != null ? (overrides.size < 0 ? 300 : overrides.size * 800) : undefined),
        massEarths: overrides.massEarths,
        pressureBar: overrides.pressureBar,
        atmosphere: typeof overrides.atmosphere === 'string' ? overrides.atmosphere
            : typeof overrides.atmosphere === 'number' ? legacyAtmosphere(overrides.atmosphere)[0] : undefined,
        waterPercent: overrides.waterPercent ??
            (overrides.hydrographics != null ? Math.min(Math.max(overrides.hydrographics, 0), 10) * 10 : undefined),
        governmentForm: overrides.governmentForm ?? (overrides.government != null
            ? legacyGovernmentForms[overrides.government] ?? 'oligarchy' : undefined),
        regime: overrides.regime,
        armsControl: overrides.armsControl ?? (overrides.lawLevel != null ? legacyArmsControl(overrides.lawLevel) : undefined),
        techEra: overrides.techEra ?? (overrides.techLevel != null ? legacyTechEra(overrides.techLevel) : undefined),
        headcount: overrides.headcount ?? (overrides.population != null
            ? (overrides.population <= 0 ? 0 : Math.trunc(Math.pow(10, Math.min(overrides.population, 15)))) : undefined),
    };
    return overridesAreEmpty(result) ? undefined : result;
}

/** A hand-set port in the current keys, converting the letter grades earlier versions stored */
function upgradePort(port) {
    if (!port) return undefined;
    const result = {
        tier: port.tier ?? (port.starport != null ? legacyPortTier(port.starport) : undefined),
        orbitalStation: port.orbitalStation ?? (port.highport != null ? port.highport !== '' : undefined),
        militaryBase: port.militaryBase ?? port.navalBase,
        researchStation: port.researchStation ?? port.scoutBase,
    };
    return portIsEmpty(result) ? undefined : result;
}

/** What players may see: everything but the notes the GM hasn't shared */
export function annotationsForPlayers(document) {
    const shared = (note) => (note?.shared === true ? note : undefined);
    const result = structuredClone(document);
    if (result.system) {
        result.system.note = shared(result.system.note);
        if (subjectIsEmpty(result.system)) result.system = undefined;
    }
    if (result.stars) {
        const visible = {};
        for (const [id, star] of Object.entries(result.stars)) {
            star.note = shared(star.note);
            if (!subjectIsEmpty(star)) visible[id] = star;
        }
        result.stars = Object.keys(visible).length ? visible : undefined;
    }
    const worlds = {};
    for (const [designation, world] of Object.entries(result.worlds ?? {})) {
        world.note = shared(world.note);
        world.places = (world.places ?? []).map((place) => {
            if (place.notesShared !== true) return { ...place, notes: undefined, notesShared: undefined };
            return place;
        });
        if (!worldAnnotationsAreEmpty(world)) worlds[designation] = world;
    }
    result.worlds = worlds;
    return result;
}

/** A world or moon as the GM has it: data and port set by hand in place of the generated values */
export function applyingAnnotations(body, annotations) {
    if (!annotations) return body;
    const result = { ...body };
    const overrides = annotations.overrides;
    if (overrides) {
        if (overrides.radiusKm != null) result.radiusKm = overrides.radiusKm;
        if (overrides.massEarths != null) {
            result.massEarths = overrides.massEarths;
            if (result.gasGiant && body.type) result.gasGiant = { ...result.gasGiant, massEarths: overrides.massEarths };
        }
        if (result.environment) {
            result.environment = { ...result.environment };
            if (overrides.atmosphere != null) result.environment.atmosphere = overrides.atmosphere;
            if (overrides.waterPercent != null) result.environment.waterPercent = overrides.waterPercent;
            if (overrides.pressureBar != null) result.environment.pressureBar = overrides.pressureBar;
        }
        if (result.social) {
            result.social = { ...result.social };
            if (overrides.headcount != null) result.social.population = overrides.headcount;
            if (overrides.techEra != null) result.social.techEra = overrides.techEra;
            if ((overrides.governmentForm != null || overrides.regime != null) && result.social.government) {
                result.social.government = { ...result.social.government };
                if (overrides.governmentForm != null) result.social.government.form = overrides.governmentForm;
                if (overrides.regime != null) result.social.government.regime = overrides.regime;
            }
            if (overrides.armsControl != null && result.social.rights) {
                result.social.rights = { ...result.social.rights, armsControl: overrides.armsControl };
            }
        }
    }
    const port = annotations.port;
    if (port && result.social) {
        result.social = { ...result.social, port: { ...result.social.port } };
        if (port.tier != null) result.social.port.tier = port.tier;
        if (port.orbitalStation != null) result.social.port.orbitalStation = port.orbitalStation;
        if (port.militaryBase != null) result.social.port.militaryBase = port.militaryBase;
        if (port.researchStation != null) result.social.port.researchStation = port.researchStation;
    }
    return result;
}

/** Names given by hand, or the generated ones */
export function systemName(annotations, generated) {
    const name = annotations?.system?.name;
    return name ? name : generated;
}

export function starName(annotations, id, generated) {
    const name = annotations?.stars?.[id]?.name;
    return name ? name : generated;
}

export function worldName(annotations, designation) {
    const name = annotations?.worlds?.[designation]?.name;
    return name ? name : designation;
}

export const placeKinds = ['capital', 'city', 'town', 'village', 'spaceport', 'landingPad', 'base', 'outpost', 'landmark'];
export const landmarkTypes = ['mountain', 'volcano', 'crater', 'canyon', 'lake', 'sea', 'river', 'waterfall', 'forest',
    'desert', 'plain', 'glacier', 'island', 'cave', 'ruins', 'monument', 'other'];

/** Converts the integer and letter codes earlier versions saved hand-set values in, as Traveller codes are read too */
export const LegacySocial = {
    governmentForm: (code) => legacyGovernmentForms[code] ?? 'oligarchy',
    armsControl: legacyArmsControl,
    techEra: legacyTechEra,
    /** An order of magnitude as a headcount */
    population: (code) => (code <= 0 ? 0 : Math.trunc(Math.pow(10, Math.min(code, 15)))),
    portTier: legacyPortTier,
};
