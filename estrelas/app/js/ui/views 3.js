//
//  views.js
//  Estrelas (web)
//
//  The panels and sheets over the star map: the side panel (stellar cartography, or a system's planet list), the
//  route, the time controls, and the star, world and moon data sheets with their editors. Ports of DataView.swift,
//  SystemSearchView.swift, RoutePanelView.swift, PlanetListView.swift, TimeControlView.swift, StarDetailView.swift,
//  WorldDetailView.swift, MoonDetailView.swift, WorldSocialView.swift, PortEditorView.swift and
//  WorldDataEditorView.swift.
//

import { h, panel, button, toggle, sectionHeader, dataRow, strip, icon, cssColor, copyButton } from './components.js';
import { t, locale } from './i18n.js';
import * as Settings from './settings.js';
import { showSheet, renamable } from './sheets.js';
import { noteButton, systemReport, planetReport, showNotesReport } from './notes.js';
import {
    WorldText, socialSectionColor, techEraNames, governmentFormNames, regimeNames, armsControlNames, portTierNames,
    portTierSummaries, advisoryNames, advisoryShortNames,
} from './worldText.js';
import { SimulationClock, rateLabel } from '../scene/orbit.js';
import { travelAdvisoryCSS, notesCSS } from '../scene/starMap.js';
import { variantNames, variabilityNames, variabilityPeriods, isWhiteDwarfVariant } from '../gen/stellar.js';
import { nebulaKindNames, nebulaKindSummaries } from '../gen/nebulaGenerator.js';
import { routeHops, routeIsComplete, routeParsecs } from '../scene/starRoute.js';
import { isRetrograde } from '../gen/rotationGenerator.js';
import { techEras, governmentForms, regimeTypes, armsControls, portTiers, travelAdvisories } from '../gen/socialGenerator.js';
import { governmentTypeNames, electionNames, firearmsNames } from './factbook.js';
import { hasDetailedMap, isWorldlike, worldlike, detailedSize, cloudsFor, globeSubdivisions } from '../surface/surfaceMap.js';
import { weatherLayers, weatherLayerTitles } from '../surface/weatherMap.js';
import {
    applyingAnnotations, subjectIsEmpty, worldAnnotationsAreEmpty, portIsEmpty, overridesAreEmpty,
} from '../model/savedData.js';
import {
    hasHabitableWorld, isHabitableEnvironment, insolation, gravityOf, atmosphereKinds, countOf, PlanetPhysics,
} from '../model/planetarySystem.js';
import { canEdit } from '../edition.js';

export { showSheet };

// MARK: formatting

export const StarText = {
    /**
     * The star's spectral type as astronomers write it, e.g. "G2V", "sdB5", "L4", "DA7", "WC8", "C-N5", "B2Ve",
     * "A0Vp", "B1Ia+", or "NS" or "BH" for a neutron star or black hole
     */
    spectralClass(star) {
        const spectralClass = star.spectralClass;
        if (!spectralClass) return '—';
        const sub = star.subClass ?? '';
        const type = star.stellarType ?? 'V';
        switch (spectralClass) {
            case 'NS': case 'BH': return spectralClass;
            case 'L': case 'T': case 'Y': return `${spectralClass}${sub}`;
            case 'D': return `D${isWhiteDwarfVariant(star.variant) ? star.variant.slice(1).toUpperCase() : ''}${sub}`;
            case 'W': return `${{ wc: 'WC', wo: 'WO' }[star.variant] ?? 'WN'}${sub}`;
            case 'C': return `${{ cR: 'C-R', cJ: 'C-J' }[star.variant] ?? 'C-N'}${sub}`;
            case 'S': return `${{ ms: 'MS', sc: 'SC' }[star.variant] ?? 'S'}${sub}`;
            default: break;
        }
        if (type === 'VI') return `sd${spectralClass}${sub}`;
        const suffix = { be: 'e', ap: 'p', bp: 'p', am: 'm' }[star.variant] ?? '';
        return `${spectralClass}${sub}${type}${suffix}`;
    },
    /** What sort of star it is, in words: "Main-sequence star", "Red giant", "T dwarf", "Pulsar", … */
    kind(star) {
        if (star.variant && !isWhiteDwarfVariant(star.variant)) return t(variantNames[star.variant] ?? star.variant);
        const spectralClass = star.spectralClass ?? 'M';
        switch (spectralClass) {
            case 'L': return t('L dwarf (brown dwarf)');
            case 'T': return t('T dwarf (brown dwarf)');
            case 'Y': return t('Y dwarf (brown dwarf)');
            case 'NS': return t('Neutron star');
            case 'BH': return t('Black hole');
            case 'D': return star.variant ? t(variantNames[star.variant]) : t('White dwarf');
            case 'W': return t('Wolf–Rayet star');
            case 'C': return t('Carbon star');
            case 'S': return t('S-type star');
            default: break;
        }
        const cool = spectralClass === 'K' || spectralClass === 'M';
        const hot = spectralClass === 'O' || spectralClass === 'B';
        switch (star.stellarType ?? 'V') {
            case 'd': return t('White dwarf');
            case 'VI': return hot ? t('Hot subdwarf') : t('Subdwarf');
            case 'V': return spectralClass === 'M' ? t('Red dwarf') : t('Main-sequence star');
            case 'IV': return t('Subgiant');
            case 'III': return cool ? t('Red giant') : t('Giant');
            case 'II': return t('Bright giant');
            case 'Ib': case 'Iab': case 'Ia': return cool ? t('Red supergiant') : (hot ? t('Blue supergiant') : t('Supergiant'));
            case 'Ia+': return t('Hypergiant');
            default: return t('Stellar remnant');
        }
    },
    number(value, digits = 3, unit = '') {
        if (value === undefined || value === null) return '—';
        return Number(value).toFixed(digits) + unit;
    },
};

const grouped = (value) => Math.round(value).toLocaleString(locale());

/** A surface resolution as the pickers show it, e.g. "2×  (8,192 × 4,096)" */
export function resolutionTitle(scale) {
    const size = detailedSize(scale);
    return `${scale}×  (${size.width.toLocaleString(locale())} × ${size.height.toLocaleString(locale())})`;
}

/** A globe resolution as the pickers show it, e.g. "2×  (655,362 cells)" */
export function globeResolutionTitle(scale) {
    return `${scale}×  (${t('%@ cells', grouped(10 * 4 ** (globeSubdivisions + Math.log2(scale)) + 2))})`;
}

// MARK: annotations

/** A system's annotations document, or an empty one */
export function annotationsDocument(document, systemID) {
    return document ?? { format: 'estrelas.annotations', version: 3, systemID, worlds: {} };
}

export const worldAnnotation = (document, designation) => document?.worlds?.[designation] ?? { places: [] };

export function setWorldAnnotation(document, designation, world) {
    document.worlds ??= {};
    if (worldAnnotationsAreEmpty(world)) delete document.worlds[designation];
    else document.worlds[designation] = world;
}

export function setStarAnnotation(document, id, star) {
    const stars = { ...(document.stars ?? {}) };
    if (subjectIsEmpty(star)) delete stars[id];
    else stars[id] = star;
    document.stars = Object.keys(stars).length ? stars : undefined;
}

export function setSystemAnnotation(document, system) {
    document.system = subjectIsEmpty(system) ? undefined : system;
}

/** Changes one world's annotations within a system's: `change(world)` edits a copy */
export const changeWorld = (onChange, designation, change) => onChange((document) => {
    const world = structuredClone(worldAnnotation(document, designation));
    change(world);
    setWorldAnnotation(document, designation, world);
});

const worldName = (document, designation) => document?.worlds?.[designation]?.name || designation;

// MARK: side panel

