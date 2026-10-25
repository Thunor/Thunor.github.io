//
//  launcher.js
//  Estrelas (web)
//
//  When the page is served by the Estrelas launcher (launcher/main.go), it checks in every 15 seconds so the launcher
//  knows a page is still open, and quits a minute after the last one closes. Served any other way, the first check
//  finds no launcher and stops.
//

const interval = 15000;

export function keepLauncherAlive() {
    if (!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
    const ping = async () => {
        try {
            const response = await fetch('/__launcher/ping', { cache: 'no-store' });
            if (!response.ok || (await response.text()) !== 'estrelas-launcher') return;
        } catch {
            // The launcher has quit, or the computer is waking; try again later
        }
        setTimeout(ping, interval);
    };
    ping();
}

let available = null;

/** Whether the page is served by the Estrelas launcher, which can fetch TravellerMap's data for it */
export function launcherAvailable() {
    if (available === null) {
        available = /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
            ? fetch('/__launcher/ping', { cache: 'no-store' }).then(async (r) => r.ok && (await r.text()) === 'estrelas-launcher').catch(() => false)
            : Promise.resolve(false);
    }
    return available;
}
