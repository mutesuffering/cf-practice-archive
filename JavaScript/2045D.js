"use strict";

const fs = require('fs');

/**
 * Problem: Codeforces 2045D
 * 
 * This solution uses a monotone stack to find nearest smaller values and
 * segment trees to maintain DP states over coordinate-compressed values.
 */

function solve() {
    const input = fs.readFileSync(0, 'utf8').split(/\s+/);
    if (input.length < 5) return;
    
    let inputIdx = 0;
    const numPoints = parseInt(input[inputIdx++]);
    const distance = parseInt(input[inputIdx++]);
    const swimCost = parseInt(input[inputIdx++]);
    const flyCost = parseInt(input[inputIdx++]);
    const waitCost = parseInt(input[inputIdx++]);
    
    const points = new Float64Array(numPoints);
    for (let i = 0; i < numPoints; i++) {
        points[i] = parseInt(input[inputIdx++]);
    }
    
    // Calculate prefix sums of points
    const prefixSums = new Float64Array(numPoints + 1);
    prefixSums[0] = 0;
    for (let i = 0; i < numPoints; i++) {
        prefixSums[i + 1] = prefixSums[i] + points[i];
    }
    
    // gValues[i] = prefixSums[i] - i * distance
    const gValues = new Float64Array(numPoints + 1);
    for (let i = 0; i <= numPoints; i++) {
        gValues[i] = prefixSums[i] - i * distance;
    }
    
    // Use monotone stack to find the next index j such that gValues[j] < gValues[i]
    const nextSmallerG = new Int32Array(numPoints + 1);
    const stack = [];
    for (let i = numPoints; i >= 0; i--) {
        while (stack.length > 0 && gValues[stack[stack.length - 1]] >= gValues[i]) {
            stack.pop();
        }
        if (stack.length === 0) nextSmallerG[i + 1] = numPoints + 1;
        else nextSmallerG[i + 1] = stack[stack.length - 1];
        stack.push(i);
    }
    
    // fValues[j] = prefixSums[j - 1] - j * distance
    const fValues = new Float64Array(numPoints + 1);
    for (let j = 1; j <= numPoints; j++) {
        fValues[j] = prefixSums[j - 1] - j * distance;
    }
    
    // Sort indices based on fValues for coordinate compression/segment tree
    let sortedIndices = [];
    for (let j = 1; j <= numPoints; j++) sortedIndices.push(j);
    sortedIndices.sort((a, b) => fValues[a] - fValues[b]);
    
    const posInTree = new Int32Array(numPoints + 1);
    for (let i = 0; i < numPoints; i++) posInTree[sortedIndices[i]] = i;
    
    // Binary search to find the index in sortedIndices
    function getSortedIdx(val) {
        let low = 0, high = numPoints - 1;
        while (low <= high) {
            let mid = (low + high) >> 1;
            if (fValues[sortedIndices[mid]] < val) low = mid + 1;
            else high = mid - 1;
        }
        return low;
    }
    
    // Segment trees for maintaining DP states
    const tree1 = new Float64Array(2 * numPoints).fill(Infinity);
    const tree2 = new Float64Array(2 * numPoints).fill(Infinity);
    
    function updateTree(tree, i, val) {
        i += numPoints;
        tree[i] = val;
        while (i > 1) {
            i >>= 1;
            tree[i] = Math.min(tree[2 * i], tree[2 * i + 1]);
        }
    }
    
    function queryTree(tree, l, r) {
        let res = Infinity;
        if (l >= r) return res;
        for (l += numPoints, r += numPoints; l < r; l >>= 1, r >>= 1) {
            if (l & 1) res = Math.min(res, tree[l++]);
            if (r & 1) res = Math.min(res, tree[--r]);
        }
        return res;
    }
    
    // Queues for moving DP states between trees
    const moveFromTree1To2 = Array.from({length: numPoints + 2}, () => []);
    const dp = new Float64Array(numPoints + 1).fill(Infinity);
    
    dp[1] = 0;
    updateTree(tree1, posInTree[1], dp[1] - 1 * swimCost);
    if (nextSmallerG[1] <= numPoints) moveFromTree1To2[nextSmallerG[1]].push(1);

    for (let i = 2; i < numPoints; i++) {
        for (let j of moveFromTree1To2[i-1]) {
            updateTree(tree1, posInTree[j], Infinity);
            updateTree(tree2, posInTree[j], dp[j] - j * swimCost - 2 * nextSmallerG[j] * waitCost);
        }
        
        const thresholdIdx = getSortedIdx(gValues[i-1] - 1 + 0.5);
        const minVal1 = queryTree(tree1, 0, thresholdIdx);
        const minVal2 = queryTree(tree2, 0, thresholdIdx);
        
        dp[i] = Math.min(
            minVal1 + (i - 1) * swimCost + flyCost,
            minVal2 + (i - 1) * (swimCost + 2 * waitCost) + flyCost
        );
        
        updateTree(tree1, posInTree[i], dp[i] - i * swimCost);
        if (nextSmallerG[i] <= numPoints) moveFromTree1To2[nextSmallerG[i]].push(i);
    }
    
    for (let j of moveFromTree1To2[numPoints - 1]) {
        updateTree(tree1, posInTree[j], Infinity);
        updateTree(tree2, posInTree[j], dp[j] - j * swimCost - 2 * nextSmallerG[j] * waitCost);
    }

    let minTotalCost = Infinity;
    if (numPoints === 1) {
        minTotalCost = 0;
    } else {
        // Final calculations for different end scenarios
        const idxF1 = getSortedIdx(gValues[numPoints - 1] - 1 + 0.5);
        minTotalCost = Math.min(minTotalCost, queryTree(tree1, 0, idxF1) + (numPoints - 1) * swimCost + flyCost);
        minTotalCost = Math.min(minTotalCost, queryTree(tree2, 0, idxF1) + (numPoints - 1) * swimCost + 2 * (numPoints - 1) * waitCost + flyCost);
        
        const idxF2 = getSortedIdx(gValues[numPoints] + distance - 1 + 0.5);
        minTotalCost = Math.min(minTotalCost, queryTree(tree1, 0, idxF2) + (numPoints - 1) * swimCost + 2 * waitCost + flyCost);
        minTotalCost = Math.min(minTotalCost, queryTree(tree2, 0, idxF2) + (numPoints - 1) * swimCost + 2 * numPoints * waitCost + flyCost);

        const idxS1 = getSortedIdx(gValues[numPoints - 1] - distance + 0.5);
        minTotalCost = Math.min(minTotalCost, queryTree(tree1, 0, idxS1) + numPoints * swimCost);
        minTotalCost = Math.min(minTotalCost, queryTree(tree2, 0, idxS1) + numPoints * swimCost + 2 * (numPoints - 1) * waitCost);
        
        const idxS2 = getSortedIdx(gValues[numPoints] + 0.5);
        minTotalCost = Math.min(minTotalCost, queryTree(tree1, 0, idxS2) + numPoints * swimCost + 2 * waitCost);
        minTotalCost = Math.min(minTotalCost, queryTree(tree2, 0, idxS2) + numPoints * swimCost + 2 * numPoints * waitCost);
    }

    process.stdout.write(minTotalCost.toFixed(0) + '\n');
}

solve();