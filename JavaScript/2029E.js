"use strict";

const fs = require('fs');

/**
 * Problem: Codeforces 2029E - Common Generator (JavaScript Version)
 * Logic:
 * 1. Precompute SPF up to 400,005 using a sieve.
 * 2. Identify distinct primes in the input array.
 * 3. If > 1 distinct primes exist, no solution (-1).
 * 4. If 0 or 1 distinct primes exist, use the identified prime (or 2) as candidate x.
 * 5. Verify reachability for all elements using the rule:
 *    - Even v: v >= 2x
 *    - Odd composite v: v - spf[v] >= 2x
 */

function main() {
    const buffer = fs.readFileSync(0);
    let offset = 0;

    function nextInt() {
        while (offset < buffer.length && (buffer[offset] < 48 || buffer[offset] > 57)) offset++;
        if (offset >= buffer.length) return null;
        let res = 0;
        while (offset < buffer.length && buffer[offset] >= 48 && buffer[offset] <= 57) {
            res = res * 10 + (buffer[offset] - 48);
            offset++;
        }
        return res;
    }

    const MAXA = 400005;
    const spf = new Int32Array(MAXA);
    for (let i = 2; i < MAXA; i++) spf[i] = i;
    for (let i = 2; i * i < MAXA; i++) {
        if (spf[i] === i) {
            for (let j = i * i; j < MAXA; j += i) {
                if (spf[j] === j) spf[j] = i;
            }
        }
    }

    const t = nextInt();
    if (t === null) return;

    let output = "";
    for (let tc = 0; tc < t; tc++) {
        const n = nextInt();
        const a = new Int32Array(n);
        let primeCandidate = -1;
        let multiPrimes = false;

        for (let i = 0; i < n; i++) {
            const v = nextInt();
            a[i] = v;
            if (spf[v] === v) {
                if (primeCandidate === -1) {
                    primeCandidate = v;
                } else if (primeCandidate !== v) {
                    multiPrimes = true;
                }
            }
        }

        if (multiPrimes) {
            output += "-1\n";
        } else {
            const x = (primeCandidate === -1 ? 2 : primeCandidate);
            let ok = true;
            for (let i = 0; i < n; i++) {
                const v = a[i];
                if (v === x) continue;
                if (v % 2 === 0) {
                    if (v < 2 * x) { ok = false; break; }
                } else {
                    // v is odd. Since multiPrimes check passed, v must be composite.
                    if (v - spf[v] < 2 * x) { ok = false; break; }
                }
            }
            output += (ok ? x : -1) + "\n";
        }

        // Flush output periodically to manage memory
        if (output.length > 16384) {
            process.stdout.write(output);
            output = "";
        }
    }
    process.stdout.write(output);
}

main();