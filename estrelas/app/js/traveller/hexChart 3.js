//
//  hexChart.js
//  Estrelas (web) — Traveller module
//
//  A hex-map universe drawn as TravellerMap draws its charts: sectors of 32 × 40 hexes in 16 lettered subsectors, each
//  listed world a dot (blue with water, tan without, a scatter of rocks for a belt) with its starport, name, profile,
//  bases, gas giants and zone, and the app's own filters ringed round it. Zoomed out, the subsector and sector names
//  take over from the worlds. Drag to pan, scroll or pinch to zoom; click a hex to show it in the side panel and double
//  click it to open its system. Also what TravellerMap lists for a system, for the side panel; the notice of newer
//  data; and the New Traveller Universe, Add Sectors, Data Versions and Review sheets. Ports HexChartView.swift,
//  TravellerProvider.swift and the views of TravellerUpdates.swift.
//
//  Traveller is a registered trademark of Far Future Enterprises. Sector data and world maps come from
//  TravellerMap.com and its contributors, used under FFE's fair use policy; the app is free and non-commercial.
//

import { h, button, icon, toggle, panel, sectionHeader } from '../ui/components.js';
import { t, locale } from '../ui/i18n.js';
import { showSheet } from '../ui/sheets.js';
import * as Settings from '../ui/settings.js';
import { canEdit, isGMEdition } from '../edition.js';
import { randomSeed } from '../gen/random.js';
import { hasPlanets, hasHabitableWorld, hasAsteroidBelt, hasGasGiant } from '../model/planetarySystem.js';
import { hasVisibleNotes } from '../model/savedData.js';
import { canSee } from '../edition.js';
import { travelAdvisoryCSS, notesCSS } from '../scene/starMap.js';
import { parseUWP, uwpValue, uwpDigits, isXboat } from './travellerData.js';
import * as Client from './travellerMapClient.js';
import * as Importer from './travellerImporter.js';

const sqrt3 = 1.7320508;
const minimumRadius = 1.5;
const maximumRadius = 160;
/** Room the side panel takes on the right, kept clear when fitting */
const panelAllowance = 360;
const colours = {
    background: 'rgb(5 5 13)', grid: 'rgb(82 82 82)', subsectorLine: 'rgb(115 115 115)', sectorLine: 'rgb(179 179 179)',
    water: 'rgb(64 140 255)', dry: 'rgb(219 189 133)', amber: 'rgb(255 204 26)', red: 'rgb(242 38 26)',
    selection: 'rgb(77 204 255)', xboat: 'rgb(224 92 143)', otherRoute: 'rgb(140 173 217)',
};
export const xboatColor = colours.xboat;
const showRoutesKey = 'travellerShowRoutes';

function showRoutes() {
    try {
        return localStorage.getItem(`estrelas.${showRoutesKey}`) !== 'false';
    } catch {
        return true;
    }
}

function setShowRoutes(on) {
    try {
        localStorage.setItem(`estrelas.${showRoutesKey}`, String(on));
    } catch {
        // A convenience only
    }
}

// MARK: updates

/**
 * Keeps a hex universe's TravellerMap data versioned. Each time the universe opens, its sectors are fetched again
 * quietly (and skipped without a word when offline); a sector whose data has changed since it was last seen raises a
 * notice saying what changed, with the choice of keeping the version in use or taking the new one.
 */
class TravellerUpdates extends EventTarget {
    constructor() {
        super();
        /** Newer versions found, by universe id: { sectorID, sectorName, snapshot, changes, metadataChanged } */
        this.pending = new Map();
        this.working = new Set();
        this.failure = new Map();
        this.retryActions = new Map();
        this.checked = new Set();
        /** The system to pick on the chart once the universe has been read again, by universe id */
        this.reselect = new Map();
    }

    changed() {
        this.dispatchEvent(new Event('change'));
    }

    /** Fetches each of the universe's sectors again, once per page load, and notes any version not seen before */
    async check(universe, store, onFilesChanged) {
        const source = await Importer.loadSource(store.folder);
        // Players' copies of the GM's universes are the GM's to update; universes of TravellerMap's data alone are
        // their makers' own
        if (this.checked.has(universe.id) || !source || !(isGMEdition || Importer.isDataOnly(source))) return;
        this.checked.add(universe.id);
        const found = [];
        const routes = new Map();
        for (const sector of source.sectors) {
            let snapshot;
            try {
                snapshot = await Importer.fetchSnapshot(sector.listing);
            } catch {
                break;
            }
            const current = Importer.currentSnapshot(sector);
            // Routes are only drawn, so a change to them is taken quietly into every version seen
            if (JSON.stringify(current?.metadata.routes ?? null) !== JSON.stringify(snapshot.metadata.routes)) {
                routes.set(Importer.sectorID(sector), snapshot.metadata.routes);
            }
            if (sector.snapshots.some((s) => s.id === snapshot.id) || !current) continue;
            found.push({ sectorID: Importer.sectorID(sector), sectorName: sector.listing.name, snapshot,
                changes: Importer.changesBetween(Importer.snapshotWorlds(current), Importer.snapshotWorlds(snapshot)),
                metadataChanged: JSON.stringify(current.metadata.subsectorNames) !== JSON.stringify(snapshot.metadata.subsectorNames) });
        }
        if (found.length) this.pending.set(universe.id, found);
        if (routes.size && !store.readOnly) {
            for (const sector of source.sectors) {
                const fetched = routes.get(Importer.sectorID(sector));
                if (fetched) for (const snapshot of sector.snapshots) snapshot.metadata.routes = fetched;
            }
            await Importer.saveSource(store.folder, source);
            onFilesChanged({ chartOnly: true });
        }
        this.changed();
    }

    /** Keeps the version in use, remembering the new one so it can be taken later and isn't offered again */
    async keep(universe, store, update) {
        this.remove(universe, update);
        const source = await Importer.loadSource(store.folder);
        const sector = source?.sectors.find((s) => Importer.sectorID(s) === update.sectorID);
        if (!sector) return;
        sector.snapshots.push(update.snapshot);
        await Importer.saveSource(store.folder, source);
    }

    /** Takes the new version: remembered, put in use, and the hexes it changes redone */
    async use(universe, store, update, onFilesChanged) {
        await this.keep(universe, store, update);
        this.run(universe, () => Importer.switchVersion(store, update.sectorID, update.snapshot.id), onFilesChanged);
    }

    useSnapshot(universe, store, sectorID, snapshotID, onFilesChanged) {
        this.run(universe, () => Importer.switchVersion(store, sectorID, snapshotID), onFilesChanged);
    }

