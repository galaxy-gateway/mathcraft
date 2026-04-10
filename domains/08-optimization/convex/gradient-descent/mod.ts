/**
 * Gradient descent optimizers for unconstrained convex minimization.
 *
 * Implements four variants:
 * - **gradientDescent** — vanilla gradient descent with fixed or decaying step size
 * - **momentumGD** — classical momentum (heavy-ball method)
 * - **nesterovGD** — Nesterov accelerated gradient
 * - **adam** — Adaptive Moment Estimation (Kingma & Ba, 2015)
 *
 * All optimizers share a common interface: they accept an objective function,
 * its gradient, an initial point, and options; they return the minimizer,
 * the minimum value, and the iteration count.
 *
 * @example
 * ```ts
 * import { gradientDescent } from "./mod.ts";
 * import { Vector } from "@math/core/linalg";
 *
 * const f = (x: Vector) => x.dot(x);
 * const grad = (x: Vector) => x.scale(2);
 * const result = gradientDescent(f, grad, new Vector([3, 4]));
 * ```
 */

import { Vector } from "@math/core/linalg";

/** Result returned by all optimizers. */
export interface OptimizeResult {
  /** The minimizer found. */
  x: Vector;
  /** Objective value at x. */
  fVal: number;
  /** Number of iterations performed. */
  iterations: number;
  /** Convergence history: objective value at each iteration. */
  history: number[];
}

/** Options shared by all gradient-based optimizers. */
export interface GradientDescentOptions {
  /** Learning rate / step size. Default 0.01. */
  learningRate?: number;
  /** Maximum number of iterations. Default 10000. */
  maxIter?: number;
  /** Gradient norm tolerance for convergence. Default 1e-8. */
  tol?: number;
}

/** Additional options for momentum-based methods. */
export interface MomentumOptions extends GradientDescentOptions {
  /** Momentum coefficient in [0, 1). Default 0.9. */
  beta?: number;
}

/** Options for the Adam optimizer. */
export interface AdamOptions extends GradientDescentOptions {
  /** Exponential decay rate for first moment. Default 0.9. */
  beta1?: number;
  /** Exponential decay rate for second moment. Default 0.999. */
  beta2?: number;
  /** Small constant for numerical stability. Default 1e-8. */
  epsilon?: number;
}

/**
 * Vanilla gradient descent.
 *
 * Update rule: x_{k+1} = x_k - lr * grad(x_k)
 *
 * @param f  Objective function to minimize.
 * @param grad  Gradient of f.
 * @param x0  Initial point.
 * @param opts  Algorithm parameters.
 */
export function gradientDescent(
  f: (x: Vector) => number,
  grad: (x: Vector) => Vector,
  x0: Vector,
  opts: GradientDescentOptions = {},
): OptimizeResult {
  const lr = opts.learningRate ?? 0.01;
  const maxIter = opts.maxIter ?? 10000;
  const tol = opts.tol ?? 1e-8;

  let x = x0;
  const history: number[] = [];

  for (let i = 0; i < maxIter; i++) {
    const fVal = f(x);
    history.push(fVal);
    const g = grad(x);
    if (g.norm() < tol) {
      return { x, fVal, iterations: i, history };
    }
    x = x.sub(g.scale(lr));
  }

  return { x, fVal: f(x), iterations: maxIter, history };
}

/**
 * Gradient descent with classical (Polyak) momentum.
 *
 * Update rule:
 *   v_{k+1} = beta * v_k - lr * grad(x_k)
 *   x_{k+1} = x_k + v_{k+1}
 *
 * @param f  Objective function to minimize.
 * @param grad  Gradient of f.
 * @param x0  Initial point.
 * @param opts  Algorithm parameters.
 */
