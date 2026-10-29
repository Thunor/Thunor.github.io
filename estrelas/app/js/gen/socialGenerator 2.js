//
//  socialGenerator.js
//  Estrelas (web)
//
//  Draws the society of each system's principal world, and of any settlements on its other worlds, with the measures
//  used to compare countries on Earth: population, government form and regime type, civil liberties and rule of law,
//  GDP per person, inequality, the Human Development Index, cities, cultural values, ports, defence, conflict and
//  travel advisories. A port of SocialGenerator.swift and WorldSocial.swift: every draw is made in the same order,
//  from the same reseeded shared generator, so a seed gives the same worlds as on the Mac.
//

import { rng, roundSwift } from './random.js';
import { Dice } from './stellar.js';
import { environment as physicalEnvironment, snowLine } from './planetarySystemGenerator.js';
import {
    PlanetPhysics, habitabilityIndex, hasBreathableAir, environmentTemperature, hasLiquidWater, insolation,
    luminosityScale,
} from '../model/planetarySystem.js';

/** Mixed into the universe's seed, so the social draws get their own sequence */
const seedSalt = 0x50C1A15E;

// MARK: the measures (WorldSocial.swift)

export const techEras = ['stoneAge', 'bronzeIron', 'medieval', 'earlyModern', 'industrial', 'electrical', 'atomic',
    'information', 'interplanetary', 'interstellar'];
export const eraRank = (era) => Math.max(techEras.indexOf(era), 0);
export const eraOffset = (era, steps) => techEras[Math.min(Math.max(eraRank(era) + steps, 0), techEras.length - 1)];
export const isSpacefaring = (era) => eraRank(era) >= eraRank('interplanetary');

export const governmentForms = ['stateless', 'chiefdom', 'absoluteMonarchy', 'constitutionalMonarchy',
    'presidentialRepublic', 'parliamentaryRepublic', 'directDemocracy', 'oneParty', 'militaryJunta',
    'personalistDictatorship', 'theocracy', 'oligarchy', 'technocracy', 'charteredCompany', 'administeredTerritory'];
export const regimeTypes = ['closedAutocracy', 'electoralAutocracy', 'electoralDemocracy', 'liberalDemocracy'];
export const regimeRank = (regime) => regimeTypes.indexOf(regime);
export const isDemocracy = (regime) => regimeRank(regime) >= regimeRank('electoralDemocracy');
export const stateStructures = ['unitary', 'federal', 'confederal'];
export const armsControls = ['unrestricted', 'permissive', 'licensed', 'restrictive', 'prohibited'];
export const economicSectors = ['subsistence', 'agriculture', 'fishing', 'mining', 'manufacturing', 'services',
    'finance', 'research', 'tourism'];
export const portTiers = ['none', 'landingField', 'regional', 'international', 'hub'];
export const portRank = (tier) => Math.max(portTiers.indexOf(tier), 0);
export const defenceBranches = ['militia', 'army', 'navy', 'airForce', 'spaceForce'];
export const conflictLevels = ['peace', 'unrest', 'armedConflict', 'war'];
export const conflictRank = (level) => Math.max(conflictLevels.indexOf(level), 0);
export const settlementPurposes = ['colony', 'farming', 'mining', 'research', 'military', 'penal', 'freePort'];
export const travelAdvisories = ['essentialOnly', 'noTravel'];

/** Earlier versions saved zones as "amber" and "red" */
export function travelAdvisory(raw) {
    if (raw === 'amber') return 'essentialOnly';
    if (raw === 'red') return 'noTravel';
    return travelAdvisories.includes(raw) ? raw : 'essentialOnly';
}

export const isInhabited = (social) => (social?.population ?? 0) > 0;

// MARK: entry points

/** Draws societies for every system with a principal world (systems in their saved form) */
/**
 * `givens` holds what's known of some systems' principal worlds (GivenSociety: population, and optionally techEra,
 * governmentForm, regime, armsControl, portTier, orbitalStation, militaryBase, researchStation, advisory), by
 * system id; the rest of each society is drawn round it
 */
