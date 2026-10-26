//
//  main.js
//  Estrelas (web)
//
//  The app: the universe library, the star map of the open universe, the side panel, route and time controls
//  over it, the menu bar (File and Universe menus, Settings), and the New Universe, Manage Universes and Settings
//  sheets. Ports EstrelasApp.swift, UniverseCommands.swift, NewUniverseView.swift, UniversesView.swift and
//  SettingsView.swift. The same page serves the players' edition (player.html), which can only look.
//

import { UniverseLibrary, defaultPlayerUniverseID, starFieldKind, universeKinds } from './model/library.js';
import { UniverseStore } from './model/dataStore.js';
import { canPickFolders } from './model/folders.js';
import { StarMap } from './scene/starMap.js';
import { randomSeed } from './gen/random.js';
import { h, icon, button } from './ui/components.js';
import { t, languages, locale } from './ui/i18n.js';
import * as Settings from './ui/settings.js';
import * as SurfaceMap from './surface/surfaceMap.js';
import {
    stellarCartographyPanel, planetListPanel, routePanel, updateCameraReadout, timeControl, showStarDetail, showWorldDetail,
    showMoonDetail, showSheet, resolutionTitle, globeResolutionTitle,
} from './ui/views.js';
import { showSurfaceMap } from './ui/surfaceMapView.js';
import { worldAnnotationsAreEmpty, applyingAnnotations } from './model/savedData.js';
import { planSettlements, settlementTerrain } from './gen/settlementPlanner.js';
import { settlementKinds } from './gen/cityGenerator.js';
import { SplitMix64 } from './gen/random.js';
import { canEdit, isGMEdition } from './edition.js';
import { keepLauncherAlive } from './launcher.js';
import { HexChart, updates as travellerUpdates, showNewTravellerUniverse } from './traveller/hexChart.js';
import * as TravellerImporter from './traveller/travellerImporter.js';

const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const shortcutLabel = (key, { shift = false, alt = false } = {}) =>
    isMac ? `${alt ? '⌥' : ''}${shift ? '⇧' : ''}${alt ? '' : '⌘'}${key}` : `${alt ? 'Alt+' : 'Ctrl+'}${shift ? 'Shift+' : ''}${key}`;

const library = new UniverseLibrary();
const state = {
    map: null,
    openID: null,
    openRevision: -1,
    target: null,
    filters: { planets: false, habitable: false, belts: false, gasGiants: false, essentialOnly: false, noTravel: false, notes: false },
    camera: { zoom: 1, elevation: 0, azimuth: 0, x: 0, y: 0, z: 0 },
    route: null,
    /** The 2D chart drawn in place of the star field, for a charted universe */
    chart: null,
    /** The hex picked on the chart when it has no system of its own (a universe of TravellerMap's data alone) */
    chartID: null,
};

/** The kinds of universe, as the chooser offers them */
const mapKinds = {
    [starFieldKind]: { title: () => t('3D star field'), summary: () => t('A universe generated from a seed, explored in three dimensions'), icon: 'sparkles' },
    travellerHexMap: { title: () => t('Traveller hex maps'), summary: () => t('Sectors and subsectors from TravellerMap.com, every system filled in'), icon: 'hex' },
};

const side = document.getElementById('side');
const routeArea = document.getElementById('route');
const timeArea = document.getElementById('time');
const status = document.getElementById('status');
const menubar = document.getElementById('menubar');

// MARK: start

async function start() {
    applyStyle();
    translateStatic();
    buildMenus();
    SurfaceMap.setSurfaceGenerator(Settings.get('surfaceGenerator'));
    SurfaceMap.setMoonsLikePlanets(Settings.get('moonsLikePlanets'));
    if (!document.createElement('canvas').getContext('webgl2')) {
        setStatus(t("This browser doesn't support WebGL 2, which the star map needs."));
        return;
    }
    library.addEventListener('change', () => {
        buildMenus();
        if (!library.chosenKind) {
            closeUniverse();
            showChooser();
            return;
        }
        hideChooser();
        if (!library.current) {
            closeUniverse();
            if (library.isAskingForNewUniverse) {
                library.isAskingForNewUniverse = false;
                showNewUniverse({ backToChooser: true });
            }
            return;
        }
        const reopen = library.currentID !== state.openID || library.revision !== state.openRevision;
        if (reopen) openUniverse(library.current);
        else updateTitle();
    });
    library.addEventListener('error', (event) => showAlert(event.detail.message, event.detail.detail));
    setStatus(t('Loading universe…'));
    await library.load();
    if (library.isTemporary) toast(t('This browser can’t keep universes, so they’ll be lost when the page closes. Save them with Save Universe As….'), 8000);
    Settings.onChange(settingChanged);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('resize', () => renderTime());
    // A universe file dropped on the players' page opens it
    if (!isGMEdition) {
        document.addEventListener('dragover', (event) => event.preventDefault());
        document.addEventListener('drop', (event) => {
            event.preventDefault();
            const file = event.dataTransfer?.files?.[0];
            if (file) library.openPlayerUniverseFile(file);
        });
    }
}

