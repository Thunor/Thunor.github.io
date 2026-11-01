//
//  starColors.js
//  Estrelas (web)
//
//  Star colours by spectral class and subclass (StarColors.swift, StellarColors.swift).
//

import * as THREE from '../../vendor/three.module.min.js';

export const colorBySpectralHex = {
    O0: '#686FF4',
    O1: '#6B73F4',
    O2: '#6F77F4',
    O3: '#737BF5',
    O4: '#777FF5',
    O5: '#7B83F6',
    O6: '#7E87F6',
    O7: '#828BF6',
    O8: '#868FF7',
    O9: '#8A93F7',
    B0: '#8E97F8',
    B1: '#949CF8',
    B2: '#9AA2F8',
    B3: '#A0A7F8',
    B4: '#A6ADF8',
    B5: '#ACB2F8',
    B6: '#B2B8F8',
    B7: '#B8BDF8',
    B8: '#BEC3F8',
    B9: '#C4C8F8',
    A0: '#CBCEF9',
    A1: '#D0D2F8',
    A2: '#D5D7F7',
    A3: '#DADCF7',
    A4: '#DFE1F6',
    A5: '#E5E6F6',
    A6: '#EAEBF5',
    A7: '#EFF0F4',
    A8: '#F4F5F4',
    A9: '#F9FAF3',
    F0: '#FFFFFF',
    F1: '#FEFEF1',
    F2: '#FEFDE4',
    F3: '#FEFCD7',
    F4: '#FEFBCA',
    F5: '#FEFABD',
    F6: '#FDF9B0',
    F7: '#FDF8A3',
    F8: '#FDF796',
    F9: '#FDF689',
    G0: '#FDF67C',
    G1: '#FBEE79',
    G2: '#FAE776',
    G3: '#F9E073',
    G4: '#F8D870',
    G5: '#F7D16D',
    G6: '#F5CA6A',
    G7: '#F4C267',
    G8: '#F3BB64',
    G9: '#F2B461',
    K0: '#F1AD5F',
    K1: '#F0A65D',
    K2: '#EFA05C',
    K3: '#EE9A5A',
    K4: '#EE9459',
    K5: '#ED8E57',
    K6: '#EC8856',
    K7: '#EC8254',
    K8: '#EB7C53',
    K9: '#EA7651',
    M0: '#EA7050',
    M1: '#DF6848',
    M2: '#D35F40',
    M3: '#C85739',
    M4: '#BD4F31',
    M5: '#B1462A',
    M6: '#A63E22',
    M7: '#9B361B',
    M8: '#8F2D13',
    M9: '#84250C',
    D0: '#84250C',
    D1: '#82250C',
    D2: '#80250C',
    D3: '#78250C',
    D4: '#76250C',
    D5: '#74250C',
    D6: '#72250C',
    D7: '#70250C',
    D8: '#68250C',
    D9: '#66250C',
};

/**
 * Classes beyond the table, from how they look: brown dwarfs dull red through magenta to deep purple; Wolf–Rayet stars
 * and neutron stars blue-white; carbon stars the reddest of all; S-type stars orange-red; black holes black
 */
const extraClasses = {
    L: [[0.95, 0.38, 0.18], [0.75, 0.2, 0.2]], T: [[0.72, 0.22, 0.42], [0.55, 0.2, 0.55]],
    Y: [[0.42, 0.18, 0.45], [0.28, 0.12, 0.34]], W: [[0.62, 0.72, 1], [0.72, 0.82, 1]],
    C: [[1, 0.45, 0.2], [0.85, 0.18, 0.1]], S: [[1, 0.58, 0.32], [0.95, 0.38, 0.22]],
};

/** The colour for a class and subclass, e.g. ('G', 2); green marks a combination with no colour */
export function colorBySpectral(spectralClass, subClass) {
    const t = Math.min(Math.max(subClass, 0), 9) / 9;
    const pair = extraClasses[spectralClass];
    if (pair) {
        const [a, b] = pair;
        return new THREE.Color(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
    }
    if (spectralClass === 'NS' || spectralClass === 'N') return new THREE.Color(0.78, 0.86, 1);
    if (spectralClass === 'BH' || spectralClass === 'X') return new THREE.Color(0.02, 0.02, 0.03);
    const hex = colorBySpectralHex[`${spectralClass}${subClass}`];
    if (!hex) return new THREE.Color(0, 1, 0);
    const value = parseInt(hex.slice(1), 16);
    return new THREE.Color(((value >> 16) & 0xff) / 255, ((value >> 8) & 0xff) / 255, (value & 0xff) / 255);
}
