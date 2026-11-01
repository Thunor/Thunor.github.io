//
//  geology.js
//  Estrelas (web)
//
//  Where a solid world's useful ores, gemstones and rarer crystals are, placed the way Earth's geology places them:
//  porphyry copper and epithermal gold in volcanic mountain belts, tin and tungsten in granite ranges, banded iron,
//  platinum and diamonds in the old stable interiors of continents, bauxite and nickel laterites under tropical
//  forests, salts, lithium brines and uranium in arid basins, lead, zinc and phosphate in coastal sedimentary basins,
//  coal and oil only where there has been life, and on airless worlds metals in impact basins and ice in polar cold
//  traps. Each world also has a crystal or two of its own. Worked out from the world's own surface, steadily from its
//  designation, so the same world always has the same deposits; ask off the main thread (surfaceWorker.js).
//

import { prepared } from './surfaceMap.js';
import { terrainAt, altitudeAt } from './surfaceTerrain.js';

export const version = 1;

// MARK: the catalogue

const volcanicTerrain = new Set(['volcano', 'activeVolcano', 'caldera']);
const aridTerrain = new Set(['subtropicalDesert', 'temperateDesert', 'coldDesert', 'scorched', 'shrubland']);
const tropicalTerrain = new Set(['tropicalRainforest', 'tropicalSeasonalForest', 'savanna']);
const vegetatedTerrain = new Set(['temperateForest', 'temperateRainforest', 'taiga', 'grassland', 'marsh', 'tundra',
    'tropicalRainforest', 'tropicalSeasonalForest', 'savanna', 'shrubland']);

const clamp = (value, lower = 0, upper = 1) => Math.min(Math.max(value, lower), upper);
const bump = (value, centre, width) => Math.exp(-(((value - centre) / width) ** 2));

/**
 * Each kind of deposit: its category, symbol and colour on the map, how many an Earth-sized world has, what the
 * world needs to have one at all (`needs`, from its traits), and how well a spot suits it (`suits`, from the spot's
 * features, 0 for not at all)
 */
