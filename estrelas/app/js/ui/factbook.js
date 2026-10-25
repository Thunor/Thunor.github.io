//
//  factbook.js
//  Estrelas (web)
//
//  A world's society written up the way a national almanac profiles a country: an introduction, then geography,
//  people and society, government, economy, transportation, and military and security, with the kinds of figures and
//  phrasing such references use (government type, legal system, suffrage, GDP by sector, industries, exports, labour
//  force, literacy, median age, military service). The generated society is the source; the figures it doesn't carry
//  are worked out from it, steadily, from the world's designation, so the same world always reads the same.
//

import { t, locale } from './i18n.js';
import { environmentTemperature, hasBreathableAir, hasLiquidWater } from '../model/planetarySystem.js';
import { eraRank, isDemocracy } from '../gen/socialGenerator.js';

const grouped = (value) => Math.round(value).toLocaleString(locale());
const clamp = (value, lower, upper) => Math.min(Math.max(value, lower), upper);
const decimal = (value, digits) => value.toLocaleString(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits });
/** A percentage as the language writes it: "4.5%", "4,5 %" */
const percent = (value, digits = 1) => t('%@%', decimal(value, digits));

/** A steady generator for the figures worked out here (FNV-1a hash, then mulberry32) */
function generatorFor(text) {
    let hash = 0x811C9DC5;
    for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 0x01000193);
    let state = hash >>> 0;
    return () => {
        state = (state + 0x6D2B79F5) >>> 0;
        let x = state;
        x = Math.imul(x ^ (x >>> 15), x | 1);
        x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
}

// MARK: names

export const governmentTypeNames = {
    stateless: 'No central government', chiefdom: 'Tribal chiefdoms', absoluteMonarchy: 'Absolute monarchy',
    constitutionalMonarchy: 'Parliamentary constitutional monarchy', presidentialRepublic: 'Presidential republic',
    parliamentaryRepublic: 'Parliamentary republic', directDemocracy: 'Direct democracy', oneParty: 'One-party state',
    militaryJunta: 'Military junta', personalistDictatorship: 'Authoritarian dictatorship', theocracy: 'Theocratic state',
    oligarchy: 'Oligarchic republic', technocracy: 'Technocratic council', charteredCompany: 'Corporate administration under charter',
    administeredTerritory: 'Dependent territory',
};
export const electionNames = {
    closedAutocracy: 'None held', electoralAutocracy: 'Held, but neither free nor fair',
    electoralDemocracy: 'Free, with limits on civil liberties', liberalDemocracy: 'Free and fair',
};
export const firearmsNames = {
    unrestricted: 'No restrictions', permissive: 'Mostly permitted', licensed: 'Licence and registration required',
    restrictive: 'Heavily restricted', prohibited: 'Banned for civilians',
};
const securityNames = { peace: 'Stable', unrest: 'Civil unrest', armedConflict: 'Armed insurgency', war: 'Civil war' };
const forceNames = { militia: 'National Militia', army: 'Ground Forces', navy: 'Naval Forces', airForce: 'Air Force',
    spaceForce: 'Space Force' };
const industryNames = {
    subsistence: ['subsistence farming', 'handicrafts'], agriculture: ['agriculture', 'food processing'],
    fishing: ['fishing', 'shipbuilding'], mining: ['mining', 'ore refining'], manufacturing: ['machinery', 'chemicals', 'vehicles'],
    services: ['retail', 'logistics', 'health care'], finance: ['banking', 'insurance'],
    research: ['scientific research', 'high technology'], tourism: ['tourism', 'hospitality'],
};
const spaceIndustries = { manufacturing: ['spacecraft components', 'fusion power plants'], mining: ['asteroid mining', 'ore refining'] };
const exportNames = {
    agriculture: 'foodstuffs', fishing: 'seafood', mining: 'metals and ores', manufacturing: 'manufactured goods',
    finance: 'financial services', research: 'technical data and pharmaceuticals', subsistence: 'handicrafts',
};

