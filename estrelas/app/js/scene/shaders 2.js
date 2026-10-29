//
//  shaders.js
//  Estrelas (web)
//
//  WebGL versions of the macOS app's Metal shaders (StarShader.metal and PlasmaArcShader.metal), and the small
//  shader that lets orbit rings thin out as the view zooms in.
//

import * as THREE from '../../vendor/three.module.min.js';

// MARK: star surfaces

const starVertex = /* glsl */ `
    out vec3 vModelPosition;
    out vec3 vNormal;
    out vec3 vViewDirection;
    void main() {
        vModelPosition = position;
        vec4 world = modelMatrix * vec4(position, 1.0);
        vNormal = normalize(mat3(modelMatrix) * normal);
        vViewDirection = cameraPosition - world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
    }
`;

const starFragment = /* glsl */ `
    precision highp float;
    precision highp int;
    uniform vec3 uColor;
    uniform float uSeed;
    uniform float uTime;
    in vec3 vModelPosition;
    in vec3 vNormal;
    in vec3 vViewDirection;
    out vec4 fragColor;

    // Integer hash (PCG-style), stable for any cell coordinate
    uvec3 hash3(ivec3 cell, uint seed) {
        uvec3 v = uvec3(cell) * 1664525u + 1013904223u + seed;
        v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
        v ^= v >> 16u;
        v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
        return v;
    }

    vec3 random3(ivec3 cell, uint seed) {
        return vec3(hash3(cell, seed)) * (1.0 / 4294967295.0);
    }

    // 3D Voronoi noise with moving cell centres: f1, f2 and the nearest cell's brightness
    vec3 cellular(vec3 p, float time, uint seed, float drift, float pulse) {
        ivec3 base = ivec3(floor(p));
        float f1 = 8.0, f2 = 8.0, brightness = 0.0;
        for (int z = -1; z <= 1; z++) {
            for (int y = -1; y <= 1; y++) {
                for (int x = -1; x <= 1; x++) {
                    ivec3 cell = base + ivec3(x, y, z);
                    vec3 r = random3(cell, seed);
                    vec3 phase = r * 6.2831853;
                    vec3 centre = vec3(cell) + 0.5 + 0.35 * sin(time * drift * (0.6 + r.yzx) + phase);
                    float d = distance(p, centre);
                    if (d < f1) {
                        f2 = f1;
                        f1 = d;
                        brightness = 0.5 + 0.5 * sin(time * pulse * (0.5 + r.z) + phase.x * 3.0);
                    } else if (d < f2) {
                        f2 = d;
                    }
                }
            }
        }
        return vec3(f1, f2, brightness);
    }

    float valueNoise(vec3 p, uint seed) {
        ivec3 i = ivec3(floor(p));
        vec3 f = fract(p);
        vec3 u = f * f * (3.0 - 2.0 * f);
        float n000 = random3(i + ivec3(0, 0, 0), seed).x, n100 = random3(i + ivec3(1, 0, 0), seed).x;
        float n010 = random3(i + ivec3(0, 1, 0), seed).x, n110 = random3(i + ivec3(1, 1, 0), seed).x;
        float n001 = random3(i + ivec3(0, 0, 1), seed).x, n101 = random3(i + ivec3(1, 0, 1), seed).x;
        float n011 = random3(i + ivec3(0, 1, 1), seed).x, n111 = random3(i + ivec3(1, 1, 1), seed).x;
        return mix(mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),
                   mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y), u.z);
    }

    void main() {
        vec3 dir = normalize(vModelPosition);
        float time = uTime;
        uint seed = uint(uSeed * 7919.0) * 2654435761u;
        vec3 base = uColor;

        // Granules: bright centres fading toward dark intergranular lanes
        vec3 granule = cellular(dir * 16.0, time, seed, 0.35, 0.6);
        float lanes = smoothstep(0.0, 0.14, granule.y - granule.x);
        float granuleLight = mix(0.92, 1.12, granule.z) * (1.0 - 0.15 * clamp(granule.x, 0.0, 1.0));
        vec3 color = base * granuleLight * mix(0.74, 1.0, lanes);
        color = mix(color, vec3(1.0), 0.1 * granule.z * lanes);

        // Supergranules: broad regions slowly brightening and dimming
        vec3 supergranule = cellular(dir * 4.0, time, seed ^ 0x9E3779B9u, 0.08, 0.15);
        color *= 0.94 + 0.12 * supergranule.z;

        // Sunspots in the mid-latitude belts, slowly forming, growing and fading
        vec3 spotDomain = dir * 5.0 + vec3(time * 0.013, time * 0.007, -time * 0.011);
        float spots = 0.65 * valueNoise(spotDomain, seed ^ 0x85EBCA6Bu)
                    + 0.35 * valueNoise(spotDomain * 2.3, seed ^ 0xC2B2AE35u);
        float latitude = abs(dir.y);
        float belt = exp(-pow((latitude - 0.3) / 0.16, 2.0));
        float spot = spots - 0.25 * (1.0 - belt);
        float penumbra = smoothstep(0.7, 0.75, spot);
        float umbra = smoothstep(0.76, 0.8, spot);
        color = mix(color, base * 0.55, penumbra);
        color = mix(color, base * 0.2, umbra);

        // Limb darkening
        float facing = clamp(dot(normalize(vNormal), normalize(vViewDirection)), 0.0, 1.0);
        color *= 0.5 + 0.5 * sqrt(facing);
        fragColor = vec4(color, 1.0);
    }
`;

