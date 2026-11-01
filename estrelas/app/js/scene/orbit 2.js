//
//  orbit.js
//  Estrelas (web)
//
//  Keplerian orbits and the simulation clock they follow (OrbitalElements.swift, OrbitSystem.swift,
//  SimulationClock.swift).
//

const degToRad = Math.PI / 180;

/** Mean anomaly (radians) at the epoch, derived from the true anomaly */
export function meanAnomalyAtEpoch(elements) {
    const e = elements.eccentricity;
    const nu = elements.trueAnomaly * degToRad;
    const eccAnomaly = 2 * Math.atan2(Math.sqrt(1 - e) * Math.sin(nu / 2), Math.sqrt(1 + e) * Math.cos(nu / 2));
    return eccAnomaly - e * Math.sin(eccAnomaly);
}

/**
 * Offset from the centre of mass at the given mean anomaly (radians), in the y-up scene frame: orbital (x, y, z)
 * maps to scene (x, z, -y). Written into `target` (an array or Vector3-like with x, y, z) if given.
 */
export function offsetAtMeanAnomaly(elements, meanAnomaly, target = [0, 0, 0]) {
    const e = elements.eccentricity;
    const m = meanAnomaly % (2 * Math.PI);
    let eccAnomaly = e < 0.8 ? m : Math.PI;
    for (let i = 0; i < 6; i++) eccAnomaly -= (eccAnomaly - e * Math.sin(eccAnomaly) - m) / (1 - e * Math.cos(eccAnomaly));
    const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(eccAnomaly / 2), Math.sqrt(1 - e) * Math.cos(eccAnomaly / 2));
    const r = elements.semiMajAxis * (1 - e * Math.cos(eccAnomaly));
    const i = elements.inclination * degToRad;
    const node = elements.lngAscNode * degToRad;
    const u = elements.argOfPeriapsis * degToRad + nu;
    const x = r * (Math.cos(node) * Math.cos(u) - Math.sin(node) * Math.sin(u) * Math.cos(i));
    const y = r * (Math.sin(node) * Math.cos(u) + Math.cos(node) * Math.sin(u) * Math.cos(i));
    const z = r * Math.sin(u) * Math.sin(i);
    if (Array.isArray(target)) {
        target[0] = x; target[1] = z; target[2] = -y;
    } else {
        target.x = x; target.y = z; target.z = -y;
    }
    return target;
}

export const secondsPerDay = 86400.0;
export const secondsPerYear = 365.25 * secondsPerDay;

/** The simulated date and how fast it runs; orbits are worked out from it */
export const SimulationClock = {
    epoch: Date.now(),
    /** Simulated milliseconds since 1970, advanced each frame */
    date: Date.now(),
    /** Simulated seconds per real second; negative runs time backwards */
    rate: 1.0,
    /** Settings key and default for how many years ahead of the simulated date the calendar shown runs */
    yearOffsetKey: 'simulationYearOffset',
    defaultYearOffset: 5238,
    rates: (() => {
        const forward = [1, 60, 3600, secondsPerDay, 7 * secondsPerDay, 30 * secondsPerDay, secondsPerYear];
        return forward.slice().reverse().map((r) => -r).concat([0], forward);
    })(),
    get realTimeIndex() {
        return this.rates.indexOf(1);
    },
    /** Simulated seconds since the epoch */
    get elapsed() {
        return (this.date - this.epoch) / 1000;
    },
    advance(realSeconds) {
        if (this.rate === 0) return;
        this.date += realSeconds * this.rate * 1000;
    },
    /** The simulated date as the calendar shown has it, `yearOffset` years on */
    displayDate(yearOffset) {
        const date = new Date(this.date);
        date.setFullYear(date.getFullYear() + yearOffset);
        return date;
    },
    /** The year offset that makes the calendar shown read `year` now */
    yearOffset(showing) {
        return showing - new Date(this.date).getFullYear();
    },
};

/** Short description of a rate, e.g. "1 day/s" or "−1 hr/s" */
export function rateLabel(rate) {
    let magnitude;
    switch (Math.abs(rate)) {
        case 0: return 'Stopped';
        case 1: return rate > 0 ? 'Real time' : 'Reverse real time';
        case 60: magnitude = '1 min/s'; break;
        case 3600: magnitude = '1 hr/s'; break;
        case secondsPerDay: magnitude = '1 day/s'; break;
        case 7 * secondsPerDay: magnitude = '1 wk/s'; break;
        case 30 * secondsPerDay: magnitude = '30 days/s'; break;
        case secondsPerYear: magnitude = '1 yr/s'; break;
        default: magnitude = `${Math.trunc(Math.abs(rate))}×`;
    }
    return rate < 0 ? '−' + magnitude : magnitude;
}

/** Moves along a Keplerian orbit around a fixed centre, following the simulation clock */
export class Orbit {
    constructor(elements, center = [0, 0, 0], defaultPeriod = 30.0) {
        this.elements = elements;
        this.center = center;
        this.period = Math.max(elements.period ?? defaultPeriod, 0.001);
        this.meanAnomalyAtEpoch = meanAnomalyAtEpoch(elements);
    }

    /** Position at the simulation clock's current date, written into a Vector3 */
    currentPosition(target) {
        // Whole revolutions are dropped first, so precision holds however far the clock runs
        const revolutions = (SimulationClock.elapsed / this.period) % 1;
        offsetAtMeanAnomaly(this.elements, this.meanAnomalyAtEpoch + 2 * Math.PI * revolutions, target);
        target.x += this.center[0];
        target.y += this.center[1];
        target.z += this.center[2];
        return target;
    }

