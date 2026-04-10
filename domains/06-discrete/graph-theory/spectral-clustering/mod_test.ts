import { assert, assertEquals } from "@std/assert";
import { assertCloseTo } from "@math/core/testing";
import { Matrix, Vector } from "@math/core/linalg";
import { graphLaplacian, kMeans, spectralCluster } from "./mod.ts";

// ── Graph Laplacian tests ────────────────────────────────────────────

Deno.test("graphLaplacian — 3-node triangle", () => {
  // Complete graph K3.
  const A = Matrix.from([
    [0, 1, 1],
    [1, 0, 1],
    [1, 1, 0],
  ]);
  const L = graphLaplacian(A);
  // L = D - A where D = diag(2,2,2).
  assertEquals(L.get(0, 0), 2);
  assertEquals(L.get(0, 1), -1);
  assertEquals(L.get(1, 2), -1);
  assertEquals(L.get(2, 2), 2);
});

Deno.test("graphLaplacian — row sums are zero", () => {
  const A = Matrix.from([
    [0, 3, 0, 1],
    [3, 0, 2, 0],
    [0, 2, 0, 4],
    [1, 0, 4, 0],
  ]);
  const L = graphLaplacian(A);
  for (let r = 0; r < L.rows; r++) {
    let rowSum = 0;
    for (let c = 0; c < L.cols; c++) rowSum += L.get(r, c);
    assertCloseTo(rowSum, 0, 1e-12, `row ${r}`);
  }
});

Deno.test("graphLaplacian — smallest eigenvalue is 0", () => {
  // For any connected graph, L has exactly one zero eigenvalue.
  // Verify: L * [1,1,...,1]^T = 0.
  const A = Matrix.from([
    [0, 1, 0],
    [1, 0, 1],
    [0, 1, 0],
  ]);
  const L = graphLaplacian(A);
  const ones = new Vector([1, 1, 1]);
  const result = L.mulVec(ones);
  for (let i = 0; i < result.length; i++) {
    assertCloseTo(result.get(i), 0, 1e-12);
  }
});

// ── k-means tests ────────────────────────────────────────────────────

Deno.test("kMeans — two obvious clusters", () => {
  const points = [
    [0, 0],
    [0.1, 0],
    [0, 0.1],
    [10, 10],
    [10.1, 10],
    [10, 10.1],
  ];
  const labels = kMeans(points, 2);
  // First 3 should be same cluster, last 3 should be same cluster.
  assertEquals(labels[0], labels[1]);
  assertEquals(labels[1], labels[2]);
  assertEquals(labels[3], labels[4]);
  assertEquals(labels[4], labels[5]);
  // The two groups should be different.
  assert(labels[0] !== labels[3]);
});

Deno.test("kMeans — k=1 assigns all to cluster 0", () => {
  const points = [[1], [2], [3]];
  const labels = kMeans(points, 1);
  assertEquals(labels, [0, 0, 0]);
});

// ── Spectral clustering tests ────────────────────────────────────────

Deno.test("spectralCluster — two disconnected components", () => {
  // Two triangles, no edges between them.
  const A = Matrix.from([
    [0, 1, 1, 0, 0, 0],
    [1, 0, 1, 0, 0, 0],
    [1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1],
    [0, 0, 0, 1, 0, 1],
    [0, 0, 0, 1, 1, 0],
  ]);
  const labels = spectralCluster(A, 2);
  // Nodes 0,1,2 should be one cluster; 3,4,5 another.
  assertEquals(labels[0], labels[1]);
  assertEquals(labels[1], labels[2]);
  assertEquals(labels[3], labels[4]);
  assertEquals(labels[4], labels[5]);
  assert(labels[0] !== labels[3]);
});

Deno.test("spectralCluster — single cluster", () => {
  const A = Matrix.from([
    [0, 1, 1],
    [1, 0, 1],
    [1, 1, 0],
  ]);
  const labels = spectralCluster(A, 1);
  assertEquals(labels, [0, 0, 0]);
});

Deno.test("spectralCluster — barbell graph", () => {
  // Two cliques of 3 connected by a single edge.
  // 0-1, 0-2, 1-2 | 3-4, 3-5, 4-5 | bridge: 2-3
  const A = Matrix.from([
    [0, 1, 1, 0, 0, 0],
    [1, 0, 1, 0, 0, 0],
    [1, 1, 0, 1, 0, 0],
    [0, 0, 1, 0, 1, 1],
    [0, 0, 0, 1, 0, 1],
    [0, 0, 0, 1, 1, 0],
  ]);
  const labels = spectralCluster(A, 2);
  // Should split into {0,1,2} and {3,4,5}.
  assertEquals(labels[0], labels[1]);
  assertEquals(labels[1], labels[2]);
  assertEquals(labels[3], labels[4]);
  assertEquals(labels[4], labels[5]);
  assert(labels[0] !== labels[3]);
});
