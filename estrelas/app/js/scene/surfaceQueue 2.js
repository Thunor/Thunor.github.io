//
//  surfaceQueue.js
//  Estrelas (web)
//
//  The planetary view's surfaces (globes, cloud layers, gas giant and moon textures) are generated a few at a time, in
//  the order the view wants them: the principal world first, then the others out from the star, with any world the
//  camera zooms to moved to the front. A port of SurfaceQueue.swift; each planetary view has a queue of its own.
//

export class SurfaceQueue {
    /** `concurrency`: how many surfaces are drawn at once; each already spreads its own work over the workers */
    constructor(concurrency = 2) {
        this.concurrency = concurrency;
        /** Each world's place in the queue, lowest first; worlds moved to the front get ever lower ones */
        this.ranks = new Map();
        this.frontRank = -1;
        this.waiting = [];
        this.arrivals = 0;
        this.running = 0;
        this.cleared = false;
    }

    /** The order the worlds' surfaces should be drawn in */
    order(worlds) {
        this.ranks = new Map();
        worlds.forEach((world, index) => {
            if (!this.ranks.has(world)) this.ranks.set(world, index);
        });
    }

    /** Puts a world's surfaces ahead of everything else still waiting */
    moveToFront(world) {
        this.ranks.set(world, this.frontRank);
        this.frontRank -= 1;
    }

    /** Drops all the work still waiting, e.g. when the planetary view closes. Work already running finishes. */
    clear() {
        this.cleared = true;
        const dropped = this.waiting;
        this.waiting = [];
        for (const entry of dropped) entry.resolve(false);
    }

    /** Runs `work` (which returns a promise) once it's `world`'s turn; null if the queue was cleared before then */
    async run(world, work) {
        if (!(await this.waitForTurn(world))) return null;
        try {
            return await work();
        } finally {
            this.finish();
        }
    }

    waitForTurn(world) {
        if (this.cleared) return Promise.resolve(false);
        if (this.running < this.concurrency) {
            this.running += 1;
            return Promise.resolve(true);
        }
        this.arrivals += 1;
        const arrival = this.arrivals;
        return new Promise((resolve) => this.waiting.push({ world, arrival, resolve }));
    }

    /** Hands the turn on to the most wanted work waiting */
    finish() {
        const rank = (world) => this.ranks.get(world) ?? Number.MAX_SAFE_INTEGER;
        let next = -1;
        this.waiting.forEach((entry, index) => {
            if (next < 0) {
                next = index;
                return;
            }
            const best = this.waiting[next];
            if (rank(entry.world) < rank(best.world) || (rank(entry.world) === rank(best.world) && entry.arrival < best.arrival)) {
                next = index;
            }
        });
        if (next < 0) {
            this.running -= 1;
            return;
        }
        this.waiting.splice(next, 1)[0].resolve(true);
    }
}
