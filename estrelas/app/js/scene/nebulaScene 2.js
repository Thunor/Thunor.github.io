//
//  nebulaScene.js
//  Estrelas (web)
//
//  Nebulae in the star field, each a few soft layers facing the camera, set a little apart so the cloud has depth as
//  the view turns: glowing red hydrogen with greener oxygen at the heart of an emission nebula, wisps of dust lit blue
//  in a reflection nebula, a brown-black cloud dimming the stars behind it, a ring-shaped shell round a planetary
//  nebula's white dwarf, and the tangled filaments of a supernova remnant. Each kind's textures are drawn once, a few
//  variations of each, and shared by every nebula of that kind. Also a black hole's accretion disc and a pulsar's
//  beams. A port of NebulaScene.swift.
//

import * as THREE from '../../vendor/three.module.min.js';
import { nebulaKinds } from '../gen/nebulaGenerator.js';
import { SplitMix64 } from '../gen/random.js';

export const textureSize = 256;
export const variations = 4;
export const entityName = 'nebula';

/** Fast smooth 2D value noise, roughly −0.5…0.5, for textures that needn't match the Mac app's bit for bit */
function valueNoise(seed) {
    const s = Math.imul(seed >>> 0, 0x9E3779B1) >>> 0;
    const hash = (x, y) => {
        let h = (Math.imul(x, 0x27D4EB2F) ^ Math.imul(y, 0x165667B1) ^ s) >>> 0;
        h = Math.imul(h ^ (h >>> 15), 0x85EBCA6B) >>> 0;
        h = Math.imul(h ^ (h >>> 13), 0xC2B2AE35) >>> 0;
        return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    };
    return (px, py) => {
        const cx = Math.floor(px), cy = Math.floor(py);
        const fx = px - cx, fy = py - cy;
        const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
        const h00 = hash(cx, cy), h10 = hash(cx + 1, cy), h01 = hash(cx, cy + 1), h11 = hash(cx + 1, cy + 1);
        const bottom = h00 + (h10 - h00) * sx, top = h01 + (h11 - h01) * sx;
        return bottom + (top - bottom) * sy - 0.5;
    };
}

