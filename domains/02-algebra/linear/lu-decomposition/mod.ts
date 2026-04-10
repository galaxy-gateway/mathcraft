/**
 * lu — LU decomposition with partial pivoting.
 *
 * Factors a square matrix A into PA = LU where L is unit lower-triangular,
 * U is upper-triangular, and P is a permutation matrix.
 *
 * @example
 * ```ts
 * import { lu, luSolve } from "./mod.ts";
 * const { L, U, P } = lu(A);
 * const x = luSolve(L, U, P, b);
 * ```
 */

import { Matrix, Vector } from "@math/core/linalg";

/** Result of LU decomposition: PA = LU. */
export interface LUResult {
  /** Unit lower-triangular matrix. */
  L: Matrix;
  /** Upper-triangular matrix. */
  U: Matrix;
  /** Permutation matrix recording row swaps. */
  P: Matrix;
}

/**
 * Compute the LU decomposition of a square matrix with partial pivoting.
 *
 * Returns L, U, P such that PA = LU.
 *
 * @param A - An n x n matrix.
 * @returns {L, U, P} such that P * A = L * U.
 */
export function lu(A: Matrix): LUResult {
  const n = A.rows;
  if (A.cols !== n) {
    throw new RangeError(`lu requires a square matrix, got ${A.rows}x${A.cols}`);
  }

  // Work with mutable arrays for L, U
  const u: number[][] = A.toArray();
  const l: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const perm: number[] = Array.from({ length: n }, (_, i) => i);

  // Initialize L diagonal to 1
  for (let i = 0; i < n; i++) l[i][i] = 1;

  for (let col = 0; col < n; col++) {
    // Partial pivoting: find the row with the largest element in this column
    let maxVal = Math.abs(u[col][col]);
    let maxRow = col;
    for (let r = col + 1; r < n; r++) {
      const v = Math.abs(u[r][col]);
      if (v > maxVal) {
        maxVal = v;
        maxRow = r;
      }
    }

    // Swap rows in U, L (only the already-computed part), and permutation
    if (maxRow !== col) {
      [u[col], u[maxRow]] = [u[maxRow], u[col]];
      [perm[col], perm[maxRow]] = [perm[maxRow], perm[col]];
      // Swap the already-computed L entries (columns 0..col-1)
      for (let c = 0; c < col; c++) {
        [l[col][c], l[maxRow][c]] = [l[maxRow][c], l[col][c]];
      }
    }

    if (Math.abs(u[col][col]) < 1e-12) {
      // Pivot is zero; skip (matrix is singular)
      continue;
    }

    // Eliminate below
    for (let r = col + 1; r < n; r++) {
      const factor = u[r][col] / u[col][col];
      l[r][col] = factor;
      for (let c = col; c < n; c++) {
        u[r][c] -= factor * u[col][c];
      }
    }
  }

  // Build permutation matrix from perm array
  const pData = new Array(n * n).fill(0);
  for (let i = 0; i < n; i++) {
    pData[i * n + perm[i]] = 1;
  }

  return {
    L: Matrix.from(l),
    U: Matrix.from(u),
    P: new Matrix(n, n, pData),
  };
}

/**
 * Solve Ax = b using a precomputed LU decomposition (PA = LU).
 *
 * First solves Ly = Pb by forward substitution, then Ux = y by back
 * substitution.
 *
 * @param L - Unit lower-triangular matrix from lu().
 * @param U - Upper-triangular matrix from lu().
 * @param P - Permutation matrix from lu().
 * @param b - Right-hand-side vector.
 * @returns Solution vector x.
 */
export function luSolve(L: Matrix, U: Matrix, P: Matrix, b: Vector): Vector {
  const n = L.rows;
  if (b.length !== n) {
    throw new RangeError(`Vector length ${b.length} does not match matrix size ${n}`);
  }

  // Compute Pb
  const pb = P.mulVec(b);

  // Forward substitution: Ly = Pb
  const y = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let sum = pb.get(i);
    for (let j = 0; j < i; j++) {
      sum -= L.get(i, j) * y[j];
    }
    y[i] = sum; // L[i][i] = 1 (unit lower-triangular)
  }

  // Back substitution: Ux = y
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = y[i];
    for (let j = i + 1; j < n; j++) {
      sum -= U.get(i, j) * x[j];
    }
    if (Math.abs(U.get(i, i)) < 1e-12) {
      throw new Error("Singular matrix: zero pivot in U during back substitution");
    }
    x[i] = sum / U.get(i, i);
  }

  return new Vector(x);
}
