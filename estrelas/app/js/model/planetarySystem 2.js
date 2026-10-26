//
//  planetarySystem.js
//  Estrelas (web)
//
//  Planets, asteroid belts and moons in physical units: distances in AU, radii in kilometres, masses in Earth
//  masses, pressures in bar and temperatures in kelvin. Star fields saved by version 1 stored worlds as integer
//  codes; `upgradePlanetarySystem` converts them as they're read. A port of PlanetarySystem.swift.
//

// MARK: physics

export const PlanetPhysics = {
    earthRadiusKm: 6371.0,
    earthMassKg: 5.972e24,
    earthMassesPerSolarMass: 333000.0,

    /** Earth masses of a rocky (or, under 2,000 km, rock-and-ice) body of a given radius */
    rockyMass(radiusKm) {
        const r = Math.max(radiusKm, 1) / PlanetPhysics.earthRadiusKm;
        if (radiusKm < 2000) return 4.0 / 3 * Math.PI * Math.pow(radiusKm * 1000, 3) * 2000 / PlanetPhysics.earthMassKg;
        return Math.pow(r, 3.7);
    },

    /** Radius in Earth radii of a giant planet of a given mass */
    giantRadius(massEarths) {
        if (massEarths < 50) return 0.8 * Math.pow(Math.max(massEarths, 1), 0.59);
        if (massEarths < 130) return 8 + 3.6 * (massEarths - 50) / 80;
        return 11.6 * Math.pow(massEarths / 130, -0.04);
    },

    /** Surface gravity in g */
    gravity(massEarths, radiusKm) {
        const r = Math.max(radiusKm, 1) / PlanetPhysics.earthRadiusKm;
        return massEarths / (r * r);
    },

    /** Escape velocity relative to Earth's 11.2 km/s */
    escapeVelocity(massEarths, radiusKm) {
        return Math.sqrt(massEarths / (Math.max(radiusKm, 1) / PlanetPhysics.earthRadiusKm));
    },
};

export const giantClasses = ['subNeptune', 'iceGiant', 'saturnian', 'jovian', 'superJovian'];

export function giantClassForMass(massEarths) {
    if (massEarths < 10) return 'subNeptune';
    if (massEarths < 50) return 'iceGiant';
    if (massEarths < 200) return 'saturnian';
    if (massEarths < 1000) return 'jovian';
    return 'superJovian';
}

/** Ice giants and sub-Neptunes are blue-green and calmly banded */
export const isIcyGiant = (giantClass) => giantClass === 'subNeptune' || giantClass === 'iceGiant';

export const isTrojan = (anomaly) => anomaly === 'trojanLeading' || anomaly === 'trojanTrailing';

export const atmosphereKinds = ['none', 'trace', 'carbonDioxide', 'nitrogen', 'nitrogenOxygen', 'methane', 'sulfuric',
    'hydrogen'];

// MARK: environment

/** Broad band of a mean surface temperature: frozen, cold, temperate, hot or boiling */
export function temperatureBand(kelvin) {
    if (kelvin < 240) return 'frozen';
    if (kelvin < 273) return 'cold';
    if (kelvin < 313) return 'temperate';
    if (kelvin < 353) return 'hot';
    return 'boiling';
}

const representativeKelvin = { frozen: 200, cold: 258, temperate: 288, hot: 330, boiling: 420 };

/** An environment's temperature band */
export const environmentTemperature = (environment) => temperatureBand(environment.temperatureK);

/** Air people can breathe at a comfortable pressure, if perhaps through a filter */
export function hasBreathableAir(environment) {
    return !!environment && environment.atmosphere === 'nitrogenOxygen' && environment.pressureBar >= 0.4 &&
        environment.pressureBar <= 3;
}

/** Temperate, with breathable air (filtered or not) and some surface water */
export function isHabitableEnvironment(environment) {
    return !!environment && environmentTemperature(environment) === 'temperate' && hasBreathableAir(environment) &&
        environment.waterPercent >= 10;
}

/** Liquid water on the surface rather than ice */
export function hasLiquidWater(environment) {
    const band = environmentTemperature(environment);
    return environment.waterPercent > 0 && band !== 'frozen' && band !== 'boiling';
}