function settingChanged(key) {
    const map = state.map;
    switch (key) {
        case 'interfaceStyle':
            applyStyle();
            renderAll();
            break;
        case 'appLanguage':
            translateStatic();
            buildMenus();
            renderAll();
            library.changed();
            break;
        case 'showClouds': map?.setShowClouds(Settings.get(key)); renderSide(); break;
        case 'showOrbits': map?.setShowOrbits(Settings.get(key)); renderSide(); break;
        case 'showNightSides': map?.setShowNightSides(Settings.get(key)); renderSide(); break;
        case 'showStarOrbitRings': map?.setShowStarOrbitRings(Settings.get(key)); renderSide(); break;
        case 'starSystemLimit': map?.setStarSystemLimit(Settings.get(key)); break;
        case 'surfaceGenerator': SurfaceMap.setSurfaceGenerator(Settings.get(key)); break;
        case 'moonsLikePlanets': SurfaceMap.setMoonsLikePlanets(Settings.get(key)); break;
        case 'showNebulae': map?.setShowNebulae(Settings.get(key)); renderSide(); break;
        case 'showTravelAdvisories': map?.setShowTravelAdvisories(Settings.get(key)); renderSide(); break;
        case 'filtersExpanded': renderSide(); break;
        case 'mapResolution': map?.setMapResolution(Settings.mapResolution()); break;
        case 'globeResolution': map?.setGlobeResolution(Settings.globeResolution()); renderSide(); break;
        case 'sidePanelCollapsed': renderSide(); renderTime(); break;
        default: break;
    }
}

function applyStyle() {
    const value = Settings.get('interfaceStyle');
    document.body.dataset.style = value === 'macOS' ? value : 'estrela';
}

function translateStatic() {
    document.documentElement.lang = locale();
    for (const element of document.querySelectorAll('[data-i18n]')) element.textContent = t(element.dataset.i18n);
}

function setStatus(text, withIcon = false) {
    status.replaceChildren();
    if (!text) return;
    if (withIcon) status.append(icon('sparkles'));
    status.append(h('div', {}, text));
}

let toastTimer = null;
function toast(text, duration = 4000) {
    document.getElementById('toast')?.remove();
    if (!text) return;
    document.body.append(h('div', { id: 'toast', role: 'status' }, text));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => document.getElementById('toast')?.remove(), duration);
}

function updateTitle() {
    const name = library.current?.name ?? '';
    const app = isGMEdition ? 'Estrelas' : 'Estrelas Player';
    document.title = name ? `${name} — ${app}` : app;
    const title = document.getElementById('universe-title');
    if (title) title.textContent = name;
}

// MARK: the open universe

/** Takes the open universe's scene down, as when the chooser shows */
function closeUniverse() {
    state.map?.dispose();
    state.map = null;
    state.chart?.dispose();
    state.chart = null;
    state.openID = null;
    state.target = null;
    side.replaceChildren();
    routeArea.replaceChildren();
    renderTime();
    setStatus('');
    updateTitle();
}

// MARK: choosing a map

/** Asks which kind of universe to work with, shown at startup (and from File ▸ Switch Map Type…) */
function showChooser() {
    let chooser = document.getElementById('chooser');
    if (!chooser) {
        chooser = h('div', { id: 'chooser' });
        document.body.append(chooser);
    }
    const cards = universeKinds.map((kind) => {
        const info = mapKinds[kind];
        const count = library.universesOf(kind).length;
        return h('button', { type: 'button', class: `kind-card ${library.lastKind === kind ? 'last' : ''}`, onclick: () => library.choose(kind) },
            icon(info.icon), h('strong', {}, info.title()), h('span', { class: 'summary' }, info.summary()),
            h('span', { class: 'count' }, t('%lld universes', count)));
    });
    chooser.replaceChildren(h('div', { class: 'chooser-body' }, h('h1', {}, t('Choose a map')), h('div', { class: 'cards' }, ...cards),
        h('p', { class: 'footnote' }, t('File ▸ Switch Map Type… brings you back here.'))));
    chooser.querySelector('.kind-card.last')?.focus();
}

function hideChooser() {
    document.getElementById('chooser')?.remove();
}

