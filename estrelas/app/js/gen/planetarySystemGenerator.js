//
//  planetarySystemGenerator.js
//  Estrelas (web)
//
//  Generates the planets, asteroid belts and moons of a star system from observed exoplanet statistics and
//  planetary physics: companion stars from the period distribution of nearby multiples, planet counts from survey
//  occurrence rates, sizes from mass–radius relations with orbits spaced in a rough geometric progression and at
//  least ten mutual Hill radii apart, and surfaces from starlight and escape velocity. A line-for-line port of
//  PlanetarySystemGenerator.swift: every draw is made in the same order, so the same seed gives the same systems.
//

import { rng, roundSwift } from './random.js';
import {
    Dice, StellarType, SpectralClass, stellarProperties, whiteDwarf, mainSequenceLifespan, progenitorMass, maximumAge,
    romanNumeral, neutronStar, blackHole, isCompactRemnant, isBrownDwarf,
} from './stellar.js';
import {
    PlanetPhysics, giantClassForMass, isIcyGiant, insolation as insolationOf, luminosityScale, gravityOf,
    habitabilityIndex,
} from '../model/planetarySystem.js';

const minimumSTypeSeparation = 10.0;
const commonSTypeSeparation = 50.0;
const sTypeStableFraction = 1.0 / 3.0;
const circumbinaryFactor = 3.0;

const spacingRange = [1.4, 2.0];
const stepJitter = [0.92, 1.08];
const resonanceChance = 0.35;
const resonances = [
    { name: '3:2', ratio: Math.pow(3.0 / 2, 2.0 / 3) }, { name: '5:3', ratio: Math.pow(5.0 / 3, 2.0 / 3) },
    { name: '2:1', ratio: Math.pow(2.0, 2.0 / 3) }, { name: '5:2', ratio: Math.pow(5.0 / 2, 2.0 / 3) },
];
const minimumHillSeparation = 10.0;
const hillSeparationTarget = [10.0, 12.0];
const minimumPeriodRatio = 1.3;
const evaporationLimit = 0.015;
/** Conservative habitable zone for a Sun-like star (stellar flux 1.1 to 0.35 times Earth's), scaled by √L */
export const habitableZone = [0.95, 1.7];
export const snowLine = 2.7;
const outerPlanetLimit = 300.0;
const earthMassesPerSolarMass = PlanetPhysics.earthMassesPerSolarMass;

const contains = (range, value) => range[0] <= value && value <= range[1];
const overlaps = (a, b) => a[0] <= b[1] && b[0] <= a[1];
const uniform = (range) => rng.double(range[0], range[1]);

function rounded(value, places = 2) {
    const scale = Math.pow(10, places);
    return roundSwift(value * scale) / scale;
}

/** Swift's max(by:) keeps the first of equal maxima */
function maxBy(items, less) {
    let best;
    let first = true;
    for (const item of items) {
        if (first || less(best, item)) best = item;
        first = false;
    }
    return first ? undefined : best;
}

function minBy(items, less) {
    let best;
    let first = true;
    for (const item of items) {
        if (first || less(item, best)) best = item;
        first = false;
    }
    return first ? undefined : best;
}

/** Sorting by a "less than" predicate, like Swift's sorted(by:) */
function stableSort(array, less) {
    return array.slice().sort((a, b) => (less(a, b) ? -1 : less(b, a) ? 1 : 0));
}

const range = (n) => Array.from({ length: Math.max(n, 0) }, (_, i) => i);

export class PlanetarySystemGenerator {

    /**
     * Generates the planetary system for a star system's stars (in their generation form, with numeric classes),
     * and fills in each star's luminosity, temperature, radius, inner limit and habitable zone
     */
    generate(stars, requirements = null) {
        if (stars.length === 0) return undefined;

        const primaryIndex = maxBy(range(stars.length), (a, b) => (stars[a].mass ?? 0) < (stars[b].mass ?? 0)) ?? 0;
        const { age, coolingAge } = this.systemAge(stars[primaryIndex]);
        const nodes = this.makeNodes(stars, primaryIndex, age, coolingAge);
        const groups = this.makeGroups(nodes);
        this.computeAvailableOrbits(groups);
        this.updateStars(stars, nodes, groups);

        const system = { age, stars: this.starInfo(nodes, groups), worlds: [] };

        const metallicity = Dice.normal(-0.05, 0.2, [-1, 0.5]);
        let slots = [];
        // What the primary can hold on to: a supernova destroys or flings away almost every planet, leaving a rare few
        // small worlds round a pulsar; a brown dwarf's light disc makes a few small worlds
        const primaryClass = stars[primaryIndex].spectralClass ?? SpectralClass.M;
        const keepsPlanets = !isCompactRemnant(primaryClass) || Dice.chance(0.12);
        groups.forEach((group, index) => {
            if (group.ranges.length === 0 || !keepsPlanets) return;
            let kinds = this.bodyKinds(group, nodes, stars, metallicity);
            if (isCompactRemnant(primaryClass) || isBrownDwarf(primaryClass)) {
                kinds = kinds.filter((k) => k === 'rocky' || k === 'belt').slice(0, isBrownDwarf(primaryClass) ? 4 : 3);
            }
            if (kinds.length === 0) return;
            const giants = kinds.filter((k) => k === 'gasGiant' || k === 'iceGiant').length;
            const groupSlots = this.placeSlots(group, index, kinds.length, giants);
            slots = slots.concat(this.fill(groupSlots, kinds, group.luminosity));
        });

        // A resonance only means something if there's a world in the next orbit in
        for (const slot of slots) {
            if (slot.resonance == null) continue;
            if (!slots.some((other) => other.group === slot.group && other.au < slot.au)) slot.resonance = undefined;
        }

        const worlds = this.makeWorlds(slots, groups, nodes, age);
        this.addTrojans(worlds, age);
        if (requirements) {
            // Worlds the known ones need that nothing generated can stand in for go round the primary
            const primary = groups[0];
            const host = { designation: '', type: 'terrestrial', parentLabel: primary.label,
                orbitedStarIDs: primary.nodes.map((n) => nodes[n].id), au: 1, eccentricity: 0, inclination: 0, period: 1,
                anomaly: undefined, radiusKm: 0, massEarths: 0, gasGiant: undefined, rings: 0, moons: [],
                starLuminosity: this.luminosityOf(primary.nodes, nodes), inHabitableZone: false, isPrincipal: false };
            applyRequirements(this, requirements, worlds, age, host);
            this.assignDesignations(worlds);
            system.principalWorld = worlds.find((w) => w.isPrincipal)?.designation
                ?? worlds.flatMap((w) => w.moons).find((m) => m.isPrincipal)?.designation;
        } else {
            this.assignDesignations(worlds);
            system.principalWorld = this.choosePrincipalWorld(worlds);
        }
        system.worlds = worlds;
        return system;
    }

