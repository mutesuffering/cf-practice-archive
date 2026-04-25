"use strict";

const fs = require('fs');

/**
 * Problem: Codeforces 1953A - HPC Summation (JavaScript Version)
 * Strategy:
 * 1. Kahan Summation for high-precision "Global Truth" benchmark.
 * 2. Manual IEEE-754 simulation for fp16 (h) and Math.fround for fp32 (s).
 * 3. 5-Strategy Evaluation: Local/Global Magnitude, Global Sign-Sep, Interleaved, and Original.
 * 4. 16-ary tree structure for stable summation and compact output.
 */

function main() {
    const input = fs.readFileSync(0);
    let offset = 0;

    function nextString() {
        while (offset < input.length && input[offset] <= 32) offset++;
        let start = offset;
        while (offset < input.length && input[offset] > 32) offset++;
        return input.toString('utf-8', start, offset);
    }

    const nStr = nextString();
    if (!nStr) return;
    const N = parseInt(nStr);

    const vals = new Float64Array(N + 1);
    const indices = new Int32Array(N);
    const all = [];

    for (let i = 0; i < N; i++) {
        const v = parseFloat(nextString());
        vals[i + 1] = v;
        indices[i] = i + 1;
        all.push({v, i: i + 1});
    }

    // Benchmark: Kahan Summation on magnitude-sorted values for high precision
    all.sort((a, b) => Math.abs(a.v) - Math.abs(b.v));
    let globalTruth = 0;
    let c = 0;
    for (let i = 0; i < N; i++) {
        let y = all[i].v - c;
        let t = globalTruth + y;
        c = (t - globalTruth) - y;
        globalTruth = t;
    }

    const dv = new DataView(new ArrayBuffer(8));
    function getExp(x) {
        if (x === 0) return 0;
        dv.setFloat64(0, x);
        return ((dv.getUint16(0) & 0x7ff0) >> 4) - 1022;
    }

    function rne(x) {
        let f = Math.floor(x);
        let d = x - f;
        if (d < 0.5) return f;
        if (d > 0.5) return f + 1;
        return (f % 2 === 0) ? f : f + 1;
    }

    function cutH(x) {
        if (x === 0 || !Number.isFinite(x)) return x;
        let exp = getExp(x);
        if (exp > 15) return x > 0 ? Infinity : -Infinity;
        if (exp < -14 - 10) return x > 0 ? 0 : -0;
        let effectiveExp = Math.max(exp, -14);
        let shift = Math.pow(2, effectiveExp - 11);
        return rne(x / shift) * shift;
    }

    const simS = Math.fround;

    function treeSum(type, l, r) {
        let n = r - l + 1;
        if (n === 1) {
            let v = vals[indices[l]];
            return type === 'h' ? cutH(v) : (type === 's' ? simS(v) : v);
        }
        let chunk = Math.ceil(n / 16);
        let res = 0, first = true;
        for (let i = 0; i < 16; i++) {
            let cl = l + i * chunk, cr = Math.min(r, l + (i + 1) * chunk - 1);
            if (cl > r) break;
            let v = treeSum(type, cl, cr);
            if (first) { res = v; first = false; }
            else {
                let s = res + v;
                res = type === 'h' ? cutH(s) : (type === 's' ? simS(s) : s);
            }
        }
        return res;
    }

    const outputArr = [];
    function solveOutput(l, r, type) {
        let n = r - l + 1;
        if (n === 1) { outputArr.push(indices[l]); return; }
        let chunk = Math.ceil(n / 16);
        outputArr.push(`{${type}:`);
        for (let i = 0; i < 16; i++) {
            let cl = l + i * chunk, cr = Math.min(r, l + (i + 1) * chunk - 1);
            if (cl > r) break;
            if (i > 0) outputArr.push(',');
            solveOutput(cl, cr, type);
        }
        outputArr.push('}');
    }

    function calculateP(idxs) {
        let x = 0, totalP = 0;
        for (let i = 0; i < idxs.length; i += 16) {
            let a1 = idxs[i];
            for (let j = 1; j < 16 && i + j < idxs.length; j++) {
                if (Math.abs(idxs[i + j] - a1) > 15) { x++; totalP += x; }
            }
        }
        return totalP / 20000;
    }

    const types = ['h', 's', 'd'], tw = [1, 2, 4];
    let bestScore = -1, bestType = 'd', bestSort = 0;
    const startTime = Date.now();

    for (let sId = 0; sId < 5; sId++) {
        if (sId > 0 && Date.now() - startTime > 8500) break;
        for (let i = 0; i < N; i++) indices[i] = i + 1;
        if (sId === 0) { // Local Mag
            for (let i = 0; i < N; i += 16) {
                let sub = indices.subarray(i, Math.min(N, i + 16));
                sub.sort((a, b) => Math.abs(vals[a]) - Math.abs(vals[b]) || vals[a] - vals[b]);
            }
        } else if (sId === 1) { // Global Mag
            indices.sort((a, b) => Math.abs(vals[a]) - Math.abs(vals[b]) || vals[a] - vals[b]);
        } else if (sId === 2) { // Global Sign-Sep
            let p = [], n = [];
            for (let i = 1; i <= N; i++) { if (vals[i] >= 0) p.push(i); else n.push(i); }
            p.sort((a, b) => vals[a] - vals[b]);
            n.sort((a, b) => Math.abs(vals[a]) - Math.abs(vals[b]));
            indices.set([...p, ...n]);
        } else if (sId === 3) { // Global Interleaved
            let p = [], n = [];
            for (let i = 1; i <= N; i++) { if (vals[i] >= 0) p.push(i); else n.push(i); }
            p.sort((a, b) => vals[a] - vals[b]); n.sort((a, b) => Math.abs(vals[a]) - Math.abs(vals[b]));
            let cur = 0, pi = 0, ni = 0;
            while (pi < p.length || ni < n.length) {
                if (pi < p.length) indices[cur++] = p[pi++];
                if (ni < n.length) indices[cur++] = n[ni++];
            }
        }

        const pVal = calculateP(indices);
        for (let tId = 0; tId < 3; tId++) {
            const sVal = treeSum(types[tId], 0, N - 1);
            const err = Math.abs(sVal - globalTruth) / Math.max(Math.abs(globalTruth), 1e-200);
            const acc = Math.pow(Math.max(err, 1e-20), 0.05);
            const score = (10 / Math.sqrt((tw[tId] * (N - 1) + pVal) / (N - 1) + 0.5)) / acc;
            if (score > bestScore) { bestScore = score; bestType = types[tId]; bestSort = sId; }
        }
    }

    // Re-apply best sort and output
    for (let i = 0; i < N; i++) indices[i] = i + 1;
    if (bestSort === 0) {
        for (let i = 0; i < N; i += 16) {
            let sub = indices.subarray(i, Math.min(N, i + 16));
            sub.sort((a, b) => Math.abs(vals[a]) - Math.abs(vals[b]) || vals[a] - vals[b]);
        }
    } else if (bestSort === 1) {
        indices.sort((a, b) => Math.abs(vals[a]) - Math.abs(vals[b]) || vals[a] - vals[b]);
    } else if (bestSort === 2) {
        let p = [], n = [];
        for (let i = 1; i <= N; i++) { if (vals[i] >= 0) p.push(i); else n.push(i); }
        p.sort((a, b) => vals[a] - vals[b]); n.sort((a, b) => Math.abs(vals[a]) - Math.abs(vals[b]));
        indices.set([...p, ...n]);
    } else if (bestSort === 3) {
        let p = [], n = [];
        for (let i = 1; i <= N; i++) { if (vals[i] >= 0) p.push(i); else n.push(i); }
        p.sort((a, b) => vals[a] - vals[b]); n.sort((a, b) => Math.abs(vals[a]) - Math.abs(vals[b]));
        let cur = 0, pi = 0, ni = 0;
        while (pi < p.length || ni < n.length) {
            if (pi < p.length) indices[cur++] = p[pi++];
            if (ni < n.length) indices[cur++] = n[ni++];
        }
    }

    solveOutput(0, N - 1, bestType);
    process.stdout.write(outputArr.join('') + '\n');
}

main();