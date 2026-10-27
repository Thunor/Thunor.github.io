//
//  planetaryScene.js
//  Estrelas (web)
//
//  Builds three.js objects for a planetary system: fine orbit rings, planets and moons moving along them, asteroid
//  belts of tumbling rocks, and habitable zones. A port of PlanetarySystemScene.swift.
//

import * as THREE from '../../vendor/three.module.min.js';
import { offsetAtMeanAnomaly, Orbit, Spin, secondsPerYear } from './orbit.js';
import { zoomScaledMaterial } from './shaders.js';
import { substellarPoint } from '../surface/surfaceMap.js';
import { environmentTemperature, PlanetPhysics } from '../model/planetarySystem.js';
import { habitableZone } from '../gen/planetarySystemGenerator.js';
import { SplitMix64 } from '../gen/random.js';
import { stableHash } from '../surface/u64.js';

/** Scene units per Orbit# */
export const orbitScale = 0.5;
export const ringThickness = 0.006;
/** Zoom past which orbit rings thin and belt rocks shrink */
export const shrinkStartZoom = 10;

const ringColor = new THREE.Color(0.4, 0.4, 0.4);
const moonRingThickness = ringThickness * 0.4;
const moonRingColor = new THREE.Color(0.28, 0.28, 0.28);
const beltColor = new THREE.Color(0.6, 0.6, 0.6);
/** How far a belt reaches either side of its middle, as a ratio: its rocks stay inside, and its neighbours outside */
const beltSpread = 1.12;
/**
 * A minor planet's orbit as drawn: in its lane (see minorPlanets.js) spread across the whole width of its belt as the
 * belt is drawn, so that, at the size it's drawn, it never touches the minor planets in the lanes either side, nor
 * leaves the belt. `laneRoom` is the largest it may be drawn.
 */
function minorPlanetElements(world, worlds, mapping, band) {
    const elements = orbitalElementsFor(world, worlds, mapping);
    if (!band) return { ...elements, laneRoom: Infinity };
    const lanes = worlds.filter((w) => w.minorPlanet && w.belt === world.belt).sort((a, b) => a.au - b.au);
    const lane = lanes.indexOf(world);
    // The lanes share the belt's band less a margin at each edge
    const margin = (band.high - band.low) * 0.04;
    const width = (band.high - band.low - 2 * margin) / lanes.length;
    const semiMajAxis = band.low + margin + width * (lane + 0.5);
    // As eccentric, for its lane, as it is in its lane in AU (at most a third of it)
    const share = Math.min(Math.max(world.eccentricity / (0.08 / lanes.length / 3), 0), 1);
    const eccentricity = width * 0.15 * share / semiMajAxis;
    return { ...elements, semiMajAxis, eccentricity, laneRoom: width * (0.5 - 0.15 * share) * 0.9 };
}

/** A minor planet's orbit, fainter than a planet's */
const minorRingColor = new THREE.Color(0.24, 0.24, 0.24);

/** A minor planet's size on screen: about the size of the belt's largest rocks, well below the smallest planets */
const minorPlanetRadius = (radiusKm) => Math.fround(0.009 + 0.006 * Math.min(Math.max(radiusKm, 0) / 300, 1));

/**
 * A minor planet's shape: too small for its gravity to pull it round, it's a lumpy potato, squashed along its axes
 * and dented by old impacts; the largest are nearly round, like Ceres. The same world always has the same shape.
 * `axes` scale its body (x, then its spin axis y, then z); `dents` press its surface in (see dentGlobe).
 */
