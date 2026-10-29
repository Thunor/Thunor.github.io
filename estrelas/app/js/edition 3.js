//
//  edition.js
//  Estrelas (web)
//
//  Which edition of the app this is. The GM's edition (index.html) can change a universe: rename things, write
//  notes, edit world data, mark places. The players' edition (player.html) can only look, and shows just the notes
//  the GM has shared. Both are free. Every editing control checks `canEdit`.
//  A port of AppEdition.swift.
//

const isPlayerPage = typeof document !== 'undefined' && document.documentElement?.dataset.edition === 'player';

/** The GM's edition (index.html) */
export const isGMEdition = !isPlayerPage;

/** Whether the universe can be changed: renamed, annotated, noted, edited, saved as a copy or exported for players */
export const canEdit = isGMEdition;

/** Whether a note can be seen in this edition: all of them for the GM, only shared ones for players */
export function canSee(note) {
    if (!note || note.text.trim().length === 0) return false;
    return isGMEdition || note.shared === true;
}

/** Storage keys and folders are kept apart, as the two Mac editions are separate apps with separate libraries */
export const storagePrefix = isGMEdition ? 'estrelas' : 'estrelas-player';
export const libraryFolder = isGMEdition ? 'Estrelas/Universes' : 'Estrelas Player/Universes';
