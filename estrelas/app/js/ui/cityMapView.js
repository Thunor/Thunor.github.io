//
//  cityMapView.js
//  Estrelas (web)
//
//  A 3D model of a city, town or village marked on a surface map, generated from the place, its world and what
//  surrounds it there on the world's globe (see citySite.js), to orbit, pan and zoom: buildings, streets and avenues
//  over the lie of the land, a river and bridges, a waterfront on the sea or a lake, squares, parks and woods, under a
//  sky coloured by the world's atmosphere. Exports a top-down map. A port of CityMapView.swift.
//

import * as THREE from '../../vendor/three.module.min.js';
import { h, panel, button, icon, popover } from './components.js';
import { t, locale } from './i18n.js';
import { showSheet } from './sheets.js';
import { placeKindName } from './notes.js';
import { formats, saveCanvas, printPage } from './exportFile.js';
import { cityParameters, generateCity, cityEra, eraNames } from '../gen/cityGenerator.js';
import { readSite } from '../gen/citySite.js';
import { architectureNames, streetLayoutNames, harmonyNames } from '../model/savedData.js';
import { styleFor } from '../surface/surfaceMap.js';
import { techEraNames } from './worldText.js';
import { cityGeometry, cityObject, topDownHalfExtent } from '../scene/cityScene.js';

const fieldOfView = 50;
const exportLayoutWidth = 1600;

/**
 * Opens the city map of `place` on `world`. `options`: loadGlobe() (resolving to the world's globe, to read the place's
 * surroundings from, or null), worldStyle (the world's city style, which the place's own overrides)
 */
