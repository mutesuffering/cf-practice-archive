"use strict";

const fs = require('fs');

/**
 * Problem: Codeforces 2218G - Awkward Seating
 * Modulo: 676767677 (Prime)
 * Logic:
 * 1. Precalculate the counts of people sitting at each time t (|S_t|) and prefix sums (C_t).
 * 2. For each person i with b_i > 0:
 *    - Check if at least one neighbor sits strictly before b_i.
 *    - If neighbor sat before b_i - 1, choices = |S_{b_i-1}|.
 *    - If neighbor sat at b_i - 1, choices = C_{b_i-1}.
 * 3. Multiply choices modulo 676767677.
 */

function solve() {
    const input = fs.readFileSync(0);
    let offset = 0;

    function nextInt() {
        while (offset < input.length && (input[offset] < 48 || input[offset] > 57)) offset++;
        if (offset >= input.length) return null;
        let res = 0;
        while (offset < input.length && input[offset] >= 48 && input[offset] <= 57) {
            res = res * 10 + (input[offset] - 48);
            offset++;
        }
        return res;
    }

    const t = nextInt();
    const MOD = BigInt(676767677);

    let output = "";
    for (let tc = 0; tc < t; tc++) {
        const n = nextInt();
        const m = nextInt();
        const b = new Int32Array(n);
        const sCount = new Int32Array(m);
        for (let i = 0; i < n; i++) {
            b[i] = nextInt();
            sCount[b[i]]++;
        }

        const cCount = new Int32Array(m);
        let currentC = 0;
        for (let i = 0; i < m; i++) {
            currentC += sCount[i];
            cCount[i] = currentC;
        }

        let ans = 1n;
        for (let i = 0; i < n; i++) {
            if (b[i] === 0) continue;

            let nbMin = 1000000000;
            if (i > 0) nbMin = Math.min(nbMin, b[i - 1]);
            if (i < n - 1) nbMin = Math.min(nbMin, b[i + 1]);

            if (nbMin >= b[i]) {
                ans = 0n;
                break;
            }

            let choices;
            if (nbMin < b[i] - 1) {
                // Seated count condition failed at b_i - 1
                choices = BigInt(sCount[b[i] - 1]);
            } else {
                // Neighbor condition failed at b_i - 1
                choices = BigInt(cCount[b[i] - 1]);
            }
            ans = (ans * choices) % MOD;
        }

        output += ans.toString() + "\n";
        if (output.length > 10000) {
            process.stdout.write(output);
            output = "";
        }
    }
    process.stdout.write(output);
}

solve();