export const depositKinds = [
    // Ores
    { id: 'copper', category: 'ore', name: 'Copper', symbol: 'Cu', color: '#e8894a', count: 14,
        setting: 'Porphyry copper, molybdenum and gold in a volcanic mountain belt',
        suits: (f) => f.land * (0.7 * f.mountain + 0.9 * f.volcanic + 0.4 * f.coastal * f.relief) },
    { id: 'gold', category: 'ore', name: 'Gold', symbol: 'Au', color: '#ffd34d', count: 12,
        setting: 'Gold in quartz veins through folded mountains, and epithermal veins round old volcanoes',
        suits: (f) => f.land * (0.6 * f.mountain + 0.5 * f.hills + 0.8 * f.volcanic) },
    { id: 'silver', category: 'ore', name: 'Silver', symbol: 'Ag', color: '#d6dde6', count: 8,
        setting: 'Silver, with lead and zinc, in epithermal veins near volcanic centres',
        suits: (f) => f.land * (0.9 * f.volcanic + 0.4 * f.mountain) },
    { id: 'iron', category: 'ore', name: 'Iron', symbol: 'Fe', color: '#c4553b', count: 14,
        setting: 'Banded iron formations in the ancient rock of a continental interior',
        needs: (w) => w.hadWater, suits: (f) => f.land * f.interior },
    { id: 'nickel', category: 'ore', name: 'Nickel', symbol: 'Ni', color: '#9fd18a', count: 7,
        setting: 'Nickel sulphides in a mafic intrusion, and nickel laterites weathered out under tropical forest',
        suits: (f) => f.land * (0.6 * f.interior * f.hills + 0.9 * f.tropical + 0.8 * f.impact) },
    { id: 'platinum', category: 'ore', name: 'Platinum group', symbol: 'Pt', color: '#e5e4e2', count: 3,
        setting: 'Platinum, palladium and chromite in a layered intrusion deep in a continent',
        suits: (f) => f.land * (f.interior * 0.8 + f.impact * 0.6) },
    { id: 'aluminium', category: 'ore', name: 'Aluminium', symbol: 'Al', color: '#d9a066', count: 8,
        setting: 'Bauxite, weathered out of the rock under hot, wet tropical forest',
        needs: (w) => w.liquidWater && w.air, suits: (f) => f.land * f.tropical * (1 - f.mountain) },
    { id: 'tin', category: 'ore', name: 'Tin and tungsten', symbol: 'Sn', color: '#b0b8c4', count: 6,
        setting: 'Tin and tungsten in the granites at the heart of a mountain range',
        suits: (f) => f.land * f.mountain * (1 - f.coastal) },
    { id: 'leadZinc', category: 'ore', name: 'Lead and zinc', symbol: 'Pb', color: '#8a93a8', count: 8,
        setting: 'Lead and zinc in the limestones of a sedimentary basin',
        needs: (w) => w.hadWater, suits: (f) => f.land * f.lowland * (0.5 + f.coastal) },
    { id: 'uranium', category: 'ore', name: 'Uranium', symbol: 'U', color: '#b6f25a', count: 5,
        setting: 'Uranium in the sandstones of an arid basin',
        suits: (f) => f.land * (0.9 * f.arid * f.lowland + 0.4 * f.interior) },
    { id: 'rareEarths', category: 'ore', name: 'Rare earths', symbol: 'REE', color: '#d58cf0', count: 3,
        setting: 'Rare earth elements in a carbonatite intrusion along an old rift',
        suits: (f) => f.land * (0.6 * f.interior + 0.6 * f.volcanic * (1 - f.mountain)) },
    { id: 'lithium', category: 'ore', name: 'Lithium', symbol: 'Li', color: '#7fe0e8', count: 5,
        setting: 'Lithium brines beneath a salt flat on a high, dry plateau, and lithium pegmatites',
        needs: (w) => w.hadWater, suits: (f) => f.land * (f.arid * (0.4 + f.highland) + 0.3 * f.mountain) },
    { id: 'salt', category: 'ore', name: 'Salt and potash', symbol: 'NaCl', color: '#f2efe6', count: 7,
        setting: 'Salt and potash left by seas that dried away in a desert basin',
        needs: (w) => w.hadWater, suits: (f) => f.land * f.arid * f.lowland },
    { id: 'phosphate', category: 'ore', name: 'Phosphate', symbol: 'P', color: '#c9b87a', count: 5,
        setting: 'Phosphate rock laid down on an old continental shelf',
        needs: (w) => w.liquidWater, suits: (f) => f.land * f.lowland * f.coastal },
    { id: 'coal', category: 'ore', name: 'Coal', symbol: 'C', color: '#5a5f66', count: 10,
        setting: 'Coal seams from swamp forests buried in a lowland basin',
        needs: (w) => w.life, suits: (f) => f.land * f.lowland * (0.4 + f.vegetated) },
    { id: 'oil', category: 'ore', name: 'Oil and gas', symbol: 'Oil', color: '#3a3a3a', count: 10,
        setting: 'Oil and gas trapped in the rocks of a sedimentary basin, on land and under the shallow sea',
        needs: (w) => w.life, suits: (f) => (f.land * f.lowland * (0.5 + 0.5 * f.coastal) + f.shelf) },
    { id: 'sulfur', category: 'ore', name: 'Sulphur', symbol: 'S', color: '#f2e14a', count: 4,
        setting: 'Native sulphur crusting the vents of active volcanoes',
        needs: (w) => w.volcanic, suits: (f) => f.land * f.volcanic * (0.5 + f.active) },
    { id: 'nickelIron', category: 'ore', name: 'Nickel-iron', symbol: 'FeNi', color: '#a7a9ac', count: 8,
        setting: 'Nickel-iron from the core of a shattered body, in an impact basin',
        needs: (w) => !w.air, suits: (f) => f.land * (0.3 + f.impact) },
    { id: 'waterIce', category: 'ore', name: 'Water ice', symbol: 'H₂O', color: '#bfe6ff', count: 5,
        setting: 'Water ice in a crater floor at the pole that the star never reaches',
        needs: (w) => !w.air && !w.icy, suits: (f) => f.polar * (0.4 + f.impact) },

    // Gemstones
    { id: 'diamond', category: 'gem', name: 'Diamond', symbol: '◇', color: '#e8f6ff', count: 4,
        setting: 'Diamonds in kimberlite pipes, brought up from deep in the mantle through ancient continental rock',
        needs: (w) => w.large, suits: (f) => f.land * f.interior * (1 - f.mountain) },
    { id: 'emerald', category: 'gem', name: 'Emerald', symbol: '◆', color: '#27c46b', count: 3,
        setting: 'Emeralds in schist and pegmatite veins high in a mountain range',
        needs: (w) => w.hadWater, suits: (f) => f.land * f.mountain },
    { id: 'ruby', category: 'gem', name: 'Ruby and sapphire', symbol: '◆', color: '#e0245e', count: 4,
        setting: 'Rubies and sapphires in marble, and washed down into the gravels below the mountains',
        suits: (f) => f.land * (0.6 * f.hills + 0.4 * f.mountain) },
    { id: 'opal', category: 'gem', name: 'Opal', symbol: '◆', color: '#9be7e0', count: 3,
        setting: 'Opal filling cracks in the weathered rock of a dry basin',
        needs: (w) => w.hadWater, suits: (f) => f.land * f.arid * f.lowland },
    { id: 'jade', category: 'gem', name: 'Jade', symbol: '◆', color: '#4f9d69', count: 3,
        setting: 'Jade in a belt of sea-floor rock thrust up along a coastal mountain range',
        needs: (w) => w.hadWater, suits: (f) => f.land * f.coastal * (0.5 * f.mountain + 0.5 * f.relief) },
    { id: 'amethyst', category: 'gem', name: 'Amethyst and agate', symbol: '◆', color: '#9b59d0', count: 4,
        setting: 'Amethyst and agate geodes in the flood basalts of a volcanic plain',
        suits: (f) => f.land * f.volcanic * (1 - f.mountain) + 0.3 * f.land * f.lowland * f.volcanicWorld },
    { id: 'topaz', category: 'gem', name: 'Topaz and tourmaline', symbol: '◆', color: '#f5a24b', count: 3,
        setting: 'Topaz and tourmaline in granite pegmatites',
        suits: (f) => f.land * f.mountain * (1 - f.coastal) },
    { id: 'peridot', category: 'gem', name: 'Peridot', symbol: '◆', color: '#a8d43c', count: 3,
        setting: 'Peridot in basalt flows, and in the shattered rock of an impact crater',
        suits: (f) => f.land * (0.7 * f.volcanic + 0.5 * f.impact) },
    { id: 'garnet', category: 'gem', name: 'Garnet', symbol: '◆', color: '#a3263c', count: 4,
        setting: 'Garnets in metamorphic rock through the roots of old mountains',
        suits: (f) => f.land * (0.5 * f.mountain + 0.6 * f.hills) },
    { id: 'turquoise', category: 'gem', name: 'Turquoise', symbol: '◆', color: '#36c2c2', count: 2,
        setting: 'Turquoise where copper-bearing rock has weathered in a dry land',
        needs: (w) => w.hadWater && w.air, suits: (f) => f.land * f.arid * (0.4 + f.relief + f.volcanic) },
];

