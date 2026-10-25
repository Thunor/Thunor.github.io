//
//  components.js
//  Estrelas (web)
//
//  The panels and controls the interface is built from, each drawn in the active interface style (Theme.swift,
//  EstrelaStyle.swift, RetroSpace.swift, MacOSStyle.swift): titled panels, buttons, toggles, section headers, data
//  rows and strips, plus the small pieces several views share (popovers, context menus, prompts).
//  Colours are theme roles ('primary', 'highlight'…) or any CSS colour.
//

import { t } from './i18n.js';

const roles = ['primary', 'accent', 'highlight', 'label', 'control', 'info', 'muted', 'alert', 'background'];

export function cssColor(color) {
    return roles.includes(color) ? `var(--${color})` : color;
}

/** A colour at some opacity */
export function faded(color, opacity) {
    return `color-mix(in srgb, ${cssColor(color)} ${Math.round(opacity * 100)}%, transparent)`;
}

export function style() {
    const value = document.body.dataset.style;
    return value === 'retroSpace' || value === 'macOS' ? value : 'estrela';
}

/** Makes an element: h('div', { class: 'x', onclick }, child, 'text', …) */
export function h(tag, attributes = {}, ...children) {
    const element = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes ?? {})) {
        if (value === undefined || value === null || value === false) continue;
        if (key.startsWith('on') && typeof value === 'function') element.addEventListener(key.slice(2), value);
        else if (key === 'style' && typeof value === 'object') {
            for (const [property, setting] of Object.entries(value)) {
                if (property.startsWith('--')) element.style.setProperty(property, setting);
                else element.style[property] = setting;
            }
        }
        else if (key === 'class') element.className = value;
        else if (value === true) element.setAttribute(key, '');
        else element.setAttribute(key, value);
    }
    append(element, children);
    return element;
}

function append(element, children) {
    for (const child of children.flat(Infinity)) {
        if (child === null || child === undefined || child === false) continue;
        element.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
}

// MARK: SVG decorations, redrawn whenever their element changes size

const svgNS = 'http://www.w3.org/2000/svg';
const painters = new WeakMap();
const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) painters.get(entry.target)?.();
});

/** Overlays an SVG on `element` and calls draw(svg, width, height) at every size */
function decorate(element, draw, behind = false) {
    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('decoration');
    if (behind) svg.classList.add('behind');
    element.prepend(svg);
    const paint = () => {
        const width = element.offsetWidth, height = element.offsetHeight;
        if (!width || !height) return;
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.replaceChildren();
        draw(svg, width, height);
    };
    painters.set(element, paint);
    resizeObserver.observe(element);
    return element;
}

function path(svg, d, attributes) {
    const element = document.createElementNS(svgNS, 'path');
    element.setAttribute('d', d);
    for (const [key, value] of Object.entries(attributes)) {
        // Colours go through style, since presentation attributes can't use CSS variables
        if (key === 'fill' || key === 'stroke') element.style.setProperty(key, value);
        else element.setAttribute(key, value);
    }
    if (attributes.class === 'glow') element.style.filter = `drop-shadow(0 0 3px ${attributes.stroke})`;
    svg.append(element);
    return element;
}

/** A rectangle with its top-leading (and bottom-trailing) corners cut off at 45° */
function chamfer(width, height, cut, both = true, inset = 0) {
    cut = Math.min(cut, width / 2, height / 2);
    const trailing = both ? cut : 0;
    const l = inset, t = inset, r = width - inset, b = height - inset;
    return `M${l + cut},${t} L${r},${t} L${r},${b - trailing} L${r - trailing},${b} L${l},${b} L${l},${t + cut} Z`;
}

function brackets(width, height, cut, length, inset = 1) {
    const l = inset, t = inset, r = width - inset, b = height - inset;
    return `M${l},${t + cut + length} L${l},${t + cut} L${l + cut},${t} L${l + cut + length},${t} ` +
        `M${r},${b - cut - length} L${r},${b - cut} L${r - cut},${b} L${r - cut - length},${b}`;
}

/** The chamfered glass, outline and glowing corner brackets of an Estrela frame */
export function estrelaFrame(element, color, cut = 16, bracketLength = 26, glass = true) {
    return decorate(element, (svg, width, height) => {
        path(svg, chamfer(width, height, cut), { fill: glass ? 'url(#estrela-glass)' : 'var(--background)' });
        path(svg, chamfer(width, height, cut, true, 0.5), { fill: 'none', stroke: faded(color, 0.45), 'stroke-width': 1 });
        path(svg, brackets(width, height, cut, bracketLength), {
            fill: 'none', stroke: cssColor(color), 'stroke-width': 2.5, 'stroke-linecap': 'square', class: 'glow',
        });
    }, true);
}

