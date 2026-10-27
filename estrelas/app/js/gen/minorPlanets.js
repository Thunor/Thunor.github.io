//
//  minorPlanets.js
//  Estrelas (web)
//
//  The minor planets of asteroid belts: a few of the belt's largest bodies, from about 150 km across to Ceres' size,
//  each on its own tilted, slightly eccentric orbit through the belt. They're worlds of their own, listed after their
//  belt, with surfaces that can be mapped and, round a spacefaring main world, people living on them. Each belt's are
//  drawn from its own reseeding of the shared generator (from its system's id and its designation), after everything
//  else, so they change no other roll, and belts saved before them get them the first time they're read.
//

import { rng, roundSwift } from './random.js';
import { Dice, romanNumeral } from './stellar.js';
import { environment as physicalEnvironment, snowLine } from './planetarySystemGenerator.js';
import { settleMinorPlanets } from './socialGenerator.js';
import { PlanetPhysics, insolation, luminosityScale } from '../model/planetarySystem.js';

/** Whether a belt still has its minor planets to draw */
const undrawn = (world) => world.type === 'asteroidBelt' && !world.minorPlanetsDrawn;

export const isMinorPlanet = (world) => !!world?.minorPlanet;

/** Whether any belt among these systems is missing its minor planets */
export function minorPlanetsAreMissing(systems) {
    return systems.some((system) => (system.planetarySystem?.worlds ?? []).some(undrawn));
}

/** 32 bits of FNV-1a over a belt's place */
function beltSeed(systemID, designation) {
    let hash = 0x811C9DC5;
    for (const byte of new TextEncoder().encode(`minor planets/${systemID}/${designation}`)) {
        hash = Math.imul(hash ^ byte, 0x01000193) >>> 0;
    }
    return hash;
}

const rounded = (value, places) => roundSwift(value * 10 ** places) / 10 ** places;

/** Draws the minor planets of every belt that has none yet, placing them after their belt */
export function generateMinorPlanets(systems) {
    const saved = rng.state;
    try {
        for (const system of systems) {
            const planetary = system.planetarySystem;
            if (!planetary?.worlds?.some(undrawn)) continue;
            const worlds = [];
            for (const world of planetary.worlds) {
                worlds.push(world);
                if (!undrawn(world)) continue;
                rng.reseed(beltSeed(system.id ?? '', world.designation));
                const minorPlanets = drawMinorPlanets(world, planetary.age ?? 4.5);
                world.minorPlanetsDrawn = true;
                worlds.push(...minorPlanets);
                settleMinorPlanets({ ...planetary, worlds: planetary.worlds }, minorPlanets);
            }
            planetary.worlds = worlds;
        }
    } finally {
        rng.state = saved;
    }
}

function drawMinorPlanets(belt, age) {
    // Two to five, mostly a few hundred kilometres across; now and then one as large as Ceres
    const count = 2 + rng.int(0, 3);
    const radii = [];
    for (let i = 0; i < count; i++) radii.push(Dice.logUniform(75, i === 0 && Dice.chance(0.4) ? 480 : 280));
    radii.sort((a, b) => b - a);
    const beyondSnow = belt.au >= snowLine * luminosityScale(belt);
    return radii.map((radiusKm, index) => {
        // Spread across the belt, each on an orbit of its own
        const au = belt.au * (1 + Dice.uniform(-0.045, 0.045));
        const density = beyondSnow ? Dice.uniform(1.6, 2.4) : Dice.uniform(2.2, 3.4);
        const massEarths = 4 / 3 * Math.PI * Math.pow(radiusKm * 1000, 3) * density * 1000 / PlanetPhysics.earthMassKg;
        const world = {
            designation: `${belt.designation} ${romanNumeral(index + 1)}`, type: 'terrestrial', minorPlanet: true,
            belt: belt.designation, parentLabel: belt.parentLabel, orbitedStarIDs: [...(belt.orbitedStarIDs ?? [])],
            au: rounded(au, 4), eccentricity: rounded(Dice.uniform(0.02, 0.2), 3), inclination: rounded(Dice.uniform(0, 14), 1),
            period: belt.period * Math.pow(au / belt.au, 1.5), anomaly: undefined, radiusKm: roundSwift(radiusKm),
            massEarths: rounded(massEarths, 6), gasGiant: undefined, rings: 0, moons: [], starLuminosity: belt.starLuminosity,
            inHabitableZone: belt.inHabitableZone, environment: undefined, isPrincipal: false, resonance: undefined,
        };
        world.environment = physicalEnvironment(world.radiusKm, world.massEarths, insolation(world), age, beyondSnow);
        return world;
    });
}