export function generateSocial(systems, seed, givens = {}) {
    rng.reseed((seed ^ seedSalt) >>> 0);
    const generator = new SocialGenerator();
    for (const system of systems) {
        const planetary = system.planetarySystem;
        if (!planetary || planetary.principalWorld == null) continue;
        generator.given = (system.id && givens[system.id]) || null;
        generator.generate(planetary);
    }
}

/**
 * Societies for a belt's minor planets (see minorPlanets.js), drawn like any other secondary world's when the main world
 * is spacefaring: mining outposts, research stations and the like. The largest is always settled, so a spacefaring
 * system's belt has people in it. Uses the shared generator, reseeded by the caller.
 */
export function settleMinorPlanets(planetary, minorPlanets) {
    const reference = principalReference(planetary.worlds ?? []);
    if (!reference) return;
    const main = bodyAt(planetary.worlds, reference).social;
    if (!main || !(main.population >= 100000) || !main.techEra || !isSpacefaring(main.techEra)) return;
    const generator = new SocialGenerator();
    minorPlanets.forEach((world, index) => {
        const body = { radiusKm: world.radiusKm, massEarths: world.massEarths, type: 'terrestrial', environment: world.environment,
            isGiant: false, isBelt: true };
        const conditions = generator.conditions(body, world.environment);
        let social = generator.secondary(conditions, main);
        for (let attempt = 0; !social && index === 0 && attempt < 50; attempt++) social = generator.secondary(conditions, main);
        if (social) world.social = social;
    });
}

/** Whether any system's principal world has no society yet */
export function socialIsMissing(systems) {
    return systems.some((system) => {
        const planetary = system.planetarySystem;
        if (!planetary) return false;
        const reference = principalReference(planetary.worlds ?? []);
        if (!reference) return false;
        return bodyAt(planetary.worlds, reference).social == null;
    });
}

function principalReference(worlds) {
    for (let index = 0; index < worlds.length; index++) {
        if (worlds[index].isPrincipal) return { world: index, moon: null };
        const moon = (worlds[index].moons ?? []).findIndex((m) => m.isPrincipal);
        if (moon >= 0) return { world: index, moon };
    }
    return null;
}

function bodyAt(worlds, reference) {
    const world = worlds[reference.world];
    if (reference.moon !== null) {
        const moon = world.moons[reference.moon];
        return { radiusKm: moon.radiusKm, massEarths: moon.massEarths, type: 'terrestrial', environment: moon.environment,
            social: moon.social, isGiant: moon.gasGiant != null, isBelt: false };
    }
    return { radiusKm: world.radiusKm, massEarths: world.massEarths, type: world.type, environment: world.environment,
        social: world.social, isGiant: world.type === 'gasGiant', isBelt: world.type === 'asteroidBelt' };
}

const sameReference = (a, b) => a.world === b.world && a.moon === b.moon;

function rounded(value, places) {
    const scale = Math.pow(10, places);
    return roundSwift(value * scale) / scale;
}

const clamp = (value, lower, upper) => Math.min(Math.max(value, lower), upper);

class SocialGenerator {

    set(social, environment, reference, worlds) {
        const target = reference.moon !== null ? worlds[reference.world].moons[reference.moon] : worlds[reference.world];
        target.social = social;
        target.environment = environment;
    }

    conditions(body, environment) {
        const habitability = environment
            ? habitabilityIndex(environment, PlanetPhysics.gravity(body.massEarths, body.radiusKm)) : 0;
        let resources = Dice.uniform(0, 1);
        if (body.isBelt) resources = Math.max(resources, Dice.uniform(0.5, 1));
        if (body.radiusKm > 5000) resources = Math.min(resources + 0.1, 1);
        const waterPercent = environment?.waterPercent ?? 0;
        const breathable = hasBreathableAir(environment);
        const isHazardous = !environment || environment.atmosphere === 'sulfuric' || environment.atmosphere === 'hydrogen' ||
            environmentTemperature(environment) === 'boiling' || environment.pressureBar > 10;
        return { environment, habitability, resources, radiusKm: body.radiusKm, isBelt: body.isBelt, waterPercent,
            breathable, isHazardous };
    }