export function minorPlanetShape(world) {
    const generator = new SplitMix64(stableHash(`minor planet shape ${world.designation}`));
    // 0 for an irregular body, 1 for one round under its own gravity, from about 150 to 350 km in radius
    const round = Math.min(Math.max((world.radiusKm - 150) / 200, 0), 1);
    const mix = (irregular, rounded) => irregular + (rounded - irregular) * round;
    const axes = [1, mix(generator.float(0.45, 0.75), generator.float(0.92, 0.98)), mix(generator.float(0.6, 0.9), generator.float(0.95, 1))];
    const dents = [];
    const count = generator.int(4, 7);
    for (let i = 0; i < count; i++) {
        const direction = new THREE.Vector3(generator.float(-1, 1), generator.float(-1, 1), generator.float(-1, 1)).addScalar(0.0001).normalize();
        dents.push({ direction, width: generator.float(0.3, 0.75), depth: mix(generator.float(0.12, 0.32), 0.015) });
    }
    return { axes, dents };
}

/** How far a minor planet's dents press its surface in toward its centre in the direction (x, y, z): 0.5 to 1 */
export function dentFactor(shape, x, y, z) {
    const length = Math.hypot(x, y, z);
    if (!(length > 0)) return 1;
    let factor = 1;
    for (const dent of shape.dents) {
        const d = dent.direction;
        const angle = Math.acos(Math.min(Math.max((x * d.x + y * d.y + z * d.z) / length, -1), 1)) / dent.width;
        factor -= dent.depth * Math.exp(-angle * angle);
    }
    return Math.max(factor, 0.5);
}

/** Presses a minor planet's dents into its globe's vertex positions (flat x, y, z), in place */
export function dentGlobe(positions, shape) {
    for (let i = 0; i < positions.length; i += 3) {
        const scale = dentFactor(shape, positions[i], positions[i + 1], positions[i + 2]);
        positions[i] *= scale;
        positions[i + 1] *= scale;
        positions[i + 2] *= scale;
    }
}

/**
 * Maps distances in AU around one centre into scene units on a logarithmic scale, 1.3 log₂(1 + AU ÷ 0.25): about 3
 * steps out to 1 AU, 7 to 10 AU and 11 to 100 AU
 */
export class OrbitSceneMapping {
    constructor(clearance, scale = orbitScale) {
        this.clearance = clearance;
        this.scale = scale;
    }

    /** Steps out to a distance in AU */
    static steps(au) {
        return 1.3 * Math.log2(1 + Math.max(au, 0) / 0.25);
    }

    distance(au) {
        return this.clearance + Math.fround(OrbitSceneMapping.steps(au)) * this.scale;
    }

    ellipse(au, eccentricity) {
        const nearest = this.distance(au * (1 - eccentricity));
        const farthest = this.distance(au * (1 + eccentricity));
        return { semiMajor: (nearest + farthest) / 2, eccentricity: (farthest - nearest) / Math.max(farthest + nearest, 0.0001) };
    }

    copy() {
        return new OrbitSceneMapping(this.clearance, this.scale);
    }
}

/** Orientation and starting position aren't generated, so they come from a hash of the designation */
export function orientation(designation) {
    const hash = stableHash(designation);
    const angle = (salt) => Number((BigInt.asUintN(64, hash * salt) >> 40n) % 3600n) / 10;
    return { node: angle(0x9E3779B97F4A7C15n), periapsis: angle(0xBF58476D1CE4E5B9n), anomaly: angle(0x94D049BB133111EBn) };
}

function simulatedPeriod(years) {
    return Math.max(years, 0) * secondsPerYear;
}

const isTrojan = (world) => world.anomaly === 'trojanLeading' || world.anomaly === 'trojanTrailing';

/** Scene orbit for a world; trojans share their host's orbit, 60° ahead or behind it */
export function orbitalElementsFor(world, worlds, mapping) {
    let source = world;
    let phaseShift = 0.0;
    if (isTrojan(world)) {
        const host = worlds.find((w) => w.parentLabel === world.parentLabel && w.au === world.au && !isTrojan(w));
        if (host) {
            source = host;
            phaseShift = world.anomaly === 'trojanLeading' ? 60 : -60;
        }
    }
    const angles = orientation(source.designation);
    const ellipse = mapping.ellipse(source.au, source.eccentricity);
    return {
        eccentricity: ellipse.eccentricity, semiMajAxis: ellipse.semiMajor, inclination: source.inclination,
        lngAscNode: angles.node, argOfPeriapsis: angles.periapsis, trueAnomaly: (angles.anomaly + phaseShift + 360) % 360,
        period: simulatedPeriod(source.period),
    };
}