const smooth = (a, b, x) => {
    const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
    return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** RGBA pixels for one variation of a kind of nebula, `textureSize` square */
export function nebulaPixels(kind, variation) {
    const size = textureSize;
    const kindIndex = Math.max(nebulaKinds.indexOf(kind), 0);
    const noise = valueNoise(0xC10D0000 + variation * 7919 + kindIndex * 104729);
    const fbm = (x, y, octaves = 5) => {
        let sum = 0, amplitude = 0.5, qx = x, qy = y;
        for (let i = 0; i < octaves; i++) {
            sum += amplitude * noise(qx, qy);
            qx = qx * 2.03 + 17.1; qy = qy * 2.03 + 17.1;
            amplitude *= 0.5;
        }
        return sum;
    };
    const ridges = (x, y) => {
        let sum = 0, amplitude = 0.5, qx = x, qy = y;
        for (let i = 0; i < 4; i++) {
            sum += amplitude * (1 - Math.abs(noise(qx, qy) * 2));
            qx = qx * 2.1 + 31.7; qy = qy * 2.1 + 31.7;
            amplitude *= 0.5;
        }
        return sum;
    };
    const pixels = new Uint8ClampedArray(size * size * 4);
    const stretch = kind === 'planetary' && variation % 2 === 1 ? 1.6 : 1;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const px = (x + 0.5) / size * 2 - 1, py = (y + 0.5) / size * 2 - 1;
            const r = Math.hypot(px, py);
            const angle = Math.atan2(py, px);
            const qx = px * 2.2 + variation * 13.7, qy = py * 2.2 + variation * 13.7;
            let rgb = [0, 0, 0];
            let alpha = 0;
            switch (kind) {
                case 'emission': {
                    const cloud = fbm(qx, qy) + 0.5;
                    const edge = 1 - smooth(0.3, 1, r + fbm(qx * 0.45 + 9.1, qy * 0.45 + 9.1) * 1.1 + (cloud - 0.5) * 0.4);
                    const lanes = smooth(0.66, 0.82, ridges(qx * 0.8 + 5.3, qy * 0.8 + 5.3));
                    const glow = edge * (0.45 + 0.9 * cloud) * (1 - 0.4 * lanes);
                    const heart = 1 - smooth(0, 0.55, r + (cloud - 0.5) * 0.4);
                    rgb = mix([0.88, 0.22, 0.34], [0.42, 0.9, 0.8], heart * 0.6);
                    rgb = mix(rgb, [1, 0.85, 0.9], Math.pow(heart, 3) * 0.5);
                    rgb = mix(rgb, [0.2, 0.07, 0.07], lanes * 0.5);
                    alpha = Math.min(glow * 0.85, 0.9);
                    break;
                }
                case 'reflection': {
                    const wisps = ridges(qx * 0.6, qy * 1.8);
                    const edge = 1 - smooth(0.2, 1, r + fbm(qx, qy) * 0.5);
                    rgb = mix([0.3, 0.45, 0.95], [0.75, 0.85, 1], Math.pow(wisps, 3));
                    alpha = edge * smooth(0.35, 0.95, wisps) * 0.7;
                    break;
                }
                case 'dark': {
                    const cloud = fbm(qx * 0.9, qy * 0.9) + 0.5;
                    const density = 1 - smooth(0.25, 1, r + (cloud - 0.5) * 0.9);
                    rgb = mix([0.16, 0.11, 0.08], [0.03, 0.02, 0.02], density);
                    alpha = Math.min(density * 1.2, 0.95);
                    break;
                }
                case 'planetary': {
                    const shellR = Math.hypot(px, py / stretch) + fbm(qx * 1.5, qy * 1.5) * 0.12;
                    const shell = Math.exp(-Math.pow((shellR - 0.55) / 0.12, 2));
                    const halo = Math.exp(-Math.pow(shellR / 0.85, 4)) * 0.18;
                    const inner = 1 - smooth(0.3, 0.6, shellR);
                    rgb = mix([0.95, 0.35, 0.35], [0.35, 0.95, 0.85], inner);
                    alpha = Math.min(shell * 0.95 + halo + inner * 0.07, 0.95);
                    break;
                }
                default: {
                    const wobble = fbm(Math.cos(angle) * 2 + variation, Math.sin(angle) * 2 + variation) * 0.25;
                    const shell = Math.exp(-Math.pow((r - 0.78 - wobble) / 0.1, 2));
                    const filaments = smooth(0.55, 0.85, ridges(qx * 1.4, qy * 1.4));
                    const hue = fbm(qx * 0.7, qy * 0.7) + 0.5;
                    rgb = hue < 0.4 ? [0.95, 0.35, 0.4] : (hue < 0.6 ? [0.45, 0.95, 0.55] : [0.55, 0.65, 1]);
                    alpha = Math.min(shell * (0.25 + 0.9 * filaments) + filaments * 0.08 * (1 - smooth(0.6, 1, r)), 0.95);
                }
            }
            // Fades out before the square's edge, so it never shows
            alpha *= 1 - smooth(0.82, 1, r);
            // The image runs top to bottom, the texture bottom to top, as the Mac app's quad is textured
            const index = ((size - 1 - y) * size + x) * 4;
            pixels[index] = Math.min(Math.max(rgb[0], 0), 1) * 255;
            pixels[index + 1] = Math.min(Math.max(rgb[1], 0), 1) * 255;
            pixels[index + 2] = Math.min(Math.max(rgb[2], 0), 1) * 255;
            pixels[index + 3] = Math.min(Math.max(alpha, 0), 1) * 255;
        }
    }
    return pixels;
}

const textures = new Map();

/** A kind's texture variation, drawn the first time it's asked for */
function texture(kind, variation) {
    const key = `${kind}/${variation}`;
    let found = textures.get(key);
    if (!found) {
        found = new THREE.DataTexture(nebulaPixels(kind, variation), textureSize, textureSize, THREE.RGBAFormat);
        found.colorSpace = THREE.SRGBColorSpace;
        found.magFilter = THREE.LinearFilter;
        found.minFilter = THREE.LinearMipmapLinearFilter;
        found.generateMipmaps = true;
        found.needsUpdate = true;
        textures.set(key, found);
    }
    return found;
}