// MARK: the world's own crystals

const crystalHabitats = {
    volcanic: { setting: 'grows in the vents of volcanoes', suits: (f) => f.land * (f.volcanic + 0.2 * f.volcanicWorld) },
    impact: { setting: 'forms in the melt of impact craters', suits: (f) => f.land * (0.3 + f.impact) },
    peaks: { setting: 'is found only on the highest peaks', suits: (f) => f.land * f.mountain * f.highland },
    desert: { setting: 'crystallises in desert salt pans', suits: (f) => f.land * f.arid },
    deep: { setting: 'lines caverns deep beneath lowland plains', suits: (f) => f.land * f.lowland * (1 - f.coastal) },
    polar: { setting: 'grows in the ice of the polar wastes', suits: (f) => f.polar },
    seafloor: { setting: 'grows around vents on the sea floor', suits: (f) => (1 - f.land) * (0.3 + f.volcanicWorld) },
};
const crystalProperties = ['glows faintly in the dark', 'rings like a bell when struck', 'grows in slow spirals',
    'changes colour with the temperature', 'gives off a small electric charge when squeezed', 'splits light into vivid bands',
    'is warm to the touch', 'stores light and gives it back at night', 'is lighter than water', 'is harder than diamond',
    'hums faintly near magnetic fields', 'slowly regrows when broken'];
const syllables = { start: ['ka', 'vo', 'ze', 'thy', 'mor', 'ael', 'qui', 'sar', 'lu', 'nex', 'or', 'bri', 'cy', 'dra', 'ish'],
    middle: ['ra', 'li', 'mo', 'the', 'va', 'ne', 'su', 'ri', 'do', 'xa', 'ly', 'ke'],
    end: ['ite', 'ite', 'ine', 'ane', 'ite', 'yte', 'ase', 'ite'] };