/** Scene orbit of a secondary star (or star pair) around the primary */
export function starOrbit(star, mapping) {
    const angles = orientation(star.designation);
    const ellipse = mapping.ellipse(star.au, star.eccentricity);
    return {
        eccentricity: ellipse.eccentricity, semiMajAxis: ellipse.semiMajor, inclination: 0, lngAscNode: 0,
        argOfPeriapsis: angles.periapsis, trueAnomaly: angles.anomaly, period: simulatedPeriod(star.period),
    };
}

/** Mirrored scene orbits of a star and its companion around their common centre of mass */
export function pairOrbits(head, companion, mapping) {
    const separation = starOrbit(companion, mapping);
    const totalMass = Math.max(head.mass + companion.mass, 0.001);
    const companionOrbit = { ...separation, semiMajAxis: separation.semiMajAxis * head.mass / totalMass };
    const headOrbit = { ...separation, semiMajAxis: separation.semiMajAxis * companion.mass / totalMass,
        argOfPeriapsis: (separation.argOfPeriapsis + 180) % 360 };
    return { head: headOrbit, companion: companionOrbit };
}

/** Farthest any of these worlds gets from their centre, in scene units */
export function outerRadius(worlds, mapping) {
    if (worlds.length === 0) return mapping.clearance;
    return Math.max(...worlds.map((w) => mapping.distance(w.au * (1 + w.eccentricity))));
}

// MARK: rings

/** A thin tube following the orbit; its thickness follows the zoom through the material's uScale */
export function ringEntity(elements, color, thickness = ringThickness, segments = 192, sides = 6) {
    const points = [];
    for (let i = 0; i < segments; i++) points.push(offsetAtMeanAnomaly(elements, 2 * Math.PI * i / segments));
    const v = (p) => new THREE.Vector3(p[0], p[1], p[2]);
    let planeNormal = new THREE.Vector3().crossVectors(v(points[0]), v(points[segments / 4]));
    planeNormal = planeNormal.length() > 0 ? planeNormal.normalize() : new THREE.Vector3(0, 1, 0);

    const anchors = new Float32Array(segments * sides * 3);
    const offsets = new Float32Array(segments * sides * 3);
    const tangent = new THREE.Vector3(), side = new THREE.Vector3(), direction = new THREE.Vector3();
    for (let index = 0; index < segments; index++) {
        tangent.subVectors(v(points[(index + 1) % segments]), v(points[(index + segments - 1) % segments])).normalize();
        side.crossVectors(tangent, planeNormal).normalize();
        for (let step = 0; step < sides; step++) {
            const angle = 2 * Math.PI * step / sides;
            direction.copy(planeNormal).multiplyScalar(Math.cos(angle)).addScaledVector(side, Math.sin(angle));
            const k = (index * sides + step) * 3;
            anchors.set(points[index], k);
            offsets[k] = direction.x * thickness; offsets[k + 1] = direction.y * thickness; offsets[k + 2] = direction.z * thickness;
        }
    }
    const indices = [];
    for (let index = 0; index < segments; index++) {
        const next = (index + 1) % segments;
        for (let step = 0; step < sides; step++) {
            const nextStep = (step + 1) % sides;
            const a = index * sides + step, b = next * sides + step, c = next * sides + nextStep, d = index * sides + nextStep;
            indices.push(a, b, d, b, c, d);
        }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(anchors, 3));
    geometry.setAttribute('offset', new THREE.BufferAttribute(offsets, 3));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();
    geometry.boundingSphere.radius += thickness;
    const mesh = new THREE.Mesh(geometry, zoomScaledMaterial(color));
    mesh.userData.zoomScaled = true;
    return mesh;
}

/** A ring tracing a star's orbit, tinted with a dimmed version of the star's colour */
export function stellarOrbitRing(elements, color) {
    const tint = color.clone().lerp(new THREE.Color(0, 0, 0), 0.5);
    const ring = ringEntity(elements, tint);
    ring.name = 'stellar_orbit';
    return ring;
}

