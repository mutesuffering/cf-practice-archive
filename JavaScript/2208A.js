"use strict";

/**
 * Problem: Magic Board (2208A)
 * 
 * Logic:
 * We are allowed to rearrange the n x n candies arbitrarily.
 * We want to avoid any row or column being monochromatic (consisting of n candies of the same color).
 * 
 * Let C_k be the frequency of color k.
 * For a specific color k, to ensure no row is monochromatic in color k, we must place at least 
 * one candy of a different color in each of the n rows.
 * Similarly, to ensure no column is monochromatic in color k, we must place at least 
 * one candy of a different color in each of the n columns.
 * 
 * To "break" all n rows and n columns from being monochromatic in color k using the minimum 
 * number of non-k candies, we can place n non-k candies in a permutation pattern 
 * (e.g., at (i, i) for i=0..n-1).
 * This requires n non-k candies. Total candies is n^2, so we need:
 * n^2 - C_k >= n  =>  C_k <= n^2 - n.
 * 
 * If this condition holds for the most frequent color (C_max <= n^2 - n), and n >= 2, 
 * we can always find such a permutation of "spoiler" candies. 
 * Even if all "spoiler" candies are of the same color (say color m), 
 * since n >= 2, each row/column will contain at least one candy of color m and at least one 
 * of color k, making it non-monochromatic.
 * 
 * For n = 1:
 * n^2 - n = 0. Since there is 1 candy, C_max = 1. 1 <= 0 is false.
 * Indeed, a 1x1 board is always monochromatic in its single row and column.
 * 
 * Conclusion:
 * The answer is "YES" if and only if for all colors k, C_k <= n^2 - n.
 */

const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf8');
    const parts = input.split(/\s+/);
    let cur = 0;

    const tStr = parts[cur++];
    if (tStr === undefined || tStr === "") return;
    const t = parseInt(tStr);

    const results = [];
    for (let i = 0; i < t; i++) {
        const n = parseInt(parts[cur++]);
        const counts = new Map();
        const total = n * n;
        for (let j = 0; j < total; j++) {
            const color = parts[cur++];
            counts.set(color, (counts.get(color) || 0) + 1);
        }

        let maxCount = 0;
        for (const count of counts.values()) {
            if (count > maxCount) maxCount = count;
        }

        // n=1 is a special case where n^2 - n = 0, and maxCount is always 1.
        if (maxCount <= n * n - n) {
            results.push("YES");
        } else {
            results.push("NO");
        }
    }

    if (results.length > 0) {
        process.stdout.write(results.join('\n') + '\n');
    }
}

solve();