/**
 * Newton's method for unconstrained optimization.
 *
 * Uses second-order (Hessian) information to take Newton steps, achieving
 * quadratic convergence near the optimum. For an n-dimensional problem,
 * each iteration solves an n x n linear system.
 *
 * @example
 * ```ts
 * import { newtonOptimize } from "./mod.ts";
 * import { Vector, Matrix } from "@math/core/linalg";
 *
 * // Minimize f(x) = x^T Q x + c^T x
 * const Q = Matrix.from([[2, 0], [0, 2]]);
 * const c = new Vector([-4, -6]);
 * const f = (x: Vector) => 0.5 * x.dot(Q.mulVec(x)) + c.dot(x);
 * const grad = (x: Vector) => Q.mulVec(x).add(c);
 * const hess = (_x: Vector) => Q;
 * const result = newtonOptimize(f, grad, hess, Vector.zeros(2));
 * ```
 */

import { Matrix, Vector } from "@math/core/linalg";

/** Result of Newton optimization. */
export interface NewtonResult {
  /** The minimizer found. */
  x: Vector;
  /** Objective value at x. */
  fVal: number;
  /** Number of iterations performed. */
  iterations: number;
  /** Convergence history: objective value at each iteration. */
  history: number[];
}

/** Options for Newton's method. */
export interface NewtonOptions {
  /** Maximum number of iterations. Default 100. */
  maxIter?: number;
  /** Gradient norm tolerance for convergence. Default 1e-10. */
  tol?: number;
  /** Backtracking line search alpha parameter. Default 0.25. */
  alpha?: number;
  /** Backtracking line search beta parameter. Default 0.5. */
  beta?: number;
}

/**
 * Solve Ax = b for small dense systems via Gaussian elimination with
 * partial pivoting. Used internally for the Newton step.
 */
export function solveLinear(A: Matrix, b: Vector): Vector {
  const n = A.rows;
  if (A.cols !== n || b.length !== n) {
    throw new RangeError("solveLinear: dimension mismatch");
  }

  // Build augmented matrix [A | b] as mutable array
  const aug: number[][] = [];
  for (let r = 0; r < n; r++) {
    const row: number[] = [];
    for (let c = 0; c < n; c++) row.push(A.get(r, c));
    row.push(b.get(r));
    aug.push(row);
  }

  // Forward elimination with partial pivoting
  for (let col = 0; col < n; col++) {
    let maxVal = Math.abs(aug[col][col]);
    let maxRow = col;
    for (let r = col + 1; r < n; r++) {
      const v = Math.abs(aug[r][col]);
      if (v > maxVal) {
        maxVal = v;
        maxRow = r;
      }
    }
    if (maxVal < 1e-14) {
      throw new Error("solveLinear: singular or near-singular matrix");
    }
    if (maxRow !== col) {
      [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    }
    for (let r = col + 1; r < n; r++) {
      const factor = aug[r][col] / aug[col][col];
      for (let c = col; c <= n; c++) {
        aug[r][c] -= factor * aug[col][c];
      }
    }
  }

  // Back substitution
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

/**
 * Newton's method for unconstrained minimization with backtracking line search.
 *
 * At each iteration, computes the Newton step dx = -H^{-1} grad, then
 * uses backtracking line search to find a step size that ensures sufficient
 * decrease (Armijo condition).
 *
 * @param f  Objective function to minimize.
 * @param grad  Gradient of f.
 * @param hessian  Hessian of f (returns an n x n Matrix).
 * @param x0  Initial point.
 * @param opts  Algorithm parameters.
 */
export function newtonOptimize(
  f: (x: Vector) => number,
  grad: (x: Vector) => Vector,
  hessian: (x: Vector) => Matrix,
  x0: Vector,
  opts: NewtonOptions = {},
): NewtonResult {
  const maxIter = opts.maxIter ?? 100;
  const tol = opts.tol ?? 1e-10;
  const alpha = opts.alpha ?? 0.25;
  const beta = opts.beta ?? 0.5;

  let x = x0;
  const history: number[] = [];

  for (let i = 0; i < maxIter; i++) {
    const fVal = f(x);
    history.push(fVal);
    const g = grad(x);
    const gNorm = g.norm();

    if (gNorm < tol) {
      return { x, fVal, iterations: i, history };
    }

    // Newton step: solve H * dx = -g
    const H = hessian(x);
    const dx = solveLinear(H, g.scale(-1));

    // Newton decrement squared: lambda^2 = -g^T dx
    const lambdaSq = -g.dot(dx);
    if (lambdaSq / 2 < tol) {
      return { x, fVal, iterations: i, history };
    }

    // Backtracking line search
    let t = 1.0;
    const gradDotDx = g.dot(dx);
    while (f(x.add(dx.scale(t))) > fVal + alpha * t * gradDotDx) {
      t *= beta;
      if (t < 1e-15) break;
    }

    x = x.add(dx.scale(t));
  }

  return { x, fVal: f(x), iterations: maxIter, history };
}