/** Size of ring tubes and belt rocks at a zoom, relative to full size */
export function zoomScale(zoom) {
    return Math.min(1, shrinkStartZoom / Math.max(zoom, 0.0001));
}

/** Resizes the orbit rings and belt rocks among `roots` for the given zoom; hidden objects are caught up when shown */
export function updateZoomScale(roots, zoom) {
    const target = zoomScale(zoom);
    const visit = (object) => {
        if (!object.visible) return;
        if (object.userData.zoomScaled) object.material.uniforms.uScale.value = target;
        if (object.userData.baseScale !== undefined) object.scale.setScalar(object.userData.baseScale * target);
        object.children.forEach(visit);
    };
    roots.forEach(visit);
}

// MARK: habitable zone

/** A flat, translucent green band covering the habitable zone of stars with the given total luminosity */
export function habitableZoneEntity(luminosity, mapping) {
    const sqrtL = Math.sqrt(Math.max(luminosity, 0));
    const inner = mapping.distance(habitableZone[0] * sqrtL);
    const outer = mapping.distance(habitableZone[1] * sqrtL);
    if (!(outer > inner)) return null;
    const geometry = new THREE.RingGeometry(inner, outer, 160, 1);
    geometry.rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.2, 0.9, 0.35), transparent: true, opacity: 0.18,
        side: THREE.DoubleSide, depthWrite: false });
    const band = new THREE.Mesh(geometry, material);
    band.name = 'habitable_zone';
    return band;
}

// MARK: bodies

const sphereGeometries = new Map();

/** A shared unit sphere, scaled per body */
export function unitSphere(segments = 48) {
    if (!sphereGeometries.has(segments)) sphereGeometries.set(segments, new THREE.SphereGeometry(1, segments, segments / 2));
    return sphereGeometries.get(segments);
}

function sphereMesh(radius, material, segments = 48) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, segments / 2), material);
    mesh.userData.radius = radius;
    return mesh;
}

export function colorFor(gasGiant, environment) {
    if (gasGiant) {
        switch (gasGiant.giantClass) {
            case 'subNeptune': case 'iceGiant': return new THREE.Color(0.55, 0.75, 0.9);
            case 'saturnian': return new THREE.Color(0.85, 0.7, 0.5);
            default: return new THREE.Color(0.8, 0.55, 0.4);
        }
    }
    if (!environment) return new THREE.Color(0.55, 0.55, 0.55);
    switch (environmentTemperature(environment)) {
        case 'frozen': return new THREE.Color(0.9, 0.93, 1);
        case 'cold': return new THREE.Color(0.7, 0.8, 0.9);
        case 'temperate':
            if (environment.atmosphere === 'nitrogenOxygen' && environment.waterPercent >= 30) {
                return new THREE.Color(0.3, 0.65, 0.5);
            }
            return environment.waterPercent >= 30 ? new THREE.Color(0.3, 0.5, 0.9) : new THREE.Color(0.65, 0.6, 0.45);
        case 'hot': return new THREE.Color(0.85, 0.6, 0.35);
        default: return new THREE.Color(0.95, 0.45, 0.25);
    }
}

/** Not to scale: sizes only distinguish small worlds from large ones and gas giants */
export function bodyEntity(world, maxRadius = Infinity, shrink = 1) {
    const radius = Math.min(naturalRadius(world.radiusKm, world.gasGiant) * shrink, maxRadius);
    const body = sphereMesh(radius, new THREE.MeshBasicMaterial({ color: colorFor(world.gasGiant, world.environment) }));
    body.name = world.designation;
    body.userData.world = world;
    return body;
}

/**
 * A planet's or moon's drawn radius before anything is squeezed to fit, the same scale for every kind of world, so a
 * moon is drawn as big as a planet of its size would be and a large rocky world is never drawn bigger than a gas
 * giant. Not to scale: it grows with the square root of the radius, so small worlds still show next to giants.
 */