async function openUniverse(universe) {
    state.openID = universe.id;
    state.openRevision = library.revision;
    state.map?.dispose();
    state.map = null;
    state.chart?.dispose();
    state.chart = null;
    state.chartID = null;
    state.target = null;
    state.route = null;
    state.filters = { planets: false, habitable: false, belts: false, gasGiants: false, amber: false, red: false };
    updateTitle();
    // A fresh canvas per universe, so nothing of the last one's scene lingers
    const old = document.getElementById('scene');
    const canvas = h('canvas', { id: 'scene', 'aria-label': t('Star map') });
    old.replaceWith(canvas);
    side.replaceChildren();
    routeArea.replaceChildren();
    renderTime();
    setStatus(t('Loading universe…'));

    const map = new StarMap(canvas, new UniverseStore(universe.folder, { readOnly: !isGMEdition }), {
        showClouds: Settings.get('showClouds'), showOrbits: Settings.get('showOrbits'), showNightSides: Settings.get('showNightSides'),
        showStarOrbitRings: Settings.get('showStarOrbitRings'), starSystemLimit: Settings.get('starSystemLimit'),
        routeRange: Settings.get('routeRange'), mapResolution: Settings.mapResolution(), globeResolution: Settings.globeResolution(),
        showNebulae: Settings.get('showNebulae'), showTravelAdvisories: Settings.get('showTravelAdvisories'),
        canFly: () => !document.querySelector('dialog[open]') && !document.querySelector('.popover'),
        overlay: document.body,
    });
    state.map = map;
    map.addEventListener('camera', (event) => {
        state.camera = event.detail;
        updateCameraReadout(side, state.camera);
    });
    map.addEventListener('target', (event) => {
        state.target = event.detail.star;
        state.chartID = event.detail.chartID ?? null;
        if (state.chart) {
            state.chart.renderControls();
            state.chart.draw();
        }
        renderSide();
    });
    map.addEventListener('planetary', () => {
        // A charted universe's chart steps aside while a system is open
        if (state.chart) {
            state.chart.setVisible(!map.planetary);
            map.coveredByChart = !map.planetary;
        }
        renderSide();
        renderTime();
        renderRoute();
    });
    // The star counts only show in the star map's panel, not a system's
    map.addEventListener('counts', () => { if (!map.planetary) renderSide(); });
    map.addEventListener('globe', (event) => settleMainWorld(map, event.detail));
    map.addEventListener('fineGlobe', (event) => watchFineGlobe(event.detail));
    map.addEventListener('route', (event) => {
        state.route = event.detail;
        renderRoute();
    });
    try {
        await map.load((phase) => {
            if (phase === 'generating') setStatus(t('Generating star field…'));
            if (phase === 'updating') setStatus(t('Updating star field…'));
        });
        if (state.map !== map) return;
        setStatus('');
        if (universe.kind === TravellerImporter.kind) await openChart(universe, map);
        renderSide();
    } catch (error) {
        console.error(error);
        if (state.map === map) setStatus(`${t("The universe couldn't be shown.")} ${error.message ?? ''}`, true);
    }
}

/** Draws a hex universe's chart over its star field, and checks TravellerMap for newer data */
async function openChart(universe, map) {
    const store = map.store;
    const onFilesChanged = ({ chartOnly = false } = {}) => {
        if (state.map !== map) return;
        if (chartOnly) state.chart?.load().then(() => renderSide());
        else library.filesChanged();
    };
    const chart = new HexChart({
        universe, store, map, onFilesChanged,
        getState: () => ({ filters: state.filters, targetID: state.target ? map.systemIDOf(state.target) : state.chartID }),
    });
    state.chart = chart;
    map.coveredByChart = true;
    map.isCharted = true;
    await chart.load();
    if (state.chart !== chart) return;
    travellerUpdates.check(universe, store, onFilesChanged);
    // Universes imported before main worlds were mostly left unlocked, or with worlds round no star, are mended
    if (canEdit && !store.readOnly) {
        TravellerImporter.mend(store).then((mended) => { if (mended && state.map === map) library.filesChanged(); }).catch(() => {});
    }
}

function renderAll() {
    renderSide();
    renderTime();
    renderRoute();
}

/** Changes what's been added by hand to a system and saves it; the open panels and sheets show it straight away */
/**
 * Settles a system's main world, once its surface is drawn, if nobody has yet: its capital, cities and towns placed
 * where its people would build them (settlementPlanner.js), as the surface map's places. Done once per world; after
 * that its places are the GM's to change. The same world always gets the same settlements.
 */
function settleMainWorld(map, { systemID, designation, surface, isMainWorld }) {
    if (!canEdit || !isMainWorld || map.planetary?.systemID !== systemID) return;
    const annotation = map.annotations[systemID]?.worlds?.[designation];
    const places = annotation?.places ?? [];
    if (annotation?.autoSettled || places.some((place) => settlementKinds.has(place.kind))) return;
    const world = map.surfaceWorld(designation);
    const social = world ? applyingAnnotations(world, annotation)?.social : null;
    const style = world ? SurfaceMap.styleFor(world) : null;
    if (!(social?.population > 0) || !social.society || !style || style.kind === 'gasGiant') return;
    try {
        const seed = BigInt.asUintN(64, SurfaceMap.stableHash(`settle|${map.field?.seed ?? 0}|${systemID}|${designation}`));
        const settlements = planSettlements({ population: social.population, society: social.society,
            terrain: settlementTerrain(style, style.biomes ? surface : null), taken: places.map((place) => place.name),
            generator: new SplitMix64(seed) });
        changeAnnotations(systemID, (document) => {
            const entry = structuredClone(document.worlds[designation] ?? { places: [] });
            entry.places = [...(entry.places ?? []), ...settlements];
            entry.autoSettled = true;
            document.worlds[designation] = entry;
        });
    } catch (error) {
        console.warn(`Couldn't settle ${designation}: ${error}`);
    }
}

// MARK: finer globes on phones and tablets

const notEnoughMemoryMessage = () =>
    t("This device doesn't have enough memory for high-resolution worlds, so worlds are back at 1×.");

/**
 * On a phone or tablet, watches each finer globe being made (see Settings.markFineGlobeAttempt): one the device
 * couldn't hold sets the globes back to 1×, with an alert saying why
 */
