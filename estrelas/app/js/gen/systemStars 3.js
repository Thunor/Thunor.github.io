//
//  systemStars.js
//  Estrelas (web)
//
//  Rolls a whole star field from a seed: system positions, each system's stars, their orbits, planetary systems
//  and names. A port of SystemStars.swift and SIMD3Float+Spaced.swift; the same seed gives the same star field as
//  the macOS app, ids included.
//

import { rng, SeededIDs } from './random.js';
import { Dice, SpectralClass, StellarType, spectralLetter, stellarName, subclassRange } from './stellar.js';
import { nebulaClouds, makeYoung, nebulaRemnants, nameNebulae } from './nebulaGenerator.js';
import { PlanetarySystemGenerator } from './planetarySystemGenerator.js';
import { placeNames } from './placeNames.js';
import { generateSocial } from './socialGenerator.js';
import { generateRotations } from './rotationGenerator.js';

/** Systems are placed inside a cube this far either side of the origin on each axis, in scene units */
export const halfLength = 10;

/** Stars in a system: about 56% single, 33% binary, 8% triple and 3% quadruple (Raghavan et al. 2010) */
function numStarsInSystem(inClusterOrCore) {
    const boost = inClusterOrCore ? 1.5 : 1;
    return Dice.weighted([[1, 0.56], [2, 0.33 * boost], [3, 0.08 * boost], [4, 0.03 * boost]]);
}

/**
 * What kind of object a star is, in about the proportions found near the Sun: mostly main-sequence stars, about one
 * in eight a brown dwarf and one in eighteen a white dwarf, a few subgiants, giants and subdwarfs, and the
 * supergiants, Wolf–Rayet stars, neutron stars and black holes rarer still (commoner than they really are)
 */
function rollKind() {
    return Dice.weighted([['brownDwarf', 0.12], ['whiteDwarf', 0.055], ['subdwarf', 0.01], ['subgiant', 0.02],
        ['giant', 0.012], ['brightGiant', 0.0015], [['supergiant', StellarType.Ib], 0.0006],
        [['supergiant', StellarType.Iab], 0.0004], [['supergiant', StellarType.Ia], 0.0002],
        [['supergiant', StellarType.hypergiant], 0.00008], ['wolfRayet', 0.0003], ['neutronStar', 0.0025],
        ['blackHole', 0.0008], ['mainSequence', 0.7774]]);
}

