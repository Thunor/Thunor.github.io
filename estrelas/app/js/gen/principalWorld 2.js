//
//  principalWorld.js
//  Estrelas (web)
//
//  A planetary system built round a principal world already known — from a chart, or set by hand — rather than one
//  chosen from whatever was generated. The system is generated as usual; then the slot that best suits the known world
//  (or a giant's largest moon, or a belt) becomes it, with the size, air and water it's known to have and the
//  temperature its orbit gives it, and gas giants and belts are added or taken away to match the counts known.
//  A port of PrincipalWorld.swift.
//
//  Requirements: { radiusKm (0 for a belt), atmosphere, pressureBar, contaminated, waterPercent, isMoon, gasGiants,
//  belts } — the counts of giants and belts besides the principal world, or null to keep what's generated.
//

import { Dice } from './stellar.js';
import { setRequirementsHandler, environment as generatedEnvironment, snowLine } from './planetarySystemGenerator.js';
import { PlanetPhysics, giantClassForMass, insolation as insolationOf, luminosityScale } from '../model/planetarySystem.js';

const isBelt = (requirements) => !(requirements.radiusKm > 0);
const roundSwift = (x) => (x < 0 ? -Math.round(-x) : Math.round(x));

/**
 * Reshapes `worlds` to the requirements and marks the principal world; designations are assigned afterwards. `host`
 * is a world round the system's primary, whose stars and starlight any world added goes round when there's no other
 * world to go by.
 */
export function applyRequirements(generator, requirements, worlds, age, host) {
    adjustCount(generator, 'gasGiant', requirements.gasGiants, worlds, age, host);
    adjustCount(generator, 'asteroidBelt', requirements.belts == null ? null : requirements.belts + (isBelt(requirements) ? 1 : 0),
        worlds, age, host);
    if (!worlds.length) {
        // At the distance its starlight wants, roughly; it's moved to exactly that below
        const au = Math.sqrt(host.starLuminosity / 0.8);
        worlds.push(newWorld(generator, isBelt(requirements) ? 'asteroidBelt' : 'terrestrial', au, host, age));
        applyRequirements(generator, requirements, worlds, age, host);
        return;
    }

    // How well an orbit suits the known world: liquid water wants the habitable zone, thin cold air and ice want it
    // farther out, a dense, hot atmosphere nearer in
    const { atmosphere, waterPercent, pressureBar } = requirements;
    let wanted;
    if (atmosphere === 'sulfuric') wanted = 1.6;
    else if (atmosphere === 'carbonDioxide' && pressureBar > 5) wanted = 1.6;
    else if (atmosphere === 'nitrogenOxygen' || waterPercent >= 10) wanted = 0.8;
    else if (atmosphere === 'none' || atmosphere === 'trace') wanted = waterPercent > 0 ? 0.25 : 1;
    else wanted = 0.6;
    const fit = (insolation) => Math.abs(Math.log(Math.max(insolation, 1e-6) / wanted));
    const best = (indices) => indices.reduce((b, i) => (b === null || fit(insolationOf(worlds[i])) < fit(insolationOf(worlds[b])) ? i : b), null);
    const indicesOf = (type) => worlds.map((w, i) => (w.type === type ? i : -1)).filter((i) => i >= 0);

    if (isBelt(requirements)) {
        worlds[best(indicesOf('asteroidBelt')) ?? 0].isPrincipal = true;
        return;
    }
    // The best slot can still be far off: a world with seas and air like Earth's drawn on a chart can't be frozen
    // solid or baking. Its orbit (a moon's planet's) is moved to get the starlight it needs.
    const tolerance = Math.log(1.5);
    try {
        const giant = requirements.isMoon ? best(indicesOf('gasGiant')) : null;
        if (giant !== null) {
            if (fit(insolationOf(worlds[giant])) > tolerance) move(giant, wanted, worlds);
            const planet = worlds[giant];
            if (!planet.moons.length) planet.moons.push({ designation: '', radiusKm: 1000, massEarths: 0.01, environment: undefined, isPrincipal: false });
            let moon = 0;
            planet.moons.forEach((m, i) => { if (m.radiusKm > planet.moons[moon].radiusKm) moon = i; });
            const target = planet.moons[moon];
            target.radiusKm = roundSwift(requirements.radiusKm);
            target.massEarths = PlanetPhysics.rockyMass(requirements.radiusKm);
            target.environment = knownEnvironment(requirements, insolationOf(planet), age);
            target.isPrincipal = true;
            return;
        }
        // The best-suited rocky world, or a giant's orbit given over to one if there's no rocky world at all
        let index = best(indicesOf('terrestrial'));
        if (index !== null) {
            if (fit(insolationOf(worlds[index])) > tolerance) move(index, wanted, worlds);
        } else {
            const au = Math.sqrt(worlds[0].starLuminosity / wanted);
            const added = newWorld(generator, 'terrestrial', au, worlds[0], age);
            worlds.push(added);
            sortByAU(worlds);
            index = worlds.indexOf(added);
        }
        const world = worlds[index];
        world.radiusKm = roundSwift(requirements.radiusKm);
        world.massEarths = PlanetPhysics.rockyMass(requirements.radiusKm);
        world.environment = knownEnvironment(requirements, insolationOf(world), age);
        world.isPrincipal = true;
    } finally {
        sortByAU(worlds);
    }
}

