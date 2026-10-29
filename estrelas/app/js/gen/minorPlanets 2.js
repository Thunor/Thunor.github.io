//
//  minorPlanets.js
//  Estrelas (web)
//
//  The minor planets of asteroid belts: a few of the belt's largest bodies, from about 30 km across to a round 700 km,
//  each on its own tilted orbit in a lane of its own across the belt, crossing no other world's. They're worlds of
//  their own, listed after their belt, with surfaces that can be mapped and, round a spacefaring main world, people
//  living on them. Each belt's are drawn from its own reseeding of the shared generator (from its system's id and its
//  designation), after everything else, so they change no other roll, and belts saved before them get them the
//  first time they're read.
//

import { rng, roundSwift } from './random.js';
import { Dice, romanNumeral } from './stellar.js';
import { environment as physicalEnvironment, snowLine } from './planetarySystemGenerator.js';
import { settleMinorPlanets } from './socialGenerator.js';
import { PlanetPhysics, insolation, luminosityScale } from '../model/planetarySystem.js';

/** Bumped when minor planets are drawn differently, so belts drawn before are drawn again */
const minorPlanetsVersion = 4;

/** Whether a belt still has its minor planets to draw, or has ones drawn by an earlier version */
const undrawn = (world) => world.type === 'asteroidBelt' && world.minorPlanetsDrawn !== minorPlanetsVersion;

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
            const redrawn = new Set(planetary.worlds.filter(undrawn).map((belt) => belt.designation));
            const worlds = [];
            for (const world of planetary.worlds) {
                // Any an earlier version drew go, to be drawn again
                if (world.minorPlanet && redrawn.has(world.belt)) continue;
                worlds.push(world);
                if (!undrawn(world)) continue;
                rng.reseed(beltSeed(system.id ?? '', world.designation));
                const minorPlanets = drawMinorPlanets(world, planetary.age ?? 4.5);
                world.minorPlanetsDrawn = minorPlanetsVersion;
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
    // Two to five, mostly some tens of kilometres across, a few over a hundred; now and then one large enough to be round
    const count = 2 + rng.int(0, 3);
    const radii = [];
    for (let i = 0; i < count; i++) radii.push(Dice.logUniform(15, i === 0 && Dice.chance(0.3) ? 350 : 130));
    radii.sort((a, b) => b - a);
    const beyondSnow = belt.au >= snowLine * luminosityScale(belt);
    // Each in a lane of its own across the belt, so no two orbits cross, and none reaches out of the belt to another
    // world's: the lanes in a random order, each orbit nearly round within its lane
    const lanes = radii.map((_, index) => index);
    for (let i = lanes.length - 1; i > 0; i--) {
        const j = rng.int(0, i);
        [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
    }
    const laneWidth = 0.08 / count;
    return radii.map((radiusKm, index) => {
        const offset = -0.04 + laneWidth * (lanes[index] + 0.5 + Dice.uniform(-0.15, 0.15));
        const au = belt.au * (1 + offset);
        // Out and in no further than a third of its lane either side
        const eccentricity = laneWidth / 3 * Dice.uniform(0.1, 1) / (1 + offset);
        const density = beyondSnow ? Dice.uniform(1.6, 2.4) : Dice.uniform(2.2, 3.4);
        const massEarths = 4 / 3 * Math.PI * Math.pow(radiusKm * 1000, 3) * density * 1000 / PlanetPhysics.earthMassKg;
        const world = {
            designation: `${belt.designation} ${romanNumeral(index + 1)}`, type: 'terrestrial', minorPlanet: true,
            belt: belt.designation, parentLabel: belt.parentLabel, orbitedStarIDs: [...(belt.orbitedStarIDs ?? [])],
            au: rounded(au, 4), eccentricity: rounded(eccentricity, 4), inclination: rounded(Dice.uniform(0, 10), 1),
            period: belt.period * Math.pow(au / belt.au, 1.5), anomaly: undefined, radiusKm: roundSwift(radiusKm),
            massEarths: rounded(massEarths, 6), gasGiant: undefined, rings: 0, moons: [], starLuminosity: belt.starLuminosity,
            inHabitableZone: belt.inHabitableZone, environment: undefined, isPrincipal: false, resonance: undefined,
        };
        world.environment = physicalEnvironment(world.radiusKm, world.massEarths, insolation(world), age, beyondSnow);
        // Far too small to hold on to any air: whatever gas they had escaped long ago
        if (world.environment && world.environment.atmosphere !== 'none') {
            world.environment = { ...world.environment, atmosphere: 'none', pressureBar: 0 };
        }
        return world;
    });
}
