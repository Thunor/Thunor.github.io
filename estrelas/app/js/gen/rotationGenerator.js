//
//  rotationGenerator.js
//  Estrelas (web)
//
//  Draws how each planet and moon turns: its day length, axial tilt and any tidal lock. Tidal locking follows the
//  despinning timescale of Gladman et al. (1996). Every world has its own random numbers, drawn from a hash of its
//  system's id and its designation, so the shared generator isn't touched. A port of RotationGenerator.swift.
//

import { roundSwift } from './random.js';
import { PlanetPhysics } from '../model/planetarySystem.js';
import { generateMinorPlanets, minorPlanetsAreMissing } from './minorPlanets.js';

const MASK64 = (1n << 64n) - 1n;

/** SplitMix64 seeded from a world's place, so its rolls never depend on any other world's */
class Roller {
    constructor(systemID, designation) {
        // FNV-1a over the UTF-8 bytes, as the Mac app hashes them
        let hash = 0xCBF29CE484222325n;
        for (const byte of new TextEncoder().encode(`rotation/${systemID}/${designation}`)) {
            hash = ((hash ^ BigInt(byte)) * 0x100000001B3n) & MASK64;
        }
        this.state = hash;
    }

    next() {
        this.state = (this.state + 0x9E3779B97F4A7C15n) & MASK64;
        let z = this.state;
        z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & MASK64;
        z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & MASK64;
        return z ^ (z >> 31n);
    }

    /** A whole number from 0 up to, not including, `bound` */
    below(bound) {
        return Number(this.next() % BigInt(bound));
    }

    /** Uniform in 0 to 1 */
    unit() {
        return Number(this.next() >> 11n) / 2 ** 53;
    }

    /** Standard normal, by Box–Muller */
    normal() {
        const u1 = Math.max(this.unit(), 1e-12), u2 = this.unit();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }
}

/**
 * Gives every planet and moon that hasn't one its rotation. `principalLockChance` is the share of principal worlds
 * left locked where the tides would lock them; at 1 (the default) rotation follows the tides alone.
 */
export function generateRotations(systems, principalLockChance = 1) {
    // Belts' minor planets first (after societies, as they may have people), so they're turned like any other world
    generateMinorPlanets(systems);
    for (const system of systems) {
        const planetary = system.planetarySystem;
        if (!planetary) continue;
        const systemID = system.id ?? '';
        for (const world of planetary.worlds ?? []) {
            if (world.type !== 'asteroidBelt' && world.rotation == null) {
                world.rotation = worldRotation(world, planetary, new Roller(systemID, world.designation),
                    world.isPrincipal ? principalLockChance : 1);
            }
            for (const moon of world.moons ?? []) {
                if (moon.rotation == null) {
                    moon.rotation = moonRotation(moon, new Roller(systemID, moon.designation),
                        moon.isPrincipal ? principalLockChance : 1);
                }
            }
        }
    }
}

/** Whether any planet or moon has no rotation yet, as in star fields saved before it was rolled */
export function rotationIsMissing(systems) {
    if (minorPlanetsAreMissing(systems)) return true;
    return systems.some((system) => (system.planetarySystem?.worlds ?? []).some((world) =>
        (world.type !== 'asteroidBelt' && world.rotation == null) || (world.moons ?? []).some((m) => m.rotation == null)));
}

const gravitationalConstant = 6.674e-11;
const solarMassKg = 1.989e30;
const metresPerAU = 1.496e11;

/** Whether a world the tides would lock stays locked; nothing is drawn at a chance of 1 */
function keepsLock(chance, dice) {
    return chance >= 1 || dice.unit() < chance;
}

function worldRotation(world, system, dice, lockChance = 1) {
    const direction = dice.below(360);
    const orbited = world.orbitedStarIDs ?? [];
    const starMass = (system.stars ?? []).filter((s) => orbited.includes(s.estrelaID)).reduce((sum, s) => sum + s.mass, 0);
    const isGiant = world.gasGiant != null;
    // Time for the star's tides to stop the world turning: t = ω a⁶ I Q / (3 G M² k₂ R⁵), with I = 0.4 m R²
    const omega = 2 * Math.PI / (12 * 3600);
    const a = world.au * metresPerAU;
    const mass = Math.max(world.massEarths, 1e-6) * PlanetPhysics.earthMassKg;
    const radius = Math.max(world.radiusKm, 1) * 1000;
    const q = isGiant ? 1e5 : 100;
    const seconds = omega * Math.pow(a, 6) * 0.4 * mass * q /
        (3 * gravitationalConstant * Math.pow(Math.max(starMass, 0.05) * solarMassKg, 2) * 0.3 * Math.pow(radius, 3));
    const lockYears = seconds / 3.156e7;
    if (lockYears < (system.age ?? 0) * 1e9 && world.period > 0 && keepsLock(lockChance, dice)) {
        // An eccentric orbit tends to catch the world in a 3:2 spin-orbit resonance instead, like Mercury
        const resonance = world.eccentricity > 0.1 && dice.below(3) > 0;
        const orbitHours = world.period * 365.25 * 24;
        return rotationRecord(resonance ? orbitHours * 2 / 3 : orbitHours, dice.below(30) / 10, direction,
            resonance ? 'star3:2' : 'star');
    }
    const hours = dayHours(isGiant, system.age ?? 0, dice);
    return rotationRecord(hours, axialTilt(dice), direction, undefined);
}

/** Almost every large moon keeps one face to its planet; the odd captured one turns freely */
function moonRotation(moon, dice, lockChance = 1) {
    const direction = dice.below(360);
    if (moon.gasGiant == null && dice.below(12) > 0 && keepsLock(lockChance, dice)) {
        return rotationRecord(undefined, dice.below(30) / 10, direction, 'planet');
    }
    const hours = dayHours(moon.gasGiant != null, 0, dice);
    return rotationRecord(hours, axialTilt(dice), direction, undefined);
}

/** Keys in the order WorldRotation declares them; the encoder sorts them anyway */
function rotationRecord(dayHours, axialTilt, tiltDirection, tidalLock) {
    return { dayHours, axialTilt, tiltDirection, tidalLock };
}

/** Giants spin in about 10–17 hours, rocky worlds in about 10–30 hours when young and slower as they age */
function dayHours(isGiant, age, dice) {
    let hours;
    if (isGiant) {
        hours = 9.5 + dice.unit() * 8;
    } else {
        hours = 10 * Math.exp(dice.normal() * 0.45) + Math.max(age, 0) * 2;
        if (dice.below(10) === 0) hours *= 10 + dice.unit() * 200;
    }
    return roundSwift(hours * 100) / 100;
}

/** Degrees: most worlds lean by up to about 30°; a giant impact can knock one far over */
function axialTilt(dice) {
    if (dice.below(20) === 0) return roundSwift(dice.unit() * 1800) / 10;
    return roundSwift(Math.min(Math.abs(dice.normal() * 18), 89) * 10) / 10;
}

/** Spinning the opposite way to its orbit */
export function isRetrograde(rotation) {
    return rotation?.axialTilt > 90;
}
