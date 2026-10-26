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
    void main() {
        vModelPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const cloudFragment = /* glsl */ `
    precision highp float;
    precision highp int;
    uniform vec4 uSettings;
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uTime;
    in vec3 vModelPosition;
    out vec4 fragColor;

    const float kPeriod = 1024.0;
    const int kRows = 90;
    const float kRowHeight = 3.14159265 / 90.0;
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
    int rowCells(int row) {
        float latitude = -kPi / 2.0 + (float(row) + 0.5) * kRowHeight;
        return max(3, int(round(2.0 * float(kRows) * cos(latitude))));
    }
    struct Cell { vec3 centre; float latitude; int row; int index; };
    Cell nearestCell(vec3 dir, float time, float circulation, bool locked, uint seed) {
        float latitude = asin(clamp(dir.y, -1.0, 1.0));
        float longitude = atan(-dir.z, dir.x) / kTau;
        int home = clamp(int(floor((latitude + kPi / 2.0) / kRowHeight)), 0, kRows - 1);
        Cell best = Cell(vec3(0.0, 1.0, 0.0), 0.0, home, 0);
        float nearest = -2.0;
        for (int row = max(home - 1, 0); row <= min(home + 1, kRows - 1); row++) {
            float rowLatitude = -kPi / 2.0 + (float(row) + 0.5) * kRowHeight;
            int count = rowCells(row);
            float speed = round(wind(rowLatitude, circulation, locked) * kPeriod) / kPeriod;
            float shift = fract(speed * time);
            int middle = int(floor((longitude - shift) * float(count)));
            for (int step = -2; step <= 2; step++) {
                int index = (middle + step) - count * int(floor(float(middle + step) / float(count)));
                vec3 jitter = random3(row, index, seed ^ 0x27D4EB2Fu) - 0.5;
                float cellLatitude = rowLatitude + 0.8 * jitter.y * kRowHeight;
                float cellLongitude = (float(index) + 0.5 + 0.8 * jitter.x) / float(count) + shift;
                vec3 centre = spherePoint(cellLatitude, cellLongitude);
                float closeness = dot(dir, centre);
                if (closeness > nearest) {
                    nearest = closeness;
                    best = Cell(centre, cellLatitude, row, index);
                }
            }
        }
        return best;
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
        float member = smoothstep(0.0, 0.12, 1.0 - distance + 0.5 * (own.z - 0.5));
        float thickness = 0.6 + 0.3 * own.y + (distance < 0.5 ? 0.1 : 0.0);
        return member * thickness * min(strength * 3.0, 1.0);
    }
    float lockedCloud(Cell cell, vec3 own, float swing, float time, float coverage, float circulation, uint seed) {
        float around = atan(cell.centre.z, cell.centre.y);
        vec3 shape = random3(-3, -3, seed ^ 0x3C6EF372u);
        float lobes = 0.12 * sin(3.0 * around + kTau * shape.x + rhythm(37.0) * time)
                    + 0.08 * sin(5.0 * around + kTau * shape.y - rhythm(23.0) * time);
        float facing = dot(cell.centre, kSubstellar) + lobes + 0.1 * (own.x - 0.5);
        float edge = 1.0 - 1.6 * coverage;
        float mass = smoothstep(edge - 0.3, edge + 0.3, facing);
        float fringe = exp(-pow((facing - edge + 0.35) / 0.18, 2.0));
        float threshold = 1.0 - (0.97 * mass + 0.25 * coverage * fringe);
        float cloud = smoothstep(threshold, threshold + 0.08, swing) * (0.35 + 0.25 * own.y + 0.15 * mass);
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
            if (dot(cell.centre, centre) < cos(min(radius * 1.6, 1.5))) { continue; }
            cloud = max(cloud, cluster(cell.centre, centre, radius, 1.0, a, b, own, strength));
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
        Cell cell = nearestCell(dir, time, circulation, locked, seed);
        vec3 own = random3(cell.row, cell.index, seed ^ 0x165667B1u);
        float share = coverage * (1.0 - 0.8 * circulation);
        float swing = 1.0 - abs(2.0 * fract(rhythm(3.0 + 6.0 * own.x) * time / kTau + own.z) - 1.0);
        float threshold = 1.0 - share - circulation * climate(cell.latitude);
        float cloud = smoothstep(threshold, threshold + 0.08, swing) * (0.45 + 0.35 * own.y);
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
            if (dot(cell.centre, centre) < cos(min(radius * 1.6, 1.5))) { continue; }
            cloud = max(cloud, cluster(cell.centre, centre, radius, 0.65, a, b, own, strength));
        }
        if (locked) {
            cloud = lockedCloud(cell, own, swing, time, coverage, circulation, seed);
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
            if (dot(cell.centre, centre) < cos(radius)) { continue; }
            vec2 offset = offsetFrom(centre, cell.centre);
            float distance = length(offset) / radius;
            float angle = atan(offset.y, offset.x);
            float winding = hemisphere * (tropical ? 2.2 : 2.0);
            float turn = hemisphere * now.days * 1.5;
            float arm = cos(2.0 * (angle + winding * log(max(distance, 0.02))) - turn);
            float core = tropical ? 1.2 : 0.9;
            float band = smoothstep(0.1, 0.5, arm + core * (1.0 - distance) - 0.35 + 0.4 * (own.x - 0.5));
            float eye = tropical ? smoothstep(0.08, 0.14, distance) : 1.0;
            float thickness = band * eye * (0.7 + 0.3 * clamp(1.0 - distance, 0.0, 1.0));
            float hold = smoothstep(1.0, 0.75, distance) * min(strength * 2.5, 1.0);
            cloud = mix(cloud, thickness, hold);
        }
        float density = clamp(cloud, 0.0, 1.0) * clamp(uOpacity, 0.0, 1.0);
        vec3 color = uColor * (0.8 + 0.2 * pow(density, 0.6));
        fragColor = vec4(color, density);
    }
`;

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