    relayout(universe, store, systemID, layout, onFilesChanged) {
        if (layout < 0) return;
        this.run(universe, async () => {
            await Importer.relayout(store, systemID, layout);
            this.reselect.set(universe.id, systemID);
        }, onFilesChanged);
    }

    add(universe, store, listings, onFilesChanged) {
        if (!listings.length) return;
        this.run(universe, () => Importer.addSectors(store, listings), onFilesChanged);
    }

    async run(universe, work, onFilesChanged) {
        if (this.working.has(universe.id)) return;
        this.working.add(universe.id);
        this.failure.delete(universe.id);
        this.changed();
        try {
            await work();
            this.retryActions.delete(universe.id);
            this.working.delete(universe.id);
            this.changed();
            onFilesChanged({});
        } catch (error) {
            console.error(error);
            this.working.delete(universe.id);
            this.failure.set(universe.id, String(error.message ?? error));
            this.retryActions.set(universe.id, () => this.run(universe, work, onFilesChanged));
            this.changed();
        }
    }

    retry(universe) {
        const action = this.retryActions.get(universe.id);
        this.retryActions.delete(universe.id);
        this.failure.delete(universe.id);
        action?.();
        this.changed();
    }

    dismissFailure(universe) {
        this.failure.delete(universe.id);
        this.retryActions.delete(universe.id);
        this.changed();
    }

    remove(universe, update) {
        const list = (this.pending.get(universe.id) ?? []).filter((u) => u !== update);
        if (list.length) this.pending.set(universe.id, list);
        else this.pending.delete(universe.id);
        this.changed();
    }
}

export const updates = new TravellerUpdates();

/** A summary of a pending update's changes */
function updateSummary(update) {
    const count = (kind) => update.changes.filter((c) => c.kind === kind).length;
    const parts = [];
    if (count('changed')) parts.push(t('%lld worlds changed', count('changed')));
    if (count('added')) parts.push(t('%lld added', count('added')));
    if (count('removed')) parts.push(t('%lld removed', count('removed')));
    if (update.metadataChanged) parts.push(t('subsector names changed'));
    return parts.length ? new Intl.ListFormat(locale(), { type: 'conjunction' }).format(parts) : t('minor changes');
}

const dateText = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString(locale(), { dateStyle: 'medium', timeStyle: 'short' });
};

// MARK: the chart

/**
 * The chart over the 3D star field of a hex universe. `options`: universe (library entry), store, map (the StarMap of
 * the universe, for selecting and opening systems), getState() (filters and target), onFilesChanged({ chartOnly }).
 */
