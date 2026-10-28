//
//  srd.js
//  Estrelas (web) — Traveller module
//
//  World data in the terms of the Traveller System Reference Document (traveller-srd.com) only, when the "Traveller
//  SRD compatible world data" setting is on: the Universal World Profile's codes (starport, size, atmosphere,
//  hydrographics, population, government, law level, tech level), the SRD's temperature bands, bases, trade codes and
//  travel zones. Nothing from the World Builder's Handbook. The generator is unchanged; what it made is read into
//  those codes, and the data sheets show them in place of the physical figures and almanac profile.
//
//  For a principal world on a Traveller hex map, the codes TravellerMap lists are used as they are.
//

import { t } from '../ui/i18n.js';
import * as Settings from '../ui/settings.js';
import { parseUWP, uwpDigits } from './travellerData.js';

/** Whether data sheets show SRD-compatible values only */
export const isSRD = () => Settings.get('srdCompatible') === true;

const digit = (value) => uwpDigits[Math.min(Math.max(Math.trunc(value), 0), uwpDigits.length - 1)];
const clamp = (value, lower, upper) => Math.min(Math.max(value, lower), upper);

// MARK: the SRD's tables

/** Size: diameter in km and surface gravity in g, by code */
const sizes = [[800, 0], [1600, 0.05], [3200, 0.15], [4800, 0.25], [6400, 0.35], [8000, 0.45], [9600, 0.7], [11200, 0.9],
    [12800, 1], [14400, 1.25], [16000, 1.4]];

const atmosphereNames = ['None', 'Trace', 'Very thin, tainted', 'Very thin', 'Thin, tainted', 'Thin', 'Standard',
    'Standard, tainted', 'Dense', 'Dense, tainted', 'Exotic', 'Corrosive', 'Insidious', 'Very dense', 'Low', 'Unusual'];

const hydrographicsNames = ['Desert world (0–5%)', 'Dry world (6–15%)', 'A few small seas (16–25%)',
    'Small seas and oceans (26–35%)', 'Wet world (36–45%)', 'Large oceans (46–55%)', 'Large oceans (56–65%)',
    'Earth-like world (66–75%)', 'Water world (76–85%)', 'Only a few small islands (86–95%)', 'Almost entirely water (96–100%)'];

const populationNames = ['None', 'Few', 'Hundreds', 'Thousands', 'Tens of thousands', 'Hundreds of thousands', 'Millions',
    'Tens of millions', 'Hundreds of millions', 'Billions', 'Tens of billions', 'Hundreds of billions', 'Trillions'];

const governmentNames = ['None', 'Company/Corporation', 'Participating Democracy', 'Self-Perpetuating Oligarchy',
    'Representative Democracy', 'Feudal Technocracy', 'Captive Government', 'Balkanisation', 'Civil Service Bureaucracy',
    'Impersonal Bureaucracy', 'Charismatic Dictator', 'Non-Charismatic Leader', 'Charismatic Oligarchy', 'Religious Dictatorship'];

/** The weapons each law level bans, on top of those below it */
const lawNames = ['No restrictions', 'Poison gas, explosives, undetectable weapons, weapons of mass destruction',
    'Portable energy weapons', 'Heavy weapons', 'Light assault weapons and submachine guns', 'Personal concealable weapons',
    'All firearms except shotguns and stunners', 'Shotguns', 'All bladed weapons, stunners', 'Any weapons'];

const starportNames = { A: 'Excellent', B: 'Good', C: 'Routine', D: 'Poor', E: 'Frontier', X: 'No starport' };

const baseNames = { N: 'Naval base', S: 'Scout base', R: 'Research base', T: 'TAS hostel', I: 'Imperial consulate', P: 'Pirate base' };