function watchFineGlobe({ stage }) {
    if (!Settings.isMobileDevice) return;
    if (stage === 'start') {
        Settings.markFineGlobeAttempt(true);
    } else if (stage === 'fitted') {
        // Drawn for a few frames without trouble
        setTimeout(() => Settings.markFineGlobeAttempt(false), 3000);
    } else if (stage === 'failed') {
        Settings.markFineGlobeAttempt(false);
        if (Settings.globeResolution() > 1) {
            Settings.set('globeResolution', 1);
            setTimeout(() => alert(notEnoughMemoryMessage()), 0);
        }
    }
}

if (Settings.isMobileDevice) {
    // Leaving the page isn't a crash
    window.addEventListener('pagehide', () => Settings.markFineGlobeAttempt(false));
    Settings.onChange((key, value) => { if (key === 'globeResolution' && value === 1) Settings.markFineGlobeAttempt(false); });
    // The last visit closed while making a finer globe: globes start at 1× on a phone anyway, so it only needs saying
    if (Settings.fineGlobeAttemptFailed()) setTimeout(() => alert(notEnoughMemoryMessage()), 1500);
}

function changeAnnotations(systemID, change) {
    if (!canEdit || !systemID) return;
    state.map?.updateSystemAnnotations(systemID, (document) => {
        document.worlds ??= {};
        change(document);
    });
    renderSide();
}

// Rebuilding the side panel under a finger would end its scroll, so a rebuild waits for the finger to lift
let sideTouches = 0;
let sideRenderPending = false;
side.addEventListener('touchstart', (event) => { sideTouches = event.touches.length; }, { passive: true });
const sideTouchEnded = (event) => {
    sideTouches = event.touches.length;
    if (sideTouches === 0 && sideRenderPending) {
        sideRenderPending = false;
        // After the scroll's momentum has had a moment
        setTimeout(() => { if (sideTouches === 0) renderSide(); else sideRenderPending = true; }, 400);
    }
};
// On the window, since the touch's element may have left the panel by then
window.addEventListener('touchend', sideTouchEnded, { passive: true, capture: true });
window.addEventListener('touchcancel', sideTouchEnded, { passive: true, capture: true });

function renderSide() {
    if (sideTouches > 0) {
        sideRenderPending = true;
        return;
    }
    const map = state.map;
    // A chart of data alone has no systems of its own, but still has its side panel
    if (!map || (!map.systems && !state.chart)) {
        side.replaceChildren();
        return;
    }
    const collapsed = Settings.get('sidePanelCollapsed');
    const fold = button(icon(collapsed ? 'chevronLeft' : 'chevronRight'), {
        pill: true, height: 26, className: 'fold-button',
        title: collapsed ? t('Show the side panel') : t('Hide the side panel'),
        onClick: () => Settings.set('sidePanelCollapsed', !collapsed),
    });
    if (collapsed) {
        side.replaceChildren(fold);
        side.classList.add('collapsed');
        return;
    }
    side.classList.remove('collapsed');
    let element;
    const planetary = map.planetary;
    if (planetary) {
        const annotationsFor = () => map.annotations[planetary.systemID];
        const annotations = annotationsFor();
        const systemName = annotations?.system?.name || planetary.name;
        const context = { annotationsFor, onChangeAnnotations: (change) => changeAnnotations(planetary.systemID, change), systemName };
        element = planetListPanel({
            map, planetary, annotations,
            onChangeAnnotations: changeAnnotations,
            onShowMap: (world) => {
                const planet = planetary.system.worlds.find((w) => w.moons.some((m) => m.designation === world.designation));
                const primary = planetary.primaryStarID ? annotations?.stars?.[planetary.primaryStarID]?.name : null;
                showSurfaceMap(world, {
                    planet, systemName, worldName: annotations?.worlds?.[world.designation]?.name || world.designation,
                    primaryStarName: primary || planetary.primaryStarName || systemName,
                    annotation: annotationsFor()?.worlds?.[world.designation],
                    resolution: Settings.mapResolution(),
                    load: (progress, scale = Settings.mapResolution()) => map.detailedMap(world, progress, scale),
                    sunDirection: () => map.sunDirectionOn(world.designation),
                    loadGlobe: (scale = 1) => map.worldGlobe(world, scale),
                    onCityStyleChange: (style) => changeAnnotations(planetary.systemID, (document) => {
                        const entry = structuredClone(document.worlds[world.designation] ?? { places: [] });
                        entry.cityStyle = style ?? undefined;
                        if (worldAnnotationsAreEmpty(entry)) delete document.worlds[world.designation];
                        else document.worlds[world.designation] = entry;
                    }),
                    onPlacesChange: (places) => changeAnnotations(planetary.systemID, (document) => {
                        const entry = structuredClone(document.worlds[world.designation] ?? { places: [] });
                        entry.places = places;
                        if (worldAnnotationsAreEmpty(entry)) delete document.worlds[world.designation];
                        else document.worlds[world.designation] = entry;
                    }),
                });
            },
            onShowInfo: (world) => showWorldDetail(world, context),
            onShowMoonInfo: (moon, world) => showMoonDetail(moon, world, context),
        });
    } else {
        element = stellarCartographyPanel({
            map, filters: state.filters, target: state.target, camera: state.camera,
            chart: state.chart,
            onFilter: (name, on) => {
                state.filters[name] = on;
                map.setFilter(name, on);
                state.chart?.draw();
                renderSide();
            },
            onShowDetails: (star) => showStarDetail(star, () => map.annotations[map.systemIDOf(star)], map.nebulaeOf(star)),
            onChangeAnnotations: changeAnnotations,
            onSetTravelAdvisory: (advisory) => {
                map.setTravelAdvisory(advisory, state.target);
                state.chart?.draw();
                renderSide();
            },
            onAddToRoute: () => map.addToRoute(map.systemIndexOf(state.target)),
            onEnlargeStars: (on) => {
                map.setEnlargeStars(on);
                renderSide();
            },
        });
    }
    const scroll = side.querySelector('.planet-list')?.scrollTop ?? 0;
    const focusedSearch = side.querySelector('.system-search input') === document.activeElement;
    // Keeps the panel where it was scrolled to (a phone held sideways scrolls it) while it shows the same thing
    const scrollKey = planetary ? `system:${planetary.systemID}` : 'map';
    const scrollers = ['.panel-content', '.planet-list'];
    const scrolled = side.dataset.scrollKey === scrollKey ? scrollers.map((selector) => side.querySelector(selector)?.scrollTop ?? 0) : null;
    side.replaceChildren(fold, element);
    side.dataset.scrollKey = scrollKey;
    if (scrolled) scrollers.forEach((selector, index) => {
        const scroller = side.querySelector(selector);
        if (scroller && scrolled[index]) scroller.scrollTop = scrolled[index];
    });
    const list = side.querySelector('.planet-list');
    if (list) list.scrollTop = scroll;
    if (focusedSearch) side.querySelector('.system-search input')?.focus();
}

