/**
 * Linear regression from scratch — using `@math/core/linalg`.
 *
 * Implements two approaches:
 * 1. Normal equation: β = (XᵀX)⁻¹ Xᵀy (closed-form, small datasets)
 * 2. Gradient descent: iterative minimization of MSE
 *
 * @example
 * ```ts
 * import { normalEquation, gradientDescentLR } from "./mod.ts";
 * const X = Matrix.from([[1, 1], [1, 2], [1, 3]]);
 * const y = new Vector([1, 2, 3]);
 * normalEquation(X, y); // Vector ~ [0, 1] (intercept, slope)
 * ```
 */

import { Matrix } from "@math/core/linalg";
import { Vector } from "@math/core/linalg";

/**
 * Solve linear regression via the normal equation: β = (XᵀX)⁻¹ Xᵀy.
 *
 * X should include a column of ones if you want an intercept term.
 * Uses Gaussian elimination internally (not a library solve — we do it
 * inline for educational clarity).
 */
export function normalEquation(X: Matrix, y: Vector): Vector {
  const Xt = X.transpose();
  const XtX = Xt.mul(X);
  const Xty = Xt.mulVec(y);
  return solveLinearSystem(XtX, Xty);
}

/**
 * Solve linear regression via gradient descent on MSE.
 *
 * @param X Design matrix (m × n), with intercept column if desired.
 * @param y Response vector (m).
 * @param learningRate Step size.
 * @param iterations Number of gradient steps.
 * @returns The coefficient vector β.
 */
export function gradientDescentLR(
  X: Matrix,
  y: Vector,
  learningRate = 0.01,
  iterations = 1000,
): { beta: Vector; losses: number[] } {
  const m = X.rows;
  const n = X.cols;
  let beta = Vector.zeros(n);
  const losses: number[] = [];

  for (let iter = 0; iter < iterations; iter++) {
    // residual = X·β − y
    const pred = X.mulVec(beta);
    const residual = pred.sub(y);

    // MSE loss
    const mse = residual.dot(residual) / m;
    losses.push(mse);

    // gradient = (2/m) Xᵀ residual
    const grad = X.transpose().mulVec(residual).scale(2 / m);
    beta = beta.sub(grad.scale(learningRate));
  }

  return { beta, losses };
}

/**
 * Predict y from X and coefficients β.
 */
export function predict(X: Matrix, beta: Vector): Vector {
  return X.mulVec(beta);
}

/**
 * Mean squared error.
 */
export function mse(y: Vector, yHat: Vector): number {
  const diff = y.sub(yHat);
  return diff.dot(diff) / y.length;
}

/**
 * Solve Ax = b via Gaussian elimination with partial pivoting.
 * Internal helper — not exported. (For production, use
 * domains/02-algebra/linear/gauss-elimination.)
 */
function solveLinearSystem(A: Matrix, b: Vector): Vector {
  const n = A.rows;
  // Augmented matrix [A | b].
  const aug: number[][] = [];
  for (let r = 0; r < n; r++) {
    const row = new Array(n + 1);
    for (let c = 0; c < n; c++) row[c] = A.get(r, c);
    row[n] = b.get(r);
    aug.push(row);
  }

  // Forward elimination.
  for (let col = 0; col < n; col++) {
    // Partial pivoting.
    let maxRow = col;
    let maxVal = Math.abs(aug[col][col]);
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(aug[r][col]) > maxVal) {
        maxVal = Math.abs(aug[r][col]);
        maxRow = r;
      }
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-12) {
      throw new Error("Singular matrix in normal equation");
    }

    for (let r = col + 1; r < n; r++) {
      const factor = aug[r][col] / pivot;
      for (let c = col; c <= n; c++) {
        aug[r][c] -= factor * aug[col][c];
      }
    }
  }

  // Back substitution.
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let sum = aug[r][n];
    for (let c = r + 1; c < n; c++) {
      sum -= aug[r][c] * x[c];
    }
    x[r] = sum / aug[r][r];
  }

  return new Vector(x);
}