    generate(system) {
        const worlds = system.worlds;
        const mainReference = principalReference(worlds);
        if (!mainReference) return;
        const mainBody = bodyAt(worlds, mainReference);
        const mainEnvironment = mainBody.environment ?? this.surveyedEnvironment(mainBody, worlds, mainReference, system.age);
        const main = this.principalWorld(this.conditions(mainBody, mainEnvironment));
        this.set(main, mainEnvironment, mainReference, worlds);

        if (main.population >= 100000 && main.techEra && isSpacefaring(main.techEra)) {
            for (const reference of this.candidates(worlds)) {
                if (sameReference(reference, mainReference)) continue;
                const body = bodyAt(worlds, reference);
                if (body.isGiant) continue;
                const environment = body.isBelt ? undefined
                    : body.environment ?? this.surveyedEnvironment(body, worlds, reference, system.age);
                const conditions = this.conditions(body, environment);
                const social = this.secondary(conditions, main);
                if (social) this.set(social, environment, reference, worlds);
            }
        }
    }

    surveyedEnvironment(body, worlds, reference, age) {
        if (body.isBelt || body.isGiant) return undefined;
        const world = worlds[reference.world];
        return physicalEnvironment(body.radiusKm, body.massEarths, insolation(world), age,
            world.au >= snowLine * luminosityScale(world));
    }

    candidates(worlds) {
        const result = [];
        worlds.forEach((world, index) => {
            result.push({ world: index, moon: null });
            (world.moons ?? []).forEach((_, moon) => result.push({ world: index, moon }));
        });
        return result;
    }

    // MARK: principal world

    principalWorld(body) {
        const social = this.drawPrincipalWorld(body);
        // What's known replaces what was drawn
        const given = this.given;
        if (given) {
            if (given.governmentForm && social.government) social.government.form = given.governmentForm;
            if (given.regime && social.government) social.government.regime = given.regime;
            if (given.armsControl && social.rights) social.rights.armsControl = given.armsControl;
            if (given.portTier) {
                social.port.tier = given.portTier;
                if (given.portTier === 'none') social.port.weeklyArrivals = 0;
            }
            if (given.orbitalStation != null) social.port.orbitalStation = given.orbitalStation;
            if (given.militaryBase != null) social.port.militaryBase = given.militaryBase;
            if (given.researchStation != null) social.port.researchStation = given.researchStation;
            social.advisory = given.advisory ?? undefined;
        }
        return social;
    }

    drawPrincipalWorld(body) {
        const given = this.given;
        const inhabited = given ? given.population > 0
            : Dice.chance(Math.min(0.55 + 0.4 * body.habitability + 0.1 * body.resources, 0.97));
        if (!inhabited) {
            const tier = Dice.chance(0.5) ? 'landingField' : 'none';
            const port = { tier, orbitalStation: false, militaryBase: false, researchStation: false,
                weeklyArrivals: tier === 'none' ? 0 : Dice.rollD3() - 1 };
            port.researchStation = Dice.chance(0.25);
            const advisory = body.isHazardous && Dice.chance(0.3) ? 'essentialOnly' : undefined;
            return { population: 0, habitability: rounded(body.habitability, 3), resources: rounded(body.resources, 2),
                techEra: given?.techEra ?? undefined, port, conflict: 'peace', advisory };
        }
        const population = given?.population ?? this.drawPopulation(body, null);
        const era = given?.techEra ?? this.drawEra(body, population);
        return this.society(body, population, era, null, null);
    }

    drawPopulation(body, maximum) {
        const area = Math.log10(Math.max(Math.pow(body.radiusKm / PlanetPhysics.earthRadiusKm, 2), 0.001));
        let magnitude;
        if (body.habitability > 0.4) {
            magnitude = Dice.normal(5 + 4.5 * body.habitability + area, 1.2);
        } else {
            magnitude = Dice.normal(2.5 + 3 * body.resources + body.habitability * 3, 1);
        }
        magnitude = clamp(magnitude, 1, 11);
        let population = Math.trunc(Math.pow(10, magnitude));
        if (maximum !== null) population = Math.min(population, maximum);
        return Math.max(population, 5);
    }