export const shaderClock = { time: 0 };

// MARK: cloud weather (CloudShader.metal)

const cloudVertex = /* glsl */ `
    out vec3 vModelPosition;
    out vec3 vWorldDir;
    void main() {
        vModelPosition = position;
        vWorldDir = normalize(mat3(modelMatrix) * position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const cloudFragment = /* glsl */ `
    precision highp float;
    precision highp int;
    uniform vec4 uSettings;
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uTime;
    uniform vec3 uSun;
    uniform float uLighting;
    in vec3 vModelPosition;
    in vec3 vWorldDir;
    out vec4 fragColor;

    const float kPeriod = 1024.0;
    const int kRows = 180;
    const float kRowHeight = 3.14159265 / 180.0;
    const int kStorms = 40;
    const int kSpirals = 4;
    const int kConvectiveStorms = 16;
    const float kTau = 6.2831853;
    const float kPi = 3.14159265;
    const vec3 kSubstellar = vec3(-1.0, 0.0, 0.0);

    uvec3 hash3(ivec3 cell, uint seed) {
        uvec3 v = uvec3(cell) * 1664525u + 1013904223u + seed;
        v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
        v ^= v >> 16u;
        v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
        return v;
    }
    vec3 random3(int a, int b, uint seed) {
        return vec3(hash3(ivec3(a, b, 0), seed)) * (1.0 / 4294967295.0);
    }
    float bump(float degrees, float centre, float width) {
        float x = (degrees - centre) / width;
        return exp(-x * x);
    }
    float wind(float latitude, float circulation, bool locked) {
        float degrees = abs(latitude) * 57.29578;
        float metres = locked
            ? 8.0 * cos(latitude) * cos(latitude)
            : -6.0 * bump(degrees, 10.0, 14.0) + 13.0 * bump(degrees, 46.0, 13.0) - 4.0 * bump(degrees, 76.0, 9.0);
        metres *= 0.4 + 0.6 * circulation;
        return metres * 0.00216 / max(cos(latitude), 0.15);
    }
    float climate(float latitude) {
        float degrees = abs(latitude) * 57.29578;
        return 0.18 * bump(degrees, 0.0, 8.0) - 0.2 * bump(degrees, 25.0, 9.0) + 0.14 * bump(degrees, 52.0, 12.0)
             + 0.05 * bump(degrees, 80.0, 10.0);
    }
    vec3 spherePoint(float latitude, float longitude) {
        float c = cos(latitude), angle = longitude * kTau;
        return vec3(c * cos(angle), sin(latitude), -c * sin(angle));
    }
    float rhythm(float days) {
        return kTau * max(round(kPeriod / days), 1.0) / kPeriod;
    }
    // The cloud field, drawn the way the Gaia Engine draws clouds: one field of value noise warped by value noise,
    // drifting round the world as a whole and slowly churning (cloudModel.js cloudField)
    const float kQuantiles[33] = float[33](0.00000, 0.28717, 0.31907, 0.34118, 0.35836, 0.37313, 0.38635, 0.39830, 0.40941, 0.41988, 0.42983, 0.43932, 0.44861, 0.45780, 0.46677, 0.47553, 0.48435, 0.49322, 0.50218, 0.51117, 0.52030, 0.52958, 0.53917, 0.54922, 0.55960, 0.57062, 0.58255, 0.59563, 0.61034, 0.62756, 0.64923, 0.68154, 1.00000);
    float lattice(ivec3 c, uint seed) {
        uint h = (uint(c.x) * 0x8DA6B343u) ^ (uint(c.y) * 0xD8163841u) ^ (uint(c.z) * 0xCB1AB31Fu) ^ seed;
        h = (h ^ (h >> 16u)) * 0x7FEB352Du;
        h = (h ^ (h >> 15u)) * 0x846CA68Bu;
        h = h ^ (h >> 16u);
        return float(h) * (1.0 / 4294967295.0);
    }
    float valueNoise(vec3 p, uint seed) {
        vec3 cell = floor(p);
        vec3 t = p - cell;
        t = t * t * (3.0 - 2.0 * t);
        ivec3 i = ivec3(cell);
        return mix(mix(mix(lattice(i, seed), lattice(i + ivec3(1, 0, 0), seed), t.x),
                       mix(lattice(i + ivec3(0, 1, 0), seed), lattice(i + ivec3(1, 1, 0), seed), t.x), t.y),
                   mix(mix(lattice(i + ivec3(0, 0, 1), seed), lattice(i + ivec3(1, 0, 1), seed), t.x),
                       mix(lattice(i + ivec3(0, 1, 1), seed), lattice(i + ivec3(1, 1, 1), seed), t.x), t.y), t.z);
    }
    float fbm(vec3 p, uint seed) {
        float value = 0.0, amplitude = 0.5;
        for (int octave = 0; octave < 5; octave++) {
            value += amplitude * valueNoise(p, seed);
            p = p * 2.03 + vec3(1.7, 9.2, 3.1);
            amplitude *= 0.5;
        }
        return value;
    }
    float drift(float circulation, bool locked) {
        return locked ? 0.0 : round(8.0 * (0.4 + 0.6 * circulation)) / kPeriod;
    }
    vec2 cloudField(float latitude, float longitude, float time, float circulation, bool locked, uint seed) {
        vec3 p = spherePoint(latitude, longitude - drift(circulation, locked) * time);
        float turn = kTau * time / kPeriod;
        vec3 offset = random3(0, 64, seed ^ 0x51ED270Bu);
        vec3 q = p * 2.3 + offset * 17.0 + vec3(13.0 * cos(turn), 6.0 * sin(2.0 * turn), 13.0 * sin(turn));
        float w = fbm(q * 1.6, seed);
        float c = fbm(q * 2.6 + vec3(w * 1.9), seed ^ 0x2C1B3C6Du);
        return vec2(c, w);
    }
    float uniformField(float value) {
        if (value <= kQuantiles[0]) { return 0.0; }
        for (int i = 1; i < 33; i++) {
            if (value < kQuantiles[i]) {
                return (float(i - 1) + (value - kQuantiles[i - 1]) / max(kQuantiles[i] - kQuantiles[i - 1], 1e-6)) / 32.0;
            }
        }
        return 1.0;
    }
    struct Life { float age; int cycle; float days; };
    Life life(float time, float days, float offset) {
        float clock = (time + offset * days) / days;
        float cycle = floor(clock);
        return Life(clock - cycle, int(mod(cycle, kPeriod / days)), (clock - cycle) * days);
    }
    vec2 offsetFrom(vec3 centre, vec3 point) {
        vec3 east = normalize(cross(vec3(0.0, 1.0, 0.0), centre));
        vec3 north = cross(centre, east);
        float z = dot(point, centre);
        return vec2(atan(dot(point, east), z), atan(dot(point, north), z));
    }
    float cluster(vec3 point, vec3 centre, float radius, float stretch, vec3 a, vec3 b, vec3 own, float strength) {
        vec2 offset = offsetFrom(centre, point) * vec2(stretch, 1.0);
        float angle = atan(offset.y, offset.x);
        float lobes = 1.0 + 0.3 * sin(3.0 * angle + kTau * b.z) + 0.2 * sin(5.0 * angle + kTau * a.y * 3.0);
        float distance = length(offset) / max(radius * lobes, 1e-4);
        float member = smoothstep(-0.1, 0.1, 1.0 - distance + 0.8 * (own.z - 0.5));
        float thickness = 0.9;
        return member * thickness * min(strength * 3.0, 1.0);
    }
    float lockedCloud(vec3 point, vec3 own, float swing, float time, float coverage, float circulation, uint seed) {
        float around = atan(point.z, point.y);
        vec3 shape = random3(-3, -3, seed ^ 0x3C6EF372u);
        float lobes = 0.12 * sin(3.0 * around + kTau * shape.x + rhythm(37.0) * time)
                    + 0.08 * sin(5.0 * around + kTau * shape.y - rhythm(23.0) * time);
        float facing = dot(point, kSubstellar) + lobes + 0.1 * (own.x - 0.5);
        float edge = 1.0 - 1.6 * coverage;
        float mass = smoothstep(edge - 0.3, edge + 0.3, facing);
        float fringe = exp(-pow((facing - edge + 0.35) / 0.18, 2.0));
        float threshold = 1.0 - (0.97 * mass + 0.25 * coverage * fringe);
        float cloud = smoothstep(threshold - 0.15, threshold + 0.15, swing) * (0.75 + 0.15 * mass);
        float reach = max(edge, 0.2);
        for (int storm = 0; storm < kConvectiveStorms; storm++) {
            vec3 slot = random3(storm, -2, seed ^ 0x2545F491u);
            Life now = life(time, slot.x < 0.5 ? 4.0 : 8.0, slot.y);
            vec3 a = random3(storm, now.cycle, seed ^ 0x9E3779B1u);
            float span = 0.5 + 0.45 * a.y;
            if (a.x > 0.5 + 0.4 * circulation || now.age > span) { continue; }
            float strength = sin(kPi * now.age / span);
            vec3 b = random3(storm, now.cycle, seed ^ 0x7FEB352Du);
            float cosine = mix(1.0, reach, b.x);
            float sine = sqrt(max(1.0 - cosine * cosine, 0.0));
            float turn = kTau * b.y;
            vec3 centre = kSubstellar * cosine + sine * (cos(turn) * vec3(0.0, 1.0, 0.0) + sin(turn) * vec3(0.0, 0.0, 1.0));
            float radius = (0.1 + 0.12 * b.z) * (0.6 + 0.4 * strength);
            if (dot(point, centre) < cos(min(radius * 1.6, 1.5))) { continue; }
            cloud = max(cloud, cluster(point, centre, radius, 1.0, a, b, own, strength));
        }
        return cloud;
    }
    void main() {
        float time = uTime;
        float coverage = clamp(uSettings.y, 0.0, 1.0);
        float circulation = clamp(uSettings.z, 0.0, 1.0);
        float packed = floor(uSettings.w + 0.5);
        float hurricanes = mod(packed, 4.0);
        bool locked = mod(floor(packed / 4.0), 2.0) > 0.5;
        uint seed = uint(floor(packed / 8.0)) * 2654435761u;
        vec3 dir = normalize(vModelPosition);
        float latitude = asin(clamp(dir.y, -1.0, 1.0));
        vec2 field = cloudField(latitude, atan(-dir.z, dir.x) / kTau, time, circulation, locked, seed);
        float grain = clamp((field.y - 0.25) / 0.5, 0.0, 1.0);
        float swing = uniformField(field.x);
        vec3 own = vec3(1.0 - grain, grain, swing);
        float share = coverage * (1.0 - 0.8 * circulation);
        float threshold = 1.0 - share - circulation * climate(latitude);
        float cloud = smoothstep(threshold - 0.15, threshold + 0.15, swing) * 0.9;
        float spread = sqrt(max(coverage - share, 0.0) / 0.2);
        int stormCount = locked ? 0 : kStorms;
        for (int storm = 0; storm < kStorms; storm++) {
            if (storm >= stormCount) { break; }
            vec3 slot = random3(storm, -1, seed ^ 0x9E3779B9u);
            Life now = life(time, slot.x < 0.5 ? 8.0 : 16.0, slot.y);
            vec3 a = random3(storm, now.cycle, seed ^ 0x85EBCA6Bu);
            float span = 0.5 + 0.45 * a.y;
            if (a.x > 0.45 + 0.5 * circulation || now.age > span) { continue; }
            float strength = sin(kPi * now.age / span);
            vec3 b = random3(storm, now.cycle, seed ^ 0xC2B2AE35u);
            float degrees = b.x < 0.3 ? 14.0 * b.y : (b.x < 0.4 ? 15.0 + 15.0 * b.y : 35.0 + 28.0 * b.y);
            degrees = mix(asin(b.y) * 57.29578 * 0.9, degrees, circulation);
            float latitude = (a.z < 0.5 ? -1.0 : 1.0) * degrees / 57.29578;
            vec3 centre = spherePoint(latitude, b.z + wind(latitude, circulation, false) * now.days);
            float radius = (0.12 + 0.18 * fract(b.y * 13.0 + b.z)) * spread * (0.6 + 0.4 * strength);
            if (dot(dir, centre) < cos(min(radius * 1.6, 1.5))) { continue; }
            cloud = max(cloud, cluster(dir, centre, radius, 0.65, a, b, own, strength));
        }
        if (locked) {
            cloud = lockedCloud(dir, own, swing, time, coverage, circulation, seed);
        }
        int spiralCount = locked ? 0 : kSpirals;
        for (int spiral = 0; spiral < kSpirals; spiral++) {
            if (spiral >= spiralCount) { break; }
            bool tropical = spiral < 2;
            float chance = tropical ? 0.18 * hurricanes : 0.3 * clamp((circulation - 0.45) / 0.5, 0.0, 1.0);
            Life now = life(time, 16.0, random3(spiral, -1, seed ^ 0x68E31DA4u).x);
            vec3 a = random3(spiral, now.cycle, seed ^ 0xB5297A4Du);
            float span = 0.4 + 0.3 * a.y;
            if (a.x >= chance || now.age > span) { continue; }
            float strength = sin(kPi * now.age / span);
            vec3 b = random3(spiral, now.cycle, seed ^ 0x1B873593u);
            float hemisphere = a.z < 0.5 ? -1.0 : 1.0;
            float degrees = tropical ? 10.0 + 10.0 * b.x + 0.4 * now.days : 40.0 + 18.0 * b.x;
            float latitude = hemisphere * degrees / 57.29578;
            vec3 centre = spherePoint(latitude, b.z + wind(latitude, circulation, false) * now.days);
            float radius = (tropical ? 0.26 + 0.06 * b.y : 0.3 + 0.1 * b.y) * (0.6 + 0.4 * strength);
            if (dot(dir, centre) < cos(radius)) { continue; }
            vec2 offset = offsetFrom(centre, dir);
            float distance = length(offset) / radius;
            float angle = atan(offset.y, offset.x);
            float winding = hemisphere * (tropical ? 2.2 : 2.0);
            float turn = hemisphere * now.days * 1.5;
            float arm = cos(2.0 * (angle + winding * log(max(distance, 0.02))) - turn);
            float core = tropical ? 1.2 : 0.9;
            float band = smoothstep(0.1, 0.5, arm + core * (1.0 - distance) - 0.35 + 0.4 * (own.x - 0.5));
            float eye = tropical ? smoothstep(0.08, 0.14, distance) : 1.0;
            float thickness = band * eye * 0.9;
            float hold = smoothstep(1.0, 0.75, distance) * min(strength * 2.5, 1.0);
            cloud = mix(cloud, thickness, hold);
        }
        float density = clamp(cloud, 0.0, 1.0) * clamp(uOpacity, 0.0, 1.0);
        vec3 color = uColor * (0.8 + 0.2 * pow(density, 0.6));
        // Lit as the Gaia Engine lights its clouds: full by day, dimming through a soft terminator
        if (uLighting > 0.5 && dot(uSun, uSun) > 0.25) {
            color *= 0.04 + 0.98 * smoothstep(-0.18, 0.6, dot(normalize(vWorldDir), normalize(uSun)));
        }
        fragColor = vec4(color, density);
    }
