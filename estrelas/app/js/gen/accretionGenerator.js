//
//  accretionGenerator.js
//  Estrelas (web)
//
//  Forms planets by Stephen H. Dole's simulation of accretion ("Formation of Planetary Systems by Aggregation: a
//  Computer Simulation", RAND P-4226, 1969), as ported from Matt Burdick's accrete: protoplanets dropped one at a time
//  into a disc of dust and gas sweep up the dust their orbits reach, the larger ones pulling in gas to become giants,
//  and merge where their bands overlap, until no dust is left. Runs of tiny planetoids are merged into belts. A
//  line-for-line port of AccretionGenerator.swift: every draw is made in the same order, so the same seed gives the
//  same systems.
//

import { roundSwift } from './random.js';
import { Dice } from './stellar.js';
import { PlanetPhysics } from '../model/planetarySystem.js';

// Constants from accrete's CONST.H
const eccentricityCoefficient = 0.077;
const protoplanetMass = 1.0e-15;
const gasDustRatio = 50.0;
const criticalMassB = 1.2e-5;
const dustDensityCoefficient = 2.0e-3;
const alpha = 5.0;
const n = 3.0;
const cloudEccentricity = 0.2;
/** Rocky bodies lighter than this (Earth masses) are planetoids, merged into belts where they run together */
const beltMassLimit = 0.01;
/** Guards against a disc that never quite runs out of dust */
const maximumDrops = 20000;

export class AccretionGenerator {

    /**
     * `stellarMass` in solar masses and `luminosity` in solar luminosities, of the star or close pair the disc circles
     */
    constructor(stellarMass, luminosity) {
        this.stellarMass = Math.max(stellarMass, 0.01);
        this.luminosity = Math.max(luminosity, 1e-12);
        this.dustBands = [];
        this.planets = [];
        this.dustLeft = true;
        this.rInner = 0;
        this.rOuter = 0;
        this.reducedMass = 0;
        this.dustDensity = 0;
    }

    /**
     * Accretes the planets of a disc: [{ au, eccentricity, massEarths, isGasGiant, beltRange }]. Protoplanets only
     * form within `ranges` ([lower, upper] AU), the stable orbits round the star; the gaps between them, swept clear by
     * other stars, hold no dust.
     */
    generate(ranges) {
        if (ranges.length === 0) return [];
        const first = ranges[0];
        const last = ranges[ranges.length - 1];
        const cubeRootMass = Math.cbrt(this.stellarMass);
        // Dole's 0.3·M^⅓ AU inner edge, brought in as far as 0.5·√L AU for faint stars so red dwarfs get close-in
        // planets, as observed; and his 50·M^⅓ AU outer edge, in a disc reaching 200·M^⅓ AU
        const innerBound = Math.max(Math.min(0.3 * cubeRootMass, 0.5 * Math.sqrt(this.luminosity)), first[0]);
        const outerBound = Math.min(50 * cubeRootMass, last[1]);
        if (!(innerBound < outerBound)) return [];
        const allowed = [];
        for (const range of ranges) {
            const lower = Math.max(range[0], innerBound);
            const upper = Math.min(range[1], outerBound);
            if (lower < upper) allowed.push([lower, upper]);
        }
        if (allowed.length === 0) return [];

        const outerDust = Math.min(200 * cubeRootMass, last[1]);
        this.dustBands = makeDustBands(first[0], Math.max(outerDust, outerBound), allowed);
        this.planets = [];
        this.dustLeft = true;
        const bounds = [innerBound, outerBound];

        const total = allowed.reduce((sum, range) => sum + range[1] - range[0], 0);
        let drops = 0;
        while (this.dustLeft && drops < maximumDrops) {
            drops += 1;
            const a = randomDistance(allowed, total);
            const e = 1 - Math.pow(Dice.uniform(0, 1), eccentricityCoefficient);
            if (!this.dustAvailable(this.innerEffectLimit(a, e, protoplanetMass), this.outerEffectLimit(a, e))) continue;

            this.dustDensity = dustDensityCoefficient * Math.sqrt(this.stellarMass) * Math.exp(-alpha * Math.pow(a, 1 / n));
            const critical = this.criticalLimit(a, e);
            const mass = this.accreteDust(protoplanetMass, a, e, critical, bounds);
            if (mass !== 0 && mass !== protoplanetMass) this.coalesce(a, e, mass, critical, bounds);
        }
        return mergeBelts(this.planets.map((planet) => ({
            au: planet.a, eccentricity: planet.e, massEarths: planet.mass * PlanetPhysics.earthMassesPerSolarMass,
            isGasGiant: planet.isGasGiant, beltRange: undefined,
        })));
    }

    // MARK: ACCRETE.C

    innerEffectLimit(a, e, mass) {
        return a * (1 - e) * (1 - mass) / (1 + cloudEccentricity);
    }

    /** As in the original, this uses the current `reducedMass`, not the body's mass */
    outerEffectLimit(a, e) {
        return a * (1 + e) * (1 + this.reducedMass) / (1 - cloudEccentricity);
    }

