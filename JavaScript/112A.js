"use strict";

const fs = require('fs');

/**
 * Problem: Codeforces 112A - Petya and Strings
 * 
 * Logic: Compare two strings lexicographically, ignoring case.
 * Output -1 if first is smaller, 1 if second is smaller, 0 if equal.
 */

function solve() {
    const input = fs.readFileSync(0, 'utf8').split(/\s+/);
    if (input.length < 2) return;
    
    // Case-insensitive comparison using toLowerCase()
    const string1 = input[0].toLowerCase();
    const string2 = input[1].toLowerCase();
    
    if (string1 < string2) {
        console.log("-1");
    } else if (string1 > string2) {
        console.log("1");
    } else {
        console.log("0");
    }
}

solve();