/** The system search field: type part of a name and pick from the systems that match to fly to it */
function systemSearch({ search, onSelect }) {
    const field = h('input', { type: 'search', placeholder: t('Search systems'), 'aria-label': t('Search systems'), autocomplete: 'off' });
    const results = h('div', { class: 'search-results' });
    let matches = [];
    const select = (index) => {
        field.value = '';
        results.replaceChildren();
        field.blur();
        onSelect(index);
    };
    const update = () => {
        const query = field.value.trim();
        matches = query ? search(query) : [];
        if (!query) {
            results.replaceChildren();
            return;
        }
        if (!matches.length) {
            results.replaceChildren(h('div', { class: 'muted-text small' }, t('No systems found')));
            return;
        }
        results.replaceChildren(...matches.map((match) => button(match.name, {
            color: 'control', pill: false, height: 22, grow: true, className: 'search-result', title: t('Fly to %@', match.name),
            onClick: () => select(match.index),
        })));
    };
    field.addEventListener('input', update);
    field.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && matches.length) select(matches[0].index);
        if (event.key === 'Escape') {
            field.value = '';
            update();
            field.blur();
            event.stopPropagation();
        }
    });
    return h('div', { class: 'system-search' }, h('div', { class: 'search-field' }, icon('search'), field), results);
}

/**
 * The star field's side panel: search, filters with their counts, the selected star's summary, the star display
 * switches, and the camera readout
 */
export function stellarCartographyPanel(model) {
    const { map, filters, onFilter, target, camera } = model;
    const counts = map.counts;
    const filterToggle = (name, title, color) => toggle({ title, isOn: filters[name], color, onChange: (on) => onFilter(name, on) });
    const readout = h('div', { class: 'camera-readout' },
        h('div', {},
            h('span', { 'data-readout': 'zoom' }, t('Zoom %.2f', camera.zoom)),
            h('span', { 'data-readout': 'elevation' }, t('El %.1f', camera.elevation)),
            h('span', { 'data-readout': 'azimuth' }, t('Az %.1f', camera.azimuth))),
        h('div', {},
            h('span', { 'data-readout': 'x' }, `X ${(camera.x ?? 0).toFixed(1)}`),
            h('span', { 'data-readout': 'y' }, `Y ${(camera.y ?? 0).toFixed(1)}`),
            h('span', { 'data-readout': 'z' }, `Z ${(camera.z ?? 0).toFixed(1)}`)),
        h('div', { class: 'hint' }, t('W / S fly toward / away from the pointer · ⇧ faster')));
    const advisories = Settings.get('showTravelAdvisories');
    const chart = model.chart ?? null;
    return panel({ title: t('Stellar cartography'), className: 'cartography' },
        systemSearch({ search: (query) => map.search(query), onSelect: (index) => (chart ? chart.selectIndex(index) : map.goToSystem(index)) }),
        ...filtersSection(model, filterToggle, advisories),
        chart?.details ?? null,
        !chart || model.target ? dataView(model) : null,
        chart ? null : h('div', { class: 'panel-switches' },
            toggle({ title: t('Enlarge stars 200%'), isOn: map.enlargeStars, color: 'primary',
                help: t("Draw the stars at twice their size, so they're easier to see"), onChange: model.onEnlargeStars }),
            toggle({ title: t('Star orbits'), isOn: Settings.get('showStarOrbitRings'), color: 'primary',
                help: t('Draw the rings the stars of multiple systems follow round each other'),
                onChange: (on) => Settings.set('showStarOrbitRings', on) }),
            toggle({ title: `${t('Nebulae')}  ${map.field.nebulae.length}`, isOn: Settings.get('showNebulae'), color: 'primary',
                help: t("Draw the star field's nebulae: star-forming clouds, dark clouds, dust lit by nearby stars, and the shells and wrecks of dying stars"),
                onChange: (on) => Settings.set('showNebulae', on) })),
        chart ? null : readout);
}

/** The filters, under a heading that folds them away; folded, it says how many are on */
function filtersSection(model, filterToggle, advisories) {
    const { map, filters, counts = map.counts } = model;
    const expanded = Settings.get('filtersExpanded');
    const active = ['planets', 'habitable', 'belts', 'gasGiants', 'notes'].filter((name) => filters[name]).length +
        (advisories ? ['essentialOnly', 'noTravel'].filter((name) => filters[name]).length : 0);
    const heading = h('button', { type: 'button', class: `filters-heading ${expanded ? 'expanded' : ''}`,
        title: expanded ? t('Hide the filters') : t('Show the filters, which ring the systems that match them'),
        onclick: () => Settings.set('filtersExpanded', !expanded) },
        sectionHeader(t('Filters')),
        !expanded && active > 0 ? h('span', { class: 'filters-on' }, t('%lld on', active)) : null,
        h('span', { class: 'chevron' }, icon('chevronRight')));
    if (!expanded) return [heading];
    return [heading, h('div', { class: 'filters' },
        filterToggle('planets', `${t('Planets')}  ${counts.planets}`, 'info'),
        filterToggle('habitable', `${t('Habitable')}  ${counts.habitable}`, 'highlight'),
        filterToggle('belts', `${t('Asteroid belts')}  ${counts.belts}`, 'control'),
        filterToggle('gasGiants', `${t('Gas giants')}  ${counts.gasGiants}`, 'accent'),
        advisories ? filterToggle('essentialOnly', `${t('Essential travel only')}  ${map.travelAdvisoryCount('essentialOnly')}`,
            travelAdvisoryCSS.essentialOnly) : null,
        advisories ? filterToggle('noTravel', `${t('No travel')}  ${map.travelAdvisoryCount('noTravel')}`, travelAdvisoryCSS.noTravel) : null,
        h('div', { title: t('Ring the systems with notes on them, their stars, their worlds or the places on them') },
            filterToggle('notes', `${t('Notes')}  ${map.notedSystemCount}`, notesCSS)),
        model.chart?.filters ?? null)];
}

/** Updates the camera readout in place, without rebuilding the panel */
export function updateCameraReadout(root, camera) {
    const set = (name, text) => {
        const element = root.querySelector(`[data-readout="${name}"]`);
        if (element) element.textContent = text;
    };
    set('zoom', t('Zoom %.2f', camera.zoom));
    set('elevation', t('El %.1f', camera.elevation));
    set('azimuth', t('Az %.1f', camera.azimuth));
    set('x', `X ${(camera.x ?? 0).toFixed(1)}`);
    set('y', `Y ${(camera.y ?? 0).toFixed(1)}`);
    set('z', `Z ${(camera.z ?? 0).toFixed(1)}`);
}