function sortByAU(worlds) {
    const sorted = worlds.map((w, i) => [w, i]).sort((a, b) => a[0].au - b[0].au || a[1] - b[1]).map(([w]) => w);
    worlds.splice(0, worlds.length, ...sorted);
}

/** Moves a world round the same star(s) to where it gets `insolation`, trading places with any world of theirs already near there */
function move(index, insolation, worlds) {
    const old = worlds[index].au;
    // Not exactly there, so such worlds' climates differ, some cooler and some warmer
    const au = Math.sqrt(worlds[index].starLuminosity / (insolation * Dice.uniform(0.8, 1.25)));
    const crowding = worlds.findIndex((other, i) => i !== index && other.parentLabel === worlds[index].parentLabel &&
        Math.abs(Math.log(other.au / au)) < 0.1);
    if (crowding >= 0) setOrbit(worlds[crowding], old);
    setOrbit(worlds[index], au);
}

function setOrbit(world, au) {
    world.period *= Math.pow(au / Math.max(world.au, 1e-9), 1.5);
    world.au = au;
    world.resonance = undefined;
    const i = insolationOf(world);
    world.inHabitableZone = i >= 0.35 && i <= 1.1;
}

/** The known air and water, at the temperature the world's starlight and air give it */
function knownEnvironment(requirements, insolation, age) {
    const mass = PlanetPhysics.rockyMass(requirements.radiusKm);
    const environment = generatedEnvironment(requirements.radiusKm, mass, insolation, age, insolation < 1 / (snowLine * snowLine));
    // Its own air instead of what its size and orbit would give it, warmed by its greenhouse: a few tens of kelvin for
    // air like Earth's, hundreds for a dense carbon dioxide or sulfuric shroud
    const bare = 278.6 * Math.pow(insolation, 0.25) * Math.pow(0.7, 0.25);
    const pressure = requirements.pressureBar;
    let greenhouse;
    switch (requirements.atmosphere) {
        case 'none': case 'trace': greenhouse = 0; break;
        case 'carbonDioxide': case 'sulfuric': greenhouse = pressure > 5 ? 450 * Math.pow(pressure / 90, 0.3) : 30; break;
        case 'hydrogen': case 'methane': greenhouse = 25 * Math.pow(Math.max(pressure, 0.01), 0.4); break;
        default: greenhouse = 33 * Math.pow(Math.max(pressure, 0.01), 0.3);
    }
    environment.atmosphere = requirements.atmosphere;
    environment.pressureBar = pressure;
    environment.contaminated = requirements.contaminated;
    environment.waterPercent = requirements.waterPercent;
    environment.temperatureK = roundSwift(bare + greenhouse);
    return environment;
}

