//
//  surfaceMapView.js
//  Estrelas (web)
//
//  A detailed, zoomable equirectangular surface map of a rocky or icy world, with a latitude/longitude grid, the
//  coordinates under the pointer, a pin dropped where it's clicked, and the cities, towns and other places marked on
//  it by hand. Exports as an image or PDF, as drawn or unfolded onto an icosahedron. A port of SurfaceMapView.swift
//  and PrintedWorldData.swift.
//

import { h, panel, button, icon, popover } from './components.js';
import { t } from './i18n.js';
import * as Settings from './settings.js';
import { showSheet } from './sheets.js';
import { noteButton, inlineMarkdown, placeKindName, landmarkTypeName } from './notes.js';
import { formats, saveCanvas, saveBlob, printPage, safeFileName } from './exportFile.js';
import { contourLevels, contourLines, gridShape, drawContours, mapColumns } from '../surface/contourMap.js';
import { contourHeightsInWorker } from '../model/dataStore.js';
import { modelFormats, mounts, modelFile, cellCount } from '../surface/modelExport.js';
import { globeSubdivisions } from '../surface/surfaceMap.js';
import { rotationRows, environmentRows, StarText, resolutionPicker, resolutionTitle } from './views.js';
import { WorldText } from './worldText.js';
import { showCityMap } from './cityMapView.js';
import { showWeather, hasWeather } from './weatherView.js';
import { terrainInWorker } from '../model/dataStore.js';
import { styleFor, detailedOctaves, spherePoint } from '../surface/surfaceMap.js';
import { formatCoordinates, pinDuration } from '../scene/starMap.js';
import { faces as netFaces, layoutSize, layoutPoint, renderNet } from '../surface/icosahedralMap.js';
import {
    placeKinds, landmarkTypes, applyingAnnotations, architectureStyles, architectureNames, architectureSummaries,
    streetLayouts, streetLayoutNames, harmonies, harmonyNames, cityStyleIsEmpty,
} from '../model/savedData.js';
import { planSettlements, settlementTerrain } from '../gen/settlementPlanner.js';
import { settlementKinds } from '../gen/cityGenerator.js';
import { placeName } from '../gen/placeNames.js';
import { insolation, gravityOf } from '../model/planetarySystem.js';
import { canEdit, canSee } from '../edition.js';
import { randomUUID, SplitMix64 } from '../gen/random.js';

const zoomRange = [1, 8];
const gridSpacing = 30;
const exportLayoutWidth = 1600;
const formatLatitude = (latitude) => (latitude === 0 ? '0°' : `${Math.trunc(Math.abs(latitude))}°${latitude > 0 ? 'N' : 'S'}`);

export const placeSymbols = { capital: '★', city: '▣', town: '⌂', village: '⌂', spaceport: '✈', landingPad: '✈', base: '⛨',
    outpost: '▲', landmark: '◆' };
const placeColors = { capital: 'highlight', city: 'primary', town: 'primary', village: 'primary', spaceport: 'info',
    landingPad: 'info', base: 'alert', outpost: 'accent', landmark: 'accent' };

/** A generator of fresh randomness, for made-up names */
const freshGenerator = () => new SplitMix64(crypto.getRandomValues(new BigUint64Array(1))[0]);

/**
 * Opens the map of `world`. `options`: planet (for a moon), systemName, worldName, primaryStarName, annotation (the
 * world's annotations now), resolution (1, 2 or 4), load(progress) resolving to { width, height, pixels },
 * onPlacesChange(places)
 */