/** The layers a nebula is drawn with: which variation, how far off its centre, and how big, as a share of its radius */
export function nebulaLayers(nebula) {
    const seed = BigInt.asUintN(64, BigInt(nebula.seed));
    const random = new SplitMix64(BigInt(Number(seed & 0xFFFFFFFFn)) ^ seed);
    const count = { emission: 4, dark: 3, reflection: 2 }[nebula.kind] ?? 1;
    const layers = [];
    for (let index = 0; index < count; index++) {
        const spread = index === 0 ? 0 : 0.35;
        const offset = [random.float(-1, 1) * spread, random.float(-1, 1) * spread, random.float(-1, 1) * spread];
        const variation = Number(random.next64() % BigInt(variations));
        const scale = index === 0 ? 1 : random.float(0.6, 0.9);
        layers.push({ variation, offset, scale });
    }
    return layers;
}

/** Draws the textures these nebulae need, a few at a time so the page stays responsive */
export async function prepareTextures(nebulae) {
    const needed = new Set();
    for (const nebula of nebulae) for (const layer of nebulaLayers(nebula)) needed.add(`${nebula.kind}/${layer.variation}`);
    for (const key of needed) {
        if (textures.has(key)) continue;
        const [kind, variation] = key.split('/');
        texture(kind, Number(variation));
        await new Promise((resolve) => setTimeout(resolve, 0));
    }
}

/** A nebula's object: a group of sprites facing the camera */
export function nebulaEntity(nebula) {
    const root = new THREE.Group();
    root.name = entityName;
    root.position.set(nebula.position[0], nebula.position[1], nebula.position[2]);
    root.userData.nebula = nebula;
    for (const layer of nebulaLayers(nebula)) {
        const material = new THREE.SpriteMaterial({ map: texture(nebula.kind, layer.variation), transparent: true,
            depthWrite: false, sizeAttenuation: true });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(layer.offset[0] * nebula.radius, layer.offset[1] * nebula.radius, layer.offset[2] * nebula.radius);
        const size = 2 * nebula.radius * layer.scale;
        sprite.scale.set(size, size, 1);
        sprite.raycast = () => {};
        root.add(sprite);
    }
    return root;
}

// MARK: compact stars

function annulus(inner, outer, segments = 64) {
    const positions = [];
    const indices = [];
    for (let k = 0; k < segments; k++) {
        const angle = k / segments * 2 * Math.PI;
        const c = Math.cos(angle), s = Math.sin(angle);
        positions.push(c * inner, 0, s * inner, c * outer, 0, s * outer);
    }
    for (let k = 0; k < segments; k++) {
        const a = k * 2, b = a + 1, c = ((k + 1) % segments) * 2, d = c + 1;
        indices.push(a, c, b, b, c, d);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    return geometry;
}

/** A black hole's accretion disc: a flat, glowing ring of gas, hotter toward the hole, tilted a little */
export function accretionDisc(radius) {
    const disc = new THREE.Group();
    disc.name = 'accretion_disc';
    for (const [inner, outer, color, alpha] of [[1.6, 2.4, [1, 0.85, 0.6], 0.9], [2.4, 3.6, [1, 0.5, 0.2], 0.6],
        [3.6, 5, [0.8, 0.25, 0.15], 0.3]]) {
        const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(...color), transparent: true, opacity: alpha,
            side: THREE.DoubleSide, depthWrite: false });
        const ring = new THREE.Mesh(annulus(inner * radius, outer * radius), material);
        ring.raycast = () => {};
        disc.add(ring);
    }
    disc.rotation.x = 0.35;
    return disc;
}

/** A pulsar's two beams, tilted from its spin axis so they sweep round as it turns; a magnetar's fainter and redder */
export function pulsarBeams(radius, magnetar) {
    const spinner = new THREE.Group();
    spinner.name = 'pulsar_beams';
    const beams = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({
        color: magnetar ? new THREE.Color(0.9, 0.55, 1) : new THREE.Color(0.65, 0.85, 1), transparent: true,
        opacity: magnetar ? 0.45 : 0.55, side: THREE.DoubleSide, depthWrite: false,
    });
    const length = radius * 14;
    for (const sign of [-1, 1]) {
        // A cone's tip at +y; turned so the tip sits at the star and it widens outward
        const beam = new THREE.Mesh(new THREE.ConeGeometry(radius * 1.4, length, 24, 1, true), material);
        beam.position.y = sign * length / 2;
        if (sign > 0) beam.rotation.x = Math.PI;
        beam.raycast = () => {};
        beams.add(beam);
    }
    beams.rotation.z = 0.6;
    spinner.add(beams);
    // A real pulsar turns many times a second; drawn turning about once every two seconds
    spinner.userData.spinPeriod = 2;
    return spinner;
}
