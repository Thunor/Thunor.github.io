//
//  starFieldWindow.js
//  Estrelas (web)
//
//  Which of a universe's star systems the star field draws. Big universes are far more than can be drawn as separate
//  objects, so the field shows the systems nearest the view's pivot, up to a limit, and swaps systems in and out as
//  the pivot moves. The systems are kept in a k-d tree: each node splits its systems at the median along their widest
//  axis. A port of StarFieldWindow.swift.
//

export class StarFieldWindow {
    /** `positions` is a Float32Array of x, y, z per system */
    constructor(positions) {
        this.positions = positions;
        const count = positions.length / 3;
        this.count = count;
        // System indices laid out as an implicit tree: the middle of each range is that node
        this.order = new Int32Array(count);
        for (let i = 0; i < count; i++) this.order[i] = i;
        // The axis each node splits on, at the node's place in `order`
        this.axes = new Uint8Array(count);
        this.build(0, count);
    }

    build(lower, upper) {
        // Iterative over an explicit stack, so a vast catalogue can't overflow the call stack
        const stack = [[lower, upper]];
        const p = this.positions;
        while (stack.length) {
            const [lo, hi] = stack.pop();
            if (hi - lo <= 1) continue;
            const low = [Infinity, Infinity, Infinity], high = [-Infinity, -Infinity, -Infinity];
            for (let i = lo; i < hi; i++) {
                const k = this.order[i] * 3;
                for (let a = 0; a < 3; a++) {
                    if (p[k + a] < low[a]) low[a] = p[k + a];
                    if (p[k + a] > high[a]) high[a] = p[k + a];
                }
            }
            const sx = high[0] - low[0], sy = high[1] - low[1], sz = high[2] - low[2];
            const axis = sx >= sy && sx >= sz ? 0 : (sy >= sz ? 1 : 2);
            const slice = Array.from(this.order.subarray(lo, hi));
            slice.sort((a, b) => p[a * 3 + axis] - p[b * 3 + axis]);
            this.order.set(slice, lo);
            const middle = (lo + hi) >> 1;
            this.axes[middle] = axis;
            stack.push([lo, middle], [middle + 1, hi]);
        }
    }

    position(index) {
        const k = index * 3;
        return [this.positions[k], this.positions[k + 1], this.positions[k + 2]];
    }

    distanceSquared(index, c) {
        const k = index * 3, p = this.positions;
        const dx = p[k] - c[0], dy = p[k + 1] - c[1], dz = p[k + 2] - c[2];
        return dx * dx + dy * dy + dz * dz;
    }

    /**
     * The `limit` systems nearest `centre`, and how far away the farthest of them is. When the universe has no more
     * systems than the limit, that's all of them and the radius is infinite.
     */
    nearest(centre, limit) {
        if (this.count <= limit) return { indices: Array.from({ length: this.count }, (_, i) => i), radius: Infinity };
        if (limit <= 0) return { indices: [], radius: 0 };
        const heap = new NearestHeap(limit);
        const search = (lower, upper) => {
            if (lower >= upper) return;
            const middle = (lower + upper) >> 1;
            const index = this.order[middle];
            heap.offer(index, this.distanceSquared(index, centre));
            const axis = this.axes[middle];
            const gap = centre[axis] - this.positions[index * 3 + axis];
            const near = gap < 0 ? [lower, middle] : [middle + 1, upper];
            const far = gap < 0 ? [middle + 1, upper] : [lower, middle];
            search(near[0], near[1]);
            if (!heap.isFull || gap * gap < heap.farthest) search(far[0], far[1]);
        };
        search(0, this.count);
        return { indices: heap.indices.slice(0, heap.size), radius: heap.size ? Math.sqrt(heap.distances[0]) : 0 };
    }

    /** Every system within `radius` of `centre`, in no particular order */
    within(radius, centre) {
        const found = [];
        const radiusSquared = radius * radius;
        const collect = (lower, upper) => {
            if (lower >= upper) return;
            const middle = (lower + upper) >> 1;
            const index = this.order[middle];
            if (this.distanceSquared(index, centre) <= radiusSquared) found.push(index);
            const axis = this.axes[middle];
            const gap = centre[axis] - this.positions[index * 3 + axis];
            if (gap < 0 || gap * gap <= radiusSquared) collect(lower, middle);
            if (gap >= 0 || gap * gap <= radiusSquared) collect(middle + 1, upper);
        };
        collect(0, this.count);
        return found;
    }
}

/** The nearest systems found so far, farthest at the top so it's the one replaced by anything nearer */
class NearestHeap {
    constructor(capacity) {
        this.capacity = capacity;
        this.indices = new Int32Array(capacity);
        this.distances = new Float64Array(capacity);
        this.size = 0;
    }

    get isFull() {
        return this.size >= this.capacity;
    }

    get farthest() {
        return this.size ? this.distances[0] : Infinity;
    }

    swap(a, b) {
        const i = this.indices[a], d = this.distances[a];
        this.indices[a] = this.indices[b];
        this.distances[a] = this.distances[b];
        this.indices[b] = i;
        this.distances[b] = d;
    }

    offer(index, distanceSquared) {
        if (this.size < this.capacity) {
            let child = this.size++;
            this.indices[child] = index;
            this.distances[child] = distanceSquared;
            while (child > 0) {
                const parent = (child - 1) >> 1;
                if (!(this.distances[parent] < this.distances[child])) break;
                this.swap(parent, child);
                child = parent;
            }
        } else if (distanceSquared < this.distances[0]) {
            this.indices[0] = index;
            this.distances[0] = distanceSquared;
            let parent = 0;
            for (;;) {
                const left = parent * 2 + 1, right = left + 1;
                let largest = parent;
                if (left < this.size && this.distances[left] > this.distances[largest]) largest = left;
                if (right < this.size && this.distances[right] > this.distances[largest]) largest = right;
                if (largest === parent) break;
                this.swap(parent, largest);
                parent = largest;
            }
        }
    }
}
