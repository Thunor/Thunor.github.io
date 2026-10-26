//
//  settings.js
//  Estrelas (web)
//
//  The app's settings (SettingsView.swift's @AppStorage values), kept in this browser. The universes folder is a
//  folder handle, which only Chromium browsers have; it's kept in IndexedDB since handles can't go in localStorage.
//

import { storagePrefix } from '../edition.js';

const memory = {};

const defaults = {
    appLanguage: '',
    showClouds: true,
    showOrbits: true,
    showNightSides: true,
    showStarOrbitRings: true,
    starSystemLimit: 1000,
    surfaceGenerator: 'biomes',
    mapResolution: 1,
    globeResolution: 1,
    routeRange: 2,
    sidePanelCollapsed: false,
    simulationYearOffset: 5238,
    surfaceMapExportIncludesWorldData: true,
    interfaceStyle: 'estrela',
    showNebulae: true,
    showTravelAdvisories: true,
    filtersExpanded: false,
    moonsLikePlanets: false,
    surfaceMapExportOutline: false,
    globeExportResolution: 1,
    globeExportMount: 'none',
};

/** How many star systems the star field may draw at once */
export const starSystemLimits = [250, 500, 1000, 2000, 4000];

/**
 * How finely worlds' surfaces are drawn (MapResolution.swift): the detailed surface maps, and the globe of the world
 * zoomed to. Every resolution drawn is saved with the universe, so switching back to one is instant.
 */
export const mapResolutions = [1, 2, 4];

/**
 * How finely the globe of the world zoomed to is drawn, set apart from the surface maps': 4× globes are some 18 million
 * vertices, more than a browser's graphics memory holds
 */
export const globeResolutions = [1, 2];

/** The current globe resolution: 1 or 2 */
export function globeResolution() {
    const value = get('globeResolution');
    return globeResolutions.includes(value) ? value : 1;
}

/** The current surface map resolution: 1, 2 or 4 */
export function mapResolution() {
    const value = get('mapResolution');
    return mapResolutions.includes(value) ? value : 1;
}

const events = new EventTarget();
const prefix = `${storagePrefix}.`;

export function get(key) {
    if (key in memory) return memory[key];
    try {
        const stored = localStorage.getItem(prefix + key);
        if (stored !== null) return JSON.parse(stored);
    } catch {
        // Storage can be unavailable (private windows) or hold something unreadable
    }
    return defaults[key];
}

export function set(key, value) {
    try {
        localStorage.setItem(prefix + key, JSON.stringify(value));
    } catch {
        // The setting still applies for this visit
        memory[key] = value;
    }
    events.dispatchEvent(new CustomEvent('change', { detail: { key, value } }));
}

export function onChange(listener) {
    events.addEventListener('change', (event) => listener(event.detail.key, event.detail.value));
}

// MARK: universes folder

function database() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('estrelas', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('handles');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function handleStore(mode, action) {
    const db = await database();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('handles', mode);
        const request = action(transaction.objectStore('handles'));
        transaction.oncomplete = () => resolve(request?.result);
        transaction.onerror = () => reject(transaction.error);
    });
}

/** The folder Save Universe As… and Open Universe… start in, or null */
export async function universesFolder() {
    try {
        return (await handleStore('readonly', (store) => store.get('universesFolder'))) ?? null;
    } catch {
        return null;
    }
}

export async function setUniversesFolder(handle) {
    try {
        if (handle) await handleStore('readwrite', (store) => store.put(handle, 'universesFolder'));
        else await handleStore('readwrite', (store) => store.delete('universesFolder'));
    } catch (error) {
        console.warn('Couldn’t remember the universes folder', error);
    }
    events.dispatchEvent(new CustomEvent('change', { detail: { key: 'universesFolder', value: handle } }));
}
