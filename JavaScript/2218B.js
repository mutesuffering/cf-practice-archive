"use strict";

const fs = require('fs');

/**
 * Problem: Codeforces 2218B
 * 
 * Logic: For each test case, given 7 values, calculate (2 * maxVal - sum).
 */

function solve() {
    const input = fs.readFileSync(0, 'utf8').split(/\s+/);
    if (input.length === 0) return;
    
    let inputIdx = 0;
    const numTestCases = parseInt(input[inputIdx++]);
    if (isNaN(numTestCases)) return;

    for (let i = 0; i < numTestCases; i++) {
        let maxVal = -Infinity;
        let totalSum = 0;
        
        for (let j = 0; j < 7; j++) {
            const val = parseInt(input[inputIdx++]);
            if (val > maxVal) maxVal = val;
            totalSum += val;
        }
        
        console.log(2 * maxVal - totalSum);
    }
}

solve();