export function momentumGD(
  f: (x: Vector) => number,
  grad: (x: Vector) => Vector,
  x0: Vector,
  opts: MomentumOptions = {},
): OptimizeResult {
  const lr = opts.learningRate ?? 0.01;
  const maxIter = opts.maxIter ?? 10000;
  const tol = opts.tol ?? 1e-8;
  const beta = opts.beta ?? 0.9;

  let x = x0;
  let v = Vector.zeros(x0.length);
  const history: number[] = [];

  for (let i = 0; i < maxIter; i++) {
    const fVal = f(x);
    history.push(fVal);
    const g = grad(x);
    if (g.norm() < tol) {
      return { x, fVal, iterations: i, history };
    }
    v = v.scale(beta).sub(g.scale(lr));
    x = x.add(v);
  }

  return { x, fVal: f(x), iterations: maxIter, history };
}

/**
 * Nesterov accelerated gradient descent.
 *
 * Update rule:
 *   y = x_k + beta * v_k                (look-ahead)
 *   v_{k+1} = beta * v_k - lr * grad(y)
 *   x_{k+1} = x_k + v_{k+1}
 *
 * @param f  Objective function to minimize.
 * @param grad  Gradient of f.
 * @param x0  Initial point.
 * @param opts  Algorithm parameters.
 */
export function nesterovGD(
  f: (x: Vector) => number,
  grad: (x: Vector) => Vector,
  x0: Vector,
  opts: MomentumOptions = {},
): OptimizeResult {
  const lr = opts.learningRate ?? 0.01;
  const maxIter = opts.maxIter ?? 10000;
  const tol = opts.tol ?? 1e-8;
  const beta = opts.beta ?? 0.9;

  let x = x0;
  let v = Vector.zeros(x0.length);
  const history: number[] = [];

  for (let i = 0; i < maxIter; i++) {
    const fVal = f(x);
    history.push(fVal);
    // Look-ahead point
    const y = x.add(v.scale(beta));
    const g = grad(y);
    if (g.norm() < tol) {
      return { x, fVal, iterations: i, history };
    }
    v = v.scale(beta).sub(g.scale(lr));
    x = x.add(v);
  }

  return { x, fVal: f(x), iterations: maxIter, history };
}

/**
 * Adam optimizer (Kingma & Ba, 2015).
 *
 * Maintains exponential moving averages of the gradient (first moment)
 * and the squared gradient (second moment), with bias correction.
 *
 * @param f  Objective function to minimize.
 * @param grad  Gradient of f.
 * @param x0  Initial point.
 * @param opts  Algorithm parameters.
 */
export function adam(
  f: (x: Vector) => number,
  grad: (x: Vector) => Vector,
  x0: Vector,
  opts: AdamOptions = {},
): OptimizeResult {
  const lr = opts.learningRate ?? 0.001;
  const maxIter = opts.maxIter ?? 10000;
  const tol = opts.tol ?? 1e-8;
  const beta1 = opts.beta1 ?? 0.9;
  const beta2 = opts.beta2 ?? 0.999;
  const eps = opts.epsilon ?? 1e-8;

  let x = x0;
  const n = x0.length;
  let m = Vector.zeros(n); // first moment
  let v = Vector.zeros(n); // second moment
  const history: number[] = [];

  for (let i = 0; i < maxIter; i++) {
    const fVal = f(x);
    history.push(fVal);
    const g = grad(x);
    if (g.norm() < tol) {
      return { x, fVal, iterations: i, history };
    }

    // Update biased moments
    m = m.scale(beta1).add(g.scale(1 - beta1));
    const gSquared = new Vector(g.values.map((gi) => gi * gi));
    v = v.scale(beta2).add(gSquared.scale(1 - beta2));

    // Bias correction
    const t = i + 1;
    const mHat = m.scale(1 / (1 - Math.pow(beta1, t)));
    const vHat = v.scale(1 / (1 - Math.pow(beta2, t)));

    // Update: x -= lr * mHat / (sqrt(vHat) + eps)
    const step = new Vector(
      mHat.values.map((mi, j) => lr * mi / (Math.sqrt(vHat.values[j]) + eps)),
    );
    x = x.sub(step);
  }

  return { x, fVal: f(x), iterations: maxIter, history };
}