    // MARK: stars

    systemAge(primary) {
        const mass = primary.mass ?? 1.0;
        const lifespan = mainSequenceLifespan(mass);
        // Young stars are still forming, or only just formed
        switch (primary.variant) {
            case 'protostar': return { age: Dice.uniform(0.00005, 0.0005), coolingAge: 0 };
            case 'tTauri': return { age: Dice.uniform(0.001, 0.01), coolingAge: 0 };
            case 'herbigAeBe': return { age: Dice.uniform(0.001, 0.005), coolingAge: 0 };
            default: break;
        }
        switch (primary.spectralClass ?? SpectralClass.M) {
            case SpectralClass.N: case SpectralClass.X: {
                // A massive star's few million years, then however long it's been dead
                const progenitor = Dice.uniform(0.005, 0.03);
                const dead = Dice.chance(0.15) ? Dice.logUniform(0.000005, 0.0001) : Dice.logUniform(0.0001, 10);
                return { age: Math.min(progenitor + dead, maximumAge), coolingAge: dead };
            }
            case SpectralClass.W:
                return { age: Dice.uniform(0.003, 0.007), coolingAge: 0 };
            case SpectralClass.L: case SpectralClass.T: case SpectralClass.Y:
                return { age: Dice.uniform(0.3, 12), coolingAge: 0 };
            default: break;
        }
        switch (primary.stellarType ?? StellarType.V) {
            case StellarType.d: {
                const progenitor = progenitorMass(mass);
                const before = mainSequenceLifespan(progenitor) * 1.1;
                // A few have only just blown off their shells, and are still hot inside their planetary nebulae
                const cooling = Dice.chance(0.03) ? Dice.logUniform(0.00001, 0.00005)
                    : Dice.uniform(0.1, Math.max(maximumAge - before, 0.2));
                return { age: Math.min(before + cooling, maximumAge), coolingAge: cooling };
            }
            case StellarType.IV:
                return { age: Math.min(lifespan * Dice.uniform(1.0, 1.1), maximumAge), coolingAge: 0 };
            case StellarType.III: case StellarType.II: case StellarType.Ib: case StellarType.Iab: case StellarType.Ia:
            case StellarType.hypergiant:
                // An RR Lyrae star is an old, low-mass giant from the galaxy's first generations
                if (primary.variability === 'rrLyrae') return { age: Dice.uniform(10, 12.5), coolingAge: 0 };
                return { age: Math.min(lifespan * Dice.uniform(1.1, 1.2), maximumAge), coolingAge: 0 };
            case StellarType.remnant: {
                const age = Dice.uniform(0.01, 10);
                return { age, coolingAge: Dice.uniform(0.001, 1) };
            }
            case StellarType.VI:
                return { age: Dice.uniform(8, 12.5), coolingAge: 0 };
            default: {
                const oldest = Math.min(lifespan, 12.5);
                return { age: Dice.uniform(oldest * 0.05, oldest), coolingAge: 0 };
            }
        }
    }