`;

// MARK: lighting

/**
 * Whether worlds are lit by their star as the Gaia Engine lights them (1), or drawn flat and fully lit (0); it follows
 * Night Sides
 */
export const lighting = { value: 1 };

/** A world's atmosphere as its sky glow shows it: { color, strength }, strength 0 for none (as Gaia reckons it) */
export function atmosphereLook(environment, gasGiant = null) {
    if (gasGiant) {
        const icy = gasGiant.giantClass === 'subNeptune' || gasGiant.giantClass === 'iceGiant';
        return { color: icy ? [0.45, 0.7, 1] : [0.85, 0.75, 0.6], strength: 0.9 };
    }
    if (!environment || environment.atmosphere === 'none') return { color: [0, 0, 0], strength: 0 };
    const pressure = environment.pressureBar ?? 0;
    const strength = Math.min(Math.max(Math.log10(pressure * 12 + 1) / Math.log10(13), 0), 1.6);
    const colors = { nitrogenOxygen: [0.33, 0.58, 1], nitrogen: [0.4, 0.6, 0.95], carbonDioxide: [1, 0.66, 0.38],
        sulfuric: [1, 0.82, 0.45], methane: [0.95, 0.68, 0.36], hydrogen: [0.55, 0.7, 1], trace: [0.6, 0.65, 0.75] };
    return { color: colors[environment.atmosphere] ?? [0.5, 0.6, 0.8], strength };
}

const litVertex = /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vSphere;
    varying vec3 vWorld;
    varying vec2 vUv;
    varying vec3 vTint;
    void main() {
        vUv = uv;
        #ifdef USE_COLOR
            vTint = color;
        #else
            vTint = vec3(1.0);
        #endif
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vNormal = normalize(mat3(modelMatrix) * normal);
        vSphere = normalize(mat3(modelMatrix) * position);
        gl_Position = projectionMatrix * viewMatrix * world;
    }
`;