/** The SRD's trade codes, and what each needs of the profile */
const tradeCodes = [
    ['Ag', 'Agricultural', (p) => between(p.atmosphere, 4, 9) && between(p.hydrographics, 4, 8) && between(p.population, 5, 7)],
    ['As', 'Asteroid', (p) => p.size === 0 && p.atmosphere === 0 && p.hydrographics === 0],
    ['Ba', 'Barren', (p) => p.population === 0 && p.government === 0 && p.law === 0],
    ['De', 'Desert', (p) => p.atmosphere >= 2 && p.hydrographics === 0],
    ['Fl', 'Fluid Oceans', (p) => p.atmosphere >= 10 && p.hydrographics >= 1],
    ['Ga', 'Garden', (p) => p.size >= 5 && between(p.atmosphere, 4, 9) && between(p.hydrographics, 4, 8)],
    ['Hi', 'High Population', (p) => p.population >= 9],
    ['Ht', 'High Tech', (p) => p.techLevel >= 12],
    ['IC', 'Ice-Capped', (p) => p.atmosphere <= 1 && p.hydrographics >= 1],
    ['In', 'Industrial', (p) => [0, 1, 2, 4, 7, 9].includes(p.atmosphere) && p.population >= 9],
    ['Lo', 'Low Population', (p) => between(p.population, 1, 3)],
    ['Lt', 'Low Tech', (p) => p.population > 0 && p.techLevel <= 5],
    ['Na', 'Non-Agricultural', (p) => p.atmosphere <= 3 && p.hydrographics <= 3 && p.population >= 6],
    ['NI', 'Non-Industrial', (p) => between(p.population, 4, 6)],
    ['Po', 'Poor', (p) => between(p.atmosphere, 2, 5) && p.hydrographics <= 3],
    ['Ri', 'Rich', (p) => [6, 8].includes(p.atmosphere) && between(p.population, 6, 8)],
    ['Wa', 'Water World', (p) => p.hydrographics === 10],
    ['Va', 'Vacuum', (p) => p.atmosphere === 0],
];
const between = (value, lower, upper) => value >= lower && value <= upper;

// MARK: reading the generated world into codes

/** Size code from a body: 0 for belts and bodies under 800 km across */
export function sizeCode(body) {
    if (body.type === 'asteroidBelt' || body.isBelt) return 0;
    return clamp(Math.round(2 * (body.radiusKm ?? 0) / 1600), 0, 10);
}

/** Atmosphere code from an environment */
export function atmosphereCode(environment) {
    if (!environment) return 0;
    const { atmosphere, pressureBar, contaminated } = environment;
    if (atmosphere === 'none') return 0;
    if (atmosphere === 'trace' || pressureBar < 0.1) return 1;
    if (atmosphere === 'nitrogenOxygen') {
        if (pressureBar <= 0.42) return contaminated ? 2 : 3;
        if (pressureBar <= 0.7) return contaminated ? 4 : 5;
        if (pressureBar < 1.5) return contaminated ? 7 : 6;
        if (pressureBar < 2.5) return contaminated ? 9 : 8;
        return 13;
    }
    if (atmosphere === 'sulfuric') return 12;
    if (atmosphere === 'carbonDioxide') return pressureBar >= 5 ? 11 : 10;
    if (atmosphere === 'hydrogen') return 12;
    return 10;
}

/** Hydrographics code from the share of the surface under water: each code ten percent, 0–5% a desert */
export function hydrographicsCode(environment, size) {
    if (!environment || size === 0) return 0;
    return clamp(Math.floor((environment.waterPercent + 4) / 10), 0, 10);
}

/** The SRD's temperature bands by mean surface temperature */
export function temperatureName(environment) {
    const celsius = environment.temperatureK - 273.15;
    if (celsius <= -51) return t('Frozen');
    if (celsius < 0) return t('Cold');
    if (celsius <= 30) return t('Temperate');
    if (celsius <= 80) return t('Hot');
    return t('Roasting');
}

function populationCode(population) {
    return population > 0 ? clamp(Math.floor(Math.log10(population) + 1e-9), 0, 15) : 0;
}