/** The RetroSpace elbow: a top bar joined to a left bar by a sweeping curve (flipped: left bar to a bottom bar) */
function elbow(element, color, sidebarWidth, barHeight, flipped = false) {
    return decorate(element, (svg, w, h) => {
        const outer = Math.min(h, sidebarWidth * 1.4);
        const inner = Math.min(barHeight, sidebarWidth) * 0.8;
        let d = `M0,${h} L0,${outer} A${outer},${outer} 0 0 1 ${outer},0 L${w},0 L${w},${barHeight} ` +
            `L${sidebarWidth + inner},${barHeight} A${inner},${inner} 0 0 0 ${sidebarWidth},${barHeight + inner} L${sidebarWidth},${h} Z`;
        const element2 = path(svg, d, { fill: cssColor(color) });
        if (flipped) element2.setAttribute('transform', `matrix(1 0 0 -1 0 ${h})`);
    });
}

// MARK: panel

/** A titled panel framed in the active style */
export function panel({ title, color = 'primary', segments = ['accent', 'label', 'control'], className = '' }, ...content) {
    const body = h('div', { class: 'panel-content' }, ...content);
    if (style() === 'macOS') {
        // The HIG look keeps panels plain: a glass card with the title as a headline
        const element = h('section', { class: `panel macos-panel ${className}` }, h('h3', { class: 'macos-title' }, title), body);
        element.panelBody = body;
        return element;
    }
    if (style() === 'retroSpace') {
        const top = h('div', { class: 'retro-elbow-top' },
            h('div', { class: 'retro-title' },
                h('span', { class: 'retro-title-text', style: { color: cssColor(color) } }, title),
                h('span', { class: 'retro-title-cap', style: { background: cssColor(color) } })));
        elbow(top, color, 26, 18);
        const sidebar = h('div', { class: 'retro-sidebar' },
            segments.map((segment, index) => h('div', {
                class: index === segments.length - 1 ? 'retro-segment last' : 'retro-segment',
                style: { background: cssColor(segment) },
            })));
        const bottom = h('div', { class: 'retro-elbow-bottom' });
        elbow(bottom, color, 26, 18 * 0.6, true);
        const element = h('section', { class: `panel retro-panel ${className}` }, top,
            h('div', { class: 'retro-middle' }, sidebar, body), bottom);
        element.panelBody = body;
        return element;
    }
    const header = h('div', { class: 'estrela-title-row' },
        h('span', { class: 'estrela-title', style: { color: cssColor(color), '--glow': faded(color, 0.7) } }, title),
        h('span', { class: 'estrela-indicators' }, segments.map((segment) => h('i', { style: { background: cssColor(segment) } }))));
    const rule = h('div', { class: 'estrela-rule', style: { background: `linear-gradient(to right, ${faded(color, 0.8)}, transparent)` } });
    const element = h('section', { class: `panel estrela-panel ${className}` }, header, rule, body, ticks(color));
    estrelaFrame(element, color);
    element.panelBody = body;
    return element;
}

function ticks(color, count = 8, lit = 5) {
    return h('div', { class: 'estrela-ticks' },
        Array.from({ length: count }, (_, i) => h('i', { style: { background: faded(color, i < lit ? 0.8 : 0.2) } })));
}

// MARK: controls

/** A button in the active style: a pill, or a block cut or rounded only on its leading side */
export function button(label, { color = 'accent', pill = true, height = 26, onClick, disabled = false, title, className = '', grow = false } = {}) {
    const element = h('button', {
        type: 'button', class: `styled-button ${pill ? 'pill' : 'block'} ${grow ? 'grow' : ''} ${className}`, title,
        disabled, onclick: onClick, style: { '--height': `${height}px`, '--color': cssColor(color) },
    }, h('span', { class: 'label' }, label));
    if (style() === 'estrela') {
        decorate(element, (svg, width, h2) => {
            const cut = height * 0.3;
            path(svg, chamfer(width, h2, cut, pill), { class: 'button-fill', fill: 'var(--color)' });
            path(svg, chamfer(width, h2, cut, pill, 0.5), { fill: 'none', stroke: faded('var(--color)', 0.8), 'stroke-width': 1 });
        }, true);
    }
    return element;
}