// MARK: worlds

/** √L of the star(s) a world orbits */
export const luminosityScale = (world) => Math.sqrt(Math.max(world.starLuminosity, 1e-12));
/** Starlight at the world relative to what Earth gets */
export const insolation = (world) => world.starLuminosity / Math.max(world.au * world.au, 1e-9);
/** Surface gravity of a world or moon */
export const gravityOf = (body) => PlanetPhysics.gravity(body.massEarths, body.radiusKm);

export function hasHabitableWorld(system) {
    return system.worlds.some((world) => isHabitableEnvironment(world.environment) ||
        world.moons.some((moon) => isHabitableEnvironment(moon.environment)));
}

export const hasPlanets = (system) => system.worlds.some((w) => w.type !== 'asteroidBelt');
export const hasAsteroidBelt = (system) => system.worlds.some((w) => w.type === 'asteroidBelt');
export const hasGasGiant = (system) => system.worlds.some((w) => w.type === 'gasGiant');
export const countOf = (system, type) => system.worlds.filter((w) => w.type === type).length;

/** How well people could live on a world without help, 0 to 1 */
export function habitabilityIndex(environment, gravity) {
    const t = environment.temperatureK;
    const warmth = Math.exp(-Math.pow((t - 288) / 30, 2));
    let air;
    if (hasBreathableAir(environment)) {
        air = environment.contaminated ? 0.6 : 1;
    } else {
        switch (environment.atmosphere) {
            case 'nitrogen': case 'carbonDioxide': case 'methane':
                air = environment.pressureBar >= 0.1 && environment.pressureBar <= 5 ? 0.25 : 0.08;
                break;
            case 'nitrogenOxygen': air = 0.4; break;
            case 'trace': case 'none': air = 0.05; break;
            default: air = 0.01;
        }
    }
    const w = environment.waterPercent;
    const water = w === 0 ? 0.4 : w < 10 ? 0.7 : w <= 90 ? 1 : 0.75;
    const weight = Math.max(Math.exp(-Math.pow((gravity - 1) / 0.7, 2)), 0.2);
    return Math.min(Math.max(warmth * air * water * weight, 0), 1);
}

// MARK: earlier versions

function legacyAtmosphere(code) {
    if (code <= 0) return ['none', 0, false];
    switch (code) {
        case 1: return ['trace', 0.005, false];
        case 2: return ['nitrogenOxygen', 0.25, true];
        case 3: return ['nitrogenOxygen', 0.25, false];
        case 4: return ['nitrogenOxygen', 0.55, true];
        case 5: return ['nitrogenOxygen', 0.55, false];
        case 6: return ['nitrogenOxygen', 1.0, false];
        case 7: return ['nitrogenOxygen', 1.0, true];
        case 8: return ['nitrogenOxygen', 1.8, false];
        case 9: return ['nitrogenOxygen', 1.8, true];
        case 10: return ['nitrogen', 1.5, false];
        case 11: return ['carbonDioxide', 30, true];
        case 12: return ['sulfuric', 90, true];
        case 13: return ['nitrogen', 5, false];
        case 14: return ['nitrogenOxygen', 0.7, false];
        case 15: return ['methane', 1.5, false];
        default: return ['hydrogen', 500, false];
    }
}

export { legacyAtmosphere };

const legacyRadiusKm = (code) => (code < 0 ? 300 : code * 800);

function upgradeEnvironment(environment) {
    if (!environment || typeof environment.atmosphere === 'string') {
        if (environment && environment.contaminated === undefined) environment.contaminated = false;
        return environment;
    }
    const [kind, pressure, contaminated] = legacyAtmosphere(environment.atmosphere);
    return {
        atmosphere: kind, pressureBar: pressure, contaminated,
        waterPercent: Math.min(Math.max(environment.hydrographics ?? 0, 0), 10) * 10,
        temperatureK: representativeKelvin[environment.temperature ?? 'temperate'] ?? 288,
    };
}

function upgradeGasGiant(giant) {
    if (!giant) return giant;
    const massEarths = giant.massEarths ?? giant.mass ?? 100;
    const radiusEarths = giant.radiusEarths ?? giant.diameter ?? 10;
    return { giantClass: giant.giantClass ?? giantClassForMass(massEarths), radiusEarths, massEarths };
}

