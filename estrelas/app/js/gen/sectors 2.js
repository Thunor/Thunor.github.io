//
//  sectors.js
//  Estrelas (web)
//
//  A generated universe goes on without end, as a grid of sectors: cubes the size of the star field a new universe
//  starts with. The sector around the origin is the universe's own starfield.json; every other one is generated
//  from the universe's seed and its place in the grid the first time the view comes near it, and saved. A port of
//  StarFieldSectors.swift.
//

import { halfLength } from './systemStars.js';

const MASK64 = (1n << 64n) - 1n;
const INT32_MAX = 2147483647;

/** Edge length of every sector, in scene units */
export const sectorSide = halfLength * 2;

export const originSector = Object.freeze({ x: 0, y: 0, z: 0 });

export function isOrigin(sector) {
    return sector.x === 0 && sector.y === 0 && sector.z === 0;
}

export function sameSector(a, b) {
    return a.x === b.x && a.y === b.y && a.z === b.z;
}

/** The sector a point lies in */
export function sectorContaining(point) {
    const limit = Math.fround(Math.trunc(INT32_MAX / 2));
    const cell = point.map((value) => {
        const c = Math.floor(Math.fround(Math.fround(value + halfLength) / sectorSide));
        return Math.trunc(Math.min(Math.max(c, -limit), limit));
    });
    return { x: cell[0], y: cell[1], z: cell[2] };
}

/** The sector's centre, in scene units */
export function sectorCentre(sector) {
    return [sector.x * sectorSide, sector.y * sectorSide, sector.z * sectorSide];
}

/** How far a point is from the nearest part of the sector; 0 inside it */
export function distanceToSector(sector, point) {
    const centre = sectorCentre(sector);
    let sum = 0;
    for (let axis = 0; axis < 3; axis++) {
        const outside = Math.max(Math.abs(point[axis] - centre[axis]) - halfLength, 0);
        sum += outside * outside;
    }
    return Math.sqrt(sum);
}

/** Every sector some part of which lies within `radius` of `point` */
export function sectorsWithin(radius, point) {
    const here = sectorContaining(point);
    const reach = Math.ceil(radius / sectorSide);
    const sectors = [];
    for (let dz = -reach; dz <= reach; dz++) {
        for (let dy = -reach; dy <= reach; dy++) {
            for (let dx = -reach; dx <= reach; dx++) {
                const sector = { x: here.x + dx, y: here.y + dy, z: here.z + dz };
                if (distanceToSector(sector, point) <= radius) sectors.push(sector);
            }
        }
    }
    return sectors;
}

/** SplitMix64's finaliser */
function mix(value) {
    let z = (value + 0x9E3779B97F4A7C15n) & MASK64;
    z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & MASK64;
    z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & MASK64;
    return z ^ (z >> 31n);
}

/**
 * The seed a sector's systems are generated from. The origin keeps the universe's own seed; every other sector
 * mixes in its place.
 */
export function sectorSeed(sector, universeSeed) {
    if (isOrigin(sector)) return universeSeed;
    let hash = BigInt(universeSeed >>> 0) ^ 0x5EC70125EED50000n;
    for (const value of [sector.x, sector.y, sector.z]) {
        hash = mix(hash ^ BigInt(value >>> 0));
    }
    return Number((hash ^ (hash >> 32n)) & 0xFFFFFFFFn);
}

/** Name of the sector's file in the universe's sectors folder, e.g. "sector_1_0_-2.json" */
export function sectorFileName(sector) {
    return `sector_${sector.x}_${sector.y}_${sector.z}.json`;
}

export function sectorKey(sector) {
    return `${sector.x},${sector.y},${sector.z}`;
}
