/**
 * pagerank — PageRank via power iteration on the Google matrix.
 *
 * Given an adjacency matrix of a web graph, computes the stationary
 * distribution of the random surfer model:
 *   M = d * H + (1 - d) / n * ones
 * where H is the column-stochastic hyperlink matrix and d is the
 * damping factor.
 *
 * @example
 * ```ts
 * import { pagerank } from "./mod.ts";
 * const adj = Matrix.from([[0,1,1],[1,0,0],[0,1,0]]);
 * const ranks = pagerank(adj);
 * ```
 */

import { Matrix, Vector } from "@math/core/linalg";

/**
 * Compute PageRank scores for a directed graph given its adjacency matrix.
 *
 * The adjacency matrix A has A[i][j] = 1 if there is a link from page i
 * to page j. The algorithm builds the column-stochastic Google matrix and
 * applies power iteration until convergence.
 *
 * @param adjacencyMatrix - n x n adjacency matrix (A[i][j] = 1 means i links to j).
 * @param damping - Damping factor (probability of following a link), default 0.85.
 * @param tol - Convergence tolerance on the L1 norm of the rank change, default 1e-10.
 * @param maxIter - Maximum number of iterations, default 1000.
 * @returns PageRank scores as a Vector that sums to 1.
 */
export function pagerank(
  adjacencyMatrix: Matrix,
  damping = 0.85,
  tol = 1e-10,
  maxIter = 1000,
): Vector {
  const n = adjacencyMatrix.rows;
  if (adjacencyMatrix.cols !== n) {
    throw new RangeError(
      `pagerank requires a square adjacency matrix, got ${adjacencyMatrix.rows}x${adjacencyMatrix.cols}`,
    );
  }

  // Build the column-stochastic hyperlink matrix H.
  // H[j][i] = A[i][j] / outDegree(i), i.e., H is the transpose of A
  // normalized by column sums of A.
  //
  // For dangling nodes (no outgoing links), we distribute equally to all
  // pages (random teleport).

  // Compute out-degrees (row sums of A)
  const outDegree = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      outDegree[i] += adjacencyMatrix.get(i, j);
    }
  }

  // Build the Google matrix column by column is expensive; instead, we
  // implement the matrix-vector product directly for power iteration.
  //
  // Google matrix: M = d * H + (1-d)/n * ones_matrix
  // where H[j][i] = A[i][j] / outDeg[i] if outDeg[i] > 0
  //                = 1/n                  if outDeg[i] = 0 (dangling)
  //
  // M * x = d * H * x + (1-d)/n * sum(x) * ones
  //
  // H * x: for each i (source page), distribute x[i] / outDeg[i] to each
  //        target j where A[i][j]=1.

  const teleport = (1 - damping) / n;

  // Initialize rank vector uniformly
  let rank = new Array(n).fill(1 / n);

  for (let iter = 0; iter < maxIter; iter++) {
    const newRank = new Array(n).fill(0);

    // Accumulate contributions from hyperlinks
    let danglingSum = 0;
    for (let i = 0; i < n; i++) {
      if (outDegree[i] === 0) {
        // Dangling node: distributes rank evenly
        danglingSum += rank[i];
      } else {
        const contrib = rank[i] / outDegree[i];
        for (let j = 0; j < n; j++) {
          if (adjacencyMatrix.get(i, j) > 0) {
            newRank[j] += damping * contrib;
          }
        }
      }
    }

    // Add dangling node contribution (distributed evenly) and teleport
    const danglingContrib = damping * danglingSum / n;
    const sumRank = rank.reduce((a, b) => a + b, 0);
    for (let j = 0; j < n; j++) {
      newRank[j] += danglingContrib + teleport * sumRank;
    }

    // Check convergence (L1 norm of difference)
    let diff = 0;
    for (let j = 0; j < n; j++) {
      diff += Math.abs(newRank[j] - rank[j]);
    }

    rank = newRank;

    if (diff < tol) break;
  }

  return new Vector(rank);
}