/** An on/off block in the active style: lit when on, dimmed when off */
export function toggle({ title, isOn, color = 'control', onChange, help }) {
    if (style() === 'macOS') {
        // A row with its title leading and a small switch trailing
        const input = h('input', { type: 'checkbox', role: 'switch', checked: isOn, style: { '--color': cssColor(color) } });
        input.addEventListener('change', () => onChange(input.checked));
        return h('label', { class: 'macos-toggle', title: help }, h('span', {}, title), input);
    }
    const retro = style() === 'retroSpace';
    const shown = isOn ? cssColor(color) : faded(color, retro ? 0.35 : 0.5);
    const lamp = h('i', { class: 'lamp', style: retro ? { background: isOn ? '#000' : faded(color, 0.6) } : {} });
    const element = button([lamp, h('span', { class: 'toggle-title' }, title)], {
        color: shown, pill: false, className: `toggle ${isOn ? 'on' : 'off'}`, grow: true,
        onClick: () => onChange(!isOn), title: help,
    });
    element.setAttribute('aria-pressed', String(isOn));
    return element;
}

/** A section heading in the active style */
export function sectionHeader(title, color = 'label') {
    if (style() === 'macOS') return h('div', { class: 'section-header macos', style: { '--color': cssColor(color) } }, title);
    if (style() === 'retroSpace') {
        return h('div', { class: 'section-header retro', style: { '--color': cssColor(color) } },
            h('i', { class: 'cap' }), h('span', {}, title), h('i', { class: 'bar' }));
    }
    return h('div', { class: 'section-header estrela', style: { '--color': cssColor(color) } },
        h('i', { class: 'diamond' }), h('span', {}, title), h('i', { class: 'rule' }), ticks(color, 3, 3));
}

/** A label and value readout in the active style */
export function dataRow(label, value, valueColor = 'primary') {
    return h('div', { class: 'data-row' },
        h('span', { class: 'data-label' }, label),
        h('span', { class: 'data-value', style: { color: cssColor(valueColor) } }, value));
}

/** A horizontal strip of controls, like the time controls */
export function strip(...content) {
    if (style() === 'macOS') return h('div', { class: 'strip macos-strip' }, ...content);
    if (style() === 'retroSpace') {
        return h('div', { class: 'strip retro-strip' }, h('i', { class: 'strip-cap' }), ...content);
    }
    const element = h('div', { class: 'strip estrela-strip' }, ...content);
    decorate(element, (svg, width, height) => {
        path(svg, chamfer(width, height, 12), { fill: 'var(--background)' });
        path(svg, chamfer(width, height, 12, true, 0.5), { fill: 'none', stroke: faded('primary', 0.45), 'stroke-width': 1 });
        path(svg, brackets(width, height, 12, 20), { fill: 'none', stroke: 'var(--primary)', 'stroke-width': 2.5, class: 'glow' });
    }, true);
    return element;
}