    makeNodes(stars, primaryIndex, age, primaryCoolingAge) {
        const properties = (index) => {
            const star = stars[index];
            const mass = star.mass ?? 1.0;
            if (star.spectralClass === SpectralClass.X) return blackHole(mass);
            if (star.spectralClass === SpectralClass.N) {
                const dead = index === primaryIndex ? primaryCoolingAge : Dice.logUniform(0.0001, Math.max(age * 0.8, 0.001));
                return neutronStar(mass, dead);
            }
            if (star.stellarType === StellarType.d || star.spectralClass === SpectralClass.D) {
                const cooling = index === primaryIndex ? primaryCoolingAge : Dice.uniform(0.05, Math.max(age * 0.8, 0.1));
                return whiteDwarf(mass, cooling);
            }
            return stellarProperties(star.spectralClass ?? SpectralClass.M, star.subClass ?? 5, star.stellarType ?? StellarType.V,
                mass, star.variant, star.variability);
        };

        const nodes = [{ starIndex: primaryIndex, id: stars[primaryIndex].id ?? '', designation: 'A', role: 'primary',
            au: 0, eccentricity: 0, properties: properties(primaryIndex) }];
        let primaryCompanion = null;
        const secondaries = [];
        const others = stableSort(range(stars.length).filter((i) => i !== primaryIndex),
            (a, b) => (stars[a].mass ?? 0) > (stars[b].mass ?? 0));

        for (const starIndex of others) {
            const node = { starIndex, id: stars[starIndex].id ?? '', designation: '', role: 'secondary', au: 0,
                eccentricity: 0, properties: properties(starIndex) };
            const primaryMass = nodes[0].properties.mass;
            const au = this.binarySeparation(primaryMass + node.properties.mass);
            const minimum = 3 * (nodes[0].properties.diameter + node.properties.diameter) * 0.00465;

            let open = -1;
            if (au < 6 && primaryCompanion === null) {
                node.role = 'companion';
                node.au = Math.max(au, minimum, 0.02);
                primaryCompanion = nodes.length;
            } else if ((open = secondaries.findIndex((s) => s.companion === null)) >= 0 && Dice.chance(0.35)) {
                const host = nodes[secondaries[open].node];
                const room = host.au * (1 - host.eccentricity) / 10;
                node.role = 'companion';
                node.au = Math.max(Math.min(Dice.logUniform(0.02, Math.max(room, 0.03)), room), minimum, 0.02);
                secondaries[open].companion = nodes.length;
            } else {
                const taken = secondaries.map((s) => nodes[s.node].au)
                    .concat([primaryCompanion !== null ? nodes[primaryCompanion].au * 3 : 0]);
                const tooClose = (candidate) => taken.some((t) => Math.abs(Math.log(candidate / Math.max(t, 0.01))) < Math.log(3.5));
                let candidate = Math.max(au, 6);
                for (let attempt = 0; attempt < 30; attempt++) {
                    if (!tooClose(candidate)) continue;
                    candidate = Math.max(this.binarySeparation(primaryMass + node.properties.mass), 6);
                }
                if (tooClose(candidate)) {
                    candidate = (taken.length ? Math.max(...taken) : 6) * Dice.uniform(4, 8);
                }
                node.au = Math.min(candidate, 20000);
                secondaries.push({ node: nodes.length, companion: null });
            }
            node.eccentricity = this.binaryEccentricity(node.au, primaryMass + node.properties.mass);
            nodes.push(node);
        }

        if (primaryCompanion !== null) {
            nodes[0].designation = 'Aa';
            nodes[primaryCompanion].designation = 'Ab';
        }
        const letters = ['B', 'C', 'D', 'E', 'F'];
        stableSort(secondaries, (a, b) => nodes[a.node].au < nodes[b.node].au).forEach((secondary, order) => {
            const letter = letters[Math.min(order, letters.length - 1)];
            if (secondary.companion !== null) {
                nodes[secondary.node].designation = letter + 'a';
                nodes[secondary.companion].designation = letter + 'b';
            } else {
                nodes[secondary.node].designation = letter;
            }
        });
        for (const node of nodes) node.au = rounded(node.au);
        return nodes;
    }

    binarySeparation(totalMass) {
        const periodDays = Math.pow(10, Dice.normal(5.03, 2.28, [0, 9]));
        const years = periodDays / 365.25;
        return Math.cbrt(Math.max(totalMass, 0.1) * years * years);
    }

    binaryEccentricity(au, totalMass) {
        const periodDays = Math.sqrt(au * au * au / Math.max(totalMass, 0.1)) * 365.25;
        if (periodDays < 12) return rounded(Dice.uniform(0, 0.02));
        return rounded(Dice.uniform(0.05, 0.75));
    }

    makeGroups(nodes) {
        const group = (head, companion) => {
            const members = companion !== null && companion !== undefined ? [head, companion] : [head];
            const mass = members.reduce((sum, i) => sum + nodes[i].properties.mass, 0);
            const luminosity = members.reduce((sum, i) => sum + nodes[i].properties.luminosity, 0);
            const letter = nodes[head].designation.slice(0, 1);
            let inner = members.length ? Math.max(...members.map((i) => nodes[i].properties.innerLimitAU)) : 0.01;
            let pairReach = 0.0;
            if (members.length > 1) {
                const partner = nodes[companion];
                pairReach = partner.au * (1 + partner.eccentricity);
                inner = Math.max(inner, circumbinaryFactor * pairReach);
            }
            return { nodes: members, letter, label: members.length > 1 ? letter + 'ab' : letter, role: nodes[head].role,
                au: nodes[head].au, eccentricity: nodes[head].eccentricity, pairReachAU: pairReach, innerAU: inner, mass,
                luminosity, ranges: [], exclusions: [], hasCompanion: members.length > 1 };
        };

        const primaryCompanion = nodes.findIndex((n) => n.role === 'companion' && n.designation === 'Ab');
        const groups = [group(0, primaryCompanion >= 0 ? primaryCompanion : null)];
        if (nodes.length === 1) groups[0].label = '';
        nodes.forEach((node, head) => {
            if (node.role !== 'secondary') return;
            const letter = node.designation.slice(0, 1);
            const companion = nodes.findIndex((n) => n.role === 'companion' && n.designation === letter + 'b');
            groups.push(group(head, companion >= 0 ? companion : null));
        });
        return groups;
    }

    periastron(group, primary) {
        return Math.max(group.au * (1 - group.eccentricity) - group.pairReachAU - primary.pairReachAU, 0);
    }

    apastron(group) {
        return group.au * (1 + group.eccentricity) + group.pairReachAU;
    }

    sTypeAllowed(separation) {
        if (separation < minimumSTypeSeparation) return false;
        if (separation >= commonSTypeSeparation) return true;
        const progress = (separation - minimumSTypeSeparation) / (commonSTypeSeparation - minimumSTypeSeparation);
        return Dice.chance(0.25 + 0.75 * progress);
    }