function governmentCode(social) {
    const government = social.government;
    if (!(social.population > 0) || !government) return 0;
    if (government.states > 1) return 7;
    const democracy = ['electoralDemocracy', 'liberalDemocracy'].includes(government.regime);
    switch (government.form) {
        case 'stateless': case 'chiefdom': return 0;
        case 'charteredCompany': return 1;
        case 'directDemocracy': return 2;
        case 'oligarchy': return 3;
        case 'parliamentaryRepublic': case 'constitutionalMonarchy': return democracy ? 4 : 3;
        case 'presidentialRepublic': return democracy ? 4 : 11;
        case 'technocracy': return 8;
        case 'administeredTerritory': return 6;
        case 'personalistDictatorship': return 10;
        case 'absoluteMonarchy': case 'militaryJunta': return 11;
        case 'oneParty': return 12;
        case 'theocracy': return 13;
        default: return 3;
    }
}

/** Law level from the arms laws, set within their band by how few civil liberties there are */
function lawCode(social) {
    const rights = social.rights;
    if (!(social.population > 0) || !rights) return 0;
    const unfree = 1 - clamp((rights.civilLiberties ?? 50) / 100, 0, 1);
    switch (rights.armsControl) {
        case 'unrestricted': return 0;
        case 'permissive': return 1 + Math.round(2 * unfree);
        case 'licensed': return 4 + Math.round(2 * unfree);
        case 'restrictive': return 7 + Math.round(unfree);
        default: return 9 + Math.round(3 * unfree);
    }
}

/** Tech level from the era, set within the era's span by how developed the world is */
function techCode(social) {
    if (!(social.population > 0) || !social.techEra) return 0;
    const development = clamp(((social.economy?.hdi ?? 0.6) - 0.5) / 0.5, 0, 0.999);
    switch (social.techEra) {
        case 'stoneAge': return 0;
        case 'bronzeIron': return 1;
        case 'medieval': return 2;
        case 'earlyModern': return 3;
        case 'industrial': return 4;
        case 'electrical': return 5;
        case 'atomic': return 6;
        case 'information': return 7;
        case 'interplanetary': return 8 + Math.floor(development * 4);
        default: return 12 + Math.floor(development * 4);
    }
}

function starportCode(port) {
    switch (port?.tier) {
        case 'hub': return 'A';
        case 'international': return 'B';
        case 'regional': return 'C';
        case 'landingField': return (port.weeklyArrivals ?? 0) >= 2 ? 'D' : 'E';
        default: return 'X';
    }
}

/**
 * A world's or moon's profile in SRD codes: { starport, size, atmosphere, hydrographics, population, government, law,
 * techLevel, bases, zone, populationCount, listed }. `listing` is TravellerMap's entry for a principal world on a hex
 * map, whose codes are used as listed.
 */
export function profile(body, listing = null) {
    if (listing) {
        const uwp = parseUWP(listing.uwp);
        const bases = [...new Set([...(listing.bases ?? '')].map((c) => ('NKMDC'.includes(c) ? 'N' : 'SW'.includes(c) ? 'S' : null))
            .filter(Boolean))];
        return { starport: String(uwp.starport).toUpperCase(), size: Math.max(uwp.size, 0), atmosphere: uwp.atmosphere,
            hydrographics: uwp.hydrographics, population: uwp.population, government: uwp.government, law: uwp.law,
            techLevel: uwp.techLevel, bases, zone: listing.zone === 'A' || listing.zone === 'R' ? listing.zone : null,
            populationCount: null, listed: true };
    }
    const size = sizeCode(body);
    const social = body.social ?? { population: 0 };
    const population = populationCode(social.population ?? 0);
    const bases = [];
    if (social.port?.militaryBase) bases.push('N');
    if (social.port?.researchStation) bases.push('R');
    const zone = social.advisory === 'noTravel' ? 'R' : social.advisory === 'essentialOnly' ? 'A' : null;
    return { starport: starportCode(social.port), size, atmosphere: atmosphereCode(body.environment),
        hydrographics: hydrographicsCode(body.environment, size), population,
        government: population > 0 ? governmentCode(social) : 0, law: population > 0 ? lawCode(social) : 0,
        techLevel: population > 0 ? techCode(social) : 0, bases, zone, populationCount: social.population ?? 0, listed: false };
}