export function naturalRadius(radiusKm, gasGiant, isMoon = false) {
    const km = gasGiant ? gasGiant.radiusEarths * PlanetPhysics.earthRadiusKm : Math.max(radiusKm, 0);
    if (isMoon && km < 800) return km < 400 ? 0.004 : 0.007;
    return Math.fround(0.012 + 0.032 * Math.sqrt(km / PlanetPhysics.earthRadiusKm));
}

/** The pole of an orbit, the way round it goes counterclockwise; zero if it has no size */
export function orbitPole(elements) {
    const a = new THREE.Vector3(...offsetAtMeanAnomaly(elements, 0));
    const b = new THREE.Vector3(...offsetAtMeanAnomaly(elements, Math.PI / 2));
    return a.cross(b);
}

/** Gives an object a spin and turns it to where the spin has it now */
function setSpin(object, spin) {
    object.userData.spin = spin;
    spin.currentOrientation(object.quaternion);
}

/**
 * A planet's significant moons as small spheres circling just outside it, in proportion: each moon on the planets'
 * scale (shrunk as much as its planet was), spaced by their own sizes, then the set shrunk evenly to fit `room`.
 * `frame` holds them, centred on the planet and in its equatorial plane but not turning with it. A moon locked to its
 * planet turns once per orbit; others turn on their own tilted poles.
 */
function addMoons(moons, world, frame, body, room) {
    const planetRadius = body.userData.radius;
    if (moons.length === 0 || !(planetRadius > 0)) return;
    const squeeze = planetRadius / naturalRadius(world.radiusKm, world.gasGiant);
    let radii = moons.map((moon) => naturalRadius(moon.radiusKm, moon.gasGiant, true) * squeeze);
    const gap = planetRadius * 0.5;
    const offsets = [];
    let reach = 0;
    for (const radius of radii) {
        offsets.push(reach + gap + radius);
        reach += gap + radius * 2;
    }
    const space = Math.max(Math.min(planetRadius * 4, room) - planetRadius, planetRadius * 0.8);
    const fit = Math.min(1, space / reach);
    radii = radii.map((r) => r * fit);
    const distances = offsets.map((o) => planetRadius + o * fit);
    const inner = distances[0];

    moons.forEach((moon, index) => {
        const distance = distances[index];
        const radius = radii[index];
        // The ring stays thinner than its moon, but never so thin that a small moon squeezed in among many loses it
        const tube = Math.min(moonRingThickness, Math.max(radius * 0.25, Math.min(moonRingThickness * 0.5, radius * 0.45)));
        const angles = orientation(moon.designation);
        const years = 2 / 365.25 * Math.pow(distance / inner, 1.5);
        const elements = { eccentricity: 0, semiMajAxis: distance, inclination: angles.node / 36 - 5,
            lngAscNode: angles.node, argOfPeriapsis: 0, trueAnomaly: angles.anomaly, period: simulatedPeriod(years) };
        const entity = sphereMesh(radius, new THREE.MeshBasicMaterial({ color: colorFor(moon.gasGiant, moon.environment) }), 32);
        entity.name = moon.designation;
        entity.userData.moon = moon;
        const ring = ringEntity(elements, moonRingColor, tube);
        ring.name = `${moon.designation}_orbit`;
        frame.add(ring);
        const orbit = new Orbit(elements);
        orbit.currentPosition(entity.position);
        entity.userData.orbit = orbit;
        const pole = orbitPole(elements);
        let spin = null;
        if (moon.rotation && moon.rotation.tidalLock !== 'planet') {
            spin = Spin.world(moon.rotation, pole);
        } else if (pole.length() > 0) {
            const rotation = moon.rotation ?? { axialTilt: 0, tiltDirection: 0 };
            spin = new Spin({ x: 0, y: 1, z: 0 }, orbit.period, Spin.tilted(rotation, pole.clone().normalize()));
        }
        if (spin) setSpin(entity, spin);
        frame.add(entity);
    });
}

