/**
 * gaussEliminate — Solve Ax = b via Gaussian elimination with partial pivoting.
 *
 * Also computes the rank and determinant of A as by-products of the
 * elimination process.
 *
 * @example
 * ```ts
 * import { gaussEliminate } from "./mod.ts";
 * const A = Matrix.from([[2, 1], [5, 7]]);
 * const b = new Vector([11, 13]);
 * const { x, rank, determinant } = gaussEliminate(A, b);
 * ```
 */

import { Matrix, Vector } from "@math/core/linalg";

/** Result of Gaussian elimination. */
export interface GaussResult {
  /** Solution vector x such that Ax = b. */
  x: Vector;
  /** Rank of the coefficient matrix A. */
  rank: number;
  /** Determinant of A (only meaningful for square matrices). */
  determinant: number;
}

/**
 * Solve the linear system Ax = b using Gaussian elimination with partial
 * pivoting. Returns the solution vector, the rank, and the determinant.
 *
 * Partial pivoting swaps rows to place the largest-magnitude element in the
 * pivot position, improving numerical stability.
 *
 * @param A - An n x n coefficient matrix.
 * @param b - A length-n right-hand-side vector.
 * @returns The solution x, the rank, and the determinant of A.
 * @throws If the system is singular or dimensions are incompatible.
 */
export function gaussEliminate(A: Matrix, b: Vector): GaussResult {
  const n = A.rows;
  if (A.cols !== n) {
    throw new RangeError(`gaussEliminate requires a square matrix, got ${A.rows}x${A.cols}`);
  }
  if (b.length !== n) {
    throw new RangeError(`Vector length ${b.length} does not match matrix size ${n}`);
  }

  // Build augmented matrix as mutable 2D array [A | b]
  const aug: number[][] = [];
  for (let r = 0; r < n; r++) {
    const row: number[] = [];
    for (let c = 0; c < n; c++) {
      row.push(A.get(r, c));
    }
    row.push(b.get(r));
    aug.push(row);
  }

  let det = 1;
  let rank = 0;
  let swaps = 0;

  // Forward elimination with partial pivoting
  for (let col = 0; col < n; col++) {
    // Find the pivot: row with largest absolute value in this column
    let maxVal = Math.abs(aug[col][col]);
    let maxRow = col;
    for (let r = col + 1; r < n; r++) {
      const v = Math.abs(aug[r][col]);
      if (v > maxVal) {
        maxVal = v;
        maxRow = r;
      }
    }

    // If pivot is essentially zero, the matrix is singular in this column
    if (maxVal < 1e-12) {
      det = 0;
      continue;
    }

    // Swap rows if needed
    if (maxRow !== col) {
      [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
      swaps++;
    }

    rank++;
    det *= aug[col][col];

    // Eliminate entries below the pivot
    for (let r = col + 1; r < n; r++) {
      const factor = aug[r][col] / aug[col][col];
      for (let c = col; c <= n; c++) {
        aug[r][c] -= factor * aug[col][c];
      }
    }
  }

  // Apply sign from row swaps
  if (swaps % 2 === 1) det = -det;

  if (rank < n) {
    throw new Error(`Singular matrix (rank ${rank} < ${n}): system has no unique solution`);
  }

  // Back substitution
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let sum = aug[r][n]; // right-hand side
    for (let c = r + 1; c < n; c++) {
      sum -= aug[r][c] * x[c];
    }
    x[r] = sum / aug[r][r];
  }

  return {
    x: new Vector(x),
    rank,
    determinant: det,
  };
}
