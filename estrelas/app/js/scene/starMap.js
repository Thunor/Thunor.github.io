//
//  starMap.js
//  Estrelas (web)
//
//  The 3D star map: the window of star systems drawn around the view (full stars near it, dots further out), the
//  sectors loaded as the view moves, the camera that orbits a pivot, flying, zooming, focusing a star, filter rings,
//  routes, the backdrop view of one system with its planets, planets and moons followed round their orbits, their
//  surfaces, night sides and city lights. A port of ContentView.swift's ModelExample.
//
//  The camera orbits the pivot at a fixed distance; zoom scales the star field about the pivot instead.
//

import * as THREE from '../../vendor/three.module.min.js';
import { Orbit, SimulationClock } from './orbit.js';
import { starMaterial, plasmaMaterial, shaderClock, cloudMaterial, weatherTime } from './shaders.js';
import * as NebulaScene from './nebulaScene.js';
import { nebulaContains, floatDistance } from '../gen/nebulaGenerator.js';
import { WeatherClock, packedSettings } from '../surface/cloudModel.js';
import { isFaceLocked, localWeather } from '../surface/localWeather.js';
import { layerPixels, weatherWidth, weatherHeight } from '../surface/weatherMap.js';
import { WorldText } from '../ui/worldText.js';
import { hasVisibleNotes } from '../model/savedData.js';
import { canSee } from '../edition.js';
import * as PS from './planetaryScene.js';
import * as NightShade from './nightShade.js';
import { colorBySpectral } from './starColors.js';
import { StarFieldWindow } from './starFieldWindow.js';
import { rangeInUnits } from './starRoute.js';
import * as SurfaceMap from '../surface/surfaceMap.js';
import { globeMesh, waterTest, reliefTest } from '../surface/voronoiSurface.js';
import { hasHabitableWorld, hasPlanets, hasAsteroidBelt, hasGasGiant } from '../model/planetarySystem.js';
import { sectorsWithin, sectorKey, distanceToSector, originSector } from '../gen/sectors.js';
import { settlementKinds } from '../gen/cityGenerator.js';
import { planRouteInWorker, drawCityGround, weatherInWorker, terrainInWorker, globeMeshInWorker } from '../model/dataStore.js';
import { seedFor as cityLightSeed } from './cityLightPattern.js';
import * as WorldTraffic from './worldTraffic.js';
import { applyingAnnotations } from '../model/savedData.js';
import { eraRank } from '../gen/socialGenerator.js';
import { SurfaceQueue } from './surfaceQueue.js';
import { t } from '../ui/i18n.js';

THREE.ColorManagement.enabled = false;

const plasmaShellRatio = 1.6;
const backdropRadius = 60;
const backdropPointRadius = 0.1;
const backdropDuration = 0.8;
const cameraDistance = 20;
const cameraFieldOfView = 60;
const planetaryViewFill = 0.75;
const planetViewFill = 0.35;
const minimumZoom = 0.1;
const maximumZoom = 5000;
const stellarMaximumZoom = 100;
/** Zoom a star is brought to when it's double clicked */
const starFocusZoom = 20;
/** How far outside a star's drawn edge, in pixels, a click still picks it */
const starClickSlop = 10;
const starClearance = 1 / Math.sin(cameraFieldOfView / 2 * Math.PI / 180);
/**
 * How many full globes are drawn at once, and how many quick previews: more on computers with more cores, as each is
 * drawn in a surface worker of its own
 */
const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4;
const fullGlobesAtOnce = Math.min(Math.max(Math.floor(cores / 3), 2), 4);
const previewGlobesAtOnce = Math.min(Math.max(Math.floor(cores / 2), 2), 6);
/** The finest globe drawn in 3D: 2× (4.6 million vertices) */
const maximumGlobeResolution = 2;
/** How close the camera may come to a planet or moon, as a multiple of its radius: just above its cloud tops */
const planetClearance = 1 + SurfaceMap.cloudAltitude + 0.03;
const enlargedStarScale = 2;
/** Size of a star's dot, beyond full stars' reach, as a fraction of the star's own size */
const starDotScale = 0.8;
/** Scene units per second at zoom 1, about the visible height of the view; Shift goes ten times faster */
const flightSpeed = 20;
/** How wide each filter ring is, in star radii */
const filterRingWidth = 0.35;
/** How long a pin dropped on a globe stays, in seconds */
export const pinDuration = 8;

// Route lines and rings keep this width and size on screen, in scene units at zoom 1
const routeLineRadius = 0.02;
const routeMarkerRadius = 0.16;
const routeReachRadius = 0.3;
const routeDashSlot = 0.15;
const routeDashFill = 0.6;
const routeDashMarchPeriod = 0.6;
const reachDashPairs = 8;
const reachDashSpinPeriod = 1.5;

/** How far from the pivot systems are drawn in a sectored universe, sectors are loaded, and full stars are drawn */
export const viewRadius = 22.5;
const loadRadius = viewRadius + 5;
const fullStarRadius = viewRadius / 2;

const spectralValues = { D: 3, M: 4, K: 5, G: 6, F: 7, A: 8, B: 9, O: 10 };

/** Rings and buttons for systems under a travel advisory: yellow for essential travel only, red for no travel */
export const travelAdvisoryColors = { essentialOnly: new THREE.Color(1, 0.72, 0.1), noTravel: new THREE.Color(1, 0.18, 0.15) };
export const travelAdvisoryCSS = { essentialOnly: 'rgb(255 184 26)', noTravel: 'rgb(255 46 38)' };
/** Rings for systems with notes on them */
export const notesColor = new THREE.Color(0.3, 0.9, 1);
export const notesCSS = 'rgb(77 230 255)';
const advisoryFilters = new Set(Object.keys(travelAdvisoryColors));

/** Visual (not physical) sphere radius, scaled within the stellar type by spectral class and subclass */
export function displayRadius(type, spectralClass, subClass) {
    const base = { d: 0.04, VI: 0.06, V: 0.08, IV: 0.1, III: 0.13, II: 0.16, Ib: 0.2, Iab: 0.22, Ia: 0.25, 'Ia+': 0.32,
        remnant: 0.03 }[type] ?? 0.08;
    // Classes off the main sequence's scale: brown dwarfs smaller than any red dwarf, neutron stars and black holes
    // smaller still (though big enough to find), Wolf–Rayet stars bright and compact, carbon and S-type stars as big
    // as the giants they are
    switch (spectralClass) {
        case 'L': return 0.05;
        case 'T': return 0.046;
        case 'Y': return 0.042;
        case 'NS': return 0.03;
        case 'BH': return 0.05;
        case 'W': return 0.12;
        case 'C': case 'S': return base * 1.1;
        default: break;
    }
    const subClassHeat = (9 - Math.min(Math.max(subClass, 0), 9)) / 10;
    const heat = Math.max((spectralValues[spectralClass] ?? 4) - 4, 0) + subClassHeat;
    const midpoint = 3.45;
    switch (type) {
        case 'd': return base * (0.9 + subClassHeat * 0.25);
        case 'V': case 'VI': return base * (1 + (heat - midpoint) * 0.15);
        default: return base * (1 + (heat - midpoint) * 0.05);
    }
}

/** RealityKit's ease-in-out timing curve */
function easeInOut(t) {
    let lo = 0, hi = 1, s = t;
    for (let i = 0; i < 20; i++) {
        s = (lo + hi) / 2;
        const x = 3 * (1 - s) * (1 - s) * s * 0.42 + 3 * (1 - s) * s * s * 0.58 + s * s * s;
        if (x < t) lo = s; else hi = s;
    }
    return 3 * (1 - s) * s * s + s * s * s;
}

const smooth = (t) => t * t * (3 - 2 * t);

export const formatCoordinates = (latitude, longitude) =>
    `${Math.abs(latitude).toFixed(1)}°${latitude >= 0 ? 'N' : 'S'}  ${longitude.toFixed(1)}°E`;

const textureFromPixels = (image, transform = null) => {
    let data = image.pixels;
    if (transform) {
        data = new Uint8Array(image.pixels.length);
        for (let i = 0; i < data.length; i += 4) {
            const value = transform(image.pixels[i + 3]);
            data[i] = data[i + 1] = data[i + 2] = value;
            data[i + 3] = 255;
        }
    }
    const texture = new THREE.DataTexture(data, image.width, image.height, THREE.RGBAFormat);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.wrapS = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
};

/**
 * A UV sphere textured equirectangularly as RealityKit's generated spheres are, which the Mac app wraps its textures
 * and cloud maps on: u = 0 at +x running toward +z, north up
 */