    dustAvailable(inside, outside) {
        const bands = this.dustBands;
        let index = 0;
        while (index < bands.length && bands[index].outer < inside) index += 1;
        let dustHere = index < bands.length ? bands[index].dustPresent : false;
        while (index < bands.length && bands[index].inner < outside) {
            dustHere = dustHere || bands[index].dustPresent;
            index += 1;
        }
        return dustHere;
    }

    /** Clears the dust (and, for a giant, the gas) a body has swept up between `lo` and `hi` */
    updateDustLanes(lo, hi, mass, critical, bounds) {
        this.dustLeft = false;
        const gas = !(mass > critical);
        const bands = this.dustBands;

        let index = 0;
        while (index < bands.length) {
            const band = { ...bands[index] };
            const sweptGas = band.gasPresent ? gas : false;
            if (band.inner < lo && band.outer > hi) {
                bands[index].outer = lo;
                bands.splice(index + 1, 0,
                    { inner: lo, outer: hi, dustPresent: false, gasPresent: sweptGas },
                    { inner: hi, outer: band.outer, dustPresent: band.dustPresent, gasPresent: band.gasPresent });
                index += 3;
            } else if (band.inner < hi && band.outer > hi) {
                bands.splice(index + 1, 0,
                    { inner: hi, outer: band.outer, dustPresent: band.dustPresent, gasPresent: band.gasPresent });
                bands[index].outer = hi;
                bands[index].gasPresent = sweptGas;
                bands[index].dustPresent = false;
                index += 2;
            } else if (band.inner < lo && band.outer > lo) {
                bands.splice(index + 1, 0, { inner: lo, outer: band.outer, dustPresent: false, gasPresent: sweptGas });
                bands[index].outer = lo;
                index += 2;
            } else if (band.inner >= lo && band.outer <= hi) {
                bands[index].gasPresent = sweptGas;
                bands[index].dustPresent = false;
                index += 1;
            } else {
                index += 1;
            }
        }

        // Whether any dust is left where planets can form, merging neighbouring bands that are alike
        index = 0;
        while (index < bands.length) {
            const band = bands[index];
            if (band.dustPresent && band.outer >= bounds[0] && band.inner <= bounds[1]) this.dustLeft = true;
            if (index + 1 < bands.length) {
                const next = bands[index + 1];
                if (band.dustPresent === next.dustPresent && band.gasPresent === next.gasPresent) {
                    band.outer = next.outer;
                    bands.splice(index + 1, 1);
                }
            }
            index += 1;
        }
    }

    collectDust(lastMass, a, e, critical) {
        this.reducedMass = Math.pow(lastMass / (1 + lastMass), 0.25);
        this.rInner = Math.max(this.innerEffectLimit(a, e, this.reducedMass), 0);
        this.rOuter = this.outerEffectLimit(a, e);

        let collected = 0;
        for (const band of this.dustBands) {
            const density = band.dustPresent ? this.dustDensity : 0;
            const massDensity = lastMass < critical || !band.gasPresent
                ? density
                : gasDustRatio * density / (1 + Math.sqrt(critical / lastMass) * (gasDustRatio - 1));
            if (band.outer <= this.rInner || band.inner >= this.rOuter) continue;

            const bandwidth = this.rOuter - this.rInner;
            const outside = Math.max(this.rOuter - band.outer, 0);
            const inside = Math.max(band.inner - this.rInner, 0);
            const width = bandwidth - outside - inside;
            const volume = 4 * Math.PI * a * a * this.reducedMass * (1 - e * (outside - inside) / bandwidth);
            collected += volume * width * massDensity;
        }
        return collected;
    }

    /** Mass (solar masses) at which a protoplanet begins to pull in gas as well as dust */
    criticalLimit(a, e) {
        return criticalMassB * Math.pow(a * (1 - e) * Math.sqrt(this.luminosity), -0.75);
    }

    /** The seed's mass once it has swept up all the dust it can reach */
    accreteDust(seedMass, a, e, critical, bounds) {
        let newMass = seedMass;
        let lastMass;
        let iterations = 0;
        do {
            lastMass = newMass;
            newMass = this.collectDust(newMass, a, e, critical);
            iterations += 1;
        } while (!((newMass - lastMass) < 0.0001 * lastMass) && iterations < 10000);
        const mass = seedMass + newMass;
        this.updateDustLanes(this.rInner, this.rOuter, mass, critical, bounds);
        return mass;
    }