    drawEra(body, population) {
        let weights = [['stoneAge', 0.5], ['bronzeIron', 1], ['medieval', 1.5], ['earlyModern', 2], ['industrial', 3],
            ['electrical', 4], ['atomic', 8], ['information', 20], ['interplanetary', 35], ['interstellar', 25]];
        if (population > 100000000) {
            weights = weights.map(([era, w]) => [era, w * (eraRank(era) >= eraRank('information') ? 1.5 : 1)]);
        }
        let era = Dice.weighted(weights);
        const minimum = body.breathable && !body.isHazardous ? 'stoneAge' : (body.isHazardous ? 'interplanetary' : 'information');
        if (eraRank(era) < eraRank(minimum)) era = minimum;
        return era;
    }

    // MARK: society

    society(body, population, era, settlement, parent) {
        let government;
        const parentGovernment = parent?.government;
        if (settlement && !settlement.independent && parentGovernment) {
            const form = settlement.purposes.includes('mining') && Dice.chance(0.4) ? 'charteredCompany' : 'administeredTerritory';
            const regime = parentGovernment.regime !== undefined
                ? regimeTypes[Math.min(regimeRank(parentGovernment.regime), regimeRank('electoralDemocracy'))] : undefined;
            government = { form, regime, structure: 'unitary', states: 1,
                democracyIndex: rounded(Math.max(parentGovernment.democracyIndex - Dice.uniform(0, 3), 0), 1) };
        } else {
            government = this.drawGovernment(population, era);
        }
        const rights = this.drawRights(government, population, era);
        const port = this.drawPort(population, era, body, settlement !== null);
        const economy = this.drawEconomy(body, population, era, government, rights, port, parent);
        const society = this.drawSociety(body, population, era, government, rights, economy, port);
        const conflict = this.drawConflict(government, rights, economy, population);
        const defence = this.drawDefence(body, population, era, government, economy, conflict, port);
        economy.sectors = this.sectors(body, population, era, economy, rights, port, society, conflict);
        const advisory = this.suggestedAdvisory(body, government, rights, society, conflict);
        return { population, habitability: rounded(body.habitability, 3), resources: rounded(body.resources, 2),
            techEra: era, government, rights, society, economy, port, defence, conflict,
            settlement: settlement ?? undefined, advisory };
    }

    drawGovernment(population, era) {
        let weights;
        const rank = eraRank(era);
        if (rank <= eraRank('bronzeIron')) {
            weights = [['stateless', 30], ['chiefdom', 40], ['absoluteMonarchy', 15], ['theocracy', 10], ['oligarchy', 5]];
        } else if (rank <= eraRank('earlyModern')) {
            weights = [['stateless', 5], ['chiefdom', 10], ['absoluteMonarchy', 40], ['theocracy', 15], ['oligarchy', 20],
                ['constitutionalMonarchy', 5], ['directDemocracy', 5]];
        } else {
            weights = [['presidentialRepublic', 15], ['parliamentaryRepublic', 15], ['constitutionalMonarchy', 8],
                ['oneParty', 9], ['personalistDictatorship', 6], ['militaryJunta', 5], ['theocracy', 4],
                ['technocracy', 8], ['oligarchy', 6], ['charteredCompany', 7], ['administeredTerritory', 6],
                ['absoluteMonarchy', 3], ['directDemocracy', 2], ['stateless', 1]];
        }
        if (population < 10000) {
            weights = weights.concat([['directDemocracy', 20], ['stateless', 8], ['charteredCompany', 15],
                ['administeredTerritory', 12]]);
        }
        const form = Dice.weighted(weights);

        let regime;
        switch (form) {
            case 'stateless': regime = undefined; break;
            case 'parliamentaryRepublic': case 'constitutionalMonarchy': case 'directDemocracy':
                regime = Dice.weighted([['liberalDemocracy', 60], ['electoralDemocracy', 30], ['electoralAutocracy', 10]]);
                break;
            case 'presidentialRepublic':
                regime = Dice.weighted([['liberalDemocracy', 35], ['electoralDemocracy', 40], ['electoralAutocracy', 25]]);
                break;
            case 'personalistDictatorship': case 'oligarchy': case 'technocracy':
                regime = Dice.weighted([['electoralAutocracy', 55], ['closedAutocracy', 40], ['electoralDemocracy', 5]]);
                break;
            default:
                regime = Dice.weighted([['closedAutocracy', 80], ['electoralAutocracy', 20]]);
        }

        let states = 1;
        if (population > 50000000 && rank < eraRank('interplanetary') && Dice.chance(0.6)) {
            states = 2 + Math.trunc(Dice.logUniform(1, 60));
        } else if (population > 50000000 && Dice.chance(0.15)) {
            states = 2 + Dice.roll1D6();
        }
        const structure = states > 1 && Dice.chance(0.3) ? 'confederal'
            : (population > 100000000 && Dice.chance(0.4) ? 'federal' : 'unitary');

        let index;
        switch (regime) {
            case 'liberalDemocracy': index = Dice.uniform(7.5, 9.9); break;
            case 'electoralDemocracy': index = Dice.uniform(5.5, 7.9); break;
            case 'electoralAutocracy': index = Dice.uniform(3, 5.5); break;
            case 'closedAutocracy': index = Dice.uniform(0.5, 3); break;
            default: index = Dice.uniform(3, 7);
        }
        return { form, regime, structure, states, democracyIndex: rounded(index, 1) };
    }