/** Adds an orbit ring and body for each world under `parent`; returns the planet bodies by designation */
export function addWorlds(worlds, parent, mapping) {
    const bodies = new Map();
    // Each belt's band as drawn: up to `beltSpread` either side of its middle, but only halfway to its neighbours'
    // orbits, so its rocks and minor planets never stray into them
    const orbitBand = (world) => [mapping.distance(world.au * (1 - world.eccentricity)), mapping.distance(world.au * (1 + world.eccentricity))];
    const beltBands = new Map();
    for (const belt of worlds.filter((w) => w.type === 'asteroidBelt')) {
        const middle = mapping.distance(belt.au);
        let low = middle / beltSpread, high = middle * beltSpread;
        for (const other of worlds) {
            if (other === belt || other.minorPlanet || isTrojan(other)) continue;
            // Another belt shares the space between them equally
            const [near, far] = other.type === 'asteroidBelt' ? [mapping.distance(other.au), mapping.distance(other.au)] : orbitBand(other);
            if (far <= middle) low = Math.max(low, (far + middle) / 2);
            else if (near >= middle) high = Math.min(high, (near + middle) / 2);
        }
        beltBands.set(belt.designation, { middle, low: Math.min(low, middle), high: Math.max(high, middle) });
    }
    const bands = worlds.map((world) => {
        const belt = beltBands.get(world.designation);
        if (belt) return [belt.low, belt.high];
        const [nearest, farthest] = orbitBand(world);
        return [nearest, Math.max(farthest, nearest)];
    });

    // The room each body has: inside the gap between its orbit and its neighbours' (and the star), so planets never
    // look closer together than their orbits are
    const gaps = worlds.map((world, index) => {
        const band = bands[index];
        const innerEdges = [], outerEdges = [];
        worlds.forEach((other, j) => {
            if (isTrojan(other) || other.minorPlanet || j === index) return;
            if (bands[j][1] <= band[0]) innerEdges.push(bands[j][1]);
            if (bands[j][0] >= band[1]) outerEdges.push(bands[j][0]);
        });
        const inside = innerEdges.length ? Math.max(...innerEdges) : mapping.clearance;
        const outside = outerEdges.length ? Math.min(...outerEdges) : Infinity;
        return Math.min(band[0] - inside, outside - band[1]);
    });
    // At least a little size to see, unless its neighbours are so close that it would touch them
    const caps = gaps.map((gap) => {
        const cap = Math.max(gap * 0.4, Math.min(0.004, gap * 0.48));
        return cap > 0 ? cap : 0.0005;
    });
    // Every body is shrunk by the same factor, the most any one needs to fit, so their sizes stay in proportion; only
    // a body far more crowded than the rest is squeezed further on its own
    let shrink = 1;
    worlds.forEach((world, index) => {
        if (world.type === 'asteroidBelt' || world.minorPlanet) return;
        shrink = Math.min(shrink, caps[index] / naturalRadius(world.radiusKm, world.gasGiant));
    });
    shrink = Math.max(shrink, 0.35);

    worlds.forEach((world, index) => {
        const elements = world.minorPlanet ? minorPlanetElements(world, worlds, mapping, beltBands.get(world.belt))
            : orbitalElementsFor(world, worlds, mapping);
        if (world.type === 'asteroidBelt') {
            const belt = beltRocks(elements, stableHash(world.designation), beltBands.get(world.designation));
            if (belt) {
                belt.name = `${world.designation}_belt`;
                parent.add(belt);
            }
            return;
        }
        const ring = ringEntity(elements, world.minorPlanet ? minorRingColor : ringColor);
        ring.name = `${world.designation}_orbit`;
        parent.add(ring);

        const body = world.minorPlanet ? bodyEntity(world, Math.min(minorPlanetRadius(world.radiusKm), elements.laneRoom))
            : bodyEntity(world, caps[index], shrink);
        if (world.minorPlanet) {
            // Its night side, lights and markers are its children, so they take its shape too
            const shape = minorPlanetShape(world);
            body.scale.set(...shape.axes);
            body.userData.shape = shape;
        }
        // The planet turns on its tilted pole, carrying its surface, clouds and cities round. Its moons go in a frame
        // that turns back just as fast about that pole, so they circle in the planet's equatorial plane.
        const moonFrame = new THREE.Group();
        moonFrame.name = `${world.designation}_moons`;
        const orbit = new Orbit(elements);
        orbit.currentPosition(body.position);
        const spin = world.rotation ? Spin.world(world.rotation, orbitPole(elements)) : null;
        if (spin) {
            // A world locked to its star keeps the side its surface was drawn with the star overhead turned to the
            // star, so its open day side and its ice-bound night side are where they belong
            if (world.rotation.tidalLock === 'star') {
                const point = { x: substellarPoint[0], y: substellarPoint[1], z: substellarPoint[2] };
                spin.face(point, { x: -body.position.x, y: -body.position.y, z: -body.position.z });
            }
            setSpin(body, spin);
            // Turned back by the same phase, so the moons' frame sits just as it would without the lock
            const counterSpin = new Spin({ x: 0, y: -1, z: 0 }, spin.period);
            counterSpin.phase = spin.phase;
            setSpin(moonFrame, counterSpin);
        }
        body.add(moonFrame);
        addMoons(world.moons, world, moonFrame, body, gaps[index] * 0.55);
        body.userData.orbit = orbit;
        parent.add(body);
        bodies.set(world.designation, body);
    });
    return bodies;
}

