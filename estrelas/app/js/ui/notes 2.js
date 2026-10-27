//
//  notes.js
//  Estrelas (web)
//
//  The GM's notes: a small button beside anything that can carry a note, a popover to write the note in Markdown
//  and preview it, the Markdown renderer, and every note on a system or planet gathered into one printable document.
//  Ports of NotesView.swift and NotesReportView.swift.
//

import { h, button, icon, popover } from './components.js';
import { t, locale } from './i18n.js';
import { canEdit, canSee, isGMEdition } from '../edition.js';
import { showSheet } from './sheets.js';
import { printPage } from './exportFile.js';

// MARK: Markdown

/** Splits Markdown into blocks; consecutive plain lines join into one paragraph and a blank line ends it */
export function markdownBlocks(markdown) {
    const blocks = [];
    let paragraph = [];
    let code = null;
    const endParagraph = () => {
        if (paragraph.length) blocks.push({ kind: 'paragraph', text: paragraph.join(' ') });
        paragraph = [];
    };
    for (const rawLine of markdown.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (line.startsWith('```')) {
            if (code) {
                blocks.push({ kind: 'code', text: code.join('\n') });
                code = null;
            } else {
                endParagraph();
                code = [];
            }
            continue;
        }
        if (code) {
            code.push(rawLine);
            continue;
        }
        const depth = Math.trunc((rawLine.match(/^[ \t]*/)[0].length) / 2);
        const heading = line.match(/^(#{1,6}) (.*)$/);
        const numbered = line.match(/^(\d+)\. (.*)$/);
        if (!line) endParagraph();
        else if (heading) {
            endParagraph();
            blocks.push({ kind: 'heading', level: heading[1].length, text: heading[2].trim() });
        } else if (['---', '***', '___'].includes(line)) {
            endParagraph();
            blocks.push({ kind: 'rule' });
        } else if (/^[-*+] /.test(line)) {
            endParagraph();
            blocks.push({ kind: 'bullet', text: line.slice(2), depth });
        } else if (numbered) {
            endParagraph();
            blocks.push({ kind: 'numbered', number: numbered[1], text: numbered[2], depth });
        } else if (line.startsWith('>')) {
            endParagraph();
            blocks.push({ kind: 'quote', text: line.slice(1).trim() });
        } else paragraph.push(line);
    }
    if (code) blocks.push({ kind: 'code', text: code.join('\n') });
    endParagraph();
    return blocks;
}

/** Bold, italic, code and links within a line, as DOM nodes */
export function inlineMarkdown(text) {
    const nodes = [];
    const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*|__[^_]+__)|(\*[^*]+\*|_[^_]+_)|(\[[^\]]+\]\([^)\s]+\))/g;
    let last = 0;
    for (const match of text.matchAll(pattern)) {
        if (match.index > last) nodes.push(text.slice(last, match.index));
        const token = match[0];
        if (match[1]) nodes.push(h('code', {}, token.slice(1, -1)));
        else if (match[2]) nodes.push(h('strong', {}, ...inlineMarkdown(token.slice(2, -2))));
        else if (match[3]) nodes.push(h('em', {}, ...inlineMarkdown(token.slice(1, -1))));
        else {
            const [, label, href] = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
            const safe = /^(https?:|mailto:)/i.test(href) ? href : null;
            nodes.push(safe ? h('a', { href: safe, target: '_blank', rel: 'noopener' }, label) : label);
        }
        last = match.index + token.length;
    }
    if (last < text.length) nodes.push(text.slice(last));
    return nodes;
}

/** Markdown laid out a block at a time */
export function markdownElement(markdown, blocks = markdownBlocks(markdown)) {
    const element = h('div', { class: 'markdown' });
    for (const block of blocks) {
        switch (block.kind) {
            case 'heading': element.append(h(`h${Math.min(block.level + 2, 6)}`, {}, ...inlineMarkdown(block.text))); break;
            case 'paragraph': element.append(h('p', {}, ...inlineMarkdown(block.text))); break;
            case 'bullet': element.append(h('div', { class: 'md-item', style: { paddingLeft: `${block.depth * 1.4}em` } },
                h('span', { class: 'marker' }, block.depth % 2 === 0 ? '•' : '◦'), h('span', {}, ...inlineMarkdown(block.text)))); break;
            case 'numbered': element.append(h('div', { class: 'md-item', style: { paddingLeft: `${block.depth * 1.4}em` } },
                h('span', { class: 'marker' }, `${block.number}.`), h('span', {}, ...inlineMarkdown(block.text)))); break;
            case 'quote': element.append(h('blockquote', {}, ...inlineMarkdown(block.text))); break;
            case 'code': element.append(h('pre', {}, h('code', {}, block.text))); break;
            case 'rule': element.append(h('hr')); break;
        }
    }
    return element;
}

