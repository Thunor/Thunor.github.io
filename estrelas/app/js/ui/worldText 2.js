//
//  worldText.js
//  Estrelas (web)
//
//  How worlds and their societies are written out in the data sheets, in plain units: kilometres, Earth masses and
//  radii, bar, degrees, percentages, headcounts and international dollars. Shared by the on-screen sheets and the
//  printed data under exported maps. A port of WorldText.swift and the display names in WorldSocial.swift.
//

import { t, locale } from './i18n.js';
import { PlanetPhysics, environmentTemperature, hasBreathableAir } from '../model/planetarySystem.js';
import { terrainNames } from '../surface/surfaceTerrain.js';
import { factbookSections } from './factbook.js';

/** C's %.<n>e, e.g. "1.23e-04" */
export function exponential(value, digits) {
    return value.toExponential(digits).replace(/e([+-])(\d)$/, 'e$10$2');
}

const grouped = (value) => Math.round(value).toLocaleString(locale());

// MARK: display names

export const techEraNames = {
    stoneAge: 'Stone age', bronzeIron: 'Bronze and iron age', medieval: 'Medieval', earlyModern: 'Early modern',
    industrial: 'Industrial', electrical: 'Electrical', atomic: 'Atomic', information: 'Information',
    interplanetary: 'Interplanetary', interstellar: 'Interstellar',
};
export const techEraSummaries = {
    stoneAge: 'Stone tools, foraging and early farming', bronzeIron: 'Metalworking, writing, early cities',
    medieval: 'Water and wind mills, castles, guilds', earlyModern: 'Printing, gunpowder, ocean sailing ships',
    industrial: 'Steam power, railways, factories', electrical: 'Electricity, radio, motor vehicles, flight',
    atomic: 'Nuclear power, jet aircraft, early computers', information: 'Digital networks, satellites, crewed orbital flight',
    interplanetary: 'Fusion power, routine travel between planets', interstellar: 'Travel between the stars',
};
export const governmentFormNames = {
    stateless: 'Stateless', chiefdom: 'Chiefdom', absoluteMonarchy: 'Absolute monarchy',
    constitutionalMonarchy: 'Constitutional monarchy', presidentialRepublic: 'Presidential republic',
    parliamentaryRepublic: 'Parliamentary republic', directDemocracy: 'Direct democracy', oneParty: 'One-party state',
    militaryJunta: 'Military junta', personalistDictatorship: 'Personalist dictatorship', theocracy: 'Theocracy',
    oligarchy: 'Oligarchy', technocracy: 'Technocracy', charteredCompany: 'Chartered company',
    administeredTerritory: 'Administered territory',
};
export const regimeNames = {
    closedAutocracy: 'Closed autocracy', electoralAutocracy: 'Electoral autocracy',
    electoralDemocracy: 'Electoral democracy', liberalDemocracy: 'Liberal democracy',
};
export const structureNames = { unitary: 'Unitary', federal: 'Federal', confederal: 'Confederal' };
export const armsControlNames = {
    unrestricted: 'Unrestricted', permissive: 'Permissive', licensed: 'Licensed', restrictive: 'Restrictive',
    prohibited: 'Prohibited',
};
export const armsControlSummaries = {
    unrestricted: 'No laws on owning or carrying weapons', permissive: 'Most weapons legal; explosives and heavy arms banned',
    licensed: 'Firearms need a licence and registration', restrictive: 'Most firearms banned; hunting arms by permit only',
    prohibited: 'Civilians may not own weapons',
};
export const sectorNames = {
    subsistence: 'Subsistence', agriculture: 'Agriculture', fishing: 'Fishing and shipping', mining: 'Mining',
    manufacturing: 'Manufacturing', services: 'Services', finance: 'Finance', research: 'Research', tourism: 'Tourism',
};
export const portTierNames = {
    none: 'None', landingField: 'Landing field', regional: 'Regional spaceport', international: 'International spaceport',
    hub: 'Hub spaceport',
};
export const portTierSummaries = {
    none: 'No port', landingField: 'A cleared landing site, no services', regional: 'Fuel, maintenance, a few scheduled routes',
    international: 'Customs, repair yards, routes across the system', hub: 'Shipyards and heavy traffic',
};
export const branchNames = { militia: 'Militia', army: 'Army', navy: 'Navy', airForce: 'Air force', spaceForce: 'Space force' };
export const conflictNames = { peace: 'At peace', unrest: 'Civil unrest', armedConflict: 'Armed conflict', war: 'War' };
export const purposeNames = {
    colony: 'Colony', farming: 'Farming', mining: 'Mining', research: 'Research', military: 'Military', penal: 'Penal',
    freePort: 'Free port',
};
export const advisoryNames = { essentialOnly: 'Essential travel only', noTravel: 'No travel' };
export const advisoryShortNames = { essentialOnly: 'Essential only', noTravel: 'No travel' };
export const atmosphereNames = {
    none: 'None', trace: 'Trace', carbonDioxide: 'Carbon dioxide', nitrogen: 'Nitrogen', nitrogenOxygen: 'Nitrogen–oxygen',
    methane: 'Nitrogen–methane', sulfuric: 'Carbon dioxide, sulfuric clouds', hydrogen: 'Hydrogen–helium',
};
export const giantClassNames = {
    subNeptune: 'Sub-Neptune', iceGiant: 'Ice giant', saturnian: 'Saturn-like gas giant', jovian: 'Jupiter-like gas giant',
    superJovian: 'Super-Jupiter',
};
export const temperatureBandNames = { frozen: 'Frozen', cold: 'Cold', temperate: 'Temperate', hot: 'Hot', boiling: 'Scorching' };
export const anomalyNames = {
    eccentric: 'Eccentric', inclined: 'Inclined', retrograde: 'Retrograde', trojanLeading: 'Leading trojan',
    trojanTrailing: 'Trailing trojan',
};