export class HexChart {
    constructor({ universe, store, map, getState, onFilesChanged }) {
        Object.assign(this, { universe, store, map, getState, onFilesChanged });
        this.sectors = [];
        this.origin = { x: 0, y: 0 };
        this.hexes = [];
        this.hexByID = new Map();
        this.radius = 20;
        this.offset = { x: 0, y: 0 };
        this.fitted = false;
        this.source = null;
        this.canvas = h('canvas', { class: 'hex-chart-canvas', 'aria-label': t('Hex map') });
        this.banner = h('div', { class: 'hex-chart-banner' });
        this.controls = h('div', { class: 'hex-chart-controls' });
        this.element = h('div', { class: 'hex-chart' }, this.canvas, this.banner, this.controls);
        document.body.append(this.element);
        this.onUpdates = () => this.renderBanner();
        updates.addEventListener('change', this.onUpdates);
        this.install();
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.element);
    }

    dispose() {
        this.disposed = true;
        updates.removeEventListener('change', this.onUpdates);
        this.resizeObserver.disconnect();
        this.element.remove();
    }

    /** Hidden while a system's planetary view is open */
    setVisible(visible) {
        this.element.hidden = !visible;
        if (visible) this.draw();
    }

    async load() {
        this.source = await Importer.loadSource(this.store.folder);
        const source = this.source;
        if (!source) return;
        const hexes = [];
        for (const sector of source.sectors) {
            for (const world of Importer.snapshotWorlds(Importer.currentSnapshot(sector))) {
                const pbg = [...world.pbg];
                hexes.push({
                    id: Importer.systemID(sector.listing, world.hex),
                    column: (sector.listing.x - source.originX) * Importer.columns + (Number.parseInt(world.hex.slice(0, 2), 10) || 0) - 1,
                    row: (sector.listing.y - source.originY) * Importer.rows + (Number.parseInt(world.hex.slice(2), 10) || 0) - 1,
                    world, uwp: parseUWP(world.uwp), gasGiants: pbg.length > 2 ? uwpValue(pbg[2]) : 0, sector,
                });
            }
        }
        this.sectors = source.sectors;
        this.origin = { x: source.originX, y: source.originY };
        this.hexes = hexes;
        this.hexByID = new Map(hexes.map((hex) => [hex.id, hex]));
        this.mapFiles = new Set();
        try {
            if (await this.store.folder.exists(`charts/${Importer.kind}/maps`)) {
                const maps = await this.store.folder.subfolder(`charts/${Importer.kind}/maps`);
                for (const entry of await maps.entries()) if (entry.kind === 'file') this.mapFiles.add(entry.name);
            }
        } catch {
            // No maps kept
        }
        this.renderControls();
        this.renderBanner();
        this.fitIfReady();
        this.draw();
        // A system just laid out again is picked again once the universe has been read back
        const reselect = updates.reselect.get(this.universe.id);
        if (reselect) {
            updates.reselect.delete(this.universe.id);
            this.select(reselect);
        }
    }

    // MARK: geometry

    /** The centre of a hex, by its column and row across the chart; hexes are flat-topped, odd columns (from 0) lower */
    centre(column, row) {
        const lowered = ((column % 2) + 2) % 2 === 1;
        return { x: this.offset.x + (column * 1.5 + 1) * this.radius, y: this.offset.y + (row + (lowered ? 1 : 0.5)) * sqrt3 * this.radius };
    }

    hexAt(point) {
        const column = Math.trunc(((point.x - this.offset.x) / this.radius - 1) / 1.5);
        const rowGuess = Math.trunc((point.y - this.offset.y) / (sqrt3 * this.radius));
        let best = null;
        for (const hex of this.hexes) {
            if (Math.abs(hex.column - column) > 1 || Math.abs(hex.row - rowGuess) > 1) continue;
            const c = this.centre(hex.column, hex.row);
            const distance = Math.hypot(c.x - point.x, c.y - point.y);
            if (distance < this.radius * 0.95 && distance < (best?.distance ?? Infinity)) best = { hex, distance };
        }
        return best?.hex ?? null;
    }

    get bounds() {
        if (!this.sectors.length) return null;
        const xs = this.sectors.map((s) => s.listing.x - this.origin.x), ys = this.sectors.map((s) => s.listing.y - this.origin.y);
        return { columns: [Math.min(...xs) * Importer.columns, (Math.max(...xs) + 1) * Importer.columns - 1],
            rows: [Math.min(...ys) * Importer.rows, (Math.max(...ys) + 1) * Importer.rows - 1] };
    }

    get size() {
        return { width: this.element.clientWidth, height: this.element.clientHeight };
    }

    get viewCentre() {
        return { x: (this.size.width - panelAllowance) / 2, y: this.size.height / 2 };
    }

    fitIfReady() {
        if (this.fitted || !this.hexes.length || !(this.size.width > 0)) return;
        this.fitted = true;
        const id = this.getState().targetID;
        if (id && this.hexByID.has(id)) this.showSubsector(id);
        else this.fit();
    }

    /** Fits a range of hexes in the view, left of the side panel */
    show(columns, rows) {
        const width = Math.max(this.size.width - panelAllowance - 40, 100), height = Math.max(this.size.height - 80, 100);
        const spanX = (columns[1] - columns[0] + 1) * 1.5 + 0.5, spanY = (rows[1] - rows[0] + 1 + 0.5) * sqrt3;
        const fitted = Math.min(Math.max(Math.min(width / spanX, height / spanY), minimumRadius), maximumRadius);
        this.radius = fitted;
        this.offset = { x: 20 + (width - spanX * fitted) / 2 - columns[0] * 1.5 * fitted,
            y: 40 + (height - spanY * fitted) / 2 - rows[0] * sqrt3 * fitted };
        this.draw();
    }

    fit() {
        const bounds = this.bounds;
        if (bounds) this.show(bounds.columns, bounds.rows);
    }

    showSubsector(id) {
        const hex = this.hexByID.get(id);
        if (!hex) return;
        const column = Math.floor(hex.column / 8) * 8, row = Math.floor(hex.row / 10) * 10;
        this.show([column, column + 7], [row, row + 9]);
    }

    /** Brings a hex into view if it's outside it, as when a system is found by searching */
    reveal(id) {
        const hex = this.hexByID.get(id);
        if (!hex) return;
        const c = this.centre(hex.column, hex.row);
        const r = this.radius * 2;
        if (c.x >= r && c.x <= this.size.width - panelAllowance - r && c.y >= r && c.y <= this.size.height - r) return;
        if (this.radius < 8) {
            this.showSubsector(id);
        } else {
            this.offset.x += this.viewCentre.x - c.x;
            this.offset.y += this.viewCentre.y - c.y;
            this.draw();
        }
    }

    zoom(proposed, about) {
        const radius = Math.min(Math.max(proposed, minimumRadius), maximumRadius);
        const factor = radius / this.radius;
        this.offset = { x: about.x - (about.x - this.offset.x) * factor, y: about.y - (about.y - this.offset.y) * factor };
        this.radius = radius;
        this.draw();
    }

    // MARK: input

    install() {
        const canvas = this.canvas;
        let drag = null;
        const pointers = new Map();
        let pinch = null;
        const local = (event) => {
            const rect = canvas.getBoundingClientRect();
            return { x: event.clientX - rect.left, y: event.clientY - rect.top };
        };
        canvas.addEventListener('pointerdown', (event) => {
            canvas.setPointerCapture(event.pointerId);
            pointers.set(event.pointerId, local(event));
            if (pointers.size === 2) {
                const [a, b] = [...pointers.values()];
                pinch = { distance: Math.hypot(a.x - b.x, a.y - b.y), radius: this.radius };
                drag = null;
            } else {
                drag = { start: local(event), offset: { ...this.offset }, moved: false };
            }
        });
        canvas.addEventListener('pointermove', (event) => {
            if (!pointers.has(event.pointerId)) return;
            pointers.set(event.pointerId, local(event));
            if (pinch && pointers.size === 2) {
                const [a, b] = [...pointers.values()];
                this.zoom(pinch.radius * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(pinch.distance, 1),
                    { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
                return;
            }
            if (!drag) return;
            const p = local(event);
            const dx = p.x - drag.start.x, dy = p.y - drag.start.y;
            if (!drag.moved && Math.hypot(dx, dy) < 3) return;
            drag.moved = true;
            this.offset = { x: drag.offset.x + dx, y: drag.offset.y + dy };
            this.draw();
        });
        const end = (event) => {
            pointers.delete(event.pointerId);
            if (pointers.size < 2) pinch = null;
            if (drag && !drag.moved && event.type === 'pointerup') {
                const hex = this.hexAt(local(event));
                if (hex) this.select(hex.id);
            }
            drag = null;
        };
        canvas.addEventListener('pointerup', end);
        canvas.addEventListener('pointercancel', end);
        canvas.addEventListener('dblclick', (event) => {
            const hex = this.hexAt(local(event));
            if (hex) this.open(hex.id);
        });
        canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
            this.zoom(this.radius * (1 - delta * 0.0025), local(event));
        }, { passive: false });
        // Safari's pinch
        canvas.addEventListener('gesturestart', (event) => {
            event.preventDefault();
            pinch = { radius: this.radius, gesture: true };
        });
        canvas.addEventListener('gesturechange', (event) => {
            event.preventDefault();
            if (pinch?.gesture) this.zoom(pinch.radius * event.scale, local(event));
        });
    }

    /** Shows a hex's system in the side panel, or its listing alone where no system was generated for it */
    select(id) {
        this.selectedID = id;
        const index = this.map.systemIndexWithID(id);
        if (index !== null) this.map.selectSystem(index);
        else this.map.emit('target', { star: null, chartID: id });
        this.reveal(id);
        this.draw();
    }

    /** From the side panel's search */
    selectIndex(index) {
        const id = this.map.field.systems[index]?.id;
        if (id) this.select(id);
    }

    open(id) {
        const index = this.map.systemIndexWithID(id);
        if (index === null) return;
        this.selectedID = id;
        this.map.selectSystem(index, { open: true });
    }

    get selectedSystemID() {
        return this.getState().targetID ?? this.selectedID ?? null;
    }

    // MARK: drawing

    resize() {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const { width, height } = this.size;
        if (!width || !height) return;
        this.canvas.width = Math.round(width * ratio);
        this.canvas.height = Math.round(height * ratio);
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.ratio = ratio;
        this.fitIfReady();
        this.draw();
    }

    draw() {
        if (this.drawPending || this.disposed) return;
        this.drawPending = true;
        requestAnimationFrame(() => {
            this.drawPending = false;
            this.drawNow();
        });
    }

    drawNow() {
        const context = this.canvas.getContext('2d');
        const ratio = this.ratio ?? 1;
        const { width, height } = this.size;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.fillStyle = colours.background;
        context.fillRect(0, 0, width, height);
        const r = this.radius, s = sqrt3 * r;
        const firstColumn = Math.floor((-this.offset.x / r - 1) / 1.5) - 1;
        const lastColumn = Math.ceil(((width - this.offset.x) / r) / 1.5) + 1;
        const firstRow = Math.floor(-this.offset.y / s) - 1;
        const lastRow = Math.ceil((height - this.offset.y) / s) + 1;
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        for (const sector of this.sectors) {
            const column0 = (sector.listing.x - this.origin.x) * Importer.columns;
            const row0 = (sector.listing.y - this.origin.y) * Importer.rows;
            if (column0 + 31 < firstColumn || column0 > lastColumn || row0 + 39 < firstRow || row0 > lastRow) continue;
            // The hex grid, once hexes are big enough to tell apart
            if (r >= 5) {
                context.beginPath();
                for (let column = Math.max(column0, firstColumn); column <= Math.min(column0 + 31, lastColumn); column++) {
                    for (let row = Math.max(row0, firstRow); row <= Math.min(row0 + 39, lastRow); row++) {
                        this.hexPath(context, this.centre(column, row));
                    }
                }
                context.strokeStyle = colours.grid;
                context.lineWidth = r > 30 ? 1 : 0.5;
                context.stroke();
            }
            // Subsector and sector edges
            const lineX = (k) => this.offset.x + ((column0 + 8 * k - 0.5) * 1.5 + 1) * r;
            const lineY = (k) => this.offset.y + (row0 + 10 * k + 0.25) * s;
            context.beginPath();
            for (let k = 1; k < 4; k++) {
                context.moveTo(lineX(k), lineY(0));
                context.lineTo(lineX(k), lineY(4));
                context.moveTo(lineX(0), lineY(k));
                context.lineTo(lineX(4), lineY(k));
            }
            context.setLineDash([4, 3]);
            context.strokeStyle = colours.subsectorLine;
            context.lineWidth = 1;
            context.stroke();
            context.setLineDash([]);
            context.strokeStyle = colours.sectorLine;
            context.lineWidth = 1.5;
            context.strokeRect(lineX(0), lineY(0), lineX(4) - lineX(0), lineY(4) - lineY(0));

            // Zoomed out, names stand in for the worlds
            const snapshot = Importer.currentSnapshot(sector);
            if (r < 9) {
                const names = snapshot?.metadata.subsectorNames ?? {};
                if (r >= 3) {
                    context.font = `500 ${Math.max(r * 1.6, 8)}px system-ui, sans-serif`;
                    context.fillStyle = 'rgb(191 191 191 / 0.8)';
                    for (let index = 0; index < 16; index++) {
                        const name = names[String.fromCharCode(65 + index)];
                        if (!name) continue;
                        context.fillText(name, (lineX(index % 4) + lineX(index % 4 + 1)) / 2,
                            (lineY(Math.trunc(index / 4)) + lineY(Math.trunc(index / 4) + 1)) / 2);
                    }
                }
                if (r < 4.5) {
                    context.font = `600 ${Math.max(r * 6, 12)}px system-ui, sans-serif`;
                    context.fillStyle = 'rgb(255 255 255 / 0.85)';
                    context.fillText(sector.listing.name, (lineX(0) + lineX(4)) / 2, (lineY(0) + lineY(4)) / 2);
                }
            } else {
                context.font = '600 12px system-ui, sans-serif';
                context.fillStyle = 'rgb(204 204 204)';
                context.textAlign = 'left';
                context.textBaseline = 'bottom';
                context.fillText(sector.listing.name.toUpperCase(), lineX(0) + 6, lineY(0) - 4);
                context.textAlign = 'center';
                context.textBaseline = 'middle';
            }
        }

        if (showRoutes()) this.drawRoutes(context, width, height);
        const highlights = this.highlights();
        for (const hex of this.hexes) {
            if (hex.column < firstColumn || hex.column > lastColumn || hex.row < firstRow || hex.row > lastRow) continue;
            this.drawWorld(context, hex, highlights);
        }
    }

    /** Each sector's routes, hex centre to hex centre under the worlds: xboat routes solid, others dashed */
    drawRoutes(context, width, height) {
        const r = this.radius;
        const xboat = [], other = [];
        for (const sector of this.sectors) {
            for (const route of Importer.currentSnapshot(sector)?.metadata.routes ?? []) {
                const centre = (hex, ox, oy) => {
                    if (hex?.length !== 4) return null;
                    const column = Number.parseInt(hex.slice(0, 2), 10), row = Number.parseInt(hex.slice(2), 10);
                    if (!Number.isFinite(column) || !Number.isFinite(row)) return null;
                    return this.centre((sector.listing.x + ox - this.origin.x) * Importer.columns + column - 1,
                        (sector.listing.y + oy - this.origin.y) * Importer.rows + row - 1);
                };
                const a = centre(route.start, route.startOffsetX ?? 0, route.startOffsetY ?? 0);
                const b = centre(route.end, route.endOffsetX ?? 0, route.endOffsetY ?? 0);
                if (!a || !b) continue;
                if (Math.max(a.x, b.x) < -r * 2 || Math.min(a.x, b.x) > width + r * 2 || Math.max(a.y, b.y) < -r * 2 ||
                    Math.min(a.y, b.y) > height + r * 2) continue;
                (isXboat(route) ? xboat : other).push([a, b]);
            }
        }
        const lineWidth = Math.min(Math.max(r * 0.09, 1), 5);
        context.lineCap = 'round';
        context.lineWidth = lineWidth;
        const stroke = (lines, colour, dash) => {
            context.beginPath();
            for (const [a, b] of lines) {
                context.moveTo(a.x, a.y);
                context.lineTo(b.x, b.y);
            }
            context.setLineDash(dash);
            context.strokeStyle = colour;
            context.stroke();
        };
        stroke(other, 'rgb(140 173 217 / 0.75)', [lineWidth * 3, lineWidth * 2]);
        stroke(xboat, 'rgb(224 92 143 / 0.85)', []);
        context.setLineDash([]);
        context.lineCap = 'butt';
    }

    hexPath(context, c) {
        const r = this.radius, hh = sqrt3 / 2 * r;
        context.moveTo(c.x - r, c.y);
        context.lineTo(c.x - r / 2, c.y - hh);
        context.lineTo(c.x + r / 2, c.y - hh);
        context.lineTo(c.x + r, c.y);
        context.lineTo(c.x + r / 2, c.y + hh);
        context.lineTo(c.x - r / 2, c.y + hh);
        context.closePath();
    }

    /** The colours of the filters each system matches, by id, for the filters turned on */
    highlights() {
        const { filters } = this.getState();
        const css = getComputedStyle(document.body);
        const role = (name) => css.getPropertyValue(`--${name}`).trim() || 'white';
        const advisories = Settings.get('showTravelAdvisories') ? (this.map.travelAdvisories ?? {}) : {};
        const result = new Map();
        const on = (name) => filters?.[name];
        if (!['planets', 'habitable', 'belts', 'gasGiants', 'essentialOnly', 'noTravel', 'notes'].some(on)) return result;
        for (const system of this.map.field.systems) {
            const planetary = system.planetarySystem;
            const list = [];
            if (on('planets') && planetary && hasPlanets(planetary)) list.push(role('info'));
            if (on('habitable') && planetary && hasHabitableWorld(planetary)) list.push(role('highlight'));
            if (on('belts') && planetary && hasAsteroidBelt(planetary)) list.push(role('control'));
            if (on('gasGiants') && planetary && hasGasGiant(planetary)) list.push(role('accent'));
            if (Settings.get('showTravelAdvisories')) {
                if (on('essentialOnly') && advisories[system.id] === 'essentialOnly') list.push(travelAdvisoryCSS.essentialOnly);
                if (on('noTravel') && advisories[system.id] === 'noTravel') list.push(travelAdvisoryCSS.noTravel);
            }
            if (on('notes') && hasVisibleNotes(this.map.annotations?.[system.id], canSee)) list.push(notesCSS);
            if (list.length) result.set(system.id, list);
        }
        return result;
    }

    drawWorld(context, hex, highlights) {
        const c = this.centre(hex.column, hex.row);
        const r = this.radius;
        if (hex.id === this.selectedSystemID) {
            context.beginPath();
            this.hexPath(context, c);
            context.fillStyle = 'rgb(77 204 255 / 0.22)';
            context.fill();
            context.strokeStyle = colours.selection;
            context.lineWidth = 2;
            context.stroke();
        }
        // The world: a scatter of rocks for a belt, otherwise a dot, blue with water and tan without
        const dot = Math.max(r * 0.2, 1.2);
        if (hex.uwp.size === 0) {
            context.fillStyle = 'rgb(204 204 204)';
            for (const [dx, dy] of [[-0.6, -0.3], [0.5, -0.5], [0.1, 0.4], [-0.3, 0.6], [0.7, 0.3]]) {
                context.beginPath();
                context.arc(c.x + dx * dot, c.y + dy * dot, dot * 0.3, 0, Math.PI * 2);
                context.fill();
            }
        } else {
            context.beginPath();
            context.arc(c.x, c.y, dot, 0, Math.PI * 2);
            context.fillStyle = hex.uwp.hydrographics > 0 ? colours.water : colours.dry;
            context.fill();
        }
        if (r < 5) return;

        // Filter rings, one outside another, as round the stars of the 3D star field
        (highlights.get(hex.id) ?? []).forEach((colour, index) => {
            const ring = dot + 2 + index * Math.max(r * 0.07, 1.5);
            context.beginPath();
            context.arc(c.x, c.y, ring, 0, Math.PI * 2);
            context.strokeStyle = colour;
            context.lineWidth = Math.max(r * 0.03, 1);
            context.stroke();
        });
        // Amber and red zones
        const advisory = Settings.get('showTravelAdvisories') ? this.map.travelAdvisories?.[hex.id] : null;
        if (advisory) {
            context.beginPath();
            context.arc(c.x, c.y, r * 0.72, 0, Math.PI * 2);
            context.strokeStyle = advisory === 'noTravel' ? colours.red : colours.amber;
            context.lineWidth = Math.max(r * 0.05, 1);
            context.setLineDash(advisory === 'noTravel' ? [] : [r * 0.12, r * 0.08]);
            context.stroke();
            context.setLineDash([]);
        }
        if (r < 13) return;

        const name = this.map.annotations?.[hex.id]?.system?.name || hex.world.name || '';
        // Populous worlds' names in capitals, as TravellerMap has them
        const populous = hex.uwp.population >= 9;
        context.fillStyle = 'white';
        context.font = `${populous ? 700 : 400} ${r * 0.3}px system-ui, sans-serif`;
        context.fillText(populous ? name.toUpperCase() : name, c.x, c.y + r * 0.42);
        context.font = `600 ${r * 0.32}px system-ui, sans-serif`;
        context.fillText(String(hex.uwp.starport), c.x, c.y - r * 0.42);
        // Gas giants: a small disc at the upper right
        if (hex.gasGiants > 0) {
            const g = Math.max(r * 0.08, 1.5);
            context.beginPath();
            context.arc(c.x + r * 0.42, c.y - r * 0.3, g, 0, Math.PI * 2);
            context.fill();
        }
        // Bases at the left: naval star, scout triangle, others a square
        const has = (letters) => [...hex.world.bases].some((b) => letters.includes(b));
        const marks = [];
        if (has('NKC')) marks.push('★');
        if (has('SW')) marks.push('▲');
        if (has('MDTX')) marks.push('■');
        context.font = `${r * 0.2}px system-ui, sans-serif`;
        marks.forEach((mark, index) => context.fillText(mark, c.x - r * 0.45, c.y - r * 0.3 + index * r * 0.22));
        if (r < 22) return;
        context.fillStyle = 'rgb(153 153 153)';
        context.font = `${r * 0.17}px system-ui, sans-serif`;
        context.fillText(hex.world.hex, c.x, c.y - r * 0.72);
        context.fillStyle = 'rgb(217 217 217)';
        context.font = `${r * 0.2}px ui-monospace, monospace`;
        context.fillText(hex.world.uwp, c.x, c.y + r * 0.66);
    }

    // MARK: controls and notices

    renderControls() {
        const centre = () => this.viewCentre;
        const id = this.selectedSystemID;
        const canChange = isGMEdition || Importer.isDataOnly(this.source);
        this.controls.replaceChildren(
            button(icon('minus'), { color: 'control', pill: false, title: t('Zoom out'), onClick: () => this.zoom(this.radius / 1.5, centre()) }),
            button(icon('plus'), { color: 'control', pill: false, title: t('Zoom in'), onClick: () => this.zoom(this.radius * 1.5, centre()) }),
            button(icon('fit'), { color: 'control', pill: false, title: t('Show every sector'), onClick: () => this.fit() }),
            id && this.hexByID.has(id) ? button(icon('hex'), { color: 'control', pill: false, title: t("Zoom to the selected world's subsector"),
                onClick: () => this.showSubsector(id) }) : null,
            canChange ? button(t('Add Sectors…'), { color: 'info', pill: false, title: t("Add more of TravellerMap's sectors, such as this one's neighbours"),
                onClick: () => showAddSectors(this) }) : null,
            canChange ? button(t('Data Versions…'), { color: 'info', pill: false, title: t("The versions of TravellerMap's data this universe has fetched, and which is in use"),
                onClick: () => showDataVersions(this) }) : null,
            h('span', { class: 'credit' }, t('Data © TravellerMap.com')));
    }

    renderBanner() {
        const id = this.universe.id;
        const items = [];
        for (const update of updates.pending.get(id) ?? []) {
            items.push(h('div', { class: 'notice' }, icon('refresh'),
                h('div', { class: 'text' }, h('strong', {}, t('TravellerMap has updated %@', update.sectorName)),
                    h('span', {}, updateSummary(update))),
                h('span', { class: 'spacer' }),
                h('button', { type: 'button', onclick: () => showChanges(this, update) }, t('Review…')),
                h('button', { type: 'button', onclick: () => updates.keep(this.universe, this.store, update) }, t('Keep Mine')),
                h('button', { type: 'button', class: 'default', onclick: () => updates.use(this.universe, this.store, update, this.onFilesChanged) }, t('Use New'))));
        }
        if (updates.working.has(id)) items.push(h('div', { class: 'notice small' }, h('span', { class: 'spinner' }), t('Updating the universe…')));
        const failure = updates.failure.get(id);
        if (failure) {
            items.push(h('div', { class: 'notice' }, icon('warning'),
                h('span', { class: 'text' }, t("Couldn't update the universe: %@", failure)), h('span', { class: 'spacer' }),
                updates.retryActions.has(id) ? h('button', { type: 'button', class: 'default', onclick: () => updates.retry(this.universe) }, t('Retry')) : null,
                h('button', { type: 'button', onclick: () => updates.dismissFailure(this.universe) }, t('Dismiss'))));
        }
        this.banner.replaceChildren(...items);
    }

    // MARK: the side panel

    /** What TravellerMap lists for the selected system, shown in the side panel above its data */
    get details() {
        const id = this.selectedSystemID;
        const hex = id ? this.hexByID.get(id) : null;
        if (!hex) return null;
        const { world, sector } = hex;
        const uwp = hex.uwp;
        const metadata = Importer.currentSnapshot(sector)?.metadata;
        const row = (label, value) => h('div', { class: 'traveller-row' }, h('span', { class: 'label' }, label), h('span', { class: 'value' }, value));
        const layout = this.source ? Importer.layoutOf(this.source, id) : 0;
        const working = updates.working.has(this.universe.id);
        const subsector = metadata?.subsectorNames?.[world.subsector];
        const hasSystem = this.map.systemIndexWithID(id) !== null;
        const mapFile = `${id}.jpg`;
        const element = h('div', { class: 'traveller-world' },
            h('div', { class: 'title-row' }, h('span', { class: 'name' }, world.name || world.hex), h('span', { class: 'uwp' }, world.uwp)),
            h('div', { class: 'where' }, `${sector.listing.name} ${world.hex}${subsector ? ` · ${subsector}` : ''}`),
            row(t('Starport'), String(uwp.starport)),
            row(t('Size'), uwp.size === 0 ? t('Belt') : uwp.size < 0 ? t('Small') : `${(uwp.size * 1600).toLocaleString(locale())} km`),
            row(t('Population'), `${uwp.population} (${world.pbg})`),
            row(t('Tech level'), uwpDigits[Math.min(uwp.techLevel, uwpDigits.length - 1)]),
            world.bases ? row(t('Bases'), world.bases) : null,
            world.remarks ? row(t('Remarks'), world.remarks) : null,
            world.zone ? row(t('Zone'), world.zone === 'R' ? t('Red') : t('Amber')) : null,
            row(t('Allegiance'), metadata?.allegianceNames?.[world.allegiance] ?? world.allegiance),
            world.stars ? row(t('Stars'), world.stars) : null,
            world.importance ? row(t('Ix Ex Cx'), `${world.importance} ${world.economics} ${world.culture}`) : null,
            h('div', { class: 'button-row' },
                // Only where a system has been generated for the hex
                hasSystem ? button(t('Open System'), { color: 'primary', height: 22, disabled: working, onClick: () => this.open(id) }) : null,
                // TravellerMap's own map of the world, where it has one
                this.mapFiles?.has(mapFile) ? button(t('World Map'), { color: 'info', height: 22, title: t("Show TravellerMap's map of the world"),
                    onClick: () => showWorldMap(this, world.name || world.hex, mapFile) }) : null,
                canEdit && hasSystem ? button(t('Regenerate'), { color: 'accent', height: 22, disabled: working,
                    title: t("Lay the system out again: TravellerMap's world stays as listed, and everything generated round it is drawn afresh"),
                    onClick: () => this.askRelayout(id, layout + 1) }) : null,
                canEdit && hasSystem && layout > 0 ? button(t('Previous Layout'), { color: 'accent', height: 22, disabled: working,
                    title: t('Go back to the layout before this one'), onClick: () => this.askRelayout(id, layout - 1) }) : null),
            layout > 0 ? h('div', { class: 'hint' }, t('Layout %lld', layout + 1)) : null);
        return element;
    }

    /** The routes filter, shown after the side panel's filters */
    get filters() {
        const count = this.sectors.flatMap((s) => Importer.currentSnapshot(s)?.metadata.routes ?? []).filter(isXboat).length;
        return toggle({ title: t('Xboat routes  %lld', count), isOn: showRoutes(), color: colours.xboat,
            help: t("Draw the Imperium's express boat routes on the chart, and other states' communication routes dashed"),
            onChange: (on) => {
                setShowRoutes(on);
                this.draw();
            } });
    }

    /** Lays the system out as `layout`, asking first if anything has been set on its worlds by hand */
    askRelayout(id, layout) {
        const go = () => updates.relayout(this.universe, this.store, id, layout, this.onFilesChanged);
        const worlds = this.map.annotations?.[id]?.worlds ?? {};
        const hasAnything = Object.values(worlds).some((w) => w && Object.keys(w).some((k) => (k === 'places' ? w.places?.length : w[k] != null)));
        if (!hasAnything) {
            go();
            return;
        }
        let sheet;
        sheet = showSheet(h('div', { class: 'sheet-body' },
            h('h2', {}, t('Lay this system out again?')),
            h('p', { class: 'footnote' }, t("Notes, places, ports and data you've set on this system's worlds are kept under the worlds' designations, which may now belong to other worlds or none.")),
            h('div', { class: 'actions' },
                h('button', { type: 'button', onclick: () => sheet.close() }, t('Cancel')),
                h('button', { type: 'button', class: 'default', onclick: () => { sheet.close(); go(); } }, t('Regenerate')))),
        { className: 'plain-sheet alert' });
    }
}