/** A society saved in an earlier layout is left out, to be generated again */
const isCurrentSocial = (social) => !!social && typeof social.population === 'number' &&
    typeof social.resources === 'number' && typeof social.conflict === 'string' && typeof social.port?.tier === 'string';

function upgradeBody(body, isBelt = false) {
    body.gasGiant = upgradeGasGiant(body.gasGiant);
    if (body.radiusKm === undefined) {
        if (body.gasGiant) {
            body.radiusKm = body.gasGiant.radiusEarths * PlanetPhysics.earthRadiusKm;
            body.massEarths = body.gasGiant.massEarths;
        } else if (isBelt) {
            body.radiusKm = 0;
            body.massEarths = 0.0005;
        } else {
            const code = body.size ?? 0;
            body.radiusKm = legacyRadiusKm(code);
            body.massEarths = PlanetPhysics.rockyMass(body.radiusKm);
        }
    }
    delete body.size;
    body.environment = upgradeEnvironment(body.environment);
    if (body.isPrincipal === undefined) body.isPrincipal = body.isMainworld ?? false;
    delete body.isMainworld;
    if (body.social && !isCurrentSocial(body.social)) delete body.social;
    return body;
}

/**
 * Reads a planetary system saved by any version into the current layout, in place. Returns whether anything
 * needed converting (so the star field is saved again).
 */
export function upgradePlanetarySystem(system) {
    if (!system) return false;
    let changed = false;
    if (system.principalWorld === undefined && system.mainworld !== undefined) {
        system.principalWorld = system.mainworld;
        changed = true;
    }
    for (const key of ['mainworld', 'gasGiants', 'planetoidBelts', 'terrestrialPlanets', 'emptyOrbits', 'baselineNumber',
        'baselineOrbit', 'spread']) {
        if (key in system) {
            delete system[key];
            changed = true;
        }
    }
    for (const star of system.stars ?? []) {
        if (!star.role) {
            star.role = star.orbitClass === 'primary' ? 'primary' : star.orbitClass === 'companion' ? 'companion' : 'secondary';
            changed = true;
        }
        if (star.innerLimitAU === undefined) {
            star.innerLimitAU = Math.max(2 * star.diameter * 0.00465, 0.015 * Math.sqrt(Math.max(star.luminosity, 0)), 0.0005);
            changed = true;
        }
        for (const key of ['orbitClass', 'orbitNumber', 'mao']) {
            if (key in star) {
                delete star[key];
                changed = true;
            }
        }
    }
    for (const world of system.worlds ?? []) {
        if (world.type === 'planetoidBelt') {
            world.type = 'asteroidBelt';
            changed = true;
        }
        if (world.radiusKm === undefined || typeof world.environment?.atmosphere === 'number' ||
            world.isMainworld !== undefined || (world.social && !isCurrentSocial(world.social)) ||
            (world.gasGiant && world.gasGiant.giantClass === undefined)) changed = true;
        if (!['eccentric', 'inclined', 'retrograde', 'trojanLeading', 'trojanTrailing'].includes(world.anomaly)) {
            if (world.anomaly !== undefined) changed = true;
            delete world.anomaly;
        }
        upgradeBody(world, world.type === 'asteroidBelt');
        for (const key of ['orbitNumber', 'hzco']) {
            if (key in world) {
                delete world[key];
                changed = true;
            }
        }
        if (world.starLuminosity === undefined || world.starLuminosity < 0) {
            const orbited = (system.stars ?? []).filter((star) => world.orbitedStarIDs.includes(star.estrelaID));
            world.starLuminosity = Math.max(orbited.reduce((sum, star) => sum + star.luminosity, 0),
                system.stars?.[0]?.luminosity ?? 1);
            changed = true;
        }
        for (const moon of world.moons ?? []) {
            if (moon.radiusKm === undefined || typeof moon.environment?.atmosphere === 'number' ||
                moon.isMainworld !== undefined || (moon.social && !isCurrentSocial(moon.social))) changed = true;
            upgradeBody(moon);
        }
    }
    return changed;
}