    computeAvailableOrbits(groups) {
        const primary = groups[0];
        const exclusions = [];
        for (const secondary of groups.slice(1)) {
            const closest = this.periastron(secondary, primary);
            const inner = this.sTypeAllowed(closest) ? closest * sTypeStableFraction : 0;
            const outer = circumbinaryFactor * this.apastron(secondary);
            if (outer > inner) exclusions.push([inner, outer]);
        }
        groups[0].exclusions = exclusions;
        if (groups[0].innerAU < outerPlanetLimit) {
            groups[0].ranges = subtract(exclusions, [groups[0].innerAU, outerPlanetLimit]);
        }

        for (let index = 1; index < groups.length; index++) {
            const group = groups[index];
            let closest = this.periastron(group, primary);
            for (let other = 1; other < groups.length; other++) {
                if (other === index) continue;
                const neighbour = groups[other];
                const gap = neighbour.au > group.au
                    ? this.periastron(neighbour, primary) - this.apastron(group)
                    : this.periastron(group, primary) - this.apastron(neighbour);
                closest = Math.min(closest, Math.max(gap, 0));
            }
            if (!this.sTypeAllowed(closest)) {
                groups[index].ranges = [];
                continue;
            }
            const upper = Math.min(closest * sTypeStableFraction, outerPlanetLimit);
            groups[index].ranges = upper > group.innerAU * 1.5 ? [[group.innerAU, upper]] : [];
        }
    }

    interiorReach(au, groupIndex, groups) {
        let reach = groups[groupIndex].pairReachAU;
        if (groupIndex === 0) {
            for (const secondary of groups.slice(1)) {
                if (secondary.au < au) reach = Math.max(reach, this.apastron(secondary));
            }
        }
        return reach;
    }

    updateStars(stars, nodes, groups) {
        nodes.forEach((node, index) => {
            const group = groups.find((g) => g.nodes.includes(index));
            const sqrtL = Math.sqrt(group ? group.luminosity : node.properties.luminosity);
            const star = stars[node.starIndex];
            star.luminosity = node.properties.luminosity;
            star.tempEffective = node.properties.temperature;
            star.radius = node.properties.diameter;
            star.innerLimit = node.properties.innerLimitAU;
            star.bioZoneInner = habitableZone[0] * sqrtL;
            star.bioZoneOuter = habitableZone[1] * sqrtL;
            // A white dwarf's atmosphere follows from how hot it still is; its subclass is its temperature index
            if (star.spectralClass === SpectralClass.D && !star.variant) {
                const temperature = node.properties.temperature;
                star.variant = whiteDwarfAtmosphere(temperature);
                star.subClass = Math.min(Math.max(Math.trunc(roundSwift(50400 / Math.max(temperature, 1))), 0), 9);
            }
        });
    }

    starInfo(nodes, groups) {
        return nodes.map((node, index) => {
            let period = 0.0;
            if (node.role === 'companion') {
                const partner = groups.find((g) => g.nodes.includes(index))?.nodes[0] ?? 0;
                period = Math.sqrt(Math.pow(node.au, 3) / (nodes[partner].properties.mass + node.properties.mass));
            } else if (node.role === 'secondary') {
                const group = groups.find((g) => g.nodes[0] === index);
                if (group) period = Math.sqrt(Math.pow(node.au, 3) / (groups[0].mass + group.mass));
            }
            return {
                estrelaID: node.id, designation: node.designation, role: node.role, au: node.au,
                eccentricity: node.eccentricity, period, mass: node.properties.mass, luminosity: node.properties.luminosity,
                temperature: node.properties.temperature, diameter: node.properties.diameter,
                innerLimitAU: node.properties.innerLimitAU,
            };
        });
    }

    // MARK: how many worlds, of what kinds

    bodyKinds(group, nodes, stars, metallicity) {
        const head = nodes[group.nodes[0]];
        const mass = head.properties.mass;
        const type = stars[head.starIndex].stellarType ?? StellarType.V;
        if (head.properties.isPostStellar && !Dice.chance(0.25)) return [];
        let scale = 1.0;
        if (head.properties.isPostStellar) scale = 0.4;
        if ([StellarType.III, StellarType.II, StellarType.Ib, StellarType.Ia].includes(type)) scale = 0.5;
        if (group.hasCompanion) scale *= 0.8;

        const smallMean = (mass < 0.6 ? 3.5 : 3.0) * scale;
        const kinds = [];
        const small = Dice.poisson(smallMean);
        for (let i = 0; i < small; i++) kinds.push(Dice.chance(0.3) ? 'subNeptune' : 'rocky');
        const giantChance = Math.min(Math.max(0.18 * mass * Math.pow(10, 1.2 * metallicity), 0.02), 0.6) * scale;
        if (Dice.chance(giantChance)) {
            const count = Math.min(1 + Dice.poisson(0.8), 4);
            for (let i = 0; i < count; i++) kinds.push('gasGiant');
        }
        const ice = Math.min(Dice.poisson(0.7 * Math.min(mass, 2) * scale), 3);
        for (let i = 0; i < ice; i++) kinds.push('iceGiant');
        if (kinds.length > 0) {
            if (Dice.chance(kinds.includes('gasGiant') ? 0.5 : 0.25)) kinds.push('belt');
            if (Dice.chance(0.3)) kinds.push('belt');
        }
        return kinds;
    }

    // MARK: placement of worlds

    orbitedNodes(groupIndex, au, groups) {
        const interior = groupIndex === 0 ? groups.slice(1).filter((g) => g.au < au) : [];
        return groups[groupIndex].nodes.concat(interior.flatMap((g) => g.nodes));
    }

    luminosityOf(members, nodes) {
        return members.reduce((sum, i) => sum + nodes[i].properties.luminosity, 0);
    }

    orbitChain(start, steps, ranges) {
        if (ranges.length === 0) return [];
        const chain = [];
        let au = Math.max(start, ranges[0][0]);
        for (let index = 0; index <= steps.length; index++) {
            let resonance;
            if (index > 0) {
                au *= steps[index - 1].factor;
                resonance = steps[index - 1].resonance;
            }
            if (!ranges.some((r) => contains(r, au))) {
                const next = ranges.find((r) => r[0] > au);
                if (!next) break;
                au = Math.min(next[0] * (index > 0 ? steps[index - 1].gapJitter : 1), next[1]);
                resonance = undefined;
            }
            chain.push({ au, resonance });
        }
        return chain;
    }

