//
//  nightShade.js
//  Estrelas (web)
//
//  Darkens the side of each planet and moon facing away from its star. The planetary view draws its worlds unlit, so
//  each world wears a thin shell just outside its clouds that is clear over the day side and darkens past the
//  terminator; every frame each shell is turned so its dark side faces away from the nearest of the system's stars.
//  A second shell beneath it darkens where another planet or moon passes between the world and its star, so moons
//  cast their shadows on their planets in transit, and planets eclipse their moons. It also lightens a moon's night
//  side where it faces the lit side of its planet (planetshine). While it does either, it shades the whole world from
//  its own darkness worked out at each vertex, and the plain night side shell above it is left clear. Mapped cities
//  light up on the night side. A port of NightShade.swift.
//

import * as THREE from '../../vendor/three.module.min.js';
import * as SurfaceMap from '../surface/surfaceMap.js';
import { icosphere } from '../surface/voronoiSurface.js';
import { cityLightPixels, seedFor, size as patternSize, patchPoint, spreadOf } from './cityLightPattern.js';
import { eraRank } from '../gen/socialGenerator.js';

export const name = 'night_shade';
export const cityLightName = 'city_lights';
export const cityGroundName = 'city_ground';
/** The shell sits just outside the cloud layer, so the clouds are shaded too */
export const altitude = Math.fround(SurfaceMap.cloudAltitude + 0.004);
/** How dark the far side gets: not quite black, so the night side can still be made out */
const darkest = 0.9;

/**
 * Draw order: settlements' ground by day, the clouds, any weather map shown on the globe, then the shade over them,
 * then city lights over the shade
 */
export const renderOrder = { ground: 0, clouds: 1, weather: 1.5, shade: 2, lights: 3 };

let shellGeometry = null;

/** The night side shell's opacity at `u`, which runs from noon (0) to midnight (1); the terminator falls at 0.5 */
export function nightDarkness(u) {
    const t = Math.min(Math.max((u - 0.46) / 0.12, 0), 1);
    return darkest * t * t * (3 - 2 * t);
}

/** Name given to every eclipse shell */
export const eclipseName = 'eclipse_shade';
/** How dark a full shadow gets: as dark as night, as no starlight reaches it */
const eclipseDarkness = darkest;
/** How much of the night a moon's planet lifts at most, facing it full on when it fills a good part of the sky */
const planetshine = 0.1;

let clearMaterial = null;
let eclipseMaterial = null;
const eclipseGeometries = new Map();