export function showSurfaceMap(world, options) {
    const { load, onPlacesChange } = options;
    let places = structuredClone(options.annotation?.places ?? []);
    // How the world's city maps are built (CityStyle), unless a settlement has a style of its own
    let cityStyle = structuredClone(options.annotation?.cityStyle ?? {});
    let image = null;
    let zoom = 1;
    let placing = false;
    let pin = null;
    const worldName = options.worldName ?? world.designation;

    const zoomText = h('span', { class: 'zoom' });
    const viewport = h('div', { class: 'map-viewport' });
    const content = h('div', { class: 'map-content' });
    const surface = h('div', { class: 'map-surface' });
    const canvas = h('canvas');
    const grid = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const labels = h('div');
    const markers = h('div', { class: 'map-markers' });
    const pinLayer = h('div', { class: 'map-pin-layer' });
    const progressBar = h('progress', { max: 1 });
    let resolution = options.resolution ?? 1;
    const progressText = h('span');
    const progress = h('div', { class: 'map-progress' }, progressText, progressBar);
    surface.append(canvas, grid, labels, markers, pinLayer);
    content.append(surface);
    viewport.append(content, progress);
    const footer = h('div', { class: 'map-footer' });
    let hover = null;
    const renderFooter = () => {
        const left = placing
            ? h('span', { class: 'hint highlight' }, t('Click the map to place a city, town or other place'))
            : hover ? h('span', { class: 'coordinates' }, formatCoordinates(hover.latitude, hover.longitude))
                : h('span', { class: 'hint' }, t('Pinch or use the buttons to zoom; scroll to pan; click a place to edit it'));
        footer.replaceChildren(...[left, h('span', { class: 'spacer' }), places.length ? h('span', { class: 'hint' }, `${t('Places')}  ${places.length}`) : null].filter(Boolean));
    };

    let zoomOut, zoomIn;
    const mapSize = (z) => {
        const width = viewport.clientWidth, height = viewport.clientHeight;
        const base = Math.min(width, height * 2);
        return { width: base * z, height: base * z / 2 };
    };
    const origin = (size) => ({ x: Math.max(viewport.clientWidth - size.width, 0) / 2, y: Math.max(viewport.clientHeight - size.height, 0) / 2 });
    const layout = () => {
        const size = mapSize(zoom);
        const o = origin(size);
        content.style.width = `${Math.max(size.width, viewport.clientWidth)}px`;
        content.style.height = `${Math.max(size.height, viewport.clientHeight)}px`;
        Object.assign(surface.style, { left: `${o.x}px`, top: `${o.y}px`, width: `${size.width}px`, height: `${size.height}px` });
        zoomText.textContent = t('%.1f×', zoom);
        zoomOut.disabled = zoom <= zoomRange[0];
        zoomIn.disabled = zoom >= zoomRange[1];
        drawLabels(size);
    };
    const fractionAt = (point) => {
        const size = mapSize(zoom);
        const o = origin(size);
        return {
            x: Math.min(Math.max((viewport.scrollLeft + point.x - o.x) / size.width, 0), 1),
            y: Math.min(Math.max((viewport.scrollTop + point.y - o.y) / size.height, 0), 1),
        };
    };
    const setZoom = (newZoom, anchor, point) => {
        zoom = Math.min(Math.max(newZoom, zoomRange[0]), zoomRange[1]);
        layout();
        const size = mapSize(zoom);
        const o = origin(size);
        viewport.scrollLeft = o.x + anchor.x * size.width - point.x;
        viewport.scrollTop = o.y + anchor.y * size.height - point.y;
    };
    const zoomAboutCentre = (factor) => {
        const centre = { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 };
        setZoom(zoom * factor, fractionAt(centre), centre);
    };
    zoomOut = button(icon('minus'), { color: 'control', pill: false, title: t('Zoom out'), onClick: () => zoomAboutCentre(1 / 1.5) });
    zoomIn = button(icon('plus'), { color: 'control', pill: false, title: t('Zoom in'), onClick: () => zoomAboutCentre(1.5) });

    // Grid lines, drawn once in map coordinates; labels are positioned in pixels so they keep their size
    grid.setAttribute('viewBox', '0 0 360 180');
    grid.setAttribute('preserveAspectRatio', 'none');
    const line = (x1, y1, x2, y2, major) => {
        for (const [color, width] of [[`rgb(0 0 0 / ${major ? 0.55 : 0.4})`, major ? 3.5 : 2.5], [`rgb(255 255 255 / ${major ? 0.95 : 0.75})`, major ? 1.5 : 1]]) {
            const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            Object.entries({ x1, y1, x2, y2, stroke: color, 'stroke-width': width, 'vector-effect': 'non-scaling-stroke' })
                .forEach(([k, v]) => l.setAttribute(k, v));
            grid.append(l);
        }
    };
    for (const pass of [0, 1]) {
        for (let latitude = -90 + gridSpacing; latitude < 90; latitude += gridSpacing) {
            if ((pass === 1) === (latitude === 0)) line(0, 90 - latitude, 360, 90 - latitude, latitude === 0);
        }
        for (let longitude = 0; longitude < 360; longitude += gridSpacing) {
            if ((pass === 1) === (longitude === 0)) line(longitude, 0, longitude, 180, longitude === 0);
        }
    }
    const drawLabels = (size) => {
        labels.replaceChildren();
        for (let latitude = -90 + gridSpacing; latitude < 90; latitude += gridSpacing) {
            const y = size.height * (90 - latitude) / 180;
            labels.append(h('span', { class: 'map-label', style: { left: '4px', top: `${y - 3}px`, transform: 'translateY(-100%)' } }, formatLatitude(latitude)));
        }
        for (let longitude = gridSpacing; longitude < 360; longitude += gridSpacing) {
            const x = size.width * longitude / 360;
            labels.append(h('span', { class: 'map-label', style: { left: `${x + 4}px`, top: `${size.height - 4}px`, transform: 'translateY(-100%)' } }, `${longitude}°E`));
        }
    };

    const coordinateAt = (event) => {
        const rect = surface.getBoundingClientRect();
        return {
            longitude: Math.min(Math.max((event.clientX - rect.left) / rect.width * 360, 0), 360),
            latitude: Math.min(Math.max(90 - (event.clientY - rect.top) / rect.height * 180, -90), 90),
        };
    };
    const changed = () => {
        onPlacesChange(structuredClone(places));
        renderMarkers();
        renderFooter();
    };

    // MARK: places

    const markerLabel = (place) => h('span', { class: 'place-marker', 'data-kind': place.kind },
        h('span', { class: 'symbol', style: { color: `var(--${placeColors[place.kind] ?? 'primary'})` } }, placeSymbols[place.kind] ?? '•'),
        h('span', { class: 'name' }, place.name));
    const renderMarkers = () => {
        markers.replaceChildren(...places.map((place) => {
            const marker = h('button', { type: 'button', class: 'place-button', title: place.notes && canSee({ text: place.notes, shared: place.notesShared }) ? place.notes : place.name,
                style: { left: `${place.longitude / 360 * 100}%`, top: `${(90 - place.latitude) / 180 * 100}%` },
                onclick: (event) => {
                    event.stopPropagation();
                    editPlace(marker, place);
                } }, markerLabel(place));
            return marker;
        }));
    };
    const editPlace = (anchor, place) => {
        const name = h('input', { type: 'text', value: place.name, disabled: !canEdit, 'aria-label': t('Name') });
        name.addEventListener('input', () => { place.name = name.value; changed(); });
        // A made-up name to suit the kind of place, different from the one it has
        const randomName = h('button', { type: 'button', class: 'icon-button', title: t('Generate a random name'),
            'aria-label': t('Random Name'), disabled: !canEdit, onclick: () => {
                place.name = placeName(place.kind, place.landmarkType, [place.name], freshGenerator());
                name.value = place.name;
                changed();
            } }, icon('dice'));
        const kind = h('select', { disabled: !canEdit, 'aria-label': t('Kind') }, placeKinds.map((k) =>
            h('option', { value: k, selected: place.kind === k }, `${placeSymbols[k]}  ${placeKindName(k)}`)));
        kind.addEventListener('change', () => {
            place.kind = kind.value;
            // Only landmarks keep a landmark type, and only settlements a city style
            if (place.kind !== 'landmark') delete place.landmarkType;
            if (!settlementKinds.has(place.kind)) delete place.cityStyle;
            changed();
            refresh();
        });
        // Landmarks have a type of their own to pick, which the random name suits
        const landmark = h('select', { disabled: !canEdit, 'aria-label': t('Type') }, landmarkTypes.map((type) =>
            h('option', { value: type, selected: (place.landmarkType ?? 'other') === type }, landmarkTypeName(type))));
        landmark.addEventListener('change', () => { place.landmarkType = landmark.value; changed(); });
        const population = h('input', { type: 'number', min: 0, step: 1, value: place.population ?? '', disabled: !canEdit, 'aria-label': t('Population') });
        population.addEventListener('input', () => {
            const value = Number.parseInt(population.value, 10);
            place.population = Number.isFinite(value) ? value : undefined;
            changed();
        });
        const body = h('div', { class: 'place-editor' });
        const refresh = () => {
            const note = place.notes ? { text: place.notes, shared: place.notesShared } : null;
            body.replaceChildren(...[
                h('label', { class: 'field' }, h('span', {}, t('Name')), h('div', { class: 'row' }, name, randomName)),
                h('label', { class: 'field' }, h('span', {}, t('Kind')), kind),
                place.kind === 'landmark' ? h('label', { class: 'field' }, h('span', {}, t('Type')), landmark) : null,
                h('label', { class: 'field' }, h('span', {}, t('Population')), population),
                // How its city map is built, in place of the world's style
                ...(settlementKinds.has(place.kind) ? cityStylePickers(place.cityStyle ?? {}, t("World's style"), (style) => {
                    place.cityStyle = cityStyleIsEmpty(style) ? undefined : style;
                    changed();
                }, !canEdit) : []),
                canEdit || canSee(note) ? h('div', { class: 'field' }, h('span', {}, t('Notes')),
                    h('span', { class: 'note-preview' }, canSee(note) ? inlineMarkdown(note.text.split('\n')[0]) : ''),
                    noteButton({ title: place.name, note, onChange: (value) => {
                        place.notes = value?.text?.trim() ? value.text : undefined;
                        place.notesShared = place.notes ? value.shared : undefined;
                        changed();
                        refresh();
                    } })) : null,
                h('div', { class: 'field' }, h('span', {}, t('Location')), h('span', { class: 'numeric' }, formatCoordinates(place.latitude, place.longitude))),
                h('div', { class: 'row' },
                    settlementKinds.has(place.kind) ? h('button', { type: 'button', onclick: () => { pop.close(); showCityMap(place, world, groundColorAt(place),
                        { loadGlobe: options.loadGlobe, worldStyle: cityStyle }); } },
                        icon('city'), t('3D City Map…')) : null,
                    h('span', { class: 'spacer' }),
                    canEdit ? h('button', { type: 'button', class: 'destructive', onclick: () => {
                        places = places.filter((p) => p.id !== place.id);
                        pop.close();
                        changed();
                    } }, t('Delete Place')) : null)].filter(Boolean));
        };
        refresh();
        const pop = popover(anchor, body, { className: 'place-popover' });
    };
    const groundColorAt = (place) => {
        const land = [0.42, 0.48, 0.32];
        if (!image) return land;
        const x = Math.min(Math.max(Math.trunc(place.longitude / 360 * image.width), 0), image.width - 1);
        const y = Math.min(Math.max(Math.trunc((90 - place.latitude) / 180 * image.height), 0), image.height - 1);
        const k = (y * image.width + x) * 4;
        const color = [image.pixels[k] / 255, image.pixels[k + 1] / 255, image.pixels[k + 2] / 255];
        return color[2] > color[0] * 1.15 && color[2] > color[1] ? land : color;
    };

    // MARK: pointer

    let pinTimer = null;
    surface.addEventListener('pointermove', (event) => {
        hover = coordinateAt(event);
        renderFooter();
    });
    surface.addEventListener('pointerleave', () => {
        hover = null;
        renderFooter();
    });
    surface.addEventListener('click', (event) => {
        if (!image || event.target.closest('.place-button')) return;
        const coordinate = coordinateAt(event);
        if (placing) {
            const place = { id: randomUUID(), name: t('New place'), kind: 'city', latitude: coordinate.latitude, longitude: coordinate.longitude };
            places.push(place);
            placing = false;
            addPlaceButton?.classList.remove('on');
            changed();
            const marker = markers.lastElementChild;
            if (marker) editPlace(marker, place);
            return;
        }
        pin = coordinate;
        const pill = h('span', { class: 'pill' }, formatCoordinates(pin.latitude, pin.longitude));
        pinLayer.replaceChildren(h('div', { class: 'dropped-pin', style: { left: `${pin.longitude / 360 * 100}%`, top: `${(90 - pin.latitude) / 180 * 100}%` } },
            pill, h('span', { class: 'pin' }, icon('pin'))));
        // And what the ground is there, as the detailed map draws it, once it's been worked out off the main thread
        const dropped = pin;
        const pinStyle = styleFor(world);
        if (pinStyle) {
            terrainInWorker(spherePoint(dropped.latitude * Math.PI / 180, dropped.longitude * Math.PI / 180), pinStyle, detailedOctaves).then((found) => {
                const facts = [WorldText.terrain(found.terrain), WorldText.altitude(found.altitude)].filter(Boolean);
                if (pin === dropped && facts.length) pill.textContent = [formatCoordinates(dropped.latitude, dropped.longitude), ...facts].join('  ·  ');
            }).catch(() => {});
        }
        clearTimeout(pinTimer);
        pinTimer = setTimeout(() => pinLayer.replaceChildren(), pinDuration * 1000);
    });
    viewport.addEventListener('wheel', (event) => {
        if (!event.ctrlKey && !event.metaKey) return;
        event.preventDefault();
        const rect = viewport.getBoundingClientRect();
        const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        setZoom(zoom * Math.exp(-event.deltaY * 0.01), fractionAt(point), point);
    }, { passive: false });
    let gesture = null;
    viewport.addEventListener('gesturestart', (event) => {
        event.preventDefault();
        const rect = viewport.getBoundingClientRect();
        const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        gesture = { zoom, anchor: fractionAt(point), point };
    });
    viewport.addEventListener('gesturechange', (event) => {
        event.preventDefault();
        if (gesture) setZoom(gesture.zoom * event.scale, gesture.anchor, gesture.point);
    });

    // MARK: header

    const addPlaceButton = canEdit ? button([icon('pin'), t('Add place')], {
        color: 'highlight', pill: false, title: t('Click the map to mark a city, town or other place there'), className: 'add-place',
        onClick: () => {
            placing = !placing;
            addPlaceButton.classList.toggle('on', placing);
            renderFooter();
        },
    }) : null;
    const exportButton = button([icon('export'), t('Export')], {
        color: 'control', pill: false, title: t('Export the map, with its grid and places, as an image or PDF'),
        onClick: () => {
            if (!image) return;
            const menu = h('div', { class: 'export-menu' });
            for (const [projection, title] of [['equirectangular', t('Rectangular Map')], ['icosahedral', t('Icosahedral Map')]]) {
                menu.append(h('div', { class: 'heading' }, title));
                for (const format of formats) {
                    menu.append(h('button', { type: 'button', onclick: () => {
                        pop.close();
                        exportMap(projection, format);
                    } }, t(format.title)));
                }
            }
            const includeData = h('input', { type: 'checkbox', checked: Settings.get('surfaceMapExportIncludesWorldData') });
            includeData.addEventListener('change', () => Settings.set('surfaceMapExportIncludesWorldData', includeData.checked));
            menu.append(h('label', { class: 'row footnote' }, includeData, t('Include world data below the map (PDF)')));
            // A PDF can draw the map in outline, as contour lines on a blank page; the last choice is remembered
            if (styleFor(world)) {
                const outline = h('input', { type: 'checkbox', checked: !!Settings.get('surfaceMapExportOutline') });
                outline.addEventListener('change', () => Settings.set('surfaceMapExportOutline', outline.checked));
                menu.append(h('label', { class: 'row footnote' }, outline, t('Outline: contour lines and coastlines only, for printing')));
            }
            // The globe as a 3D model, with its relief and cells as the planetary view draws them
            if (options.loadGlobe && styleFor(world)) {
                menu.append(h('div', { class: 'heading' }, t('3D globe')));
                for (const format of modelFormats) {
                    menu.append(h('button', { type: 'button', onclick: () => {
                        pop.close();
                        exportModel(format);
                    } }, t(format.title)));
                }
                const resolution = h('select', { 'aria-label': t('Globe resolution') }, [1, 2, 4].map((scale, index) =>
                    h('option', { value: String(scale), selected: scale === (Settings.get('globeExportResolution') ?? 1) },
                        `${scale === 1 ? t('Standard') : `${scale}×`} (${cellCount(globeSubdivisions + index).toLocaleString()} ${t('cells')})`)));
                resolution.addEventListener('change', () => Settings.set('globeExportResolution', Number(resolution.value)));
                const mount = h('select', { 'aria-label': t('Mount') }, mounts.map((m) =>
                    h('option', { value: m.id, selected: m.id === (Settings.get('globeExportMount') ?? 'none') }, t(m.title))));
                mount.addEventListener('change', () => Settings.set('globeExportMount', mount.value));
                menu.append(h('label', { class: 'row footnote' }, t('Globe resolution:'), resolution),
                    h('label', { class: 'row footnote' }, t('Mount:'), mount));
            }
            const pop = popover(exportButton, menu);
        },
    });
    exportButton.disabled = true;

    const exportMap = async (projection, format) => {
        try {
            const fileName = projection === 'equirectangular' ? t('%@ %@ surface map', options.primaryStarName ?? '', worldName)
                : t('%@ %@ world map', options.primaryStarName ?? '', worldName);
            const outline = format.id === 'pdf' && Settings.get('surfaceMapExportOutline') && styleFor(world) ? styleFor(world) : null;
            exporting(true);
            let drawn;
            try {
                drawn = outline
                    ? await (projection === 'equirectangular' ? drawEquirectangularOutline(image, places, outline)
                        : drawIcosahedralOutline(image, places, world, outline))
                    : projection === 'equirectangular' ? drawEquirectangular(image, places, format.id === 'pdf')
                        : drawIcosahedral(image, places, world, format.id === 'pdf');
            } finally {
                exporting(false);
            }
            if (format.id === 'pdf') {
                // A colour map JPEG-encoded, which keeps the PDF a fraction of the size
                const page = h('div', { class: 'print-map' }, h('img', { src: outline ? drawn.toDataURL('image/png')
                    : drawn.toDataURL('image/jpeg', 0.88), alt: worldName }));
                if (Settings.get('surfaceMapExportIncludesWorldData')) {
                    const printed = applyingAnnotations(world, options.annotation);
                    page.append(printedWorldData(printed, options.planet, options.systemName ?? '', worldName));
                }
                printPage(page, fileName.trim(), { landscape: true });
            } else {
                await saveCanvas(drawn, fileName.trim(), format);
            }
        } catch (error) {
            alert(`${t("Couldn't export the map")}\n${error.message ?? error}`);
        }
    };

    // MARK: settlements

    // The world's people as the GM has them, if anyone lives there, with their society
    const settled = applyingAnnotations(world, options.annotation)?.social;
    const settledSociety = settled?.population > 0 && settled.society ? settled : null;
    let isSettling = false;
    // Places the world's settlements (see settlementPlanner.js), in place of any already on the map; other places are
    // kept, and the new settlements' names are kept apart from theirs
    const generateSettlements = async () => {
        const style = styleFor(world);
        if (!settledSociety || !style || isSettling) return;
        isSettling = true;
        settleButton.disabled = true;
        try {
            // The globe's rivers, as the planetary view draws them; only climate and biome surfaces have them
            const globe = style.biomes && options.loadGlobe ? await options.loadGlobe().catch(() => null) : null;
            const kept = places.filter((place) => !settlementKinds.has(place.kind));
            const settlements = planSettlements({ population: settledSociety.population, society: settledSociety.society,
                terrain: settlementTerrain(style, globe), taken: kept.map((place) => place.name), generator: freshGenerator() });
            places = [...kept, ...settlements];
            changed();
        } catch (error) {
            alert(`${t("Couldn't place settlements")}\n${error.message ?? error}`);
        } finally {
            isSettling = false;
            settleButton.disabled = !image;
        }
    };
    const settleButton = settledSociety && canEdit ? button([icon('city'), t('Settle')], {
        color: 'highlight', pill: false, className: 'dimmed',
        title: t('Place the world\'s capital, its cities and its towns and villages where people would settle, and choose how its cities are built'),
        onClick: () => {
            const menu = h('div', { class: 'settle-options' });
            const showOptions = () => menu.replaceChildren(
                h('div', { class: 'heading' }, t("How this world's cities are built")),
                ...cityStylePickers(cityStyle, t('Automatic'), (style) => {
                    cityStyle = style;
                    options.onCityStyleChange?.(cityStyleIsEmpty(style) ? null : structuredClone(style));
                }),
                h('div', { class: 'footnote' }, t('Automatic choices follow each place\'s climate, terrain and technology. A settlement can set its own in its editor.')),
                h('div', { class: 'row end' }, h('button', { type: 'button', class: 'default', onclick: () => {
                    if (places.some((place) => settlementKinds.has(place.kind))) {
                        // Asks before placing settlements over those already on the map
                        menu.replaceChildren(h('div', { class: 'heading' }, t('Replace the cities, towns and villages on the map?')),
                            h('div', { class: 'footnote' }, t('New ones are placed in their stead. Ports, bases, outposts and landmarks are kept.')),
                            h('div', { class: 'row end' },
                                h('button', { type: 'button', onclick: () => pop.close() }, t('Cancel')),
                                h('button', { type: 'button', class: 'destructive', onclick: () => {
                                    pop.close();
                                    generateSettlements();
                                } }, t('Replace'))));
                    } else {
                        pop.close();
                        generateSettlements();
                    }
                } }, t('Place Settlements'))));
            showOptions();
            const pop = popover(settleButton, menu);
        },
    }) : null;
    if (settleButton) settleButton.disabled = true;

    // Worlds with an atmosphere have weather
    const weatherButton = hasWeather(world) ? button([icon('cloud'), t('Weather')], {
        color: 'info', pill: false, title: t('The weather all over this world now: precipitation radar and temperature maps, with its winds and storms'),
        onClick: () => showWeather(world, { worldName, terrain: image ?? loading, sunDirection: options.sunDirection ?? (() => null) }),
    }) : null;

    // An export can take a while to draw (unfolding the icosahedral map, tracing its contours), so it says so
    const exportNote = h('div', { class: 'map-exporting', hidden: true }, h('span', { class: 'spinner' }), t('Exporting…'));
    viewport.append(exportNote);
    const exporting = (on) => {
        exportNote.hidden = !on;
        exportButton.disabled = on || !image;
    };

    /** Writes the world's globe, with its relief and cells as the planetary view draws them, as a 3D model */
    const exportModel = async (format) => {
        try {
            exporting(true);
            const globe = await options.loadGlobe(Settings.get('globeExportResolution') ?? 1);
            if (!globe) throw new Error(t("The globe couldn't be drawn."));
            const name = t('%@ %@ globe', options.primaryStarName ?? '', worldName).trim();
            const blob = modelFile(globe, format.id, Settings.get('globeExportMount') ?? 'none', name);
            exporting(false);
            await saveBlob(blob, `${safeFileName(name)}.${format.extension}`, { title: format.title, type: 'application/octet-stream', extension: format.extension });
        } catch (error) {
            alert(`${t("Couldn't export the globe")}\n${error.message ?? error}`);
        } finally {
            exporting(false);
        }
    };

    let sheet;
    const header = h('div', { class: 'map-header' },
        h('span', { class: 'name', style: { color: world.isPrincipal ? 'var(--highlight)' : 'var(--primary)' } }, (world.isPrincipal ? '★ ' : '') + worldName),
        h('span', { class: 'sah summary' }, WorldText.summary({ radiusKm: world.radiusKm, gasGiant: world.gasGiant, environment: world.environment })),
        h('span', { class: 'spacer' }), weatherButton, settleButton, addPlaceButton, exportButton, zoomOut, zoomText, zoomIn,
        button(t('Close'), { color: 'alert', onClick: () => sheet.close() }));
    const element = panel({ title: `${t('Surface map')}  ${worldName}`, color: 'info', segments: ['control', 'label', 'info'] }, header, viewport, footer);
    sheet = showSheet(element, { className: 'themed-sheet wide', onClose: () => { resizeObserver.disconnect(); clearTimeout(pinTimer); } });
    const resizeObserver = new ResizeObserver(() => layout());
    resizeObserver.observe(viewport);
    layout();
    renderMarkers();
    renderFooter();

    // Drawn (or read) at a resolution, again whenever another is chosen; only the last one asked for is shown
    let drawing = 0;
    const draw = (scale) => {
        const run = ++drawing;
        resolution = scale;
        progressText.textContent = scale === 1 ? t('Drawing surface map…') : t('Drawing surface map at %@…', `${scale}×`);
        progressBar.value = 0;
        progressBar.hidden = false;
        if (!progress.parentNode) viewport.append(progress);
        exportButton.disabled = true;
        if (settleButton) settleButton.disabled = true;
        load((fraction) => { if (run === drawing) progressBar.value = fraction; }, scale).then((loaded) => {
            if (run !== drawing) return;
            shown(loaded);
        }).catch((error) => {
            if (run !== drawing) return;
            progressBar.hidden = true;
            progressText.textContent = String(error.message ?? error);
        });
    };
    const resolutionMenu = resolutionPicker({ key: 'mapResolution', scales: Settings.mapResolutions, current: resolution,
        title: resolutionTitle, onChange: draw,
        help: t("How finely this surface map is drawn. Each resolution is saved with the universe the first time it's drawn, so it opens straight away after that.") });
    header.insertBefore(resolutionMenu, zoomOut);
    draw(resolution);

    function shown(loaded) {
        if (!loaded) return;
        image = loaded;
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(image.pixels.buffer, image.pixels.byteOffset, image.pixels.length), image.width, image.height), 0, 0);
        progress.remove();
        exportButton.disabled = false;
        if (settleButton) settleButton.disabled = false;
    }
}