// MARK: sheets

function plain(content, className = '') {
    return showSheet(h('div', { class: 'sheet-body' }, ...content), { className: `plain-sheet traveller-sheet ${className}` });
}

/** TravellerMap's map of a world, as fetched */
async function showWorldMap(chart, title, file) {
    let url = null;
    try {
        const bytes = await chart.store.folder.readBytes(`charts/${Importer.kind}/maps/${file}`);
        url = URL.createObjectURL(new Blob([bytes], { type: 'image/jpeg' }));
    } catch {
        url = null;
    }
    let sheet;
    sheet = showSheet(h('div', { class: 'sheet-body' },
        h('h2', {}, title),
        url ? h('img', { class: 'world-map-image', src: url, alt: title }) : h('p', { class: 'footnote' }, t("The map couldn't be read.")),
        h('div', { class: 'actions', style: { justifyContent: 'space-between' } },
            h('span', { class: 'footnote' }, t('World map © TravellerMap.com and its contributors')),
            h('button', { type: 'button', class: 'default', onclick: () => sheet.close() }, t('Done')))),
    { className: 'plain-sheet world-map', onClose: () => url && URL.revokeObjectURL(url) });
}

/** Every change a newer version of a sector makes, hex by hex */
function showChanges(chart, update) {
    let sheet;
    const list = h('div', { class: 'traveller-list' }, ...update.changes.map((change) => h('div', { class: 'item' },
        h('div', { class: 'row' }, h('span', { class: 'numeric' }, change.hex), h('strong', {}, change.name || t('Unnamed')),
            h('span', { class: 'spacer' }),
            h('span', { class: `kind ${change.kind}` }, change.kind === 'added' ? t('Added') : change.kind === 'removed' ? t('Removed')
                : Importer.regenerates(change) ? t('Changed') : t('Details changed'))),
        ...change.fields.map((f) => h('div', { class: 'field-change' }, `${f.field}: ${f.old || '—'} → ${f.new || '—'}`)))));
    sheet = plain([
        h('h2', {}, t('Changes to %@', update.sectorName)),
        h('p', { class: 'footnote' }, t('Fetched %@. Taking the new version redoes only the systems of the worlds whose data changed; everything else stays as it is.', dateText(update.snapshot.fetchedAt))),
        list,
        update.metadataChanged ? h('p', { class: 'footnote' }, t('Subsector names changed too.')) : null,
        h('div', { class: 'actions' },
            h('button', { type: 'button', onclick: () => sheet.close() }, t('Close')),
            h('button', { type: 'button', onclick: () => { updates.keep(chart.universe, chart.store, update); sheet.close(); } }, t('Keep Mine')),
            h('button', { type: 'button', class: 'default', onclick: () => {
                updates.use(chart.universe, chart.store, update, chart.onFilesChanged);
                sheet.close();
            } }, t('Use New')))].filter(Boolean), 'changes');
}

