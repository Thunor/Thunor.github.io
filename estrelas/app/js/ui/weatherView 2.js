//
//  weatherView.js
//  Estrelas (web)
//
//  The weather over the whole of the world zoomed to, as it is now: a map of precipitation radar or temperature over
//  the world's surface map, with the night side shaded, and a summary of its cloud, temperatures, winds and storms.
//  It keeps up as time runs. A port of WeatherView.swift.
//

import { h, panel, button, icon, sectionHeader, dataRow } from './components.js';
import { t } from './i18n.js';
import { showSheet } from './sheets.js';
import { WorldText } from './worldText.js';
import { formatCoordinates } from '../scene/starMap.js';
import { weatherInWorker } from '../model/dataStore.js';
import { WeatherClock } from '../surface/cloudModel.js';
import { isFaceLocked, celsius } from '../surface/localWeather.js';
import { cloudsFor, styleFor } from '../surface/surfaceMap.js';
import {
    weatherLayers, weatherLayerTitles, weatherWidth, weatherHeight, weatherSummary, layerPixels, nightPixels,
    rainColours, temperatureColours,
} from '../surface/weatherMap.js';

/** How often the weather is worked out again while time runs, in milliseconds */
const refresh = 500;

const rgb = (c) => `rgb(${Math.round(c[0] * 255)} ${Math.round(c[1] * 255)} ${Math.round(c[2] * 255)})`;
const percent = (fraction) => `${Math.round(fraction * 100)}%`;
const speed = (metresPerSecond) => `${Math.round(metresPerSecond * 3.6)} km/h`;
const stormName = (name) => (name.value !== undefined ? t(name.key, name.value) : t(name.key));

/** Whether a world has weather to show: an atmosphere with clouds over it */
export function hasWeather(world) {
    return !!(world?.environment && cloudsFor(world));
}

/**
 * Opens the weather of `world`. `options`: worldName, terrain (the surface map drawn already, as { width, height,
 * pixels }, or a promise of it), sunDirection() (its nearest star's direction in the world's own space, now)
 */
