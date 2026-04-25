#include <bits/stdc++.h>

using namespace std;

/**
 * Problem: Codeforces 2045D
 * 
 * The code uses a segment tree to maintain DP values over coordinate-compressed values.
 * The segment tree stores pairs of {sum, min_prefix_sum} to efficiently calculate
 * range sums and prefix minimums.
 */

using ll = long long;
using pii = pair<int, int>;
using vi = vector<int>;
using vl = vector<ll>;

const int MAXN = 1000010;
const int TREE_OFFSET = 1 << 20;
const ll INF = 1ll << 40;

struct Node {
    ll sum;
    ll min_prefix;
};

int n;
ll d, swim_cost, fly_cost, wait_cost;
ll prefix_sums[MAXN];
ll dp[MAXN];
vl coords;
Node tree[TREE_OFFSET * 2 + 10];

// Merges two segment tree nodes: first is total sum, second is minimum prefix sum
Node merge_nodes(Node a, Node b) {
    return { a.sum + b.sum, min(a.min_prefix, a.sum + b.min_prefix) };
}

// Queries the segment tree for the range [l, r)
Node query_tree(int l, int r, int node_l = 0, int node_r = TREE_OFFSET, int idx = 1) {
    if (node_l >= l && node_r <= r) return tree[idx];
    if (node_l >= r || node_r <= l) return {0, INF * MAXN};
    
    int mid = (node_l + node_r) / 2;
    return merge_nodes(
        query_tree(l, r, node_l, mid, idx * 2),
        query_tree(l, r, mid, node_r, idx * 2 + 1)
    );
}

// Updates the segment tree at position i by adding value x
void update_tree(int i, ll x) {
    i += TREE_OFFSET;
    tree[i].sum += x;
    tree[i].min_prefix += x;
    for (i /= 2; i; i /= 2) {
        tree[i] = merge_nodes(tree[i * 2], tree[i * 2 + 1]);
    }
}

int get_coord_index(ll x) {
    return lower_bound(coords.begin(), coords.end(), x) - coords.begin();
}

int main() {
    ios_base::sync_with_stdio(0);
    cin.tie(0);

    if (!(cin >> n >> d >> swim_cost >> fly_cost >> wait_cost)) return 0;

    // Special case: if flying is always cheaper than swimming once
    if (fly_cost < swim_cost) {
        cout << (n - 1) * fly_cost << "\n";
        return 0;
    }

    for (int i = 0; i < n; ++i) {
        int x;
        cin >> x;
        prefix_sums[i + 1] = prefix_sums[i] + x - d;
    }

    // Coordinate compression
    for (int i = 0; i <= n; ++i) {
        coords.push_back(prefix_sums[i]);
        coords.push_back(prefix_sums[i] + d);
        coords.push_back(prefix_sums[i] + 2 * d);
    }
    coords.push_back(-INF);
    sort(coords.begin(), coords.end());
    coords.erase(unique(coords.begin(), coords.end()), coords.end());

    // Initialize tree with a large value and set the starting point
    update_tree(0, INF);
    update_tree(get_coord_index(0), -INF);
    update_tree(get_coord_index(0) + 1, INF);

    for (int i = 1; i < n; ++i) {
        dp[i] = query_tree(0, get_coord_index(prefix_sums[i] + d)).min_prefix + (i - 1) * swim_cost + fly_cost;
        
        ll swim_to_here = query_tree(0, get_coord_index(prefix_sums[i] + d) + 1).min_prefix + (i - 1) * swim_cost;
        ll fly_to_here = query_tree(0, get_coord_index(prefix_sums[i] + 2 * d)).min_prefix + (i - 2) * swim_cost + fly_cost;

        int idx_p2 = get_coord_index(prefix_sums[i] + d);
        ll val_p2 = min(swim_to_here, fly_to_here) - (i - 1) * swim_cost;
        ll current_p2 = query_tree(0, idx_p2 + 1).sum;

        if (val_p2 < current_p2) {
            update_tree(idx_p2, val_p2 - current_p2);
            update_tree(idx_p2 + 1, current_p2 - val_p2);
        }

        int idx_pl = get_coord_index(prefix_sums[i]);
        update_tree(idx_pl + 1, 2 * wait_cost);
        
        ll val_pl = dp[i] - i * swim_cost;
        ll current_pl = query_tree(0, idx_pl + 1).sum;

        if (val_pl < current_pl) {
            update_tree(idx_pl, val_pl - current_pl);
            update_tree(idx_pl + 1, current_pl - val_pl);
        }
    }

    ll swim_to_end = query_tree(0, get_coord_index(prefix_sums[n] + d) + 1).min_prefix + (n - 1) * swim_cost;
    ll fly_to_end = query_tree(0, get_coord_index(prefix_sums[n] + 2 * d)).min_prefix + (n - 2) * swim_cost + fly_cost;

    cout << min(swim_to_end, fly_to_end) << "\n";

    return 0;
}