/** Every version of each sector's data the universe has seen, and which is in use */
function showDataVersions(chart) {
    let sheet;
    const sectors = chart.source?.sectors ?? [];
    const list = h('div', { class: 'traveller-list' });
    for (const sector of sectors) {
        list.append(sectionHeader(sector.listing.name));
        const current = Importer.currentSnapshot(sector);
        for (const snapshot of [...sector.snapshots].reverse()) {
            const inUse = snapshot.id === sector.inUse;
            const differences = current ? Importer.changesBetween(Importer.snapshotWorlds(current), Importer.snapshotWorlds(snapshot)).length : 0;
            list.append(h('div', { class: 'item row' },
                h('div', {}, h('div', {}, dateText(snapshot.fetchedAt)),
                    h('div', { class: 'footnote numeric' }, t('%lld worlds · %@', Importer.snapshotWorlds(snapshot).length, snapshot.id.slice(0, 8)))),
                h('span', { class: 'spacer' }),
                inUse ? h('span', { class: 'footnote' }, t('In use')) : h('span', { class: 'footnote' }, t('%lld differences', differences)),
                inUse ? null : h('button', { type: 'button', onclick: () => {
                    updates.useSnapshot(chart.universe, chart.store, Importer.sectorID(sector), snapshot.id, chart.onFilesChanged);
                    sheet.close();
                } }, t('Use'))));
        }
    }
    sheet = plain([
        h('h2', {}, t('Data Versions')),
        h('p', { class: 'footnote' }, t("Each version of TravellerMap's data the universe has fetched. Using another redoes only the systems of the worlds it differs in.")),
        list,
        h('div', { class: 'actions' }, h('button', { type: 'button', class: 'default', onclick: () => sheet.close() }, t('Done')))], 'versions');
}