    placeSlots(group, groupIndex, count, expectedGiants) {
        const ranges = group.ranges;
        if (count <= 0 || ranges.length === 0) return [];
        const sqrtL = Math.sqrt(group.luminosity);
        const inner = Math.max(ranges[0][0], evaporationLimit * sqrtL);

        const base = uniform(spacingRange);
        const steps = range(count - 1).map(() => {
            let factor = Math.min(Math.max(base * uniform(stepJitter), spacingRange[0]), spacingRange[1]);
            let resonance;
            if (Dice.chance(resonanceChance)) {
                const nearest = minBy(resonances, (a, b) => Math.abs(a.ratio - factor) < Math.abs(b.ratio - factor));
                factor = nearest.ratio;
                resonance = nearest.name;
            }
            return { factor, resonance, gapJitter: Dice.uniform(1.0, 1.15) };
        });

        const start = inner * Math.exp(Dice.uniform(Math.log(1.2), Math.log(25)));
        let chain = this.orbitChain(start, steps, ranges);

        const snow = snowLine * sqrtL;
        const beyondSnow = chain.filter((c) => c.au >= snow).length;
        if (expectedGiants > beyondSnow && chain.length >= expectedGiants) {
            const shift = snow * Dice.uniform(1.0, 1.3) / chain[chain.length - expectedGiants].au;
            const shifted = this.orbitChain(start * shift, steps, ranges);
            if (shift > 1 && shifted.length >= chain.length) chain = shifted;
        }
        return chain.map((c) => ({ group: groupIndex, au: c.au, resonance: c.resonance, anomaly: undefined, content: undefined }));
    }

    fill(slots, kinds, luminosity) {
        const snow = snowLine * Math.sqrt(luminosity);
        for (const kind of ['gasGiant', 'iceGiant', 'belt', 'subNeptune', 'rocky']) {
            const count = kinds.filter((k) => k === kind).length;
            for (let i = 0; i < count; i++) {
                this.pick(slots, kind, (slot) => {
                    switch (kind) {
                        case 'gasGiant': return slot.au >= snow ? 1 : 0.03;
                        case 'iceGiant': return slot.au >= snow ? 1 : 0.08;
                        case 'subNeptune': return slot.au < snow ? 1 : 0.3;
                        default: return 1;
                    }
                });
            }
        }
        for (const slot of slots) {
            if (slot.content === undefined || slot.content === 'belt') continue;
            const draw = Dice.uniform(0, 1);
            if (draw < 0.04) slot.anomaly = 'eccentric';
            else if (draw < 0.07) slot.anomaly = 'inclined';
            else if (draw < 0.08) slot.anomaly = 'retrograde';
        }
        return slots.filter((slot) => slot.content !== undefined);
    }

    pick(slots, content, weight) {
        const options = [];
        slots.forEach((slot, index) => {
            if (slot.content === undefined) options.push([index, weight(slot)]);
        });
        if (options.length === 0) return;
        slots[Dice.weighted(options)].content = content;
    }

