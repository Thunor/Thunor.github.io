//
//  localWeather.js
//  Estrelas (web)
//
//  The weather at one spot on a world, as its cloud layer shows it there: the cloud shader's weather worked out again
//  on the CPU for that spot (cloudModel.js), then read as a forecaster would: sky, storms, precipitation, temperature
//  and wind. A port of LocalWeather.swift.
//

import { cloudsFor } from './surfaceMap.js';
import {
    cloudSettings, sampleClouds, WeatherClock, windSpeed, saturate, smoothstep, offsetFrom, substellar,
} from './cloudModel.js';
import { t } from '../ui/i18n.js';

/** Whether a world keeps one face to its star, so its day side and night side never move */
export function isFaceLocked(world) {
    return world.rotation?.tidalLock === 'star';
}

const normalize = (v) => {
    const l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
};
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * The weather at `point` (a unit vector in the world's own space) on `world`, with `sunElevation` the sine of the
 * nearest star's height in the sky there (null if unknown), and the ground's `height` and `terrain` once known:
 * { headline, conditions, wind }, or null for worlds without surface conditions
 */
export function localWeather(point, world, sunElevation, height = null, terrain = null) {
    const environment = world.environment;
    if (!environment) return null;
    const latitude = Math.asin(Math.min(Math.max(point[1], -1), 1));
    const faceLocked = isFaceLocked(world);
    const clouds = cloudsFor(world);
    if (!clouds) {
        const kelvin = onGround(temperature(environment, latitude, sunElevation, 0, faceLocked), environment, height, terrain);
        return {
            headline: t('No weather: too little air'),
            conditions: [celsius(kelvin), daylight(sunElevation, faceLocked)].filter(Boolean).join(' · '),
            wind: null,
        };
    }
    const settings = cloudSettings(clouds, faceLocked);
    const time = WeatherClock.time;
    const here = sampleClouds(point, time, settings);
    // How much of the sky is clouded: the cloud overhead and all around, out to about 3°
    const east = normalize([point[2] + 1e-6, 0, -point[0] + 1e-6]);
    const north = cross(point, east);
    let cloudy = here.cloud > 0.15 ? 1 : 0;
    for (let step = 0; step < 8; step++) {
        const angle = step / 8 * 2 * Math.PI;
        const around = normalize([0, 1, 2].map((i) => point[i] + 0.055 * (Math.cos(angle) * east[i] + Math.sin(angle) * north[i])));
        if (sampleClouds(around, time, settings).cloud > 0.15) cloudy += 1;
    }
    const cover = cloudy / 9;
    const kelvin = onGround(temperature(environment, latitude, sunElevation, cover, faceLocked), environment, height, terrain);
    const rain = precipitation(here, environment, kelvin);
    const headline = storm(here) ?? sky(cover, sunElevation);
    const conditions = [rain, celsius(kelvin), daylight(sunElevation, faceLocked)].filter(Boolean);
    return { headline, conditions: conditions.join(' · '), wind: windText(here, point, settings) };
}

function sky(cover, sunElevation) {
    if (cover < 0.1) return (sunElevation ?? 0) > 0 ? t('Sunny') : t('Clear');
    if (cover < 0.35) return t('A few clouds');
    if (cover < 0.6) return t('Partly cloudy');
    if (cover < 0.9) return t('Mostly cloudy');
    return t('Overcast');
}

function storm(sample) {
    const spiral = sample.spiral;
    if (spiral && spiral.hold > 0.5) {
        if (spiral.tropical) {
            if (spiral.distance < 0.11) return t('In the eye of a tropical cyclone');
            const category = hurricaneCategory(spiralPeakWind(spiral));
            return category > 0 ? t('Tropical cyclone, category %lld', category) : t('Tropical storm');
        }
        return t('Cyclone');
    }
    if (sample.storm > 0.5 && sample.cloud > 0.3) return sample.stormStrength > 0.7 ? t('Storm') : t('Unsettled');
    return null;
}

function spiralPeakWind(spiral) {
    return peakWind(spiral.tropical, spiral.strength) * Math.min(spiral.hold * 1.5, 1);
}

/** The strongest wind round a spiral storm `strength` of the way to its height, m/s */
export function peakWind(tropical, strength) {
    return tropical ? 25 + 45 * strength : 15 + 15 * strength;
}

/** Saffir–Simpson category of a sustained wind, 0 below hurricane force */
export function hurricaneCategory(metresPerSecond) {
    if (metresPerSecond < 33) return 0;
    if (metresPerSecond < 43) return 1;
    if (metresPerSecond < 50) return 2;
    if (metresPerSecond < 58) return 3;
    if (metresPerSecond < 70) return 4;
    return 5;
}

/** How hard it's raining (or snowing) under a cloud: 0 for nothing, up to 1 for the heaviest */
export function precipitationIntensity(sample) {
    const spiral = sample.spiral;
    if (spiral && spiral.hold > 0.5) {
        if (!(sample.cloud > 0.5)) return 0;
        const core = saturate(1 - spiral.distance);
        return (spiral.tropical ? 0.35 + 0.65 * core : 0.25 + 0.55 * core) * (0.75 + 0.25 * sample.patch);
    }
    if (sample.storm > 0.5 && sample.cloud > 0.4) {
        const rain = smoothstep(0.3, 1, sample.stormCore) * sample.stormStrength * (0.55 + 0.45 * sample.patch);
        return rain > 0.12 ? rain : 0;
    }
    return sample.cloud > 0.72 && sample.patch > 0.5 ? 0.2 : 0;
}

/** What falls from a world's clouds at a temperature: 'rain', 'sleet', 'snow', 'methaneRain', 'methaneSnow', 'acidVirga' */
export function precipitationKind(environment, kelvin) {
    switch (environment.atmosphere) {
        case 'sulfuric': return 'acidVirga';
        case 'methane': return kelvin < 91 ? 'methaneSnow' : 'methaneRain';
        case 'hydrogen': case 'none': case 'trace': return null;
        case 'carbonDioxide': if (environment.pressureBar > 10) return null; break;
        default: break;
    }
    if (!(environment.waterPercent > 0) || !(kelvin < 373)) return null;
    if (kelvin < 271) return 'snow';
    return kelvin < 275 ? 'sleet' : 'rain';
}

function precipitation(sample, environment, kelvin) {
    const intensity = precipitationIntensity(sample);
    const kind = intensity > 0 ? precipitationKind(environment, kelvin) : null;
    if (!kind) return null;
    const strength = intensity < 0.25 ? t('Light') : intensity < 0.7 ? t('Moderate') : t('Heavy');
    switch (kind) {
        case 'acidVirga': return t('Sulfuric acid rain, evaporating before it lands');
        case 'methaneSnow': return t('%@ methane snow', strength);
        case 'methaneRain': return t('%@ methane rain', strength);
        case 'snow': return t('%@ snow', strength);
        case 'sleet': return t('%@ sleet', strength);
        default:
            if (intensity >= 0.9) return t('Thunderstorms');
            return intensity < 0.25 ? t('Showers') : t('%@ rain', strength);
    }
}

function windText(sample, point, settings) {
    const flow = windVector(sample, point, settings);
    const kilometres = Math.round(Math.hypot(flow[0], flow[1]) * 3.6);
    if (!(kilometres > 0)) return t('Calm');
    const from = Math.atan2(-flow[0], -flow[1]) * 180 / Math.PI;
    return t('Wind %lld km/h from the %@', kilometres, compass(from));
}

/** The wind at a spot, m/s east and north */
export function windVector(sample, point, settings) {
    const latitude = Math.asin(Math.min(Math.max(point[1], -1), 1));
    if (settings.faceLocked) return lockedWind(sample, point, settings);
    let flow = [windSpeed(latitude, settings.circulation), 0];
    if (sample.storm > 0.5) flow = flow.map((v) => v * (1 + 0.8 * sample.stormStrength));
    const spiral = sample.spiral;
    if (spiral && spiral.hold > 0) {
        const peak = spiralPeakWind(spiral);
        const profile = spiral.tropical
            ? (spiral.distance < 0.11 ? 0.1 : Math.min(1, Math.pow(0.15 / Math.max(spiral.distance, 0.15), 0.6)))
            : Math.min(1, spiral.distance * 4) * (1 - 0.5 * spiral.distance);
        const o = offsetFrom(point, spiral.centre);
        const out = [-o[0], -o[1]];
        const l = Math.hypot(out[0], out[1]);
        if (l > 0) {
            const radial = [out[0] / l, out[1] / l];
            const around = [-radial[1] * spiral.hemisphere, radial[0] * spiral.hemisphere];
            let swirl = [around[0] - 0.35 * radial[0], around[1] - 0.35 * radial[1]];
            const sl = Math.hypot(swirl[0], swirl[1]) || 1;
            swirl = [swirl[0] / sl * peak * profile, swirl[1] / sl * peak * profile];
            flow = [flow[0] * (1 - spiral.hold) + swirl[0] * spiral.hold, flow[1] * (1 - spiral.hold) + swirl[1] * spiral.hold];
        }
    }
    return flow;
}

function lockedWind(sample, point, settings) {
    const latitude = Math.asin(Math.min(Math.max(point[1], -1), 1));
    const k = dot(point, substellar);
    const toward = [substellar[0] - point[0] * k, substellar[1] - point[1] * k, substellar[2] - point[2] * k];
    const east = normalize([point[2] + 1e-6, 0, -point[0] + 1e-6]);
    const north = cross(point, east);
    const scale = 12 * (0.4 + 0.6 * settings.circulation);
    let flow = [dot(toward, east) * scale + windSpeed(latitude, settings.circulation, true), dot(toward, north) * scale];
    if (sample.storm > 0.5) flow = flow.map((v) => v * (1 + 0.8 * sample.stormStrength));
    return flow;
}

/** The eight-point compass direction of a bearing in degrees, clockwise from north */
export function compass(degrees) {
    const points = [t('N'), t('NE'), t('E'), t('SE'), t('S'), t('SW'), t('W'), t('NW')];
    const index = Math.round(((degrees + 360) % 360) / 45) % 8;
    return points[index];
}

/** The temperature at a spot, K: the world's mean, warmer toward its equator or under its star, by day and night */
export function temperature(environment, latitude, sun, cloud, faceLocked = false) {
    const damping = Math.pow(Math.max(environment.pressureBar, 0), 0.4);
    if (faceLocked) {
        if (sun == null) return Math.max(environment.temperatureK, 3);
        const contrast = 300 / (1 + 3 * damping);
        const warmth = Math.pow(Math.min(Math.max((sun + 0.25) / 1.25, 0), 1), 0.7);
        return Math.max(environment.temperatureK + contrast * (warmth - 0.625 / 1.7), 3);
    }
    const spread = 150 / (1 + 2 * damping);
    const sine = Math.sin(latitude);
    let kelvin = environment.temperatureK + spread * (1 / 3 - sine * sine);
    if (sun != null) {
        const swing = 150 / (1 + 40 * damping) * (1 - 0.5 * cloud);
        kelvin += sun > 0 ? swing * Math.sqrt(sun) : -0.6 * swing * Math.min(-sun * 5, 1);
    }
    return Math.max(kelvin, 3);
}

export const lapseRate = 6.5;
export const highestPeaks = 8.0;
export const belowFreezing = 272.15;

/** A spot's temperature at the height its ground stands, never above freezing on snow or ice */
export function onGround(kelvin, environment, height, terrain) {
    if (height != null && environment.pressureBar >= 0.01) kelvin -= lapseRate * highestPeaks * Math.min(Math.max(height, 0), 1);
    if (terrain === 'snow' || terrain === 'seaIce' || terrain === 'frozenLake') kelvin = Math.min(kelvin, belowFreezing);
    return Math.max(kelvin, 3);
}

export function celsius(kelvin) {
    return `${Math.round(kelvin - 273.15)} °C`;
}

function daylight(sun, faceLocked = false) {
    if (sun == null) return null;
    if (faceLocked) {
        if (sun >= 0.1) return t('Endless day');
        if (sun >= -0.1) return t('Terminator');
        return t('Endless night');
    }
    if (sun >= 0.1) return t('Day');
    if (sun >= -0.1) return sun > 0 ? t('Dawn or dusk') : t('Twilight');
    return t('Night');
}
