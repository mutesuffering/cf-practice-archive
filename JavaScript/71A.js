"use strict";

const fs = require('fs');

/**
 * Problem: Codeforces 71A - Way Too Long Words
 * 
 * Logic: If a word is longer than 10 characters, replace it with an abbreviation:
 * first letter + count of characters in between + last letter.
 */

function solve() {
    const input = fs.readFileSync(0, 'utf8').split(/\s+/);
    if (input.length === 0) return;
    
    let inputIdx = 0;
    const numWords = parseInt(input[inputIdx++]);
    if (isNaN(numWords)) return;
    
    for (let i = 0; i < numWords; i++) {
        const word = input[inputIdx++];
        if (!word) continue;
        
        const length = word.length;
        if (length > 10) {
            // Abbreviation: first char + (length - 2) + last char
            const abbreviation = word[0] + (length - 2) + word[length - 1];
            console.log(abbreviation);
        } else {
            console.log(word);
        }
    }
}

solve();