function renderRoute() {
    const map = state.map;
    const route = state.route;
    if (!map || map.planetary || !route || !route.waypoints.length) {
        routeArea.replaceChildren();
        return;
    }
    routeArea.replaceChildren(routePanel({ map, state: route, onClose: () => map.setRouteWaypoints([]) }));
}

function renderTime() {
    for (const child of timeArea.children) clearInterval(child.timer);
    timeArea.replaceChildren();
    if (!state.map?.planetary) return;
    // The full strip if there's room for it left of the side panel, else a narrower one
    const room = window.innerWidth - (Settings.get('sidePanelCollapsed') ? 60 : 380);
    timeArea.style.right = Settings.get('sidePanelCollapsed') || window.innerWidth <= 700 ? '10px' : '360px';
    timeArea.append(timeControl({ compact: room < 640 }));
}

// MARK: keyboard

function handleKey(event) {
    const command = isMac ? event.metaKey : event.ctrlKey;
    const typing = ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName);
    if (event.key === 'Escape') {
        if (closeMenus()) return;
        if (document.querySelector('dialog[open]') || document.querySelector('.popover') || typing) return;
        if (state.map?.escape()) event.preventDefault();
        return;
    }
    const key = event.key.toLowerCase();
    if (command && !event.shiftKey && key === 'o') {
        event.preventDefault();
        openUniverseFromDisk();
    } else if (canEdit && command && event.shiftKey && key === 's') {
        event.preventDefault();
        saveUniverseAs();
    } else if (canEdit && command && event.shiftKey && key === 'e') {
        event.preventDefault();
        exportForPlayers();
    } else if (command && event.key === ',') {
        event.preventDefault();
        showSettings();
    } else if (library.canCreateUniverse && library.chosenKind && event.altKey && event.code === 'KeyN' && !typing) {
        event.preventDefault();
        showNewUniverse();
    }
}

// MARK: menus

function buildMenus() {
    const menu = (title, items) => {
        const element = h('div', { class: 'menu' });
        const toggleButton = h('button', { type: 'button', 'aria-haspopup': 'true' }, title);
        const list = h('div', { class: 'menu-items', role: 'menu' });
        for (const item of items) {
            if (!item) continue;
            if (item === '-') list.append(h('hr'));
            else if (item.heading) list.append(h('div', { class: 'heading' }, item.heading));
            else {
                list.append(h('button', {
                    type: 'button', role: 'menuitem', disabled: item.disabled, title: item.help,
                    onclick: () => {
                        closeMenus();
                        item.action();
                    },
                }, h('span', { class: 'check' }, item.checked ? '✓' : ''), item.title,
                item.shortcut ? h('span', { class: 'shortcut' }, item.shortcut) : null));
            }
        }
        toggleButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const open = element.classList.contains('open');
            closeMenus();
            if (!open) element.classList.add('open');
        });
        toggleButton.addEventListener('mouseenter', () => {
            if (menubar.querySelector('.menu.open') && !element.classList.contains('open')) {
                closeMenus();
                element.classList.add('open');
            }
        });
        element.append(toggleButton, list);
        return element;
    };
    const fileItems = isGMEdition ? [
        { title: t('New Universe…'), shortcut: shortcutLabel('N', { alt: true }), disabled: !library.chosenKind, action: () => showNewUniverse() },
        { title: t('Open Universe…'), shortcut: shortcutLabel('O'), action: openUniverseFromDisk },
        '-',
        { title: t('Save Universe As…'), shortcut: shortcutLabel('S', { shift: true }), disabled: !library.current || !canEdit, action: () => saveUniverseAs() },
        { title: t('Export for Players…'), shortcut: shortcutLabel('E', { shift: true }), disabled: !library.current || !canEdit, action: () => exportForPlayers(),
            help: t("Save the open universe as one file to send players, with only the notes you've shared") },
    ] : [
        library.canCreateUniverse && library.chosenKind !== starFieldKind
            ? { title: t('New Universe…'), shortcut: shortcutLabel('N', { alt: true }), action: () => showNewUniverse() } : null,
        { title: t('Open Universe…'), shortcut: shortcutLabel('O'), action: openUniverseFromDisk,
            help: t('Open a universe your GM sent you; a newer copy of one you have replaces it') },
    ];
    menubar.replaceChildren(
        h('span', { class: 'app-name' }, icon('sparkles'), isGMEdition ? 'Estrelas' : 'Estrelas Player'),
        menu(t('File'), [...fileItems, '-', { title: t('Switch Map Type…'), disabled: !library.chosenKind, action: () => library.chooseAgain() },
            '-', { title: t('Settings…'), shortcut: shortcutLabel(','), action: showSettings },
            { title: isGMEdition ? t('About Estrelas') : t('About Estrelas Player'), action: showAbout }]),
        menu(t('Universe'), [
            { heading: t('Open Universe') },
            ...library.visibleUniverses.map((universe) => ({
                title: universe.name, checked: universe.id === library.currentID, action: () => library.select(universe.id),
            })),
            '-',
            { title: t('Manage Universes…'), action: showUniverses },
        ]),
        h('span', { id: 'universe-title' }, library.current?.name ?? ''));
}

