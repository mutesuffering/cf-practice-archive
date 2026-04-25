"use strict";

const fs = require('fs');

/**
 * Problem: Codeforces 4A - Watermelon
 * 
 * Logic: A watermelon can be divided into two even parts if its weight is even and greater than 2.
 */

function solve() {
    const input = fs.readFileSync(0, 'utf8').trim();
    if (!input) return;
    
    const weight = parseInt(input);

    if (weight > 2 && weight % 2 === 0) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

solve();