const litFragment = /* glsl */ `
    uniform vec3 uColor;
    uniform sampler2D uMap;
    uniform float uHasMap;
    uniform vec3 uSun;
    uniform float uLighting;
    uniform vec3 uAtmosphere;
    uniform float uAtmosphereStrength;
    uniform float uWater;
    varying vec3 vNormal;
    varying vec3 vSphere;
    varying vec3 vWorld;
    varying vec2 vUv;
    varying vec3 vTint;
    void main() {
        vec3 color = uColor * vTint;
        if (uHasMap > 0.5) { color *= texture2D(uMap, vUv).rgb; }
        if (uLighting < 0.5 || dot(uSun, uSun) < 0.25) {
            gl_FragColor = vec4(color, 1.0);
            return;
        }
        vec3 N = normalize(vNormal);
        vec3 S = normalize(vSphere);
        vec3 L = normalize(uSun);
        vec3 V = normalize(cameraPosition - vWorld);
        // As the Gaia Engine lights its worlds: diffuse light on the relief, cut off through a soft terminator
        float day = dot(S, L);
        float diffuse = max(dot(N, L), 0.0) * smoothstep(-0.12, 0.12, day);
        vec3 lit = color * (diffuse * 1.08 + 0.03);
        // The star's glint on open water
        if (uWater > 0.5) {
            float sea = step(color.r + 0.06, color.b) * step(color.g, color.b + 0.02);
            vec3 halfway = normalize(L + V);
            lit += vec3(1.0, 0.9, 0.75) * pow(max(dot(S, halfway), 0.0), 80.0) * 0.65 * sea * smoothstep(0.0, 0.2, day);
        }
        // The air's glow round the limb, on the day side
        float rim = pow(1.0 - max(dot(S, V), 0.0), 2.6);
        lit += uAtmosphere * rim * uAtmosphereStrength * smoothstep(-0.25, 0.55, day) * 0.85;
        gl_FragColor = vec4(lit, 1.0);
    }
`;