/**
 * Pickers for a city style's architecture, street layout and harmony, each with a choice that leaves it to
 * `automaticLabel`: chosen automatically for a world, or the world's for a settlement. `onChange` gets the new style.
 */
export function cityStylePickers(style, automaticLabel, onChange, disabled = false) {
    const current = { ...style };
    const picker = (title, key, values, names, help) => {
        const select = h('select', { disabled, 'aria-label': title, title: help?.(current[key]) ?? '' },
            h('option', { value: '', selected: current[key] == null }, automaticLabel),
            ...values.map((value) => h('option', { value, selected: current[key] === value }, t(names[value]))));
        select.addEventListener('change', () => {
            if (select.value) current[key] = select.value;
            else delete current[key];
            select.title = help?.(current[key]) ?? '';
            onChange({ ...current });
        });
        return h('label', { class: 'field' }, h('span', {}, title), select);
    };
    return [
        picker(t('Architecture'), 'architecture', architectureStyles, architectureNames, (value) => (value
            ? t(architectureSummaries[value]) : t('From the climate, fading as technology lets builders build alike anywhere'))),
        picker(t('Street Layout'), 'layout', streetLayouts, streetLayoutNames),
        picker(t('Buildings'), 'harmony', harmonies, harmonyNames,
            () => t('How alike the buildings are: one material and roofline throughout, or every building its own')),
    ];
}