function closeMenus() {
    const open = menubar.querySelectorAll('.menu.open');
    open.forEach((m) => m.classList.remove('open'));
    return open.length > 0;
}

document.addEventListener('click', (event) => {
    if (!menubar.contains(event.target)) closeMenus();
});

// MARK: opening and saving

const copyProgress = (done, total) => toast(t('Copying files… %lld of %lld', done, total), 2500);

async function openUniverseFromDisk() {
    try {
        if (isGMEdition) await library.openUniverse(copyProgress);
        else await library.openPlayerUniverse();
        toast('');
    } catch (error) {
        showAlert(t("Couldn't open the universe"), String(error.message ?? error));
    }
}

async function saveUniverseAs(id = library.currentID) {
    const message = await library.saveCopy(id, copyProgress);
    toast(message ?? '', 6000);
}

async function exportForPlayers(id = library.currentID) {
    const message = await library.exportForPlayers(id);
    toast(message ?? '', 6000);
}

// MARK: sheets

function plainSheet(className, ...content) {
    return showSheet(h('div', { class: 'sheet-body' }, ...content), { className: `plain-sheet ${className}` });
}

/** Who made the app, its copyright and licence */
function showAbout() {
    let sheet;
    sheet = plainSheet('about', h('h2', {}, isGMEdition ? 'Estrelas' : 'Estrelas Player'),
        h('p', {}, copyrightNotice),
        h('p', { class: 'footnote' }, t('Free to use. You may share unmodified copies, but not sell or modify the app. Anything you make with it is yours.')),
        h('p', { class: 'footnote' }, t('Includes three.js, © three.js authors, under the MIT licence.')),
        h('div', { class: 'actions', style: { justifyContent: 'space-between' } },
            h('a', { href: 'LICENSE.txt', target: '_blank', rel: 'noopener' }, t('Licence…')),
            h('button', { type: 'button', class: 'default', onclick: () => sheet.close() }, t('OK'))));
    sheet.dialog.querySelector('button.default').focus();
}

/** The app's copyright notice */
const copyrightNotice = '© 2026 Eric Freitas. All rights reserved.';

function showAlert(message, detail) {
    let sheet;
    sheet = plainSheet('alert', h('h2', {}, message), detail ? h('p', {}, detail) : null,
        h('div', { class: 'actions' }, h('button', { type: 'button', class: 'default', onclick: () => sheet.close() }, t('OK'))));
    sheet.dialog.querySelector('button.default').focus();
}

function confirmSheet(message, detail, actionTitle, action) {
    let sheet;
    sheet = plainSheet('alert', h('h2', {}, message), h('p', { class: 'footnote' }, detail),
        h('div', { class: 'actions' },
            h('button', { type: 'button', onclick: () => sheet.close() }, t('Cancel')),
            h('button', { type: 'button', class: 'default destructive', onclick: () => { sheet.close(); action(); } }, actionTitle)));
}

/**
 * Asks for what a new universe of the kind being worked with needs: a 3D star field's name and seed (the seed starts
 * out random), or a Traveller universe's sectors. With `backToChooser`, cancelling with no universe of the kind goes
 * back to the chooser.
 */
