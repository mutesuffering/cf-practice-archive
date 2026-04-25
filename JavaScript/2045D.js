"use strict";

const fs = require('fs');

/**
 * Problem: Codeforces 2045D
 * 
 * Optimized version for Node.js to avoid TLE.
 * Uses Number (double precision) instead of BigInt for performance.
 * Double precision is safe for values up to 2^53 (~9e15).
 * Segment tree is implemented iteratively to avoid recursion overhead.
 */

function solve() {
    const buffer = fs.readFileSync(0);
    let offset = 0;

    function nextString() {
        while (offset < buffer.length && buffer[offset] <= 32) offset++;
        let start = offset;
        while (offset < buffer.length && buffer[offset] > 32) offset++;
        return buffer.toString('utf8', start, offset);
    }

    function nextInt() {
        return parseInt(nextString());
    }

    const n = nextInt();
    if (isNaN(n)) return;
    const d = nextInt();
    const swim_cost = nextInt();
    const fly_cost = nextInt();
    const wait_cost = nextInt();

    if (fly_cost < swim_cost) {
        process.stdout.write((n - 1) * fly_cost + "\n");
        return;
    }

    const points = new Float64Array(n);
    for (let i = 0; i < n; i++) points[i] = nextInt();

    const prefix_sums = new Float64Array(n + 1);
    for (let i = 0; i < n; i++) {
        prefix_sums[i + 1] = prefix_sums[i] + points[i] - d;
    }

    // Fast coordinate compression
    const coords_raw = new Float64Array((n + 1) * 3 + 1);
    let c_idx = 0;
    for (let i = 0; i <= n; i++) {
        coords_raw[c_idx++] = prefix_sums[i];
        coords_raw[c_idx++] = prefix_sums[i] + d;
        coords_raw[c_idx++] = prefix_sums[i] + 2 * d;
    }
    const INF = 1e15; // Sufficiently large for Number
    coords_raw[c_idx++] = -INF;
    
    const coords_sorted = coords_raw.subarray(0, c_idx).sort();
    let unique_count = 0;
    for (let i = 0; i < c_idx; i++) {
        if (i === 0 || coords_sorted[i] !== coords_sorted[i - 1]) {
            coords_sorted[unique_count++] = coords_sorted[i];
        }
    }
    const coords = coords_sorted.subarray(0, unique_count);

    function get_coord_index(x) {
        let low = 0, high = unique_count - 1;
        while (low <= high) {
            let mid = (low + high) >>> 1;
            if (coords[mid] < x) low = mid + 1;
            else high = mid - 1;
        }
        return low;
    }

    const TREE_SIZE = 1 << Math.ceil(Math.log2(unique_count));
    const sum_tree = new Float64Array(TREE_SIZE * 2);
    const min_prefix_tree = new Float64Array(TREE_SIZE * 2);

    function update_tree(i, x) {
        i += TREE_SIZE;
        sum_tree[i] += x;
        min_prefix_tree[i] += x;
        for (i >>= 1; i > 0; i >>= 1) {
            const left = i << 1;
            const right = left | 1;
            sum_tree[i] = sum_tree[left] + sum_tree[right];
            const right_min = sum_tree[left] + min_prefix_tree[right];
            min_prefix_tree[i] = min_prefix_tree[left] < right_min ? min_prefix_tree[left] : right_min;
        }
    }

    // Iterative range query for prefix min structure
    function query_min_prefix(l, r) {
        let l_sum = 0, l_min = INF * 2;
        let r_sum = 0, r_min = INF * 2;
        
        let ql = l + TREE_SIZE;
        let qr = r + TREE_SIZE;
        
        // Iterative segment tree range query logic
        const l_nodes = [];
        const r_nodes = [];
        
        while (ql < qr) {
            if (ql & 1) l_nodes.push(ql++);
            if (qr & 1) r_nodes.push(--qr);
            ql >>= 1;
            qr >>= 1;
        }
        
        let res_sum = 0;
        let res_min = INF * 2;
        
        // Merge from left to right
        for (let i = 0; i < l_nodes.length; i++) {
            const node = l_nodes[i];
            const next_min = res_sum + min_prefix_tree[node];
            if (min_prefix_tree[node] < res_min) {} // Placeholder for clear logic
            res_min = Math.min(res_min, next_min);
            res_sum += sum_tree[node];
        }
        for (let i = r_nodes.length - 1; i >= 0; i--) {
            const node = r_nodes[i];
            const next_min = res_sum + min_prefix_tree[node];
            res_min = Math.min(res_min, next_min);
            res_sum += sum_tree[node];
        }
        
        return { sum: res_sum, min_prefix: res_min };
    }

    // Faster iterative query that only returns min_prefix
    function query_only_min(l, r) {
        let ql = l + TREE_SIZE;
        let qr = r + TREE_SIZE;
        let l_idx = 0, r_idx = 0;
        const l_stack = new Int32Array(64);
        const r_stack = new Int32Array(64);
        
        while (ql < qr) {
            if (ql & 1) l_stack[l_idx++] = ql++;
            if (qr & 1) r_stack[r_idx++] = --qr;
            ql >>= 1;
            qr >>= 1;
        }
        
        let res_sum = 0;
        let res_min = INF * 2;
        
        for (let i = 0; i < l_idx; i++) {
            const node = l_stack[i];
            const node_min = res_sum + min_prefix_tree[node];
            if (node_min < res_min) res_min = node_min;
            res_sum += sum_tree[node];
        }
        for (let i = r_idx - 1; i >= 0; i--) {
            const node = r_stack[i];
            const node_min = res_sum + min_prefix_tree[node];
            if (node_min < res_min) res_min = node_min;
            res_sum += sum_tree[node];
        }
        return res_min;
    }

    function query_only_sum(l, r) {
        let ql = l + TREE_SIZE;
        let qr = r + TREE_SIZE;
        let sum = 0;
        while (ql < qr) {
            if (ql & 1) sum += sum_tree[ql++];
            if (qr & 1) sum += sum_tree[--qr];
            ql >>= 1;
            qr >>= 1;
        }
        return sum;
    }

    update_tree(0, INF);
    update_tree(get_coord_index(0), -INF);
    update_tree(get_coord_index(0) + 1, INF);

    const dp = new Float64Array(n + 1);

    for (let i = 1; i < n; i++) {
        dp[i] = query_only_min(0, get_coord_index(prefix_sums[i] + d)) + (i - 1) * swim_cost + fly_cost;
        
        const swim_to_here = query_only_min(0, get_coord_index(prefix_sums[i] + d) + 1) + (i - 1) * swim_cost;
        const fly_to_here = query_only_min(0, get_coord_index(prefix_sums[i] + 2 * d)) + (i - 2) * swim_cost + fly_cost;

        const idx_p2 = get_coord_index(prefix_sums[i] + d);
        const val_p2 = Math.min(swim_to_here, fly_to_here) - (i - 1) * swim_cost;
        const current_p2 = query_only_sum(0, idx_p2 + 1);

        if (val_p2 < current_p2) {
            const diff = val_p2 - current_p2;
            update_tree(idx_p2, diff);
            update_tree(idx_p2 + 1, -diff);
        }

        const idx_pl = get_coord_index(prefix_sums[i]);
        update_tree(idx_pl + 1, 2 * wait_cost);
        
        const val_pl = dp[i] - i * swim_cost;
        const current_pl = query_only_sum(0, idx_pl + 1);

        if (val_pl < current_pl) {
            const diff = val_pl - current_pl;
            update_tree(idx_pl, diff);
            update_tree(idx_pl + 1, -diff);
        }
    }

    const swim_to_end = query_only_min(0, get_coord_index(prefix_sums[n] + d) + 1) + (n - 1) * swim_cost;
    const fly_to_end = query_only_min(0, get_coord_index(prefix_sums[n] + 2 * d)) + (n - 2) * swim_cost + fly_cost;

    process.stdout.write(Math.min(swim_to_end, fly_to_end).toFixed(0) + "\n");
}

solve();


