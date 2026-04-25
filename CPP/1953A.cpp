#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>
#include <ctime>

using namespace std;

/**
 * Problem: Codeforces 1953A - HPC Summation
 * Final Advanced Solver:
 * 1. Global Benchmark: Calculate 'Global Truth' using magnitude-sorted long double sum.
 * 2. Multi-Sort Evaluation: Test 11 strategies including Global Symmetric Value/Mag.
 * 3. Timeout Safety: Exit evaluation at 8.5s to ensure valid output generation.
 * 4. Structure: 16-ary tree for compact and stable output.
 */

// [ignoring loop detection]

// Standard IEEE-754 Round to Nearest Even
double rne(double x) {
    double f = floor(x);
    double d = x - f;
    if (d < 0.5) return f;
    if (d > 0.5) return f + 1.0;
    return (fmod(f, 2.0) == 0.0) ? f : f + 1.0;
}

double cut(double x, int mant_bits, int min_exp, int max_exp) {
    if (x == 0 || isnan(x) || isinf(x)) return x;
    int exp;
    double mant = frexp(x, &exp);
    if (exp > max_exp) return (x > 0 ? INFINITY : -INFINITY);
    if (exp < min_exp - (mant_bits - 1)) return (x > 0 ? 0.0 : -0.0);
    int effective_exp = max(exp, min_exp);
    double shift = ldexp(1.0, effective_exp - mant_bits);
    return rne(x / shift) * shift;
}

double sim_h(double x) { return cut(x, 11, -14, 15); }
double sim_s(double x) { return cut(x, 24, -126, 127); }

int N;
vector<double> vals;
vector<int> indices;

template<typename T>
T tree_sum(char type, int l, int r) {
    int n = r - l + 1;
    if (n == 1) {
        double v = vals[indices[l]];
        if (type == 'h') return (T)sim_h(v);
        if (type == 's') return (T)sim_s(v);
        return (T)v;
    }
    int chunk = (n + 15) / 16;
    T res = 0; bool first = true;
    for (int i = 0; i < 16; ++i) {
        int cl = l + i * chunk, cr = min(r, l + (i + 1) * chunk - 1);
        if (cl > r) break;
        T v = tree_sum<T>(type, cl, cr);
        if (first) { res = v; first = false; }
        else {
            double s = (double)res + (double)v;
            if (type == 'h') res = (T)sim_h(s);
            else if (type == 's') res = (T)sim_s(s);
            else res = (T)s;
        }
    }
    return res;
}

void solve_output(int l, int r, char type) {
    int n = r - l + 1;
    if (n == 1) { cout << indices[l]; return; }
    int chunk = (n + 15) / 16;
    cout << "{" << type << ":";
    for (int i = 0; i < 16; ++i) {
        int cl = l + i * chunk, cr = min(r, l + (i + 1) * chunk - 1);
        if (cl > r) break;
        if (i > 0) cout << ",";
        solve_output(cl, cr, type);
    }
    cout << "}";
}

double calculate_p(const vector<int>& idxs) {
    long long x = 0, total_p_num = 0;
    for (int i = 0; i < (int)idxs.size(); i += 16) {
        int a1 = idxs[i];
        for (int j = 1; j < 16 && i + j < (int)idxs.size(); ++j) {
            if (abs(idxs[i + j] - a1) > 15) { x++; total_p_num += x; }
        }
    }
    return (double)total_p_num / 20000.0;
}

