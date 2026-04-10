/**
 * qr — QR decomposition via classical Gram-Schmidt orthogonalization.
 *
 * Factors an m x n matrix A (m >= n) into A = QR where Q is m x n with
 * orthonormal columns and R is n x n upper-triangular.
 *
 * @example
 * ```ts
 * import { qr, qrSolve } from "./mod.ts";
 * const { Q, R } = qr(A);
 * const x = qrSolve(Q, R, b);
 * ```
 */

import { Matrix, Vector } from "@math/core/linalg";

/** Result of QR decomposition: A = QR. */
export interface QRResult {
  /** Matrix with orthonormal columns (m x n). */
  Q: Matrix;
  /** Upper-triangular matrix (n x n). */
  R: Matrix;
}

/**
 * Compute the thin QR decomposition of A using classical Gram-Schmidt.
 *
 * Given an m x n matrix A with m >= n and linearly independent columns,
 * returns Q (m x n, orthonormal columns) and R (n x n, upper-triangular)
 * such that A = QR.
 *
 * @param A - An m x n matrix with m >= n.
 * @returns {Q, R} such that A = Q * R.
 */
export function qr(A: Matrix): QRResult {
  const m = A.rows;
  const n = A.cols;
  if (m < n) {
    throw new RangeError(`qr requires m >= n, got ${m}x${n}`);
  }

  // Extract columns of A as Vector[]
  const cols: Vector[] = [];
  for (let j = 0; j < n; j++) {
    cols.push(A.col(j));
  }

  // Gram-Schmidt: build orthonormal vectors q[0..n-1]
  const q: Vector[] = [];
  const rData: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let j = 0; j < n; j++) {
    // Start with column j of A
    let v = cols[j];

    // Subtract projections onto previously computed q vectors
    for (let i = 0; i < j; i++) {
      const rij = q[i].dot(cols[j]);
      rData[i][j] = rij;
      v = v.sub(q[i].scale(rij));
    }

    // Normalize
    const norm = v.norm();
    if (norm < 1e-12) {
      throw new Error(`Column ${j} is linearly dependent (near-zero norm after orthogonalization)`);
    }
    rData[j][j] = norm;
    q.push(v.scale(1 / norm));
  }

  // Build Q matrix from q vectors (as columns)
  const qFlat = new Array(m * n);
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      qFlat[r * n + c] = q[c].get(r);
    }
  }

  return {
    Q: new Matrix(m, n, qFlat),
    R: Matrix.from(rData),
  };
}

/**
 * Solve the linear system Ax = b using a precomputed QR decomposition.
 *
 * Since A = QR and Q has orthonormal columns, Ax = b becomes Rx = Q^T b.
 * R is upper-triangular, so we solve by back substitution.
 *
 * @param Q - Orthogonal matrix from qr().
 * @param R - Upper-triangular matrix from qr().
 * @param b - Right-hand-side vector.
 * @returns Solution vector x.
 */
export function qrSolve(Q: Matrix, R: Matrix, b: Vector): Vector {
  const n = R.rows;
  if (b.length !== Q.rows) {
    throw new RangeError(`Vector length ${b.length} does not match Q rows ${Q.rows}`);
  }

  // Compute Q^T * b
  const qtb = Q.transpose().mulVec(b);

  // Back substitution on Rx = Q^T b
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = qtb.get(i);
    for (let j = i + 1; j < n; j++) {
      sum -= R.get(i, j) * x[j];
    }
    if (Math.abs(R.get(i, i)) < 1e-12) {
      throw new Error("Singular R: zero diagonal in back substitution");
    }
    x[i] = sum / R.get(i, i);
  }

  return new Vector(x);
}
