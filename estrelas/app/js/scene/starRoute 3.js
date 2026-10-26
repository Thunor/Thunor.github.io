//
//  starRoute.js
//  Estrelas (web)
//
//  Plans routes through a universe's star systems: between each pair of waypoints, the route with the fewest
//  hops (and of those, the shortest) where no hop is longer than the ship's range. A port of StarRoute.swift.
//
//  A route is { legs: [{ from, to, hops: [{ from, to, parsecs }] | null }] }, by index into the universe's systems.
//

/** Most systems a single leg's search looks at before giving up, so a hopeless search in a vast catalogue ends */
const searchLimit = 250000;

/** The route through `waypoints` in order, travelling at most `range` parsecs at a time */
export function planRoute(waypoints, window, parsecsPerUnit, range) {
    const legs = [];
    for (let i = 0; i + 1 < waypoints.length; i++) {
        const from = waypoints[i], to = waypoints[i + 1];
        legs.push({ from, to, hops: path(from, to, window, parsecsPerUnit, range) });
    }
    return { legs };
}

export const routeHops = (route) => route.legs.flatMap((leg) => leg.hops ?? []);
export const routeIsComplete = (route) => route.legs.every((leg) => leg.hops !== null);
export const routeParsecs = (route) => routeHops(route).reduce((sum, hop) => sum + hop.parsecs, 0);

/** The range in scene units, a hair over, so a hop of exactly the range isn't lost to rounding */
export function rangeInUnits(range, parsecsPerUnit) {
    return Math.fround(Math.fround(range / Math.max(parsecsPerUnit, 1.1920929e-7)) * 1.0001);
}

const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/**
 * A* over the systems, ordering routes by hops and then distance. The heuristic, the hops needed at full range and
 * then the straight-line distance, never overestimates, so the first route to reach the goal is the best.
 */
function path(start, goal, window, parsecsPerUnit, parsecRange) {
    if (start === goal) return [];
    const range = rangeInUnits(parsecRange, parsecsPerUnit);
    const target = window.position(goal);
    const estimate = (index) => {
        const d = distance(window.position(index), target);
        return { hops: Math.ceil(d / range), distance: d };
    };
    const best = new Map([[start, { hops: 0, distance: 0 }]]);
    const previous = new Map();
    const open = new OpenSet();
    const first = estimate(start);
    open.push({ index: start, hops: 0, distance: 0, estimatedHops: first.hops, estimatedDistance: first.distance });
    let expanded = 0;
    for (let node = open.pop(); node; node = open.pop()) {
        const known = best.get(node.index);
        if (!known || known.hops !== node.hops || known.distance !== node.distance) continue;
        if (node.index === goal) {
            const hops = [];
            let current = goal;
            while (previous.has(current)) {
                const before = previous.get(current);
                hops.push({ from: before, to: current, parsecs: distance(window.position(before), window.position(current)) * parsecsPerUnit });
                current = before;
            }
            return hops.reverse();
        }
        expanded += 1;
        if (expanded >= searchLimit) return null;
        const here = window.position(node.index);
        for (const neighbour of window.within(range, here)) {
            if (neighbour === node.index) continue;
            const hops = node.hops + 1;
            const total = node.distance + distance(here, window.position(neighbour));
            const seen = best.get(neighbour);
            if (seen && (seen.hops < hops || (seen.hops === hops && seen.distance <= total))) continue;
            best.set(neighbour, { hops, distance: total });
            previous.set(neighbour, node.index);
            const rest = estimate(neighbour);
            open.push({ index: neighbour, hops, distance: total, estimatedHops: hops + rest.hops,
                estimatedDistance: total + rest.distance });
        }
    }
    return null;
}

const precedes = (a, b) => a.estimatedHops < b.estimatedHops
    || (a.estimatedHops === b.estimatedHops && a.estimatedDistance < b.estimatedDistance);

/** Binary min-heap of nodes by estimated total */
class OpenSet {
    constructor() {
        this.nodes = [];
    }

    push(node) {
        const nodes = this.nodes;
        nodes.push(node);
        let child = nodes.length - 1;
        while (child > 0) {
            const parent = (child - 1) >> 1;
            if (!precedes(nodes[child], nodes[parent])) break;
            [nodes[child], nodes[parent]] = [nodes[parent], nodes[child]];
            child = parent;
        }
    }

    pop() {
        const nodes = this.nodes;
        if (!nodes.length) return null;
        [nodes[0], nodes[nodes.length - 1]] = [nodes[nodes.length - 1], nodes[0]];
        const top = nodes.pop();
        let parent = 0;
        for (;;) {
            const left = parent * 2 + 1, right = left + 1;
            let smallest = parent;
            if (left < nodes.length && precedes(nodes[left], nodes[smallest])) smallest = left;
            if (right < nodes.length && precedes(nodes[right], nodes[smallest])) smallest = right;
            if (smallest === parent) break;
            [nodes[parent], nodes[smallest]] = [nodes[smallest], nodes[parent]];
            parent = smallest;
        }
        return top;
    }
}
