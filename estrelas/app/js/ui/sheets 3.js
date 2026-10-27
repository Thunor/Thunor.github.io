//
//  sheets.js
//  Estrelas (web)
//
//  Sheets laid over the app, and the small prompts and menus several views share: renaming from a right-click
//  (RenameModifier.swift).
//

import { h, contextMenu } from './components.js';
import { t } from './i18n.js';
import { canEdit } from '../edition.js';

/** Shows a sheet holding `content`, closed by Escape, its Close button or a click outside */
export function showSheet(content, { className = 'themed-sheet', onClose } = {}) {
    const dialog = h('dialog', { class: className }, content);
    document.body.append(dialog);
    const close = () => dialog.close();
    dialog.addEventListener('close', () => {
        dialog.remove();
        onClose?.();
    });
    dialog.addEventListener('mousedown', (event) => {
        if (event.target === dialog) close();
    });
    dialog.tabIndex = -1;
    dialog.showModal();
    // Focus the sheet itself rather than its first button, so nothing shows a focus ring until the keyboard is used
    dialog.focus();
    return { dialog, close };
}

/** Asks for a new name; resolves to the name, '' to go back to the generated one, or null if cancelled */
export function askForName(what, current) {
    return new Promise((resolve) => {
        const field = h('input', { type: 'text', value: current, 'aria-label': t('Name') });
        let result = null;
        let sheet;
        const form = h('form', {
            onsubmit: (event) => {
                event.preventDefault();
                result = field.value.trim();
                sheet.close();
            },
        },
        h('h2', {}, t('Rename %@', t(what))),
        h('p', { class: 'footnote' }, t('The new name shows wherever the app shows this %@. Leave it empty for the generated name.', t(what))),
        h('label', { class: 'field' }, h('span', {}, t('Name')), field),
        h('div', { class: 'actions' },
            h('button', { type: 'button', onclick: () => sheet.close() }, t('Cancel')),
            h('button', { type: 'submit', class: 'default' }, t('Rename'))));
        sheet = showSheet(form, { className: 'plain-sheet rename', onClose: () => resolve(result) });
        field.select();
    });
}

/**
 * Adds "Rename…" (and "Use Generated Name" once renamed) to an element's right-click menu, in the GM's edition.
 * `onRename` gets the new name, or null to go back to the generated one.
 */
export function renamable(element, { name, isRenamed, what, onRename }) {
    if (!element || !canEdit) return element;
    element.title = element.title ? `${element.title} — ${t('Right-click to rename')}` : t('Right-click to rename');
    return contextMenu(element, () => [
        { title: t('Rename…'), action: async () => {
            const result = await askForName(what, name);
            if (result !== null) onRename(result || null);
        } },
        isRenamed ? { title: t('Use Generated Name'), action: () => onRename(null) } : null,
    ]);
}
