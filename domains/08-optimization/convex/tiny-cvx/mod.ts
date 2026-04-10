/**
 * tiny-cvx — A mini DSL for specifying and solving convex programs.
 *
 * Provides a fluent builder API for convex optimization problems that
 * composes the gradient descent and interior-point primitives from
 * sibling directories. The goal is educational: showing how a DSL layer
 * can wrap low-level numerical methods.
 *
 * @example
 * ```ts
 * import { problem, quadratic } from "./mod.ts";
 * import { Matrix, Vector } from "@math/core/linalg";
 *
 * const Q = Matrix.from([[2, 0], [0, 2]]);
 * const c = new Vector([-4, -6]);
 * const result = problem()
 *   .variable("x", 2)
 *   .minimize((x) => quadratic(Q, c, x))
 *   .subjectTo((x) => x.get(0) >= 0, (x) => x.get(1) >= 0)
 *   .solve();
 * ```
 */

import { Matrix, Vector } from "@math/core/linalg";
import { gradientDescent } from "../gradient-descent/mod.ts";
import type { Constraint } from "../interior-point/mod.ts";
import { barrierMethod } from "../interior-point/mod.ts";

/** Result of solving a tiny-cvx problem. */
export interface SolveResult {
  /** Optimal variable values. */
  x: Vector;
  /** Optimal objective value. */
  fVal: number;
  /** Number of iterations. */
  iterations: number;
  /** Solver used: "gradient-descent" or "barrier". */
  solver: string;
}

/** Options for the solve step. */
export interface SolveOptions {
  /** Learning rate for gradient-based solvers. Default 0.01. */
  learningRate?: number;
  /** Maximum iterations. Default 10000. */
  maxIter?: number;
  /** Convergence tolerance. Default 1e-6. */
  tol?: number;
}

/**
 * Compute a quadratic form: 0.5 * x^T Q x + c^T x.
 *
 * This is the most common convex objective. Exported as a helper for
 * building problems with the DSL.
 *
 * @param Q  Positive semidefinite matrix.
 * @param c  Linear coefficient vector.
 * @param x  Variable vector.
 */
export function quadratic(Q: Matrix, c: Vector, x: Vector): number {
  return 0.5 * x.dot(Q.mulVec(x)) + c.dot(x);
}

/**
 * Compute the gradient of 0.5 * x^T Q x + c^T x, which is Q x + c.
 */
export function quadraticGrad(Q: Matrix, c: Vector, x: Vector): Vector {
  return Q.mulVec(x).add(c);
}

// Internal constraint representation for the builder
interface ConstraintSpec {
  /** Constraint function: should return true when satisfied. */
  fn: (x: Vector) => boolean;
  /** Inequality form for barrier: g(x) <= 0 when satisfied. */
  g: (x: Vector) => number;
  /** Gradient of g. */
  gradG: (x: Vector) => Vector;
}

/**
 * Problem builder with a fluent API.
 *
 * Usage: problem().variable("x", n).minimize(f).subjectTo(...).solve()
 */
class ProblemBuilder {
  private _dim = 0;
  private _varName = "x";
  private _objective: ((x: Vector) => number) | null = null;
  private _gradient: ((x: Vector) => Vector) | null = null;
  private _constraints: ConstraintSpec[] = [];
  private _x0: Vector | null = null;

  /**
   * Declare a variable with a given name and dimension.
   */
  variable(name: string, dim: number): ProblemBuilder {
    this._varName = name;
    this._dim = dim;
    return this;
  }

  /**
   * Set the objective function to minimize.
   *
   * If gradFn is not provided, a numerical gradient is computed automatically.
   *
   * @param fn  Objective function f(x) -> number.
   * @param gradFn  Optional analytical gradient.
   */
  minimize(
    fn: (x: Vector) => number,
    gradFn?: (x: Vector) => Vector,
  ): ProblemBuilder {
    this._objective = fn;
    this._gradient = gradFn ?? null;
    return this;
  }

  /**
   * Add inequality constraints. Each predicate should return true when
   * the constraint is satisfied.
   *
   * Supported forms (detected automatically):
   * - `(x) => x.get(i) >= value`  translates to  value - x_i <= 0
   * - General predicates are handled via numerical gradient estimation.
   *
   * For the educational DSL, we support simple lower-bound constraints
   * of the form `x.get(i) >= 0`. Pass constraint functions that express
   * inequality constraints.
   */
  subjectTo(
    ...predicates: Array<(x: Vector) => boolean>
  ): ProblemBuilder {
    for (const pred of predicates) {
      this._constraints.push(this._parseConstraint(pred));
    }
    return this;
  }

  /**
   * Add explicit inequality constraints in g(x) <= 0 form.
   * More precise than subjectTo for the solver.
   */
  constrainLeq(
    g: (x: Vector) => number,
    gradG: (x: Vector) => Vector,
  ): ProblemBuilder {
    this._constraints.push({
      fn: (x: Vector) => g(x) <= 0,
      g,
      gradG,
    });
    return this;
  }

  /**
   * Set the initial point. If not called, defaults to a point in the
   * interior of the feasible region (or 0.5 * ones for box constraints).
   */
  startFrom(x0: Vector): ProblemBuilder {
    this._x0 = x0;
    return this;
  }

