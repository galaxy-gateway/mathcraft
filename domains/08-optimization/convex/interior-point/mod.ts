/**
 * Interior-point (log-barrier) method for constrained convex optimization.
 *
 * Solves problems of the form:
 *   minimize f(x)
 *   subject to g_i(x) <= 0,  i = 1, ..., m
 *
 * The barrier method replaces the constrained problem with a sequence of
 * unconstrained problems:
 *   minimize t * f(x) + phi(x)
 *
 * where phi(x) = -sum log(-g_i(x)) is the log-barrier function and t is
 * increased geometrically. As t -> infinity, the solutions converge to
 * the true constrained optimum with duality gap <= m/t.
 *
 * @example
 * ```ts
 * import { barrierMethod } from "./mod.ts";
 * import { Vector } from "@math/core/linalg";
 *
 * // Minimize x + y subject to x >= 0, y >= 0, x + y <= 1
 * const result = barrierMethod(
 *   (v) => v.get(0) + v.get(1),
 *   (v) => new Vector([1, 1]),
 *   [
 *     { g: (v) => -v.get(0), gradG: (v) => new Vector([-1, 0]) },
 *     { g: (v) => -v.get(1), gradG: (v) => new Vector([0, -1]) },
 *     { g: (v) => v.get(0) + v.get(1) - 1, gradG: (v) => new Vector([1, 1]) },
 *   ],
 *   new Vector([0.5, 0.3]),
 * );
 * ```
 */

import { Vector } from "@math/core/linalg";

/** A single inequality constraint g(x) <= 0. */
export interface Constraint {
  /** The constraint function g(x). Must be negative when feasible. */
  g: (x: Vector) => number;
  /** Gradient of g. */
  gradG: (x: Vector) => Vector;
}

/** Result of the barrier method. */
export interface BarrierResult {
  /** The approximate minimizer. */
  x: Vector;
  /** Objective value at x. */
  fVal: number;
  /** Number of outer (barrier) iterations. */
  outerIterations: number;
  /** Total number of inner (Newton/GD) iterations. */
  totalInnerIterations: number;
  /** History of objective values at each outer iteration. */
  history: number[];
}

/** Options for the barrier method. */
export interface BarrierOptions {
  /** Initial barrier parameter t. Default 1. */
  t0?: number;
  /** Multiplicative increase factor for t (mu > 1). Default 10. */
  mu?: number;
  /** Stopping criterion: m/t < outerTol. Default 1e-6. */
  outerTol?: number;
  /** Maximum outer iterations. Default 50. */
  maxOuterIter?: number;
  /** Inner solver learning rate. Default 0.01. */
  innerLearningRate?: number;
  /** Inner solver max iterations. Default 500. */
  innerMaxIter?: number;
  /** Inner solver gradient norm tolerance. Default 1e-8. */
  innerTol?: number;
}

/**
 * Compute the log-barrier value: -sum_i log(-g_i(x)).
 * Returns Infinity if any constraint is violated.
 */
function barrierValue(constraints: Constraint[], x: Vector): number {
  let sum = 0;
  for (const c of constraints) {
    const gVal = c.g(x);
    if (gVal >= 0) return Infinity;
    sum -= Math.log(-gVal);
  }
  return sum;
}

/**
 * Compute the gradient of the log-barrier: sum_i (1 / -g_i(x)) * gradG_i(x).
 */
function barrierGradient(constraints: Constraint[], x: Vector): Vector {
  let result = Vector.zeros(x.length);
  for (const c of constraints) {
    const gVal = c.g(x);
    if (gVal >= 0) {
      // Return a large gradient pointing away from the boundary
      return c.gradG(x).scale(1e10);
    }
    result = result.add(c.gradG(x).scale(1 / (-gVal)));
  }
  return result;
}

/**
 * Simple gradient descent inner solver with feasibility-aware step size.
 * Used as the centering step in the barrier method.
 */
function centeringStep(
  gradFn: (x: Vector) => Vector,
  evalFn: (x: Vector) => number,
  constraints: Constraint[],
  x0: Vector,
  maxIter: number,
  lr: number,
  tol: number,
): { x: Vector; iterations: number } {
  let x = x0;
  let iterations = 0;

  for (let i = 0; i < maxIter; i++) {
    const g = gradFn(x);
    const gNorm = g.norm();
    if (gNorm < tol) break;

    // Backtracking line search with feasibility check
    let step = lr;
    const currentVal = evalFn(x);
    for (let j = 0; j < 30; j++) {
      const xNew = x.sub(g.scale(step));
      // Check feasibility
      let feasible = true;
      for (const c of constraints) {
        if (c.g(xNew) >= 0) {
          feasible = false;
          break;
        }
      }
      if (feasible && evalFn(xNew) < currentVal) {
        x = xNew;
        break;
      }
      step *= 0.5;
    }
    iterations++;
  }

  return { x, iterations };
}

/**
 * Log-barrier method for constrained convex optimization.
 *
 * Solves: minimize f(x) subject to g_i(x) <= 0, i = 1..m
 *
 * The initial point x0 must be strictly feasible (all g_i(x0) < 0).
 *
 * @param f  Objective function.
 * @param gradF  Gradient of f.
 * @param constraints  Array of inequality constraints.
 * @param x0  Strictly feasible initial point.
 * @param opts  Algorithm parameters.
 */
export function barrierMethod(
  f: (x: Vector) => number,
  gradF: (x: Vector) => Vector,
  constraints: Constraint[],
  x0: Vector,
  opts: BarrierOptions = {},
): BarrierResult {
  const t0 = opts.t0 ?? 1;
  const mu = opts.mu ?? 10;
  const outerTol = opts.outerTol ?? 1e-6;
  const maxOuterIter = opts.maxOuterIter ?? 50;
  const innerLR = opts.innerLearningRate ?? 0.01;
  const innerMaxIter = opts.innerMaxIter ?? 500;
  const innerTol = opts.innerTol ?? 1e-8;

  const m = constraints.length;

  // Verify initial feasibility
  for (let i = 0; i < m; i++) {
    if (constraints[i].g(x0) >= 0) {
      throw new Error(
        `Initial point is not strictly feasible: constraint ${i} has g(x0) = ${
          constraints[i].g(x0)
        }`,
      );
    }
  }

  let t = t0;
  let x = x0;
  let totalInner = 0;
  const history: number[] = [];

  for (let outer = 0; outer < maxOuterIter; outer++) {
    history.push(f(x));

    // Centering step: minimize t * f(x) + barrier(x)
    const currentT = t;
    const augGrad = (xv: Vector) => gradF(xv).scale(currentT).add(barrierGradient(constraints, xv));
    const augVal = (xv: Vector) => currentT * f(xv) + barrierValue(constraints, xv);

    const inner = centeringStep(augGrad, augVal, constraints, x, innerMaxIter, innerLR, innerTol);
    x = inner.x;
    totalInner += inner.iterations;

    // Check stopping criterion: duality gap <= m/t
    if (m / t < outerTol) {
      history.push(f(x));
      return {
        x,
        fVal: f(x),
        outerIterations: outer + 1,
        totalInnerIterations: totalInner,
        history,
      };
    }

    // Increase barrier parameter
    t *= mu;
  }

  return {
    x,
    fVal: f(x),
    outerIterations: maxOuterIter,
    totalInnerIterations: totalInner,
    history,
  };
}