// MARK: belts

let rockSphereCache = null;

/** A once-subdivided icosahedron (42 unit vertices, 80 faces), wound outward */
function rockSphere() {
    if (rockSphereCache) return rockSphereCache;
    const t = (1 + Math.sqrt(5)) / 2;
    const vertices = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
        [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map((p) => new THREE.Vector3(...p).normalize());
    const icosahedron = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2],
        [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10],
        [8, 6, 7], [9, 8, 1]];
    const midpoints = new Map();
    const midpoint = (a, b) => {
        const key = `${Math.min(a, b)}:${Math.max(a, b)}`;
        if (midpoints.has(key)) return midpoints.get(key);
        vertices.push(vertices[a].clone().add(vertices[b]).normalize());
        midpoints.set(key, vertices.length - 1);
        return vertices.length - 1;
    };
    const faces = [];
    for (const [a, b, c] of icosahedron) {
        const ab = midpoint(a, b), bc = midpoint(b, c), ca = midpoint(c, a);
        faces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    rockSphereCache = { vertices, faces };
    return rockSphereCache;
}

/** Deforms the unit sphere into a random asteroid of about unit radius */
function rockShape(sphere, generator) {
    const axes = new THREE.Vector3(1, generator.float(0.55, 0.9), generator.float(0.4, 0.75));
    const randomDirection = () => new THREE.Vector3(generator.float(-1, 1), generator.float(-1, 1), generator.float(-1, 1))
        .addScalar(0.0001).normalize();
    const lumps = [];
    for (let i = 0; i < 4; i++) {
        const direction = randomDirection();
        lumps.push({ direction, height: generator.float(-0.18, 0.18) });
    }
    const craterCount = generator.int(1, 3);
    const craters = [];
    for (let i = 0; i < craterCount; i++) {
        const direction = randomDirection();
        const width = generator.float(0.25, 0.5);
        craters.push({ direction, width, depth: generator.float(0.08, 0.2) });
    }
    const angle = generator.floatBelow(0, 2 * Math.PI);
    const rotation = new THREE.Quaternion().setFromAxisAngle(randomDirection(), angle);

    return sphere.map((point) => {
        let radius = 1;
        for (const lump of lumps) {
            const closeness = Math.max(0, point.dot(lump.direction));
            radius += lump.height * closeness * closeness;
        }
        for (const crater of craters) {
            const distance = Math.acos(Math.min(Math.max(point.dot(crater.direction), -1), 1)) / crater.width;
            if (distance < 1) radius -= crater.depth * (1 - distance * distance);
            else if (distance < 1.4) radius += crater.depth * 0.25 * Math.sin((distance - 1) / 0.4 * Math.PI);
        }
        return point.clone().multiply(axes).multiplyScalar(Math.max(radius, 0.4)).applyQuaternion(rotation);
    });
}