// MARK: editor

const noteIsEmpty = (note) => !note || !note.text?.trim();

/**
 * A small button beside something that can carry a note: an outline when there's none yet, filled once there is.
 * In the players' edition it shows only for shared notes, and only reads them.
 */
export function noteButton({ title, note, onChange, height = 22 }) {
    if (!canEdit && !canSee(note)) return null;
    const empty = noteIsEmpty(note);
    const element = button(icon(empty ? 'noteAdd' : 'note'), {
        color: empty ? 'muted' : 'highlight', pill: false, height,
        title: empty ? t('Add a note') : (note?.shared ? t('Notes (shared with players)') : t('Notes')),
        onClick: () => openNoteEditor(element, { title, note, onChange }),
    });
    element.classList.add('note-button');
    return element;
}

function openNoteEditor(anchor, { title, note, onChange }) {
    let text = note?.text ?? '';
    let shared = note?.shared ?? false;
    let previewing = !noteIsEmpty(note) || !canEdit;
    let current = note ?? null;
    const body = h('div', { class: 'note-body' });
    const save = () => {
        if (!canEdit) return;
        current = text.trim() ? { text, ...(shared ? { shared: true } : {}) } : null;
        onChange(current);
    };
    const tabs = canEdit ? h('div', { class: 'segmented' },
        ...[[false, t('Edit')], [true, t('Preview')]].map(([value, label]) => h('button', {
            type: 'button', class: previewing === value ? 'selected' : '', onclick: () => { previewing = value; render(); },
        }, label))) : null;
    const render = () => {
        tabs?.querySelectorAll('button').forEach((b, i) => b.classList.toggle('selected', (i === 1) === previewing));
        if (previewing) {
            body.replaceChildren(text.trim() ? markdownElement(text) : h('p', { class: 'footnote' }, t('No notes yet')));
            return;
        }
        const area = h('textarea', { spellcheck: 'true', 'aria-label': title }, text);
        area.value = text;
        area.addEventListener('input', () => { text = area.value; save(); });
        body.replaceChildren(area, h('p', { class: 'footnote' }, t('Markdown: **bold**, *italic*, # headings, - lists, > quotes, `code`')));
        setTimeout(() => area.focus());
    };
    const footer = canEdit ? h('div', { class: 'row note-footer' },
        (() => {
            const box = h('input', { type: 'checkbox', checked: shared });
            box.addEventListener('change', () => { shared = box.checked; save(); });
            return h('label', { class: 'row', title: t('Shared notes go out with universes exported for players; others stay yours alone') },
                box, t('Share with players'));
        })(),
        h('span', { class: 'spacer' }),
        h('button', { type: 'button', class: 'destructive', onclick: () => { text = ''; current = null; onChange(null); pop.close(); } },
            t('Delete Note'))) : null;
    const pop = popover(anchor, h('div', { class: 'note-editor' },
        h('div', { class: 'row note-header' }, icon('note'), h('strong', {}, title), h('span', { class: 'spacer' }), tabs),
        body, footer));
    render();
}

// MARK: report

const placeKindNames = { capital: 'Capital', city: 'City', town: 'Town', village: 'Village', spaceport: 'Spaceport',
    landingPad: 'Landing pad', base: 'Base', outpost: 'Outpost', landmark: 'Landmark' };
export const placeKindName = (kind) => t(placeKindNames[kind] ?? kind);

const landmarkTypeNames = { mountain: 'Mountain', volcano: 'Volcano', crater: 'Crater', canyon: 'Canyon', lake: 'Lake',
    sea: 'Sea', river: 'River', waterfall: 'Waterfall', forest: 'Forest', desert: 'Desert', plain: 'Plain', glacier: 'Glacier',
    island: 'Island', cave: 'Cave', ruins: 'Ruins', monument: 'Monument', other: 'Other' };