const named = (table, key) => t(table[key] ?? key ?? '—');

export const WorldText = {
    /** What the ground is at a spot, as a map pin shows it, e.g. "Temperate forest" or "Sea ice" */
    /** An altitude as altitudeAt gives it, e.g. "1,240 m above sea level" */
    altitude(altitude) {
        if (!altitude || !Number.isFinite(altitude.metres)) return null;
        const metres = Math.round(altitude.metres / 10) * 10;
        if (altitude.reference === 'lowest') return metres === 0 ? t('At the lowest point') : t('%@ m above the lowest point', grouped(metres));
        if (metres === 0) return t('At sea level');
        return metres > 0 ? t('%@ m above sea level', grouped(metres)) : t('%@ m below sea level', grouped(-metres));
    },

    terrain(terrain) {
        return terrainNames[terrain] ? t(terrainNames[terrain]) : null;
    },

    // MARK: physical

    typeName(world) {
        switch (world.type) {
            case 'gasGiant': return world.gasGiant ? named(giantClassNames, world.gasGiant.giantClass) : t('Gas giant');
            case 'asteroidBelt': return t('Asteroid belt');
            default: return t('Terrestrial planet');
        }
    },

    giantClass: (giantClass) => named(giantClassNames, giantClass),

    /** Radius in kilometres, with Earth radii for anything planet-sized, e.g. "6,371 km · 1.00 R⊕" */
    radius(km) {
        const kilometres = t('%@ km', grouped(km));
        if (km < 1000) return kilometres;
        return `${kilometres} · ${(km / PlanetPhysics.earthRadiusKm).toFixed(2)} R⊕`;
    },

    mass(earths) {
        if (earths < 0.001) return `${exponential(earths, 2)} M⊕`;
        if (earths < 0.1) return `${earths.toFixed(4)} M⊕`;
        if (earths < 100) return `${earths.toFixed(2)} M⊕`;
        return `${earths.toFixed(0)} M⊕`;
    },

    gravity: (g) => `${g.toFixed(g < 0.1 ? 3 : 2)} g`,

    atmosphereKind: (kind) => named(atmosphereNames, kind),

    /** Composition and pressure, e.g. "Nitrogen–oxygen, 1.01 bar" */
    atmosphere(environment) {
        if (environment.atmosphere === 'none') return WorldText.atmosphereKind('none');
        let text = `${WorldText.atmosphereKind(environment.atmosphere)}, ${WorldText.pressure(environment.pressureBar)}`;
        if (environment.contaminated) text += t(', contaminated');
        return text;
    },

    pressure(bar) {
        if (bar < 0.001) return `${exponential(bar, 1)} bar`;
        if (bar < 0.1) return `${bar.toFixed(3)} bar`;
        if (bar < 100) return `${bar.toFixed(2)} bar`;
        return `${bar.toFixed(0)} bar`;
    },

    /** Whether the air can be breathed, and how */
    breathability(environment) {
        if (hasBreathableAir(environment)) return environment.contaminated ? t('With a filter mask') : t('Yes');
        return environment.atmosphere === 'none' || environment.atmosphere === 'trace' ? t('No: vacuum suit') : t('No: sealed suit');
    },

    /** Surface water as ocean or ice, e.g. "71% ocean" */
    water(environment) {
        if (!(environment.waterPercent > 0)) return t('None');
        const kind = environmentTemperature(environment) === 'frozen' || environment.temperatureK < 273 ? t('ice') : t('ocean');
        return `${environment.waterPercent}% ${kind}`;
    },

    /** e.g. "15 °C · Temperate" */
    temperature(environment) {
        const celsius = Math.round(environment.temperatureK - 273.15);
        return `${celsius} °C · ${WorldText.temperatureBand(environmentTemperature(environment))}`;
    },

    temperatureBand: (band) => named(temperatureBandNames, band),

    anomaly: (anomaly) => named(anomalyNames, anomaly),

    /** A one-line summary of a body, for lists: e.g. "1.00 R⊕ · Nitrogen–oxygen · 71% ocean" */
    summary({ radiusKm, gasGiant, environment, isBelt = false }) {
        if (gasGiant) return `${WorldText.giantClass(gasGiant.giantClass)} · ${gasGiant.radiusEarths.toFixed(1)} R⊕`;
        if (isBelt) return t('Asteroid belt');
        const parts = [radiusKm >= 1000 ? `${(radiusKm / PlanetPhysics.earthRadiusKm).toFixed(2)} R⊕` : t('%@ km', String(Math.round(radiusKm)))];
        if (environment) {
            parts.push(WorldText.atmosphereKind(environment.atmosphere));
            if (environment.waterPercent > 0) parts.push(WorldText.water(environment));
        }
        return parts.join(' · ');
    },

    /** A short tag for narrow lists: the radius and, if known, the temperature band */
    tag({ radiusKm, gasGiant, environment, isBelt = false }) {
        if (gasGiant) return `${gasGiant.radiusEarths.toFixed(1)} R⊕`;
        if (isBelt) return t('Belt');
        const size = radiusKm >= 1000 ? `${(radiusKm / PlanetPhysics.earthRadiusKm).toFixed(2)} R⊕` : `${Math.round(radiusKm)} km`;
        if (!environment) return size;
        return `${size} · ${WorldText.temperatureBand(environmentTemperature(environment))}`;
    },

    // MARK: social

    /** A headcount in words for the big ones, e.g. "8.1 billion", "12,400" */
    population(count) {
        if (count >= 1e12) return t('%.1f trillion', count / 1e12);
        if (count >= 1e9) return t('%.1f billion', count / 1e9);
        if (count >= 1e6) return t('%.1f million', count / 1e6);
        return grouped(count);
    },

    /** International dollars, e.g. "Int$25,300", "Int$1.2 trillion" */
    money(amount) {
        if (amount >= 1e12) return 'Int$' + t('%.1f trillion', amount / 1e12);
        if (amount >= 1e9) return 'Int$' + t('%.1f billion', amount / 1e9);
        if (amount >= 1e6) return 'Int$' + t('%.1f million', amount / 1e6);
        return 'Int$' + grouped(amount);
    },

    index: (value) => value.toFixed(2),

    /** −2…+2 cultural value scores in words, e.g. "Secular (+1.2)" */
    values(score, low, high) {
        const word = Math.abs(score) < 0.3 ? t('Balanced') : (score < 0 ? low : high);
        return `${word} (${score >= 0 ? '+' : ''}${score.toFixed(1)})`;
    },

    /**
     * A society as titled sections of [label, value] rows, shared by the data sheets and the printed data: written up
     * as an almanac profiles a country (factbook.js). `body` is the world or moon it lives on.
     */
    socialSections(social, body = {}) {
        return factbookSections(social, body, { population: WorldText.population, money: WorldText.money,
            techEras: techEraNames, purposes: purposeNames, advisories: advisoryNames, ports: portTierNames });
    },
};

/** The section colours of the society in a data sheet */
export function socialSectionColor(key) {
    switch (key) {
        case 'defence': return 'alert';
        case 'port': return 'info';
        case 'economy': case 'people': return 'accent';
        case 'geography': return 'label';
        default: return 'control';
    }
}
