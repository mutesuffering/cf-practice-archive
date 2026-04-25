#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

/**
 * Problem: Codeforces 2029E - Common Generator
 * Logic:
 * 1. A generator x can only reach a prime y if x = y.
 * 2. If the array has multiple distinct primes, no solution exists.
 * 3. If there's one prime p, it must be the generator.
 * 4. If there are no primes, x = 2 is a valid generator for all composite numbers.
 * 5. A prime p generates v if:
 *    - v == p
 *    - v is even and v >= 2p
 *    - v is odd composite and v - spf[v] >= 2p
 */

const int MAXA = 400005;
int spf[MAXA];

void precompute() {
    for (int i = 2; i < MAXA; ++i) spf[i] = i;
    for (int i = 2; i * i < MAXA; ++i) {
        if (spf[i] == i) {
            for (int j = i * i; j < MAXA; j += i) {
                if (spf[j] == j) spf[j] = i;
            }
        }
    }
}

void solve() {
    int n;
    if (!(cin >> n)) return;
    vector<int> a(n);
    vector<int> primes;
    for (int i = 0; i < n; ++i) {
        cin >> a[i];
        if (spf[a[i]] == a[i]) {
            primes.push_back(a[i]);
        }
    }
    
    sort(primes.begin(), primes.end());
    primes.erase(unique(primes.begin(), primes.end()), primes.end());
    
    if (primes.size() > 1) {
        cout << -1 << "\n";
        return;
    }
    
    int x = (primes.empty() ? 2 : primes[0]);
    
    for (int v : a) {
        if (v == x) continue;
        
        // Check if x generates v
        if (v % 2 == 0) {
            // Even v can be reached if v >= 2x
            if (v < 2 * x) {
                cout << -1 << "\n";
                return;
            }
        } else {
            // Odd composite v can be reached if we can reach an even number 
            // that can jump to v. The jump must be via an odd divisor of v.
            // The jump from even z to odd v is most flexible if z = v - spf[v].
            // This z is even and must be >= 2x.
            if (v - spf[v] < 2 * x) {
                cout << -1 << "\n";
                return;
            }
        }
    }
    
    cout << x << "\n";
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    precompute();
    int t;
    if (!(cin >> t)) return 0;
    while (t--) {
        solve();
    }
    return 0;
}