    /** Merges a new body with any planet whose band it overlaps, or adds it as a planet of its own */
    coalesce(a, e, mass, critical, bounds) {
        for (const node of this.planets) {
            const gap = node.a - a;
            let reach;
            let nodeReach;
            if (gap > 0) {
                reach = a * (1 + e) * (1 + this.reducedMass) - a;
                this.reducedMass = Math.pow(node.mass / (1 + node.mass), 0.25);
                nodeReach = node.a - node.a * (1 - node.e) * (1 - this.reducedMass);
            } else {
                reach = a - a * (1 - e) * (1 - this.reducedMass);
                this.reducedMass = Math.pow(node.mass / (1 + node.mass), 0.25);
                nodeReach = node.a * (1 + node.e) * (1 + this.reducedMass) - node.a;
            }
            if (!(Math.abs(gap) <= Math.abs(reach) || Math.abs(gap) <= Math.abs(nodeReach))) continue;

            // Collision: the merged body takes the combined mass and angular momentum
            const a3 = (node.mass + mass) / (node.mass / node.a + mass / a);
            let t = node.mass * Math.sqrt(node.a) * Math.sqrt(1 - node.e * node.e);
            t += mass * Math.sqrt(a) * Math.sqrt(Math.sqrt(1 - e * e));
            t /= (node.mass + mass) * Math.sqrt(a3);
            t = 1 - t * t;
            if (t < 0 || t >= 1) t = 0;
            const newE = Math.sqrt(t);
            // The original passes the stellar luminosity as the critical mass here
            const newMass = this.accreteDust(node.mass + mass, a3, newE, this.luminosity, bounds);
            node.a = a3;
            node.e = newE;
            node.mass = newMass;
            // Unlike the original, a merger that grows past the critical mass makes a giant
            node.isGasGiant = node.isGasGiant || newMass >= critical;
            return;
        }

        const planet = { a, e, mass, isGasGiant: mass >= critical };
        const index = this.planets.findIndex((p) => p.a >= a);
        this.planets.splice(index === -1 ? this.planets.length : index, 0, planet);
    }
}

/**
 * Dust and gas from `inner` to `outer`, but for the gaps between the allowed ranges, which a companion's orbit has
 * swept bare
 */
function makeDustBands(inner, outer, allowed) {
    const bands = [];
    let edge = inner;
    allowed.forEach((range, index) => {
        if (range[0] > edge) {
            const bare = index > 0;
            bands.push({ inner: edge, outer: range[0], dustPresent: !bare, gasPresent: !bare });
        }
        bands.push({ inner: Math.max(range[0], edge), outer: range[1], dustPresent: true, gasPresent: true });
        edge = range[1];
    });
    if (outer > edge) bands.push({ inner: edge, outer, dustPresent: true, gasPresent: true });
    return bands;
}

/** A distance drawn evenly over the allowed ranges */
function randomDistance(allowed, total) {
    let offset = Dice.uniform(0, total);
    for (const range of allowed) {
        const width = range[1] - range[0];
        if (offset <= width) return range[0] + offset;
        offset -= width;
    }
    return allowed[allowed.length - 1][1];
}

/** Each run of neighbouring planetoids becomes one belt, with their total mass at their mass-weighted distance */
function mergeBelts(bodies) {
    const result = [];
    let run = [];
    const flushRun = () => {
        if (run.length === 0) return;
        const first = run[0];
        const last = run[run.length - 1];
        const mass = run.reduce((sum, b) => sum + b.massEarths, 0);
        result.push({
            ...first, massEarths: mass,
            au: run.reduce((sum, b) => sum + b.au * b.massEarths, 0) / mass,
            eccentricity: run.reduce((sum, b) => sum + b.eccentricity * b.massEarths, 0) / mass,
            beltRange: [first.au, last.au],
        });
        run = [];
    };
    // Collisions can carry a planet past its neighbours, so they're put back in order of distance (a stable sort, as
    // Swift's is)
    for (const body of bodies.slice().sort((x, y) => x.au - y.au)) {
        if (!body.isGasGiant && body.massEarths < beltMassLimit) {
            run.push(body);
        } else {
            flushRun();
            result.push(body);
        }
    }
    flushRun();
    return result;
}

/**
 * Radius of a rocky body (km) from Kothari's equation (Fogg's eq. 9), with heavier elements in the hot inner zone and
 * lighter, icier ones beyond 4·√L AU
 */
export function rockyRadiusKm(massEarths, au, luminosity) {
    const solarMassInGrams = 1.989e33;
    const a1 = 6.485e12, a2 = 4.0032e-8, beta = 5.71e12;
    const [atomicWeight, atomicNumber] = au < 4 * Math.sqrt(Math.max(luminosity, 1e-12)) ? [15.0, 8.0] : [10.0, 5.0];
    const mass = massEarths / PlanetPhysics.earthMassesPerSolarMass;
    let radius = 2 * beta * Math.cbrt(solarMassInGrams) / (a1 * Math.cbrt(atomicWeight * atomicNumber));
    const compression = 1 + a2 * Math.pow(atomicWeight, 4 / 3) * Math.pow(solarMassInGrams, 2 / 3) * Math.pow(mass, 2 / 3)
        / (a1 * atomicNumber * atomicNumber);
    radius /= compression;
    return roundSwift(radius * Math.cbrt(mass) / 1.0e5);
}