/**
 * A world's surface lit by its star (uSun, set each frame by nightShade.js): `color` and either vertex colours or a
 * `map`; `water` for a glint off seas; `atmosphere` from atmosphereLook for the glow round its limb
 */
export function litMaterial({ color = 0xffffff, map = null, vertexColors = false, water = false, atmosphere = null } = {}) {
    const look = atmosphere ?? { color: [0, 0, 0], strength: 0 };
    return new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: new THREE.Color(color) },
            uMap: { value: map },
            uHasMap: { value: map ? 1 : 0 },
            uSun: { value: new THREE.Vector3() },
            uLighting: lighting,
            uAtmosphere: { value: new THREE.Color(...look.color) },
            uAtmosphereStrength: { value: look.strength },
            uWater: { value: water ? 1 : 0 },
        },
        vertexColors,
        vertexShader: litVertex,
        fragmentShader: litFragment,
    });
}

/** The halo of a world's air seen round its limb, as the Gaia Engine draws it: a glow just outside the world */
export function atmosphereHalo(radius, look) {
    const material = new THREE.ShaderMaterial({
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        uniforms: { uSun: { value: new THREE.Vector3() }, uAtmosphere: { value: new THREE.Color(...look.color) },
            uStrength: { value: look.strength }, uLighting: lighting },
        vertexShader: /* glsl */ `
            varying vec3 vViewNormal;
            varying vec3 vWorldNormal;
            void main() {
                vViewNormal = normalize(normalMatrix * normal);
                vWorldNormal = normalize(mat3(modelMatrix) * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
        fragmentShader: /* glsl */ `
            uniform vec3 uSun;
            uniform vec3 uAtmosphere;
            uniform float uStrength;
            uniform float uLighting;
            varying vec3 vViewNormal;
            varying vec3 vWorldNormal;
            void main() {
                float glow = pow(clamp(0.7 - dot(vViewNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.4), 3.4);
                float day = uLighting > 0.5 && dot(uSun, uSun) > 0.25
                    ? 0.12 + 0.88 * smoothstep(-0.4, 0.45, dot(normalize(vWorldNormal), normalize(uSun))) : 1.0;
                gl_FragColor = vec4(uAtmosphere * glow * day * uStrength, 1.0);
            }`,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.11, 64, 32), material);
    mesh.name = 'atmosphere_halo';
    mesh.raycast = () => {};
    return mesh;
}

/** The weather clock every cloud layer reads, in simulated days wrapped at the period (see cloudModel.js) */
export const weatherTime = { value: 0 };

/** A cloud layer drawn as the weather: cells of cloud carried by the winds, clouding over, clearing and gathering */
export function cloudMaterial(clouds, packed) {
    return new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: {
            uSettings: { value: new THREE.Vector4(0, clouds.coverage, clouds.circulation ?? 0, packed) },
            uColor: { value: new THREE.Color(...clouds.color) },
            uOpacity: { value: clouds.opacity },
            uTime: weatherTime,
            uSun: { value: new THREE.Vector3() },
            uLighting: lighting,
        },
        vertexShader: cloudVertex,
        fragmentShader: cloudFragment,
        transparent: true,
        depthWrite: false,
    });
}

export function starMaterial(color, seed) {
    return new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: { uColor: { value: color.clone() }, uSeed: { value: seed }, uTime: shaderClock.timeUniform },
        vertexShader: starVertex,
        fragmentShader: starFragment,
    });
}

// MARK: plasma arcs

const plasmaVertex = /* glsl */ `
    out vec3 vModelPosition;
    out vec3 vModelRay;
    void main() {
        vModelPosition = position;
        vec4 world = modelMatrix * vec4(position, 1.0);
        // The view ray turned into the model's frame (the scale drops out once normalised); it's linear across a
        // triangle, so interpolating it is exact
        vModelRay = transpose(mat3(modelMatrix)) * (world.xyz - cameraPosition);
        gl_Position = projectionMatrix * viewMatrix * world;
    }
`;

const plasmaFragment = /* glsl */ `
    precision highp float;
    #define PI 3.14159265
    uniform vec3 uColor;
    uniform float uSeed;
    uniform float uTime;
    in vec3 vModelPosition;
    in vec3 vModelRay;
    out vec4 fragColor;

    const float kShellRadius = 1.6;
    const int kArcCount = 6;
    const int kSteps = 64;

    float plasmaHash(float n) { return fract(sin(n) * 43758.5453123); }
    vec3 plasmaHash3(float n) {
        return fract(sin(vec3(n, n + 1.31, n + 2.73)) * vec3(43758.5453, 22578.1459, 19642.3490));
    }

    struct PlasmaArc { vec3 a; vec3 side; vec3 normal; float span; float height; float strength; float phase; };

    PlasmaArc makeArc(int index, float seed, float time) {
        float fi = float(index);
        float period = 5.0 + plasmaHash(fi * 7.13 + seed) * 4.0;
        float lifeTime = time / period + plasmaHash(fi * 3.71 + seed * 1.7);
        float cycle = floor(lifeTime);
        float life = fract(lifeTime);
        float key = seed * 13.17 + fi * 101.3 + cycle * 17.77;
        PlasmaArc arc;
        arc.a = normalize(plasmaHash3(key) * 2.0 - 1.0 + 1e-4);
        vec3 randomDir = normalize(plasmaHash3(key + 5.0) * 2.0 - 1.0 + 1e-4);
        arc.normal = normalize(cross(arc.a, randomDir) + 1e-4);
        arc.side = cross(arc.normal, arc.a);
        arc.span = 0.25 + plasmaHash(key + 9.0) * 0.3;
        float rise = smoothstep(0.0, 0.35, life);
        float sway = 1.0 + 0.08 * sin(time * 2.3 + fi * 1.7);
        arc.height = (0.18 + plasmaHash(key + 11.0) * 0.25) * rise * sway;
        arc.strength = sin(life * PI);
        arc.strength *= arc.strength;
        arc.phase = plasmaHash(key + 13.0) * 6.2831;
        return arc;
    }

    float arcGlow(PlasmaArc arc, vec3 p, float time) {
        vec3 inPlane = p - arc.normal * dot(p, arc.normal);
        float theta = atan(dot(inPlane, arc.side), dot(inPlane, arc.a));
        float t = clamp(theta / arc.span, 0.0, 1.0);
        float angle = t * arc.span;
        float radius = 1.0 + arc.height * sin(t * PI);
        vec3 curvePoint = (arc.a * cos(angle) + arc.side * sin(angle)) * radius;
        float d = length(p - curvePoint);
        float width = 0.035;
        float core = exp(-(d * d) / (width * width));
        float halo = 0.15 * exp(-d / 0.08);
        float flow = 0.6 + 0.4 * sin(t * 18.0 - time * 5.0 + arc.phase);
        float taper = 0.5 + 0.5 * sin(t * PI);
        return (core + halo) * flow * taper * arc.strength;
    }

    void main() {
        float time = uTime;
        float seed = uSeed;
        vec3 origin = normalize(vModelPosition) * kShellRadius;
        vec3 dir = normalize(vModelRay);

        float b = dot(origin, dir);
        float tEnd = max(-2.0 * b, 0.0);
        float c = dot(origin, origin) - 1.0;
        float disc = b * b - c;
        if (disc > 0.0) {
            float tStar = -b - sqrt(disc);
            if (tStar > 0.0) tEnd = min(tEnd, tStar);
        }

        PlasmaArc arcs[kArcCount];
        for (int i = 0; i < kArcCount; i++) arcs[i] = makeArc(i, seed, time);

        float jitter = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
        float stepSize = tEnd / float(kSteps);
        float accumulated = 0.0;
        for (int s = 0; s < kSteps; s++) {
            vec3 p = origin + dir * (stepSize * (float(s) + jitter));
            float density = 0.0;
            for (int i = 0; i < kArcCount; i++) density += arcGlow(arcs[i], p, time);
            accumulated += density * stepSize;
        }

        float glow = accumulated * 25.0;
        vec3 plasmaColor = mix(uColor * 1.5, vec3(1.0, 0.95, 0.8), clamp(glow - 1.0, 0.0, 1.0) * 0.5);
        fragColor = vec4(plasmaColor, clamp(glow, 0.0, 1.0));
    }
`;

export function plasmaMaterial(color, seed) {
    return new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: { uColor: { value: color.clone() }, uSeed: { value: seed }, uTime: shaderClock.timeUniform },
        vertexShader: plasmaVertex,
        fragmentShader: plasmaFragment,
        transparent: true,
        depthWrite: false,
    });
}

shaderClock.timeUniform = { value: 0 };

// MARK: zoom-scaled meshes (orbit rings)

const zoomScaledVertex = /* glsl */ `
    in vec3 offset;
    uniform float uScale;
    void main() {
        vec3 p = position + offset * uScale;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
`;

const unlitFragment = /* glsl */ `
    precision highp float;
    uniform vec3 uColor;
    uniform float uOpacity;
    out vec4 fragColor;
    void main() {
        fragColor = vec4(uColor, uOpacity);
    }
`;

/** A material whose vertices are anchors plus offsets scaled by `uniforms.uScale`, so tubes thin without rebuilding */
export function zoomScaledMaterial(color) {
    return new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: { uColor: { value: color.clone() }, uOpacity: { value: 1 }, uScale: { value: 1 } },
        vertexShader: zoomScaledVertex,
        fragmentShader: unlitFragment,
    });
}
