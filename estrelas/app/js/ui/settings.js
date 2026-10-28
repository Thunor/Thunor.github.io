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
    worldDataHexMap: 'srd',
    worldDataStarField: 'estrelas',
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

/** iPhones, iPads (which call themselves Macs, with a touch screen) and Android devices */
export const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    || (/Mac/.test(navigator.platform ?? '') && navigator.maxTouchPoints > 1);

/**
 * Settings a phone or tablet keeps for the visit only, starting from the default every time: a finer globe takes more
 * memory than many of them have
 */
const visitOnly = new Set(isMobileDevice ? ['globeResolution'] : []);

const events = new EventTarget();
const prefix = `${storagePrefix}.`;

export function get(key) {
    if (key in memory) return memory[key];
    if (visitOnly.has(key)) return defaults[key];
    try {
        const stored = localStorage.getItem(prefix + key);
        if (stored !== null) {
            const value = JSON.parse(stored);
            // The RetroSpace style is gone; whoever chose it gets the default
            if (key === 'interfaceStyle' && value === 'retroSpace') return defaults[key];
            return value;
        }
    } catch {
        // Storage can be unavailable (private windows) or hold something unreadable
    }
    return defaults[key];
}

export function set(key, value) {
    if (visitOnly.has(key)) {
        memory[key] = value;
        events.dispatchEvent(new CustomEvent('change', { detail: { key, value } }));
        return;
    }
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

// MARK: finer globes on phones and tablets

/*
 * A finer globe can take more memory than a phone or tablet has, and the browser then closes the page outright. So
 * while one is being made a mark is left in storage, and taken away once it's shown and drawn; a page that opens to
 * find the mark still there was closed making one.
 */
const fineGlobeKey = `${prefix}fineGlobeAttempt`;

export function markFineGlobeAttempt(attempting) {
    try {
        if (attempting) localStorage.setItem(fineGlobeKey, String(Date.now()));
        else localStorage.removeItem(fineGlobeKey);
    } catch {
        // Without storage there's no telling afterwards
    }
}

/** Whether the last visit was closed while making a finer globe; asking clears the mark */
export function fineGlobeAttemptFailed() {
    try {
        const failed = localStorage.getItem(fineGlobeKey) !== null;
        localStorage.removeItem(fineGlobeKey);
        return failed;
    } catch {
        return false;
    }
}
