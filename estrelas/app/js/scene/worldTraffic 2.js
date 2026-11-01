//
//  worldTraffic.js
//  Estrelas (web)
//
//  Ships, aircraft and spacecraft moving about a settled world in the planetary view, as its technology allows: ships
//  under sail or steam working back and forth across open sea, aircraft flying between its cities, and in the space
//  age satellites and stations circling overhead and shuttles launching from its cities and landing again. Worlds
//  starships call at have them jumping in and out too, each jump marked by a bright flash. They're sized to the world,
//  a fraction of a percent of its radius, so they only show once the view is zoomed in close. A port of
//  WorldTraffic.swift.
//

import * as THREE from '../../vendor/three.module.min.js';
import * as SurfaceMap from '../surface/surfaceMap.js';
import { eraRank, portRank } from '../gen/socialGenerator.js';

export const trafficName = 'traffic';

/** Seconds of traffic so far: it runs in real time while the simulation does, and stops when it's paused */
export const TrafficClock = { time: 0 };

const MASK64 = (1n << 64n) - 1n;

/** A small, seeded random number generator, kept with a vessel so its next route is always the same */
class TrafficRandom {
    constructor(state) {
        this.state = BigInt.asUintN(64, BigInt(state));
    }

    next() {
        this.state = (this.state + 0x9E3779B97F4A7C15n) & MASK64;
        let z = this.state;
        z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & MASK64;
        z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & MASK64;
        return z ^ (z >> 31n);
    }

    uniform(lower, upper) {
        return lower + Number(this.next() >> 11n) / 2 ** 53 * (upper - lower);
    }

    below(count) {
        return Number(this.next() % BigInt(count));
    }

    direction() {
        const z = this.uniform(-1, 1), angle = this.uniform(0, 2 * Math.PI);
        const ring = Math.sqrt(1 - z * z);
        return new THREE.Vector3(ring * Math.cos(angle), z, ring * Math.sin(angle));
    }

    heading(point) {
        const reference = Math.abs(point.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
        const east = new THREE.Vector3().crossVectors(reference, point).normalize();
        const north = new THREE.Vector3().crossVectors(point, east);
        const bearing = this.uniform(0, 2 * Math.PI);
        return east.multiplyScalar(Math.cos(bearing)).add(north.multiplyScalar(Math.sin(bearing)));
    }
}

// Heights above the ground, in world radii
const seaHeight = 0.0006;
const lowFlight = SurfaceMap.cloudAltitude * 0.86;
const cruise = SurfaceMap.cloudAltitude + 0.0025;
// Lengths, in world radii
const shipLength = 0.004;
const aircraftLength = 0.005;
const satelliteLength = 0.006;
const shuttleLength = 0.007;
const shuttleFlight = 16;
const jumpFlight = 22;
const flashDuration = 0.9;
const starshipLength = 0.012;
const flashSize = 0.35;

// MARK: meshes

function box(center, size) {
    const h = size.map((s) => s / 2);
    const corners = [];
    for (let index = 0; index < 8; index++) {
        corners.push([center[0] + (index & 1 ? h[0] : -h[0]), center[1] + (index & 2 ? h[1] : -h[1]),
            center[2] + (index & 4 ? h[2] : -h[2])]);
    }
    const quads = [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]];
    const indices = [];
    for (const q of quads) indices.push(q[0], q[1], q[2], q[0], q[2], q[3]);
    return { positions: corners, indices };
}

function wing(span, root, sweep, at) {
    const tip = root * 0.4;
    const points = [[0, 0, root / 2], [0, 0, -root / 2], [span / 2, 0, -sweep], [span / 2, 0, -sweep - tip],
        [-span / 2, 0, -sweep], [-span / 2, 0, -sweep - tip]].map((p) => [p[0] + at[0], p[1] + at[1], p[2] + at[2]]);
    return { positions: points, indices: [0, 2, 3, 0, 3, 1, 0, 5, 4, 0, 1, 5] };
}