/** A steady 0–1 generator (FNV-1a hash of the text, then mulberry32) */
export function generatorFor(text) {
    let hash = 0x811C9DC5;
    for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 0x01000193);
    let state = hash >>> 0;
    return () => {
        state = (state + 0x6D2B79F5) >>> 0;
        let x = state;
        x = Math.imul(x ^ (x >>> 15), x | 1);
        x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
}

const pick = (list, random) => list[Math.min(Math.trunc(random() * list.length), list.length - 1)];

/** A crystal of the world's own: a made-up mineral's name, colour, what it does and where it grows */
function crystalKind(index, random) {
    let name = pick(syllables.start, random);
    if (random() < 0.6) name += pick(syllables.middle, random);
    name += pick(syllables.end, random);
    name = name[0].toUpperCase() + name.slice(1);
    const hue = Math.trunc(random() * 360);
    const habitat = pick(Object.keys(crystalHabitats), random);
    const property = pick(crystalProperties, random);
    return { id: `crystal${index}`, category: 'crystal', name, symbol: '✦', color: `hsl(${hue} 85% 68%)`, count: 3,
        habitat, property, setting: crystalHabitats[habitat].setting, suits: crystalHabitats[habitat].suits };
}

// MARK: reading the ground

/** Points spread evenly over the sphere (a Fibonacci lattice) */
function lattice(count) {
    const points = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
        const y = 1 - 2 * (i + 0.5) / count;
        const r = Math.sqrt(1 - y * y);
        points.push([r * Math.cos(golden * i), y, r * Math.sin(golden * i)]);
    }
    return points;
}