/** A searchable, multiple-choice list of TravellerMap's sectors in a milieu */
function sectorPicker({ milieu, exclude = [], neighboursOf = [], onSelection }) {
    const search = h('input', { type: 'search', placeholder: t('Search sectors'), 'aria-label': t('Search sectors') });
    const list = h('div', { class: 'sector-list', role: 'listbox', 'aria-multiselectable': 'true' });
    const selection = new Set();
    let listings = [];
    const touches = (listing) => neighboursOf.some((l) => Math.abs(l.x - listing.x) <= 1 && Math.abs(l.y - listing.y) <= 1);
    const render = () => {
        const text = search.value.trim().toLowerCase();
        const shown = listings.filter((l) => !exclude.includes(Client.listingID(l)))
            .filter((l) => !text || l.name.toLowerCase().includes(text) || l.abbreviation.toLowerCase().includes(text));
        if (neighboursOf.length) shown.sort((a, b) => Number(touches(b)) - Number(touches(a)));
        list.replaceChildren(...shown.map((listing) => {
            const id = Client.listingID(listing);
            const item = h('button', { type: 'button', class: `sector ${selection.has(id) ? 'selected' : ''}`, role: 'option',
                'aria-selected': String(selection.has(id)),
                onclick: () => {
                    if (selection.has(id)) selection.delete(id);
                    else selection.add(id);
                    render();
                    onSelection(listings.filter((l) => selection.has(Client.listingID(l))));
                } },
            h('span', { class: 'name' }, listing.name), h('span', { class: 'spacer' }),
            h('span', { class: 'footnote' }, listing.tags), h('span', { class: 'footnote numeric coords' }, `${listing.x}, ${listing.y}`));
            return item;
        }));
    };
    search.addEventListener('input', render);
    const load = async (forMilieu, defaultSelection = null) => {
        list.replaceChildren(h('div', { class: 'footnote loading' }, t('Loading sectors…')));
        try {
            listings = await Client.sectors(forMilieu);
            selection.clear();
            // The Spinward Marches to start with, where so many campaigns begin
            const start = defaultSelection ? listings.find((l) => l.abbreviation === defaultSelection) ?? listings[0] : null;
            if (start) selection.add(Client.listingID(start));
            render();
            onSelection(listings.filter((l) => selection.has(Client.listingID(l))));
        } catch (error) {
            list.replaceChildren(h('div', { class: 'load-error' }, h('strong', {}, t("Couldn't reach TravellerMap")),
                h('p', { class: 'footnote' }, String(error.message ?? error)),
                h('button', { type: 'button', onclick: () => load(forMilieu, defaultSelection) }, t('Try Again'))));
        }
    };
    load(milieu, neighboursOf.length ? null : 'Spin');
    return { element: h('div', { class: 'sector-picker' }, search, list), load };
}