function wake(length, width) {
    return { positions: [[0, 0.01, -0.45], [width / 2, 0.01, -0.45 - length], [-width / 2, 0.01, -0.45 - length],
        [0, 0.01, -0.45 - length * 0.7]], indices: [0, 1, 3, 0, 3, 2] };
}

/** One geometry for a model built from parts, a group per colour */
function model(parts, colors) {
    const positions = [], groups = [];
    const indices = [];
    for (const [part, material] of parts) {
        const base = positions.length / 3;
        for (const p of part.positions) positions.push(...p);
        groups.push({ start: indices.length, count: part.indices.length, material });
        for (const i of part.indices) indices.push(i + base);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    for (const g of groups) geometry.addGroup(g.start, g.count, g.material);
    const materials = colors.map((c) => new THREE.MeshBasicMaterial({ color: new THREE.Color(...c), side: THREE.DoubleSide,
        transparent: true }));
    return { geometry, materials };
}

let meshes = null;
function Meshes() {
    if (meshes) return meshes;
    const white = [1, 1, 1], wakeColor = [0.8, 0.9, 1];
    meshes = {
        sailingShip: model([[box([0, 0.05, 0], [0.24, 0.1, 1]), 0], [box([0, 0.35, 0.1], [0.03, 0.5, 0.3]), 1],
            [box([0, 0.3, -0.25], [0.03, 0.4, 0.25]), 1], [wake(1.2, 0.5), 2]], [[0.45, 0.3, 0.18], white, wakeColor]),
        motorShip: model([[box([0, 0.05, 0], [0.2, 0.1, 1]), 0], [box([0, 0.15, -0.3], [0.16, 0.12, 0.2]), 1],
            [box([0, 0.25, -0.35], [0.06, 0.1, 0.06]), 0], [wake(1.6, 0.6), 2]], [[0.55, 0.12, 0.1], white, wakeColor]),
        propellerAircraft: model([[box([0, 0, 0], [0.12, 0.12, 1]), 0], [box([0, 0.02, 0.15], [1.1, 0.03, 0.16]), 0],
            [box([0, 0.08, -0.42], [0.4, 0.03, 0.1]), 0]], [[0.9, 0.9, 0.9]]),
        jet: model([[box([0, 0, 0], [0.1, 0.1, 1]), 0], [wing(0.9, 0.3, 0.25, [0, 0, 0.05]), 0],
            [wing(0.32, 0.14, 0.1, [0, 0.04, -0.4]), 0], [box([0, -0.02, -2.0], [0.06, 0.02, 3]), 1]],
            [white, [0.85, 0.85, 0.85]]),
        satellite: model([[box([0, 0, 0], [0.25, 0.25, 0.4]), 0], [box([0.55, 0, 0], [0.8, 0.02, 0.3]), 1],
            [box([-0.55, 0, 0], [0.8, 0.02, 0.3]), 1]], [[0.85, 0.75, 0.4], [0.2, 0.35, 0.75]]),
        shuttle: model([[box([0, 0, 0], [0.18, 0.18, 1]), 0], [box([0, 0, 0.55], [0.1, 0.1, 0.12]), 0],
            [wing(0.55, 0.45, 0.3, [0, -0.05, -0.15]), 1]], [white, [0.25, 0.25, 0.25]]),
        starship: model([[box([0, 0, 0.1], [0.14, 0.12, 0.8]), 0], [box([0, 0, -0.35], [0.32, 0.18, 0.3]), 0],
            [box([0, 0.09, 0.3], [0.08, 0.06, 0.16]), 1], [box([0, 0, -0.52], [0.26, 0.12, 0.04]), 2]],
            [[0.75, 0.75, 0.75], [0.45, 0.45, 0.45], [0.55, 0.8, 1]]),
        flame: model([[box([0, 0, -0.85], [0.14, 0.14, 0.7]), 0]], [[1, 0.65, 0.2]]),
        flash: flashTexture(),
    };
    return meshes;
}

/** A jump's flash: white at its heart through blue to clear, with a streak across */
function flashTexture() {
    const size = 128;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = (x + 0.5) / size * 2 - 1, dy = (y + 0.5) / size * 2 - 1;
            const r = Math.hypot(dx, dy);
            const glow = Math.max(1 - r, 0);
            const core = Math.pow(glow, 6), halo = Math.pow(glow, 2);
            const streak = Math.max(1 - Math.abs(dx), 0) * Math.exp(-dy * dy * 900);
            const alpha = Math.min(core + 0.7 * halo + streak, 1);
            const white = Math.min(core * 2 + streak, 1);
            const o = (y * size + x) * 4;
            data[o] = 255 * (0.55 + 0.45 * white);
            data[o + 1] = 255 * (0.75 + 0.25 * white);
            data[o + 2] = 255;
            data[o + 3] = 255 * alpha;
        }
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
}

