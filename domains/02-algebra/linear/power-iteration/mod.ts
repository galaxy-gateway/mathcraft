/**
 * powerIteration — Find the dominant eigenvalue and eigenvector of a matrix.
 *
 * Repeatedly multiplies a vector by A and normalizes, converging to the
 * eigenvector associated with the largest-magnitude eigenvalue.
 *
 * @example
 * ```ts
 * import { powerIteration } from "./mod.ts";
 * const { eigenvalue, eigenvector } = powerIteration(A);
 * ```
 */

import { Matrix, Vector } from "@math/core/linalg";

/** Result of power iteration. */
export interface PowerIterationResult {
  /** The dominant eigenvalue (largest in absolute value). */
  eigenvalue: number;
  /** The corresponding eigenvector (unit norm). */
  eigenvector: Vector;
  /** Number of iterations performed. */
  iterations: number;
}

/**
 * Compute the dominant eigenvalue and eigenvector of a square matrix A
 * using the power iteration method.
 *
 * The method converges when the eigenvalue of largest absolute value is
 * strictly larger than the second largest. Convergence rate is
 * |lambda_2 / lambda_1|.
 *
 * @param A - A square matrix.
 * @param maxIter - Maximum iterations (default 1000).
 * @param tol - Convergence tolerance for the eigenvalue (default 1e-10).
 * @param x0 - Optional initial vector (default: ones).
 * @returns The dominant eigenvalue, its eigenvector, and iteration count.
 */
export function powerIteration(
  A: Matrix,
  maxIter = 1000,
  tol = 1e-10,
  x0?: Vector,
): PowerIterationResult {
  const n = A.rows;
  if (A.cols !== n) {
    throw new RangeError(`powerIteration requires a square matrix, got ${A.rows}x${A.cols}`);
  }

  // Initialize with ones vector (or user-provided x0)
  let x = x0 ?? Vector.ones(n);
  if (x.length !== n) {
    throw new RangeError(`Initial vector length ${x.length} does not match matrix size ${n}`);
  }
  x = x.normalized();

  let eigenvalue = 0;

  let iter = 0;
  for (; iter < maxIter; iter++) {
    // Multiply: y = A * x
    const y = A.mulVec(x);

    // Rayleigh quotient: eigenvalue estimate = x^T A x / (x^T x)
    // Since x is normalized, this is just x . y
    const newEigenvalue = x.dot(y);

    // Normalize
    const norm = y.norm();
    if (norm < 1e-15) {
      throw new Error("Power iteration collapsed to zero vector");
    }
    x = y.scale(1 / norm);

    // Check convergence
    if (Math.abs(newEigenvalue - eigenvalue) < tol) {
      eigenvalue = newEigenvalue;
      iter++;
      break;
    }
    eigenvalue = newEigenvalue;
  }

  return {
    eigenvalue,
    eigenvector: x,
    iterations: iter,
  };
}