/** Rolls what a star is: its class, subclass and luminosity class, and anything special about it */
function rollStar(star) {
    let variant;
    let variability;
    let kind = rollKind();
    let supergiantType;
    if (Array.isArray(kind)) [kind, supergiantType] = kind;
    switch (kind) {
        case 'mainSequence': {
            star.stellarType = StellarType.V;
            const spectralClass = determineMainSeqType();
            star.spectralClass = spectralClass;
            // Young stars still settling onto the main sequence, now and then even outside star-forming nebulae
            if (Dice.chance(0.004)) {
                variant = Dice.chance(0.1) ? 'protostar'
                    : ([SpectralClass.O, SpectralClass.B, SpectralClass.A].includes(spectralClass) ? 'herbigAeBe' : 'tTauri');
            } else {
                switch (spectralClass) {
                    case SpectralClass.B: variant = Dice.weighted([['be', 0.15], ['bp', 0.07], [undefined, 0.78]]); break;
                    case SpectralClass.A: variant = Dice.weighted([['am', 0.12], ['ap', 0.07], ['blueStraggler', 0.015],
                        [undefined, 0.795]]); break;
                    case SpectralClass.F: variant = Dice.chance(0.01) ? 'blueStraggler' : undefined; break;
                    case SpectralClass.M: variability = Dice.chance(0.35) ? 'flare' : undefined; break;
                    default: break;
                }
            }
            break;
        }
        case 'brownDwarf':
            star.stellarType = StellarType.V;
            star.spectralClass = Dice.weighted([[SpectralClass.L, 0.4], [SpectralClass.T, 0.45], [SpectralClass.Y, 0.15]]);
            break;
        case 'whiteDwarf':
            // Its atmosphere and temperature index come once its temperature is known
            star.stellarType = StellarType.d;
            star.spectralClass = SpectralClass.D;
            break;
        case 'neutronStar':
            star.stellarType = StellarType.remnant;
            star.spectralClass = SpectralClass.N;
            variant = Dice.weighted([['pulsar', 0.6], ['magnetar', 0.1], [undefined, 0.3]]);
            break;
        case 'blackHole':
            star.stellarType = StellarType.remnant;
            star.spectralClass = SpectralClass.X;
            break;
        case 'wolfRayet':
            star.stellarType = StellarType.V;
            star.spectralClass = SpectralClass.W;
            variant = Dice.weighted([['wn', 0.55], ['wc', 0.4], ['wo', 0.05]]);
            break;
        case 'subdwarf':
            // Old, low-mass stars, and the hot cores of stripped giants
            star.stellarType = StellarType.VI;
            star.spectralClass = Dice.weighted([[SpectralClass.O, 0.03], [SpectralClass.B, 0.07], [SpectralClass.G, 0.14],
                [SpectralClass.K, 0.24], [SpectralClass.M, 0.52]]);
            break;
        case 'subgiant':
            star.stellarType = StellarType.IV;
            star.spectralClass = determineGiantType();
            break;
        case 'giant': {
            star.stellarType = StellarType.III;
            // A few giants have dredged up carbon, or the s-process elements that make S-type stars
            const roll = Dice.uniform(0, 1);
            if (roll < 0.03) {
                star.spectralClass = SpectralClass.C;
                variant = Dice.weighted([['cN', 0.7], ['cR', 0.2], ['cJ', 0.1]]);
                variability = Dice.chance(0.4) ? 'mira' : undefined;
            } else if (roll < 0.05) {
                star.spectralClass = SpectralClass.S;
                variant = Dice.weighted([['s', 0.6], ['ms', 0.25], ['sc', 0.15]]);
                variability = Dice.chance(0.4) ? 'mira' : undefined;
            } else {
                const spectralClass = determineGiantType();
                star.spectralClass = spectralClass;
                if (spectralClass === SpectralClass.M) variability = Dice.chance(0.25) ? 'mira' : undefined;
                else if (spectralClass === SpectralClass.A || spectralClass === SpectralClass.F) {
                    variability = Dice.chance(0.3) ? 'rrLyrae' : undefined;
                }
            }
            break;
        }
        case 'brightGiant':
            star.stellarType = StellarType.II;
            star.spectralClass = determineGiantType();
            if (star.spectralClass === SpectralClass.F || star.spectralClass === SpectralClass.G) {
                variability = Dice.chance(0.45) ? 'cepheid' : undefined;
            }
            break;
        case 'supergiant':
            star.stellarType = supergiantType;
            // Hypergiants are mostly blue or red
            star.spectralClass = supergiantType === StellarType.hypergiant
                ? Dice.weighted([[SpectralClass.B, 0.3], [SpectralClass.A, 0.15], [SpectralClass.F, 0.1], [SpectralClass.G, 0.1],
                    [SpectralClass.K, 0.15], [SpectralClass.M, 0.2]])
                : determineGiantType();
            if ((star.spectralClass === SpectralClass.F || star.spectralClass === SpectralClass.G) &&
                supergiantType !== StellarType.hypergiant) {
                variability = Dice.chance(0.45) ? 'cepheid' : undefined;
            }
            break;
        default: break;
    }
    star.variant = variant;
    star.variability = variability;
    // The subclasses each class or sequence runs through
    const spectralClass = star.spectralClass ?? SpectralClass.M;
    let range;
    if (spectralClass === SpectralClass.W) {
        range = variant === 'wc' ? [4, 9] : variant === 'wo' ? [1, 4] : [2, 9];
    } else if (spectralClass === SpectralClass.N || spectralClass === SpectralClass.X) {
        range = [0, 0];
    } else {
        range = subclassRange(spectralClass);
    }
    star.subClass = rng.int(range[0], range[1]);
}

/** Main-sequence spectral class: three quarters red dwarfs, the hot massive classes rare */
export function determineMainSeqType() {
    return Dice.weighted([[SpectralClass.O, 0.0005], [SpectralClass.B, 0.0045], [SpectralClass.A, 0.025],
        [SpectralClass.F, 0.05], [SpectralClass.G, 0.08], [SpectralClass.K, 0.14], [SpectralClass.M, 0.70]]);
}

/** Evolved stars are mostly cool: K giants dominate */
function determineGiantType() {
    return Dice.weighted([[SpectralClass.O, 0.01], [SpectralClass.B, 0.04], [SpectralClass.A, 0.04], [SpectralClass.F, 0.06],
        [SpectralClass.G, 0.2], [SpectralClass.K, 0.5], [SpectralClass.M, 0.15]]);
}

