//
//  exportFile.js
//  Estrelas (web)
//
//  Saving exported maps: PNG and JPEG images written where the person picks (or downloaded), and PDFs made through
//  the browser's print dialog, where "Save as PDF" writes the page. A port of ImageExport.swift.
//

import { t } from './i18n.js';

export const formats = [
    { id: 'png', title: 'PNG Image…', type: 'image/png', extension: 'png' },
    { id: 'jpeg', title: 'JPEG Image…', type: 'image/jpeg', extension: 'jpg' },
    { id: 'pdf', title: 'PDF Document…', type: 'application/pdf', extension: 'pdf' },
];

/** A name usable as a file name everywhere */
export const safeFileName = (name) => name.replace(/[/\\:*?"<>|]/g, '-').trim() || 'Estrelas';

/** Writes a canvas as an image file; false if the person cancelled */
export async function saveCanvas(canvas, name, format) {
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, format.type, format.id === 'jpeg' ? 0.9 : undefined));
    if (!blob) throw new Error(t("The map couldn't be drawn for export."));
    return saveBlob(blob, `${safeFileName(name)}.${format.extension}`, format);
}

export async function saveBlob(blob, fileName, format) {
    if (typeof window.showSaveFilePicker === 'function') {
        let handle;
        try {
            handle = await window.showSaveFilePicker({ suggestedName: fileName, id: 'estrelas-exports',
                types: [{ description: t(format.title).replace('…', ''), accept: { [format.type]: [`.${format.extension}`] } }] });
        } catch (error) {
            if (error.name === 'AbortError') return false;
            throw error;
        }
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 60000);
    return true;
}

/**
 * Prints a page holding `content` (an element) alone, with `title` as the document's name, so the print dialog's
 * Save as PDF writes it as a PDF
 */
export function printPage(content, title, { landscape = false } = {}) {
    const area = document.createElement('div');
    area.id = 'print-area';
    area.className = landscape ? 'landscape' : '';
    area.append(content);
    document.body.append(area);
    document.body.classList.add('printing');
    const style = document.createElement('style');
    style.textContent = `@page { size: ${landscape ? 'landscape' : 'portrait'}; margin: 12mm; }`;
    document.head.append(style);
    const previous = document.title;
    document.title = title;
    const cleanUp = () => {
        document.title = previous;
        area.remove();
        style.remove();
        document.body.classList.remove('printing');
    };
    // Images must be decoded before the page is printed
    const images = [...area.querySelectorAll('img')];
    Promise.all(images.map((image) => image.decode?.().catch(() => {}))).then(() => {
        window.print();
        cleanUp();
    });
}