export function showCityMap(place, world, groundColor, { loadGlobe = null, worldStyle = null } = {}) {
    let parameters = cityParameters(place, world, null, worldStyle);
    const canvas = h('canvas', { class: 'city-canvas', 'aria-label': t('City map') });
    const status = h('div', { class: 'city-status' }, t('Laying out %@…', place.name));
    const sceneBox = h('div', { class: 'city-scene' }, canvas, status);
    const footerStats = h('span', { class: 'numeric' });
    const camera = { azimuth: 35, elevation: 38, distance: 800, target: new THREE.Vector3() };
    let layout = null;
    let city = null;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    const view = new THREE.PerspectiveCamera(fieldOfView, 1, 0.3, 100000);
    scene.add(new THREE.HemisphereLight(0xdde8ff, 0x445533, 0.9));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(0.45, 1, 0.3);
    sun.castShadow = true;
    scene.add(sun, sun.target);

    const updateCamera = () => {
        const a = camera.azimuth * Math.PI / 180, e = camera.elevation * Math.PI / 180;
        view.position.set(Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a)).multiplyScalar(camera.distance).add(camera.target);
        view.lookAt(camera.target);
        view.near = Math.max(0.3, camera.distance * 0.002);
        view.updateProjectionMatrix();
    };
    const resize = () => {
        const width = sceneBox.clientWidth, height = sceneBox.clientHeight;
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        view.aspect = width / height;
        view.updateProjectionMatrix();
    };
    let running = true;
    const frame = () => {
        if (!running) return;
        renderer.render(scene, view);
        requestAnimationFrame(frame);
    };
    const resetCamera = () => {
        Object.assign(camera, { azimuth: 35, elevation: 38, distance: (layout?.radius ?? 400) * 1.5 });
        camera.target.set(0, layout?.terrain?.height([0, 0]) ?? 0, 0);
        updateCamera();
    };
    const setDistance = (value) => {
        camera.distance = Math.min(Math.max(value, 25), (layout?.radius ?? 400) * 4);
        updateCamera();
    };

    // Orbit by dragging, pan with Shift or Alt held, zoom by scrolling or pinching
    let drag = null;
    canvas.addEventListener('pointerdown', (event) => {
        canvas.setPointerCapture(event.pointerId);
        drag = { x: event.clientX, y: event.clientY, azimuth: camera.azimuth, elevation: camera.elevation, target: camera.target.clone(),
            pan: event.shiftKey || event.altKey };
    });
    canvas.addEventListener('pointermove', (event) => {
        if (!drag) return;
        const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
        if (drag.pan) {
            const scale = camera.distance * 0.0016;
            const angle = camera.azimuth * Math.PI / 180;
            const right = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle));
            const forward = new THREE.Vector3(-Math.sin(angle), 0, -Math.cos(angle));
            const moved = drag.target.clone().addScaledVector(right, -dx * scale).addScaledVector(forward, dy * scale);
            const limit = (layout?.radius ?? 400) * 1.3;
            const flat = Math.hypot(moved.x, moved.z);
            if (flat > limit) moved.multiplyScalar(limit / flat);
            // On the ground where it's moved to, x east and −z north
            moved.y = layout?.terrain?.height([moved.x, -moved.z]) ?? 0;
            camera.target.copy(moved);
        } else {
            camera.azimuth = drag.azimuth - dx * 0.3;
            camera.elevation = Math.min(Math.max(drag.elevation + dy * 0.25, 4), 89);
        }
        updateCamera();
    });
    canvas.addEventListener('pointerup', () => { drag = null; });
    canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        if (!layout) return;
        setDistance(camera.distance * Math.exp(event.deltaY * 0.01));
    }, { passive: false });

    // MARK: header

    const exportButton = button([icon('export'), t('Export map')], {
        color: 'control', pill: false, title: t('Export a top-down map of the city as an image or PDF'),
        onClick: () => {
            const menu = h('div', { class: 'export-menu' }, formats.map((format) => h('button', { type: 'button', onclick: () => {
                pop.close();
                exportTopDown(format);
            } }, t(format.title))));
            const pop = popover(exportButton, menu);
        },
    });
    const topView = button(t('Top view'), { color: 'control', pill: false, onClick: () => { camera.elevation = 89; updateCamera(); } });
    const reset = button(t('Reset view'), { color: 'control', pill: false, onClick: resetCamera });
    for (const b of [exportButton, topView, reset]) b.disabled = true;
    const era = cityEra(parameters.era);
    const eraName = t(techEraNames[parameters.era] ?? parameters.era);
    const subtitle = [placeKindName(place.kind), t('Pop. %@', parameters.population.toLocaleString(locale())), eraName, world.designation].join('  ·  ');

    // The architecture, street layout and harmony the city was built with, once it's laid out
    const styleFacts = h('span', { class: 'numeric hint city-style-facts' });
    let sheet;
    const header = h('div', { class: 'map-header' },
        h('span', { class: 'name' }, place.name),
        h('span', { class: 'hint' }, placeKindName(place.kind)),
        h('span', { class: 'numeric hint' }, t('Pop. %@', parameters.population.toLocaleString(locale()))),
        h('span', { class: 'numeric hint' }, `${eraName} · ${t(eraNames[era])}`), styleFacts,
        h('span', { class: 'spacer' }), exportButton, topView, reset,
        button(t('Close'), { color: 'alert', onClick: () => sheet.close() }));
    const footer = h('div', { class: 'map-footer' }, footerStats, h('span', { class: 'spacer' }),
        h('span', { class: 'hint' }, t('Drag to orbit; shift-drag to pan; scroll or pinch to zoom')));
    const element = panel({ title: `${t('City map')}  ${place.name}`, color: 'info', segments: ['control', 'label', 'info'] }, header, sceneBox, footer);
    const resizeObserver = new ResizeObserver(resize);
    sheet = showSheet(element, { className: 'themed-sheet wide city-sheet', onClose: () => {
        running = false;
        resizeObserver.disconnect();
        scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose?.(); });
        renderer.dispose();
    } });
    resizeObserver.observe(sceneBox);
    resize();
    updateCamera();
    frame();

    // Reads the place's surroundings from its world's globe, then lays the city out, after the sheet shows, so its
    // progress note is seen
    const build = async () => {
        const style = styleFor(world);
        if (loadGlobe && style && style.kind !== 'gasGiant') {
            try {
                const globe = await loadGlobe();
                if (globe) parameters = cityParameters(place, world, readSite(place.latitude, place.longitude, style, globe), worldStyle);
            } catch (error) {
                console.warn('City site', error);
            }
        }
        await new Promise((resolve) => setTimeout(resolve, 30));
        if (!running) return;
        try {
            layout = generateCity(parameters);
            styleFacts.textContent = [architectureNames[layout.architecture], streetLayoutNames[layout.streetLayout],
                harmonyNames[layout.harmony]].map((name) => t(name)).join(' · ');
            city = cityObject(cityGeometry(layout), layout, groundColor);
            scene.add(city);
            // No air, or only a trace: a black sky; hazy, sulfurous and carbon dioxide skies: a hazy ochre
            const atmosphere = world.environment?.atmosphere ?? 'nitrogenOxygen';
            const sky = atmosphere === 'none' || atmosphere === 'trace' ? [0.02, 0.02, 0.04]
                : atmosphere === 'nitrogen' || atmosphere === 'nitrogenOxygen' ? [0.56, 0.72, 0.90] : [0.74, 0.62, 0.44];
            scene.background = new THREE.Color(...sky);
            const shadow = sun.shadow.camera;
            const reach = layout.radius * 1.4;
            Object.assign(shadow, { left: -reach, right: reach, top: reach, bottom: -reach, near: 1, far: layout.radius * 6 });
            shadow.updateProjectionMatrix();
            sun.position.set(0.45, 1, 0.3).multiplyScalar(layout.radius * 2.5);
            sun.shadow.mapSize.set(4096, 4096);
            sun.shadow.bias = -0.0005;
            status.remove();
            footerStats.textContent = t('Buildings %@  ·  Roads %@ km  ·  Parks %@  ·  Bridges %@  ·  Trees %@',
                layout.buildings.length.toLocaleString(locale()), layout.roadLength.toFixed(1), layout.parkCount, layout.bridges.length,
                layout.trees.length.toLocaleString(locale()));
            for (const b of [exportButton, topView, reset]) b.disabled = false;
            resetCamera();
        } catch (error) {
            console.error(error);
            status.textContent = String(error.message ?? error);
        }
    };
    build();

    /** A top-down map with no perspective, north up, with its name, a scale bar and a north arrow */
    const exportTopDown = async (format) => {
        try {
            const halfExtent = topDownHalfExtent(layout);
            const pixels = Math.min(Math.max(Math.trunc(halfExtent * 2 * (layout.radius < 600 ? 2.5 : 1.5)), 2048),
                Math.min(6144, renderer.capabilities.maxTextureSize));
            // Far overhead, and just deep enough to take in the ground and the tallest towers, for the best depth precision
            const height = Math.max(layout.radius * 12, 20000);
            const ortho = new THREE.OrthographicCamera(-halfExtent, halfExtent, halfExtent, -halfExtent, height - 2000, height + 2000);
            ortho.position.set(0, height, 0);
            ortho.up.set(0, 0, -1);
            ortho.lookAt(0, 0, 0);
            const target = new THREE.WebGLRenderTarget(pixels, pixels, { samples: 4 });
            const background = scene.background;
            scene.background = new THREE.Color(...groundColor);
            // No cast shadows: a map reads more clearly without them
            const shadows = sun.castShadow;
            sun.castShadow = false;
            renderer.setRenderTarget(target);
            renderer.render(scene, ortho);
            sun.castShadow = shadows;
            const data = new Uint8Array(pixels * pixels * 4);
            renderer.readRenderTargetPixels(target, 0, 0, pixels, pixels, data);
            renderer.setRenderTarget(null);
            scene.background = background;
            target.dispose();
            // Rows come bottom first
            const out = document.createElement('canvas');
            out.width = pixels;
            out.height = pixels;
            const context = out.getContext('2d');
            const imageData = context.createImageData(pixels, pixels);
            for (let y = 0; y < pixels; y++) imageData.data.set(data.subarray((pixels - 1 - y) * pixels * 4, (pixels - y) * pixels * 4), y * pixels * 4);
            context.putImageData(imageData, 0, 0);
            decorate(context, pixels, halfExtent * 2, place.name, subtitle);
            const name = t('%@ city map', place.name);
            if (format.id === 'pdf') printPage(h('div', { class: 'print-map' }, h('img', { src: out.toDataURL('image/png'), alt: place.name })), name);
            else await saveCanvas(out, name, format);
        } catch (error) {
            alert(`${t("Couldn't export the city map")}\n${error.message ?? error}`);
        }
    };
}

