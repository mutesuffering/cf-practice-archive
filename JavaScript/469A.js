"use strict";

const fs = require('fs');

/**
 * Problem: Codeforces 469A - I Wanna Be the Guy
 * 
 * Logic: Check if the union of levels passed by two players covers all levels from 1 to n.
 */

function solve() {
    const input = fs.readFileSync(0, 'utf8').split(/\s+/);
    if (input.length === 0) return;
    
    let inputIdx = 0;
    const totalLevels = parseInt(input[inputIdx++]);
    if (isNaN(totalLevels)) return;
    
    const passedLevels = new Set();
    
    // Player X's levels
    const numLevelsX = parseInt(input[inputIdx++]);
    for (let i = 0; i < numLevelsX; i++) {
        passedLevels.add(parseInt(input[inputIdx++]));
    }
    
    // Player Y's levels
    const numLevelsY = parseInt(input[inputIdx++]);
    for (let i = 0; i < numLevelsY; i++) {
        passedLevels.add(parseInt(input[inputIdx++]));
    }
    
    // If the number of unique passed levels equals the total levels, they can pass the game
    if (passedLevels.size === totalLevels) {
        console.log("I become the guy.");
    } else {
        console.log("Oh, my keyboard!");
    }
}

solve();