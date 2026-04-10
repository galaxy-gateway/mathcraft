/**
 * spectral-clustering — Partition graph nodes using eigenvectors of the
 * graph Laplacian.
 *
 * Steps:
 * 1. Build the graph Laplacian L = D - A (or normalized variant).
 * 2. Compute the k smallest eigenvectors of L.
 * 3. Embed each node into R^k using those eigenvectors as coordinates.
 * 4. Run k-means in the embedding space.
 *
 * @example
 * ```ts
 * import { spectralCluster } from "./mod.ts";
 * import { Matrix } from "@math/core/linalg";
 * const A = Matrix.from([
 *   [0, 1, 1, 0, 0],
 *   [1, 0, 1, 0, 0],
 *   [1, 1, 0, 1, 0],
 *   [0, 0, 1, 0, 1],
 *   [0, 0, 0, 1, 0],
 * ]);
 * spectralCluster(A, 2); // e.g. [0, 0, 0, 1, 1]
 * ```
 */

import { Matrix, Vector } from "@math/core/linalg";

/**
 * Spectral clustering on an adjacency matrix.
 *
 * @param adjacencyMatrix  Symmetric n x n matrix (weighted or 0/1).
 * @param k                Number of clusters.
 * @param maxIter          Max iterations for k-means (default 100).
 * @returns                Array of length n with cluster labels 0..k-1.
 */
export function spectralCluster(
  adjacencyMatrix: Matrix,
  k: number,
  maxIter = 100,
): number[] {
  const n = adjacencyMatrix.rows;
  if (n === 0) return [];
  if (k <= 0 || k > n) throw new RangeError(`k must be in [1, n], got ${k}`);

  // 1. Build graph Laplacian L = D - A.
  const L = graphLaplacian(adjacencyMatrix);

  // 2. Find the k smallest eigenvectors of L.
  const eigenvectors = smallestEigenvectors(L, k);

  // 3. Each row of the n x k eigenvector matrix is a point in R^k.
  const points: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < k; j++) {
      row.push(eigenvectors[j].get(i));
    }
    points.push(row);
  }

  // 4. k-means clustering in eigenspace.
  return kMeans(points, k, maxIter);
}

/**
 * Build the unnormalized graph Laplacian L = D - A.
 *
 * D is the diagonal degree matrix where D[i][i] = sum of row i of A.
 */
export function graphLaplacian(A: Matrix): Matrix {
  const n = A.rows;
  const data = new Array(n * n).fill(0);
  for (let i = 0; i < n; i++) {
    let degree = 0;
    for (let j = 0; j < n; j++) {
      degree += A.get(i, j);
      if (i !== j) {
        data[i * n + j] = -A.get(i, j);
      }
    }
    data[i * n + i] = degree;
  }
  return new Matrix(n, n, data);
}

/**
 * Find the k eigenvectors corresponding to the k smallest eigenvalues
 * of a symmetric positive semi-definite matrix.
 *
 * Uses inverse power iteration with deflation. This is a simple
 * educational implementation — not numerically robust for large matrices.
 *
 * For the Laplacian, the smallest eigenvalue is always 0 (eigenvector =
 * all ones). We include it; k-means will ignore the constant dimension.
 */