/** The selected star's essentials; its name, or the info button, opens the full details */
function dataView({ map, target: star, onShowDetails, onChangeAnnotations, onSetTravelAdvisory, onAddToRoute }) {
    const content = [sectionHeader(t('Target'), 'control')];
    if (!star) {
        content.push(h('div', { class: 'muted-text' }, t('No target selected')));
        return content;
    }
    const data = star.userData.data;
    const estrela = data.estrela;
    const systemID = map.systemIDOf(star);
    const annotations = systemID ? map.annotations[systemID] : null;
    const change = (fn) => onChangeAnnotations(systemID, fn);
    const generatedStarName = estrela.name ?? star.name;
    const starName = (estrela.id && annotations?.stars?.[estrela.id]?.name) || generatedStarName;
    const nameButton = button(starName, { color: 'primary', height: 30, grow: true, onClick: () => onShowDetails(star) });
    renamable(nameButton, {
        name: starName, isRenamed: !!(estrela.id && annotations?.stars?.[estrela.id]?.name), what: 'star',
        onRename: (name) => {
            if (!estrela.id || !systemID) return;
            change((document) => {
                const subject = { ...(document.stars?.[estrela.id] ?? {}) };
                subject.name = name ?? undefined;
                setStarAnnotation(document, estrela.id, subject);
            });
        },
    });
    content.push(h('div', { class: 'button-row' }, nameButton,
        button(icon('info'), { color: 'info', pill: false, height: 22, title: t('Show full details'), onClick: () => onShowDetails(star) }),
        estrela.id && systemID ? noteButton({ title: starName, note: annotations?.stars?.[estrela.id]?.note, onChange: (note) => change((document) => {
            const subject = { ...(document.stars?.[estrela.id] ?? {}) };
            subject.note = note ?? undefined;
            setStarAnnotation(document, estrela.id, subject);
        }) }) : null));
    content.push(dataRow(t('Class'), StarText.spectralClass(estrela)));
    content.push(dataRow(t('Type'), StarText.kind(estrela)));
    if (estrela.variability) content.push(dataRow(t('Variable'), t(variabilityNames[estrela.variability]), 'highlight'));
    // A black hole gives off no light of its own to have a temperature
    if (estrela.spectralClass !== 'BH') content.push(dataRow(t('Temperature'), StarText.number(estrela.tempEffective, 0, ' K')));
    content.push(dataRow(t('Mass'), StarText.number(estrela.mass, 2, ' M☉')));
    if (data.systemName) {
        const systemName = annotations?.system?.name || data.systemName;
        const row = dataRow(t('System'), systemName);
        renamable(row, {
            name: systemName, isRenamed: !!annotations?.system?.name, what: 'system',
            onRename: (name) => systemID && change((document) => {
                setSystemAnnotation(document, { ...(document.system ?? {}), name: name ?? undefined });
            }),
        });
        content.push(h('div', { class: 'button-row' }, row, systemID ? noteButton({
            title: systemName, note: annotations?.system?.note, height: 18,
            onChange: (note) => change((document) => setSystemAnnotation(document, { ...(document.system ?? {}), note: note ?? undefined })),
        }) : null));
    }
    const system = data.planetarySystem;
    if (system) {
        const worlds = system.worlds.filter((w) => w.orbitedStarIDs.includes(estrela.id ?? ''));
        content.push(dataRow(t('Worlds'), String(worlds.length)));
        if (system.principalWorld) {
            content.push(dataRow(t('Principal world'), worldName(annotations, system.principalWorld),
                hasHabitableWorld(system) ? 'highlight' : 'primary'));
        }
    }
    for (const nebula of map.nebulaeOf(star)) {
        const row = dataRow(t(nebulaKindNames[nebula.kind]), nebula.name, 'info');
        row.title = t(nebulaKindSummaries[nebula.kind]);
        content.push(row);
    }
    // Puts a travel advisory on the system, or takes it off; the lit button is the current one
    if (systemID && canEdit && Settings.get('showTravelAdvisories')) {
        const advisory = map.travelAdvisoryOf(star);
        const advisoryButton = (title, value, color) => button(title, {
            color: advisory === value ? cssColor(color) : `color-mix(in srgb, ${cssColor(color)} 35%, transparent)`, pill: false, height: 22,
            title: value ? t('Put this advisory on the system: %@', t(advisoryNames[value])) : t('Take any travel advisory off the system'),
            onClick: () => onSetTravelAdvisory(value),
        });
        content.push(h('div', { class: 'zone-picker wraps' }, h('span', { class: 'data-label' }, t('Advisory')), h('span', { class: 'spacer' }),
            h('span', { class: 'choices' }, advisoryButton(t('None'), null, 'control'),
                ...travelAdvisories.map((value) => advisoryButton(t(advisoryShortNames[value]), value, travelAdvisoryCSS[value])))));
        // What the worlds' conditions suggest, offered when it isn't what's set already
        const suggested = suggestedAdvisory(data.planetarySystem);
        if (suggested && suggested !== advisory) {
            content.push(h('div', { class: 'zone-picker suggested' },
                h('span', { class: 'data-label', style: { color: travelAdvisoryCSS[suggested] } },
                    t('Suggested: %@', t(advisoryShortNames[suggested]))),
                h('span', { class: 'spacer' }),
                button(t('Use suggested'), { color: travelAdvisoryCSS[suggested], pill: false, height: 22,
                    title: t("Put the advisory its worlds' conditions suggest on the system: %@", t(advisoryNames[suggested])),
                    onClick: () => onSetTravelAdvisory(suggested) })));
        }
    }
    if (map.systemIndexOf(star) !== null) {
        content.push(button([icon('route'), t('Add to route')], { color: 'info', pill: false, height: 22, grow: true,
            title: t('Add this system to the end of the route'), onClick: onAddToRoute, className: 'add-route' }));
    }
    return content;
}

/** The most severe advisory any of a system's worlds or moons suggests, from their conditions; null if none do */
export function suggestedAdvisory(system) {
    if (!system) return null;
    const suggestions = system.worlds.flatMap((world) => [world.social?.advisory, ...world.moons.map((m) => m.social?.advisory)]);
    if (suggestions.includes('noTravel')) return 'noTravel';
    if (suggestions.includes('essentialOnly')) return 'essentialOnly';
    return null;
}

// MARK: route

/** The route being planned: the ship's range, the waypoints in order, and every hop with its distance */
export function routePanel({ map, state, onClose }) {
    const { waypoints, route, isPlanning, routeRange, isEnded } = state;
    const name = (index) => map.systemName(index);
    const distance = (parsecs) => `${parsecs.toFixed(2)} pc`;
    // The ship's range: no single hop is longer than this. The buttons show only the number, with the unit after them.
    const ranges = h('div', { class: 'zone-picker' }, h('span', { class: 'data-label' }, t('Range')), h('span', { class: 'spacer' }),
        ...[1, 2, 3, 4, 5, 6].map((range) => button(String(range), {
            color: routeRange === range ? 'info' : 'color-mix(in srgb, var(--info) 30%, transparent)', pill: false, height: 22,
            title: t('Hops of up to %lld parsecs', range), onClick: () => {
                Settings.set('routeRange', range);
                map.setRouteRange(range);
            },
        })),
        h('span', { class: 'data-label' }, 'pc'));
    const content = [ranges, sectionHeader(t('Waypoints'), 'control')];
    waypoints.forEach((system, position) => content.push(h('div', { class: 'button-row' },
        button(`${position + 1}  ${name(system)}`, { color: 'control', pill: false, height: 22, grow: true, className: 'left',
            title: t('Centre the view on this system'), onClick: () => map.focusSystem(system) }),
        button(icon('xmark'), { color: 'alert', pill: false, height: 22, title: t('Remove this waypoint'),
            onClick: () => map.setRouteWaypoints(waypoints.filter((_, i) => i !== position)) }))));
    if (waypoints.length < 2) content.push(h('div', { class: 'muted-text' }, t('Select another system and add it to the route')));
    if (waypoints.length >= 2) {
        content.push(sectionHeader(t('Hops'), 'info'));
        if (isPlanning || !route) {
            content.push(h('div', { class: 'spinner', role: 'progressbar', 'aria-label': t('Planning…') }));
        } else {
            const list = h('div', { class: 'route-jumps' });
            let next = 1;
            for (const leg of route.legs) {
                if (leg.hops) {
                    leg.hops.forEach((hop, index) => {
                        // A hop arriving at a waypoint, rather than at a stop on the way, is lit
                        const arrives = hop.to === leg.to && index === leg.hops.length - 1;
                        list.append(dataRow(`${next + index}  ${name(hop.from)} → ${name(hop.to)}`, distance(hop.parsecs), arrives ? 'highlight' : 'primary'));
                    });
                    next += leg.hops.length;
                } else {
                    list.append(dataRow(`${name(leg.from)} → ${name(leg.to)}`, t('Out of reach at %lld pc', routeRange), 'alert'));
                }
            }
            content.push(list);
            const hops = routeHops(route);
            const hopCount = hops.length === 1 ? t('1 hop') : t('%lld hops', hops.length);
            content.push(dataRow(t('Total'), `${hopCount} · ${distance(routeParsecs(route))}`,
                routeIsComplete(route) ? 'highlight' : 'alert'));
            if (hops.length) content.push(dataRow(t('Longest hop'), distance(Math.max(...hops.map((hop) => hop.parsecs)))));
        }
    }
    content.push(h('div', { class: 'button-row end' },
        waypoints.length >= 2 ? button(isEnded ? t('Continue route') : t('End route'), { color: 'info', height: 22,
            title: isEnded ? t('Show the systems in reach of the last waypoint again') : t('Stop showing the systems in reach of the last waypoint'),
            onClick: () => map.setRouteEnded(!isEnded) }) : null,
        button(t('Clear route'), { color: 'alert', height: 22, onClick: onClose })));
    return panel({ title: t('Route'), color: 'info', segments: ['info', 'control', 'label'], className: 'route-panel' }, ...content);
}