    drawRights(government, population, era) {
        let liberties;
        switch (government.regime) {
            case 'liberalDemocracy': liberties = Dice.uniform(80, 98); break;
            case 'electoralDemocracy': liberties = Dice.uniform(55, 82); break;
            case 'electoralAutocracy': liberties = Dice.uniform(25, 55); break;
            case 'closedAutocracy': liberties = Dice.uniform(3, 30); break;
            default: liberties = Dice.uniform(40, 85);
        }
        const development = eraRank(era) / (techEras.length - 1);
        const ruleOfLaw = clamp(0.15 + 0.55 * liberties / 100 + 0.2 * development + Dice.normal(0, 0.08), 0.05, 0.98);
        const integrity = Math.trunc(roundSwift(clamp(ruleOfLaw * 90 + Dice.normal(0, 8), 5, 95)));

        let arms;
        switch (government.regime) {
            case undefined: arms = [['unrestricted', 60], ['permissive', 35], ['licensed', 5]]; break;
            case 'liberalDemocracy': case 'electoralDemocracy':
                arms = [['permissive', 20], ['licensed', 50], ['restrictive', 25], ['prohibited', 3], ['unrestricted', 2]];
                break;
            default: arms = [['licensed', 20], ['restrictive', 45], ['prohibited', 35]];
        }
        if (population < 10000) arms = arms.concat([['permissive', 40], ['unrestricted', 20]]);
        let deathPenaltyChance;
        switch (government.regime) {
            case 'closedAutocracy': deathPenaltyChance = 0.85; break;
            case 'electoralAutocracy': deathPenaltyChance = 0.6; break;
            case 'electoralDemocracy': deathPenaltyChance = 0.25; break;
            case 'liberalDemocracy': deathPenaltyChance = 0.05; break;
            default: deathPenaltyChance = 0.3;
        }
        const armsControl = Dice.weighted(arms);
        const deathPenalty = Dice.chance(deathPenaltyChance);
        return { civilLiberties: Math.trunc(roundSwift(liberties)), ruleOfLaw: rounded(ruleOfLaw, 2), integrity, armsControl,
            deathPenalty };
    }