/** An SVG icon by name */
export function icon(name) {
    const paths = {
        info: 'M12 7.2a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8ZM10.4 9.6h2.8V19h-2.8z',
        backward: 'M11 6v12L3 12zM21 6v12l-8-6z',
        forward: 'M13 6v12l8-6zM3 6v12l8-6z',
        minus: 'M10 3a7 7 0 1 0 4.2 12.6l5.1 5.1 1.4-1.4-5.1-5.1A7 7 0 0 0 10 3Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10ZM7 9h6v2H7z',
        plus: 'M10 3a7 7 0 1 0 4.2 12.6l5.1 5.1 1.4-1.4-5.1-5.1A7 7 0 0 0 10 3Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10ZM9 7h2v2h2v2h-2v2H9v-2H7V9h2z',
        dice: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM7.5 15a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',
        trash: 'M9 3h6l1 2h4v2H4V5h4zM6 8h12l-1 13H7z',
        check: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 14.2-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4z',
        circle: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Z',
        sparkles: 'M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8zM19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9zM5 15l.7 1.6 1.6.7-1.6.7L5 19.6l-.7-1.6-1.6-.7 1.6-.7z',
        stepMinus: 'M5 11h14v2H5z',
        stepPlus: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z',
        search: 'M10 3a7 7 0 1 0 4.2 12.6l5.1 5.1 1.4-1.4-5.1-5.1A7 7 0 0 0 10 3Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z',
        clear: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-3.5 5.1L12 10.6l3.5-3.5 1.4 1.4-3.5 3.5 3.5 3.5-1.4 1.4-3.5-3.5-3.5 3.5-1.4-1.4 3.5-3.5-3.5-3.5z',
        xmark: 'M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4z',
        note: 'M5 3h10l4 4v14H5zm2 2v14h10V8h-3V5zm2 6h6v2H9zm0 4h6v2H9z',
        noteAdd: 'M5 3h10l4 4v6h-2V8h-3V5H7v14h6v2H5zm9 12h2v-2h2v2h2v2h-2v2h-2v-2h-2z',
        document: 'M6 2h9l5 5v15H6zm2 2v16h10V8h-4V4zm2 7h6v1.5h-6zm0 3h6v1.5h-6zm0 3h4v1.5h-4z',
        route: 'M6 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm12 12a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM6 11c0 3 2 4 6 4s6 1 6 3h-2c0-1-1-1.2-4-1.2-5 0-8-1.6-8-5.8z',
        clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm-1 3h2v5.4l3.6 2.1-1 1.7L11 13.6z',
        chevronLeft: 'M15.4 4 7.4 12l8 8 1.4-1.4L10.2 12l6.6-6.6z',
        chevronRight: 'M8.6 4 7.2 5.4 13.8 12l-6.6 6.6L8.6 20l8-8z',
        pin: 'M12 2a6 6 0 0 1 6 6c0 4.5-6 12-6 12S6 12.5 6 8a6 6 0 0 1 6-6Zm0 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z',
        export: 'M12 2l5 5-1.4 1.4L13 5.8V15h-2V5.8L8.4 8.4 7 7zM4 13h2v6h12v-6h2v8H4z',
        city: 'M3 21V9l6-3v4l6-3v14h2V11h4v10z',
        print: 'M6 2h12v5H6zM4 8h16a2 2 0 0 1 2 2v7h-4v4H6v-4H2v-7a2 2 0 0 1 2-2Zm4 8v3h8v-3z',
        copy: 'M8 2h11a1 1 0 0 1 1 1v13h-2V4H8zM4 6h11a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm1 2v12h9V8z',
        cloud: 'M7 18a5 5 0 0 1-.6-9.96A6 6 0 0 1 18 9a4.5 4.5 0 0 1 0 9z',
        hurricane: 'M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-1-7c-4 1-7 4.5-7 9 2-3 4.5-4 7-4V2Zm2 20c4-1 7-4.5 7-9-2 3-4.5 4-7 4z',
        fit: 'M4 4h6v2H7.4l3.3 3.3-1.4 1.4L6 7.4V10H4zm16 0v6h-2V7.4l-3.3 3.3-1.4-1.4L16.6 6H14V4zM4 20v-6h2v2.6l3.3-3.3 1.4 1.4L7.4 18H10v2zm16 0h-6v-2h2.6l-3.3-3.3 1.4-1.4 3.3 3.3V14h2z',
        warning: 'M12 2 1 21h22zm-1 7h2v6h-2zm0 8h2v2h-2z',
        refresh: 'M12 4a8 8 0 0 1 7.4 5H17v2h6V5h-2v2.3A10 10 0 1 0 22 12h-2a8 8 0 1 1-8-8Z',
        cube: 'M12 2 3 7v10l9 5 9-5V7zm0 2.3L18.6 8 12 11.7 5.4 8zM5 9.7l6 3.4v6.6l-6-3.3zm8 10V13.1l6-3.4v6.7z',
        hex: 'M7 3h10l5 9-5 9H7l-5-9zm1.2 2-3.9 7 3.9 7h7.6l3.9-7-3.9-7z',
        map: 'M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2zm2 1.5v12.4l4-1.3V5.2zm6-1.3v12.4l4 1.3V6.5z',
        globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2c1 0 2.3 2 2.8 5H9.2C9.7 6 11 4 12 4Zm-2.9.6C8.4 6 8 7.4 7.8 9H4.9a8 8 0 0 1 4.2-4.4Zm5.8 0A8 8 0 0 1 19.1 9h-2.9c-.2-1.6-.6-3-1.3-4.4ZM4.3 11h3.4a20 20 0 0 0 0 2H4.3a8 8 0 0 1 0-2Zm5.4 0h4.6a18 18 0 0 1 0 2H9.7a18 18 0 0 1 0-2Zm6.6 0h3.4a8 8 0 0 1 0 2h-3.4a20 20 0 0 0 0-2ZM4.9 15h2.9c.2 1.6.6 3 1.3 4.4A8 8 0 0 1 4.9 15Zm4.3 0h5.6c-.5 3-1.8 5-2.8 5s-2.3-2-2.8-5Zm7 0h2.9a8 8 0 0 1-4.2 4.4c.7-1.4 1.1-2.8 1.3-4.4Z',
    };
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS(svgNS, 'path');
    p.setAttribute('d', paths[name] ?? '');
    p.setAttribute('fill', 'currentColor');
    p.setAttribute('fill-rule', 'evenodd');
    svg.append(p);
    return svg;
}