// MARK: planet list

/** The planetary view's side panel: each star's planets and their moons, with their data, notes and surface maps */
export function planetListPanel({ map, planetary, annotations, onChangeAnnotations, onShowMap, onShowInfo, onShowMoonInfo }) {
    const { system, selected } = planetary;
    const systemName = annotations?.system?.name || planetary.name;
    const change = (fn) => onChangeAnnotations(planetary.systemID, fn);
    const displayName = (designation) => worldName(annotations, designation);

    let mapWorld = null;
    for (const world of system.worlds) {
        if (world.designation === selected) mapWorld = world;
        const moon = world.moons.find((m) => m.designation === selected);
        if (moon && isWorldlike(moon, world)) mapWorld = worldlike(world, moon);
    }

    // Back out of the system to the star field, or the hex map of a charted universe: what Escape and double clicking
    // the star do, as a button for touch screens with neither
    const back = button([icon('chevronLeft'), t(map.isCharted ? 'Hex map' : 'Star map')], {
        color: 'control', pill: false, title: t(map.isCharted ? 'Back to the hex map' : 'Back to the star map'),
        onClick: () => map.hideBackdrop() });
    const actions = h('div', { class: 'button-row' },
        button(t('Whole system'), { color: 'primary', disabled: !selected, onClick: () => map.showWholeSystem() }),
        noteButton({ title: systemName, note: annotations?.system?.note,
            onChange: (note) => change((document) => setSystemAnnotation(document, { ...(document.system ?? {}), note: note ?? undefined })) }),
        button(icon('document'), { color: 'highlight', pill: false, height: 22, title: t('All the notes on this system, to read or save as a PDF'),
            onClick: () => showNotesReport(systemReport(system, systemName, annotations)) }));
    // Rocky and icy worlds have a detailed surface map once zoomed to, with the resolution it opens at beside it
    const mapButton = mapWorld && hasDetailedMap(mapWorld)
        ? h('div', { class: 'button-row' }, button(t('Surface map'), { color: 'info', onClick: () => onShowMap(mapWorld) }),
            resolutionMenu()) : null;
    // Worlds with weather can have a weather map drawn over their globe, on a line of its own too
    const weatherMenu = mapWorld && cloudsFor(mapWorld) ? h('div', { class: 'button-row' }, globeWeatherMenu(map)) : null;

    const stars = h('div', { class: 'star-chips' }, h('span', { class: 'data-label' }, t('Stars')),
        ...system.stars.map((star) => {
            const name = annotations?.stars?.[star.estrelaID]?.name || star.designation;
            const label = h('span', { class: 'chip-name', title: name === star.designation ? star.designation : `${name} (${star.designation})` }, name);
            renamable(label, { name, isRenamed: !!annotations?.stars?.[star.estrelaID]?.name, what: 'star', onRename: (newName) => change((document) => {
                setStarAnnotation(document, star.estrelaID, { ...(document.stars?.[star.estrelaID] ?? {}), name: newName ?? undefined });
            }) });
            return h('span', { class: 'chip' }, label, noteButton({ title: name, note: annotations?.stars?.[star.estrelaID]?.note, height: 18,
                onChange: (note) => change((document) => setStarAnnotation(document, star.estrelaID,
                    { ...(document.stars?.[star.estrelaID] ?? {}), note: note ?? undefined })) }));
        }));

    const row = ({ designation, title, code, color, isSelected, canSelect, height, help, onSelect, onInfo }) => {
        const shown = isSelected ? cssColor(color) : `color-mix(in srgb, ${cssColor(color)} 55%, transparent)`;
        const main = button([h('span', {}, title), h('span', { class: 'sah' }, code)], {
            color: shown, pill: false, height, grow: true, className: 'world-button', disabled: !canSelect, onClick: onSelect,
        });
        renamable(main, { name: displayName(designation), isRenamed: !!annotations?.worlds?.[designation]?.name, what: 'world',
            onRename: (name) => changeWorld(change, designation, (world) => { world.name = name ?? undefined; }) });
        return h('div', { class: 'button-row' }, main,
            button(icon('info'), { color: 'info', pill: false, height, title: help, onClick: onInfo }),
            noteButton({ title: displayName(designation), note: annotations?.worlds?.[designation]?.note, height,
                onChange: (note) => changeWorld(change, designation, (world) => { world.note = note ?? undefined; }) }));
    };

    const order = [];
    const byLabel = new Map();
    for (const world of system.worlds) {
        if (!byLabel.has(world.parentLabel)) {
            order.push(world.parentLabel);
            byLabel.set(world.parentLabel, []);
        }
        byLabel.get(world.parentLabel).push(world);
    }
    const list = h('div', { class: 'planet-list' });
    for (const label of order) {
        list.append(sectionHeader(label === '' ? t('Worlds') : `${systemName} ${label}`, 'label'));
        for (const world of byLabel.get(label)) {
            const shownWorld = applyingAnnotations(world, annotations?.worlds?.[world.designation]);
            list.append(row({
                designation: world.designation, title: (world.isPrincipal ? '★ ' : '') + displayName(world.designation),
                code: WorldText.tag({ radiusKm: shownWorld.radiusKm, gasGiant: shownWorld.gasGiant, environment: shownWorld.environment,
                    isBelt: shownWorld.type === 'asteroidBelt' }),
                color: world.isPrincipal ? 'highlight' : world.type === 'gasGiant' ? 'accent' : 'control',
                isSelected: selected === world.designation, canSelect: world.type !== 'asteroidBelt', height: 22, help: t('World data'),
                onSelect: () => map.zoomToPlanet(world), onInfo: () => onShowInfo(world),
            }));
            for (const moon of world.moons) {
                const shownMoon = applyingAnnotations(moon, annotations?.worlds?.[moon.designation]);
                const moonRow = row({
                    designation: moon.designation, title: (moon.isPrincipal ? '★ ' : '') + displayName(moon.designation),
                    code: WorldText.tag({ radiusKm: shownMoon.radiusKm, gasGiant: shownMoon.gasGiant, environment: shownMoon.environment }),
                    color: moon.isPrincipal ? 'highlight' : moon.gasGiant ? 'accent' : 'muted',
                    isSelected: selected === moon.designation, canSelect: true, height: 18, help: t('Moon data'),
                    onSelect: () => map.zoomToMoon(moon, world), onInfo: () => onShowMoonInfo(moon, world),
                });
                moonRow.classList.add('moon-row');
                list.append(moonRow);
            }
        }
    }
    const switches = h('div', { class: 'panel-switches' },
        toggle({ title: t('Show clouds'), isOn: Settings.get('showClouds'), color: 'primary',
            help: t('Cloud layers over the globes of planets with atmospheres'), onChange: (on) => Settings.set('showClouds', on) }),
        toggle({ title: t('Show orbits'), isOn: Settings.get('showOrbits'), color: 'primary',
            help: t('Draw the path each planet, moon and companion star follows round its orbit, and the green habitable zones'),
            onChange: (on) => Settings.set('showOrbits', on) }),
        toggle({ title: t('Night sides'), isOn: Settings.get('showNightSides'), color: 'primary',
            help: t('Shade the side of each planet and moon facing away from its star'), onChange: (on) => Settings.set('showNightSides', on) }));
    return panel({ title: systemName, color: 'highlight', segments: ['primary', 'control', 'label'] }, h('div', { class: 'button-row' }, back), actions, mapButton, weatherMenu,
        stars, list, switches);
}

/** Which weather map, if any, is drawn over the globe of the world zoomed to */
function globeWeatherMenu(map) {
    const current = map.globeWeather ?? null;
    const title = (layer) => (layer ? t('Globe: %@', t(weatherLayerTitles[layer])) : t('Globe: Off'));
    const select = h('select', { class: `resolution-menu globe-weather${current ? ' on' : ''}`, 'aria-label': t('On globe'),
        title: t('Draw precipitation radar or temperature over the globe, kept up to date as time runs') },
    [null, ...weatherLayers].map((layer) => h('option', { value: layer ?? '', selected: layer === current }, title(layer))));
    select.addEventListener('change', () => {
        map.setGlobeWeather(select.value || null);
        select.classList.toggle('on', !!select.value);
    });
    return select;
}