    drawPort(population, era, body, isSettlement) {
        const eraBonus = era === 'interstellar' ? 2 : era === 'interplanetary' ? 1 : era === 'information' ? 0 : -2;
        const score = Math.log10(Math.max(population, 1)) + eraBonus + Dice.normal(0, 1.2) - (isSettlement ? 1.5 : 0);
        const tier = score < 2.5 ? 'none' : score < 5 ? 'landingField' : score < 7 ? 'regional' : score < 9 ? 'international' : 'hub';
        const stationChance = { hub: 0.95, international: 0.6, regional: 0.25 }[tier] ?? 0;
        const militaryChance = { hub: 0.45, international: 0.3, regional: 0.1 }[tier] ?? 0.02;
        let arrivals;
        switch (tier) {
            case 'hub': arrivals = Math.trunc(Dice.logUniform(500, 3000)); break;
            case 'international': arrivals = Math.trunc(Dice.logUniform(50, 400)); break;
            case 'regional': arrivals = Math.trunc(Dice.logUniform(5, 50)); break;
            case 'landingField': arrivals = Dice.roll1D6() - 1; break;
            default: arrivals = 0;
        }
        const orbitalStation = eraRank(era) >= eraRank('information') && Dice.chance(stationChance);
        const port = { tier, orbitalStation, militaryBase: false, researchStation: false, weeklyArrivals: arrivals };
        port.militaryBase = Dice.chance(militaryChance);
        port.researchStation = Dice.chance(0.12 + (eraRank(era) >= eraRank('interplanetary') ? 0.1 : 0) +
            (body.habitability < 0.2 ? 0.1 : 0));
        return port;
    }

    drawEconomy(body, population, era, government, rights, port, parent) {
        const base = { stoneAge: 400, bronzeIron: 600, medieval: 900, earlyModern: 1500, industrial: 3000, electrical: 6000,
            atomic: 12000, information: 25000, interplanetary: 60000, interstellar: 120000 }[era];
        const institutions = 0.5 + rights.ruleOfLaw;
        const wealth = 0.8 + 0.4 * body.resources;
        const livingCost = 0.7 + 0.3 * body.habitability;
        const trade = port.tier === 'hub' ? 1.2 : port.tier === 'international' ? 1.1 : 1;
        let perCapita = base * institutions * wealth * livingCost * trade * Math.exp(Dice.normal(0, 0.35));
        const parentPerCapita = parent?.economy?.gdpPerCapita;
        if (parentPerCapita !== undefined) perCapita = (perCapita + parentPerCapita) / 2;
        perCapita = Math.max(perCapita, 250);

        let gini = Dice.normal(0.37, 0.07);
        if (government.regime === 'closedAutocracy') gini += 0.06;
        else if (government.regime === 'liberalDemocracy') gini -= 0.06;
        if (government.form === 'oligarchy' || government.form === 'charteredCompany') gini += 0.08;
        gini = clamp(gini, 0.22, 0.68);

        const lifeExpectancy = clamp(25 + 60 * (1 - Math.exp(-perCapita / 9000)) + Dice.normal(0, 2) +
            (eraRank(era) >= eraRank('interplanetary') ? 8 : 0) - (body.isHazardous ? 3 : 0), 20, 110);
        const health = Math.min((lifeExpectancy - 20) / 65, 1);
        const schooling = { stoneAge: 0.03, bronzeIron: 0.03, medieval: 0.06, earlyModern: 0.12, industrial: 0.3,
            electrical: 0.45, atomic: 0.6, information: 0.75, interplanetary: 0.88, interstellar: 0.95 }[era];
        const education = clamp(schooling + Dice.normal(0, 0.05) + (rights.civilLiberties > 70 ? 0.05 : 0), 0.01, 1);
        const income = clamp((Math.log(perCapita) - Math.log(100)) / (Math.log(75000) - Math.log(100)), 0, 1);
        const hdi = Math.cbrt(Math.max(health, 0.01) * education * Math.max(income, 0.01));

        return { sectors: [], gdpPerCapita: roundSwift(perCapita), gdp: roundSwift(perCapita * population),
            gini: rounded(gini, 2), hdi: rounded(hdi, 3), lifeExpectancy: rounded(lifeExpectancy, 1) };
    }