export const landmarkTypeName = (type) => t(landmarkTypeNames[type] ?? type);

const worldNameIn = (annotations, designation) => annotations?.worlds?.[designation]?.name || designation;

function worldSections(world, systemName, annotations) {
    const sections = [];
    const kind = world.minorPlanet ? t('Minor planet')
        : t({ terrestrial: 'Planet', gasGiant: 'Gas giant', asteroidBelt: 'Asteroid belt' }[world.type]);
    const add = (designation, kindName, depth) => {
        const annotation = annotations?.worlds?.[designation];
        const name = worldNameIn(annotations, designation);
        if (canSee(annotation?.note)) {
            sections.push({ title: name, subtitle: `${kindName} · ${systemName} ${designation}`, note: annotation.note, depth });
        }
        for (const place of annotation?.places ?? []) {
            const note = place.notes ? { text: place.notes, shared: place.notesShared } : null;
            if (canSee(note)) sections.push({ title: place.name, subtitle: `${placeKindName(place.kind)} · ${name}`, note, depth: depth + 1 });
        }
    };
    add(world.designation, kind, 0);
    for (const moon of world.moons) add(moon.designation, t('Moon'), 1);
    return sections;
}

/** Every note on a system: the system, its stars, then each world with its moons and places */
export function systemReport(system, name, annotations) {
    const sections = [];
    if (canSee(annotations?.system?.note)) sections.push({ title: name, subtitle: t('System'), note: annotations.system.note, depth: 0 });
    for (const star of system.stars) {
        const note = annotations?.stars?.[star.estrelaID]?.note;
        if (canSee(note)) {
            sections.push({ title: annotations?.stars?.[star.estrelaID]?.name || `${name} ${star.designation}`,
                subtitle: t('Star %@', star.designation), note, depth: 0 });
        }
    }
    for (const world of system.worlds) sections.push(...worldSections(world, name, annotations));
    return { title: t('%@ notes', name), subtitle: t('System'), sections };
}

/** Every note on one planet, its moons and their places */
export function planetReport(world, systemName, annotations) {
    return { title: t('%@ notes', worldNameIn(annotations, world.designation)), subtitle: `${systemName} ${world.designation}`,
        sections: worldSections(world, systemName, annotations) };
}

/** The gathered notes as they'll print, with a button to print them or save them as a PDF */
export function showNotesReport(report) {
    const date = new Date().toLocaleDateString(locale(), { dateStyle: 'long' });
    const page = h('article', { class: 'notes-page' },
        h('header', {}, h('h1', {}, report.title), h('div', { class: 'meta' }, `${report.subtitle} · ${date}`)),
        report.sections.length ? null : h('p', { class: 'meta' }, isGMEdition
            ? t('No notes yet. Add notes with the note buttons beside stars, worlds, moons and places.')
            : t('There are no shared notes here.')),
        ...report.sections.map((section) => h('section', { style: { marginLeft: `${section.depth * 16}px` } },
            h('div', { class: 'section-title' }, h(section.depth === 0 ? 'h2' : 'h3', {}, section.title),
                h('span', { class: 'meta' }, section.subtitle), h('span', { class: 'spacer' }),
                isGMEdition ? h('span', { class: `share ${section.note.shared ? 'shared' : ''}` },
                    section.note.shared ? t('Shared with players') : t('GM only')) : null),
            markdownElement(section.note.text))));
    let sheet;
    const print = () => printPage(page.cloneNode(true), report.title);
    sheet = showSheet(h('div', { class: 'notes-report' },
        h('div', { class: 'notes-scroll' }, page),
        h('div', { class: 'actions' }, h('span', { class: 'footnote' }, t('%lld notes', report.sections.length)),
            h('span', { class: 'spacer' }),
            h('button', { type: 'button', onclick: () => sheet.close() }, t('Close')),
            h('button', { type: 'button', class: 'default', disabled: !report.sections.length, onclick: print }, t('Print or Save PDF…')))),
    { className: 'plain-sheet notes-sheet' });
}