// MARK: the profile

/**
 * A society as titled sections of [label, value] rows, as an almanac lays out a country. `body` is the world or moon:
 * { designation, radiusKm, environment, type } (any may be missing).
 */
export function factbookSections(social, body = {}, names = {}) {
    const random = generatorFor(`${body.designation ?? ''}|factbook`);
    const named = (table, key) => t(table[key] ?? key ?? '—');
    const sections = [];
    const population = social.population ?? 0;
    const inhabited = population > 0;
    const era = social.techEra;
    const rank = era ? eraRank(era) : 7;

    // Introduction
    const introduction = [[t('Population'), inhabited ? names.population(population) : t('None (uninhabited)')]];
    if (era) introduction.push([t('Technology base'), named(names.techEras, era)]);
    if (social.settlement) {
        introduction.push([t('Dependency status'), social.settlement.independent ? t('Independent')
            : t('Dependency of the system’s main world')]);
        if (social.settlement.purposes.length) {
            introduction.push([t('Established for'), social.settlement.purposes.map((p) => named(names.purposes, p)).join(', ')]);
        }
    }
    if (social.advisory) introduction.push([t('Travel advisory'), named(names.advisories, social.advisory)]);
    sections.push({ key: 'society', title: t('Introduction'), rows: introduction });

    // Geography
    const geography = [];
    const environment = body.environment;
    if (body.radiusKm > 0) {
        const total = 4 * Math.PI * body.radiusKm * body.radiusKm;
        const water = (environment?.waterPercent ?? 0) / 100;
        geography.push([t('Area'), t('total: %@ km²; land: %@ km²; water: %@ km²', grouped(total), grouped(total * (1 - water)),
            grouped(total * water))]);
    }
    if (environment) geography.push([t('Climate'), climate(environment)]);
    geography.push([t('Natural resources'), naturalResources(social.resources ?? 0.5, body, random)]);
    const hazards = naturalHazards(environment, random);
    if (hazards) geography.push([t('Natural hazards'), hazards]);
    sections.push({ key: 'geography', title: t('Geography'), rows: geography });

    if (!inhabited || !social.government) {
        sections.push(transportation(social, named, names));
        return sections;
    }
    const { government, rights, society, economy, defence } = social;

    // People and society
    const lifeExpectancy = economy?.lifeExpectancy ?? 70;
    let growth = { 0: 0.2, 1: 0.2, 2: 0.3, 3: 0.5, 4: 1.9, 5: 1.6, 6: 1.2, 7: 0.6, 8: 0.5, 9: 0.3 }[rank] ?? 0.5;
    if (population < 1e6) growth += 1.5;
    growth = clamp(growth + (random() - 0.5) * 0.8, -0.6, 4);
    const medianAge = clamp(42 - growth * 8 + (lifeExpectancy - 72) * 0.25 + (random() - 0.5) * 4, 14, 52);
    const people = [[t('Population growth'), percent(growth, 2)], [t('Median age'), t('%@ years', decimal(medianAge, 1))]];
    if (society) {
        const majority = Math.round(clamp(100 * (1 - society.diversity * 0.95), 8, 99));
        const minorities = majority >= 99 ? 0 : 1 + Math.round(society.diversity * 12 * random());
        people.push([t('Ethnic groups'), !minorities ? t('homogeneous') : minorities === 1
            ? t('majority group %@%, one minority group %@%', majority, 100 - majority)
            : t('majority group %@%, %@ minority groups %@%', majority, minorities, 100 - majority)]);
        const languages = population < 100000 ? 0 : Math.round(society.diversity * 8 * random()) + (government.states > 1 ? government.states : 0);
        people.push([t('Languages'), languages === 0 ? t('one common language (official)')
            : languages === 1 ? t('one common language (official), one regional language')
                : t('one common language (official), %@ regional languages', languages)]);
        const unaffiliated = Math.round(clamp(18 + 20 * society.traditionalSecular + (random() - 0.5) * 10, 1, 88));
        const stateFaith = government.form === 'theocracy';
        const majorityFaith = Math.round((100 - unaffiliated) * (stateFaith ? 0.92 : 0.55 + 0.35 * random()));
        people.push([t('Religions'), t('%@ %@%, other faiths %@%, unaffiliated %@%', stateFaith ? t('state religion') : t('majority faith'),
            majorityFaith, 100 - unaffiliated - majorityFaith, unaffiliated)]);
        people.push([t('Urbanisation'), t('%@% urban', society.urbanPercent)]);
        people.push([t('Major urban areas'), society.citiesOverMillion > 0
            ? t('largest city %@; %@ cities of a million or more', names.population(society.largestCity), society.citiesOverMillion)
            : t('largest settlement %@', names.population(society.largestCity))]);
    }
    if (economy) people.push([t('Life expectancy'), t('%@ years', decimal(economy.lifeExpectancy, 1))]);
    const literacy = rank === 0 ? null : clamp(({ 1: 5, 2: 10, 3: 25, 4: 60, 5: 80, 6: 90 }[rank] ?? 97) +
        (economy ? (economy.hdi - 0.6) * 20 : 0) + (random() - 0.5) * 6, 1, 99.9);
    people.push([t('Literacy'), literacy === null ? t('no written language') : percent(literacy)]);
    sections.push({ key: 'people', title: t('People and society'), rows: people });

    // Government
    const governmentType = named(governmentTypeNames, government.form);
    const governmentRows = [[t('Government type'), government.structure === 'federal' ? t('%@ (federal)', governmentType)
        : government.structure === 'confederal' ? t('%@ (confederal)', governmentType) : governmentType]];
    if (government.states > 1) {
        governmentRows.push([t('Sovereign states'), t('%@, sharing the world', government.states)]);
    } else {
        const divisions = Math.max(Math.round(Math.log10(Math.max(population, 10)) * (2 + 4 * random())), 1);
        governmentRows.push([t('Administrative divisions'), population < 10000 ? t('none') : t('%@ provinces', divisions)]);
    }
    governmentRows.push([t('Legal system'), legalSystem(government.form, rank, random)]);
    if (government.regime) {
        governmentRows.push([t('Elections'), named(electionNames, government.regime)]);
        governmentRows.push([t('Suffrage'), government.regime === 'closedAutocracy' ? t('none')
            : t('%@ years of age; universal', 16 + Math.trunc(random() * 5))]);
    }
    if (rights) {
        const law = rights.ruleOfLaw;
        governmentRows.push([t('Judiciary'), law > 0.75 ? t('independent') : law > 0.5 ? t('largely independent')
            : law > 0.3 ? t('subject to political pressure') : t('subordinate to the government')]);
        const liberties = rights.civilLiberties;
        governmentRows.push([t('Media'), liberties > 75 ? t('free press') : liberties > 50 ? t('partly free')
            : liberties > 25 ? t('restricted') : t('state-controlled')]);
        governmentRows.push([t('Civilian firearms'), named(firearmsNames, rights.armsControl)]);
        governmentRows.push([t('Capital punishment'), rights.deathPenalty ? t('retained') : t('abolished')]);
    }
    sections.push({ key: 'government', title: t('Government'), rows: governmentRows });

    // Economy
    if (economy) {
        const rows = [[t('Real GDP (PPP)'), names.money(economy.gdp)],
            [t('Real GDP per capita'), names.money(economy.gdpPerCapita)]];
        const conflictLevel = { peace: 0, unrest: 1, armedConflict: 2, war: 3 }[social.conflict] ?? 0;
        const law = rights?.ruleOfLaw ?? 0.5;
        const growthRate = clamp(1 + 3 * random() + (rank === 4 || rank === 5 ? 1.5 : 0) - conflictLevel * 2.2, -9, 9);
        rows.push([t('Real GDP growth rate'), percent(growthRate)]);
        rows.push([t('Inflation rate'), percent(1 + 2 * random() + Math.pow(random(), 2) * 14 * (1 - law) + conflictLevel * 5)]);
        // What each part of the economy makes, by age and by what the world lives on
        let agriculture = { 0: 80, 1: 70, 2: 60, 3: 45, 4: 25, 5: 15, 6: 8, 7: 4, 8: 2, 9: 1 }[rank] ?? 4;
        let industry = { 0: 5, 1: 10, 2: 15, 3: 20, 4: 38, 5: 40, 6: 35, 7: 25, 8: 22, 9: 20 }[rank] ?? 25;
        const sectors = economy.sectors ?? [];
        if (sectors.includes('agriculture')) agriculture += 6;
        if (sectors.includes('fishing')) agriculture += 3;
        if (sectors.includes('mining')) industry += 8;
        if (sectors.includes('manufacturing')) industry += 8;
        if (!body.environment || !hasBreathableAir(body.environment)) agriculture = Math.min(agriculture, 2);
        agriculture = clamp(agriculture * (0.85 + 0.3 * random()), 0.5, 85);
        industry = clamp(industry * (0.85 + 0.3 * random()), 2, 100 - agriculture - 5);
        rows.push([t('GDP by sector'), t('agriculture %@, industry %@, services %@', percent(agriculture),
            percent(industry), percent(100 - agriculture - industry))]);
        const industries = [...new Set(sectors.flatMap((s) => (rank >= 8 && spaceIndustries[s]) || industryNames[s] || []))];
        if (industries.length) rows.push([t('Industries'), industries.map((name) => t(name)).join(', ')]);
        rows.push([t('Labour force'), names.population(population * (0.42 + 0.12 * random()))]);
        if (rank >= 4) {
            rows.push([t('Unemployment rate'), percent(2.5 + 9 * (1 - law) * random() + conflictLevel * 3)]);
        }
        const poverty = clamp(100 * (0.6 * economy.gini * Math.exp(-economy.gdpPerCapita / 40000) +
            0.75 * Math.exp(-economy.gdpPerCapita / 6000)) * (0.85 + 0.3 * random()), 0.5, 90);
        rows.push([t('Below poverty line'), percent(poverty)]);
        rows.push([t('Gini index'), decimal(economy.gini * 100, 1)]);
        const tradeShare = ({ none: 0.02, landingField: 0.05, regional: 0.12, international: 0.25, hub: 0.4 }[social.port?.tier] ?? 0.05)
            * (0.7 + 0.6 * random());
        const commodities = [...new Set(sectors.map((s) => exportNames[s]).filter(Boolean))].map((name) => t(name));
        rows.push([t('Exports'), names.money(economy.gdp * tradeShare) + (commodities.length ? ` (${commodities.join(', ')})` : '')]);
        rows.push([t('Imports'), names.money(economy.gdp * tradeShare * (0.8 + 0.5 * random()))]);
        sections.push({ key: 'economy', title: t('Economy'), rows });
    }

    sections.push(transportation(social, named, names));

    // Military and security
    if (defence) {
        const rows = [[t('Armed forces'), defence.branches.map((b) => t(forceNames[b] ?? b)).join(', ')],
            [t('Military spending'), t('%@% of GDP (%@)', decimal(defence.spendingPercent, 1), names.money(defence.spending))],
            [t('Active personnel'), defence.activePersonnel < 50 ? t('no standing forces; a volunteer militia')
                : t('approximately %@', grouped(defence.activePersonnel))]];
        const conscription = social.conflict !== 'peace' || !isDemocracy(government.regime) ? random() < 0.65 : random() < 0.2;
        const age = 17 + Math.trunc(random() * 3);
        if (population >= 10000) {
            rows.push([t('Military service'), conscription
                ? t('%@–%@ years of age for compulsory service; %@-year obligation', age, age + 10, 1 + Math.trunc(random() * 3))
                : t('%@ years of age for voluntary service; no conscription', age)]);
        }
        rows.push([t('Security situation'), named(securityNames, social.conflict)]);
        sections.push({ key: 'defence', title: t('Military and security'), rows });
    }
    return sections;
}