/** A flat-shaded geometry of one rock shape */
function rockGeometry(shape, faces) {
    const positions = new Float32Array(faces.length * 9);
    faces.forEach(([a, b, c], i) => {
        positions.set([shape[a].x, shape[a].y, shape[a].z, shape[b].x, shape[b].y, shape[b].z, shape[c].x, shape[c].y, shape[c].z], i * 9);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return geometry;
}

/**
 * A belt of rocks that each orbit on their own, inner ones faster, as children of the returned group. Most rocks are
 * small and a few are large, as in a real belt; each has an orbit of its own, a little eccentric and tilted, crossing
 * the others', and more of them lie near the belt's middle than at its edges.
 */
export function beltRocks(elements, seed, band = null, rockCount = 180) {
    const generator = new SplitMix64(seed);
    const semiMajor = Math.fround(elements.semiMajAxis);
    if (!(semiMajor > 0)) return null;
    const { vertices, faces } = rockSphere();

    const shapes = [];
    for (let i = 0; i < 24; i++) {
        const shape = rockShape(vertices, generator);
        shapes.push({ geometry: rockGeometry(shape, faces), reach: Math.max(...shape.map((p) => p.length())) });
    }
    // Sizes from a steep power law: a sixfold range, most near the bottom of it
    const [smallest, largest] = [0.003, 0.016];
    const sizeOf = () => smallest * Math.pow(largest / smallest, Math.pow(generator.float(0, 1), 2.6));
    // Across the belt, crowded towards its middle: the sum of three draws is roughly normal
    const across = () => (generator.float(-1, 1) + generator.float(-1, 1) + generator.float(-1, 1)) / 3;

    const beltPeriod = elements.period ?? secondsPerYear;
    const material = new THREE.MeshStandardMaterial({ color: beltColor, roughness: 0.9, metalness: 0, flatShading: true });
    const belt = new THREE.Group();
    for (let n = 0; n < rockCount; n++) {
        const shape = generator.intBelow(0, shapes.length);
        const size = sizeOf();
        // Never out of the belt's band (see addWorlds), where its neighbours' orbits begin
        const low = (band?.low ?? semiMajor / beltSpread) * 1.01, high = (band?.high ?? semiMajor * beltSpread) * 0.99;
        const semiMajAxis = Math.min(Math.max(semiMajor * (1 + 0.06 * across()), low * 1.005), high * 0.995);
        const room = Math.max(Math.min(high / semiMajAxis - 1, 1 - low / semiMajAxis), 0);
        const orbitElements = {
            ...elements, semiMajAxis,
            eccentricity: Math.min(0.1, room) * Math.pow(generator.float(0, 1), 1.6),
            inclination: (elements.inclination ?? 0) + 10 * Math.pow(generator.float(0, 1), 2) * (generator.float(0, 1) < 0.5 ? -1 : 1),
            lngAscNode: generator.floatBelow(0, 360), argOfPeriapsis: generator.floatBelow(0, 360),
            trueAnomaly: generator.floatBelow(0, 360), period: beltPeriod * Math.pow(semiMajAxis / semiMajor, 1.5),
        };
        const entity = new THREE.Mesh(shapes[shape].geometry, material);
        const orbit = new Orbit(orbitElements);
        orbit.currentPosition(entity.position);
        const angle = generator.floatBelow(0, 2 * Math.PI);
        const axis = new THREE.Vector3(generator.float(-1, 1), generator.float(-1, 1), generator.float(-1, 1)).addScalar(0.0001).normalize();
        entity.quaternion.setFromAxisAngle(axis, angle);
        entity.scale.setScalar(size);
        entity.userData.orbit = orbit;
        entity.userData.baseScale = size;
        belt.add(entity);
    }
    return belt;
}