function showNewUniverse({ backToChooser = false } = {}) {
    const onCancel = () => {
        if (backToChooser && !library.current) library.chooseAgain();
    };
    if (library.chosenKind === TravellerImporter.kind) {
        showNewTravellerUniverse(library, { onCancel });
        return;
    }
    if (!isGMEdition) return;
    const name = h('input', { type: 'text', value: library.suggestedName(), 'aria-label': t('Name') });
    const seedField = h('input', { type: 'text', value: String(randomSeed()), inputmode: 'numeric', 'aria-label': t('Seed'),
        style: { fontVariantNumeric: 'tabular-nums' } });
    const note = h('p', { class: 'footnote' });
    const create = h('button', { type: 'submit', class: 'default' }, t('Create'));
    const parseSeed = () => {
        const text = seedField.value.trim();
        if (!/^\d+$/.test(text)) return null;
        const value = Number(text);
        return value <= 4294967295 ? value : null;
    };
    const validate = () => {
        const valid = parseSeed() !== null;
        note.textContent = valid ? t('The same seed always generates the same star field.')
            : t('The seed must be a whole number from 0 to %@.', (4294967295).toLocaleString(locale()));
        note.classList.toggle('error', !valid);
        create.disabled = !valid;
    };
    seedField.addEventListener('input', validate);
    const dice = h('button', { type: 'button', class: 'icon-button', title: t('Random seed'), 'aria-label': t('Random seed'),
        onclick: () => { seedField.value = String(randomSeed()); validate(); } }, icon('dice'));
    let sheet;
    const form = h('form', {
        onsubmit: (event) => {
            event.preventDefault();
            const seed = parseSeed();
            if (seed === null) return;
            sheet.close();
            library.newUniverse(name.value, seed);
        },
    },
    h('h2', {}, t('New Universe')),
    h('label', { class: 'field' }, h('span', {}, t('Name')), name),
    h('label', { class: 'field' }, h('span', {}, t('Seed')), h('div', { class: 'row' }, seedField, dice)),
    note,
    h('div', { class: 'actions' }, h('button', { type: 'button', onclick: () => sheet.close() }, t('Cancel')), create));
    sheet = showSheet(form, { className: 'plain-sheet new-universe' });
    validate();
    name.select();
}

/** Every universe in the library, to open, rename, save a copy of, or delete */
function showUniverses() {
    const list = h('div', { class: 'universe-list' });
    const dateText = (value) => {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString(locale(), { dateStyle: 'medium', timeStyle: 'short' });
    };
    const render = () => {
        list.replaceChildren(...library.universes.map((universe) => {
            const isOpen = universe.id === library.currentID;
            let name;
            if (canEdit) {
                name = h('input', { type: 'text', value: universe.name, 'aria-label': t('Name') });
                name.addEventListener('change', () => library.rename(universe.id, name.value));
                name.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') name.blur();
                });
            } else {
                name = h('strong', {}, universe.name);
            }
            const created = universe.exportedAt ? t('From your GM, %@', dateText(universe.exportedAt))
                : universe.id === defaultPlayerUniverseID ? t('The shared universe every player has')
                    : t('Created %@', dateText(universe.createdAt));
            return h('div', { class: 'universe-row' },
                h('span', { class: `status ${isOpen ? 'open' : ''}`, title: isOpen ? t('Currently open') : t('Not open') },
                    icon(isOpen ? 'check' : 'circle')),
                h('div', { class: 'details' }, name,
                    h('div', { class: 'meta' }, h('span', {}, created),
                        isGMEdition && universe.seed !== undefined && universe.seed !== null ? h('span', { class: 'seed' }, t('Seed %@', String(universe.seed))) : null)),
                h('button', { type: 'button', disabled: isOpen, onclick: () => library.select(universe.id) }, t('Open')),
                canEdit ? h('button', { type: 'button', onclick: () => saveUniverseAs(universe.id) }, t('Save As…')) : null,
                library.canDelete(universe.id) ? h('button', { type: 'button', class: 'icon-button destructive', title: t('Delete'), 'aria-label': t('Delete'),
                    onclick: () => confirmSheet(t('Delete “%@”?', universe.name),
                        t('The universe’s folder, with its star field and surface maps, is deleted from this browser.'),
                        t('Delete'), () => library.delete(universe.id)) }, icon('trash')) : null);
        }));
    };
    render();
    const onChange = () => render();
    library.addEventListener('change', onChange);
    let sheet;
    sheet = showSheet(h('div', { class: 'sheet-body' },
        h('h2', {}, t('Universes')),
        list,
        h('p', { class: 'footnote' }, library.isTemporary
            ? t('This browser can’t keep universes, so they’ll be lost when the page closes. Save them with Save Universe As….')
            : isGMEdition ? t('Universes are kept in this browser. Use Save Universe As… to share one with the macOS app.')
                : t('Open a universe your GM sent you with Open Universe…, or drop its file on the page.')),
        h('div', { class: 'actions', style: { justifyContent: 'space-between' } },
            h('div', { class: 'row' },
                isGMEdition ? h('button', { type: 'button', onclick: showNewUniverse }, t('New Universe…')) : null,
                h('button', { type: 'button', onclick: openUniverseFromDisk }, t('Open Universe…'))),
            h('button', { type: 'button', class: 'default', onclick: () => sheet.close() }, t('Done')))),
    { className: 'plain-sheet universes', onClose: () => library.removeEventListener('change', onChange) });
}