function transportation(social, named, names) {
    const port = social.port;
    const rows = [[t('Spaceports'), port ? named(names.ports, port.tier) : t('None')]];
    if (port?.orbitalStation) rows.push([t('Orbital station'), t('yes')]);
    if (port) rows.push([t('Ship arrivals'), t('%@ a week', port.weeklyArrivals)]);
    const installations = [[port?.militaryBase, t('military base')], [port?.researchStation, t('research station')]]
        .filter(([on]) => on).map(([, name]) => name);
    if (installations.length) rows.push([t('Other installations'), installations.join(', ')]);
    return { key: 'port', title: t('Transportation'), rows };
}

function climate(environment) {
    const band = environmentTemperature(environment);
    const words = { frozen: t('frozen'), cold: t('cold'), temperate: t('temperate'), hot: t('hot'), boiling: t('scorching') }[band] ?? band;
    const air = environment.atmosphere === 'none' ? t('airless') : environment.pressureBar < 0.3 ? t('thin air')
        : environment.pressureBar > 3 ? t('dense air') : null;
    return [words, air].filter(Boolean).join('; ');
}

function naturalResources(score, body, random) {
    const isBelt = body.type === 'asteroidBelt';
    const environment = body.environment;
    const pick = (list, count) => {
        const copy = list.slice();
        const out = [];
        while (copy.length && out.length < count) out.push(copy.splice(Math.trunc(random() * copy.length), 1)[0]);
        return out;
    };
    const metals = ['iron ore', 'nickel', 'copper', 'bauxite', 'titanium', 'rare earth elements', 'platinum-group metals',
        'uranium', 'gold', 'silver', 'cobalt', 'lithium'];
    const list = pick(metals, isBelt ? 2 + Math.round(score * 3) : 1 + Math.round(score * 3));
    if (isBelt) list.unshift('nickel-iron');
    if (environment && environment.waterPercent > 0) list.push(environmentTemperature(environment) === 'frozen' ? t('water ice') : t('water'));
    if (environment && hasBreathableAir(environment) && hasLiquidWater(environment)) list.push(...pick(['arable land', 'timber', 'fish', 'hydropower'], 2));
    if (environment?.atmosphere === 'methane') list.push(t('hydrocarbons'));
    if (!environment && !isBelt) list.push(t('water ice'));
    return list.map((name) => t(name)).join(', ');
}