// MARK: export drawing

const style = () => getComputedStyle(document.body);

function imageCanvas(image) {
    const source = document.createElement('canvas');
    source.width = image.width;
    source.height = image.height;
    source.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(image.pixels.buffer, image.pixels.byteOffset, image.pixels.length), image.width, image.height), 0, 0);
    return source;
}

function gridStroke(context, path, major, scale) {
    context.strokeStyle = `rgba(0,0,0,${major ? 0.55 : 0.4})`;
    context.lineWidth = (major ? 3.5 : 2.5) * scale;
    context.stroke(path);
    context.strokeStyle = `rgba(255,255,255,${major ? 0.95 : 0.75})`;
    context.lineWidth = (major ? 1.5 : 1) * scale;
    context.stroke(path);
}

function gridLabel(context, text, x, y, scale, outline = false) {
    context.font = `600 ${11 * scale}px system-ui, sans-serif`;
    const width = context.measureText(text).width;
    const pw = 4 * scale, ph = 1.5 * scale, height = 13 * scale;
    context.fillStyle = outline ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.6)';
    context.beginPath();
    context.roundRect(x, y - height - 2 * ph, width + 2 * pw, height + 2 * ph, (height + 2 * ph) / 2);
    context.fill();
    context.fillStyle = outline ? 'black' : 'white';
    context.textBaseline = 'middle';
    context.fillText(text, x + pw, y - ph - height / 2);
}