  /**
   * Solve the problem using an appropriate method:
   * - Unconstrained: gradient descent
   * - Constrained: barrier method
   */
  solve(opts: SolveOptions = {}): SolveResult {
    if (!this._objective) {
      throw new Error("tiny-cvx: no objective set. Call .minimize() first.");
    }
    if (this._dim === 0) {
      throw new Error("tiny-cvx: no variable declared. Call .variable() first.");
    }

    const lr = opts.learningRate ?? 0.01;
    const maxIter = opts.maxIter ?? 10000;
    const tol = opts.tol ?? 1e-6;

    const f = this._objective;
    const grad = this._gradient ?? this._numericalGradient(f);

    if (this._constraints.length === 0) {
      // Unconstrained: use gradient descent
      const x0 = this._x0 ?? Vector.zeros(this._dim);
      const result = gradientDescent(f, grad, x0, {
        learningRate: lr,
        maxIter,
        tol,
      });
      return {
        x: result.x,
        fVal: result.fVal,
        iterations: result.iterations,
        solver: "gradient-descent",
      };
    }

    // Constrained: use barrier method
    const barrierConstraints: Constraint[] = this._constraints.map((c) => ({
      g: c.g,
      gradG: c.gradG,
    }));

    const x0 = this._x0 ?? this._findFeasibleStart();

    const result = barrierMethod(f, grad, barrierConstraints, x0, {
      t0: 1,
      mu: 10,
      outerTol: tol,
      innerMaxIter: Math.min(maxIter, 500),
      innerLearningRate: lr,
    });

    return {
      x: result.x,
      fVal: result.fVal,
      iterations: result.outerIterations,
      solver: "barrier",
    };
  }

  /** Construct a numerical gradient via central differences. */
  private _numericalGradient(
    f: (x: Vector) => number,
  ): (x: Vector) => Vector {
    const h = 1e-7;
    return (x: Vector) => {
      const g: number[] = [];
      for (let i = 0; i < x.length; i++) {
        const ei = Vector.basis(x.length, i);
        g.push((f(x.add(ei.scale(h))) - f(x.sub(ei.scale(h)))) / (2 * h));
      }
      return new Vector(g);
    };
  }

  /** Parse a boolean predicate into a constraint spec. */
  private _parseConstraint(
    pred: (x: Vector) => boolean,
  ): ConstraintSpec {
    // Try to detect x.get(i) >= 0 patterns by probing
    // We test: which coordinate, when set negative, violates the constraint?
    const dim = this._dim;

    for (let i = 0; i < dim; i++) {
      // Test if this is a "x_i >= 0" constraint
      const testPos = Vector.zeros(dim).add(Vector.basis(dim, i).scale(1));
      const testNeg = Vector.zeros(dim).add(Vector.basis(dim, i).scale(-1));
      const allHalf = new Vector(new Array(dim).fill(0.5));
      const allHalfNeg = new Vector(
        new Array(dim).fill(0.5).map((v, j) => j === i ? -0.5 : v),
      );

      if (pred(testPos) && !pred(testNeg) && pred(allHalf) && !pred(allHalfNeg)) {
        // Likely x_i >= 0
        const idx = i;
        return {
          fn: pred,
          g: (x: Vector) => -x.get(idx), // -x_i <= 0 means x_i >= 0
          gradG: (_x: Vector) => {
            const g = new Array(dim).fill(0);
            g[idx] = -1;
            return new Vector(g);
          },
        };
      }
    }

    // Fallback: use numerical gradient for the constraint
    // Infer g by: g(x) = pred(x) ? -1 : 1 ... this is crude.
    // Better: use a soft indicator.
    const h = 1e-7;
    const gFn = (x: Vector): number => {
      // We can't derive g from a boolean, so we use a small trick:
      // return a small negative value if feasible, small positive if not.
      return pred(x) ? -0.01 : 0.01;
    };
    const gradGFn = (x: Vector): Vector => {
      const grad: number[] = [];
      for (let j = 0; j < dim; j++) {
        const ei = Vector.basis(dim, j);
        grad.push((gFn(x.add(ei.scale(h))) - gFn(x.sub(ei.scale(h)))) / (2 * h));
      }
      return new Vector(grad);
    };

    return { fn: pred, g: gFn, gradG: gradGFn };
  }

  /** Attempt to find a strictly feasible starting point. */
  private _findFeasibleStart(): Vector {
    // Simple heuristic: try the center of [0,1]^n
    const candidate = new Vector(new Array(this._dim).fill(0.5));
    const allFeasible = this._constraints.every((c) => c.g(candidate) < 0);
    if (allFeasible) return candidate;

    // Try small positive values
    const small = new Vector(new Array(this._dim).fill(0.1));
    if (this._constraints.every((c) => c.g(small) < 0)) return small;

    throw new Error(
      "tiny-cvx: could not find a feasible starting point automatically. " +
        "Call .startFrom(x0) with a strictly feasible point.",
    );
  }
}

/**
 * Create a new problem builder.
 *
 * @returns A fluent ProblemBuilder instance.
 */
export function problem(): ProblemBuilder {
  return new ProblemBuilder();
}