/** Points round `p` at an angle `radius` (radians) from it */
function ring(p, radius, count) {
    const reference = Math.abs(p[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    let east = [reference[1] * p[2] - reference[2] * p[1], reference[2] * p[0] - reference[0] * p[2], reference[0] * p[1] - reference[1] * p[0]];
    const length = Math.hypot(...east);
    east = east.map((v) => v / length);
    const north = [p[1] * east[2] - p[2] * east[1], p[2] * east[0] - p[0] * east[2], p[0] * east[1] - p[1] * east[0]];
    const c = Math.cos(radius), s = Math.sin(radius);
    const points = [];
    for (let k = 0; k < count; k++) {
        const a = k / count * 2 * Math.PI;
        points.push([0, 1, 2].map((i) => c * p[i] + s * (Math.cos(a) * east[i] + Math.sin(a) * north[i])));
    }
    return points;
}

/** What a world is like as a whole, for which deposits it can have at all */
function traitsOf(world, style) {
    const environment = world.environment;
    const pressure = environment?.pressureBar ?? 0;
    const water = environment?.waterPercent ?? 0;
    const kelvin = environment?.temperatureK ?? 200;
    return {
        air: pressure >= 0.05,
        hadWater: water > 0 || style.waterFraction > 0 || (pressure >= 0.3 && kelvin < 500),
        liquidWater: water > 0 && kelvin > 260 && kelvin < 380,
        life: !!style.vegetation,
        volcanic: (style.volcanism ?? 0) > 0,
        large: (world.radiusKm ?? 0) >= 2500,
        icy: style.kind === 'icy',
    };
}

/** A spot's features, each 0–1 */
function featuresAt(p, style, traits, impactSeed) {
    const metres = (q) => altitudeAt(q, style)?.metres ?? 0;
    const here = metres(p);
    const seas = style.kind === 'rocky' && style.waterFraction > 0;
    const isLand = (m) => !seas || m >= 0;
    const near = ring(p, 0.025, 6).map(metres);
    const wide = ring(p, 0.09, 8).map(metres);
    const terrain = terrainAt(p, style) ?? '';
    const height = clamp(here / 8000);
    const relief = clamp((Math.max(here, ...near) - Math.min(here, ...near)) / 2500);
    const coastal = seas ? wide.filter((m) => !isLand(m)).length / wide.length : 0;
    const latitude = Math.abs(Math.asin(clamp(p[1], -1, 1))) * 180 / Math.PI;
    const land = isLand(here) ? 1 : 0;
    const mountain = clamp(terrain === 'mountains' ? 1 : (height - 0.25) / 0.25);
    const lowland = clamp(1 - height / 0.18) * (1 - relief);
    // Old impact basins, wherever the world keeps its craters
    const impactNoise = Math.sin(p[0] * 11.3 + impactSeed) * Math.sin(p[1] * 9.7 - impactSeed) * Math.sin(p[2] * 13.1 + 2 * impactSeed);
    const impact = clamp((style.craterDensity ?? 0.3) * (traits.air ? 0.3 : 1)) * clamp((impactNoise - 0.2) / 0.5);
    return {
        land,
        mountain,
        hills: clamp(bump(height, 0.2, 0.1) + 0.5 * relief) * (1 - mountain),
        highland: clamp((height - 0.3) / 0.3),
        lowland,
        relief,
        coastal: land ? clamp(coastal * 2.5) : 0,
        shelf: !land && here > -400 && coastal < 1 ? 1 : 0,
        interior: land * (1 - clamp(coastal * 4)) * (1 - relief) * clamp(1 - height / 0.35),
        volcanic: volcanicTerrain.has(terrain) || near.length && traits.volcanic && relief > 0.5 && style.volcanism > 0.3 ? 1
            : clamp((style.volcanism ?? 0) * relief),
        active: terrain === 'activeVolcano' ? 1 : 0,
        volcanicWorld: clamp(style.volcanism ?? 0),
        arid: aridTerrain.has(terrain) || (!traits.liquidWater && traits.air && !traits.icy) ? 1 : 0,
        tropical: tropicalTerrain.has(terrain) ? 1 : 0,
        vegetated: vegetatedTerrain.has(terrain) ? 1 : 0,
        polar: clamp((latitude - 65) / 15),
        impact,
    };
}

// MARK: placing the deposits

/**
 * The deposits on a world: { version, kinds, deposits } where each kind is a catalogue entry (without its functions)
 * and each deposit { kind, latitude, longitude, size } (size 0 small … 3 world-class). `world` is the world or moon
 * as generated; `style` its surface style (surfaceMap.styleFor). Empty for gas giants and worlds without a surface.
 */
export function geologyOf(world, style, samples = 3000) {
    style = prepared(style);
    if (!style || style.kind === 'gasGiant') return { version, kinds: [], deposits: [] };
    const random = generatorFor(`geology|${world.designation}`);
    const traits = traitsOf(world, style);
    const radius = world.radiusKm ?? 3000;
    // Bigger worlds have more, but not so many more that the map is crowded
    const area = clamp((radius / 6371) ** 2, 0.04, 1.6);
    // How rich the world is in minerals (its society's resources score, if it has one)
    const richness = 0.6 + 0.8 * (world.social?.resources ?? 0.5);
    const crystals = [];
    const crystalCount = random() < 0.25 ? 0 : random() < 0.7 ? 1 : 2;
    for (let i = 0; i < crystalCount; i++) crystals.push(crystalKind(i, random));
    const kinds = [...depositKinds.filter((kind) => !kind.needs || kind.needs(traits)), ...crystals];

    // Reading the ground at points spread over the world
    const impactSeed = random() * 10;
    const points = lattice(samples);
    const features = points.map((p) => featuresAt(p, style, traits, impactSeed));

    const deposits = [];
    for (const kind of kinds) {
        const scores = features.map((f) => Math.max(kind.suits(f), 0));
        const total = scores.reduce((a, b) => a + b, 0);
        if (!(total > 0)) continue;
        const wanted = kind.category === 'crystal' ? 1 + Math.trunc(random() * 4)
            : Math.round(0.55 * kind.count * area * richness * (0.6 + 0.8 * random()));
        const chosen = [];
        // Kept apart, so a kind isn't all in one place
        const apart = Math.cos(Math.min(0.35, 1.4 / Math.sqrt(Math.max(wanted, 1))));
        for (let attempt = 0; attempt < wanted * 6 && chosen.length < wanted; attempt++) {
            // The best spots are likeliest, but any spot that suits at all may have one
            let target = random() * total;
            let index = 0;
            while (index < scores.length - 1 && target > scores[index]) target -= scores[index++];
            const p = points[index];
            if (chosen.some((q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2] > apart)) continue;
            chosen.push(p);
            // Jittered off the lattice point, within its own patch
            const jitter = ring(p, 0.02 * random(), 1)[0];
            const roll = random() * (0.6 + scores[index]);
            const size = roll > 1.45 ? 3 : roll > 1.05 ? 2 : roll > 0.6 ? 1 : 0;
            const latitude = Math.asin(clamp(jitter[1], -1, 1)) * 180 / Math.PI;
            let longitude = Math.atan2(-jitter[2], jitter[0]) * 180 / Math.PI;
            if (longitude < 0) longitude += 360;
            deposits.push({ kind: kind.id, latitude, longitude, size });
        }
    }
    const plain = kinds.map(({ suits, needs, ...rest }) => rest);
    return { version, kinds: plain, deposits };
}