/** Picks more sectors to add to the universe, such as its neighbours */
function showAddSectors(chart) {
    let chosen = [];
    let sheet;
    const add = h('button', { type: 'button', class: 'default', disabled: true, onclick: () => {
        updates.add(chart.universe, chart.store, chosen, chart.onFilesChanged);
        sheet.close();
    } }, t('Add'));
    const picker = sectorPicker({ milieu: chart.source?.milieu ?? Client.defaultMilieu,
        exclude: (chart.source?.sectors ?? []).map((s) => Importer.sectorID(s)), neighboursOf: (chart.source?.sectors ?? []).map((s) => s.listing),
        onSelection: (listings) => {
            chosen = listings;
            add.disabled = !listings.length;
        } });
    sheet = plain([
        h('h2', {}, t('Add Sectors')),
        h('p', { class: 'footnote' }, t('Neighbouring sectors are listed first.')),
        picker.element,
        h('div', { class: 'actions' }, h('button', { type: 'button', onclick: () => sheet.close() }, t('Cancel')), add)], 'add-sectors');
}

/**
 * Asks which TravellerMap sectors a new universe charts, in which milieu, and the seed for everything TravellerMap
 * doesn't list; then fetches them and generates their systems. `library` makes the universe.
 */
export function showNewTravellerUniverse(library, { onCancel } = {}) {
    // Players chart TravellerMap's data as it is, so there's nothing for a seed to generate
    const dataOnly = !isGMEdition;
    let nameEdited = false;
    let chosen = [];
    let working = false;
    const name = h('input', { type: 'text', 'aria-label': t('Name'), oninput: () => { nameEdited = true; } });
    const milieu = h('select', { 'aria-label': t('Milieu') }, Client.milieux.map((m) => h('option', { value: m, selected: m === Client.defaultMilieu }, m)));
    const seedField = h('input', { type: 'text', value: String(randomSeed()), inputmode: 'numeric', 'aria-label': t('Seed'),
        style: { fontVariantNumeric: 'tabular-nums' } });
    const seedNote = h('p', { class: 'footnote' });
    const parseSeed = () => (/^\d+$/.test(seedField.value.trim()) && Number(seedField.value.trim()) <= 4294967295 ? Number(seedField.value.trim()) : null);
    const summary = h('p', { class: 'footnote summary' });
    const progress = h('progress', { max: 1, value: 0, hidden: true });
    const status = h('p', { class: 'footnote' });
    const create = h('button', { type: 'submit', class: 'default' }, t('Create'));
    const validate = () => {
        const valid = dataOnly || parseSeed() !== null;
        seedNote.textContent = dataOnly ? t("The sectors' worlds, routes and world maps, as TravellerMap lists them.")
            : valid ? t("The seed generates everything TravellerMap doesn't list: the rest of each system and the details of its people.")
                : t('The seed must be a whole number from 0 to %@.', (4294967295).toLocaleString(locale()));
        seedNote.classList.toggle('error', !valid);
        summary.textContent = chosen.length ? new Intl.ListFormat(locale(), { type: 'conjunction' }).format(chosen.map((c) => c.name))
            : t('Choose one or more sectors.');
        create.disabled = working || !valid || !chosen.length;
    };
    seedField.addEventListener('input', validate);
    const picker = sectorPicker({ milieu: Client.defaultMilieu, onSelection: (listings) => {
        chosen = listings;
        if (!nameEdited && listings[0]) name.value = listings[0].name;
        validate();
    } });
    milieu.addEventListener('change', () => picker.load(milieu.value, 'Spin'));
    let sheet;
    let cancelled = false;
    const form = h('form', { onsubmit: async (event) => {
        event.preventDefault();
        const seed = dataOnly ? randomSeed() : parseSeed();
        if (seed === null || !chosen.length || working) return;
        working = true;
        validate();
        progress.hidden = false;
        status.textContent = t('Starting…');
        status.classList.remove('error');
        const listings = chosen, chosenMilieu = milieu.value;
        try {
            await library.newUniverse(name.value, seed, { kind: Importer.kind, source: Importer.sourceName,
                populate: async (folder) => {
                    const { UniverseStore } = await import('../model/dataStore.js');
                    await Importer.populate(new UniverseStore(folder), { listings, milieu: chosenMilieu, seed, dataOnly,
                        progress: (text, fraction) => {
                            if (cancelled) throw new Error('cancelled');
                            status.textContent = text;
                            progress.value = fraction;
                        } });
                } });
            sheet.close();
        } catch (error) {
            if (cancelled) return;
            working = false;
            progress.hidden = true;
            status.textContent = t("Couldn't create the universe: %@", String(error.message ?? error));
            status.classList.add('error');
            validate();
        }
    } },
    h('h2', {}, t('New Traveller Universe')),
    h('label', { class: 'field' }, h('span', {}, t('Name')), name),
    h('label', { class: 'field' }, h('span', {}, t('Milieu')), milieu),
    dataOnly ? null : h('label', { class: 'field' }, h('span', {}, t('Seed')), h('div', { class: 'row' }, seedField,
        h('button', { type: 'button', class: 'icon-button', title: t('Random seed'), 'aria-label': t('Random seed'),
            onclick: () => { seedField.value = String(randomSeed()); validate(); } }, icon('dice')))),
    seedNote,
    picker.element,
    summary, progress, status,
    h('div', { class: 'actions' }, h('button', { type: 'button', onclick: () => { cancelled = true; sheet.close(); } }, t('Cancel')), create),
    h('p', { class: 'footnote credit' }, t('Sector data © TravellerMap.com and its contributors. Traveller is a registered trademark of Far Future Enterprises.')));
    sheet = showSheet(form, { className: 'plain-sheet traveller-sheet new-traveller', onClose: () => {
        if (!working || cancelled) onCancel?.();
        cancelled = cancelled || working;
    } });
    validate();
    return sheet;
}