    sectors(body, population, era, economy, rights, port, society, conflict) {
        const rank = eraRank(era);
        const list = [];
        const canFarm = body.breathable && body.waterPercent >= 20 && body.waterPercent <= 90 &&
            !!body.environment && environmentTemperature(body.environment) === 'temperate';
        if (rank <= eraRank('medieval')) list.push(['subsistence', 10]);
        if (canFarm || rank <= eraRank('earlyModern')) list.push(['agriculture', rank <= eraRank('industrial') ? 8 : 3]);
        if (body.waterPercent >= 70 && body.environment && hasLiquidWater(body.environment) && rank >= eraRank('earlyModern')) {
            list.push(['fishing', 3]);
        }
        if (body.resources > 0.6 || body.isBelt) list.push(['mining', 4 + 4 * body.resources]);
        if (rank >= eraRank('industrial') && population >= 10000000) list.push(['manufacturing', 6]);
        if (rank >= eraRank('atomic') && society.urbanPercent > 60) list.push(['services', 7]);
        if (economy.gdpPerCapita > 50000 && rights.ruleOfLaw > 0.7 && portRank(port.tier) >= portRank('international')) {
            list.push(['finance', 4]);
        }
        if (rank >= eraRank('interplanetary') && (population < 1000000 || port.researchStation)) list.push(['research', 4]);
        if (body.habitability > 0.7 && portRank(port.tier) >= portRank('international') && conflict === 'peace' &&
            society.openness > 50) {
            list.push(['tourism', 3]);
        }
        if (list.length === 0) list.push([rank >= eraRank('industrial') ? 'services' : 'subsistence', 1]);
        const wobbled = list.map(([sector, weight]) => [sector, weight * Dice.uniform(0.6, 1.4)]);
        const sorted = wobbled.slice().sort((a, b) => (a[1] > b[1] ? -1 : b[1] > a[1] ? 1 : 0));
        return sorted.slice(0, 3).map(([sector]) => sector);
    }

    drawSociety(body, population, era, government, rights, economy, port) {
        let urban;
        switch (era) {
            case 'stoneAge': urban = Dice.uniform(0, 3); break;
            case 'bronzeIron': urban = Dice.uniform(3, 10); break;
            case 'medieval': urban = Dice.uniform(8, 15); break;
            case 'earlyModern': urban = Dice.uniform(10, 20); break;
            case 'industrial': urban = Dice.uniform(25, 50); break;
            case 'electrical': urban = Dice.uniform(40, 60); break;
            case 'atomic': urban = Dice.uniform(50, 70); break;
            case 'information': urban = Dice.uniform(55, 85); break;
            case 'interplanetary': urban = Dice.uniform(65, 95); break;
            default: urban = Dice.uniform(70, 98);
        }
        if (!body.breathable) urban = Dice.uniform(92, 100);
        if (population < 5000) urban = 100;
        const urbanPopulation = population * urban / 100;

        const primacy = population < 100000 ? 1 : Dice.uniform(0.08, 0.35);
        const largest = Math.max(Math.trunc(urbanPopulation * primacy), Math.min(population, 50));
        let harmonic = 0.0;
        let cities = 0;
        while (cities < 100000 && largest * (harmonic + 1 / (cities + 1)) <= urbanPopulation) {
            cities += 1;
            harmonic += 1 / cities;
        }
        const overMillion = Math.min(Math.trunc(largest / 1000000), Math.max(cities, 1));

        const diversity = clamp(Dice.normal(0.25 + 0.04 * Math.log10(Math.max(population, 1)), 0.15) +
            (government.states > 1 ? 0.15 : 0), 0.01, 0.95);
        const prosperity = (Math.log10(Math.max(economy.gdpPerCapita, 300)) - 3.5) / 1.5;
        const secular = clamp(prosperity * 1.2 + Dice.normal(0, 0.6) - (government.form === 'theocracy' ? 1 : 0), -2, 2);
        const expression = clamp(prosperity + (rights.civilLiberties - 50) / 40 + Dice.normal(0, 0.5), -2, 2);
        const openness = Math.trunc(roundSwift(clamp(35 + 0.35 * rights.civilLiberties + portRank(port.tier) * 5 +
            Dice.normal(0, 12), 2, 98)));
        return { urbanPercent: Math.trunc(roundSwift(urban)), largestCity: largest, citiesOverMillion: overMillion,
            diversity: rounded(diversity, 2), traditionalSecular: rounded(secular, 2),
            survivalSelfExpression: rounded(expression, 2), openness };
    }