// MARK: shared pieces

/** A small panel beside `anchor`, closed by clicking elsewhere or Escape; returns { element, close } */
export function popover(anchor, content, { className = '', onClose } = {}) {
    document.querySelector('.popover')?.closeSelf?.();
    const element = h('div', { class: `popover ${className}`, role: 'dialog' }, content);
    const host = anchor.closest('dialog') ?? document.body;
    host.append(element);
    const place = () => {
        const rect = anchor.getBoundingClientRect();
        const hostRect = host === document.body ? { left: 0, top: 0 } : host.getBoundingClientRect();
        const width = element.offsetWidth, height = element.offsetHeight;
        let left = rect.left - width - 8;
        if (left < 8) left = Math.min(rect.right + 8, window.innerWidth - width - 8);
        const top = Math.min(Math.max(rect.top - 8, 8), window.innerHeight - height - 8);
        element.style.left = `${left - hostRect.left}px`;
        element.style.top = `${top - hostRect.top}px`;
    };
    place();
    const onDown = (event) => {
        if (!element.contains(event.target) && !anchor.contains(event.target)) close();
    };
    const onKey = (event) => {
        if (event.key === 'Escape') {
            event.stopPropagation();
            event.preventDefault();
            close();
        }
    };
    const close = () => {
        if (!element.isConnected) return;
        element.remove();
        document.removeEventListener('pointerdown', onDown, true);
        document.removeEventListener('keydown', onKey, true);
        onClose?.();
    };
    element.closeSelf = close;
    setTimeout(() => {
        document.addEventListener('pointerdown', onDown, true);
        document.addEventListener('keydown', onKey, true);
    });
    return { element, close };
}

/** A right-click menu of { title, action } items (null items are skipped) */
export function contextMenu(target, items) {
    target.addEventListener('contextmenu', (event) => {
        const shown = items().filter(Boolean);
        if (!shown.length) return;
        event.preventDefault();
        document.querySelector('.context-menu')?.remove();
        const menu = h('div', { class: 'context-menu', role: 'menu' }, shown.map((item) =>
            h('button', { type: 'button', role: 'menuitem', onclick: () => { menu.remove(); item.action(); } }, item.title)));
        (target.closest('dialog') ?? document.body).append(menu);
        menu.style.left = `${Math.min(event.clientX, window.innerWidth - menu.offsetWidth - 4)}px`;
        menu.style.top = `${Math.min(event.clientY, window.innerHeight - menu.offsetHeight - 4)}px`;
        const dismiss = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('pointerdown', dismiss, true);
            }
        };
        setTimeout(() => document.addEventListener('pointerdown', dismiss, true));
    });
    return target;
}

// MARK: copying a data sheet as text

/**
 * The lines of plain text a data sheet's rows and headers stand for, in the order they're laid out: a blank line and
 * the title in capitals for each section header, "Label: value" for each data row, and any element marked with
 * `data-copy` for its own line. Controls inside `.copy-hidden` are left out.
 */
export function sheetText(title, root) {
    const lines = [title.toUpperCase()];
    const walk = (element) => {
        for (const child of element.children) {
            if (child.classList.contains('copy-hidden') || child.tagName === 'BUTTON' && !child.dataset.copy) continue;
            if (child.dataset.copy) {
                lines.push(child.dataset.copy);
            } else if (child.classList.contains('section-header')) {
                if (lines[lines.length - 1] !== '') lines.push('');
                lines.push((child.querySelector('span')?.textContent ?? child.textContent).trim().toUpperCase());
            } else if (child.classList.contains('data-row')) {
                const label = child.querySelector('.data-label')?.textContent.trim() ?? '';
                const value = child.querySelector('.data-value')?.textContent.trim() ?? '';
                lines.push(`${label}: ${value}`);
            } else {
                walk(child);
            }
        }
    };
    walk(root);
    return lines.join('\n') + '\n';
}

/** Copies a data sheet's text to the clipboard, saying so for a moment once it has */
export function copyButton(title, root) {
    let control;
    control = button([icon('copy'), t('Copy')], {
        color: 'control', title: t('Copy all of this information to the clipboard as text'),
        onClick: async () => {
            try {
                await navigator.clipboard.writeText(sheetText(title, typeof root === 'function' ? root() : root));
                control.querySelector('.label')?.replaceChildren(t('Copied'));
                setTimeout(() => control.querySelector('.label')?.replaceChildren(t('Copy')), 1500);
            } catch (error) {
                console.warn(`Couldn't copy: ${error}`);
            }
        },
    });
    return control;
}
