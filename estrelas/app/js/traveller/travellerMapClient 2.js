//
//  travellerMapClient.js
//  Estrelas (web) — Traveller module
//
//  TravellerMap.com's API (travellermap.com/doc/api): the list of sectors in a milieu, a sector's worlds as Second
//  Survey data, its metadata (subsector and allegiance names, routes), and its world maps. Served by the Estrelas
//  launcher, requests go through it (its image store doesn't let pages fetch from it); otherwise straight to the site.
//  A busy TravellerMap is tried again, waiting longer each time. A port of TravellerMapClient.swift.
//

import { launcherAvailable } from '../launcher.js';
import { t } from '../ui/i18n.js';

export const site = 'https://travellermap.com';
export const images = 'https://travellermap.s3.amazonaws.com/images/maps';
/** The milieu new universes chart unless another is chosen: the Third Imperium in 1105 */
export const defaultMilieu = 'M1105';
/** TravellerMap's milieux, by year of the Imperial calendar */
export const milieux = ['M0', 'M990', 'M1105', 'M1120', 'M1201', 'M1248', 'M1900'];

/** Waits between tries, in seconds: a busy TravellerMap can keep cutting connections off for most of a minute */
const retryDelays = [2, 4, 8, 15, 15];

class StatusError extends Error {
    constructor(status, what) {
        super(t('TravellerMap answered %lld for %@', status, what));
        this.status = status;
    }
}

const sleep = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

/** Sends a request, trying again after the glitches a busy TravellerMap gives; other answers come back as they are */
async function send(url, { method = 'GET', accept = null, what = url, retries = retryDelays.length, timeout = 60000 } = {}) {
    const proxied = await launcherAvailable();
    const address = proxied ? `/__launcher/fetch?url=${encodeURIComponent(url)}` : url;
    for (let attempt = 1; ; attempt++) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeout);
            let response;
            try {
                response = await fetch(address, { method, headers: accept ? { Accept: accept } : {}, signal: controller.signal,
                    cache: 'no-store' });
            } finally {
                clearTimeout(timer);
            }
            // The launcher's own answer when it couldn't reach the site at all
            if (proxied && response.status === 502) throw new TypeError('TravellerMap could not be reached');
            if (response.status === 429 || response.status >= 500) throw new StatusError(response.status, what);
            return response;
        } catch (error) {
            const transient = error instanceof TypeError || error.name === 'AbortError' ||
                (error instanceof StatusError && (error.status === 429 || error.status >= 500));
            if (!transient || attempt > retries) throw error;
            await sleep(retryDelays[attempt - 1]);
        }
    }
}

async function get(path, query, json) {
    const params = new URLSearchParams(Object.entries(query).sort(([a], [b]) => (a < b ? -1 : 1)));
    const response = await send(`${site}/${path}?${params}`, { accept: json ? 'application/json' : null, what: path });
    if (response.status !== 200) throw new StatusError(response.status, path);
    return json ? response.json() : response.text();
}

/** Every sector with data in a milieu, by name: { name, abbreviation, x, y, milieu, tags } */
export async function sectors(milieu) {
    const response = await get('api/universe', { requireData: '1', milieu }, true);
    const listings = [];
    for (const sector of response.Sectors ?? []) {
        // The name in no particular language is the usual one
        const name = (sector.Names?.find((n) => n.Lang == null) ?? sector.Names?.[0])?.Text;
        if (!name) continue;
        listings.push({ name, abbreviation: sector.Abbreviation ?? name.slice(0, 4), x: sector.X, y: sector.Y,
            milieu: sector.Milieu ?? milieu, tags: sector.Tags ?? '' });
    }
    return listings.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
}

export const listingID = (listing) => `${listing.milieu}/${listing.x},${listing.y}`;

/** A sector's worlds, as tab-delimited Second Survey text */
export function sectorData(listing) {
    return get('api/sec', { sector: listing.name, milieu: listing.milieu, type: 'TabDelimited' }, false);
}

/** What TravellerMap says about a sector besides its worlds: subsector and allegiance names, data source and routes */
export async function metadata(listing) {
    const response = await get('api/metadata', { sector: listing.name, milieu: listing.milieu }, true);
    const subsectorNames = {};
    for (const subsector of response.Subsectors ?? []) {
        if (subsector.Index && subsector.Name) subsectorNames[subsector.Index] = subsector.Name;
    }
    const allegianceNames = {};
    for (const allegiance of response.Allegiances ?? []) {
        if (allegiance.Code && allegiance.Name != null) allegianceNames[allegiance.Code] = allegiance.Name;
    }
    // Hexes come as strings, though "1106" might as well be a number
    const hex = (value) => (typeof value === 'number' ? String(value).padStart(4, '0') : value);
    const routes = [];
    for (const route of response.Routes ?? []) {
        const start = hex(route.Start), end = hex(route.End);
        if (!start || !end) continue;
        const entry = { start, end, startOffsetX: route.StartOffsetX ?? 0, startOffsetY: route.StartOffsetY ?? 0,
            endOffsetX: route.EndOffsetX ?? 0, endOffsetY: route.EndOffsetY ?? 0 };
        if (route.Allegiance) entry.allegiance = route.Allegiance;
        if (route.Type) entry.type = route.Type;
        routes.push(entry);
    }
    const result = { subsectorNames, allegianceNames, routes };
    if (response.DataFile?.Source) result.dataSource = response.DataFile.Source;
    return result;
}

/**
 * Whether world maps can be fetched: only through the Estrelas launcher, as TravellerMap's image store doesn't let a web
 * page fetch from it. Run from the website (or any other server), world maps are left out and worlds get generated
 * surfaces.
 */
export function canFetchWorldMaps() {
    return launcherAvailable();
}

/** The world map drawn for a hex, as JPEG bytes, if there is one: TravellerMap has a thumbnail exactly for the hexes it has a map of */
export async function worldMap(abbreviation, hex) {
    if (!(await canFetchWorldMaps())) return null;
    const file = encodeURIComponent(`${abbreviation} ${hex}.jpg`);
    // Maps are a nicety, so a slow one is given up on quickly
    const options = { retries: 2, timeout: 15000 };
    const thumb = await send(`${images}/thumbs/${file}`, { method: 'HEAD', what: file, ...options });
    if (thumb.status !== 200) return null;
    const response = await send(`${images}/${file}`, { what: file, ...options });
    if (response.status !== 200) return null;
    return new Uint8Array(await response.arrayBuffer());
}