function naturalHazards(environment, random) {
    if (!environment) return null;
    const hazards = [];
    const band = environmentTemperature(environment);
    if (environment.atmosphere === 'none' || environment.atmosphere === 'trace') hazards.push(t('vacuum'), t('solar radiation'));
    if (environment.contaminated) hazards.push(t('toxic air'));
    if (environment.atmosphere === 'sulfuric') hazards.push(t('corrosive atmosphere'));
    if (band === 'boiling') hazards.push(t('extreme heat'));
    if (band === 'frozen') hazards.push(t('extreme cold'));
    if (environment.pressureBar > 0.3 && hasLiquidWater(environment) && random() < 0.6) hazards.push(t('severe storms'));
    if (random() < 0.35) hazards.push(t('earthquakes'));
    return hazards.length ? hazards.join(', ') : null;
}

/** The kind of law a government rules by */
function legalSystem(form, rank, random) {
    switch (form) {
        case 'theocracy': return t('religious law');
        case 'stateless': case 'chiefdom': return t('customary law');
        case 'charteredCompany': return t('corporate charter and company regulations');
        case 'administeredTerritory': return t('the laws of the governing power');
        case 'militaryJunta': return t('civil law, overridden by military decree');
        default: {
            if (rank < 3) return t('customary law');
            const roll = random();
            return roll < 0.6 ? t('civil law system') : roll < 0.9 ? t('common law system') : t('mixed legal system');
        }
    }
}