/** Black, its opacity each vertex's darkness */
function eclipseShellMaterial() {
    eclipseMaterial ??= new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        vertexShader: `
            attribute float darkness;
            varying float vDarkness;
            void main() {
                vDarkness = darkness;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
        fragmentShader: `
            varying float vDarkness;
            void main() {
                gl_FragColor = vec4(0.0, 0.0, 0.0, clamp(vDarkness, 0.0, 1.0));
            }`,
    });
    return eclipseMaterial;
}

/** The unit sphere's points of an eclipse shell, and its triangles, shared by every shell of that fineness */
function eclipseGeometry(rings, segments) {
    const key = `${rings}/${segments}`;
    if (!eclipseGeometries.has(key)) {
        const points = new Float32Array((rings + 1) * (segments + 1) * 3);
        let k = 0;
        for (let ring = 0; ring <= rings; ring++) {
            const polar = ring / rings * Math.PI;
            for (let segment = 0; segment <= segments; segment++) {
                const azimuth = segment / segments * 2 * Math.PI;
                points[k++] = Math.sin(polar) * Math.cos(azimuth);
                points[k++] = Math.cos(polar);
                points[k++] = Math.sin(polar) * Math.sin(azimuth);
            }
        }
        const row = segments + 1;
        const indices = [];
        for (let ring = 0; ring < rings; ring++) {
            for (let segment = 0; segment < segments; segment++) {
                const a = ring * row + segment, b = a + row;
                // Wound counter-clockwise seen from outside, so only the near side draws
                indices.push(a, a + 1, b, a + 1, b + 1, b);
            }
        }
        const count = points.length / 3;
        const night = new Float32Array(count);
        // The worlds are lit by their stars (shaders.js litMaterial), so the shell adds no night of its own
        for (let i = 0; i < count; i++) night[i] = 0;
        eclipseGeometries.set(key, { points, indices, night });
    }
    return eclipseGeometries.get(key);
}

/** A unit sphere (the size of the night side shell it sits in) whose every vertex starts clear */
function eclipseShell(rings, segments) {
    const shape = eclipseGeometry(rings, segments);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(shape.points, 3));
    const darkness = new THREE.BufferAttribute(new Float32Array(shape.points.length / 3), 1);
    darkness.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('darkness', darkness);
    geometry.setIndex(shape.indices);
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1);
    const mesh = new THREE.Mesh(geometry, eclipseShellMaterial());
    mesh.name = eclipseName;
    mesh.renderOrder = renderOrder.shade;
    mesh.raycast = () => {};
    mesh.userData.eclipse = { points: shape.points, night: shape.night, isActive: false, lastInputs: [] };
    mesh.userData.ownsGeometry = true;
    return mesh;
}

/** Shows or restores a world's night side shell, left clear while its eclipse shell shades the whole world */
function setNightShellClear(shell, clear) {
    clearMaterial ??= new THREE.MeshBasicMaterial({ visible: false });
    // The world beneath is lit by its star, so its night side needs no shade: the shell only carries the eclipses
    shell.material = clearMaterial;
}

/**
 * A shell for a world of the given radius, lit by the nearest of `stars`, with the world's eclipse shell inside it.
 * `planetShade`, for a moon, is the shell of the planet it goes round, which lights its night side by planetshine.
 */
export function shell(radius, stars, planetShade = null) {
    shellGeometry ??= new THREE.SphereGeometry(1, 64, 32);
    clearMaterial ??= new THREE.MeshBasicMaterial({ visible: false });
    // Clear: the world beneath is lit by its star (shaders.js litMaterial); the shell carries its eclipse shell
    const mesh = new THREE.Mesh(shellGeometry, clearMaterial);
    mesh.name = name;
    mesh.scale.setScalar(radius * (1 + altitude));
    mesh.renderOrder = renderOrder.shade;
    mesh.userData.nightShade = { stars, planetShade };
    mesh.userData.worldRadius = radius;
    mesh.raycast = () => {};
    // A planet's shell is fine enough for a small moon's shadow to stay round; a moon's needs only its planet's
    const isMoon = planetShade !== null;
    mesh.add(eclipseShell(isMoon ? 48 : 64, isMoon ? 96 : 128));
    return mesh;
}

const scratch = {
    here: new THREE.Vector3(), star: new THREE.Vector3(), direction: new THREE.Vector3(), parent: new THREE.Quaternion(),
    target: new THREE.Quaternion(), up: new THREE.Vector3(),
};
const xAxis = new THREE.Vector3(1, 0, 0);

function nearestStar(stars, here, target) {
    let best = Infinity;
    for (const star of stars) {
        star.getWorldPosition(scratch.star);
        const d = scratch.star.distanceToSquared(here);
        if (d < best) {
            best = d;
            target.copy(scratch.star);
        }
    }
    return best < Infinity && best > 1e-12;
}

/** Points a world's lighting, its clouds' and its air's at its star (a world-space direction) */
function lightBody(body, direction) {
    const sun = body.material?.uniforms?.uSun;
    if (sun) sun.value.copy(direction);
    for (const child of body.children) {
        const childSun = child.material?.uniforms?.uSun;
        // A moon is lit by its own shell's star
        if (childSun && !child.children.some((c) => c.name === name)) childSun.value.copy(direction);
    }
}

/** Turns each shell so its clear side faces the nearest star, casts shadows, and brings up city lights at night */
export function updateNightShades(shades, lights) {
    const nearest = new THREE.Vector3();
    const bodies = [];
    for (const shade of shades) {
        if (!shade.visible || !shade.parent) continue;
        shade.getWorldPosition(scratch.here);
        if (!nearestStar(shade.userData.nightShade.stars, scratch.here, nearest)) continue;
        scratch.direction.subVectors(nearest, scratch.here).normalize();
        lightBody(shade.parent, scratch.direction);
        scratch.target.setFromUnitVectors(xAxis, scratch.direction);
        shade.parent.getWorldQuaternion(scratch.parent);
        shade.quaternion.copy(scratch.parent.invert().multiply(scratch.target));
        shade.updateMatrixWorld(true);
        // The world's own radius, from the shell's, which sits a set height above it
        const radius = shade.getWorldScale(scratch.up).x / (1 + altitude);
        bodies.push({ shade, centre: scratch.here.clone(), radius, star: nearest.clone(),
            planetShade: shade.userData.nightShade.planetShade ?? null });
    }
    castShadows(bodies);
    for (const light of lights) {
        const city = light.userData.cityLight;
        const world = light.parent;
        if (!light.visible || !city || !world) continue;
        world.getWorldPosition(scratch.here);
        if (!nearestStar(city.stars, scratch.here, nearest)) continue;
        // How high the star stands in the city's sky: 1 overhead, 0 on the horizon, −1 straight below
        world.getWorldQuaternion(scratch.parent);
        scratch.up.copy(city.site).applyQuaternion(scratch.parent).normalize();
        const elevation = scratch.up.dot(scratch.direction.subVectors(nearest, scratch.here).normalize());
        const t = Math.min(Math.max((0.08 - elevation) / 0.2, 0), 1);
        light.material.opacity = city.brightness * t * t * (3 - 2 * t);
    }
}

// MARK: eclipses and planetshine

/**
 * Shades each world's eclipse shell where other worlds of its planet's family stand between it and its star, and
 * lightens a moon's where it faces the lit side of its planet. Starlight is taken as parallel, so a shadow is a
 * cylinder as wide as the world casting it, with a soft penumbra that widens the farther it falls.
 */
function castShadows(bodies) {
    const byShade = new Map(bodies.map((body) => [body.shade, body]));
    const family = (body) => body.planetShade ?? body.shade;
    const toStarOf = (body) => body.star.clone().sub(body.centre).normalize();
    for (const receiver of bodies) {
        const eclipse = receiver.shade.children.find((child) => child.name === eclipseName);
        const state = eclipse?.userData.eclipse;
        if (!state) continue;
        let shine = null;
        const planet = receiver.planetShade ? byShade.get(receiver.planetShade) : null;
        if (planet) {
            const fromPlanet = receiver.centre.clone().sub(planet.centre);
            const distance = fromPlanet.length();
            if (distance > planet.radius) {
                const phase = (1 + fromPlanet.divideScalar(distance).dot(toStarOf(planet))) / 2;
                const strength = planetshine * phase * Math.min(3 * planet.radius / distance, 1);
                if (strength > 0.005) shine = { centre: planet.centre, strength };
            }
        }
        // Only a planet and its own moons shade one another, as real shadows end long before they reach another planet
        const casters = [];
        for (const caster of bodies) {
            if (caster.shade === receiver.shade || family(caster) !== family(receiver)) continue;
            const toStar = toStarOf(caster);
            const offset = receiver.centre.clone().sub(caster.centre);
            const along = offset.dot(toStar);
            if (!(along < 0)) continue;
            const across = offset.sub(toStar.clone().multiplyScalar(along)).length();
            if (!(across < caster.radius * 1.4 + receiver.radius)) continue;
            casters.push({ centre: caster.centre, radius: caster.radius, toStar });
        }
        const darkness = eclipse.geometry.getAttribute('darkness');
        if (!casters.length && !shine) {
            if (state.isActive) {
                darkness.array.fill(0);
                darkness.needsUpdate = true;
                setNightShellClear(receiver.shade, false);
                state.isActive = false;
                state.lastInputs = [];
            }
            continue;
        }
        if (!state.isActive) {
            setNightShellClear(receiver.shade, true);
            state.isActive = true;
        }
        // Worked out in the shell's own space, where the world is the unit sphere's centre and each vertex its normal
        eclipse.updateMatrixWorld(true);
        const scale = eclipse.getWorldScale(new THREE.Vector3()).x;
        if (!(scale > 0)) continue;
        const inverse = eclipse.getWorldQuaternion(new THREE.Quaternion()).invert();
        const local = casters.map((caster) => ({
            centre: eclipse.worldToLocal(caster.centre.clone()), radius: caster.radius / scale,
            toStar: caster.toStar.clone().applyQuaternion(inverse).normalize(),
        }));
        const localShine = shine ? { centre: eclipse.worldToLocal(shine.centre.clone()), strength: shine.strength } : null;
        // Skipped while nothing has moved far enough to show
        const inputs = [];
        for (const c of local) inputs.push(c.centre.x, c.centre.y, c.centre.z, c.radius, c.toStar.x, c.toStar.y, c.toStar.z);
        if (localShine) inputs.push(localShine.centre.x, localShine.centre.y, localShine.centre.z, localShine.strength);
        if (inputs.length === state.lastInputs.length && inputs.every((v, i) => Math.abs(v - state.lastInputs[i]) <= 0.002)) continue;
        state.lastInputs = inputs;
        writeDarkness(state, darkness.array, local, localShine);
        darkness.needsUpdate = true;
    }
}

/** Each vertex's darkness: the night side, darkened where the casters shadow it and lightened by planetshine */
function writeDarkness(state, out, casters, shine) {
    const { points, night } = state;
    const count = night.length;
    for (let index = 0; index < count; index++) {
        const px = points[index * 3], py = points[index * 3 + 1], pz = points[index * 3 + 2];
        let dark = night[index];
        for (const caster of casters) {
            const ox = px - caster.centre.x, oy = py - caster.centre.y, oz = pz - caster.centre.z;
            const along = ox * caster.toStar.x + oy * caster.toStar.y + oz * caster.toStar.z;
            if (!(along < 0)) continue;
            const ax = ox - along * caster.toStar.x, ay = oy - along * caster.toStar.y, az = oz - along * caster.toStar.z;
            const across = Math.sqrt(ax * ax + ay * ay + az * az) / caster.radius;
            const width = 0.12 + Math.min(-along / caster.radius * 0.02, 0.3);
            if (!(across < 1 + width)) continue;
            const t = Math.min(Math.max((across - (1 - width)) / (2 * width), 0), 1);
            dark = Math.max(dark, eclipseDarkness * (1 - t * t * (3 - 2 * t)));
        }
        if (shine) {
            const sx = shine.centre.x - px, sy = shine.centre.y - py, sz = shine.centre.z - pz;
            const length = Math.sqrt(sx * sx + sy * sy + sz * sz) || 1;
            const facing = (px * sx + py * sy + pz * sz) / length;
            if (facing > 0) dark = Math.max(dark - shine.strength * facing, 0);
        }
        out[index] = dark;
    }
}

// MARK: city lights

const lightTextures = new Map();
const groundTextures = new Map();

/**
 * The patch of ground a settlement's lights (and its ground by day) lie on, in its world's own space: a fine grid laid
 * over the ground, `lift` world radii above it, each vertex over the point of the globe its texture shows there, and
 * every triangle over water left out. `relief(x, y, z)` gives the ground's height above the sphere in world radii.
 * Null if the whole patch is over water.
 */
function patchGeometry(latitude, longitude, kind, worldRadius, lift, isWater, relief) {
    const point = patchPoint(latitude, longitude, kind);
    const cells = Math.min(Math.max(Math.round(2 * spreadOf(kind) / 0.15), 24), 120);
    const row = cells + 1;
    const positions = new Float32Array(row * row * 3), uvs = new Float32Array(row * row * 2), wet = new Uint8Array(row * row);
    let k = 0;
    for (let j = 0; j <= cells; j++) {
        for (let i = 0; i <= cells; i++) {
            const x = i / cells * 2 - 1, y = j / cells * 2 - 1;
            const d = point(x, y);
            const height = relief ? relief(d[0], d[1], d[2]) : 0;
            const scale = worldRadius * (1 + height + lift);
            positions[k * 3] = d[0] * scale; positions[k * 3 + 1] = d[1] * scale; positions[k * 3 + 2] = d[2] * scale;
            // Rows of the texture run down the patch: the first row of the image at the top
            uvs[k * 2] = 0.5 + x / 2; uvs[k * 2 + 1] = 0.5 - y / 2;
            wet[k] = isWater && isWater(d[0], d[1], d[2]) ? 1 : 0;
            k++;
        }
    }
    const indices = [];
    for (let j = 0; j < cells; j++) {
        for (let i = 0; i < cells; i++) {
            const a = j * row + i, b = a + 1, c = a + row, d = c + 1;
            for (const triangle of [[a, c, b], [b, c, d]]) {
                if (!triangle.some((v) => wet[v])) indices.push(...triangle);
            }
        }
    }
    if (!indices.length) return null;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    return geometry;
}

function dataTexture(data, size) {
    const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    t.needsUpdate = true;
    return t;
}

function lightMaterial(seed, kind, isElectric) {
    const key = `${seed}/${kind}/${isElectric}`;
    if (!lightTextures.has(key)) {
        const pixels = cityLightPixels(seed, kind, isElectric);
        lightTextures.set(key, { color: dataTexture(pixels.color, patternSize), opacity: dataTexture(pixels.opacity, patternSize) });
    }
    const textures = lightTextures.get(key);
    return new THREE.MeshBasicMaterial({ map: textures.color, alphaMap: textures.opacity, transparent: true, opacity: 0,
        side: THREE.DoubleSide, depthWrite: false });
}

/**
 * A city's lights lying on its world's surface, drawn over the night side shell: its own pattern drawn from the
 * place's id. Far larger than the city really is, so it shows on a whole globe. Where `isWater` is given, the lights
 * stop at the shore; where `relief` is given, they lie over the ground rather than the bare sphere.
 */
export function cityLight({ latitude, longitude, kind, era, placeID, worldRadius, stars, isWater = null, relief = null }) {
    const site = new THREE.Vector3(...SurfaceMap.spherePoint(latitude * Math.PI / 180, longitude * Math.PI / 180));
    const isElectric = eraRank(era) >= eraRank('electrical');
    const geometry = patchGeometry(latitude, longitude, kind, worldRadius, 0.0016, isWater, relief);
    if (!geometry) return null;
    const light = new THREE.Mesh(geometry, lightMaterial(seedFor(placeID), kind, isElectric));
    light.name = cityLightName;
    light.renderOrder = renderOrder.lights;
    light.raycast = () => {};
    light.userData.cityLight = { stars, site, brightness: isElectric ? 1 : 0.6 };
    light.userData.ownsGeometry = true;
    return light;
}

/** Whether a settlement's ground by day is already drawn and kept under `key` */
export function hasCityGround(key) {
    return groundTextures.has(key);
}

/**
 * The same settlement by day: its grey built-up ground and the fields round it, over the same layout as its lights,
 * beneath the clouds and the night side shell. `pixels` ({ color, opacity, size }) are its day pixels, kept under `key`.
 */
export function cityGround({ latitude, longitude, kind, key, pixels, worldRadius, isWater = null, relief = null }) {
    if (!groundTextures.has(key)) {
        if (!pixels) return null;
        groundTextures.set(key, { color: dataTexture(pixels.color, pixels.size), opacity: dataTexture(pixels.opacity, pixels.size) });
    }
    const geometry = patchGeometry(latitude, longitude, kind, worldRadius, 0.0011, isWater, relief);
    if (!geometry) return null;
    const textures = groundTextures.get(key);
    const material = new THREE.MeshBasicMaterial({ map: textures.color, alphaMap: textures.opacity, transparent: true,
        side: THREE.DoubleSide, depthWrite: false });
    const ground = new THREE.Mesh(geometry, material);
    ground.name = cityGroundName;
    ground.renderOrder = renderOrder.ground;
    ground.raycast = () => {};
    ground.userData.ownsGeometry = true;
    return ground;
}

/**
 * Whether a point on a world's globe (a unit vector) is open sea: below sea level on a rocky world with water, as its
 * globe draws it. Null for worlds with no seas, so their lights aren't clipped.
 */
export function seaTest(world) {
    const style = world ? SurfaceMap.styleFor(world) : null;
    if (!style || style.kind !== 'rocky' || !(style.waterFraction > 0)) return null;
    const prepared = SurfaceMap.prepared(style);
    const level = SurfaceMap.seaLevel(prepared, icosphere);
    return (x, y, z) => SurfaceMap.elevation(prepared, x, y, z, 0) < level;
}