/** In `outline`, for a line drawing on a blank page, names are dark on a white pill rather than light on a dark one */
function drawPlaces(context, places, position, scale, outline = false) {
    const computed = style();
    for (const place of places) {
        const [x, y] = position(place);
        const symbolSize = (place.kind === 'capital' ? 16 : 13) * scale;
        context.font = `700 ${symbolSize}px system-ui, sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.shadowColor = outline ? 'white' : 'black';
        context.shadowBlur = 3 * scale;
        context.fillStyle = computed.getPropertyValue(`--${placeColors[place.kind] ?? 'primary'}`).trim() || 'white';
        context.fillText(placeSymbols[place.kind] ?? '•', x, y);
        context.shadowBlur = 0;
        context.font = `600 ${10 * scale}px system-ui, sans-serif`;
        const width = context.measureText(place.name).width + 8 * scale;
        const top = y + symbolSize * 0.6;
        context.fillStyle = outline ? 'white' : 'rgba(0,0,0,0.6)';
        context.beginPath();
        context.roundRect(x - width / 2, top, width, 14 * scale, 7 * scale);
        context.fill();
        if (outline) {
            context.strokeStyle = 'rgba(0,0,0,0.5)';
            context.lineWidth = 0.5 * scale;
            context.stroke();
        }
        context.fillStyle = outline ? 'black' : 'white';
        context.fillText(place.name, x, top + 7 * scale);
        context.textAlign = 'start';
    }
}

/** The map as shown, at its own resolution, with its grid and places */
function drawEquirectangular(image, places, clear) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const scale = image.width / exportLayoutWidth;
    const context = canvas.getContext('2d');
    if (!clear) {
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(imageCanvas(image), 0, 0);
    const w = canvas.width, hgt = canvas.height;
    for (let latitude = -90 + gridSpacing; latitude < 90; latitude += gridSpacing) {
        const path = new Path2D();
        const y = hgt * (90 - latitude) / 180;
        path.moveTo(0, y);
        path.lineTo(w, y);
        gridStroke(context, path, latitude === 0, scale);
    }
    for (let longitude = 0; longitude < 360; longitude += gridSpacing) {
        const path = new Path2D();
        const x = w * longitude / 360;
        path.moveTo(x, 0);
        path.lineTo(x, hgt);
        gridStroke(context, path, longitude === 0, scale);
    }
    for (let latitude = -90 + gridSpacing; latitude < 90; latitude += gridSpacing) {
        gridLabel(context, formatLatitude(latitude), 4 * scale, hgt * (90 - latitude) / 180 - 3 * scale, scale);
    }
    for (let longitude = gridSpacing; longitude < 360; longitude += gridSpacing) {
        gridLabel(context, `${longitude}°E`, w * longitude / 360 + 4 * scale, hgt - 4 * scale, scale);
    }
    drawPlaces(context, places, (p) => [w * p.longitude / 360, hgt * (90 - p.latitude) / 180 + 8 * scale], scale);
    return canvas;
}

/** A blank page for a map in outline */
function outlineCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    return { canvas, context };
}

/** Grid lines for a map in outline: fine and grey, as on a printed topographic map */
function outlineStroke(context, path, major, scale) {
    context.strokeStyle = `rgba(0,0,0,${major ? 0.45 : 0.25})`;
    context.lineWidth = (major ? 0.9 : 0.5) * scale;
    context.stroke(path);
}

/** The equirectangular map as contour lines and coastlines on a blank page, with its grid and places */
export async function drawEquirectangularOutline(image, places, style) {
    const { canvas, context } = outlineCanvas(image.width, image.height);
    const scale = image.width / exportLayoutWidth;
    const grid = { kind: 'equirectangular' };
    const shape = gridShape(grid);
    const [levels, heights] = await Promise.all([Promise.resolve(contourLevels(style)),
        contourHeightsInWorker(style, grid, shape.columns * shape.rows)]);
    const lines = contourLines(levels, heights, shape.columns, shape.rows,
        (x, y) => [x / mapColumns * canvas.width, y / (mapColumns / 2) * canvas.height]);
    drawContours(context, lines, scale);
    const w = canvas.width, hgt = canvas.height;
    for (let latitude = -90 + gridSpacing; latitude < 90; latitude += gridSpacing) {
        const path = new Path2D();
        path.moveTo(0, hgt * (90 - latitude) / 180);
        path.lineTo(w, hgt * (90 - latitude) / 180);
        outlineStroke(context, path, latitude === 0, scale);
    }
    for (let longitude = 0; longitude < 360; longitude += gridSpacing) {
        const path = new Path2D();
        path.moveTo(w * longitude / 360, 0);
        path.lineTo(w * longitude / 360, hgt);
        outlineStroke(context, path, longitude === 0, scale);
    }
    for (let latitude = -90 + gridSpacing; latitude < 90; latitude += gridSpacing) {
        gridLabel(context, formatLatitude(latitude), 4 * scale, hgt * (90 - latitude) / 180 - 3 * scale, scale, true);
    }
    for (let longitude = gridSpacing; longitude < 360; longitude += gridSpacing) {
        gridLabel(context, `${longitude}°E`, w * longitude / 360 + 4 * scale, hgt - 4 * scale, scale, true);
    }
    drawPlaces(context, places, (p) => [w * p.longitude / 360, hgt * (90 - p.latitude) / 180 + 8 * scale], scale, true);
    return canvas;
}

/** The icosahedral map as contour lines on a blank page, each face's lines clipped to its triangle */
export async function drawIcosahedralOutline(image, places, world, style) {
    const edge = Math.max(Math.round(image.width / 5), 1);
    const { canvas, context } = outlineCanvas(Math.round(edge * layoutSize.width), Math.round(edge * layoutSize.height));
    const scale = canvas.width / exportLayoutWidth;
    const levels = contourLevels(style);
    const faceLines = await Promise.all(netFaces.map(async (_, index) => {
        const grid = { kind: 'face', face: index };
        const shape = gridShape(grid);
        const heights = await contourHeightsInWorker(style, grid, shape.columns * shape.rows);
        return contourLines(levels, heights, shape.columns, shape.rows,
            (x, y) => [(shape.origin[0] + x * shape.step) * edge, (shape.origin[1] + y * shape.step) * edge]);
    }));
    netFaces.forEach((face, index) => {
        const triangle = new Path2D();
        face.corners.forEach(([x, y], k) => (k ? triangle.lineTo(x * edge, y * edge) : triangle.moveTo(x * edge, y * edge)));
        triangle.closePath();
        context.save();
        context.clip(triangle);
        drawContours(context, faceLines[index], scale);
        context.restore();
    });
    drawHexGrid(context, world, edge, scale, true);
    for (const face of netFaces) {
        const triangle = new Path2D();
        face.corners.forEach(([x, y], k) => (k ? triangle.lineTo(x * edge, y * edge) : triangle.moveTo(x * edge, y * edge)));
        triangle.closePath();
        outlineStroke(context, triangle, true, scale);
    }
    drawPlaces(context, places, (p) => {
        const [x, y] = layoutPoint(p.latitude, p.longitude);
        return [x * edge, y * edge + 8 * scale];
    }, scale, true);
    return canvas;
}

/** Hexes about 750 km across over each face of the icosahedral map, faint and fine in outline */
function drawHexGrid(context, world, edge, scale, outline = false) {
    const hexes = world.gasGiant ? 10 : Math.max(Math.round(1.05 * world.radiusKm / 750), 2);
    const spacing = edge / hexes, radius = spacing / Math.sqrt(3);
    for (const face of netFaces) {
        const corners = face.corners.map(([x, y]) => [x * edge, y * edge]);
        const triangle = new Path2D();
        triangle.moveTo(...corners[0]);
        triangle.lineTo(...corners[1]);
        triangle.lineTo(...corners[2]);
        triangle.closePath();
        const hexPath = new Path2D();
        for (let i = 0; i <= hexes; i++) {
            for (let j = 0; j <= hexes - i; j++) {
                const ti = i / hexes, u = j / hexes;
                const cx = corners[0][0] + ti * (corners[1][0] - corners[0][0]) + u * (corners[2][0] - corners[0][0]);
                const cy = corners[0][1] + ti * (corners[1][1] - corners[0][1]) + u * (corners[2][1] - corners[0][1]);
                for (let k = 0; k <= 6; k++) {
                    const angle = (90 + 60 * k) * Math.PI / 180;
                    const x = cx + radius * Math.cos(angle), y = cy + radius * Math.sin(angle);
                    if (k === 0) hexPath.moveTo(x, y);
                    else hexPath.lineTo(x, y);
                }
            }
        }
        context.save();
        context.clip(triangle);
        if (outline) {
            context.strokeStyle = 'rgba(0,0,0,0.25)';
            context.lineWidth = 0.4 * scale;
            context.stroke(hexPath);
        } else {
            context.strokeStyle = 'rgba(0,0,0,0.35)';
            context.lineWidth = 1.5 * scale;
            context.stroke(hexPath);
            context.strokeStyle = 'rgba(255,255,255,0.5)';
            context.lineWidth = 0.6 * scale;
            context.stroke(hexPath);
        }
        context.restore();
    }
}

/**
 * Unfolded onto 20 triangles, as in Fuller's Dymaxion map, and laid over with hexes about 750 km across: an
 * icosahedron's edge is 1.05 times the radius of the sphere around it
 */
function drawIcosahedral(image, places, world, clear) {
    const edge = Math.max(Math.round(image.width / 5), 1);
    const net = renderNet(image, edge);
    const canvas = document.createElement('canvas');
    canvas.width = net.width;
    canvas.height = net.height;
    const scale = net.width / exportLayoutWidth;
    const context = canvas.getContext('2d');
    if (!clear) {
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    const netCanvas = document.createElement('canvas');
    netCanvas.width = net.width;
    netCanvas.height = net.height;
    netCanvas.getContext('2d').putImageData(new ImageData(net.pixels, net.width, net.height), 0, 0);
    context.drawImage(netCanvas, 0, 0);
    drawHexGrid(context, world, edge, scale);
    for (const face of netFaces) {
        const triangle = new Path2D();
        face.corners.forEach(([x, y], k) => (k ? triangle.lineTo(x * edge, y * edge) : triangle.moveTo(x * edge, y * edge)));
        triangle.closePath();
        gridStroke(context, triangle, true, scale);
    }
    drawPlaces(context, places, (p) => {
        const [x, y] = layoutPoint(p.latitude, p.longitude);
        return [x * edge, y * edge + 8 * scale];
    }, scale);
    return canvas;
}

// MARK: printed world data

/** A world's or moon's data laid out for print below an exported map: black on a clear page, in balanced columns */
export function printedWorldData(world, planet, systemName, worldName) {
    const sections = [];
    const data = [[t('Designation'), world.designation],
        [t('Type'), planet ? t('Moon of %@', planet.designation) : WorldText.typeName(world)]];
    if (world.type !== 'asteroidBelt') {
        data.push([t('Radius'), WorldText.radius(world.radiusKm)], [t('Mass'), WorldText.mass(world.massEarths)],
            [t('Gravity'), WorldText.gravity(gravityOf(world))]);
    }
    if (world.isPrincipal) data.push([t('Principal world'), t('Yes')]);
    sections.push({ title: planet ? t('Moon data') : t('World data'), rows: data });
    const environment = [[t('Habitable zone'), world.inHabitableZone ? t('Yes') : t('No')]];
    if (!planet) environment.push([t('Starlight'), t("%@ × Earth's", insolation(world).toFixed(2))]);
    if (world.environment) environment.push(...environmentRows(world.environment).map(([label, value]) => [label, value]));
    sections.push({ title: t('Environment'), rows: environment });
    // A moon's map world carries its planet's orbit, so a moon shows the planet and its distance from the star(s)
    let orbit;
    if (planet) {
        orbit = [[t('Orbits'), planet.designation],
            [t('Planet'), WorldText.summary({ radiusKm: planet.radiusKm, gasGiant: planet.gasGiant, environment: planet.environment,
                isBelt: planet.type === 'asteroidBelt' })],
            [t("Planet's star(s)"), planet.parentLabel === '' ? t('Primary') : planet.parentLabel],
            [t('Distance from star'), StarText.number(planet.au, 3, ' AU')], [t('Year'), StarText.number(planet.period, 2, ' yr')]];
    } else {
        orbit = [[t('Orbits'), world.parentLabel === '' ? t('Primary') : world.parentLabel],
            [t('Semi-major axis'), StarText.number(world.au, 3, ' AU')], [t('Eccentricity'), StarText.number(world.eccentricity)],
            [t('Inclination'), StarText.number(world.inclination, 1, '°')], [t('Period'), StarText.number(world.period, 2, ' yr')]];
        if (world.anomaly) orbit.push([t('Anomaly'), WorldText.anomaly(world.anomaly)]);
        if (world.resonance) orbit.push([t('Resonance'), world.resonance]);
    }
    sections.push({ title: t('Orbit'), rows: orbit });
    if (world.rotation) {
        sections.push({ title: t('Rotation'), rows: rotationRows(world.rotation, planet?.designation).map(([label, value]) => [label, value]) });
    }
    if (!planet && (world.rings > 0 || world.moons?.length)) {
        const moons = world.rings > 0 ? [[t('Rings'), String(world.rings)]] : [];
        for (const moon of world.moons) {
            moons.push([(moon.isPrincipal ? '★ ' : '') + moon.designation,
                WorldText.summary({ radiusKm: moon.radiusKm, gasGiant: moon.gasGiant, environment: moon.environment })]);
        }
        sections.push({ title: `${t('Moons')}  ${world.moons.length}`, rows: moons });
    }
    if (world.social) sections.push(...WorldText.socialSections(world.social, world));
    const visible = sections.filter((section) => section.rows.length);
    // Sections shared out over the columns in order, each column taking about the same number of lines
    const total = visible.reduce((sum, s) => sum + s.rows.length + 2, 0);
    const target = total / 3;
    const columns = [[]];
    let lines = 0;
    for (const section of visible) {
        const size = section.rows.length + 2;
        if (columns.length < 3 && columns[columns.length - 1].length && lines + size / 2 > target * columns.length) columns.push([]);
        columns[columns.length - 1].push(section);
        lines += size;
    }
    return h('div', { class: 'printed-world' },
        h('div', { class: 'printed-title' }, h('h1', {}, (world.isPrincipal ? '★ ' : '') + worldName),
            systemName ? h('span', { class: 'system' }, systemName) : null, h('span', { class: 'spacer' })),
        h('div', { class: 'printed-columns' }, columns.map((column) => h('div', {}, column.map((section) =>
            h('section', {}, h('h2', {}, section.title), section.rows.map(([label, value]) =>
                h('div', { class: 'printed-row' }, h('span', {}, label), h('strong', {}, value)))))))));
}