/** A menu of resolutions showing "Resolution 2×" closed and each one's size open, choosing the setting `key` */
export function resolutionPicker({ key, scales, current, title, help, onChange }) {
    const select = h('select', { class: 'resolution-menu', 'aria-label': t('Resolution'), title: help },
        scales.map((scale) => h('option', { value: String(scale), selected: scale === current },
            scale === current ? t('Resolution %@', `${scale}×`) : title(scale))));
    const showTitles = () => { for (const option of select.options) option.textContent = title(Number(option.value)); };
    const collapse = () => {
        for (const option of select.options) {
            const scale = Number(option.value);
            option.textContent = option.selected ? t('Resolution %@', `${scale}×`) : title(scale);
        }
    };
    select.addEventListener('focus', showTitles);
    select.addEventListener('blur', collapse);
    select.addEventListener('change', () => {
        collapse();
        Settings.set(key, Number(select.value));
        onChange?.(Number(select.value));
    });
    return select;
}

/** Which resolution the globe of the world zoomed to is drawn at; the same setting as in Settings */
function resolutionMenu() {
    return resolutionPicker({ key: 'globeResolution', scales: Settings.globeResolutions, current: Settings.globeResolution(),
        title: globeResolutionTitle,
        help: t("How finely the globe of the world zoomed to is drawn. Each resolution is saved with the universe the first time it's drawn, so it shows straight away after that.") });
}

// MARK: time controls

/** The simulated date and time, with controls to slow down, stop, reverse or speed up its flow */
export function timeControl({ compact = false } = {}) {
    let rateIndex = SimulationClock.rates.indexOf(SimulationClock.rate);
    if (rateIndex < 0) rateIndex = SimulationClock.realTimeIndex;
    const height = compact ? 28 : 34;
    const dateText = h('span', { class: 'date-text' });
    const year = h('span', { class: 'year', title: t('Double-click to set the year') });
    const timeText = h('span', { class: 'time-text' });
    // The date and its year, with the time below them
    const date = h('span', { class: 'date stacked' }, h('span', { class: 'day-line' }, dateText, year), timeText);
    const caption = compact ? null : h('span', { class: 'caption' }, t('Simulation time'));
    const rate = h('span', { class: 'rate' });
    let editing = false;
    year.addEventListener('dblclick', () => {
        editing = true;
        const field = h('input', { type: 'text', inputmode: 'numeric', class: 'year-field', value: year.textContent, 'aria-label': t('Year') });
        const finish = (commit) => {
            if (!editing) return;
            editing = false;
            const value = Number.parseInt(field.value.trim(), 10);
            if (commit && Number.isFinite(value)) Settings.set(SimulationClock.yearOffsetKey, SimulationClock.yearOffset(value));
            field.replaceWith(year);
            refresh();
        };
        field.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') finish(true);
            if (event.key === 'Escape') {
                event.stopPropagation();
                finish(false);
            }
        });
        field.addEventListener('blur', () => finish(false));
        year.replaceWith(field);
        field.select();
    });
    let backward, forward, realTime;
    const setRate = (index) => {
        rateIndex = index;
        SimulationClock.rate = SimulationClock.rates[rateIndex];
        rate.textContent = t(rateLabel(SimulationClock.rate));
        backward.disabled = rateIndex === 0;
        forward.disabled = rateIndex === SimulationClock.rates.length - 1;
        realTime.disabled = rateIndex === SimulationClock.realTimeIndex;
    };
    backward = button(icon('backward'), { color: 'control', pill: false, height, title: t('Slow down, or run faster backwards'), onClick: () => setRate(rateIndex - 1) });
    forward = button(icon('forward'), { color: 'control', pill: false, height, title: t('Speed up, or run slower backwards'), onClick: () => setRate(rateIndex + 1) });
    realTime = button(compact ? icon('clock') : t('Real time'), { color: 'accent', height, title: t('Run at real time'), onClick: () => setRate(SimulationClock.realTimeIndex) });
    const element = strip(h('div', { class: 'readout' }, date, caption), backward, rate, forward, realTime);
    element.classList.toggle('compact', compact);
    setRate(rateIndex);
    const dayFormat = new Intl.DateTimeFormat(locale(), { month: 'short', day: 'numeric' });
    const timeFormat = new Intl.DateTimeFormat(locale(), { timeStyle: 'medium' });
    const refresh = () => {
        if (!element.isConnected) return;
        try {
            const shown = SimulationClock.displayDate(Settings.get(SimulationClock.yearOffsetKey) ?? SimulationClock.defaultYearOffset);
            dateText.textContent = `${dayFormat.format(shown)}, `;
            if (!editing) year.textContent = String(shown.getFullYear());
            timeText.textContent = timeFormat.format(shown);
        } catch {
            dateText.textContent = '—';
        }
    };
    refresh();
    element.timer = setInterval(refresh, 100);
    return element;
}

function closeButton(close, ...leading) {
    return h('div', { class: 'sheet-footer' }, ...leading, h('span', { class: 'spacer' }), button(t('Close'), { color: 'alert', onClick: close }));
}

/** A sheet whose content is drawn by `render(close)`, and drawn again whenever `refresh` is called */
function liveSheet(render, options = {}) {
    let sheet;
    const holder = h('div', { class: 'sheet-holder' });
    const draw = () => {
        const scroll = holder.querySelector('.sheet-scroll')?.scrollTop ?? 0;
        holder.replaceChildren(render(() => sheet.close(), draw));
        const area = holder.querySelector('.sheet-scroll');
        if (area) area.scrollTop = scroll;
    };
    sheet = showSheet(holder, options);
    draw();
    return { ...sheet, refresh: draw };
}


const roleNames = { primary: 'primary', companion: 'companion', secondary: 'secondary' };

// MARK: star detail