/** The name, a north arrow and a scale bar over an exported city map */
function decorate(context, pixels, metresAcross, name, subtitle) {
    const s = pixels / exportLayoutWidth;
    const box = (x, y, w, hgt) => {
        context.fillStyle = 'rgba(0,0,0,0.6)';
        context.beginPath();
        context.roundRect(x, y, w, hgt, 10 * s);
        context.fill();
    };
    context.font = `700 ${34 * s}px system-ui, sans-serif`;
    const nameWidth = context.measureText(name).width;
    context.font = `500 ${17 * s}px system-ui, sans-serif`;
    const subtitleWidth = context.measureText(subtitle).width;
    box(24 * s, 24 * s, Math.max(nameWidth, subtitleWidth) + 36 * s, 86 * s);
    context.fillStyle = 'white';
    context.textBaseline = 'top';
    context.font = `700 ${34 * s}px system-ui, sans-serif`;
    context.fillText(name, 42 * s, 36 * s);
    context.globalAlpha = 0.85;
    context.font = `500 ${17 * s}px system-ui, sans-serif`;
    context.fillText(subtitle, 42 * s, 78 * s);
    context.globalAlpha = 1;

    // North arrow
    const ax = pixels - 28 * s - 60 * s;
    box(ax, 28 * s, 60 * s, 80 * s);
    context.fillStyle = 'white';
    context.beginPath();
    context.moveTo(ax + 30 * s, 38 * s);
    context.lineTo(ax + 46 * s, 74 * s);
    context.lineTo(ax + 30 * s, 66 * s);
    context.lineTo(ax + 14 * s, 74 * s);
    context.closePath();
    context.fill();
    context.font = `700 ${18 * s}px system-ui, sans-serif`;
    context.textAlign = 'center';
    context.fillText('N', ax + 30 * s, 80 * s);
    context.textAlign = 'start';

    // Scale bar: black and white quarters of a round length about a fifth of the map
    const lengths = [10, 20, 50, 100, 200, 250, 500, 1000, 2000, 5000];
    const length = lengths.filter((l) => l <= metresAcross / 5).pop() ?? 10;
    const width = length / metresAcross * pixels;
    const label = length >= 1000 ? `${(length / 1000).toLocaleString(locale())} km` : `${length} m`;
    const x = 24 * s + 14 * s, y = pixels - 24 * s - 60 * s;
    box(24 * s, y - 14 * s, width + 28 * s, 60 * s);
    for (let k = 0; k < 4; k++) {
        context.fillStyle = k % 2 === 0 ? 'white' : 'black';
        context.fillRect(x + k * width / 4, y, width / 4, 10 * s);
    }
    context.strokeStyle = 'white';
    context.lineWidth = 1.5 * s;
    context.strokeRect(x, y, width, 10 * s);
    context.fillStyle = 'white';
    context.font = `600 ${15 * s}px system-ui, sans-serif`;
    context.fillText('0', x, y + 16 * s);
    context.textAlign = 'end';
    context.fillText(label, x + width, y + 16 * s);
    context.textAlign = 'start';
}