/** The app's settings */
async function showSettings() {
    const folderName = h('span', {});
    const clear = h('button', { type: 'button' }, t('Clear'));
    const refreshFolder = async () => {
        const handle = await Settings.universesFolder();
        folderName.textContent = handle ? handle.name : t('Not set');
        folderName.className = handle ? '' : 'footnote';
        clear.hidden = !handle;
    };
    clear.addEventListener('click', async () => {
        await Settings.setUniversesFolder(null);
        refreshFolder();
    });
    const choose = h('button', {
        type: 'button', disabled: !canPickFolders, title: canPickFolders ? null : t('Choosing a folder needs Chrome, Edge or another Chromium browser.'),
        onclick: async () => {
            try {
                const handle = await window.showDirectoryPicker({ id: 'estrelas-universes', mode: 'readwrite' });
                await Settings.setUniversesFolder(handle);
                refreshFolder();
            } catch (error) {
                if (error.name !== 'AbortError') showAlert(t("Couldn't save the universe"), String(error.message ?? error));
            }
        },
    }, t('Choose…'));

    const select = (key, options) => {
        const element = h('select', {}, options.map(([value, title]) => h('option', { value, selected: String(Settings.get(key)) === String(value) }, title)));
        element.addEventListener('change', () => {
            const option = options.find(([value]) => String(value) === element.value);
            Settings.set(key, option ? option[0] : element.value);
        });
        return element;
    };
    const checkbox = (key, title, { disabled = false } = {}) => {
        const box = h('input', { type: 'checkbox', checked: !!Settings.get(key), disabled });
        box.addEventListener('change', () => Settings.set(key, box.checked));
        return h('label', { class: 'row' }, box, title);
    };

    let sheet;
    sheet = showSheet(h('div', { class: 'sheet-body' },
        h('h2', {}, t('Settings')),
        isGMEdition ? h('div', { class: 'field-block' },
            h('label', { class: 'field' }, h('span', {}, t('Universes folder')), h('div', { class: 'row' }, folderName, choose, clear)),
            h('p', { class: 'footnote' }, canPickFolders ? t('Where universes are saved, unless you pick another folder when saving.')
                : t('Choosing a folder needs Chrome, Edge or another Chromium browser.'))) : null,
        isGMEdition ? h('hr') : null,
        h('label', { class: 'field' }, h('span', {}, t('Star systems shown')),
            select('starSystemLimit', Settings.starSystemLimits.map((limit) => [limit, limit.toLocaleString(locale())]))),
        h('p', { class: 'footnote' }, t('The star field draws this many systems nearest the view, and brings in others as you fly with W and S. Fewer is faster.')),
        h('hr'),
        h('label', { class: 'field' }, h('span', {}, t('Planet surfaces')),
            select('surfaceGenerator', [['classic', t('Classic')], ['biomes', t('Climate & biomes')], ['polygons', t('Polygon map')]])),
        h('p', { class: 'footnote' }, t("Climate & biomes gives worlds with seas oceans, lakes, rivers and biomes from their temperature and moisture. Polygon map builds them after Amit Patel's polygonal map generation: land rising from the coast to the mountains, rivers running down to the sea, and biomes from height, latitude and nearness to fresh water. Applies to planetary systems opened afterwards.")),
        checkbox('showTravelAdvisories', t('Show travel advisories')),
        h('p', { class: 'footnote' }, t("The Essential travel only and No travel filters and their rings, the Advisory buttons in the side panel, and the advisory a world's conditions suggest. Turn off for campaigns that don't use them; advisories already set are kept.")),
        h('hr'),
        checkbox('moonsLikePlanets', t('Draw moons like planets')),
        h('p', { class: 'footnote' }, t("Gives every rocky and icy moon a surface generated the way a planet's is, with its own globe, clouds, weather and surface map, rather than one of a few shared moon textures. Gas giants' large moons are always drawn this way. Small moons get a coarser globe until you zoom to them. Applies to planetary systems opened afterwards.")),
        h('label', { class: 'field' }, h('span', {}, t('Surface resolution')),
            select('mapResolution', Settings.mapResolutions.map((scale) => [scale, resolutionTitle(scale)]))),
        h('p', { class: 'footnote' }, t("How finely surface maps are drawn. Finer ones show more detail but take longer to draw. Every resolution is saved with the universe once drawn. Also on the surface map.")),
        h('label', { class: 'field' }, h('span', {}, t('Globe resolution')),
            select('globeResolution', Settings.globeResolutions.map((scale) => [scale, globeResolutionTitle(scale)]))),
        h('p', { class: 'footnote' }, t("How finely the globe of the world you zoom to is drawn. Also in the planetary view's side panel.")),
        h('hr'),
        checkbox('showClouds', t('Show clouds')),
        h('p', { class: 'footnote' }, t('Cloud layers over the globes of planets with atmospheres.')),
        h('hr'),
        h('label', { class: 'field' }, h('span', {}, t('Interface style')),
            select('interfaceStyle', [['estrela', 'Estrela'], ['macOS', 'macOS']])),
        h('p', { class: 'footnote' }, t('How the panels and controls over the star map are drawn.')),
        h('hr'),
        h('label', { class: 'field' }, h('span', {}, t('Language')),
            select('appLanguage', languages.map(({ code, name }) => [code, name ?? t('System Default')]))),
        h('div', { class: 'actions' }, h('button', { type: 'button', class: 'default', onclick: () => sheet.close() }, t('Done')))),
    { className: 'plain-sheet settings' });
    refreshFolder();
}

// For the console: inspecting the library and the open star map
window.estrelas = { library, state };

keepLauncherAlive();
start();