/**
 * Adds or takes away worlds of a type (gas giants or belts) until there are `wanted`: extra ones are taken from the
 * outside in; missing ones take over the outermost rocky worlds beyond the snow line, or go farther out
 */
function adjustCount(generator, type, wanted, worlds, age, host) {
    if (wanted == null) return;
    const have = () => worlds.map((w, i) => (w.type === type ? i : -1)).filter((i) => i >= 0);
    let current = have();
    while (current.length > wanted) {
        worlds.splice(current[current.length - 1], 1);
        current = have();
    }
    while (current.length < wanted) {
        const snow = snowLine * luminosityScale(worlds[0] ?? host);
        let rocky = -1;
        for (let i = worlds.length - 1; i >= 0; i--) {
            // Belts can lie anywhere; giants form beyond the snow line
            const w = worlds[i];
            if (w.type === 'terrestrial' && !w.isPrincipal && (type === 'asteroidBelt' || w.au >= snow)) {
                rocky = i;
                break;
            }
        }
        if (rocky >= 0 && Dice.chance(0.7)) {
            worlds[rocky] = newWorld(generator, type, worlds[rocky].au, worlds[rocky], age);
        } else {
            const outer = Math.max(Math.max(...worlds.map((w) => w.au), snow), snow) * Dice.uniform(1.5, 2);
            worlds.push(newWorld(generator, type, outer, worlds[worlds.length - 1] ?? host, age));
        }
        sortByAU(worlds);
        current = have();
    }
}

/** A world of `type` at `au`, in the same place round the same stars as `template` */
function newWorld(generator, type, au, template, age) {
    const luminosity = template?.starLuminosity ?? 1;
    const starMass = Math.max(Math.pow(luminosity, 0.25), 0.1);
    const insolation = luminosity / (au * au);
    const world = {
        designation: '', type, parentLabel: template?.parentLabel ?? '', orbitedStarIDs: [...(template?.orbitedStarIDs ?? [])],
        au, eccentricity: Dice.uniform(0, 0.08), inclination: Math.abs(Dice.normal(0, 1.5)),
        period: Math.sqrt(Math.pow(au, 3) / starMass), anomaly: undefined, radiusKm: 0, massEarths: 0.0005,
        gasGiant: undefined, rings: 0, moons: [], starLuminosity: luminosity,
        inHabitableZone: insolation >= 0.35 && insolation <= 1.1, resonance: undefined, isPrincipal: false,
    };
    if (type === 'gasGiant') {
        const mass = 50 * Math.pow(10, Math.pow(Dice.uniform(0, 1), 1.4) * 1.9);
        const radius = PlanetPhysics.giantRadius(mass);
        world.massEarths = Math.round(mass * 100) / 100;
        world.radiusKm = Math.round(radius * PlanetPhysics.earthRadiusKm);
        world.gasGiant = { giantClass: giantClassForMass(mass), radiusEarths: Math.round(radius * 100) / 100, massEarths: world.massEarths };
        const { moons, rings } = generator.moons(world, starMass * PlanetPhysics.earthMassesPerSolarMass, age, true);
        world.moons = moons;
        world.rings = rings;
    } else if (type === 'terrestrial') {
        world.radiusKm = Math.round(Dice.uniform(0.5, 1.4) * PlanetPhysics.earthRadiusKm);
        world.massEarths = PlanetPhysics.rockyMass(world.radiusKm);
        world.environment = generatedEnvironment(world.radiusKm, world.massEarths, insolation, age,
            au >= snowLine * luminosityScale(world));
    }
    return world;
}

setRequirementsHandler(applyRequirements);
