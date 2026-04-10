/**
 * svd — Singular Value Decomposition via one-sided Jacobi rotations.
 *
 * Computes A = U * diag(S) * Vt for small matrices. The Jacobi method
 * iteratively applies plane rotations to diagonalize A^T A, yielding V
 * and the singular values. U is then recovered from A * V * diag(1/S).
 *
 * @example
 * ```ts
 * import { svd } from "./mod.ts";
 * const { U, S, Vt } = svd(A);
 * // A ≈ U * diag(S) * Vt
 * ```
 */

import { Matrix, Vector } from "@math/core/linalg";

/** Result of SVD: A = U * diag(S) * Vt. */
export interface SVDResult {
  /** Left singular vectors (m x m orthogonal matrix). */
  U: Matrix;
  /** Singular values as a vector, in decreasing order. */
  S: Vector;
  /** Right singular vectors transposed (n x n orthogonal matrix). */
  Vt: Matrix;
}

/**
 * Compute the SVD of an m x n matrix A using the one-sided Jacobi method.
 *
 * Suitable for small matrices (educational implementation). The algorithm
 * iteratively applies Jacobi rotations to orthogonalize the columns of A,
 * converging to the singular vectors and values.
 *
 * @param A - An m x n matrix.
 * @param maxIter - Maximum number of sweeps (default 100).
 * @param tol - Convergence tolerance (default 1e-12).
 * @returns {U, S, Vt} such that A = U * diag(S) * Vt.
 */
export function svd(A: Matrix, maxIter = 100, tol = 1e-12): SVDResult {
  const m = A.rows;
  const n = A.cols;

  // Work on B = copy of A (mutable), and V starts as identity
  const B: number[][] = A.toArray();
  const V: number[][] = Matrix.identity(n).toArray();

  // One-sided Jacobi: iteratively orthogonalize columns of B
  // by applying rotations on the right.
  for (let iter = 0; iter < maxIter; iter++) {
    let offNorm = 0;

    // Sweep over all pairs (p, q) with p < q
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        // Compute B[:,p]^T B[:,q] and related quantities
        let alpha = 0; // B[:,p] . B[:,p]
        let beta = 0; // B[:,q] . B[:,q]
        let gamma = 0; // B[:,p] . B[:,q]
        for (let i = 0; i < m; i++) {
          alpha += B[i][p] * B[i][p];
          beta += B[i][q] * B[i][q];
          gamma += B[i][p] * B[i][q];
        }

        offNorm += gamma * gamma;

        // If columns are already orthogonal, skip
        if (Math.abs(gamma) < tol * Math.sqrt(alpha * beta + tol)) {
          continue;
        }

        // Compute Jacobi rotation angle
        const zeta = (beta - alpha) / (2 * gamma);
        const t = Math.sign(zeta) / (Math.abs(zeta) + Math.sqrt(1 + zeta * zeta));
        const c = 1 / Math.sqrt(1 + t * t);
        const s = t * c;

        // Apply rotation to columns p, q of B
        for (let i = 0; i < m; i++) {
          const bp = B[i][p];
          const bq = B[i][q];
          B[i][p] = c * bp - s * bq;
          B[i][q] = s * bp + c * bq;
        }

        // Apply rotation to columns p, q of V
        for (let i = 0; i < n; i++) {
          const vp = V[i][p];
          const vq = V[i][q];
          V[i][p] = c * vp - s * vq;
          V[i][q] = s * vp + c * vq;
        }
      }
    }

    // Check convergence: off-diagonal of B^T B should be small
    if (Math.sqrt(offNorm) < tol) break;
  }

  // Extract singular values from column norms of B, and build U
  const sigma: number[] = new Array(n);
  const uCols: number[][] = Array.from({ length: n }, () => new Array(m).fill(0));

  for (let j = 0; j < n; j++) {
    let norm = 0;
    for (let i = 0; i < m; i++) {
      norm += B[i][j] * B[i][j];
    }
    sigma[j] = Math.sqrt(norm);
    // U column = B column / sigma (normalized)
    if (sigma[j] > tol) {
      for (let i = 0; i < m; i++) {
        uCols[j][i] = B[i][j] / sigma[j];
      }
    }
  }

  // Sort singular values in decreasing order
  const indices = Array.from({ length: n }, (_, i) => i);
  indices.sort((a, b) => sigma[b] - sigma[a]);

  const sortedSigma = indices.map((i) => sigma[i]);

  // Build sorted U (m x m, pad with orthogonal complement if m > n)
  // For simplicity, we build the thin U (m x n) first, then extend
  const uFlat = new Array(m * m).fill(0);
  for (let j = 0; j < n; j++) {
    const srcJ = indices[j];
    for (let i = 0; i < m; i++) {
      uFlat[i * m + j] = uCols[srcJ][i];
    }
  }

  // If m > n, extend U with orthogonal complement (simple approach for small matrices)
  if (m > n) {
    // Use Gram-Schmidt to fill remaining columns
    for (let j = n; j < m; j++) {
      // Start with a standard basis vector
      const col = new Array(m).fill(0);
      col[j] = 1;

      // Orthogonalize against existing columns
      for (let k = 0; k < j; k++) {
        let dot = 0;
        for (let i = 0; i < m; i++) {
          dot += col[i] * uFlat[i * m + k];
        }
        for (let i = 0; i < m; i++) {
          col[i] -= dot * uFlat[i * m + k];
        }
      }

      // Normalize
      let norm = 0;
      for (let i = 0; i < m; i++) norm += col[i] * col[i];
      norm = Math.sqrt(norm);
      if (norm > tol) {
        for (let i = 0; i < m; i++) {
          uFlat[i * m + j] = col[i] / norm;
        }
      }
    }
  }

  // Build sorted V^T
  const vtFlat = new Array(n * n);
  for (let i = 0; i < n; i++) {
    const srcI = indices[i];
    for (let j = 0; j < n; j++) {
      vtFlat[i * n + j] = V[j][srcI]; // V^T[i][j] = V[j][i]
    }
  }

  return {
    U: new Matrix(m, m, uFlat),
    S: new Vector(sortedSigma),
    Vt: new Matrix(n, n, vtFlat),
  };
}