    drawConflict(government, rights, economy, population) {
        let risk = (economy.gini - 0.3) * 4 + Dice.normal(0, 0.9);
        if (government.states > 1) risk += 0.8;
        if (government.regime === 'closedAutocracy' || government.regime === 'electoralAutocracy') risk += 0.4;
        if (rights.ruleOfLaw < 0.3) risk += 0.5;
        if (population < 10000) risk -= 0.8;
        if (risk < 1.2) return 'peace';
        if (risk < 2.0) return 'unrest';
        if (risk < 2.6) return 'armedConflict';
        return 'war';
    }

    drawDefence(body, population, era, government, economy, conflict, port) {
        let percent = Math.max(Dice.normal(1.8, 0.8), 0.1);
        if (government.form === 'militaryJunta') percent += 1.5;
        if (government.regime === 'closedAutocracy') percent += 1;
        percent += conflictRank(conflict) * 1.5;
        if (port.militaryBase) percent += 0.5;
        percent = Math.min(percent, 15);

        const rank = eraRank(era);
        const branches = [];
        if (government.form === 'stateless' || population < 100000) branches.push('militia');
        if (population >= 10000) branches.push('army');
        if (body.waterPercent >= 20 && body.environment && hasLiquidWater(body.environment) && population >= 1000000 &&
            rank >= eraRank('earlyModern')) branches.push('navy');
        if ((body.environment?.pressureBar ?? 0) >= 0.1 && rank >= eraRank('electrical') && population >= 1000000) {
            branches.push('airForce');
        }
        if (rank >= eraRank('information') && portRank(port.tier) >= portRank('regional')) branches.push('spaceForce');
        if (branches.length === 0) branches.push('militia');

        const personnel = population * Dice.uniform(0.002, 0.008) * (1 + conflictRank(conflict) * 0.5);
        return { spendingPercent: rounded(percent, 2), spending: roundSwift(economy.gdp * percent / 100),
            activePersonnel: Math.trunc(roundSwift(personnel)), branches };
    }

    suggestedAdvisory(body, government, rights, society, conflict) {
        if (conflict === 'war') return 'noTravel';
        if (government.regime === 'closedAutocracy' && society.openness < 15 && Dice.chance(0.5)) return 'noTravel';
        if (conflict === 'armedConflict' || rights.civilLiberties < 15 || rights.ruleOfLaw < 0.2) return 'essentialOnly';
        if (body.isHazardous && Dice.chance(0.3)) return 'essentialOnly';
        return undefined;
    }

    // MARK: settlements

    secondary(body, main) {
        if (!Dice.chance(0.12 + 0.4 * body.habitability + 0.1 * body.resources)) return null;
        const independent = Dice.chance(0.15);
        const purposes = [];
        if (body.habitability > 0.6 && body.breathable && body.waterPercent >= 10 && Dice.chance(0.6)) purposes.push('farming');
        if ((body.resources > 0.5 || body.isBelt) && Dice.chance(0.7)) purposes.push('mining');
        if (Dice.chance(0.2)) purposes.push('research');
        if (main.port.militaryBase && Dice.chance(0.15)) purposes.push('military');
        const democratic = main.government?.regime !== undefined ? isDemocracy(main.government.regime) : true;
        if (!democratic && Dice.chance(0.06)) purposes.push('penal');
        if (independent && Dice.chance(0.25)) purposes.push('freePort');
        if (purposes.length === 0 || body.habitability > 0.5) purposes.unshift('colony');

        const ceiling = Math.max(Math.trunc(main.population / Math.trunc(Math.pow(10, Dice.uniform(1, 3)))), 10);
        const population = this.drawPopulation(body, ceiling);
        const mainEra = main.techEra ?? 'interplanetary';
        let era = independent ? eraOffset(mainEra, Math.trunc(-Dice.roll1D6() / 4)) : mainEra;
        if (eraRank(era) < eraRank('information')) era = 'information';
        const settlement = { independent, purposes: purposes.slice(0, 3) };
        const social = this.society(body, population, era, settlement, main);
        if (!independent && social.defence) {
            let branches = social.defence.branches.filter((b) => b !== 'navy' && b !== 'spaceForce');
            if (branches.length === 0) branches = ['militia'];
            social.defence = { ...social.defence, branches };
        }
        return social;
    }
}