/** The full readout for a star: stellar data, its orbit, and its planetary system */
export function showStarDetail(star, annotationsFor, nebulae = []) {
    return liveSheet((close) => {
        const data = star.userData.data;
        const estrela = data.estrela;
        const annotations = annotationsFor();
        const starName = (estrela.id && annotations?.stars?.[estrela.id]?.name) || estrela.name || star.name;
        const position = [star.position.x, star.position.y, star.position.z];
        const left = h('div', {}, sectionHeader(t('Stellar data'), 'accent'),
            dataRow(t('Designation'), estrela.name ?? '—'),
            dataRow(t('Class'), StarText.spectralClass(estrela)),
            dataRow(t('Type'), StarText.kind(estrela)),
            estrela.variability ? dataRow(t('Variable'),
                `${t(variabilityNames[estrela.variability])}: ${t(variabilityPeriods[estrela.variability])}`) : null,
            dataRow(t('Mass'), StarText.number(estrela.mass, 3, ' M☉')),
            dataRow(t('Radius'), StarText.number(estrela.radius, 3, ' R☉')),
            dataRow(t('Luminosity'), StarText.number(estrela.luminosity, 3, ' L☉')),
            estrela.spectralClass === 'BH'
                ? dataRow(t('Event horizon'), StarText.number((estrela.radius ?? 0) * 696000, 0, ` ${t('km across')}`))
                : dataRow(t('Temperature'), StarText.number(estrela.tempEffective, 0, ' K')),
            ...nebulae.map((nebula) => dataRow(t(nebulaKindNames[nebula.kind]),
                `${nebula.name}, ${StarText.number(nebula.radius * 2 * 3.26, 1, ` ${t('ly across')}`)}`)),
            dataRow(t('Inner limit'), StarText.number(estrela.innerLimit, 3, ' AU')),
            dataRow(t('Bio zone'), `${StarText.number(estrela.bioZoneInner)} – ${StarText.number(estrela.bioZoneOuter)} AU`),
            dataRow(t('Star ID'), estrela.id ?? '—', 'label'),
            dataRow(t('System ID'), estrela.systemID ?? '—', 'label'),
            dataRow(t('Position'), position.map((v) => v.toFixed(2)).join('  '), 'label'));
        const orbit = estrela.orbitalElements;
        if (orbit) {
            left.append(sectionHeader(t('Orbital elements'), 'control'),
                dataRow(t('Eccentricity'), StarText.number(orbit.eccentricity)),
                dataRow(t('Semi-major axis'), StarText.number(orbit.semiMajAxis)),
                dataRow(t('Inclination'), StarText.number(orbit.inclination, 1, '°')),
                dataRow(t('Long. asc. node'), StarText.number(orbit.lngAscNode, 1, '°')),
                dataRow(t('Arg. of periapsis'), StarText.number(orbit.argOfPeriapsis, 1, '°')),
                dataRow(t('True anomaly'), StarText.number(orbit.trueAnomaly, 1, '°')),
                dataRow(t('Period'), StarText.number(orbit.period, 1)));
        }
        const right = h('div', {}, sectionHeader(t('Planetary system'), 'highlight'));
        const system = data.planetarySystem;
        if (system) {
            right.append(dataRow(t('Worlds'), t('%lld rocky, %lld giant, %lld belts', countOf(system, 'terrestrial'),
                countOf(system, 'gasGiant'), countOf(system, 'asteroidBelt'))),
            dataRow(t('Age'), StarText.number(system.age, 2, ' Gyr')));
            const info = system.stars.find((s) => s.estrelaID === estrela.id);
            if (info) {
                right.append(dataRow(t('Star'), `${info.designation} (${t(roleNames[info.role] ?? info.role)})`));
                if (info.role !== 'primary') {
                    right.append(dataRow(t('Separation'), StarText.number(info.au, 3, ' AU')),
                        dataRow(t('Star period'), StarText.number(info.period, 1, ' yr')));
                }
            }
            if (system.principalWorld) {
                right.append(dataRow(t('Principal world'), worldName(annotations, system.principalWorld), 'highlight'));
            }
            // Worlds whose orbits include this star, closest first
            const worlds = system.worlds.filter((w) => w.orbitedStarIDs.includes(estrela.id ?? ''));
            right.append(sectionHeader(`${t('Worlds')}  ${worlds.length}`, 'muted'));
            for (const world of worlds) right.append(worldRow(world, annotations));
        } else {
            right.append(h('div', { class: 'muted-text', 'data-copy': t('No planetary survey') }, t('No planetary survey')));
        }
        const body = h('div', { class: 'sheet-scroll' }, h('div', { class: 'sheet-columns' }, left, right));
        return panel({ title: starName, segments: ['accent', 'control', 'label', 'muted'] },
            body, closeButton(close, copyButton(starName, body)));
    });
}

/** e.g. "★ A c   1.02 AU" with its summary, and its resonance, rings and moons underneath */
function worldRow(world, annotations) {
    const marker = world.isPrincipal ? '★ ' : world.inHabitableZone ? '• ' : '';
    const extras = [];
    if (world.resonance) extras.push(`${world.resonance} res.`);
    if (world.rings > 0) extras.push(t('%lld rings', world.rings));
    if (world.moons.length) extras.push(t('%lld moons', world.moons.length) + (world.moons.some((m) => m.isPrincipal) ? ' ★' : ''));
    const name = marker + worldName(annotations, world.designation);
    const distance = StarText.number(world.au, 3, ' AU') + (world.anomaly === 'retrograde' ? ' R' : '');
    const summary = WorldText.summary({ radiusKm: world.radiusKm, gasGiant: world.gasGiant,
        environment: world.environment, isBelt: world.type === 'asteroidBelt' });
    // One line per world when copied, e.g. "★ A c — 1.02 AU — 1.00 R⊕ · Temperate — 2 rings, 3 moons"
    const copy = [name, distance, summary, ...(extras.length ? [extras.join(', ')] : [])].join(' — ');
    return h('div', { class: 'world-row', 'data-copy': copy },
        h('div', { class: 'main' },
            h('span', { style: { color: world.isPrincipal ? 'var(--highlight)' : 'var(--primary)' } }, name),
            h('span', { class: 'orbit' }, distance)),
        h('div', { class: 'extra described' }, summary),
        extras.length ? h('div', { class: 'extra' }, extras.join(', ')) : null);
}

// MARK: world and moon detail

/** Hours for a day or two, then days, then years */
export function durationText(hours) {
    if (hours < 72) return t('%.1f hours', hours);
    const days = hours / 24;
    if (days < 730) return t('%.1f days', days);
    return t('%.1f years', days / 365.25);
}

export function lockName(lock, planetName) {
    if (lock === 'star') return t('To its star, 1:1');
    if (lock === 'star3:2') return t('To its star, 3:2 resonance');
    return planetName ? t('To %@', planetName) : t('To its planet');
}

/** A world's or moon's rotation as [label, value, colour] rows */
export function rotationRows(rotation, planetName) {
    const rows = [[t('Day'), rotation.dayHours ? durationText(rotation.dayHours) : '—']];
    if (rotation.tidalLock) rows.push([t('Tidal lock'), lockName(rotation.tidalLock, planetName), 'accent']);
    rows.push([t('Axial tilt'), `${rotation.axialTilt.toFixed(1)}°`]);
    rows.push([t('Spin'), isRetrograde(rotation) ? t('Retrograde') : t('Prograde'), isRetrograde(rotation) ? 'alert' : 'primary']);
    return rows;
}

const rows = (list) => list.map(([label, value, color]) => dataRow(label, value, color ?? 'primary'));

/** A world's or moon's surface conditions as rows */
export function environmentRows(environment) {
    const habitable = isHabitableEnvironment(environment);
    return [
        [t('Atmosphere'), WorldText.atmosphere(environment)],
        [t('Breathable'), WorldText.breathability(environment)],
        [t('Temperature'), WorldText.temperature(environment)],
        [t('Surface water'), WorldText.water(environment)],
        [t('Habitable'), habitable ? t('Yes') : t('No'), habitable ? 'highlight' : 'primary'],
    ];
}

/** The society of a world or moon in its data sheet, in two columns: the summary and government lead the first */
function socialView(title, social, body) {
    const sections = WorldText.socialSections(social, body);
    // Split where the two columns come out closest in length, counting a header as a row
    const lengths = sections.map((section) => section.rows.length + 1);
    const total = lengths.reduce((a, b) => a + b, 0);
    let split = 1, best = Infinity, running = 0;
    lengths.forEach((length, index) => {
        running += length;
        const difference = Math.abs(total - 2 * running);
        if (index < sections.length - 1 && difference < best) { best = difference; split = index + 1; }
    });
    const columns = [h('div', {}, sectionHeader(title, 'highlight')), h('div', {})];
    sections.forEach((section, index) => {
        const column = columns[index < split ? 0 : 1];
        // The first section sits under the sheet's own title
        if (index > 0) column.append(sectionHeader(section.title, socialSectionColor(section.key)));
        column.append(...rows(section.rows));
    });
    return h('div', { class: 'sheet-columns social' }, ...columns);
}

/** Buttons choosing one of `options` ([value, title, help]) in a row, the label beside them or above if they don't fit */
function choiceRow(label, options, selection, onSelect, color = 'info') {
    return h('div', { class: 'choice-row wraps' },
        h('span', { class: 'data-label' }, label),
        h('span', { class: 'choices' }, ...options.map(([value, title, help]) => button(title, {
            color: selection === value ? color : `color-mix(in srgb, var(--${color}) 30%, transparent)`, pill: false, height: 22,
            title: help, onClick: () => onSelect(value),
        }))));
}

const portShortNames = { none: 'None', landingField: 'Field', regional: 'Regional', international: 'Intl', hub: 'Hub' };