    stabilize(bodies, groups) {
        let result = [];
        for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
            const members = stableSort(bodies.filter((b) => b.slot.group === groupIndex), (a, b) => a.slot.au < b.slot.au);
            if (members.length === 0) continue;
            const ranges = groups[groupIndex].ranges;
            const starMass = groups[groupIndex].mass * earthMassesPerSolarMass;
            const kept = [members[0]];

            let index = 1;
            while (index < members.length) {
                const inner = kept[kept.length - 1];
                const outer = { ...members[index], slot: { ...members[index].slot } };
                const mu = Math.cbrt((inner.massEarths + outer.massEarths) / (3 * starMass));
                const a1 = inner.slot.au;
                const e1 = inner.eccentricity;
                const hillSeparation = (a2) => (a2 * (1 - outer.eccentricity) - a1 * (1 + e1)) / (mu * (a1 + a2) / 2);

                let scale = 1.0;
                const periodFloor = a1 * Math.pow(minimumPeriodRatio, 2.0 / 3);
                if (hillSeparation(outer.slot.au) < minimumHillSeparation || outer.slot.au < periodFloor) {
                    const k = uniform(hillSeparationTarget);
                    outer.eccentricity = Math.min(outer.eccentricity, Math.max(0.7 - k * mu / 2, 0));
                    const denominator = 1 - outer.eccentricity - k * mu / 2;
                    if (!(denominator > 0.1)) {
                        members.splice(index, 1);
                        continue;
                    }
                    const needed = Math.max(a1 * (1 + e1 + k * mu / 2) / denominator, periodFloor);
                    scale = Math.max(needed / outer.slot.au, 1);
                    outer.slot.resonance = undefined;
                }
                let au = outer.slot.au * scale;
                if (!ranges.some((r) => contains(r, au))) {
                    const next = ranges.find((r) => r[0] > au);
                    if (!next) break;
                    au = Math.min(next[0] * 1.05, next[1]);
                    outer.slot.resonance = undefined;
                }
                if (au !== outer.slot.au) {
                    const factor = au / outer.slot.au;
                    for (let later = index + 1; later < members.length; later++) {
                        members[later] = { ...members[later], slot: { ...members[later].slot, au: members[later].slot.au * factor } };
                    }
                    outer.slot.au = au;
                }
                members[index] = outer;
                kept.push(outer);
                index += 1;
            }
            result = result.concat(kept);
        }
        return result;
    }

    // MARK: worlds

    makeWorlds(slots, groups, nodes, age) {
        const typicalRadius = groups.map(() => Dice.normal(Math.log(1.1), 0.45, [Math.log(0.3), Math.log(1.8)]));

        const bodies = [];
        for (const slot of slots) {
            const kind = slot.content;
            if (kind === undefined) continue;
            const orbited = this.orbitedNodes(slot.group, slot.au, groups);
            const lum = this.luminosityOf(orbited, nodes);
            const insolation = lum / (slot.au * slot.au);

            let eccentricity = 0.0;
            if (kind !== 'belt') {
                const sigma = slot.anomaly === 'eccentric' ? 0.35 : 0.05;
                const u = Math.max(Dice.uniform(0, 1), 1e-9);
                eccentricity = Math.min(sigma * Math.sqrt(-2 * Math.log(u)), 0.9);
                if (slot.au < 0.05 * Math.sqrt(lum) && age > 1) eccentricity *= 0.1;
                const reach = this.interiorReach(slot.au, slot.group, groups);
                if (reach > 0) eccentricity = Math.min(eccentricity, Math.max(1 - 2 * reach / slot.au, 0));
            }

            let inclination = 0.0;
            if (slot.anomaly === 'inclined') inclination = Dice.uniform(25, 85);
            else if (slot.anomaly === 'retrograde') inclination = Dice.uniform(95, 180);
            else inclination = kind === 'belt' ? 0 : Math.abs(Dice.normal(0, 1.5));

            switch (kind) {
                case 'rocky': {
                    const radius = Math.exp(typicalRadius[slot.group] + Dice.normal(0, 0.25));
                    const radiusKm = Math.min(Math.max(radius, 0.25), 1.8) * PlanetPhysics.earthRadiusKm;
                    bodies.push({ slot, type: 'terrestrial', radiusKm, massEarths: PlanetPhysics.rockyMass(radiusKm),
                        gasGiant: undefined, eccentricity, inclination });
                    break;
                }
                case 'subNeptune': case 'iceGiant': case 'gasGiant': {
                    const mass = kind === 'subNeptune' ? Dice.logUniform(3, 10) : kind === 'iceGiant' ? Dice.logUniform(10, 50)
                        : 50 * Math.pow(10, Math.pow(Dice.uniform(0, 1), 1.4) * 1.9);
                    let radius = PlanetPhysics.giantRadius(mass);
                    if (insolation > 150 && mass > 50) radius *= 1.2;
                    const info = { giantClass: giantClassForMass(mass), radiusEarths: rounded(radius), massEarths: rounded(mass) };
                    bodies.push({ slot, type: 'gasGiant', radiusKm: radius * PlanetPhysics.earthRadiusKm, massEarths: mass,
                        gasGiant: info, eccentricity, inclination });
                    break;
                }
                default:
                    bodies.push({ slot, type: 'asteroidBelt', radiusKm: 0, massEarths: 0.0005, gasGiant: undefined,
                        eccentricity: 0, inclination: 0 });
            }
        }

        return this.stabilize(bodies, groups).map((body) => {
            const slot = body.slot;
            const group = groups[slot.group];
            const orbited = this.orbitedNodes(slot.group, slot.au, groups);
            const interior = orbited.length > group.nodes.length;
            const letters = groups.slice(1).filter((g) => g.au < slot.au).map((g) => g.letter);
            const label = interior ? 'A' + letters.join('') : group.label;
            const starMass = orbited.reduce((sum, i) => sum + nodes[i].properties.mass, 0);
            const mass = starMass + body.massEarths / earthMassesPerSolarMass;
            const lum = this.luminosityOf(orbited, nodes);
            const sqrtL = Math.sqrt(lum);
            const insolation = lum / (slot.au * slot.au);
            const beyondSnow = slot.au >= snowLine * sqrtL;
            const inHabitableZone = insolation >= 0.35 && insolation <= 1.1;

            const world = {
                designation: '', type: body.type, parentLabel: label, orbitedStarIDs: orbited.map((i) => nodes[i].id),
                au: slot.au, eccentricity: rounded(body.eccentricity, 3), inclination: rounded(body.inclination, 1),
                period: Math.sqrt(Math.pow(slot.au, 3) / Math.max(mass, 0.001)), anomaly: slot.anomaly,
                radiusKm: roundSwift(body.radiusKm), massEarths: rounded(body.massEarths, 4), gasGiant: body.gasGiant,
                rings: 0, moons: [], starLuminosity: lum, inHabitableZone, environment: undefined, isPrincipal: false,
                resonance: slot.resonance,
            };
            if (body.type === 'terrestrial') {
                world.environment = environment(body.radiusKm, body.massEarths, insolation, age, beyondSnow);
            }
            if (body.type !== 'asteroidBelt') {
                const { moons, rings } = this.moons(world, starMass * earthMassesPerSolarMass, age, beyondSnow);
                world.moons = moons;
                world.rings = rings;
            }
            return world;
        });
    }

    addTrojans(worlds, age) {
        if (!Dice.chance(0.04)) return;
        const giants = range(worlds.length).filter((i) => worlds[i].type === 'gasGiant');
        if (giants.length === 0) return;
        const hostIndex = giants[rng.intBelow(0, giants.length)];
        const trojan = { ...worlds[hostIndex] };
        trojan.type = 'terrestrial';
        trojan.gasGiant = undefined;
        trojan.anomaly = Dice.chance(0.5) ? 'trojanLeading' : 'trojanTrailing';
        trojan.radiusKm = Dice.uniform(0.2, 0.6) * PlanetPhysics.earthRadiusKm;
        trojan.massEarths = PlanetPhysics.rockyMass(trojan.radiusKm);
        trojan.resonance = undefined;
        trojan.environment = environment(trojan.radiusKm, trojan.massEarths, insolationOf(trojan), age,
            trojan.au >= snowLine * luminosityScale(trojan));
        trojan.moons = [];
        trojan.rings = 0;
        worlds.splice(hostIndex + 1, 0, trojan);
    }

    assignDesignations(worlds) {
        const planetCounts = new Map();
        const beltCounts = new Map();
        for (const world of worlds) {
            const label = world.parentLabel;
            let number;
            if (world.type === 'asteroidBelt') {
                beltCounts.set(label, (beltCounts.get(label) ?? 0) + 1);
                number = `Belt ${beltCounts.get(label)}`;
            } else {
                const order = planetCounts.get(label) ?? 0;
                planetCounts.set(label, order + 1);
                number = order < 25 ? String.fromCharCode(98 + order) : `${order + 2}`;
            }
            world.designation = label === '' ? number : `${label} ${number}`;
            world.moons.forEach((moon, index) => {
                moon.designation = `${world.designation} ${romanNumeral(index + 1)}`;
            });
        }
    }

    // MARK: moons and rings

    moons(world, starMassEarths, age, beyondSnowLine) {
        const hillKm = world.au * 1.496e8 * Math.cbrt(world.massEarths / (3 * Math.max(starMassEarths, 1)));
        const room = hillKm / Math.max(world.radiusKm, 1);
        const insolation = insolationOf(world);
        let masses = [];
        let rings = 0;

        const giant = world.gasGiant;
        if (giant) {
            let mean = Math.max(1.5 + 2.5 * Math.log10(Math.max(giant.massEarths, 1) / 10), 0.3);
            if (room < 30) mean = 0;
            else if (room < 200) mean *= 0.4;
            const count = Math.min(Dice.poisson(mean), 8);
            const weights = range(count).map(() => Math.pow(Dice.uniform(0.05, 1), 2));
            const total = weights.reduce((a, b) => a + b, 0);
            const budget = 1e-4 * giant.massEarths * Dice.logUniform(0.3, 3);
            masses = weights.map((w) => budget * w / Math.max(total, 1e-9));
            const icy = isIcyGiant(giant.giantClass);
            if (icy && room >= 30 && Dice.chance(0.15)) masses.push(Dice.uniform(0.002, 0.005));
            if (Dice.chance(icy ? 0.4 : 0.6)) rings = Dice.rollD3();
        } else if (room >= 30) {
            const planetRadius = world.radiusKm / PlanetPhysics.earthRadiusKm;
            if (planetRadius >= 0.4 && Dice.chance(0.15)) masses.push(world.massEarths * Dice.logUniform(0.001, 0.0125));
            if (Dice.chance(0.1)) masses.push(PlanetPhysics.rockyMass(Dice.uniform(150, 400)));
            if (Dice.chance(0.02)) rings = 1;
        }

        const moons = [];
        for (const mass of stableSort(masses, (a, b) => a > b)) {
            const density = beyondSnowLine ? Dice.uniform(1.6, 2.4) : Dice.uniform(2.8, 3.6);
            const radiusKm = Math.cbrt(3 * mass * PlanetPhysics.earthMassKg / (4 * Math.PI * density * 1000)) / 1000;
            if (!(radiusKm >= 150)) continue;
            const moon = { designation: '', radiusKm: roundSwift(radiusKm), massEarths: rounded(mass, 6),
                environment: undefined, isPrincipal: false };
            if (radiusKm >= 300) moon.environment = environment(radiusKm, mass, insolation, age, beyondSnowLine);
            moons.push(moon);
        }
        return { moons, rings };
    }

    // MARK: principal world

    choosePrincipalWorld(worlds) {
        const candidates = [];
        worlds.forEach((world, index) => {
            if (world.type === 'terrestrial' && world.environment) {
                candidates.push({ world: index, moon: null, score: habitabilityIndex(world.environment, gravityOf(world)) });
            }
            world.moons.forEach((moon, moonIndex) => {
                if (moon.environment) {
                    candidates.push({ world: index, moon: moonIndex, score: habitabilityIndex(moon.environment, gravityOf(moon)) });
                }
            });
        });
        const best = maxBy(candidates, (a, b) => a.score < b.score);
        let choice = best && best.score > 0.001 ? { world: best.world, moon: best.moon } : null;
        if (!choice) {
            const bodies = [];
            worlds.forEach((world, index) => {
                if (world.type !== 'gasGiant') bodies.push({ world: index, moon: null });
                world.moons.forEach((_, moon) => bodies.push({ world: index, moon }));
            });
            if (bodies.length > 0) choice = bodies[rng.intBelow(0, bodies.length)];
        }
        if (!choice) return undefined;
        if (choice.moon !== null) {
            worlds[choice.world].moons[choice.moon].isPrincipal = true;
            return worlds[choice.world].moons[choice.moon].designation;
        }
        worlds[choice.world].isPrincipal = true;
        return worlds[choice.world].designation;
    }
}