/** Rough mass in solar masses from spectral class, subclass and stellar type */
export function estimateMass(star) {
    if (star.stellarType === StellarType.d) return rng.double(0.5, 0.8);
    const between = (lower, upper) => rng.double(lower, upper);
    const fraction = Math.min(Math.max(star.subClass ?? 5, 0), 9) / 9;
    // Classes and stars whose mass doesn't follow the main sequence's
    switch (star.spectralClass ?? SpectralClass.M) {
        // Brown dwarfs: the cooler the class, the less massive
        case SpectralClass.L: return 0.078 - fraction * 0.018;
        case SpectralClass.T: return 0.07 - fraction * 0.045;
        case SpectralClass.Y: return 0.025 - fraction * 0.02;
        case SpectralClass.N: return between(1.2, 2.1);
        case SpectralClass.X: return Dice.logUniform(5, 25);
        case SpectralClass.W: return between(10, 25);
        case SpectralClass.C: case SpectralClass.S: return between(1, 3);
        default: break;
    }
    if (star.stellarType === StellarType.VI && (star.spectralClass === SpectralClass.O || star.spectralClass === SpectralClass.B)) {
        // Hot subdwarfs are stripped cores of about half a Sun
        return between(0.45, 0.5);
    }
    if (star.variability === 'rrLyrae') return between(0.6, 0.8);
    if (star.variability === 'mira') return between(1, 3);
    const x0Mass = { [SpectralClass.O]: 60, [SpectralClass.B]: 18, [SpectralClass.A]: 3.2, [SpectralClass.F]: 1.7,
        [SpectralClass.G]: 1.1, [SpectralClass.K]: 0.8, [SpectralClass.M]: 0.5 };
    const spectralClass = star.spectralClass ?? SpectralClass.M;
    const hotMass = x0Mass[spectralClass] ?? 0.5;
    const coolMass = x0Mass[spectralClass - 1] ?? 0.08;
    const t = Math.min(Math.max(star.subClass ?? 5, 0), 9) / 10;
    const mainSequenceMass = hotMass * Math.pow(coolMass / hotMass, t);
    switch (star.stellarType ?? StellarType.V) {
        case StellarType.VI: return mainSequenceMass * 0.8;
        case StellarType.IV: return mainSequenceMass * 1.1;
        case StellarType.III: return mainSequenceMass * 1.3;
        case StellarType.II: return mainSequenceMass * 2.0;
        case StellarType.Ib: return mainSequenceMass * 3.0;
        case StellarType.Iab: return mainSequenceMass * 4.0;
        case StellarType.Ia: return mainSequenceMass * 5.0;
        case StellarType.hypergiant: return mainSequenceMass * 7.0;
        default: return mainSequenceMass;
    }
}

/** Animation period in seconds, following Kepler's third law */
function orbitalPeriod(separation, totalMass) {
    const period = 60.0 * Math.sqrt(Math.pow(separation, 3) / Math.max(totalMass, 0.01));
    return Math.min(Math.max(period, 8.0), 120.0);
}

/** Mirrored orbits for two bodies around their common centre of mass */
function pairedOrbits(massA, massB, separation, maxEccentricity) {
    const totalMass = massA + massB;
    const eccentricity = rng.double(0, maxEccentricity);
    const semiMajAxis = separation * massB / totalMass;
    const inclination = rng.doubleBelow(0, 180);
    const lngAscNode = rng.doubleBelow(0, 360);
    const argOfPeriapsis = rng.doubleBelow(0, 360);
    const trueAnomaly = rng.doubleBelow(0, 360);
    const orbitA = { eccentricity, semiMajAxis, inclination, lngAscNode, argOfPeriapsis, trueAnomaly,
        period: orbitalPeriod(separation, totalMass) };
    const orbitB = { ...orbitA, semiMajAxis: separation * massA / totalMass,
        argOfPeriapsis: (orbitA.argOfPeriapsis + 180) % 360 };
    return [orbitA, orbitB];
}

/** Stars 0 and 1 form a close pair; a fourth star pairs with the third, a lone third orbits the inner pair */
export function assignOrbits(members) {
    if (members.length <= 1) return;
    const mass = members.map((m) => m.mass ?? 1.0);
    const innerSeparation = rng.double(0.5, 0.7);
    [members[0].orbitalElements, members[1].orbitalElements] = pairedOrbits(mass[0], mass[1], innerSeparation, 0.15);
    if (members.length <= 2) return;
    const outerSeparation = rng.double(1.4, 1.7);
    if (members.length === 4) {
        [members[2].orbitalElements, members[3].orbitalElements] = pairedOrbits(mass[2], mass[3], outerSeparation, 0.2);
    } else {
        members[2].orbitalElements = pairedOrbits(mass[2], mass[0] + mass[1], outerSeparation, 0.2)[0];
    }
}

/** e.g. "Évora" for a single star or "Évora Aa", "Évora Ab", "Évora B" */
export function nameStars(members, systemName, planetarySystem) {
    if (members.length <= 1) {
        if (members.length === 1) members[0].name = systemName;
        return;
    }
    members.forEach((star, index) => {
        const designation = planetarySystem?.stars.find((s) => s.estrelaID === star.id)?.designation ??
            String.fromCharCode(65 + Math.min(index, 25));
        star.name = `${systemName} ${designation}`;
    });
}