/** Sets a world's port, orbital station, military base and research station by hand, starting from what was generated */
function portEditor(port, generated, onChange) {
    const details = port ?? {};
    const tier = details.tier ?? generated?.port.tier;
    const station = details.orbitalStation ?? generated?.port.orbitalStation ?? false;
    const military = details.militaryBase ?? generated?.port.militaryBase ?? false;
    const research = details.researchStation ?? generated?.port.researchStation ?? false;
    const update = (change) => {
        const next = { ...details };
        change(next);
        onChange(portIsEmpty(next) ? null : next);
    };
    return h('div', { class: 'editor copy-hidden' }, sectionHeader(t('Port and installations'), 'info'),
        choiceRow(t('Port'), portTiers.map((value) => [value, t(portShortNames[value]),
            `${t(portTierNames[value])}: ${t(portTierSummaries[value])}`]), tier, (value) => update((d) => { d.tier = value; })),
        toggle({ title: t('Orbital station'), isOn: station, color: 'info', onChange: (on) => update((d) => { d.orbitalStation = on; }) }),
        toggle({ title: t('Military base'), isOn: military, color: 'accent', onChange: (on) => update((d) => { d.militaryBase = on; }) }),
        toggle({ title: t('Research station'), isOn: research, color: 'control', onChange: (on) => update((d) => { d.researchStation = on; }) }),
        port ? button(t('Use generated values'), { color: 'label', pill: false, height: 22,
            title: t('Forget the port and installations set here, and go back to the generated ones'), onClick: () => onChange(null) }) : null);
}

/**
 * Sets a world's or moon's data by hand (radius, atmosphere, surface water, population, government, regime, weapons
 * laws and technology), starting from what was generated for it, each shown as what it means
 */
/** Within half a percent, as stepping back onto a generated value lands after rounding */
const nearlyEqual = (a, b) => Math.abs(a - b) <= Math.max(Math.abs(b) * 0.005, 1e-9);

/** `value` to two significant figures, moved a step further if rounding left it no lower than `below` (or higher than `above`) */
function significant(value, below = null, above = null) {
    if (!(value > 0)) return 0;
    const unit = Math.pow(10, Math.floor(Math.log10(value)) - 1);
    let rounded = Math.round(value / unit) * unit;
    if (below !== null && rounded >= below) rounded -= unit;
    if (above !== null && rounded <= above) rounded += unit;
    return rounded;
}

function worldDataEditor(overrides, radiusKm, massEarths, environment, social, onChange) {
    const current = overrides ?? {};
    const update = (key, value) => {
        const next = { ...current, [key]: value ?? undefined };
        onChange(overridesAreEmpty(next) ? null : next);
    };
    /** Text with its Earth symbols (R⊕, M⊕) set in a font that draws them small, as the data rows do */
    const withSymbols = (text) => (typeof text === 'string' && text.includes('⊕')
        ? text.split('⊕').flatMap((part, index) => (index === 0 ? [part] : [h('span', { class: 'earth-symbol' }, '⊕'), part]))
        : [text]);
    /** A value as what it means, lit when set by hand, with buttons to step it down and up, and what was generated */
    const row = (label, shown, wasShown, canGoDown, canGoUp, down, up) => h('div', { class: 'stepper-row' },
        h('span', { class: 'data-label' }, label),
        button(icon('stepMinus'), { color: 'control', pill: false, height: 20, disabled: !canGoDown, onClick: down }),
        button(icon('stepPlus'), { color: 'control', pill: false, height: 20, disabled: !canGoUp, onClick: up }),
        h('span', { class: 'value-stack' },
            h('span', { class: 'value', style: { color: wasShown === null ? 'var(--primary)' : 'var(--highlight)' } }, ...withSymbols(shown)),
            wasShown !== null ? h('span', { class: 'was' }, ...withSymbols(t('was %@', wasShown))) : null));
    /** A value from a list, stepped through the list's order */
    const choice = (label, key, generated, all, describe) => {
        const value = current[key];
        const index = Math.max(all.indexOf(value ?? generated), 0);
        const set = (next) => update(key, next === generated ? null : next);
        return row(label, describe(value ?? generated), value == null ? null : describe(generated), index > 0, index < all.length - 1,
            () => set(all[Math.max(index - 1, 0)]), () => set(all[Math.min(index + 1, all.length - 1)]));
    };
    /** A number stepped down and up by the given rules */
    const stepper = (label, key, generated, down, up, describe, toStored = (v) => v, isGenerated = null, onSet = null) => {
        const value = current[key];
        const shown = value ?? generated;
        const set = (next) => {
            const back = isGenerated ? isGenerated(next) : Math.abs(next - generated) < 0.5;
            if (onSet) onSet(back ? null : toStored(next));
            else update(key, back ? null : toStored(next));
        };
        return row(label, describe(shown), value == null ? null : describe(generated), down(shown) < shown, up(shown) > shown,
            () => set(down(shown)), () => set(up(shown)));
    };
    const named = (table) => (value) => t(table[value] ?? value);
    // A new radius, with the mass it takes to keep the surface gravity what it is now (g ∝ M / R²)
    const shownRadius = current.radiusKm ?? radiusKm;
    const setRadius = (value) => {
        const oldMass = current.massEarths ?? massEarths;
        const newRadius = value ?? radiusKm;
        const newMass = oldMass * Math.pow(newRadius / Math.max(shownRadius, 1), 2);
        const next = { ...current, radiusKm: value ?? undefined, massEarths: nearlyEqual(newMass, massEarths) ? undefined : newMass };
        onChange(overridesAreEmpty(next) ? null : next);
    };
    const content = [sectionHeader(t('Edit world data'), 'highlight'),
        stepper(t('Radius'), 'radiusKm', radiusKm, (v) => Math.max(Math.ceil(v / 100) * 100 - 100, 100),
            (v) => Math.min(Math.floor(v / 100) * 100 + 100, radiusKm > 20000 ? 200000 : 20000), WorldText.radius,
            (v) => v, null, setRadius),
        stepper(t('Mass'), 'massEarths', massEarths, (v) => significant(v / 1.1, v), (v) => significant(v * 1.1, null, v),
            (v) => `${WorldText.mass(v)}, ${WorldText.gravity(PlanetPhysics.gravity(v, shownRadius))}`, (v) => v,
            (v) => nearlyEqual(v, massEarths))];
    if (environment) {
        content.push(choice(t('Atmosphere'), 'atmosphere', environment.atmosphere, atmosphereKinds, WorldText.atmosphereKind));
        // Pressure, for any air at all
        if ((current.atmosphere ?? environment.atmosphere) !== 'none') {
            content.push(stepper(t('Pressure'), 'pressureBar', environment.pressureBar,
                (v) => (v <= 0.001 ? 0.001 : significant(v / 1.1, v)),
                (v) => (v < 0.001 ? 0.001 : Math.min(significant(v * 1.1, null, v), 10000)),
                WorldText.pressure, (v) => v, (v) => nearlyEqual(v, environment.pressureBar)));
        }
        content.push(stepper(t('Water'), 'waterPercent', environment.waterPercent, (v) => Math.max(Math.ceil(v / 5) * 5 - 5, 0),
            (v) => Math.min(Math.floor(v / 5) * 5 + 5, 100), (v) => `${Math.trunc(v)}%`, Math.trunc));
    }
    if (social) {
        content.push(stepper(t('Population'), 'headcount', social.population,
            (v) => (v <= 10 ? 0 : Math.pow(10, Math.floor(Math.log10(v) - 0.0001))),
            (v) => (v < 1 ? 10 : Math.min(Math.pow(10, Math.floor(Math.log10(v) + 0.0001) + 1), 1e12)),
            (v) => WorldText.population(Math.trunc(v)), Math.trunc));
        if (social.government) {
            content.push(choice(t('Government type'), 'governmentForm', social.government.form, governmentForms, named(governmentTypeNames)));
            if (social.government.regime) {
                content.push(choice(t('Elections'), 'regime', social.government.regime, regimeTypes, named(electionNames)));
            }
        }
        if (social.rights) content.push(choice(t('Civilian firearms'), 'armsControl', social.rights.armsControl, armsControls, named(firearmsNames)));
        if (social.techEra) content.push(choice(t('Technology base'), 'techEra', social.techEra, techEras, named(techEraNames)));
    }
    if (overrides) {
        content.push(button(t('Use generated values'), { color: 'label', pill: false, height: 22,
            title: t('Forget the world data set here, and go back to the generated values'), onClick: () => onChange(null) }));
    }
    return h('div', { class: 'editor copy-hidden' }, ...content);
}