void apply_sort(int s_id) {
    for (int i = 0; i < N; ++i) indices[i] = i + 1;
    if (s_id == 0) { // Local Magnitude
        for (int i = 0; i < N; i += 16) {
            int r = min(N, i + 16);
            sort(indices.begin() + i, indices.begin() + r, [](int a, int b) {
                double va = abs(vals[a]), vb = abs(vals[b]);
                return (va != vb) ? va < vb : vals[a] < vals[b];
            });
        }
    } else if (s_id == 1) { // Local Value
        for (int i = 0; i < N; i += 16) {
            int r = min(N, i + 16);
            sort(indices.begin() + i, indices.begin() + r, [](int a, int b) { return vals[a] < vals[b]; });
        }
    } else if (s_id == 2) { // Global Magnitude
        sort(indices.begin(), indices.end(), [](int a, int b) {
            double va = abs(vals[a]), vb = abs(vals[b]);
            return (va != vb) ? va < vb : vals[a] < vals[b];
        });
    } else if (s_id == 3) { // Global Value
        sort(indices.begin(), indices.end(), [](int a, int b) { return vals[a] < vals[b]; });
    } else if (s_id == 5) { // Global Sign-Separated
        vector<int> p, n;
        for (int i = 1; i <= N; ++i) { if (vals[i] >= 0) p.push_back(i); else n.push_back(i); }
        sort(p.begin(), p.end(), [](int a, int b) { return abs(vals[a]) < abs(vals[b]); });
        sort(n.begin(), n.end(), [](int a, int b) { return abs(vals[a]) < abs(vals[b]); });
        int cur = 0; for (int x : p) indices[cur++] = x; for (int x : n) indices[cur++] = x;
    } else if (s_id == 6) { // Global Interleaved
        vector<int> p, n;
        for (int i = 1; i <= N; ++i) { if (vals[i] >= 0) p.push_back(i); else n.push_back(i); }
        sort(p.begin(), p.end(), [](int a, int b) { return abs(vals[a]) < abs(vals[b]); });
        sort(n.begin(), n.end(), [](int a, int b) { return abs(vals[a]) < abs(vals[b]); });
        int cur = 0, pi = 0, ni = 0;
        while (pi < (int)p.size() || ni < (int)n.size()) {
            if (pi < (int)p.size()) indices[cur++] = p[pi++];
            if (ni < (int)n.size()) indices[cur++] = n[ni++];
        }
    } else if (s_id == 7) { // Global Symmetric Value
        sort(indices.begin(), indices.end(), [](int a, int b) { return vals[a] < vals[b]; });
        vector<int> tmp = indices;
        int cur = 0, l = 0, r = N - 1;
        while (l <= r) { indices[cur++] = tmp[l++]; if (l <= r) indices[cur++] = tmp[r--]; }
    } else if (s_id == 8) { // Global Symmetric Magnitude
        sort(indices.begin(), indices.end(), [](int a, int b) { return abs(vals[a]) < abs(vals[b]); });
        vector<int> tmp = indices;
        int cur = 0, l = 0, r = N - 1;
        while (l <= r) { indices[cur++] = tmp[l++]; if (l <= r) indices[cur++] = tmp[r--]; }
    } else if (s_id == 9) { // Global Reverse Magnitude
        sort(indices.begin(), indices.end(), [](int a, int b) {
            double va = abs(vals[a]), vb = abs(vals[b]);
            return (va != vb) ? va > vb : vals[a] > vals[b];
        });
    } else if (s_id == 10) { // Global Reverse Value
        sort(indices.begin(), indices.end(), [](int a, int b) { return vals[a] > vals[b]; });
    }
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    if (!(cin >> N)) return 0;
    vals.resize(N + 1); indices.resize(N);
    vector<pair<double, int>> all(N);
    for (int i = 0; i < N; ++i) {
        cin >> vals[i + 1]; indices[i] = i + 1;
        all[i] = {vals[i + 1], i + 1};
    }
    sort(all.begin(), all.end(), [](const pair<double, int>& a, const pair<double, int>& b) {
        return abs(a.first) < abs(b.first);
    });
    long double global_truth = 0;
    for (int i = 0; i < N; ++i) global_truth += (long double)all[i].first;

    char types[] = {'h', 's', 'd'};
    double tw[] = {1.0, 2.0, 4.0};
    double best_score = -1; char best_type = 'd'; int best_sort = 0;
    clock_t start = clock();

    for (int s_id = 0; s_id < 11; ++s_id) {
        if (s_id > 0 && (double)(clock() - start) / CLOCKS_PER_SEC > 8.5) break;
        apply_sort(s_id);
        double p_val = calculate_p(indices);
        for (int t_id = 0; t_id < 3; ++t_id) {
            double s_val = (double)tree_sum<double>(types[t_id], 0, N - 1);
            long double abs_err = abs((long double)s_val - global_truth);
            double rel_err = (double)(abs_err / max((long double)abs(global_truth), (long double)1e-200));
            if (isnan(s_val) || isinf(s_val)) rel_err = 1e30;
            double acc = pow(max(rel_err, 1e-20), 0.05);
            double cost = (tw[t_id] * (N - 1) + p_val) / (N - 1);
            double score = (10.0 / sqrt(cost + 0.5)) / acc;
            if (score > best_score) { best_score = score; best_type = types[t_id]; best_sort = s_id; }
        }
    }

    apply_sort(best_sort);
    solve_output(0, N - 1, best_type);
    cout << endl;
    return 0;
}