// MARK: motion

/** Turning a vessel built nose along +z and topside along +y to face along `forward`, topside to `up` */
function facing(forward, up, target) {
    const z = forward.clone().normalize();
    const y = up.clone().sub(z.clone().multiplyScalar(up.dot(z)));
    if (y.length() < 1e-5) y.copy(Math.abs(z.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0));
    y.normalize();
    const x = new THREE.Vector3().crossVectors(y, z);
    return target.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}

const slerpPoint = (a, heading, theta) => a.clone().multiplyScalar(Math.cos(theta)).add(heading.clone().multiplyScalar(Math.sin(theta)));

function legDuration(flight) {
    const angle = Math.acos(Math.min(Math.max(flight.from.dot(flight.to), -1), 1));
    return Math.max(angle / flight.speed, 1);
}

function nextSite(site, sites, random) {
    const others = sites.filter((s) => s.distanceTo(site) > 0.01);
    if (!others.length) return site;
    return others[random.below(others.length)];
}

/** Places a vessel for `time`, moving a flight or shuttle on to its next leg when the last one's done */
function pose(entity, time) {
    const traffic = entity.userData.traffic;
    const radius = traffic.radius;
    const m = traffic.motion;
    switch (m.kind) {
        case 'voyage': {
            const cycle = (time / m.period + m.phase) % 2;
            const outward = cycle < 1;
            const along = outward ? cycle : 2 - cycle;
            const theta = m.angle * along * along * (3 - 2 * along);
            const point = slerpPoint(m.start, m.heading, theta);
            const tangent = m.heading.clone().multiplyScalar(Math.cos(theta)).sub(m.start.clone().multiplyScalar(Math.sin(theta)))
                .multiplyScalar(outward ? 1 : -1);
            entity.position.copy(point).multiplyScalar(radius * (1 + seaHeight));
            facing(tangent, point, entity.quaternion);
            return;
        }
        case 'flight': {
            let duration = legDuration(m);
            while (time - m.departed >= duration) {
                m.departed += duration;
                m.from = m.to;
                m.to = nextSite(m.from, m.sites, m.random);
                duration = legDuration(m);
            }
            const progress = (time - m.departed) / duration;
            const total = Math.acos(Math.min(Math.max(m.from.dot(m.to), -1), 1));
            const heading = m.to.clone().sub(m.from.clone().multiplyScalar(m.from.dot(m.to)));
            if (heading.length() > 0) heading.normalize();
            const theta = total * progress;
            const point = slerpPoint(m.from, heading, theta);
            const tangent = heading.clone().multiplyScalar(Math.cos(theta)).sub(m.from.clone().multiplyScalar(Math.sin(theta)));
            const climb = Math.min(progress, 1 - progress) / 0.12;
            const height = lowFlight + (cruise - lowFlight) * Math.min(Math.max(climb, 0), 1);
            entity.position.copy(point).multiplyScalar(radius * (1 + height));
            facing(tangent, point, entity.quaternion);
            return;
        }
        case 'orbit': {
            const reference = Math.abs(m.normal.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
            const u = new THREE.Vector3().crossVectors(reference, m.normal).normalize();
            const v = new THREE.Vector3().crossVectors(m.normal, u);
            const angle = ((time / m.period + m.phase) % 1) * 2 * Math.PI;
            const point = u.clone().multiplyScalar(Math.cos(angle)).add(v.clone().multiplyScalar(Math.sin(angle)));
            const tangent = v.clone().multiplyScalar(Math.cos(angle)).sub(u.clone().multiplyScalar(Math.sin(angle)));
            entity.position.copy(point).multiplyScalar(radius * (1 + m.altitude));
            facing(tangent, point, entity.quaternion);
            return;
        }
        case 'shuttle': {
            while (time - m.started >= shuttleFlight + m.pause) {
                m.started += shuttleFlight + m.pause;
                m.isDeparting = !m.isDeparting;
                m.site = m.sites[m.random.below(m.sites.length)];
                m.heading = m.random.heading(m.site);
                m.pause = m.random.uniform(2, 12);
            }
            const elapsed = time - m.started;
            if (elapsed >= shuttleFlight) {
                entity.visible = false;
                return;
            }
            const flown = elapsed / shuttleFlight;
            const progress = m.isDeparting ? flown : 1 - flown;
            const place = (p) => {
                const theta = 0.3 * p * p;
                const height = lowFlight + 0.5 * Math.pow(p, 1.6);
                return slerpPoint(m.site, m.heading, theta).multiplyScalar(radius * (1 + height));
            };
            const position = place(progress);
            const ahead = place(Math.min(progress + 0.01, 1)).sub(place(Math.max(progress - 0.01, 0)));
            const opacity = Math.max(Math.min(Math.min((1 - progress) / 0.25, progress / 0.03), 1), 0);
            entity.visible = entity.userData.shown !== false;
            entity.position.copy(position);
            facing(ahead, position.clone().normalize(), entity.quaternion);
            setOpacity(entity, opacity);
            return;
        }
        case 'jump':
            updateJump(entity, time);
            return;
        default:
    }
}

function setOpacity(entity, opacity) {
    entity.traverse((o) => {
        if (!o.material) return;
        for (const material of Array.isArray(o.material) ? o.material : [o.material]) material.opacity = opacity;
    });
}

function plan(jump) {
    const direction = jump.random.direction();
    jump.jumpPoint = direction.clone().multiplyScalar(jump.random.uniform(7, 11));
    jump.approach = direction.clone().add(jump.random.direction().multiplyScalar(0.3)).normalize().multiplyScalar(1.15);
    jump.pause = jump.meanPause * jump.random.uniform(0.5, 1.5);
}

function updateJump(root, time) {
    const traffic = root.userData.traffic;
    const jump = traffic.motion;
    const ship = root.getObjectByName('starship'), flash = root.getObjectByName('jump_flash');
    while (time - jump.started >= jumpFlight + jump.pause) {
        jump.started += jumpFlight + jump.pause;
        jump.arriving = !jump.arriving;
        plan(jump);
    }
    const radius = traffic.radius;
    const elapsed = time - jump.started;
    if (elapsed < jumpFlight) {
        const progress = elapsed / jumpFlight;
        const [from, to] = jump.arriving ? [jump.jumpPoint, jump.approach] : [jump.approach, jump.jumpPoint];
        const eased = jump.arriving ? 1 - (1 - progress) * (1 - progress) : progress * progress;
        ship.visible = true;
        ship.position.copy(from).lerp(to, eased).multiplyScalar(radius);
        facing(to.clone().sub(from), new THREE.Vector3(0, 1, 0), ship.quaternion);
        const opacity = jump.arriving ? Math.min((1 - progress) / 0.2, 1) : Math.min(progress / 0.15, 1);
        setOpacity(ship, Math.max(opacity, 0));
    } else {
        ship.visible = false;
    }
    const sinceFlash = jump.arriving ? elapsed : elapsed - jumpFlight;
    if (sinceFlash >= 0 && sinceFlash < flashDuration) {
        const fraction = sinceFlash / flashDuration;
        flash.visible = true;
        flash.position.copy(jump.jumpPoint).multiplyScalar(radius);
        const size = flashSize * radius * (0.35 + 0.65 * Math.sqrt(fraction));
        flash.scale.set(size * 2, size * 2, 1);
        flash.material.opacity = Math.pow(1 - fraction, 1.5);
    } else {
        flash.visible = false;
    }
}

/** Moves every vessel along its way; call each frame with the seconds passed while the simulation runs */
export function updateTraffic(vessels, seconds) {
    TrafficClock.time += seconds;
    for (const vessel of vessels) {
        if (vessel.parent) pose(vessel, TrafficClock.time);
    }
}

function vessel(mesh, length, radius, motion) {
    const entity = new THREE.Mesh(mesh.geometry, mesh.materials.map((m) => m.clone()));
    entity.name = trafficName;
    entity.userData.sharedGeometry = true;
    entity.scale.setScalar(length * radius);
    entity.raycast = () => {};
    entity.userData.traffic = { motion, radius };
    pose(entity, TrafficClock.time);
    return entity;
}

// MARK: routes

function seaVoyage(isWater, random) {
    const wet = (p) => isWater(p.x, p.y, p.z);
    for (let attempt = 0; attempt < 60; attempt++) {
        const start = random.direction();
        if (!wet(start)) continue;
        const heading = random.heading(start);
        const wanted = random.uniform(0.05, 0.2);
        const step = 0.008;
        let angle = 0;
        while (angle + step <= wanted && wet(slerpPoint(start, heading, angle + step))) angle += step;
        if (angle >= 0.04) return { start, heading, angle };
    }
    return null;
}

function airports(setting, random) {
    if (setting.sites.length >= 2) return setting.sites;
    const sites = setting.sites.slice();
    let tries = 0;
    while (sites.length < 12 && tries < 400) {
        tries += 1;
        const point = random.direction();
        if (!(setting.isWater && setting.isWater(point.x, point.y, point.z))) sites.push(point);
    }
    return sites;
}

/**
 * The vessels for a settled world `radius` across in its body's space. `setting`: { era, population, port, sites
 * (THREE.Vector3 unit vectors), isWater(x, y, z) or null, seed (BigInt) }.
 */
export function vessels(setting, radius) {
    if (!(setting.population > 0)) return [];
    const M = Meshes();
    const random = new TrafficRandom(setting.seed);
    const rank = eraRank(setting.era);
    const size = Math.log10(Math.max(setting.population, 1));
    const result = [];

    if (rank >= eraRank('bronzeIron') && setting.isWater) {
        const count = Math.min(Math.trunc(size * (rank >= eraRank('earlyModern') ? 1.6 : 0.6)), 16);
        const mesh = rank >= eraRank('industrial') ? M.motorShip : M.sailingShip;
        for (let i = 0; i < count; i++) {
            const voyage = seaVoyage(setting.isWater, random);
            if (!voyage) continue;
            const speed = rank >= eraRank('industrial') ? 0.004 : 0.0025;
            result.push(vessel(mesh, shipLength, radius, { kind: 'voyage', start: voyage.start, heading: voyage.heading,
                angle: voyage.angle, period: voyage.angle / speed, phase: random.uniform(0, 2) }));
        }
    }

    if (rank >= eraRank('electrical')) {
        const factor = setting.era === 'electrical' ? 0.5 : setting.era === 'atomic' ? 1 : 1.6;
        const count = Math.min(Math.trunc(size * factor), 16);
        const sites = airports(setting, random);
        const mesh = rank >= eraRank('atomic') ? M.jet : M.propellerAircraft;
        if (sites.length >= 2) {
            for (let i = 0; i < count; i++) {
                const from = sites[random.below(sites.length)];
                const flight = { kind: 'flight', sites, speed: rank >= eraRank('atomic') ? 0.05 : 0.025, from, to: from,
                    departed: TrafficClock.time, random: new TrafficRandom(random.next()) };
                flight.to = nextSite(from, sites, flight.random);
                flight.departed -= random.uniform(0, 1) * legDuration(flight);
                result.push(vessel(mesh, aircraftLength, radius, flight));
            }
        }
    }

    if (rank >= eraRank('information')) {
        const count = setting.era === 'information' ? 3 : setting.era === 'interplanetary' ? 6 : 9;
        for (let i = 0; i < count; i++) {
            const normal = random.direction();
            const altitude = random.uniform(0.06, 0.35);
            const period = random.uniform(25, 70);
            const phase = random.uniform(0, 1);
            result.push(vessel(M.satellite, satelliteLength, radius, { kind: 'orbit', normal, altitude, period, phase }));
        }
    }

    if (rank >= eraRank('interplanetary') && portRank(setting.port) > 0) {
        const count = Math.min(portRank(setting.port) * (rank >= eraRank('interstellar') ? 3 : 2), 10);
        const sites = setting.sites.length ? setting.sites : airports(setting, random);
        for (let i = 0; i < count && sites.length; i++) {
            const site = sites[random.below(sites.length)];
            const shuttle = { kind: 'shuttle', sites, site, heading: random.heading(site), isDeparting: random.next() % 2n === 0n,
                started: TrafficClock.time, pause: random.uniform(2, 12), random: new TrafficRandom(random.next()) };
            shuttle.started -= random.uniform(0, 1) * (shuttleFlight + shuttle.pause);
            const entity = vessel(M.shuttle, shuttleLength, radius, shuttle);
            const exhaust = new THREE.Mesh(M.flame.geometry, M.flame.materials.map((m) => m.clone()));
            exhaust.name = 'exhaust';
            exhaust.raycast = () => {};
            entity.add(exhaust);
            result.push(entity);
        }
    }
    return result;
}

/** Starships for a world its port's weekly arrivals call at, for a frame centred on the world that doesn't turn with it */
export function starships(setting, radius) {
    if (!(setting.weeklyArrivals > 0)) return [];
    const M = Meshes();
    const random = new TrafficRandom(BigInt.asUintN(64, BigInt(setting.seed) + 0x57A5n));
    const rate = Math.sqrt(setting.weeklyArrivals);
    const count = Math.min(Math.max(Math.trunc(rate), 1), 6);
    const perMinute = Math.min(0.5 * rate, 6);
    const meanPause = Math.max(count * 60 / perMinute - jumpFlight, 3);
    const result = [];
    for (let i = 0; i < count; i++) {
        const jump = { kind: 'jump', arriving: random.next() % 2n === 0n, started: TrafficClock.time, meanPause, pause: 0,
            jumpPoint: new THREE.Vector3(), approach: new THREE.Vector3(), random: new TrafficRandom(random.next()) };
        plan(jump);
        jump.started -= random.uniform(0, 1) * (jumpFlight + jump.pause);
        const root = new THREE.Group();
        root.name = trafficName;
        const ship = new THREE.Mesh(M.starship.geometry, M.starship.materials.map((m) => m.clone()));
        ship.name = 'starship';
        ship.scale.setScalar(starshipLength * radius);
        ship.raycast = () => {};
        const burst = new THREE.Sprite(new THREE.SpriteMaterial({ map: M.flash, transparent: true, depthWrite: false }));
        burst.name = 'jump_flash';
        burst.raycast = () => {};
        root.add(ship, burst);
        root.userData.traffic = { motion: jump, radius };
        updateJump(root, TrafficClock.time);
        result.push(root);
    }
    return result;
}