function mappedSphere(radius, widthSegments = 96, heightSegments = 48) {
    const positions = [], uvs = [], normals = [], indices = [];
    for (let iy = 0; iy <= heightSegments; iy++) {
        const v = iy / heightSegments;
        const latitude = (0.5 - v) * Math.PI;
        for (let ix = 0; ix <= widthSegments; ix++) {
            const u = ix / widthSegments;
            const longitude = u * 2 * Math.PI;
            const x = Math.cos(latitude) * Math.cos(longitude), y = Math.sin(latitude), z = Math.cos(latitude) * Math.sin(longitude);
            positions.push(x * radius, y * radius, z * radius);
            normals.push(x, y, z);
            uvs.push(u, v);
        }
    }
    const row = widthSegments + 1;
    for (let iy = 0; iy < heightSegments; iy++) {
        for (let ix = 0; ix < widthSegments; ix++) {
            const a = iy * row + ix, b = a + 1, c = a + row, d = c + 1;
            if (iy !== 0) indices.push(a, b, c);
            if (iy !== heightSegments - 1) indices.push(b, d, c);
        }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    return geometry;
}

// MARK: shared meshes

const filterRingGeometries = new Map();

/** A flat annulus in the xy plane, facing +z, from `outerRadius` in to `outerRadius - filterRingWidth` */
function filterRingGeometry(outerRadius) {
    if (filterRingGeometries.has(outerRadius)) return filterRingGeometries.get(outerRadius);
    const geometry = new THREE.RingGeometry(outerRadius - filterRingWidth, outerRadius, 96, 1);
    filterRingGeometries.set(outerRadius, geometry);
    return geometry;
}

/** A unit icosahedron's vertices and outward-wound faces: round enough for a dot, and only 20 triangles */
const icosahedron = (() => {
    const phi = (1 + Math.sqrt(5)) / 2;
    const vertices = [[-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0], [0, -1, phi], [0, 1, phi], [0, -1, -phi],
        [0, 1, -phi], [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]].map((p) => new THREE.Vector3(...p).normalize());
    const faces = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6],
        [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    const indices = [];
    for (const [a, b, c] of faces) {
        const va = vertices[a], vb = vertices[b], vc = vertices[c];
        const normal = new THREE.Vector3().subVectors(vb, va).cross(new THREE.Vector3().subVectors(vc, va));
        const outward = normal.dot(va.clone().add(vb).add(vc)) > 0;
        indices.push(...(outward ? [a, b, c] : [a, c, b]));
    }
    return { vertices, indices };
})();

/** One geometry holding a small icosahedron at each dot */
function dotGeometry(dots) {
    const positions = new Float32Array(dots.length * 12 * 3);
    const indices = new Uint32Array(dots.length * 60);
    dots.forEach((dot, n) => {
        icosahedron.vertices.forEach((v, i) => {
            const k = (n * 12 + i) * 3;
            positions[k] = dot.centre[0] + v.x * dot.radius;
            positions[k + 1] = dot.centre[1] + v.y * dot.radius;
            positions[k + 2] = dot.centre[2] + v.z * dot.radius;
        });
        icosahedron.indices.forEach((index, i) => { indices[n * 60 + i] = n * 12 + index; });
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeBoundingSphere();
    return geometry;
}

const dashedLineGeometries = new Map();

/**
 * `count` hexagonal dashes of radius 1 up the y axis from 0 to 1, plus a pair just below 0 that marches in as the rest
 * move up; even dashes in the first group, odd in the second
 */
function dashedLineGeometry(count) {
    if (dashedLineGeometries.has(count)) return dashedLineGeometries.get(count);
    const sides = 6;
    const ring = Array.from({ length: sides }, (_, side) => {
        const angle = side / sides * 2 * Math.PI;
        return [Math.cos(angle), 0, Math.sin(angle)];
    });
    const parts = [{ positions: [], indices: [] }, { positions: [], indices: [] }];
    for (let dash = -2; dash < count; dash++) {
        const bottom = dash / count, top = (dash + routeDashFill) / count;
        const part = parts[dash & 1];
        const base = part.positions.length / 3;
        for (const [x, , z] of ring) part.positions.push(x, bottom, z);
        for (const [x, , z] of ring) part.positions.push(x, top, z);
        for (let side = 0; side < sides; side++) {
            const low = base + side, nextLow = base + (side + 1) % sides, high = low + sides, nextHigh = nextLow + sides;
            part.indices.push(low, high, nextHigh, low, nextHigh, nextLow);
        }
    }
    const geometry = mergedGroups(parts);
    dashedLineGeometries.set(count, geometry);
    return geometry;
}

/** Joins mesh parts into one geometry with a material group for each */
function mergedGroups(parts) {
    const positions = [], indices = [];
    const geometry = new THREE.BufferGeometry();
    for (const [material, part] of parts.entries()) {
        const base = positions.length / 3;
        const start = indices.length;
        positions.push(...part.positions);
        indices.push(...part.indices.map((i) => i + base));
        geometry.addGroup(start, part.indices.length, material);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();
    return geometry;
}

let reachRingGeometryCache = null;

/** A flat dashed annulus in the xy plane, red dashes in its first group and yellow in its second */
function reachRingGeometry() {
    if (reachRingGeometryCache) return reachRingGeometryCache;
    const outerRadius = 1, innerRadius = 0.8;
    const dashes = reachDashPairs * 2, segmentsPerDash = 6;
    const dashAngle = 2 * Math.PI / dashes, gap = dashAngle * 0.2;
    const parts = [0, 1].map((colour) => {
        const positions = [], indices = [];
        for (let number = colour; number < dashes; number += 2) {
            const base = positions.length / 3;
            const start = number * dashAngle + gap / 2;
            for (let step = 0; step <= segmentsPerDash; step++) {
                const angle = start + (dashAngle - gap) * step / segmentsPerDash;
                positions.push(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius, 0,
                    Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius, 0);
            }
            for (let step = 0; step < segmentsPerDash; step++) {
                const inner = base + step * 2, outer = inner + 1, nextInner = inner + 2, nextOuter = inner + 3;
                indices.push(inner, outer, nextOuter, inner, nextOuter, nextInner);
            }
        }
        return { positions, indices };
    });
    reachRingGeometryCache = mergedGroups(parts);
    return reachRingGeometryCache;
}

const unlit = (color, options = {}) => new THREE.MeshBasicMaterial({ color, ...options });

// MARK: the star map

export class StarMap extends EventTarget {
    /**
     * `options`: showClouds, showOrbits, showNightSides, showStarOrbitRings, starSystemLimit, routeRange, mapResolution,
     * `canFly()` (false while a sheet is open or text is being typed), `isOverPanel()` (the pointer is over a panel, so
     * scrolling scrolls it), `overlay` (an element over the canvas for the globe pin's label)
     */
    constructor(canvas, store, options = {}) {
        super();
        this.canvas = canvas;
        this.store = store;
        this.options = options;
        this.showClouds = options.showClouds ?? true;
        this.showOrbits = options.showOrbits ?? true;
        this.showNightSides = options.showNightSides ?? true;
        this.showStarOrbitRings = options.showStarOrbitRings ?? true;
        this.starSystemLimit = options.starSystemLimit ?? 1000;
        this.routeRange = options.routeRange ?? 2;
        /** How finely surface maps, and the globe of the world zoomed to, are drawn: 1, 2 or 4 */
        this.mapResolution = options.mapResolution ?? 1;
        /** How finely the globe of the world zoomed to is drawn (1 or 2), apart from the surface maps' resolution */
        this.globeScale = options.globeResolution ?? 1;
        this.enlargeStars = false;
        this.showNebulae = options.showNebulae ?? true;
        this.showTravelAdvisories = options.showTravelAdvisories ?? true;
        this.nebulaObjects = [];
        this.spinners = new Set();

        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 1);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(cameraFieldOfView, 1, 0.05, 20000);
        this.scene.add(this.camera);
        // Belt rocks are the only lit objects: soft light all round plus a light from the viewer
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
        const headLight = new THREE.DirectionalLight(0xffffff, 1.4);
        headLight.position.set(-0.5, 1, 1);
        this.camera.add(headLight);

        this.fieldNode = new THREE.Group();
        this.fieldNode.name = 'anchor';
        this.fieldNode.matrixAutoUpdate = false;
        this.scene.add(this.fieldNode);

        this.zoomFactor = 1;
        this.rotAngleX = 0;
        this.rotAngleY = 0;
        this.pivotPoint = new THREE.Vector3();
        this.focusedStar = null;
        this.infoTarget = null;
        this.backdrop = null;
        this.backdropStars = [];
        this.planetGroups = [];
        this.movedStars = [];
        this.fieldLayout = new Map();
        this.zoomBeforePlanetaryView = null;
        this.fieldOrbitRings = new Set();
        this.planetary = null;
        this.habitableZonesAllowed = true;
        this.nightShades = [];
        this.cityLights = [];
        this.globePin = null;
        this.follow = null;
        this.filters = { planets: false, habitable: false, belts: false, gasGiants: false, essentialOnly: false, noTravel: false,
            notes: false };
        this.counts = { planets: 0, habitable: 0, belts: 0, gasGiants: 0 };
        this.travelAdvisories = {};
        this.annotations = {};
        this.routeWaypoints = [];
        this.route = null;
        this.routePlanning = null;
        this.routeObjects = [];
        this.routeEnded = false;
        this.routeDashLevel = 0;
        this.tweens = new Map();
        this.cameraAnimation = null;
        this.heldFlightKeys = new Set();
        this.shiftHeld = false;
        this.pointerLocation = null;
        this.disposed = false;
        this.pending = [];

        // Every system in the universe, and the window of them drawn now
        this.field = {
            systems: [], firstStarIndex: [], positions: new Float32Array(0), window: null, shown: new Map(),
            centre: [0, 0, 0], fullCentre: [0, 0, 0], radius: 0, parsecsPerUnit: 1, isStale: false, sectorSeed: null, loadedSectors: new Set(),
            sectorsCheckedAt: null, activeSectors: [], sectorLoading: false, dotIndices: [], dots: null, nebulae: [],
        };

        this.installInput();
        this.resize();
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(canvas);
        this.lastFrame = performance.now();
        this.frame = this.frame.bind(this);
        requestAnimationFrame(this.frame);
    }

    emit(name, detail) {
        this.dispatchEvent(new CustomEvent(name, { detail }));
    }

    dispose() {
        this.disposed = true;
        this.pending.forEach(clearTimeout);
        this.resizeObserver.disconnect();
        this.removeInput();
        this.removeGlobePin();
        this.resolvingStatus?.remove();
        this.scene.traverse((object) => {
            if (object.geometry && !object.userData.sharedGeometry) object.geometry.dispose?.();
            const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
            for (const material of materials) material.dispose();
        });
        this.renderer.dispose();
    }

    resize() {
        const width = this.canvas.clientWidth || window.innerWidth;
        const height = this.canvas.clientHeight || window.innerHeight;
        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / Math.max(height, 1);
        this.camera.updateProjectionMatrix();
    }

    get systems() {
        return this.field.systems.length ? this.field.systems : null;
    }

    get starFieldScale() {
        return this.enlargeStars ? enlargedStarScale : 1;
    }

    // MARK: building the star field

    /** Reads the universe and draws the window of systems around the origin */
    async load(onStatus) {
        const starField = await this.store.starField(onStatus);
        if (this.disposed) return;
        // Travel advisories and annotations are read before any stars are drawn, so their rings are made with the stars
        [this.travelAdvisories, this.annotations] = await Promise.all([this.store.travelAdvisories(), this.store.allAnnotations()]);
        if (this.disposed) return;
        this.appendSystems(starField.systems, originSector);
        this.addNebulae(starField.nebulae ?? []);
        this.field.parsecsPerUnit = starField.parsecsPerUnit ?? 1;
        this.field.sectorSeed = starField.sectorSeed ?? null;
        this.field.window = new StarFieldWindow(this.field.positions);
        this.refreshSectors();
        this.refreshStarWindow(true);
        this.emit('loaded', { counts: this.counts, systems: this.field.systems.length });
        this.emitCamera();
    }

    /** Adds a sector's systems to the end, so every system already there keeps its index */
    appendSystems(systems, sector) {
        const field = this.field;
        const lastIndex = field.firstStarIndex.length - 1;
        let n = lastIndex >= 0 ? field.firstStarIndex[lastIndex] + (field.systems[lastIndex].stars?.length ?? 0) : 0;
        const positions = new Float32Array(field.positions.length + systems.length * 3);
        positions.set(field.positions);
        let k = field.positions.length;
        for (const system of systems) {
            field.firstStarIndex.push(n);
            n += system.stars?.length ?? 0;
            const planetary = system.planetarySystem;
            if (planetary && hasPlanets(planetary)) this.counts.planets += 1;
            if (planetary && hasHabitableWorld(planetary)) this.counts.habitable += 1;
            if (planetary && hasAsteroidBelt(planetary)) this.counts.belts += 1;
            if (planetary && hasGasGiant(planetary)) this.counts.gasGiants += 1;
            const p = system.position ?? [0, 0, 0];
            positions[k++] = p[0]; positions[k++] = p[1]; positions[k++] = p[2];
            field.systems.push(system);
        }
        field.positions = positions;
        field.loadedSectors.add(sectorKey(sector));
    }

    /**
     * Draws the systems nearest the pivot and removes ones the view has left behind. Does anything only once the pivot
     * has gone part of the way to the window's edge; holds still while a planetary view is open.
     */
    refreshStarWindow(force = false) {
        const field = this.field;
        if (!field.window) return;
        if (this.backdrop) {
            field.isStale = field.isStale || force;
            return;
        }
        const pivot = this.pivotPoint.toArray();
        const fullCentre = this.fullStarCentre();
        const step = field.sectorSeed === null ? field.radius * 0.25 : Math.min(field.radius, viewRadius) * 0.1;
        const gap = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
        if (!force && gap(pivot, field.centre) < step && gap(fullCentre, field.fullCentre) < step) return;
        field.isStale = false;
        const { indices: nearest, radius } = field.window.nearest(pivot, this.starSystemLimit);
        const distanceFrom = (index, centre) => gap(field.systems[index].position ?? [0, 0, 0], centre);
        const sectored = field.sectorSeed !== null;
        const drawable = nearest.filter((index) => !sectored || distanceFrom(index, pivot) <= viewRadius);
        // Near systems are drawn as full stars, round a centre a little toward the camera; further out, plain dots
        const full = drawable.filter((index) => !sectored || distanceFrom(index, fullCentre) <= fullStarRadius);
        field.centre = pivot;
        field.fullCentre = fullCentre;
        field.radius = radius;

        // Systems being looked at stay, even if they've drifted out of the window
        const wanted = new Set(full);
        for (const star of [this.focusedStar, this.infoTarget]) {
            const index = star?.userData.data.systemIndex;
            if (index >= 0) wanted.add(index);
        }
        for (const [index, objects] of field.shown) {
            if (wanted.has(index)) continue;
            for (const object of objects) {
                object.removeFromParent();
                this.fieldOrbitRings.delete(object);
                disposeObject(object);
            }
            field.shown.delete(index);
        }
        for (const index of full) {
            if (!field.shown.has(index)) field.shown.set(index, this.addSystemObjects(index));
        }
        // Every drawable system has a dot, full stars too: a dot is smaller than its star, so the star hides it. That way
        // the dots only change as the pivot moves, not as turning and zooming move the sphere of full stars
        const sameDots = drawable.length === field.dotIndices.length &&
            (() => { const old = new Set(field.dotIndices); return drawable.every((i) => old.has(i)); })();
        if (!sameDots || force) this.drawStarDots(drawable);
        this.updateZoomScaledMeshes();
        this.updateFilterHighlights();
    }

    /**
     * Where the sphere of full stars is centred: from the pivot toward the camera, so the camera sits inside it and the
     * dots beyond it lie behind the camera or far past the pivot. Never so far that the pivot's own systems become dots.
     */
    fullStarCentre() {
        const pivot = this.pivotPoint.toArray();
        const offset = this.cameraOffset();
        const zoom = Math.max(this.zoomFactor, 0.0001);
        const toCamera = [offset.x / zoom, offset.y / zoom, offset.z / zoom];
        const distance = Math.hypot(...toCamera);
        if (!(distance > 0)) return pivot;
        const shift = Math.min(distance / 2, fullStarRadius * 0.9);
        return pivot.map((value, axis) => value + toCamera[axis] / distance * shift);
    }

    /** Works out which sectors reach near the pivot, and starts bringing in any not loaded yet */
    refreshSectors() {
        const field = this.field;
        if (field.sectorSeed === null) return;
        const pivot = this.pivotPoint;
        if (field.sectorsCheckedAt && field.sectorsCheckedAt.distanceTo(pivot) < 1) return;
        field.sectorsCheckedAt = pivot.clone();
        field.activeSectors = sectorsWithin(loadRadius, pivot.toArray());
        if (field.activeSectors.some((s) => !field.loadedSectors.has(sectorKey(s)))) this.loadSectors();
    }

    /** Loads (or generates) the sectors near the pivot not loaded yet, nearest first, drawing each when it's ready */
    async loadSectors() {
        const field = this.field;
        if (field.sectorLoading || field.sectorSeed === null) return;
        field.sectorLoading = true;
        try {
            for (;;) {
                if (this.disposed) return;
                const pivot = this.pivotPoint.toArray();
                const missing = field.activeSectors.filter((s) => !field.loadedSectors.has(sectorKey(s)));
                if (!missing.length) break;
                missing.sort((a, b) => distanceToSector(a, pivot) - distanceToSector(b, pivot));
                const sector = missing[0];
                let systems, nebulae;
                try {
                    ({ systems, nebulae } = await this.store.sectorSystems(sector, field.sectorSeed));
                } catch (error) {
                    console.error('Sector failed', error);
                    field.loadedSectors.add(sectorKey(sector));
                    continue;
                }
                if (this.disposed) return;
                this.appendSystems(systems, sector);
                this.addNebulae(nebulae ?? []);
                field.window = new StarFieldWindow(field.positions);
                this.emit('counts', this.counts);
                if (distanceToSector(sector, this.pivotPoint.toArray()) <= viewRadius) this.refreshStarWindow(true);
            }
        } finally {
            field.sectorLoading = false;
        }
    }

    /** Creates one system's stars (with their filter rings) and orbit rings, returning every object added */
    addSystemObjects(index) {
        const system = this.field.systems[index];
        const center = system.position ?? [0, 0, 0];
        const added = [];
        (system.stars ?? []).forEach((data, offset) => {
            const n = this.field.firstStarIndex[index] + offset;
            const star = this.createStar(data, `star_${n}`, n + 2.0, system.planetarySystem, center, system.name, index);
            const elements = data.orbitalElements;
            if (elements && elements.semiMajAxis > 0) {
                // They hold still at the orbit's starting point, so a star is always in the same place however long
                // after launch it's drawn, and redrawing the stars as sectors load never shifts them
                new Orbit(elements, center).epochPosition(star.position);
                const ring = PS.stellarOrbitRing(elements, star.userData.appearance.color);
                ring.position.set(...center);
                ring.visible = this.showStarOrbitRings;
                this.fieldNode.add(ring);
                this.fieldOrbitRings.add(ring);
                added.push(ring);
            } else {
                star.position.set(...center);
            }
            star.scale.setScalar(star.userData.appearance.radius * this.starFieldScale);
            this.fieldNode.add(star);
            added.push(star);
            const radius = star.userData.appearance.radius;
            const planetary = system.planetarySystem;
            if (planetary && hasHabitableWorld(planetary)) star.add(this.filterHalo(radius, 3, 'habitable', new THREE.Color(0.25, 0.95, 0.4)));
            if (planetary && hasAsteroidBelt(planetary)) star.add(this.filterHalo(radius, 3.6, 'belts', new THREE.Color(0.35, 0.6, 1)));
            if (planetary && hasGasGiant(planetary)) star.add(this.filterHalo(radius, 4.2, 'gasGiants', new THREE.Color(1, 0.6, 0.2)));
            if (planetary && hasPlanets(planetary)) {
                star.add(this.filterHalo(radius, 4.8, 'planets', new THREE.Color(0.75, 0.45, 1)));
            }
            // The advisory ring comes next; a system has one advisory at most, so both share it
            const advisory = system.id ? this.travelAdvisories[system.id] : null;
            if (advisory) star.add(this.filterHalo(radius, 5.4, advisory, travelAdvisoryColors[advisory]));
            // The notes ring is outermost
            if (system.id && this.hasVisibleNotes(system.id)) star.add(this.filterHalo(radius, 6, 'notes', notesColor));
        });
        return added;
    }

    createStar(data, name, seed, planetarySystem, systemCenter, systemName, systemIndex = -1) {
        const spectralClass = data.spectralClass ?? 'M';
        const subClass = data.subClass ?? 5;
        const radius = displayRadius(data.stellarType ?? 'V', spectralClass, subClass);
        const color = colorBySpectral(spectralClass, subClass);
        const star = new THREE.Mesh(PS.unitSphere(48), starMaterial(color, seed));
        star.userData.sharedGeometry = true;
        star.name = name;
        star.userData.appearance = { color, radius, seed };
        star.userData.data = { estrela: data, planetarySystem, systemCenter, systemName, systemIndex };
        star.userData.isStar = true;
        // A black hole shows only by the disc of gas glowing round it; a pulsar sweeps its beams round
        if (spectralClass === 'BH') star.add(NebulaScene.accretionDisc(1));
        else if (spectralClass === 'NS' && (data.variant === 'pulsar' || data.variant === 'magnetar')) {
            const beams = NebulaScene.pulsarBeams(1, data.variant === 'magnetar');
            star.add(beams);
            this.spinners.add(beams);
        }
        return star;
    }

    /** A flat ring `scale` star radii across, turned to face the camera, hidden until its filter is on */
    filterHalo(starRadius, scale, filter, color) {
        const material = unlit(color, { transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false });
        const halo = new THREE.Mesh(filterRingGeometry(scale), material);
        halo.userData.sharedGeometry = true;
        // In star radii; tiny stars get rings sized for a 0.05 radius star, so they can still be seen. The star's own
        // scale is its radius (and the Enlarge Stars factor), which the ring isn't meant to follow.
        halo.userData.haloScale = Math.max(starRadius, 0.05);
        halo.userData.filter = filter;
        halo.name = `${filter}_halo`;
        halo.visible = false;
        halo.raycast = () => {};
        return halo;
    }

    /** Draws each star of the systems at `indices` as a small flat dot in its colour, replacing any drawn before */
    drawStarDots(indices) {
        const field = this.field;
        if (field.dots) {
            field.dots.removeFromParent();
            disposeObject(field.dots);
            field.dots = null;
        }
        field.dotIndices = indices;
        if (!indices.length) return;
        const groups = new Map();
        for (const index of indices) {
            const system = field.systems[index];
            const centre = system.position ?? [0, 0, 0];
            for (const star of system.stars ?? []) {
                const spectralClass = star.spectralClass ?? 'M', subClass = star.subClass ?? 5;
                const key = `${spectralClass}/${subClass}`;
                const elements = star.orbitalElements;
                let position = centre;
                if (elements && elements.semiMajAxis > 0) position = new Orbit(elements, centre).epochPosition(new THREE.Vector3()).toArray();
                const radius = displayRadius(star.stellarType ?? 'V', spectralClass, subClass) * this.starFieldScale * starDotScale;
                if (!groups.has(key)) groups.set(key, { color: colorBySpectral(spectralClass, subClass), dots: [] });
                groups.get(key).dots.push({ centre: position, radius });
            }
        }
        const container = new THREE.Group();
        container.name = 'star_dots';
        for (const group of groups.values()) {
            const mesh = new THREE.Mesh(dotGeometry(group.dots), unlit(group.color));
            mesh.raycast = () => {};
            container.add(mesh);
        }
        container.visible = this.backdrop === null;
        this.fieldNode.add(container);
        field.dots = container;
    }

    // MARK: settings and filters

    setFilter(name, on) {
        this.filters[name] = on;
        this.updateFilterHighlights();
    }

    /** Adds a sector's nebulae to the star field, once their textures are drawn */
    addNebulae(nebulae) {
        if (!nebulae.length) return;
        this.field.nebulae.push(...nebulae);
        NebulaScene.prepareTextures(nebulae).then(() => {
            if (this.disposed) return;
            for (const nebula of nebulae) {
                const object = NebulaScene.nebulaEntity(nebula);
                object.visible = this.showNebulae && this.backdrop === null;
                this.fieldNode.add(object);
                this.nebulaObjects.push(object);
            }
        });
    }

    setShowNebulae(show) {
        this.showNebulae = show;
        this.updateFilterHighlights();
    }

    setShowTravelAdvisories(show) {
        this.showTravelAdvisories = show;
        this.updateFilterHighlights();
    }

    /** The nebulae a star's system lies inside, or that its star made or lights, nearest first */
    nebulaeOf(star) {
        const data = star?.userData?.data;
        if (!data) return [];
        const centre = data.systemCenter ?? [0, 0, 0];
        const id = data.estrela?.systemID;
        return this.field.nebulae.filter((n) => (id && n.systemID === id) || nebulaContains(n, centre))
            .sort((a, b) => floatDistance(a.position, centre) - floatDistance(b.position, centre));
    }

    /** Whether anything in a system has notes that can be seen in this edition */
    hasVisibleNotes(systemID) {
        return hasVisibleNotes(this.annotations?.[systemID], canSee);
    }

    /** How many systems have notes that can be seen here */
    get notedSystemCount() {
        return Object.keys(this.annotations ?? {}).filter((id) => this.hasVisibleNotes(id)).length;
    }

    /** Puts the notes ring on a system's stars drawn now, or takes it off, as it has notes or not */
    refreshNotesHalo(systemID) {
        const index = this.field.systems.findIndex((s) => s.id === systemID);
        if (index < 0) return;
        const noted = this.hasVisibleNotes(systemID);
        for (const star of this.field.shown.get(index) ?? []) {
            const appearance = star.userData.appearance;
            if (!appearance) continue;
            for (const halo of star.children.filter((c) => c.userData.filter === 'notes')) {
                halo.removeFromParent();
                disposeObject(halo);
            }
            if (noted) star.add(this.filterHalo(appearance.radius, 6, 'notes', notesColor));
        }
        this.updateFilterHighlights();
    }

    /** Shows the filter rings whose filter is on, except in the planetary view */
    updateFilterHighlights() {
        const fieldVisible = this.backdrop === null;
        for (const object of this.nebulaObjects) object.visible = this.showNebulae && fieldVisible;
        for (const object of this.routeObjects) object.visible = fieldVisible;
        for (const objects of this.field.shown.values()) {
            for (const star of objects) {
                for (const halo of star.children) {
                    const filter = halo.userData.filter;
                    if (!filter) continue;
                    halo.visible = fieldVisible && this.filters[filter] &&
                        (this.showTravelAdvisories || !advisoryFilters.has(filter));
                }
            }
        }
    }

    setShowClouds(show) {
        this.showClouds = show;
        for (const shell of this.planetary?.cloudShells ?? []) shell.visible = show;
    }

    setShowOrbits(show) {
        this.showOrbits = show;
        this.setOrbitPathsVisible(show);
        this.showHabitableZones(show && this.habitableZonesAllowed);
    }

    setShowNightSides(show) {
        this.showNightSides = show;
        this.nightShades.forEach((shade) => { shade.visible = show; });
        this.cityLights.forEach((light) => { light.visible = show; });
    }

    setShowStarOrbitRings(show) {
        this.showStarOrbitRings = show;
        const fieldVisible = this.backdrop === null;
        this.fieldOrbitRings.forEach((ring) => { ring.visible = show && fieldVisible; });
        if (show) this.updateZoomScaledMeshes();
    }

    setStarSystemLimit(limit) {
        this.starSystemLimit = limit;
        this.refreshStarWindow(true);
    }

    /** Draws the star field's stars at twice their size, so they're easier to see and pick */
    setEnlargeStars(enlarge) {
        this.enlargeStars = enlarge;
        const moved = new Set(this.movedStars);
        for (const star of this.fieldNode.children) {
            if (star.userData.isStar && !moved.has(star)) star.scale.setScalar(star.userData.appearance.radius * this.starFieldScale);
        }
        this.drawStarDots(this.field.dotIndices);
    }

    /** Shows or hides the orbit rings of the planetary system in view */
    setOrbitPathsVisible(visible) {
        const visit = (object) => {
            if (object.name.endsWith('_orbit')) object.visible = visible;
            object.children.forEach(visit);
        };
        this.planetGroups.forEach(visit);
        if (visible) this.updateZoomScaledMeshes();
    }

    setHabitableZonesVisible(visible) {
        this.habitableZonesAllowed = visible;
        this.showHabitableZones(visible && this.showOrbits);
    }

    showHabitableZones(visible) {
        for (const group of this.planetGroups) {
            group.traverse((object) => {
                if (object.name === 'habitable_zone') object.visible = visible;
            });
        }
    }

    // MARK: travel advisories and annotations

    systemIndexOf(star) {
        const index = star?.userData.data.systemIndex;
        return index >= 0 && index < this.field.systems.length ? index : null;
    }

    systemIDOf(star) {
        const index = this.systemIndexOf(star);
        return index === null ? null : this.field.systems[index].id ?? null;
    }

    /** The advisory on a star's system, if it has one */
    travelAdvisoryOf(star) {
        const id = this.systemIDOf(star);
        return id ? this.travelAdvisories[id] ?? null : null;
    }

    travelAdvisoryCount(advisory) {
        return Object.values(this.travelAdvisories).filter((a) => a === advisory).length;
    }

    /** Puts a travel advisory on a star's system (or takes it off, for null), saves them and redraws its rings */
    setTravelAdvisory(advisory, star) {
        const id = this.systemIDOf(star);
        const index = this.systemIndexOf(star);
        if (!id || (this.travelAdvisories[id] ?? null) === advisory) return;
        if (advisory) this.travelAdvisories[id] = advisory;
        else delete this.travelAdvisories[id];
        this.store.saveTravelAdvisories({ ...this.travelAdvisories });
        for (const object of this.field.shown.get(index) ?? []) {
            if (!object.userData.isStar) continue;
            for (const halo of [...object.children]) {
                if (advisoryFilters.has(halo.userData.filter)) halo.removeFromParent();
            }
            if (advisory) object.add(this.filterHalo(object.userData.appearance.radius, 5.4, advisory, travelAdvisoryColors[advisory]));
        }
        this.updateFilterHighlights();
        this.emit('travelAdvisories', this.travelAdvisories);
    }

    /** Changes what's been added by hand to a system, and saves it if anything changed */
    updateSystemAnnotations(systemID, change) {
        if (!systemID) return;
        const before = this.annotations[systemID] ?? { format: 'estrelas.annotations', version: 3, systemID, worlds: {} };
        const document = structuredClone(before);
        change(document);
        if (JSON.stringify(document) === JSON.stringify(before)) return;
        this.annotations[systemID] = document;
        this.store.saveAnnotations(document);
        if (this.planetary?.systemID === systemID) {
            this.refreshCityLights();
            this.refreshTraffic();
        }
        // The notes ring comes or goes as the system gains its first notes or loses its last
        if (hasVisibleNotes(document, canSee) !== hasVisibleNotes(before, canSee)) this.refreshNotesHalo(systemID);
        this.emit('annotations', { systemID, document });
    }

    // MARK: input

    installInput() {
        const canvas = this.canvas;
        const pointers = new Map();
        let drag = null;
        let pinch = null;
        let lastClick = null;
        this.handlers = {
            pointerdown: (event) => {
                canvas.setPointerCapture(event.pointerId);
                pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
                if (pointers.size === 1) {
                    // A drag begun with Shift held turns the camera where it stands instead of orbiting the pivot
                    const looking = event.shiftKey && this.backdrop === null;
                    if (looking) this.cameraAnimation = null;
                    drag = {
                        x: event.clientX, y: event.clientY, angleX: this.rotAngleX, angleY: this.rotAngleY, moved: false, looking,
                        camera: this.pivotPoint.clone().add(this.cameraOffset().divideScalar(Math.max(this.zoomFactor, 0.0001))),
                    };
                } else if (pointers.size === 2) {
                    const [a, b] = [...pointers.values()];
                    pinch = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom: this.zoomFactor };
                    drag = null;
                }
            },
            pointermove: (event) => {
                const rect = canvas.getBoundingClientRect();
                this.pointerLocation = { x: event.clientX - rect.left, y: event.clientY - rect.top };
                if (!pointers.has(event.pointerId)) return;
                pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
                if (pinch && pointers.size === 2) {
                    const [a, b] = [...pointers.values()];
                    const distance = Math.hypot(a.x - b.x, a.y - b.y);
                    this.zoomTo(pinch.zoom * distance / Math.max(pinch.distance, 1));
                    return;
                }
                if (!drag) return;
                const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
                if (!drag.moved && Math.hypot(dx, dy) < 4) return;
                drag.moved = true;
                this.rotAngleY = (drag.angleY + dx * -0.1) % 360;
                this.rotAngleX = Math.min(Math.max(drag.angleX + dy * 0.1, -89), 89);
                // Turning in place: the pivot swings around the camera, so the camera keeps its place
                if (drag.looking) {
                    this.pivotPoint.copy(drag.camera).sub(this.cameraOffset().divideScalar(Math.max(this.zoomFactor, 0.0001)));
                    this.pivotMoved();
                }
                this.emitCamera();
            },
            pointerleave: () => {
                this.pointerLocation = null;
            },
            pointerup: (event) => {
                pointers.delete(event.pointerId);
                if (pointers.size < 2) pinch = null;
                if (drag && !drag.moved && pointers.size === 0) {
                    const now = performance.now();
                    const isDouble = lastClick && now - lastClick.time < 400 && Math.hypot(event.clientX - lastClick.x, event.clientY - lastClick.y) < 6;
                    if (isDouble) {
                        lastClick = null;
                        this.handleDoubleClick(event);
                    } else {
                        lastClick = { time: now, x: event.clientX, y: event.clientY };
                        this.handleClick(event);
                    }
                }
                if (pointers.size === 0) drag = null;
            },
            pointercancel: (event) => {
                pointers.delete(event.pointerId);
                drag = null;
                pinch = null;
            },
            wheel: (event) => {
                event.preventDefault();
                let delta = event.deltaY;
                if (event.deltaMode === 1) delta *= 16;
                if (event.deltaMode === 2) delta *= 400;
                // Proportional, so scrolling feels the same zoomed out on the field or in on one planet
                const step = event.ctrlKey ? 0.02 : 0.01;
                this.zoomTo(this.zoomFactor * Math.exp(-delta * step));
            },
        };
        this.windowHandlers = {
            keydown: (event) => {
                this.shiftHeld = event.shiftKey;
                if ((event.code === 'KeyW' || event.code === 'KeyS') && this.canFly(event)) {
                    this.heldFlightKeys.add(event.code);
                    event.preventDefault();
                }
            },
            keyup: (event) => {
                this.shiftHeld = event.shiftKey;
                this.heldFlightKeys.delete(event.code);
            },
            blur: () => {
                // A key let go while the page was in the background never sends its key up
                this.heldFlightKeys.clear();
            },
        };
        for (const [name, handler] of Object.entries(this.handlers)) {
            canvas.addEventListener(name, handler, name === 'wheel' ? { passive: false } : undefined);
        }
        for (const [name, handler] of Object.entries(this.windowHandlers)) window.addEventListener(name, handler);
    }

    removeInput() {
        for (const [name, handler] of Object.entries(this.handlers)) this.canvas.removeEventListener(name, handler);
        for (const [name, handler] of Object.entries(this.windowHandlers)) window.removeEventListener(name, handler);
    }

    /** Only in the star field, with no sheet open, and never while typing */
    canFly(event) {
        const typing = ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)
            || document.activeElement?.isContentEditable;
        return this.backdrop === null && !event.metaKey && !event.ctrlKey && !event.altKey && !typing
            && (this.options.canFly?.() ?? true);
    }

    /** Moves the pivot toward the pointer while W is held (away while S is); speed follows the zoom */
    stepFlight(seconds) {
        if (!this.heldFlightKeys.size) return;
        if (this.backdrop) {
            this.heldFlightKeys.clear();
            return;
        }
        const forward = this.heldFlightKeys.has('KeyW'), backward = this.heldFlightKeys.has('KeyS');
        if (forward === backward) return;
        this.cameraAnimation = null;
        const boost = this.shiftHeld ? 10 : 1;
        const distance = flightSpeed * boost / Math.max(this.zoomFactor, 0.0001) * Math.min(seconds, 0.1);
        this.pivotPoint.addScaledVector(this.flightDirection(), distance * (forward ? 1 : -1));
        this.pivotMoved();
        this.emitCamera();
    }

    /** Straight out through the pointer, or straight ahead when the pointer isn't over the view */
    flightDirection() {
        if (this.pointerLocation) {
            const ray = this.rayThrough(this.pointerLocation);
            if (ray) return ray.direction;
        }
        const ahead = this.pivotPoint.clone().sub(this.camera.position);
        return ahead.lengthSq() > 0 ? ahead.normalize() : new THREE.Vector3(0, 0, -1);
    }

    rayThrough(location) {
        const width = this.canvas.clientWidth, height = this.canvas.clientHeight;
        if (!width || !height) return null;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(location.x / width * 2 - 1, -(location.y / height) * 2 + 1), this.camera);
        return raycaster.ray;
    }

    /** As the view moves, nearer systems are drawn in place of ones it has left behind, and sectors brought in */
    pivotMoved() {
        this.refreshSectors();
        this.refreshStarWindow();
    }

    zoomTo(proposed) {
        if (this.options.isOverPanel?.()) return;
        const maxZoom = this.planetary ? maximumZoom : stellarMaximumZoom;
        if (this.cameraAnimation) this.cameraAnimation.zoomOverridden = true;
        this.zoomFactor = this.zoomKeepingCameraOutside(this.zoomFactor, Math.max(minimumZoom, Math.min(proposed, maxZoom)));
        this.zoomChanged();
    }

    zoomChanged() {
        this.updateZoomScaledMeshes();
        this.updateRouteScale();
        this.emitCamera();
    }

    emitCamera() {
        // Turning and zooming move the camera, and the sphere of full stars kept around it
        this.refreshStarWindow();
        this.emit('camera', {
            zoom: this.zoomFactor, elevation: this.rotAngleX, azimuth: this.rotAngleY,
            x: this.pivotPoint.x, y: this.pivotPoint.y, z: this.pivotPoint.z,
        });
    }

    /** Every clickable star drawn now: the star field's and the planetary view's */
    starCandidates() {
        const stars = this.fieldNode.children.filter((s) => s.userData.isStar);
        for (const star of this.movedStars) if (!stars.includes(star)) stars.push(star);
        return stars.filter((star) => visibleInHierarchy(star));
    }

    /**
     * The star drawn at a point, or within a few pixels of it. Where stars overlap the nearest is picked; a click that
     * only comes close picks the star whose edge is closest.
     */
    starAt(event) {
        const rect = this.canvas.getBoundingClientRect();
        const click = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        this.updateTransforms();
        const right = new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 0).normalize();
        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        const project = (point) => {
            const p = point.clone().project(this.camera);
            return { x: (p.x + 1) / 2 * rect.width, y: (1 - p.y) / 2 * rect.height };
        };
        let covering = null, near = null;
        const centre = new THREE.Vector3(), scale = new THREE.Vector3();
        for (const star of this.starCandidates()) {
            star.getWorldPosition(centre);
            const depth = centre.clone().sub(this.camera.position).dot(forward);
            if (!(depth > 0)) continue;
            star.getWorldScale(scale);
            const projected = project(centre);
            const edge = project(centre.clone().addScaledVector(right, scale.x));
            const screenRadius = Math.hypot(edge.x - projected.x, edge.y - projected.y);
            const gap = Math.hypot(click.x - projected.x, click.y - projected.y) - screenRadius;
            if (gap <= 0) {
                if (!covering || depth < covering.depth) covering = { star, depth };
            } else if (gap <= starClickSlop && (!near || gap < near.gap)) {
                near = { star, gap };
            }
        }
        return covering?.star ?? near?.star ?? null;
    }

    handleClick(event) {
        // In the planetary view, a click on a planet or moon drops a pin there showing its coordinates
        if (this.planetary && this.dropGlobePin(event)) return;
        const star = this.starAt(event);
        if (star) {
            this.infoTarget = star;
            this.emit('target', { star });
        }
    }

    /**
     * The planet or moon of the planetary view drawn at a point, picked the way stars are, so worlds only a few pixels
     * across can still be clicked: { world, moon } with `moon` null for a planet
     */
    worldAt(event) {
        const planetary = this.planetary;
        if (!planetary) return null;
        const rect = this.canvas.getBoundingClientRect();
        const click = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        this.updateTransforms();
        const right = new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 0).normalize();
        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        const project = (point) => {
            const p = point.clone().project(this.camera);
            return { x: (p.x + 1) / 2 * rect.width, y: (1 - p.y) / 2 * rect.height };
        };
        let covering = null, near = null;
        const centre = new THREE.Vector3(), scale = new THREE.Vector3();
        const consider = (body, pick) => {
            if (!body || !visibleInHierarchy(body)) return;
            body.getWorldPosition(centre);
            const depth = centre.clone().sub(this.camera.position).dot(forward);
            if (!(depth > 0)) return;
            // Just the body's own sphere, not its moons or clouds
            body.getWorldScale(scale);
            const radius = (body.userData.radius ?? 0) * scale.x;
            const projected = project(centre);
            const edge = project(centre.clone().addScaledVector(right, radius));
            const screenRadius = Math.hypot(edge.x - projected.x, edge.y - projected.y);
            const gap = Math.hypot(click.x - projected.x, click.y - projected.y) - screenRadius;
            if (gap <= 0) {
                if (!covering || depth < covering.depth) covering = { pick, depth };
            } else if (gap <= starClickSlop && (!near || gap < near.gap)) {
                near = { pick, gap };
            }
        };
        for (const world of planetary.system.worlds) {
            const body = planetary.entities.get(world.designation);
            if (!body) continue;
            consider(body, { world, moon: null });
            for (const moon of world.moons) consider(body.getObjectByName(moon.designation), { world, moon });
        }
        return covering?.pick ?? near?.pick ?? null;
    }

    handleDoubleClick(event) {
        // In the planetary view, double clicking a planet or moon zooms to it, as picking it in the list does
        const picked = this.worldAt(event);
        if (picked) {
            // The pin the first click of the two dropped isn't wanted
            this.removeGlobePin();
            if (picked.moon) this.zoomToMoon(picked.moon, picked.world);
            else this.zoomToPlanet(picked.world);
            return;
        }
        const star = this.starAt(event);
        if (!star) return;
        // Double clicking the focused star toggles the backdrop view of its system
        if (star === this.focusedStar) {
            if (this.backdrop === null) this.showBackdrop(star);
            else this.hideBackdrop();
            return;
        }
        this.hideBackdrop();
        this.updateTransforms();
        const world = star.getWorldPosition(new THREE.Vector3());
        const localPivot = this.fieldNode.worldToLocal(world);
        if (this.focusedStar) this.setPlasmaArcsVisible(false, this.focusedStar);
        this.showPlasmaArcs(star);
        this.focusedStar = star;
        // Turn to face the star, then close in on it to the focus zoom
        this.focusCamera(localPivot, starFocusZoom);
    }

    /** Escape backs out one level: from a planet to its system, then from the system to the star field */
    escape() {
        if (this.backdrop === null) return false;
        if (this.planetary?.selected) this.showWholeSystem();
        else this.hideBackdrop();
        return true;
    }

    // MARK: system search

    /**
     * Systems whose name (or, unnamed, its first star's) contains `query`, those starting with it first, then
     * alphabetically; at most `limit`. Names given by hand are searched in place of generated ones.
     */
    search(query, limit = 8) {
        const fold = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase();
        const renamed = {};
        for (const [id, document] of Object.entries(this.annotations)) {
            const name = document.system?.name;
            if (name) renamed[id] = name;
        }
        const key = JSON.stringify(renamed);
        if (!this.searchNames || this.searchNamesCount !== this.field.systems.length || this.searchRenamed !== key) {
            this.searchNames = [];
            this.field.systems.forEach((system, index) => {
                const name = (system.id && renamed[system.id]) || system.name || system.stars?.[0]?.name;
                if (name) this.searchNames.push({ index, name, folded: fold(name) });
            });
            this.searchNamesCount = this.field.systems.length;
            this.searchRenamed = key;
        }
        const needle = fold(query.trim());
        if (!needle) return [];
        const starting = [], containing = [];
        for (const entry of this.searchNames) {
            if (entry.folded.startsWith(needle)) starting.push(entry);
            else if (containing.length < limit && entry.folded.includes(needle)) containing.push(entry);
        }
        const compare = (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        starting.sort(compare);
        containing.sort(compare);
        return starting.concat(containing).slice(0, limit).map(({ index, name }) => ({ index, name }));
    }

    /** Flies to a system: turns to face it and closes in, then focuses its first star and shows its data */
    goToSystem(index) {
        const target = this.field.systems[index]?.position;
        if (!target) return;
        this.hideBackdrop();
        this.focusCamera(new THREE.Vector3(...target), Math.min(starFocusZoom, stellarMaximumZoom)).then((finished) => {
            if (!finished || this.disposed) return;
            this.refreshStarWindow();
            const star = this.field.shown.get(index)?.find((o) => o.userData.isStar);
            if (!star) return;
            if (this.focusedStar && this.focusedStar !== star) this.setPlasmaArcsVisible(false, this.focusedStar);
            this.showPlasmaArcs(star);
            this.focusedStar = star;
            this.infoTarget = star;
            this.emit('target', { star });
        });
    }

    /**
     * Picks a system straight away, without flying there, as a 2D chart does: the view jumps to it and its first star
     * becomes the one whose data is shown. With `open`, its planetary view opens too.
     */
    selectSystem(index, { open = false } = {}) {
        const target = this.field.systems[index]?.position;
        if (!target) return null;
        this.cameraAnimation?.finish(false);
        if (this.backdrop && !open) this.hideBackdrop();
        this.pivotPoint.set(target[0], target[1], target[2]);
        this.zoomFactor = Math.min(starFocusZoom, stellarMaximumZoom);
        this.updateTransforms();
        this.refreshStarWindow(true);
        const star = this.field.shown.get(index)?.find((o) => o.userData.isStar);
        if (!star) return null;
        if (this.focusedStar && this.focusedStar !== star) this.setPlasmaArcsVisible(false, this.focusedStar);
        this.focusedStar = star;
        this.infoTarget = star;
        this.emit('target', { star });
        this.emitCamera();
        if (open) this.showBackdrop(star);
        return star;
    }

    /** The index of the system with an id, or null */
    systemIndexWithID(id) {
        const index = this.field.systems.findIndex((system) => system.id === id);
        return index >= 0 ? index : null;
    }

    /** A system's name as the GM has it, else its generated name */
    systemName(index) {
        const system = this.field.systems[index];
        if (!system) return '—';
        const generated = system.name ?? `System ${index + 1}`;
        const name = system.id ? this.annotations[system.id]?.system?.name : null;
        return name || generated;
    }

    // MARK: plasma arcs

    showPlasmaArcs(star) {
        let shell = star.getObjectByName(`${star.name}_plasma`);
        if (!shell) {
            const { color, seed } = star.userData.appearance;
            shell = new THREE.Mesh(PS.unitSphere(48), plasmaMaterial(color, seed));
            shell.userData.sharedGeometry = true;
            shell.name = `${star.name}_plasma`;
            shell.scale.setScalar(plasmaShellRatio);
            shell.raycast = () => {};
            shell.renderOrder = 2;
            star.add(shell);
        }
        shell.visible = true;
    }

    setPlasmaArcsVisible(visible, star) {
        const shell = star.getObjectByName(`${star.name}_plasma`);
        if (shell) shell.visible = visible;
    }

    // MARK: zoom limits

    /**
     * Limits a zoom change so no star grows past filling the view, and the camera stays above the cloud tops of the
     * planetary view's planets and moons
     */
    zoomKeepingCameraOutside(current, proposed) {
        if (proposed === current) return proposed;
        const cameraOffset = this.cameraOffset();
        const cameraDistanceSquared = cameraOffset.lengthSq();
        const pivot = this.pivotPoint.clone().add(this.followShift());
        const bodies = [];
        for (const star of this.fieldNode.children) {
            if (!star.userData.isStar || !star.visible) continue;
            bodies.push({ offset: star.position.clone().sub(pivot), radius: star.scale.x * starClearance });
        }
        for (const shade of this.nightShades) {
            const body = shade.parent;
            if (!body || !visibleInHierarchy(body)) continue;
            const radius = shade.userData.worldRadius * scaleInField(body, this.fieldNode);
            bodies.push({ offset: positionInField(body, this.fieldNode).sub(pivot), radius: radius * planetClearance });
        }
        let zoom = proposed;
        const margin = 0.998;
        for (const { offset, radius } of bodies) {
            const a = offset.lengthSq() - radius * radius;
            const b = -2 * offset.dot(cameraOffset);
            const c = cameraDistanceSquared;
            const discriminant = b * b - 4 * a * c;
            if (!(discriminant >= 0) || !(Math.abs(a) > 1.1920929e-7)) continue;
            const roots = [(-b - Math.sqrt(discriminant)) / (2 * a), (-b + Math.sqrt(discriminant)) / (2 * a)];
            if (a < 0) {
                const positive = roots.filter((r) => r > 0);
                if (!positive.length) continue;
                zoom = Math.min(zoom, Math.min(...positive) * margin);
            } else {
                const enter = Math.min(...roots), exit = Math.max(...roots);
                if (!(enter > 0)) continue;
                if (zoom > enter * margin && zoom < exit / margin) {
                    zoom = current <= (enter + exit) / 2 ? enter * margin : exit / margin;
                }
            }
        }
        return zoom;
    }

    cameraOffset(azimuth = this.rotAngleY, elevation = this.rotAngleX) {
        const a = azimuth * Math.PI / 180;
        const e = elevation * Math.PI / 180;
        return new THREE.Vector3(cameraDistance * Math.cos(e) * Math.sin(a), cameraDistance * Math.sin(e),
            cameraDistance * Math.cos(e) * Math.cos(a));
    }

    // MARK: following a planet or moon

    /** How far the followed body has moved since following began, in the star field's space */
    followShift() {
        const follow = this.follow;
        if (!follow || !follow.body.parent) return new THREE.Vector3();
        return positionInField(follow.body, this.fieldNode).sub(follow.origin);
    }

    /** Keeps `body` under the camera from now on, however time runs */
    followBody(body) {
        this.stopFollowing();
        this.follow = { body, origin: positionInField(body, this.fieldNode) };
    }

    /** Stops following without the view moving: the distance the body travelled is taken into the pivot */
    stopFollowing() {
        if (!this.follow) return;
        const shift = this.followShift();
        this.follow = null;
        this.pivotPoint.add(shift);
    }

    // MARK: frame

    updateTransforms() {
        const p = this.pivotPoint.clone();
        const s = this.followShift();
        const z = this.zoomFactor;
        // T(pivot) · S(zoom) · T(−pivot − shift), so a followed body stays at the pivot it was picked at
        this.fieldNode.matrix.set(z, 0, 0, p.x - z * (p.x + s.x), 0, z, 0, p.y - z * (p.y + s.y), 0, 0, z, p.z - z * (p.z + s.z), 0, 0, 0, 1);
        this.fieldNode.matrixWorldNeedsUpdate = true;
        this.camera.position.copy(this.cameraOffset()).add(p);
        this.camera.lookAt(p);
        if (this.backdrop) this.backdrop.container.position.copy(this.camera.position);
        this.scene.updateMatrixWorld();
        this.fitDepthRange();
    }

    /**
     * Keeps the near clipping plane as far out as it can go without cutting into the nearest planet, moon or star.
     * The depth buffer's precision depends on it: with it too close, a world's night side shell and its surface just
     * beneath can't be told apart and the surface shows through in speckles.
     */
    fitDepthRange() {
        const camera = this.camera.position;
        const centre = new THREE.Vector3(), scale = new THREE.Vector3();
        let nearest = Infinity;
        const consider = (object, radius) => {
            if (!visibleInHierarchy(object)) return;
            object.getWorldPosition(centre);
            object.getWorldScale(scale);
            nearest = Math.min(nearest, centre.distanceTo(camera) - radius * scale.x * 1.1);
        };
        for (const shade of this.nightShades) if (shade.parent) consider(shade.parent, shade.userData.worldRadius * (1 + NightShade.altitude));
        for (const star of this.fieldNode.children) if (star.userData.isStar) consider(star, plasmaShellRatio);
        for (const star of this.movedStars) consider(star, plasmaShellRatio);
        const near = Math.min(Math.max(nearest * 0.5, 0.0005), 1);
        if (Math.abs(near - this.camera.near) > this.camera.near * 0.05) {
            this.camera.near = near;
            this.camera.updateProjectionMatrix();
        }
    }

    frame(now) {
        if (this.disposed) return;
        const seconds = Math.min((now - this.lastFrame) / 1000, 0.25);
        this.lastFrame = now;
        shaderClock.timeUniform.value = now / 1000;
        SimulationClock.advance(seconds);
        // The weather follows the simulation clock, but no faster than two simulated days a second
        const weatherRate = Math.min(Math.max(SimulationClock.rate, -WeatherClock.maximumRate), WeatherClock.maximumRate);
        if (weatherRate !== 0) {
            WeatherClock.days += seconds * weatherRate / 86400;
            weatherTime.value = WeatherClock.time;
        }
        // Traffic runs in real time while the simulation does, and stops when it's paused
        if (SimulationClock.rate !== 0 && this.traffic?.length) WorldTraffic.updateTraffic(this.traffic, seconds);
        for (const spinner of this.spinners) {
            if (!spinner.parent) { this.spinners.delete(spinner); continue; }
            spinner.rotation.y = (now / 1000 / spinner.userData.spinPeriod) % 1 * 2 * Math.PI;
        }
        if (SimulationClock.rate !== 0) this.updateOrbits();
        this.stepTweens(now);
        this.stepCameraAnimation(now);
        this.stepFlight(seconds);
        // Covered by a 2D chart while no system is open: nothing to draw
        if (this.coveredByChart && !this.backdrop) {
            requestAnimationFrame(this.frame);
            return;
        }
        this.updateTransforms();
        NightShade.updateNightShades(this.nightShades, this.cityLights);
        this.updateBillboards(now);
        this.renderer.render(this.scene, this.camera);
        this.updateGlobePinLabel();
        requestAnimationFrame(this.frame);
    }

    updateOrbits() {
        for (const group of this.planetGroups) {
            group.traverse((object) => {
                const orbit = object.userData.orbit;
                if (orbit && !this.tweens.has(object)) orbit.currentPosition(object.position);
                object.userData.spin?.currentOrientation(object.quaternion);
            });
        }
    }

    /** Filter rings and route markers face the camera; route dashes march and reach rings turn */
    updateBillboards(now) {
        const facing = this.camera.quaternion;
        if (this.backdrop === null) {
            for (const objects of this.field.shown.values()) {
                for (const star of objects) {
                    if (!star.userData.isStar) continue;
                    for (const halo of star.children) {
                        if (!halo.visible || !halo.userData.filter) continue;
                        // The star is never turned, so facing the camera in the world is the same in its space
                        halo.quaternion.copy(facing);
                        halo.scale.setScalar(halo.userData.haloScale / star.scale.x);
                    }
                }
            }
        }
        const seconds = now / 1000;
        for (const object of this.routeObjects) {
            if (object.userData.billboard) object.quaternion.copy(facing);
            const dashes = object.userData.dashes;
            if (dashes) dashes.position.y = (seconds % routeDashMarchPeriod) / routeDashMarchPeriod * 2 / object.userData.count;
            const spinner = object.userData.spinner;
            if (spinner) spinner.rotation.z = (seconds % reachDashSpinPeriod) / reachDashSpinPeriod * 2 * Math.PI / reachDashPairs;
        }
    }

    /** Moves an object to a local position and scale over the backdrop transition, replacing any move under way */
    move(object, position, scale, onDone) {
        this.tweens.set(object, {
            start: performance.now(), fromPosition: object.position.clone(), toPosition: position.clone(),
            fromScale: object.scale.clone(), toScale: scale.clone(), onDone,
        });
    }

    stepTweens(now) {
        for (const [object, tween] of this.tweens) {
            const t = Math.min((now - tween.start) / (backdropDuration * 1000), 1);
            const eased = easeInOut(t);
            object.position.lerpVectors(tween.fromPosition, tween.toPosition, eased);
            object.scale.lerpVectors(tween.fromScale, tween.toScale, eased);
            if (t >= 1) {
                this.tweens.delete(object);
                tween.onDone?.();
            }
        }
    }

    /** Eases the camera's elevation, pivot and zoom to new values; values left out aren't touched */
    animateCamera({ elevation = null, pivot = null, zoom }) {
        this.cameraAnimation?.finish(false);
        const startElevation = this.rotAngleX, startPivot = this.pivotPoint.clone();
        const startZoom = Math.log(this.zoomFactor), endZoom = Math.log(zoom);
        const start = performance.now();
        return this.runCameraAnimation((now, animation) => {
            const t = Math.min((now - start) / (backdropDuration * 1000), 1);
            const eased = smooth(t);
            if (elevation !== null) this.rotAngleX = startElevation + (elevation - startElevation) * eased;
            if (pivot) this.pivotPoint.lerpVectors(startPivot, pivot, eased);
            if (!animation.zoomOverridden) this.zoomFactor = Math.exp(startZoom + (endZoom - startZoom) * eased);
            return t >= 1;
        });
    }

    /**
     * Turns the camera where it stands until `target` (in the star field's space) is in the middle of the view, then
     * closes in on it along the line of sight as the zoom changes to `zoom`
     */
    focusCamera(target, zoom) {
        this.cameraAnimation?.finish(false);
        const scale = Math.max(this.zoomFactor, 0.0001);
        const camera = this.pivotPoint.clone().add(this.cameraOffset().divideScalar(scale));
        const toTarget = target.clone().sub(camera);
        if (toTarget.length() <= 1e-6) return this.animateCamera({ pivot: target, zoom });
        const away = toTarget.clone().normalize().negate();
        const endElevation = Math.min(Math.max(Math.asin(Math.min(Math.max(away.y, -1), 1)) * 180 / Math.PI, -89), 89);
        const endAzimuth = Math.atan2(away.x, away.z) * 180 / Math.PI;
        const startAzimuth = this.rotAngleY, startElevation = this.rotAngleX;
        let turn = (endAzimuth - startAzimuth) % 360;
        if (turn > 180) turn -= 360;
        if (turn < -180) turn += 360;
        const rise = endElevation - startElevation;
        const angle = Math.max(Math.abs(turn), Math.abs(rise));
        const turnDuration = angle < 1 ? 0 : 0.3 + 0.35 * angle / 180;
        const ahead = toTarget.clone().normalize();
        const startZoom = Math.log(this.zoomFactor), endZoom = Math.log(zoom);
        const startDistance = Math.log(toTarget.length());
        const endDistance = Math.log(cameraDistance / Math.max(zoom, 0.0001));
        const start = performance.now();
        return this.runCameraAnimation((now) => {
            const elapsed = (now - start) / 1000;
            if (elapsed < turnDuration) {
                const eased = smooth(Math.min(elapsed / turnDuration, 1));
                this.rotAngleY = startAzimuth + turn * eased;
                this.rotAngleX = startElevation + rise * eased;
                this.pivotPoint.copy(camera).sub(this.cameraOffset().divideScalar(scale));
                return false;
            }
            if (turnDuration > 0 && this.rotAngleY !== (startAzimuth + turn) % 360) {
                this.rotAngleY = (startAzimuth + turn) % 360;
                this.rotAngleX = startElevation + rise;
            }
            const t = Math.min((elapsed - turnDuration) / backdropDuration, 1);
            const eased = smooth(t);
            const zoomNow = Math.exp(startZoom + (endZoom - startZoom) * eased);
            const distance = Math.exp(startDistance + (endDistance - startDistance) * eased);
            const cameraNow = target.clone().addScaledVector(ahead, -distance);
            this.pivotPoint.copy(cameraNow).addScaledVector(ahead, cameraDistance / zoomNow);
            this.zoomFactor = zoomNow;
            if (t >= 1) {
                this.pivotPoint.copy(target);
                return true;
            }
            return false;
        });
    }

    /** Runs a camera animation step each frame until it says it's done; resolves true if it finished, false if not */
    runCameraAnimation(step) {
        let resolve;
        const promise = new Promise((r) => { resolve = r; });
        const animation = {
            step, zoomOverridden: false, promise,
            finish: (finished) => {
                if (this.cameraAnimation === animation) this.cameraAnimation = null;
                resolve(finished);
            },
        };
        this.cameraAnimation = animation;
        return promise;
    }

    stepCameraAnimation(now) {
        const animation = this.cameraAnimation;
        if (!animation) return;
        const done = animation.step(now, animation);
        this.zoomChanged();
        this.pivotMoved();
        if (done) animation.finish(true);
    }

    later(seconds, action) {
        const timer = setTimeout(() => {
            this.pending = this.pending.filter((p) => p !== timer);
            if (!this.disposed) action();
        }, seconds * 1000);
        this.pending.push(timer);
    }

    // MARK: backdrop

    /** Shrinks every star outside the focused star's system to a point on a distant backdrop */
    showBackdrop(focused) {
        this.updateTransforms();
        const center = focused.position.clone();
        const systemID = focused.userData.data.estrela.systemID;
        const container = new THREE.Group();
        container.name = 'backdrop';
        container.position.copy(this.camera.position);
        this.scene.add(container);
        container.updateMatrixWorld();

        const pairs = [];
        for (const star of this.fieldNode.children.filter((s) => s.userData.isStar)) {
            if (star === focused) continue;
            if (systemID && star.userData.data.estrela.systemID === systemID) continue;
            const offset = star.position.clone().sub(center);
            // A charted universe lies flat, which would leave every point on one line round the sky: each system
            // there is lifted above or below the plane by its own amount, as stars are in real space
            if (this.isCharted) offset.y += backdropLift(star.userData.data.estrela.systemID, offset.length());
            const distance = offset.length();
            const direction = distance > 0 ? offset.divideScalar(distance) : new THREE.Vector3(0, 1, 0);
            const point = new THREE.Mesh(PS.unitSphere(16), unlit(star.userData.appearance.color, { transparent: true, opacity: 0 }));
            point.userData.sharedGeometry = true;
            // Straight at its place on the backdrop, which stays hidden until the camera has flown in (below), so the
            // points never sweep across the view on their way there
            point.position.copy(direction.multiplyScalar(backdropRadius));
            point.scale.setScalar(backdropPointRadius);
            point.raycast = () => {};
            container.add(point);
            star.visible = false;
            pairs.push({ star, point });
        }
        this.backdropStars = pairs;
        const backdrop = { container };
        this.backdrop = backdrop;
        this.fieldOrbitRings.forEach((ring) => { ring.visible = false; });
        if (this.field.dots) this.field.dots.visible = false;
        this.updateFilterHighlights();
        this.showPlanets(focused);
        // Once the camera has settled on the system, the backdrop fades in where it will stay
        const flight = this.cameraAnimation?.promise ?? Promise.resolve();
        flight.then(() => {
            const start = performance.now();
            const fade = (now) => {
                if (this.backdrop !== backdrop || this.disposed) return;
                const opacity = Math.min((now - start) / (backdropFadeDuration * 1000), 1);
                for (const { point } of pairs) point.material.opacity = opacity;
                if (opacity < 1) requestAnimationFrame(fade);
                else for (const { point } of pairs) point.material.transparent = false;
            };
            requestAnimationFrame(fade);
        });
    }

    /** Grows the backdrop points back into their stars and removes the backdrop */
    hideBackdrop() {
        const backdrop = this.backdrop;
        if (!backdrop) return;
        this.updateTransforms();
        for (const { star, point } of this.backdropStars) {
            // Seen in full as the points go back to their stars, even if they hadn't finished fading in
            point.material.opacity = 1;
            point.material.transparent = false;
            const target = backdrop.container.worldToLocal(star.getWorldPosition(new THREE.Vector3()));
            this.move(point, target, new THREE.Vector3().setScalar(star.scale.x * this.zoomFactor));
        }
        const stars = this.backdropStars.map((p) => p.star);
        this.backdrop = null;
        this.backdropStars = [];
        this.hidePlanets();
        this.later(backdropDuration, () => {
            if (this.backdrop === null) {
                stars.forEach((star) => { star.visible = true; });
                this.fieldOrbitRings.forEach((ring) => { ring.visible = this.showStarOrbitRings; });
                if (this.field.dots) this.field.dots.visible = true;
                this.updateZoomScaledMeshes();
                this.updateFilterHighlights();
                // Sectors brought in or left behind while the planetary view was open
                if (this.field.isStale) this.refreshStarWindow(true);
            }
            this.scene.remove(backdrop.container);
            backdrop.container.traverse((o) => o.material?.dispose());
        });
    }

    // MARK: planetary view

    /** Adds the focused system's orbit rings and planets, grouped by the star(s) they orbit */
    showPlanets(focused) {
        const data = focused.userData.data;
        const system = data.planetarySystem;
        if (!system) return;
        const entities = new Map();
        for (const star of this.fieldNode.children) {
            if (!star.userData.isStar) continue;
            const estrela = star.userData.data.estrela;
            if (estrela.systemID === data.estrela.systemID && estrela.id) entities.set(estrela.id, star);
        }
        const radius = (info) => entities.get(info.estrelaID)?.userData.appearance.radius ?? 0.05;
        const letter = (designation) => designation.slice(0, 1);

        const groups = system.stars.filter((s) => s.role !== 'companion').map((head) => ({
            head, companion: system.stars.find((s) => s.role === 'companion' && letter(s.designation) === letter(head.designation)),
        }));
        if (groups.length === 0) return;
        const clearance = (head, companion) => (radius(head) + (companion ? radius(companion) : 0)) * 1.3 + 0.02;

        const worldsByGroup = new Map();
        for (const world of system.worlds) {
            const key = world.parentLabel === '' || world.parentLabel.startsWith('A') ? 'A' : letter(world.parentLabel);
            if (!worldsByGroup.has(key)) worldsByGroup.set(key, []);
            worldsByGroup.get(key).push(world);
        }
        const primaryMapping = new PS.OrbitSceneMapping(clearance(groups[0].head, groups[0].companion));
        const primaryWorlds = worldsByGroup.get('A') ?? [];

        const bands = groups.slice(1).map((group) => {
            const reach = group.companion ? group.companion.au * (1 + group.companion.eccentricity) : 0;
            const nearest = primaryMapping.distance(Math.max(group.head.au * (1 - group.head.eccentricity) - reach, 0));
            const farthest = primaryMapping.distance(group.head.au * (1 + group.head.eccentricity) + reach);
            return [nearest, Math.max(farthest, nearest)];
        });

        const room = (index) => {
            const band = bands[index];
            const inners = primaryWorlds.map((w) => primaryMapping.distance(w.au * (1 + w.eccentricity))).filter((d) => d < band[0]);
            const outers = primaryWorlds.map((w) => primaryMapping.distance(w.au * (1 - w.eccentricity))).filter((d) => d > band[1]);
            const inner = inners.length ? Math.max(...inners) : primaryMapping.clearance;
            const outer = outers.length ? Math.min(...outers) : Infinity;
            let space = Math.min(band[0] - inner, outer - band[1]);
            bands.forEach((otherBand, other) => {
                if (other === index) return;
                const gap = otherBand[0] > band[1] ? otherBand[0] - band[1] : band[0] - otherBand[1];
                space = Math.min(space, gap / 2);
            });
            return Math.max(space * 0.8, 0.05);
        };

        const place = (info, pivot, elements, rings) => {
            const star = entities.get(info.estrelaID);
            if (!star) return;
            if (!this.fieldLayout.has(star)) this.fieldLayout.set(star, { position: star.position.clone() });
            pivot.attach(star);
            const target = elements ? new Orbit(elements).currentPosition(new THREE.Vector3()) : new THREE.Vector3();
            // The planetary layout leaves room for each star at its own size, so enlarged stars shrink back
            this.move(star, target, new THREE.Vector3().setScalar(star.userData.appearance.radius));
            if (elements) rings.add(PS.stellarOrbitRing(elements, star.userData.appearance.color));
            this.movedStars.push(star);
        };

        const center = new THREE.Vector3(...data.systemCenter);
        let primaryContainer = null;
        let extent = Math.max(primaryMapping.clearance, PS.outerRadius(primaryWorlds, primaryMapping));
        const planetEntities = new Map();

        groups.forEach((group, index) => {
            const groupLetter = letter(group.head.designation);
            const worlds = worldsByGroup.get(index === 0 ? 'A' : groupLetter) ?? [];
            const pivot = new THREE.Group();
            pivot.name = `system_${groupLetter}`;
            this.fieldNode.add(pivot);

            let mapping = new PS.OrbitSceneMapping(clearance(group.head, group.companion));
            if (index === 0) {
                pivot.position.copy(center);
                mapping = primaryMapping;
            } else {
                const elements = PS.starOrbit(group.head, primaryMapping);
                new Orbit(elements, data.systemCenter).currentPosition(pivot.position);
                const color = entities.get(group.head.estrelaID)?.userData.appearance.color;
                if (primaryContainer && color) primaryContainer.add(PS.stellarOrbitRing(elements, color));
                const pairReach = group.companion ? mapping.distance(group.companion.au * (1 + group.companion.eccentricity)) : mapping.clearance;
                const natural = Math.max(PS.outerRadius(worlds, mapping), pairReach);
                const space = room(index - 1);
                if (natural > space) {
                    const orbitSpan = (natural - mapping.clearance) / mapping.scale;
                    mapping.scale = Math.max((space - mapping.clearance) / Math.max(orbitSpan, 0.01), 0.005);
                }
                const reach = Math.max(PS.outerRadius(worlds, mapping),
                    group.companion ? mapping.distance(group.companion.au * (1 + group.companion.eccentricity)) : mapping.clearance);
                extent = Math.max(extent, bands[index - 1][1] + reach);
            }

            const container = new THREE.Group();
            container.name = `planets_${groupLetter}`;
            pivot.add(container);
            if (index === 0) primaryContainer = container;
            this.fieldNode.updateMatrixWorld(true);

            if (group.companion) {
                const orbits = PS.pairOrbits(group.head, group.companion, mapping);
                place(group.head, pivot, orbits.head, container);
                place(group.companion, pivot, orbits.companion, container);
            } else {
                place(group.head, pivot, null, container);
            }

            for (const [designation, body] of PS.addWorlds(worlds, container, mapping)) planetEntities.set(designation, body);
            const luminosity = group.head.luminosity + (group.companion?.luminosity ?? 0);
            const zone = PS.habitableZoneEntity(luminosity, mapping);
            if (zone) container.add(zone);
            container.scale.setScalar(0.001);
            this.move(container, new THREE.Vector3(), new THREE.Vector3(1, 1, 1));
            this.planetGroups.push(pivot);
        });

        if (this.zoomBeforePlanetaryView === null) this.zoomBeforePlanetaryView = this.zoomFactor;
        const visibleRadius = cameraDistance * Math.tan(cameraFieldOfView / 2 * Math.PI / 180);
        const fittedZoom = Math.min(Math.max(planetaryViewFill * visibleRadius / Math.max(extent, 0.01), 0.1), 20);
        this.animateCamera({ elevation: Math.abs(this.rotAngleX) < 10 ? 25 : this.rotAngleX, pivot: center, zoom: fittedZoom });

        const primary = entities.get(groups[0].head.estrelaID);
        this.planetary = {
            system, name: data.systemName ?? data.estrela.name ?? 'System', systemID: data.estrela.systemID ?? '',
            primaryStarName: primary?.userData.data.estrela.name ?? null, primaryStarID: groups[0].head.estrelaID ?? null,
            entities: planetEntities, selected: null, systemViewPivot: center, systemViewZoom: fittedZoom,
            mapped: new Set(), cloudShells: [], globes: new Map(), queue: new SurfaceQueue(fullGlobesAtOnce), previewQueue: new SurfaceQueue(previewGlobesAtOnce), surfaces: new Map(),
            globeTests: new Map(),
        };
        if (!this.showOrbits) this.setOrbitPathsVisible(false);
        this.setHabitableZonesVisible(true);
        this.addNightShades(system.worlds, this.movedStars);
        this.refreshCityLights();
        this.refreshTraffic();
        this.updateZoomScaledMeshes();
        // Every world's surface, without waiting for it to be zoomed to
        this.applySurfaceMaps(system.worlds);
        this.emit('planetary', this.planetary);
    }

    updateZoomScaledMeshes() {
        PS.updateZoomScale([...this.fieldOrbitRings, ...this.planetGroups], this.zoomFactor);
    }

    /** Gives every planet and moon among `worlds` a night side shell, lit by the nearest of `stars` */
    addNightShades(worlds, stars) {
        if (!stars.length) return;
        // `planetShade` is the night side shell of the planet a moon goes round, whose light it catches as planetshine
        const addShade = (body, planetShade = null) => {
            if (!body || body.children.some((c) => c.name === NightShade.name)) return;
            const shell = NightShade.shell(Math.max(body.userData.radius ?? 0, 0.0001), stars, planetShade);
            shell.visible = this.showNightSides;
            body.add(shell);
            this.nightShades.push(shell);
        };
        for (const world of worlds) {
            const body = this.planetary.entities.get(world.designation);
            if (!body) continue;
            addShade(body);
            const planetShade = body.children.find((c) => c.name === NightShade.name) ?? null;
            for (const moon of world.moons) addShade(body.getObjectByName(moon.designation), planetShade);
        }
    }

    /** The planetary view's planet with the given designation, or a moon with its own globe as a world of its own */
    surfaceWorld(designation) {
        for (const world of this.planetary?.system.worlds ?? []) {
            if (world.designation === designation) return world;
            const moon = world.moons.find((m) => m.designation === designation);
            if (moon && SurfaceMap.isWorldlike(moon, world)) return SurfaceMap.worldlike(world, moon);
        }
        return null;
    }

    /**
     * Where a world's globe, as drawn, is water, and how high its ground stands, once its globe is drawn; until then the
     * sea its noise puts there and no relief
     */
    globeTests(designation) {
        const planetary = this.planetary;
        const cached = planetary?.globeTests.get(designation);
        if (cached) return cached;
        const surface = planetary?.surfaces.get(designation);
        const target = planetary?.globes.get(designation);
        if (!surface || !target) return { isWater: NightShade.seaTest(this.surfaceWorld(designation)), relief: null };
        const tests = { isWater: waterTest(surface, target.style), relief: reliefTest(surface) };
        planetary.globeTests.set(designation, tests);
        return tests;
    }

    /**
     * Lights for every settlement mapped on the planetary view's worlds and their moons, and their streets and fields by
     * day, replacing any drawn before
     */
    refreshCityLights() {
        for (const object of [...this.cityLights, ...(this.cityGrounds ?? [])]) {
            object.removeFromParent();
            if (object.userData.ownsGeometry) object.geometry.dispose();
            object.material.dispose();
        }
        this.cityLights = [];
        this.cityGrounds = [];
        const generation = (this.cityGroundGeneration = (this.cityGroundGeneration ?? 0) + 1);
        const planetary = this.planetary;
        const worlds = planetary ? this.annotations[planetary.systemID]?.worlds : null;
        if (!worlds) return;
        const jobs = [];
        for (const shade of this.nightShades) {
            const body = shade.parent;
            const places = body ? worlds[body.name]?.places : null;
            if (!places?.length) continue;
            // An era set by hand lights the cities as it would
            const era = worlds[body.name]?.overrides?.techEra ?? (() => {
                for (const world of planetary.system.worlds) {
                    if (world.designation === body.name) return world.social?.techEra;
                    const moon = world.moons.find((m) => m.designation === body.name);
                    if (moon) return moon.social?.techEra;
                }
                return undefined;
            })() ?? 'information';
            const settlements = places.filter((place) => settlementKinds.has(place.kind));
            if (!settlements.length) continue;
            // The globe's own water and relief once it's drawn, or the sea its noise puts there until then
            const { isWater, relief } = this.globeTests(body.name);
            const surfaceWorld = this.surfaceWorld(body.name);
            const style = surfaceWorld ? SurfaceMap.styleFor(surfaceWorld) : null;
            const radius = shade.userData.worldRadius;
            for (const place of settlements) {
                const light = NightShade.cityLight({
                    latitude: place.latitude, longitude: place.longitude, kind: place.kind, era, placeID: place.id,
                    worldRadius: radius, stars: shade.userData.nightShade.stars, isWater, relief,
                });
                if (!light) continue;
                light.visible = this.showNightSides;
                body.add(light);
                this.cityLights.push(light);
                jobs.push({ body, place, era, radius, isWater, relief, style });
            }
        }
        // Their streets and fields by day, laid out as their lights are and over the lie of the land, each put on its
        // world as soon as it's drawn
        (async () => {
            for (const job of jobs) {
                const { place } = job;
                const key = `${place.id}/${place.kind}/${job.era}/${place.latitude}/${place.longitude}`;
                let pixels = null;
                if (!NightShade.hasCityGround(key)) {
                    try {
                        pixels = await drawCityGround({
                            seed: cityLightSeed(place.id).toString(), kind: place.kind, era: job.era,
                            isElectric: eraRank(job.era) >= eraRank('electrical'), latitude: place.latitude,
                            longitude: place.longitude, style: job.style && job.style.kind === 'rocky' ? job.style : null,
                        });
                    } catch (error) {
                        console.warn('City ground failed', error);
                        continue;
                    }
                }
                if (this.cityGroundGeneration !== generation || this.disposed || !job.body.parent) return;
                const ground = NightShade.cityGround({ latitude: place.latitude, longitude: place.longitude, kind: place.kind,
                    key, pixels, worldRadius: job.radius, isWater: job.isWater, relief: job.relief });
                if (!ground) continue;
                job.body.add(ground);
                this.cityGrounds.push(ground);
            }
        })();
    }

    /**
     * Ships, aircraft and spacecraft for every settled planet and moon in the planetary view, as its era allows,
     * replacing any made before. They go on each world with a night side shell, which gives its radius.
     */
    refreshTraffic() {
        for (const vessel of this.traffic ?? []) vessel.removeFromParent();
        this.traffic = [];
        const planetary = this.planetary;
        if (!planetary) return;
        const worlds = this.annotations[planetary.systemID]?.worlds ?? {};
        for (const shade of this.nightShades) {
            const body = shade.parent;
            if (!body) continue;
            let source = null;
            for (const world of planetary.system.worlds) {
                if (world.designation === body.name) source = world;
                const moon = world.moons.find((m) => m.designation === body.name);
                if (moon) source = moon;
                if (source) break;
            }
            if (!source?.social) continue;
            // Numbers and an era set by hand change the traffic as they would
            const social = applyingAnnotations(source, worlds[body.name]).social;
            const seed = SurfaceMap.stableHash(body.name + '/traffic');
            const radius = shade.userData.worldRadius;
            // Starships calling at the world go in its moons' frame, which doesn't turn with it
            const frame = body.children.find((c) => c.name === `${body.name}_moons`) ?? body;
            for (const starship of WorldTraffic.starships({ weeklyArrivals: social.port?.weeklyArrivals ?? 0, seed }, radius)) {
                frame.add(starship);
                this.traffic.push(starship);
            }
            const era = social.techEra;
            if (!era || !(social.population > 0)) continue;
            const sites = (worlds[body.name]?.places ?? []).filter((p) => settlementKinds.has(p.kind)).map((p) =>
                new THREE.Vector3(...SurfaceMap.spherePoint(p.latitude * Math.PI / 180, p.longitude * Math.PI / 180)));
            const setting = { era, population: social.population, port: social.port?.tier ?? 'none', sites,
                isWater: NightShade.seaTest(this.surfaceWorld(body.name)), seed };
            for (const vessel of WorldTraffic.vessels(setting, radius)) {
                body.add(vessel);
                this.traffic.push(vessel);
            }
        }
    }

    /** Shrinks the planetary system away and returns its stars to the star field */
    hidePlanets() {
        const wasPlanetary = this.planetary !== null;
        // Surfaces still waiting to be drawn are for worlds no longer shown
        this.planetary?.queue.clear();
        this.planetary?.previewQueue?.clear();
        this.planetary = null;
        this.refreshResolvingStatus();
        this.nightShades = [];
        this.cityLights = [];
        this.cityGrounds = [];
        this.cityGroundGeneration = (this.cityGroundGeneration ?? 0) + 1;
        this.traffic = [];
        this.globeWeather = null;
        this.removeGlobePin();
        this.stopFollowing();
        if (this.zoomBeforePlanetaryView !== null) {
            const zoom = this.zoomBeforePlanetaryView;
            this.zoomBeforePlanetaryView = null;
            this.animateCamera({ zoom });
        }
        const stars = this.movedStars;
        this.movedStars = [];
        for (const star of stars) {
            this.fieldNode.attach(star);
            const target = this.fieldLayout.get(star)?.position ?? star.position.clone();
            this.move(star, target, new THREE.Vector3().setScalar(star.userData.appearance.radius * this.starFieldScale));
        }
        const groups = this.planetGroups;
        this.planetGroups = [];
        for (const pivot of groups) {
            for (const container of pivot.children.filter((c) => c.name.startsWith('planets_'))) {
                this.move(container, container.position.clone(), new THREE.Vector3().setScalar(0.001));
            }
        }
        this.later(backdropDuration, () => {
            for (const star of stars) if (star.parent === this.fieldNode) this.fieldLayout.delete(star);
            for (const pivot of groups) {
                for (const child of [...pivot.children]) if (child.userData.isStar) this.fieldNode.attach(child);
                this.fieldNode.remove(pivot);
                pivot.traverse((o) => {
                    if (o.userData.isStar) return;
                    disposeObject(o, false);
                });
            }
        });
        if (wasPlanetary) {
            this.refreshGlobeWeather();
            this.emit('planetary', null);
        }
    }

    /** Zooms the camera to one planet, and keeps it there as it goes round its orbit */
    zoomToPlanet(world) {
        const body = this.planetary?.entities.get(world.designation);
        if (!body) return;
        this.followBody(body);
        this.planetary.selected = world.designation;
        this.refreshGlobeWeather();
        // Its surfaces jump the queue, if they're still waiting
        this.planetary.queue.moveToFront(world.designation);
        this.planetary.previewQueue.moveToFront(world.designation);
        this.refreshResolvingStatus();
        this.applySurfaceMap(body, world);
        // Its globe at the chosen resolution, and the world zoomed to before back at standard
        this.updateGlobeResolutions();
        // A planet in the habitable zone sits inside the green band, which would tint the close-up view
        this.setHabitableZonesVisible(!world.inHabitableZone);
        this.zoomCamera(body);
        this.emit('planetary', this.planetary);
    }

    /** Zooms the camera to one of a planet's moons, and keeps it there as it goes round */
    zoomToMoon(moon, world) {
        const planet = this.planetary?.entities.get(world.designation);
        const body = planet?.getObjectByName(moon.designation);
        if (!body) return;
        this.followBody(body);
        this.planetary.selected = moon.designation;
        this.refreshGlobeWeather();
        // The planet's surface comes with its moons' surfaces, which jump the queue with it if they're still waiting
        this.planetary.queue.moveToFront(world.designation);
        this.planetary.previewQueue.moveToFront(world.designation);
        this.refreshResolvingStatus();
        this.applySurfaceMap(planet, world);
        this.updateGlobeResolutions();
        this.setHabitableZonesVisible(!world.inHabitableZone);
        this.zoomCamera(body);
        this.emit('planetary', this.planetary);
    }

    /** Centres the camera on a planet or moon and zooms until it fills part of the view */
    zoomCamera(body) {
        const target = positionInField(body, this.fieldNode);
        // At the size it's growing to, if the planetary view is still opening
        let scale = 1;
        for (let o = body; o && o !== this.fieldNode; o = o.parent) scale *= (this.tweens.get(o)?.toScale ?? o.scale).x;
        const radius = Math.max(body.userData.radius * scale, 0.0001);
        const visibleRadius = cameraDistance * Math.tan(cameraFieldOfView / 2 * Math.PI / 180);
        const zoom = Math.min(Math.max(planetViewFill * visibleRadius / radius, minimumZoom), maximumZoom);
        this.animateCamera({ pivot: target, zoom });
    }

    /** Returns from a planet to the whole planetary system */
    showWholeSystem() {
        if (!this.planetary?.selected) return;
        this.planetary.selected = null;
        this.refreshResolvingStatus();
        this.refreshGlobeWeather();
        // Every globe back at standard
        this.updateGlobeResolutions();
        this.stopFollowing();
        this.setHabitableZonesVisible(true);
        this.animateCamera({ pivot: this.planetary.systemViewPivot, zoom: this.planetary.systemViewZoom });
        this.emit('planetary', this.planetary);
    }

    // MARK: globe pins

    /** Drops a pin where a click falls on the nearest planet or moon; false if the click missed every world */
    dropGlobePin(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.updateTransforms();
        const ray = this.rayThrough({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        if (!ray) return false;
        let nearest = null;
        const centre = new THREE.Vector3(), scale = new THREE.Vector3();
        for (const shade of this.nightShades) {
            const body = shade.parent;
            if (!body || !visibleInHierarchy(body)) continue;
            const radius = shade.userData.worldRadius;
            body.getWorldScale(scale);
            const worldRadius = radius * scale.x;
            body.getWorldPosition(centre);
            const toOrigin = ray.origin.clone().sub(centre);
            const b = ray.direction.dot(toOrigin);
            const c = toOrigin.lengthSq() - worldRadius * worldRadius;
            const discriminant = b * b - c;
            if (discriminant < 0) continue;
            const distance = -b - Math.sqrt(discriminant);
            if (distance > 0 && (!nearest || distance < nearest.distance)) nearest = { body, radius, distance };
        }
        if (!nearest) return false;
        const hit = nearest.body.worldToLocal(ray.origin.clone().addScaledVector(ray.direction, nearest.distance));
        const up = hit.normalize();
        // As latitude and longitude the way the maps give them
        const [latitudeRadians, longitudeRadians] = SurfaceMap.coordinate(up.x, up.y, up.z);
        const latitude = latitudeRadians * 180 / Math.PI;
        const longitude = longitudeRadians * 180 / Math.PI;

        this.removeGlobePin();
        const radius = nearest.radius;
        const material = unlit(new THREE.Color(1, 0.23, 0.19));
        const marker = new THREE.Group();
        marker.name = 'globe_pin';
        marker.position.copy(up).multiplyScalar(radius);
        marker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
        const stemHeight = radius * 0.12;
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.005, radius * 0.005, stemHeight, 12), material);
        stem.position.y = stemHeight / 2;
        const head = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.02, 16, 8), material);
        head.position.y = stemHeight;
        marker.add(stem, head);
        nearest.body.add(marker);
        const label = document.createElement('div');
        label.className = 'globe-pin-label';
        label.textContent = formatCoordinates(latitude, longitude);
        (this.options.overlay ?? this.canvas.parentElement)?.append(label);
        const pin = { head, marker, label, latitude, longitude, body: nearest.body, point: [up.x, up.y, up.z],
            terrain: null, height: null, shownAt: 0, timer: setTimeout(() => this.removeGlobePin(), pinDuration * 1000) };
        this.globePin = pin;
        // What the ground is there, as the detailed map draws it, worked out off the main thread
        const style = SurfaceMap.styleFor(this.surfaceWorld(nearest.body.name));
        if (style && style.kind !== 'gasGiant') {
            terrainInWorker(pin.point, style, SurfaceMap.detailedOctaves).then((found) => {
                if (this.globePin !== pin) return;
                pin.terrain = found.terrain;
                pin.height = found.height;
                pin.altitude = found.altitude;
                pin.shownAt = 0;
            }).catch(() => {});
        }
        this.refreshGlobePinText(pin);
        return true;
    }

    removeGlobePin() {
        const pin = this.globePin;
        if (!pin) return;
        clearTimeout(pin.timer);
        pin.marker.removeFromParent();
        pin.marker.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
        pin.label.remove();
        this.globePin = null;
    }

    /** Keeps the pin's coordinates just above its head, or hides them while it's round the far side of its world */
    updateGlobePinLabel() {
        const pin = this.globePin;
        if (!pin) return;
        const head = pin.head.getWorldPosition(new THREE.Vector3());
        const base = pin.marker.getWorldPosition(new THREE.Vector3());
        const facing = head.clone().sub(base).dot(this.camera.position.clone().sub(base)) > 0;
        const projected = head.clone().project(this.camera);
        const inFront = projected.z < 1;
        pin.label.hidden = !(facing && inFront);
        if (pin.label.hidden) return;
        // The weather there keeps up with time, a couple of times a second
        const now = performance.now();
        if (now - pin.shownAt > 500) this.refreshGlobePinText(pin);
        const rect = this.canvas.getBoundingClientRect();
        const parentRect = pin.label.parentElement?.getBoundingClientRect() ?? rect;
        pin.label.style.left = `${rect.left - parentRect.left + (projected.x + 1) / 2 * rect.width}px`;
        pin.label.style.top = `${rect.top - parentRect.top + (1 - projected.y) / 2 * rect.height}px`;
    }

    /** The pin's coordinates, what the ground is there once known, and the weather there now */
    refreshGlobePinText(pin) {
        pin.shownAt = performance.now();
        const coordinates = formatCoordinates(pin.latitude, pin.longitude);
        const terrain = [pin.terrain ? WorldText.terrain(pin.terrain) : null, WorldText.altitude(pin.altitude)]
            .filter(Boolean).join('  ·  ') || null;
        const world = this.surfaceWorld(pin.body.name);
        const sun = this.sunDirectionOf(pin.body);
        const elevation = sun ? pin.point[0] * sun[0] + pin.point[1] * sun[1] + pin.point[2] * sun[2] : null;
        const weather = world ? localWeather(pin.point, world, elevation, pin.height, pin.terrain) : null;
        if (!weather) {
            pin.label.className = 'globe-pin-label';
            pin.label.textContent = [coordinates, terrain].filter(Boolean).join('  ·  ');
            return;
        }
        pin.label.className = 'globe-pin-label weather';
        const line = (text, className) => {
            const element = document.createElement('div');
            element.className = className;
            element.textContent = text;
            return element;
        };
        pin.label.replaceChildren(...[line(coordinates, 'coordinates'), terrain ? line(terrain, 'terrain') : null,
            line(weather.headline, 'headline'), line(weather.conditions, 'conditions'),
            weather.wind ? line(weather.wind, 'conditions') : null].filter(Boolean));
    }

    // MARK: weather

    /** The direction of a world's nearest star, in the world's own space (as its surface and clouds are laid out) */
    sunDirectionOf(body) {
        const shade = body?.children.find((c) => c.name === NightShade.name);
        const stars = shade?.userData.nightShade?.stars;
        if (!stars?.length) return null;
        const centre = body.getWorldPosition(new THREE.Vector3());
        const position = new THREE.Vector3();
        let star = null, best = Infinity;
        for (const candidate of stars) {
            candidate.getWorldPosition(position);
            const distance = position.distanceToSquared(centre);
            if (distance < best) {
                best = distance;
                star = position.clone();
            }
        }
        if (!star || best <= 1e-12) return null;
        const local = star.sub(centre).normalize().applyQuaternion(body.getWorldQuaternion(new THREE.Quaternion()).invert());
        return local.lengthSq() > 0 ? local.normalize().toArray() : null;
    }

    /** The direction of the nearest star from the planetary view's planet or moon with the given designation */
    sunDirectionOn(designation) {
        const body = this.nightShades.map((shade) => shade.parent).find((parent) => parent?.name === designation);
        return body ? this.sunDirectionOf(body) : null;
    }

    /** Draws a weather map ('radar' or 'temperature') over the globe of the world zoomed to, or none (null) */
    setGlobeWeather(layer) {
        this.globeWeather = layer ?? null;
        this.refreshGlobeWeather();
    }

    /**
     * Wraps the globe of the planet or moon zoomed to in a shell showing the chosen weather map, just over its clouds
     * and under its night shade, and draws the map again as the weather changes, until the map or the world zoomed to
     * changes. Each run takes down only its own shell, so one ending late never removes the next one's.
     */
    refreshGlobeWeather() {
        const previous = this.globeWeatherRun;
        if (previous) {
            previous.cancelled = true;
            clearTimeout(previous.timer);
            if (previous.shell) {
                previous.shell.removeFromParent();
                previous.shell.geometry.dispose();
                previous.shell.material.dispose();
                previous.texture?.dispose();
            }
            this.globeWeatherRun = null;
        }
        const layer = this.globeWeather;
        const designation = this.planetary?.selected;
        if (!layer || !designation) return;
        const world = this.surfaceWorld(designation);
        const clouds = world ? SurfaceMap.cloudsFor(world) : null;
        const environment = world?.environment;
        const shade = this.nightShades.find((s) => s.parent?.name === designation);
        if (!clouds || !environment || !shade) return;
        const body = shade.parent;
        const radius = shade.userData.worldRadius;
        const faceLocked = isFaceLocked(world);
        const surface = SurfaceMap.styleFor(world);
        const run = { cancelled: false, shell: null, texture: null, lastTime: null, timer: null };
        this.globeWeatherRun = run;
        const tick = async () => {
            if (run.cancelled) return;
            const time = WeatherClock.time;
            if (time !== run.lastTime) {
                run.lastTime = time;
                let snapshot;
                try {
                    snapshot = await weatherInWorker({ clouds, environment, time, sunDirection: this.sunDirectionOf(body),
                        faceLocked, surface: surface?.kind === 'gasGiant' ? null : surface });
                } catch {
                    return;
                }
                if (run.cancelled) return;
                const pixels = layerPixels(snapshot, layer);
                if (run.texture) {
                    run.texture.image.data.set(pixels);
                    run.texture.needsUpdate = true;
                } else {
                    run.texture = weatherTexture(pixels);
                    const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius * (1 + SurfaceMap.cloudAltitude + 0.002), 96, 48),
                        weatherShellMaterial(run.texture));
                    sphere.name = `${designation}_weather`;
                    sphere.renderOrder = NightShade.renderOrder.weather;
                    sphere.raycast = () => {};
                    body.add(sphere);
                    run.shell = sphere;
                }
            }
            run.timer = setTimeout(tick, 500);
        };
        tick();
    }

    // MARK: routes

    /** Adds a system to the end of the route, unless it's already the last waypoint, opening an ended route again */
    addToRoute(index) {
        if (index === null || this.routeWaypoints[this.routeWaypoints.length - 1] === index) return;
        this.routeEnded = false;
        this.setRouteWaypoints([...this.routeWaypoints, index]);
    }

    setRouteWaypoints(waypoints) {
        this.routeWaypoints = waypoints;
        // A route cut back to one waypoint can't be ended, as the End route button is gone
        if (waypoints.length < 2) this.routeEnded = false;
        this.planRoute();
    }

    /** Ends the route, so the systems in reach of its last waypoint are no longer ringed as the next stop, or opens it */
    setRouteEnded(ended) {
        this.routeEnded = ended;
        this.drawRoute();
        this.emit('route', this.routeState());
    }

    setRouteRange(range) {
        this.routeRange = range;
        this.planRoute();
    }

    /** Plans the route off the main thread, drawing the waypoints at once and the hops when they're ready */
    planRoute() {
        const token = {};
        this.routePlanning = this.routeWaypoints.length >= 2 ? token : null;
        this.route = null;
        this.drawRoute();
        this.emit('route', this.routeState());
        if (!this.routePlanning) return;
        const waypoints = [...this.routeWaypoints], range = this.routeRange;
        planRouteInWorker(this.field.positions.slice(), waypoints, this.field.parsecsPerUnit, range).then((route) => {
            if (this.routePlanning !== token || this.disposed) return;
            this.route = route;
            this.routePlanning = null;
            this.drawRoute();
            this.emit('route', this.routeState());
        }).catch((error) => {
            console.error('Route planning failed', error);
            if (this.routePlanning === token) this.routePlanning = null;
            this.emit('route', this.routeState());
        });
    }

    routeState() {
        return { waypoints: this.routeWaypoints, route: this.route, isPlanning: this.routePlanning !== null,
            routeRange: this.routeRange, isEnded: this.routeEnded };
    }

    /** Focuses the camera on a waypoint */
    focusSystem(index) {
        const position = this.field.systems[index]?.position;
        if (position) this.animateCamera({ pivot: new THREE.Vector3(...position), zoom: this.zoomFactor });
    }

    static routeDashLevel(zoom) {
        return Math.round(Math.log2(Math.max(zoom, 0.0001)));
    }

    /** Dashed lines for each hop, a red line for each leg out of reach, rings at waypoints and at systems in reach */
    drawRoute() {
        for (const object of this.routeObjects) {
            object.removeFromParent();
            object.traverse((o) => o.material && (Array.isArray(o.material) ? o.material.forEach((m) => m.dispose()) : o.material.dispose()));
        }
        this.routeObjects = [];
        if (!this.routeWaypoints.length) return;
        const position = (index) => new THREE.Vector3(...(this.field.systems[index]?.position ?? [0, 0, 0]));
        const hopMaterial = unlit(new THREE.Color(0.25, 0.95, 0.4));
        const gapMaterial = unlit(new THREE.Color(1, 0.25, 0.2));
        const redDash = unlit(new THREE.Color(1, 0.2, 0.15));
        const yellowDash = unlit(new THREE.Color(1, 0.85, 0.1));
        this.routeDashLevel = StarMap.routeDashLevel(this.zoomFactor);
        const dashSlot = routeDashSlot / Math.pow(2, this.routeDashLevel);
        const objects = [];
        for (const leg of this.route?.legs ?? []) {
            if (leg.hops) {
                for (const hop of leg.hops) {
                    const line = dashedRouteLine(position(hop.from), position(hop.to), [hopMaterial, hopMaterial], dashSlot);
                    if (line) objects.push(line);
                }
            } else {
                const gap = routeLine(position(leg.from), position(leg.to), gapMaterial);
                if (gap) objects.push(gap);
            }
        }
        const markerMaterial = unlit(new THREE.Color(1, 0.85, 0.3), { side: THREE.DoubleSide });
        for (const index of new Set(this.routeWaypoints)) {
            const marker = new THREE.Mesh(filterRingGeometry(1), markerMaterial);
            marker.userData.sharedGeometry = true;
            marker.name = 'route_waypoint';
            marker.userData.billboard = true;
            marker.position.copy(position(index));
            objects.push(marker);
        }
        // A turning red and yellow ring at each system within one hop of the last waypoint, with a dashed line to it.
        // An ended route has no next stop.
        const last = this.routeWaypoints[this.routeWaypoints.length - 1];
        const window = this.field.window;
        if (window && !this.routeEnded) {
            const range = rangeInUnits(this.routeRange, this.field.parsecsPerUnit);
            const waypoints = new Set(this.routeWaypoints);
            const ringMaterials = [unlit(new THREE.Color(1, 0.2, 0.15), { side: THREE.DoubleSide }),
                unlit(new THREE.Color(1, 0.85, 0.1), { side: THREE.DoubleSide })];
            for (const index of window.within(range, window.position(last))) {
                if (waypoints.has(index) || index >= this.field.systems.length) continue;
                const ring = new THREE.Group();
                ring.name = 'route_reach';
                ring.userData.billboard = true;
                ring.position.copy(position(index));
                const dashes = new THREE.Mesh(reachRingGeometry(), ringMaterials);
                dashes.userData.sharedGeometry = true;
                ring.add(dashes);
                ring.userData.spinner = dashes;
                objects.push(ring);
                const line = dashedRouteLine(position(last), position(index), [redDash, yellowDash], dashSlot);
                if (line) objects.push(line);
            }
        }
        for (const object of objects) {
            object.traverse((o) => { o.raycast = () => {}; });
            this.fieldNode.add(object);
        }
        this.routeObjects = objects;
        this.updateRouteScale(false);
        this.updateFilterHighlights();
    }

    /** The star field scales with the zoom, so the route's lines and rings shrink to keep their size on screen */
    updateRouteScale(redrawingDashes = true) {
        if (redrawingDashes && this.routeObjects.length && StarMap.routeDashLevel(this.zoomFactor) !== this.routeDashLevel) {
            this.drawRoute();
            return;
        }
        const scale = 1 / Math.max(this.zoomFactor, 0.0001);
        for (const object of this.routeObjects) {
            if (object.name === 'route_waypoint') object.scale.setScalar(routeMarkerRadius * scale);
            else if (object.name === 'route_reach') object.scale.setScalar(routeReachRadius * scale);
            else {
                object.scale.x = routeLineRadius * scale;
                object.scale.z = routeLineRadius * scale;
            }
        }
    }

    // MARK: surfaces

    /**
     * Gives every world of the planetary view its surface as the view opens, the principal world first and then the
     * others out from the star, rather than waiting for each to be zoomed to
     */
    applySurfaceMaps(worlds) {
        const planetary = this.planetary;
        if (!planetary) return;
        // A principal world that's a moon brings its planet to the front
        const principals = worlds.filter((w) => w.isPrincipal || w.moons.some((m) => m.isPrincipal));
        const ordered = principals.concat(worlds.filter((w) => !principals.includes(w)));
        planetary.queue.order(ordered.map((w) => w.designation));
        planetary.previewQueue.order(ordered.map((w) => w.designation));
        for (const world of ordered) {
            const body = planetary.entities.get(world.designation);
            if (body) this.applySurfaceMap(body, world);
        }
    }

    /**
     * Gives a planet its surface: rocky and icy worlds a globe of cells, gas giants a banded texture; its larger moons
     * get globes of their own and the rest shared moon textures. Every world's surfaces are queued as the planetary view
     * opens; zooming to one moves its surfaces to the front of the queue.
     */
    applySurfaceMap(body, world) {
        const planetary = this.planetary;
        const style = SurfaceMap.styleFor(world);
        if (!planetary || planetary.mapped.has(world.designation) || !style) return;
        planetary.mapped.add(world.designation);
        const systemID = planetary.systemID;
        const designation = world.designation;
        if (style.kind !== 'gasGiant') {
            // The globe first, so it isn't queued behind the slower cloud map
            this.applyVoronoiSurface(body, style, systemID, designation, planetary, designation);
            // Clouds go on the globe only, not on the detailed surface map
            const clouds = SurfaceMap.cloudsFor(world);
            if (clouds) this.addCloudLayer(body, clouds, designation, planetary, isFaceLocked(world));
            this.applyMoonTextures(body, world);
            return;
        }
        this.applyMoonTextures(body, world);
        planetary.queue.run(designation, () => this.store.gasGiantTexture(systemID, designation, style)).then((image) => {
            if (!image || !this.stillShown(body, planetary)) return;
            body.geometry.dispose();
            body.geometry = mappedSphere(body.userData.radius);
            body.material.dispose();
            body.material = unlit(0xffffff, { map: textureFromPixels(image) });
        }).catch((error) => console.error('Texture failed', error));
    }

    stillShown(body, planetary) {
        return !this.disposed && body.parent && this.planetary === planetary;
    }

    /**
     * Replaces a body's sphere with a globe of flat-coloured cells at the same size, with relief and rivers. `planet` is
     * the planet whose surfaces the globe waits in the queue with.
     */
    applyVoronoiSurface(body, style, systemID, designation, planetary, planet, small = false) {
        // A small moon drawn like a planet only by the Settings option has a coarse globe unless zoomed to
        planetary.globes.set(designation, { body, style, systemID, planet, resolution: this.globeResolution(designation),
            small, coarse: small && designation !== planetary.selected });
        this.drawGlobe(designation, planetary);
    }

    /**
     * The resolution a world's globe should have: the chosen one for the world zoomed to, standard for the rest, as
     * they're too small on screen to show more and a finer globe takes a lot of memory
     */
    globeResolution(designation) {
        if (designation !== this.planetary?.selected) return 1;
        // A 4× globe is some 18 million vertices, more than a browser's graphics memory reliably holds: drawn at all, it
        // can come out invisible. So the globe stops at 2×, or 1× if that failed.
        return Math.min(this.globeScale, this.globeResolutionLimit ?? maximumGlobeResolution);
    }

    /** Redraws any globe whose resolution should change, after zooming to another world or choosing another resolution */
    updateGlobeResolutions() {
        const planetary = this.planetary;
        if (!planetary) return;
        for (const [designation, target] of planetary.globes) {
            const wanted = this.globeResolution(designation);
            const coarse = target.small && designation !== planetary.selected;
            if (wanted === target.resolution && coarse === target.coarse) continue;
            target.resolution = wanted;
            target.coarse = coarse;
            this.drawGlobe(designation, planetary);
        }
    }

    /** Surface maps at another resolution (1, 2 or 4) */
    setMapResolution(scale) {
        this.mapResolution = scale;
    }

    /** The globe of the world zoomed to at another resolution (1 or 2) */
    setGlobeResolution(scale) {
        this.globeScale = scale;
        this.updateGlobeResolutions();
    }

    /**
     * Builds (or reads) a world's globe at the resolution last asked for, unless another is asked for meanwhile. A world
     * with no globe yet first gets a quick, coarse one (a sixteenth of the cells, drawn in a fraction of the time and
     * ahead of the queue of full globes), so no world sits as a plain ball while the others are drawn; the full globe
     * replaces it when it's ready.
     */
    drawGlobe(designation, planetary) {
        const target = planetary.globes.get(designation);
        if (!target) return;
        const { body, style, systemID, resolution, coarse } = target;
        // Until the globe at this resolution arrives, the view shows that the world is still being resolved
        const pendingKey = `${resolution}|${coarse}`;
        target.pending = pendingKey;
        this.refreshResolvingStatus();
        if (!coarse && !target.shown && !target.previewing) {
            target.previewing = true;
            planetary.previewQueue.run(target.planet, () => this.store.globe(systemID, designation, style, 1, true))
                .then((surface) => {
                    const current = planetary.globes.get(designation);
                    // Only while nothing better has arrived
                    if (!surface || current?.body !== body || current.shown) return;
                    return this.showGlobe(designation, planetary, body, surface, { preview: true });
                }).catch((error) => console.warn('Globe preview failed', error));
        }
        // Every world's quick preview first, then the full globes: the previews take the workers while there are any
        planetary.previewQueue.idle().then(() => planetary.queue.run(target.planet,
            () => this.store.globe(systemID, designation, style, resolution, coarse))).then((surface) => {
            if (!surface || !this.stillShown(body, planetary)) return;
            const current = planetary.globes.get(designation);
            if (current?.body !== body || current.resolution !== resolution || current.coarse !== coarse) return;
            return this.showGlobe(designation, planetary, body, surface, { resolution, coarse });
        }).catch((error) => {
            console.error('Globe failed', error);
            if (target.pending === pendingKey) target.pending = null;
        }).finally(() => this.refreshResolvingStatus());
    }

    /**
     * Shows "Resolving world…" while the globe of the world zoomed to (or, seeing the whole system, any globe) is still
     * being drawn at its full resolution, and hides it once it's in
     */
    refreshResolvingStatus() {
        const planetary = this.planetary;
        let resolving = false;
        if (planetary && !this.disposed) {
            const selected = planetary.selected ? planetary.globes.get(planetary.selected) : null;
            resolving = planetary.selected ? !!selected?.pending : [...planetary.globes.values()].some((g) => g.pending);
        }
        if (!resolving) {
            this.resolvingStatus?.remove();
            this.resolvingStatus = null;
            return;
        }
        if (this.resolvingStatus) return;
        const status = document.createElement('div');
        status.className = 'resolving-status';
        status.setAttribute('role', 'status');
        // A small world turning, a moon going round it, and its cells settling as it comes into focus
        status.innerHTML = '<span class="resolving-spinner" aria-hidden="true"><i class="world"></i><i class="orbit"><b><em></em></b></i></span>';
        const text = document.createElement('span');
        text.textContent = t('Resolving world…');
        status.append(text);
        (this.options.overlay ?? this.canvas.parentElement)?.append(status);
        this.resolvingStatus = status;
    }

    /** Puts a globe's surface on its body, its mesh built in a worker so the view doesn't stall */
    async showGlobe(designation, planetary, body, surface, { preview = false, resolution = 1, coarse = false } = {}) {
        let mesh;
        try {
            mesh = await globeMeshInWorker(surface, body.userData.radius);
        } catch {
            // Built here instead, if the workers can't
            const built = globeMesh(surface.sites, surface.colors, surface.triangles, body.userData.radius, surface.heights, surface.rivers);
            mesh = { ...built, colors: Float32Array.from(built.colors, (c) => Math.trunc(c * 255) / 255) };
        }
        if (!this.stillShown(body, planetary)) return;
        const current = planetary.globes.get(designation);
        if (current?.body !== body) return;
        if (preview) {
            if (current.shown) return;
        } else if (current.resolution !== resolution || current.coarse !== coarse) {
            return;
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(mesh.positions, 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(mesh.normals, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(mesh.colors, 3));
        geometry.setIndex(new THREE.BufferAttribute(mesh.indices, 1));
        geometry.computeBoundingSphere();
        body.geometry.dispose();
        body.geometry = geometry;
        body.material.dispose();
        body.material = new THREE.MeshBasicMaterial({ vertexColors: true });
        if (preview) return;
        current.shown = true;
        if (current.pending === `${resolution}|${coarse}`) current.pending = null;
        this.refreshResolvingStatus();
        if (resolution > 1) this.checkGlobeFits(designation, planetary);
        // Its settlements again, ending at the coasts and lakeshores of the globe just drawn
        planetary.surfaces.set(designation, surface);
        planetary.globeTests.delete(designation);
        const places = this.annotations[planetary.systemID]?.worlds?.[designation]?.places ?? [];
        if (places.some((place) => settlementKinds.has(place.kind))) this.refreshCityLights();
    }

    /**
     * After a finer globe is drawn, checks the graphics card took it: if it ran out of memory the globe draws as nothing,
     * so it's drawn again at standard resolution, and finer globes aren't tried again this session
     */
    checkGlobeFits(designation, planetary) {
        const gl = this.renderer.getContext();
        while (gl.getError() !== gl.NO_ERROR) { /* clear earlier errors */ }
        requestAnimationFrame(() => requestAnimationFrame(() => {
            if (gl.getError() !== gl.OUT_OF_MEMORY || this.planetary !== planetary) return;
            console.warn('Not enough graphics memory for a finer globe; showing it at standard resolution');
            this.globeResolutionLimit = 1;
            this.updateGlobeResolutions();
        }));
    }

    /** Gas giants' larger moons get a globe and clouds of their own; the rest wear shared grey textures, tinted */
    applyMoonTextures(body, world) {
        const planetary = this.planetary;
        const clouds = (moonWorld) => SurfaceMap.cloudsFor(moonWorld);
        for (const moon of world.moons) {
            const entity = body.getObjectByName(moon.designation);
            if (!entity) continue;
            if (SurfaceMap.isWorldlike(moon, world)) {
                const moonWorld = SurfaceMap.worldlike(world, moon);
                const style = SurfaceMap.styleFor(moonWorld);
                if (!style) continue;
                // In the queue with their planet's surfaces; moons drawn like planets only by the Settings option are
                // small on screen, and there may be many, so their globes are coarse unless zoomed to
                if (clouds(moonWorld)) this.addCloudLayer(entity, clouds(moonWorld), moon.designation, planetary, isFaceLocked(moonWorld));
                this.applyVoronoiSurface(entity, style, planetary.systemID, moon.designation, planetary, world.designation,
                    !SurfaceMap.isLargeWorldlike(moon, world));
                continue;
            }
            const appearance = SurfaceMap.moonAppearance(moon, world);
            this.moonTexture(appearance.template, world.designation).then((texture) => {
                if (!texture || !entity.parent) return;
                entity.geometry.dispose();
                entity.geometry = mappedSphere(entity.userData.radius, 48, 24);
                entity.material.dispose();
                entity.material = unlit(new THREE.Color(...appearance.tint), { map: texture });
            }).catch((error) => {
                // Left unloaded when the planetary view closed first; it's loaded afresh next time
                if (!error?.cleared) console.error('Moon texture failed', error);
            });
        }
    }

    /**
     * Moon textures are shared by every moon wearing them, so each is loaded once; the first load waits in the queue
     * with the surfaces of `world`, the planet whose moons first wanted it
     */
    moonTexture(template, world) {
        this.moonTextures ??= new Map();
        if (!this.moonTextures.has(template)) {
            const queue = this.planetary?.queue;
            const read = () => this.store.moonTemplate(template);
            const load = (queue ? queue.run(world, read) : read()).then((image) => {
                if (!image) throw Object.assign(new Error('The surface queue was cleared'), { cleared: true });
                return textureFromPixels(image);
            });
            load.catch(() => this.moonTextures.delete(template));
            this.moonTextures.set(template, load);
        }
        return this.moonTextures.get(template);
    }

    /**
     * Wraps a body in a translucent shell of cloud just above its surface, beneath its night side shell. `planet` is the
     * planet whose surfaces the cloud map waits in the queue with.
     */
    addCloudLayer(body, clouds, world, planetary, faceLocked) {
        if (!this.stillShown(body, planetary)) return;
        const radius = body.userData.radius;
        // The cloud shader draws the weather as cells of cloud that change as time runs
        const material = cloudMaterial(clouds, packedSettings(clouds, faceLocked));
        const shell = new THREE.Mesh(mappedSphere(radius * (1 + SurfaceMap.cloudAltitude)), material);
        shell.name = `${world}_clouds`;
        shell.visible = this.showClouds;
        shell.renderOrder = NightShade.renderOrder.clouds;
        shell.raycast = () => {};
        body.add(shell);
        planetary.cloudShells.push(shell);
    }

    /** A world's globe at standard resolution, read or drawn and saved, with its cells, colours, relief and rivers */
    worldGlobe(world, scale = 1) {
        const style = SurfaceMap.styleFor(world);
        if (!style || style.kind === 'gasGiant' || !this.planetary) return Promise.resolve(null);
        return this.store.globe(this.planetary.systemID, world.designation, style, scale);
    }

    /** A world's detailed surface map at the chosen resolution, read or drawn and saved */
    detailedMap(world, progress, scale = this.mapResolution) {
        const style = SurfaceMap.styleFor(world);
        if (!style || style.kind === 'gasGiant' || !this.planetary) return Promise.resolve(null);
        return this.store.detailedMap(this.planetary.systemID, world.designation, style, progress, scale);
    }
}

// MARK: helpers

/** How long the backdrop takes to fade in once the camera has settled on a system, in seconds */
const backdropFadeDuration = 0.4;

/**
 * How far above (or below) a flat chart's plane a system is drawn on the backdrop, in scene units, for a system
 * `distance` away: enough to put it at an angle of its own above or below the horizon, the same for every star of the
 * system each time (from a hash of its id), up to about 50° and mostly near the plane, as a galaxy's disc is
 */
function backdropLift(systemID, distance) {
    let hash = 0xCBF29CE484222325n;
    for (const byte of new TextEncoder().encode(`lift/${systemID ?? ''}`)) hash = ((hash ^ BigInt(byte)) * 0x100000001B3n) & 0xFFFFFFFFFFFFFFFFn;
    // The mean of two uniform draws, between −1 and 1, more often near 0
    const a = Number(hash & 0xFFFFFFn) / 0xFFFFFF, b = Number((hash >> 24n) & 0xFFFFFFn) / 0xFFFFFF;
    const sine = (a + b - 1) * 0.77;
    // Rising `distance × tan(elevation)` out of the plane
    return distance * sine / Math.sqrt(1 - sine * sine);
}

/** A weather map's pixels as a texture, smoothed between samples and wrapping round in longitude */
function weatherTexture(pixels) {
    const texture = new THREE.DataTexture(new Uint8Array(pixels.buffer.slice(0)), weatherWidth, weatherHeight, THREE.RGBAFormat);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
}

/**
 * Draws a weather map over a shell, looked up by latitude and longitude from the shell's own position the way the
 * weather is laid out (cloudModel.js spherePoint), north at the map's first row. It would otherwise hide the city
 * lights beneath it, as the clouds would, so it writes no depth.
 */
function weatherShellMaterial(texture) {
    return new THREE.ShaderMaterial({
        uniforms: { map: { value: texture } },
        transparent: true, depthWrite: false,
        vertexShader: `varying vec3 vLocal;
            void main() {
                vLocal = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
        fragmentShader: `uniform sampler2D map;
            varying vec3 vLocal;
            void main() {
                vec3 p = normalize(vLocal);
                float latitude = asin(clamp(p.y, -1.0, 1.0));
                float longitude = fract(atan(-p.z, p.x) / 6.2831853);
                gl_FragColor = texture2D(map, vec2(longitude, 0.5 - latitude / 3.14159265));
            }`,
    });
}

function visibleInHierarchy(object) {
    for (let o = object; o; o = o.parent) if (!o.visible) return false;
    return true;
}

/** Where an object is in the star field's own space, from its local transforms (whatever the field's matrix is) */
function positionInField(object, field) {
    const point = new THREE.Vector3();
    for (let o = object; o && o !== field; o = o.parent) {
        o.updateMatrix();
        point.applyMatrix4(o.matrix);
    }
    return point;
}

/** How much an object is scaled in the star field's own space */
function scaleInField(object, field) {
    let scale = 1;
    for (let o = object; o && o !== field; o = o.parent) scale *= o.scale.x;
    return scale;
}

function disposeObject(object, includeChildren = true) {
    const visit = (o) => {
        if (o.geometry && !o.userData.sharedGeometry && !o.userData.zoomScaledShared) o.geometry.dispose?.();
        const materials = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        for (const material of materials) {
            material.map?.dispose();
            material.alphaMap?.dispose();
            material.dispose();
        }
    };
    if (includeChildren) object.traverse(visit);
    else visit(object);
}

/** A unit cylinder stretched between two points, its thickness set by updateRouteScale */
function routeLine(start, end, material) {
    const length = start.distanceTo(end);
    if (!(length > 0)) return null;
    routeLine.cylinder ??= new THREE.CylinderGeometry(1, 1, 1, 12);
    const line = new THREE.Mesh(routeLine.cylinder, material);
    line.userData.sharedGeometry = true;
    line.name = 'route_hop';
    line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).divideScalar(length));
    line.position.copy(start).add(end).multiplyScalar(0.5);
    line.scale.set(1, length, 1);
    return line;
}

/** A dashed tube between two points, its dashes alternating between two materials and marching toward `end` */
function dashedRouteLine(start, end, materials, slot) {
    const length = start.distanceTo(end);
    if (!(length > 0)) return null;
    let count = Math.max(2, Math.round(length / slot));
    count += count % 2;
    const line = new THREE.Group();
    line.name = 'route_hop';
    line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).divideScalar(length));
    line.position.copy(start);
    line.scale.set(1, length, 1);
    const dashes = new THREE.Mesh(dashedLineGeometry(count), materials);
    dashes.userData.sharedGeometry = true;
    line.add(dashes);
    line.userData.dashes = dashes;
    line.userData.count = count;
    return line;
}