/** Float32 distance, as simd_distance on SIMD3<Float> */
function floatDistance(a, b) {
    const f = Math.fround;
    const dx = f(a[0] - b[0]), dy = f(a[1] - b[1]), dz = f(a[2] - b[2]);
    return f(Math.sqrt(f(f(f(dx * dx) + f(dy * dy)) + f(dz * dz))));
}

/** Points in the cube at least `minSeparation` apart */
function getStarPoints(starCount, half, minSeparation) {
    const points = [];
    const limit = Math.fround(minSeparation);
    while (points.length < starCount) {
        const point = [rng.float(-half, half), rng.float(-half, half), rng.float(-half, half)];
        if (points.every((other) => !(floatDistance(point, other) < limit))) points.push(point);
    }
    return points;
}

/** A new star with Estrela()'s defaults */
export function newStar() {
    return {
        id: '', systemID: '', name: '', spectralClass: SpectralClass.A, subClass: 5, stellarType: StellarType.d,
        mass: 1.0, radius: 1.0, luminosity: 1.0, tempEffective: 1.0, innerLimit: 1.0, bioZoneInner: 1.0,
        bioZoneOuter: 1.0, orbitalElements: undefined, variant: undefined, variability: undefined,
    };
}

/** The saved form of a star: class letters rather than raw numbers */
export function savedStar(star) {
    return { ...star, spectralClass: spectralLetter[star.spectralClass], stellarType: stellarName[star.stellarType] };
}

/**
 * Rolls a whole star field, or one sector of it (see sectors.js), giving no system a name in `reservedNames`. Returns the systems in their saved (JSON) form:
 * `{ id, name, position, stars, planetarySystem }` with positions as Float32Arrays. `seed` is the sector's own, so
 * for the origin it's the universe's seed and the rolls are exactly those of a star field from before sectors.
 */
export function generateStarField(seed, sector = { x: 0, y: 0, z: 0 }, reservedNames = []) {
    rng.reseed(seed);
    const ids = new SeededIDs(seed);
    const systems = [];
    const isOrigin = sector.x === 0 && sector.y === 0 && sector.z === 0;
    const minSeparation = 1.5;
    // Sectors away from the origin keep half the separation clear of their faces, so stars either side of a face
    // between two of them are never closer than any two in the same sector
    const half = isOrigin ? halfLength : Math.fround(halfLength - Math.fround(minSeparation / 2));
    const count = rng.int(100, 300);
    const points = getStarPoints(count, half, minSeparation);
    const side = halfLength * 2;
    const offset = [sector.x * side, sector.y * side, sector.z * side].map(Math.fround);
    for (const point of points) {
        const position = point.map((value, axis) => Math.fround(value + offset[axis]));
        const system = { id: ids.next(), position: Float32Array.from(position), stars: [] };
        const starCount = numStarsInSystem(false);
        for (let n = 0; n < starCount; n++) {
            const star = newStar();
            star.id = ids.next();
            star.systemID = system.id;
            rollStar(star);
            star.mass = estimateMass(star);
            system.stars.push(star);
        }
        assignOrbits(system.stars);
        systems.push(system);
    }

    // The sector's star-forming clouds, before its planetary systems, as the stars in them are young; any star they
    // changed is weighed again
    const nebulae = nebulaClouds(seed, sector, systems, makeYoung);
    for (const system of systems) {
        for (const star of system.stars) {
            if (star.mass === undefined || star.mass === null) star.mass = estimateMass(star);
        }
    }

    // Planetary systems are rolled in a second pass so they don't change the star rolls above
    const generator = new PlanetarySystemGenerator();
    // Names come last too, after every other roll, and never repeat a name another sector already has
    const names = placeNames(systems.length, rng, reservedNames);
    systems.forEach((system, index) => {
        system.planetarySystem = generator.generate(system.stars);
        system.name = names[index];
        nameStars(system.stars, names[index], system.planetarySystem);
        system.stars = system.stars.map(savedStar);
    });
    // The shells and wrecks of its dying stars, now their temperatures are known, and every nebula's name
    nebulae.push(...nebulaRemnants(seed, systems));
    nameNebulae(nebulae, seed, [...reservedNames, ...names]);
    // Societies have their own reseeded sequence, so they change none of the rolls above
    generateSocial(systems, seed);
    // As do rotations, which have dice of their own for every world
    generateRotations(systems);
    return {
        systems: systems.map((s) => ({ id: s.id, name: s.name, position: s.position, stars: s.stars,
            planetarySystem: s.planetarySystem })),
        nebulae,
    };
}