/** The Universal World Profile, e.g. "A788899-C" */
export function uwpString(p) {
    return `${p.starport}${digit(p.size)}${digit(p.atmosphere)}${digit(p.hydrographics)}${digit(p.population)}`
        + `${digit(p.government)}${digit(p.law)}-${digit(p.techLevel)}`;
}

/** The SRD trade codes a profile earns */
export function tradeCodesOf(p) {
    return tradeCodes.filter(([, , test]) => test(p));
}

// MARK: data sheet rows

const coded = (code, name) => `${digit(code)} — ${name}`;

/** The size and gravity rows that replace radius, mass and gravity */
export function physicalRows(body) {
    if (body.gasGiant || body.type === 'gasGiant') return [[t('Size'), t('Gas giant')]];
    const size = sizeCode(body);
    const [diameter, gravity] = sizes[size];
    const belt = body.type === 'asteroidBelt' || body.isBelt;
    return [[t('Size'), size === 0 ? coded(0, belt ? t('Asteroid or planetoid belt') : t('Under 800 km'))
        : coded(size, t('%@ km', diameter.toLocaleString()))],
        [t('Surface gravity'), size === 0 ? t('Negligible') : `${gravity} g`]];
}

/** The atmosphere, hydrographics and temperature rows that replace the environment's */
export function environmentRows(body) {
    const environment = body.environment;
    if (!environment) return [];
    const atmosphere = atmosphereCode(environment);
    const hydrographics = hydrographicsCode(environment, sizeCode(body));
    return [[t('Atmosphere'), coded(atmosphere, t(atmosphereNames[atmosphere]))],
        [t('Hydrographics'), coded(hydrographics, t(hydrographicsNames[hydrographics]))],
        [t('Temperature'), temperatureName(environment)]];
}

/** The society as one section of SRD values, in place of the almanac profile */
export function socialSections(body, listing = null) {
    const p = profile(body, listing);
    const rows = [[t('UWP'), uwpString(p)],
        [t('Starport'), `${p.starport} — ${t(starportNames[p.starport] ?? 'No starport')}`],
        [t('Population'), coded(p.population, t(populationNames[Math.min(p.population, populationNames.length - 1)]))],
        [t('Government'), coded(p.government, t(governmentNames[Math.min(p.government, governmentNames.length - 1)]))],
        [t('Law level'), coded(p.law, t(lawNames[Math.min(p.law, lawNames.length - 1)]))],
        [t('Tech level'), digit(p.techLevel)]];
    rows.push([t('Bases'), p.bases.length ? p.bases.map((b) => t(baseNames[b])).join(', ') : t('None')]);
    const codes = tradeCodesOf(p);
    rows.push([t('Trade codes'), codes.length ? codes.map(([code, name]) => `${code} (${t(name)})`).join(', ') : t('None')]);
    if (p.zone && Settings.get('showTravelAdvisories')) rows.push([t('Travel zone'), p.zone === 'R' ? t('Red') : t('Amber')]);
    return [{ key: 'society', title: t('Universal World Profile'), rows }];
}

/** A one-line summary for lists, e.g. "Size 8 · Atm 6 · Hyd 7" */
export function summary({ radiusKm, gasGiant, environment, isBelt = false }) {
    if (gasGiant) return t('Gas giant');
    if (isBelt) return t('Asteroid belt');
    const size = sizeCode({ radiusKm });
    const parts = [t('Size %@', digit(size))];
    if (environment) {
        parts.push(t('Atm %@', digit(atmosphereCode(environment))), t('Hyd %@', digit(hydrographicsCode(environment, size))));
    }
    return parts.join(' · ');
}

/** A short tag for narrow lists, e.g. "Size 8 · Temperate" */
export function tag({ radiusKm, gasGiant, environment, isBelt = false }) {
    if (gasGiant) return t('Gas giant');
    if (isBelt) return t('Belt');
    const size = t('Size %@', digit(sizeCode({ radiusKm })));
    return environment ? `${size} · ${temperatureName(environment)}` : size;
}