// MARK: surfaces

/** Mostly hydrogen; helium in some, the hottest ionised helium; as they cool, carbon, metals, or no lines at all */
function whiteDwarfAtmosphere(temperature) {
    if (temperature > 45000 && Dice.chance(0.4)) return 'do';
    if (temperature > 12000) return Dice.chance(0.15) ? 'db' : 'da';
    return Dice.weighted([['da', 0.6], ['dc', 0.2], ['dz', 0.12], ['dq', 0.08]]);
}

/** Set by principalWorld.js, which builds systems round a principal world already known */
let applyRequirements = () => {};
export function setRequirementsHandler(handler) {
    applyRequirements = handler;
}

function oxygenChance(age) {
    if (age < 1) return 0;
    if (age < 2.5) return 0.3;
    return 0.65;
}

/** Atmosphere, temperature and water for a rocky or icy body from its size and the starlight it gets */
export function environment(radiusKm, massEarths, insolation, age, beyondSnowLine) {
    const escape = PlanetPhysics.escapeVelocity(massEarths, radiusKm);
    const gravity = PlanetPhysics.gravity(massEarths, radiusKm);
    const shoreline = insolation / Math.max(Math.pow(escape, 4), 1e-9);
    const bareEquilibrium = 278.6 * Math.pow(insolation, 0.25) * Math.pow(0.7, 0.25);

    let kind;
    let pressure;
    if (radiusKm > 1.6 * PlanetPhysics.earthRadiusKm && shoreline < 2 && Dice.chance(0.35)) {
        kind = 'hydrogen';
        pressure = Dice.logUniform(100, 5000);
    } else if (shoreline < 5) {
        pressure = Math.min(Math.max(Math.pow(10, Dice.normal(0, 0.6)) * gravity, 0.01), 200);
        if (insolation > 1.1 && Dice.chance(0.7)) {
            kind = Dice.chance(0.5) ? 'sulfuric' : 'carbonDioxide';
            pressure = Dice.logUniform(20, 120);
        } else if (bareEquilibrium < 130 && pressure >= 0.05) {
            kind = 'methane';
        } else if (insolation >= 0.3 && insolation <= 1.15 && Dice.chance(oxygenChance(age))) {
            kind = 'nitrogenOxygen';
            pressure = Math.min(Math.max(Math.pow(10, Dice.normal(0, 0.3)), 0.3), 4);
        } else {
            kind = Dice.chance(0.5) ? 'nitrogen' : 'carbonDioxide';
        }
    } else if (shoreline < 25) {
        pressure = Dice.logUniform(0.001, 0.05);
        kind = pressure < 0.01 ? 'trace' : (Dice.chance(0.7) ? 'carbonDioxide' : 'nitrogen');
    } else if (Dice.chance(0.3)) {
        kind = 'trace';
        pressure = Dice.logUniform(0.00001, 0.001);
    } else {
        kind = 'none';
        pressure = 0;
    }

    let inventory = Math.pow(Dice.uniform(0, 1), 0.8);
    if (beyondSnowLine) inventory = Math.max(inventory, Dice.uniform(0.5, 1));
    if (radiusKm < 1000 && !beyondSnowLine) inventory *= 0.3;
    if (radiusKm > 4500 && beyondSnowLine && Dice.chance(0.15)) inventory = 1;

    const surfaceTemperature = (kind, pressure, icy) => {
        let albedo;
        if (kind === 'sulfuric') albedo = 0.75;
        else if (kind === 'carbonDioxide' && pressure > 10) albedo = 0.75;
        else if (kind === 'hydrogen') albedo = 0.35;
        else albedo = icy ? 0.55 : 0.3;
        let opticalDepth;
        switch (kind) {
            case 'nitrogen': case 'nitrogenOxygen': opticalDepth = 0.65 * Math.pow(pressure, 0.6); break;
            case 'carbonDioxide': case 'sulfuric': opticalDepth = 2 * Math.pow(pressure, 0.85); break;
            case 'methane': opticalDepth = 0.5 * Math.pow(pressure, 0.8); break;
            case 'hydrogen': opticalDepth = 3 * Math.pow(pressure, 0.3); break;
            default: opticalDepth = 0;
        }
        let thermostat = 0.0;
        if (['nitrogen', 'nitrogenOxygen', 'carbonDioxide'].includes(kind) && pressure >= 0.1 && pressure < 10 &&
            insolation >= 0.35 && insolation < 1 && inventory > 0.1) {
            thermostat = (1 - insolation) * 3;
        }
        const totalDepth = opticalDepth + thermostat;
        return 278.6 * Math.pow(insolation, 0.25) * Math.pow(1 - albedo, 0.25) * Math.pow(1 + totalDepth, 0.25);
    };

    let temperature = surfaceTemperature(kind, pressure, beyondSnowLine && inventory > 0.5);
    const boiling = pressure > 0.006 ? 1 / (1 / 373.15 - 2.045e-4 * Math.log(pressure)) : 273;
    let water;
    if (kind === 'hydrogen' || temperature >= boiling) water = 0;
    else if (temperature < 273) water = pressure < 0.006 && !beyondSnowLine ? inventory * 0.3 : inventory;
    else water = Math.min(Math.max(inventory * 1.2 - 0.05, 0), 1);
    const waterPercent = Math.trunc(roundSwift(water * 100));

    if (kind === 'nitrogenOxygen' && (waterPercent === 0 || temperature < 273 || temperature > 330)) {
        kind = 'nitrogen';
        temperature = surfaceTemperature(kind, pressure, false);
    }
    let contaminated;
    switch (kind) {
        case 'nitrogenOxygen': contaminated = Dice.chance(0.2); break;
        case 'carbonDioxide': contaminated = pressure > 5; break;
        case 'sulfuric': contaminated = true; break;
        default: contaminated = false;
    }
    return { atmosphere: kind, pressureBar: rounded(pressure, pressure < 0.1 ? 5 : 2), contaminated, waterPercent,
        temperatureK: roundSwift(temperature) };
}

/** A range with the zones taken out of it, keeping pieces that span at least a factor of 1.2 */
function subtract(zones, whole) {
    let result = [whole];
    for (const zone of zones) {
        result = result.flatMap((piece) => {
            if (!overlaps(zone, piece)) return [piece];
            const pieces = [];
            if (piece[0] < zone[0]) pieces.push([piece[0], zone[0]]);
            if (zone[1] < piece[1]) pieces.push([zone[1], piece[1]]);
            return pieces;
        });
    }
    return stableSort(result.filter((r) => r[1] > r[0] * 1.2), (a, b) => a[0] < b[0]);
}