    /**
     * Position at the orbit's starting point, whatever the clock says: for bodies placed once and left still, like the
     * members of multiple star systems in the star field, which would otherwise land somewhere new each time drawn
     */
    epochPosition(target) {
        offsetAtMeanAnomaly(this.elements, this.meanAnomalyAtEpoch, target);
        target.x += this.center[0];
        target.y += this.center[1];
        target.z += this.center[2];
        return target;
    }
}

const yAxis = Object.freeze({ x: 0, y: 1, z: 0 });

/**
 * Turns an object about an axis once per `period` simulated seconds, following the simulation clock: a planet on its
 * tilted pole, or a moon locked to its planet (SpinComponent in OrbitSystem.swift). `base` is how the object sits
 * before it turns; the axis is in the object's own space once set at `base`. Quaternions are {x, y, z, w}.
 */
export class Spin {
    constructor(axis, period, base = { x: 0, y: 0, z: 0, w: 1 }) {
        this.axis = axis;
        this.period = period;
        this.base = base;
        /** How far it has already turned when the simulation clock starts, in radians */
        this.phase = 0;
    }

    /** How far it has turned about its axis at an elapsed simulated time, in radians */
    angle(elapsed) {
        return this.phase + 2 * Math.PI * ((elapsed / this.period) % 1);
    }

    /**
     * Sets the phase so that `point`, on the equator of the object's own surface, faces `direction` (in its parent's
     * space) now. A world locked to its star turns once an orbit, so set facing its star it goes on facing it.
     */
    face(point, direction) {
        const length = Math.hypot(direction.x, direction.y, direction.z);
        if (!(length > 0)) return;
        const inverse = { x: -this.base.x, y: -this.base.y, z: -this.base.z, w: this.base.w };
        const local = rotate(inverse, { x: direction.x / length, y: direction.y / length, z: direction.z / length });
        // A turn about +y by a carries (1, 0, 0) to (cos a, 0, −sin a)
        const wanted = Math.atan2(-local.z, local.x);
        const pointAngle = Math.atan2(-point.z, point.x);
        this.phase = wanted - pointAngle - this.angle(SimulationClock.elapsed) + this.phase;
    }

    /** Writes the orientation at the clock's current date into a THREE.Quaternion */
    currentOrientation(target) {
        const angle = this.angle(SimulationClock.elapsed);
        const half = angle / 2, s = Math.sin(half);
        const turn = { x: this.axis.x * s, y: this.axis.y * s, z: this.axis.z * s, w: Math.cos(half) };
        return multiplyQuaternions(this.base, turn, target);
    }

    /**
     * A world turning on its own pole once a sidereal day, the pole tipped from `orbitPole` by the axial tilt toward
     * the tilt direction; null for a world without a day length of its own
     */
    static world(rotation, orbitPole) {
        const hours = rotation?.dayHours;
        const length = Math.hypot(orbitPole.x, orbitPole.y, orbitPole.z);
        if (!(hours > 0) || !(length > 0)) return null;
        return new Spin(yAxis, hours * 3600, Spin.tilted(rotation, scaled(orbitPole, 1 / length)));
    }

    /** Stands a world's pole on its orbit's, then leans it by the axial tilt */
    static tilted(rotation, orbitPole) {
        const upright = fromUnitVectors(yAxis, orbitPole);
        const direction = (rotation.tiltDirection ?? 0) * Math.PI / 180;
        const lean = { x: Math.sin(direction), y: 0, z: -Math.cos(direction) };
        const half = (rotation.axialTilt ?? 0) * Math.PI / 360, s = Math.sin(half);
        return multiplyQuaternions(upright, { x: lean.x * s, y: lean.y * s, z: lean.z * s, w: Math.cos(half) });
    }
}

const scaled = (v, k) => ({ x: v.x * k, y: v.y * k, z: v.z * k });

/** A vector turned by a unit quaternion */
function rotate(q, v) {
    const p = multiplyQuaternions(multiplyQuaternions(q, { x: v.x, y: v.y, z: v.z, w: 0 }), { x: -q.x, y: -q.y, z: -q.z, w: q.w });
    return { x: p.x, y: p.y, z: p.z };
}

function multiplyQuaternions(a, b, target = { x: 0, y: 0, z: 0, w: 1 }) {
    const x = a.x * b.w + a.w * b.x + a.y * b.z - a.z * b.y;
    const y = a.y * b.w + a.w * b.y + a.z * b.x - a.x * b.z;
    const z = a.z * b.w + a.w * b.z + a.x * b.y - a.y * b.x;
    const w = a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z;
    if (typeof target.set === 'function') target.set(x, y, z, w);
    else Object.assign(target, { x, y, z, w });
    return target;
}

/** Shortest turn taking unit vector `from` to unit vector `to` */
function fromUnitVectors(from, to) {
    let r = from.x * to.x + from.y * to.y + from.z * to.z + 1;
    let q;
    if (r < 1e-7) {
        // Opposite: any perpendicular axis
        q = Math.abs(from.x) > Math.abs(from.z) ? { x: -from.y, y: from.x, z: 0, w: 0 } : { x: 0, y: -from.z, z: from.y, w: 0 };
    } else {
        q = { x: from.y * to.z - from.z * to.y, y: from.z * to.x - from.x * to.z, z: from.x * to.y - from.y * to.x, w: r };
    }
    const length = Math.hypot(q.x, q.y, q.z, q.w);
    return { x: q.x / length, y: q.y / length, z: q.z / length, w: q.w / length };
}
