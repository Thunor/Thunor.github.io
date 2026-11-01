//
//  placeNames.js
//  Estrelas (web)
//
//  Made-up star system names, built from syllables: an opening consonant (or none), a vowel and a closing consonant
//  (or none), two or three of them, sometimes with an ending such as "-is" or "-ar". Names that come out awkward
//  (too short or long, three consonants in a row, more than one pair of vowels, a syllable repeated) are rolled again.
//  A port of PlaceNameGenerator.swift: the same generator state gives the same names.
//

const openings = ['', '', 'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't',
    'v', 'z', 'br', 'ch', 'cr', 'dr', 'gl', 'kr', 'ph', 'pr', 'qu', 'sh', 'st', 'th', 'tr', 'vr'];
const simpleOpenings = openings.filter((o) => o.length === 1);
const simpleOrEmpty = [...simpleOpenings, ''];
const vowels = ['a', 'a', 'a', 'e', 'e', 'e', 'i', 'i', 'o', 'o', 'o', 'u', 'u', 'y', 'ae', 'ai', 'ei', 'ia', 'io', 'ou'];
const middleClosings = ['', '', '', '', '', '', 'l', 'n', 'r', 's'];
const closings = ['', '', '', 'l', 'm', 'n', 'r', 's', 'x', 'nd', 'rk', 'rn', 'st', 'th'];
const endings = ['a', 'ar', 'en', 'ex', 'ia', 'is', 'ith', 'on', 'or', 'os', 'us'];
const vowelLetters = new Set('aeiouy');

const pick = (choices, generator) => choices[generator.intBelow(0, choices.length)];

/** `count` different names in an order drawn from `generator`, none of which is in `taken` (ignoring case) */
export function placeNames(count, generator, taken = []) {
    const used = new Set([...taken].map((n) => n.toLowerCase()));
    const result = [];
    let failures = 0;
    while (result.length < count) {
        const name = makeName(Math.trunc(failures / 1000), generator);
        const key = name.toLowerCase();
        if (!used.has(key)) {
            used.add(key);
            result.push(name);
            failures = 0;
        } else {
            failures += 1;
        }
    }
    return result;
}

function makeName(extraSyllables, generator) {
    for (;;) {
        const syllableCount = (generator.int(1, 10) <= 6 ? 2 : 3) + extraSyllables;
        const syllables = [];
        let closedOnConsonant = false;
        for (let index = 0; index < syllableCount; index++) {
            const choices = index === 0 ? openings : closedOnConsonant ? simpleOrEmpty : simpleOpenings;
            const closing = pick(index === syllableCount - 1 ? closings : middleClosings, generator);
            // Swift evaluates the opening and vowel picks after the closing, left to right
            const opening = pick(choices, generator);
            const vowel = pick(vowels, generator);
            syllables.push(opening + vowel + closing);
            closedOnConsonant = closing !== '';
        }
        let name = syllables.join('');
        if (closedOnConsonant && generator.int(1, 3) === 1) name += pick(endings, generator);
        if (isWellFormed(name, syllables, extraSyllables)) return name[0].toUpperCase() + name.slice(1);
    }
}

const placePatterns = {
    capital: ['%@'], city: ['%@'], town: ['%@'], village: ['%@'],
    spaceport: ['%@ Port', '%@ Spaceport', 'Port %@', '%@ Field', '%@ Skyport'],
    landingPad: ['%@ Pad', '%@ Landing', '%@ Field', '%@ Strip'],
    base: ['%@ Base', 'Fort %@', '%@ Station', '%@ Garrison'],
    outpost: ['%@ Outpost', 'Camp %@', '%@ Station', '%@ Post'],
};
const landmarkPatterns = {
    mountain: ['Mount %@', '%@ Peak', '%@ Range', '%@ Heights'],
    volcano: ['Mount %@', '%@ Caldera', '%@ Volcano'],
    crater: ['%@ Crater', '%@ Impact Basin'],
    canyon: ['%@ Canyon', '%@ Gorge', '%@ Rift'],
    lake: ['Lake %@', '%@ Lake', '%@ Mere'],
    sea: ['%@ Sea', 'Sea of %@', '%@ Bay', '%@ Gulf'],
    river: ['%@ River', 'River %@'],
    waterfall: ['%@ Falls', '%@ Cascade'],
    forest: ['%@ Forest', '%@ Woods', '%@ Wood'],
    desert: ['%@ Desert', '%@ Dunes', '%@ Wastes'],
    plain: ['%@ Plains', '%@ Basin', '%@ Steppe', '%@ Flats'],
    glacier: ['%@ Glacier', '%@ Ice Field', '%@ Ice Shelf'],
    island: ['%@ Island', '%@ Isle', '%@ Islands'],
    cave: ['%@ Caves', '%@ Caverns', '%@ Grotto'],
    ruins: ['Ruins of %@', '%@ Ruins', 'Old %@'],
    monument: ['%@ Monument', '%@ Memorial', '%@ Spire', '%@ Obelisk'],
    other: ['%@ Rock', '%@ Spire', '%@ Point', '%@ Ridge', '%@ Hollow'],
};

/** A made-up name for a place of the given kind on a world's map, e.g. "Vorath Port" or "Lake Vorath" */
export function placeName(kind, landmark, taken, generator) {
    const patterns = kind === 'landmark' ? landmarkPatterns[landmark ?? 'other'] ?? landmarkPatterns.other
        : placePatterns[kind] ?? ['%@'];
    const used = new Set([...(taken ?? [])].map((n) => n.toLowerCase()));
    for (;;) {
        const base = makeName(0, generator);
        const name = pick(patterns, generator).replace('%@', base);
        if (!used.has(name.toLowerCase())) return name;
    }
}

function isWellFormed(name, syllables, extraSyllables) {
    if (name.length < 4 || name.length > 10 + 3 * extraSyllables) return false;
    for (let i = 1; i < syllables.length; i++) if (syllables[i] === syllables[i - 1]) return false;
    let consonantRun = 0, vowelRun = 0, vowelPairs = 0, previous = null;
    for (const letter of name) {
        if (vowelLetters.has(letter)) {
            vowelRun += 1;
            consonantRun = 0;
            if (vowelRun === 2) {
                vowelPairs += 1;
                if (vowelPairs > 1) return false;
            }
        } else {
            consonantRun += 1;
            vowelRun = 0;
        }
        if (consonantRun > 2 || vowelRun > 2) return false;
        if (letter === previous && vowelLetters.has(letter)) return false;
        previous = letter;
    }
    return true;
}