export function showWeather(world, { worldName, terrain, sunDirection = () => null }) {
    const clouds = cloudsFor(world);
    const environment = world.environment;
    if (!clouds || !environment) return;
    const faceLocked = isFaceLocked(world);
    const style = styleFor(world);
    const surface = style && style.kind !== 'gasGiant' ? style : null;
    let layer = 'radar';
    let snapshot = null;
    let closed = false;
    let timer = null;
    let lastTime = null;

    const ground = h('canvas', { class: 'weather-ground' });
    const overlay = h('canvas', { class: 'weather-overlay', width: weatherWidth, height: weatherHeight });
    const night = h('canvas', { class: 'weather-overlay', width: weatherWidth, height: weatherHeight });
    const storms = h('div', { class: 'weather-storms' });
    const map = h('div', { class: 'weather-map' }, ground, overlay, night, storms);
    const holder = h('div', { class: 'weather-map-holder' }, map);
    const legend = h('div', { class: 'weather-legend' });
    const summary = h('div', { class: 'weather-summary' });

    Promise.resolve(terrain).then((image) => {
        if (!image || closed) return;
        ground.width = image.width;
        ground.height = image.height;
        ground.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(image.pixels.buffer, image.pixels.byteOffset,
            image.pixels.length), image.width, image.height), 0, 0);
    }).catch(() => {});

    const paint = (canvas, pixels) => {
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (pixels) context.putImageData(new ImageData(pixels, weatherWidth, weatherHeight), 0, 0);
    };

    // Capitalised, as some languages write the strengths in lower case for use inside a phrase
    const swatch = (colour, title) => h('span', { class: 'swatch' }, h('i', { style: { background: rgb(colour) } }),
        t(title).replace(/^./, (c) => c.toLocaleUpperCase()));

    const render = () => {
        if (!snapshot) return;
        const totals = weatherSummary(snapshot);
        paint(overlay, layerPixels(snapshot, layer));
        paint(night, nightPixels(snapshot));
        storms.replaceChildren(...snapshot.storms.map((storm) => h('div', {
            class: 'weather-storm',
            style: { left: `${storm.longitude / 360 * 100}%`, top: `${(90 - storm.latitude) / 180 * 100}%` },
        }, icon('hurricane'), h('span', {}, stormName(storm.name)))));

        const items = [];
        if (layer === 'radar') {
            items.push(swatch(rainColours[0], 'Light'), swatch(rainColours[2], 'Moderate'), swatch(rainColours[4], 'Heavy'),
                swatch(rainColours[5], 'Torrential'), swatch([1, 0.65, 0.82], 'Sleet'), swatch([0.45, 0.62, 0.98], 'Snow'));
            if (environment.atmosphere === 'sulfuric') items.push(swatch([0.92, 0.85, 0.4], 'Acid rain evaporating aloft'));
        } else {
            items.push(h('span', { class: 'gradient' }, h('span', { class: 'numeric' }, celsius(totals.coldest)),
                h('i', { style: { background: `linear-gradient(to right, ${temperatureColours.map(rgb).join(', ')})` } }),
                h('span', { class: 'numeric' }, celsius(totals.hottest))));
        }
        items.push(h('span', { class: 'spacer' }));
        if (snapshot.sun) items.push(swatch([0.1, 0.1, 0.2], 'Night'));
        legend.replaceChildren(...items);

        const strongest = totals.strongestWind;
        const column = (...children) => h('div', { class: 'column' }, ...children);
        summary.replaceChildren(
            column(dataRow(t('Cloud cover'), percent(totals.cloudCover)),
                dataRow(t('Raining or snowing on'), percent(totals.precipitationCover))),
            column(dataRow(t('Average'), celsius(totals.meanKelvin)),
                dataRow(t('Range'), `${celsius(totals.coldest)} ${t('to')} ${celsius(totals.hottest)}`)),
            column(dataRow(t('Strongest wind'), speed(strongest.speed)),
                dataRow(t('At'), formatCoordinates(strongest.latitude, strongest.longitude))),
            column(sectionHeader(t('Storms'), 'label'),
                ...(snapshot.storms.length ? snapshot.storms.map((storm) => h('div', { class: 'storm-line' },
                    `${stormName(storm.name)} · ${formatCoordinates(storm.latitude, storm.longitude)} · ${speed(storm.wind)}`))
                    : [h('div', { class: 'hint' }, t('No cyclones'))])));
    };

    // Worked out again and again while open, so the weather moves on as time runs
    const update = async (force = false) => {
        if (closed) return;
        const time = WeatherClock.time;
        if (force || time !== lastTime || !snapshot) {
            lastTime = time;
            try {
                const next = await weatherInWorker({ clouds, environment, time, sunDirection: sunDirection(), faceLocked, surface });
                if (closed) return;
                snapshot = next;
                render();
            } catch (error) {
                summary.replaceChildren(h('span', {}, String(error.message ?? error)));
            }
        }
        if (!closed) timer = setTimeout(() => update(), refresh);
    };

    const layerButtons = weatherLayers.map((option) => {
        const element = button(t(weatherLayerTitles[option]), {
            color: 'highlight', pill: false,
            onClick: () => {
                layer = option;
                layerButtons.forEach((b, index) => b.classList.toggle('dimmed', weatherLayers[index] !== layer));
                render();
            },
        });
        element.classList.toggle('dimmed', option !== layer);
        return element;
    });

    let sheet;
    const header = h('div', { class: 'map-header' },
        h('span', { class: 'name', style: { color: world.isPrincipal ? 'var(--highlight)' : 'var(--primary)' } },
            (world.isPrincipal ? '★ ' : '') + worldName),
        h('span', { class: 'sah summary' }, WorldText.atmosphere(environment)),
        h('span', { class: 'spacer' }), ...layerButtons,
        button(t('Close'), { color: 'alert', onClick: () => sheet.close() }));
    const element = panel({ title: `${t('Weather')}  ${worldName}`, color: 'info', segments: ['control', 'label', 'info'] },
        header, holder, legend, summary);
    sheet = showSheet(element, {
        className: 'themed-sheet wide weather-sheet',
        onClose: () => {
            closed = true;
            clearTimeout(timer);
            resizeObserver.disconnect();
        },
    });
    // The largest 2:1 map that fits
    const layout = () => {
        const width = Math.min(holder.clientWidth, holder.clientHeight * 2);
        Object.assign(map.style, { width: `${width}px`, height: `${width / 2}px` });
    };
    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(holder);
    layout();
    update(true);
}