/** A name row that can be renamed, with the note button beside it */
function nameRow(name, annotation, what, onChange) {
    const row = dataRow(t('Name'), name);
    renamable(row, { name, isRenamed: !!annotation?.name, what, onRename: (newName) => onChange((w) => { w.name = newName ?? undefined; }) });
    return h('div', { class: 'button-row' }, row, noteButton({ title: name, note: annotation?.note, height: 18,
        onChange: (note) => onChange((w) => { w.note = note ?? undefined; }) }));
}

/** Radius, mass and gravity of anything but a belt */
function physicalRows(body) {
    return [[t('Radius'), WorldText.radius(body.radiusKm)], [t('Mass'), WorldText.mass(body.massEarths)],
        [t('Gravity'), WorldText.gravity(gravityOf(body))]];
}

/**
 * The full readout for a world: physical data, environment, orbit, rotation, rings and moons, and the society of it
 * and its moons; in the GM's edition, its port and data can be set by hand
 */
export function showWorldDetail(world, { annotationsFor, onChangeAnnotations, systemName }) {
    return liveSheet((close, redraw) => {
        const annotations = annotationsFor();
        const annotation = annotations?.worlds?.[world.designation];
        const shown = applyingAnnotations(world, annotation);
        const name = worldName(annotations, world.designation);
        const changeThis = (change) => {
            changeWorld(onChangeAnnotations, world.designation, change);
            redraw();
        };
        const data = [[t('Designation'), world.designation], [t('Type'), WorldText.typeName(world)]];
        if (world.type !== 'asteroidBelt') data.push(...physicalRows(shown));
        if (world.isPrincipal) data.push([t('Principal world'), t('Yes'), 'highlight']);
        const environment = [[t('Habitable zone'), world.inHabitableZone ? t('Yes') : t('No'), world.inHabitableZone ? 'highlight' : 'primary'],
            [t('Starlight'), t("%@ × Earth's", insolation(world).toFixed(2))]];
        if (shown.environment) environment.push(...environmentRows(shown.environment));
        const left = h('div', {}, sectionHeader(t('World data'), 'accent'), nameRow(name, annotation, 'world', changeThis),
            ...rows(data), sectionHeader(t('Environment'), 'highlight'), ...rows(environment));
        if (canEdit) {
            left.append(portEditor(annotation?.port, world.social, (port) => changeThis((w) => { w.port = port ?? undefined; })));
            if (world.type !== 'asteroidBelt' || world.social) {
                left.append(worldDataEditor(annotation?.overrides, world.radiusKm, world.massEarths, world.environment, world.social,
                    (overrides) => changeThis((w) => { w.overrides = overrides ?? undefined; })));
            }
        }
        const orbit = [[t('Orbits'), world.parentLabel === '' ? t('Primary') : world.parentLabel],
            [t('Semi-major axis'), StarText.number(world.au, 3, ' AU')],
            [t('Eccentricity'), StarText.number(world.eccentricity)], [t('Inclination'), StarText.number(world.inclination, 1, '°')],
            [t('Period'), StarText.number(world.period, 2, ' yr')]];
        if (world.anomaly) orbit.push([t('Anomaly'), WorldText.anomaly(world.anomaly), 'alert']);
        if (world.resonance) orbit.push([t('Resonance'), world.resonance]);
        const right = h('div', {}, sectionHeader(t('Orbit'), 'control'), ...rows(orbit));
        if (world.rotation) right.append(sectionHeader(t('Rotation'), 'control'), ...rows(rotationRows(world.rotation)));
        right.append(sectionHeader(`${t('Moons')}  ${world.moons.length}`, 'muted'));
        if (world.rings > 0) right.append(dataRow(t('Rings'), String(world.rings)));
        for (const generatedMoon of world.moons) {
            const moon = applyingAnnotations(generatedMoon, annotations?.worlds?.[generatedMoon.designation]);
            right.append(dataRow((moon.isPrincipal ? '★ ' : '') + worldName(annotations, moon.designation),
                WorldText.summary({ radiusKm: moon.radiusKm, gasGiant: moon.gasGiant, environment: moon.environment }),
                moon.isPrincipal ? 'highlight' : 'primary'));
        }
        // The society of the world, and of any inhabited moons
        const social = h('div', { class: 'social-list' });
        if (shown.social) social.append(socialView(t('Society'), shown.social, shown));
        for (const generatedMoon of world.moons.filter((m) => m.social)) {
            const moon = applyingAnnotations(generatedMoon, annotations?.worlds?.[generatedMoon.designation]);
            social.append(socialView(worldName(annotations, moon.designation), moon.social, moon));
        }
        const notes = button([icon('document'), t('Notes')], { color: 'highlight', title: t('All the notes on this world, its moons and places, to read or save as a PDF'),
            onClick: () => showNotesReport(planetReport(world, systemName, annotations)) });
        const body = h('div', { class: 'sheet-scroll' }, h('div', { class: 'sheet-columns' }, left, right), social);
        return panel({ title: name, segments: ['accent', 'control', 'label', 'muted'] },
            body, closeButton(close, copyButton(name, body), notes));
    });
}

/** The full readout for a moon: its physical data, the planet it orbits, its rotation and its society */
export function showMoonDetail(generatedMoon, planet, { annotationsFor, onChangeAnnotations }) {
    return liveSheet((close, redraw) => {
        const annotations = annotationsFor();
        const annotation = annotations?.worlds?.[generatedMoon.designation];
        const moon = applyingAnnotations(generatedMoon, annotation);
        const name = worldName(annotations, moon.designation);
        const planetName = worldName(annotations, planet.designation);
        const changeThis = (change) => {
            changeWorld(onChangeAnnotations, moon.designation, change);
            redraw();
        };
        const data = [[t('Designation'), moon.designation],
            [t('Type'), moon.gasGiant ? WorldText.giantClass(moon.gasGiant.giantClass) : t('Moon')], ...physicalRows(moon)];
        if (moon.isPrincipal) data.push([t('Principal world'), t('Yes'), 'highlight']);
        // A moon shares its planet's distance from the star(s)
        const environment = [[t('Habitable zone'), planet.inHabitableZone ? t('Yes') : t('No'), planet.inHabitableZone ? 'highlight' : 'primary']];
        if (moon.environment) environment.push(...environmentRows(moon.environment));
        const left = h('div', {}, sectionHeader(t('Moon data'), 'accent'), nameRow(name, annotation, 'moon', changeThis),
            ...rows(data), sectionHeader(t('Environment'), 'highlight'), ...rows(environment));
        if (canEdit) {
            left.append(portEditor(annotation?.port, generatedMoon.social, (port) => changeThis((w) => { w.port = port ?? undefined; })),
                worldDataEditor(annotation?.overrides, generatedMoon.radiusKm, generatedMoon.massEarths, generatedMoon.environment, generatedMoon.social,
                    (overrides) => changeThis((w) => { w.overrides = overrides ?? undefined; })));
        }
        const orbit = [[t('Orbits'), planetName],
            [t('Planet'), WorldText.summary({ radiusKm: planet.radiusKm, gasGiant: planet.gasGiant, environment: planet.environment,
                isBelt: planet.type === 'asteroidBelt' })],
            [t("Planet's star(s)"), planet.parentLabel === '' ? t('Primary') : planet.parentLabel],
            [t('Distance from star'), StarText.number(planet.au, 3, ' AU')], [t('Year'), StarText.number(planet.period, 2, ' yr')]];
        const right = h('div', {}, sectionHeader(t('Orbit'), 'control'), ...rows(orbit));
        if (moon.rotation) right.append(sectionHeader(t('Rotation'), 'control'), ...rows(rotationRows(moon.rotation, planetName)));
        const body = h('div', { class: 'sheet-scroll' }, h('div', { class: 'sheet-columns' }, left, right),
            moon.social ? socialView(t('Society'), moon.social, moon) : null);
        return panel({ title: name, segments: ['accent', 'control', 'label', 'muted'] },
            body, closeButton(close, copyButton(name, body)));
    });
}
