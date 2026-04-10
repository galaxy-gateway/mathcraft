/**
 * qrEigenvalues — QR algorithm with shifts for eigenvalues of a symmetric matrix.
 *
 * Iteratively applies QR decomposition: A_k = Q_k R_k, A_{k+1} = R_k Q_k.
 * With Wilkinson shifts, the method converges cubically for symmetric matrices.
 *
 * @example
 * ```ts
 * import { qrEigenvalues } from "./mod.ts";
 * const eigenvalues = qrEigenvalues(A);
 * ```
 */

import { Matrix, Vector } from "@math/core/linalg";

/**
 * Compute the eigenvalues of a symmetric matrix using the QR algorithm
 * with Wilkinson shifts.
 *
 * The algorithm iterates A_{k+1} = R_k Q_k + shift * I, where Q_k R_k is
 * the QR decomposition of A_k - shift * I. The shift accelerates
 * convergence by targeting the eigenvalue closest to the bottom-right
 * corner element.
 *
 * @param A - A symmetric n x n matrix.
 * @param maxIter - Maximum total QR iterations (default 1000).
 * @param tol - Convergence tolerance (default 1e-10).
 * @returns Eigenvalues as a Vector, sorted in ascending order.
 */
export function qrEigenvalues(A: Matrix, maxIter = 1000, tol = 1e-10): Vector {
  const n = A.rows;
  if (A.cols !== n) {
    throw new RangeError(`qrEigenvalues requires a square matrix, got ${A.rows}x${A.cols}`);
  }

  // Work with a mutable copy
  let M = A.toArray();
  const eigenvalues: number[] = [];

  // Deflate from size n down to 1
  let size = n;
  let totalIter = 0;

  while (size > 1 && totalIter < maxIter) {
    // Check if the sub-diagonal element is small enough to deflate
    const subDiag = Math.abs(M[size - 1][size - 2]);
    const diagSum = Math.abs(M[size - 1][size - 1]) + Math.abs(M[size - 2][size - 2]);
    if (subDiag < tol * (diagSum + tol)) {
      // Deflate: bottom-right element is an eigenvalue
      eigenvalues.push(M[size - 1][size - 1]);
      size--;
      // Shrink the working matrix
      M = M.slice(0, size).map((row) => row.slice(0, size));
      continue;
    }

    // Wilkinson shift: eigenvalue of the 2x2 bottom-right corner closest
    // to M[size-1][size-1]
    const a = M[size - 2][size - 2];
    const b = M[size - 2][size - 1];
    const c = M[size - 1][size - 2];
    const d = M[size - 1][size - 1];
    const shift = wilkinsonShift(a, b, c, d);

    // Apply shift: M = M - shift * I
    for (let i = 0; i < size; i++) {
      M[i][i] -= shift;
    }

    // QR decomposition using Givens rotations (efficient for near-triangular)
    const { cs, sn } = givensQR(M, size);

    // Form RQ: apply the rotations from the right
    applyGivensRight(M, cs, sn, size);

    // Undo shift: M = M + shift * I
    for (let i = 0; i < size; i++) {
      M[i][i] += shift;
    }

    totalIter++;
  }

  // The last remaining diagonal element
  if (size === 1) {
    eigenvalues.push(M[0][0]);
  }

  // Sort in ascending order
  eigenvalues.sort((a, b) => a - b);
  return new Vector(eigenvalues);
}

/**
 * Compute the Wilkinson shift from the 2x2 bottom-right corner.
 * Returns the eigenvalue of [[a,b],[c,d]] closest to d.
 */
function wilkinsonShift(a: number, b: number, c: number, d: number): number {
  const trace = a + d;
  const det = a * d - b * c;
  const disc = Math.sqrt(Math.max(0, trace * trace / 4 - det));
  const e1 = trace / 2 + disc;
  const e2 = trace / 2 - disc;
  // Return whichever is closer to d
  return Math.abs(e1 - d) < Math.abs(e2 - d) ? e1 : e2;
}

/**
 * Perform QR decomposition in-place using Givens rotations.
 * Transforms M into R, returns the rotation parameters.
 */
function givensQR(
  M: number[][],
  size: number,
): { cs: number[]; sn: number[] } {
  const cs: number[] = [];
  const sn: number[] = [];

  for (let i = 0; i < size - 1; i++) {
    const a = M[i][i];
    const b = M[i + 1][i];
    const r = Math.sqrt(a * a + b * b);
    const c = r > 0 ? a / r : 1;
    const s = r > 0 ? -b / r : 0;
    cs.push(c);
    sn.push(s);

    // Apply Givens rotation to rows i and i+1 (left multiply)
    for (let j = 0; j < size; j++) {
      const t1 = M[i][j];
      const t2 = M[i + 1][j];
      M[i][j] = c * t1 - s * t2;
      M[i + 1][j] = s * t1 + c * t2;
    }
  }

  return { cs, sn };
}

/**
 * Apply the stored Givens rotations from the right to form RQ.
 */
function applyGivensRight(
  M: number[][],
  cs: number[],
  sn: number[],
  size: number,
): void {
  for (let i = 0; i < size - 1; i++) {
    const c = cs[i];
    const s = sn[i];
    for (let j = 0; j < size; j++) {
      const t1 = M[j][i];
      const t2 = M[j][i + 1];
      M[j][i] = c * t1 - s * t2;
      M[j][i + 1] = s * t1 + c * t2;
    }
  }
}