export function smallestEigenvectors(
  M: Matrix,
  k: number,
  maxIter = 300,
  tol = 1e-8,
): Vector[] {
  const n = M.rows;
  const vectors: Vector[] = [];

  // Shift: we want the smallest eigenvalues of M. Use (M + sigma*I)^{-1}
  // via iterative solve — but for simplicity, we use a shifted power
  // method: eigenvalues of (sigma*I - M) turn smallest into largest.
  // Choose sigma slightly above the largest eigenvalue estimate.
  const sigma = estimateLargestEigenvalue(M) + 1;
  // S = sigma*I - M  =>  largest eigenvalues of S correspond to smallest of M.
  const S = Matrix.identity(n).scale(sigma).sub(M);

  let deflated = S;

  for (let idx = 0; idx < k; idx++) {
    // Power iteration on deflated matrix to find largest eigenvector.
    // Use a different seed per eigenvector to avoid degenerate starts.
    let v = randomVector(n, 42 + idx * 1000);
    v = v.normalized();

    for (let iter = 0; iter < maxIter; iter++) {
      const Mv = deflated.mulVec(v);
      const norm = Mv.norm();
      if (norm < 1e-14) break; // zero eigenvalue
      const vNew = Mv.scale(1 / norm);
      // Check convergence (angle between v and vNew).
      const dot = Math.abs(v.dot(vNew));
      v = vNew;
      if (dot > 1 - tol) break;
    }

    vectors.push(v);

    // Deflate: remove the component along this eigenvector.
    // S' = S - lambda * v * v^T  where lambda = v^T S v.
    const lambda = v.dot(deflated.mulVec(v));
    deflated = deflateMatrix(deflated, v, lambda);
  }

  return vectors;
}

/** Estimate the largest eigenvalue via a few power-iteration steps. */
function estimateLargestEigenvalue(M: Matrix, steps = 50): number {
  const n = M.rows;
  let v = randomVector(n);
  v = v.normalized();
  let eigenvalue = 0;
  for (let i = 0; i < steps; i++) {
    const Mv = M.mulVec(v);
    eigenvalue = v.dot(Mv);
    const norm = Mv.norm();
    if (norm < 1e-14) break;
    v = Mv.scale(1 / norm);
  }
  return Math.abs(eigenvalue);
}

/** Deflate matrix: M' = M - lambda * v * v^T. */
function deflateMatrix(M: Matrix, v: Vector, lambda: number): Matrix {
  const n = M.rows;
  const data = [...M.data];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      data[i * n + j] -= lambda * v.get(i) * v.get(j);
    }
  }
  return new Matrix(n, n, data);
}

/** Deterministic "random" vector seeded by `seed`. */
function randomVector(n: number, seed = 42): Vector {
  let s = seed;
  const values: number[] = [];
  for (let i = 0; i < n; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    values.push(s / 0x7fffffff - 0.5);
  }
  return new Vector(values);
}

/**
 * Simple k-means clustering.
 *
 * @param points  Array of n points, each a number[] of dimension d.
 * @param k       Number of clusters.
 * @param maxIter Maximum iterations.
 * @returns       Array of n cluster labels (0..k-1).
 */
export function kMeans(points: number[][], k: number, maxIter = 100): number[] {
  const n = points.length;
  if (n === 0) return [];
  const d = points[0].length;

  // Initialize centroids: pick first k distinct points (deterministic).
  const centroids: number[][] = [];
  const seen = new Set<string>();
  for (let i = 0; i < n && centroids.length < k; i++) {
    const key = points[i].join(",");
    if (!seen.has(key)) {
      seen.add(key);
      centroids.push([...points[i]]);
    }
  }
  // If not enough distinct points, duplicate the last.
  while (centroids.length < k) {
    centroids.push([...centroids[centroids.length - 1]]);
  }

  const labels = new Array<number>(n).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    // Assign each point to nearest centroid.
    let changed = false;
    for (let i = 0; i < n; i++) {
      let best = 0;
      let bestDist = Infinity;
      for (let c = 0; c < k; c++) {
        let dist = 0;
        for (let j = 0; j < d; j++) {
          const diff = points[i][j] - centroids[c][j];
          dist += diff * diff;
        }
        if (dist < bestDist) {
          bestDist = dist;
          best = c;
        }
      }
      if (labels[i] !== best) {
        labels[i] = best;
        changed = true;
      }
    }

    if (!changed) break;

    // Recompute centroids.
    const sums: number[][] = [];
    const counts = new Array(k).fill(0);
    for (let c = 0; c < k; c++) sums.push(new Array(d).fill(0));
    for (let i = 0; i < n; i++) {
      const c = labels[i];
      counts[c]++;
      for (let j = 0; j < d; j++) sums[c][j] += points[i][j];
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        for (let j = 0; j < d; j++) centroids[c][j] = sums[c][j] / counts[c];
      }
    }
  }

  return labels;
}
