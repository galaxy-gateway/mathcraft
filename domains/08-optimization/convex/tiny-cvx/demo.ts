/**
 * Demo: tiny-cvx DSL for convex optimization.
 *
 * Run with: `deno task demo domains/08-optimization/convex/tiny-cvx/demo.ts`
 */

import { emit } from "@math/core/viz";
import { Matrix, Vector } from "@math/core/linalg";
import { problem, quadratic, quadraticGrad } from "./mod.ts";

// --- Problem 1: Unconstrained quadratic ---
// min 0.5 x^T Q x + c^T x,  Q = diag(2,4), c = [-4, -8]
// Optimum: x* = Q^{-1} (-c) = [2, 2], f* = 0.5*[2,2]*[4,8] + [-4,-8]*[2,2] = 12 - 24 = -12
const Q1 = Matrix.diag([2, 4]);
const c1 = new Vector([-4, -8]);
const r1 = problem()
  .variable("x", 2)
  .minimize(
    (x) => quadratic(Q1, c1, x),
    (x) => quadraticGrad(Q1, c1, x),
  )
  .solve({ learningRate: 0.1 });

// --- Problem 2: Constrained quadratic ---
// min ||x||^2  subject to  x_0 >= 1, x_1 >= 1
// Optimum at (1, 1) with f* = 2
const r2 = problem()
  .variable("x", 2)
  .minimize(
    (x) => x.dot(x),
    (x) => x.scale(2),
  )
  .subjectTo(
    (x) => x.get(0) >= 0,
    (x) => x.get(1) >= 0,
  )
  .constrainLeq(
    (x) => -x.get(0) + 1, // x_0 >= 1  =>  1 - x_0 <= 0
    (_x) => new Vector([-1, 0]),
  )
  .constrainLeq(
    (x) => -x.get(1) + 1, // x_1 >= 1  =>  1 - x_1 <= 0
    (_x) => new Vector([0, -1]),
  )
  .startFrom(new Vector([2, 2]))
  .solve({ learningRate: 0.01, tol: 1e-4 });

// --- Problem 3: Linear objective with box constraints ---
// min -3x - 5y subject to 0 <= x <= 4, 0 <= y <= 6, x + y <= 8
// Optimum at (2, 6) with f* = -36
const r3 = problem()
  .variable("x", 2)
  .minimize(
    (x) => -3 * x.get(0) - 5 * x.get(1),
    (_x) => new Vector([-3, -5]),
  )
  .constrainLeq((x) => -x.get(0), (_x) => new Vector([-1, 0]))
  .constrainLeq((x) => -x.get(1), (_x) => new Vector([0, -1]))
  .constrainLeq((x) => x.get(0) - 4, (_x) => new Vector([1, 0]))
  .constrainLeq((x) => x.get(1) - 6, (_x) => new Vector([0, 1]))
  .constrainLeq((x) => x.get(0) + x.get(1) - 8, (_x) => new Vector([1, 1]))
  .startFrom(new Vector([1, 1]))
  .solve({ learningRate: 0.01, tol: 1e-4 });

emit({
  kind: "scalar",
  title: "tiny-cvx DSL: three convex programs",
  description: "Demonstrates the fluent builder API solving unconstrained quadratics, " +
    "constrained quadratics, and linear programs with box constraints.",
  data: {
    value: {
      problem1: {
        description: "Unconstrained: min 0.5 x^T diag(2,4) x + [-4,-8]^T x",
        solver: r1.solver,
        x: r1.x.toArray().map((v) => +v.toFixed(4)),
        fVal: +r1.fVal.toFixed(4),
        iterations: r1.iterations,
      },
      problem2: {
        description: "Constrained: min ||x||^2  s.t. x >= 1",
        solver: r2.solver,
        x: r2.x.toArray().map((v) => +v.toFixed(4)),
        fVal: +r2.fVal.toFixed(4),
        iterations: r2.iterations,
      },
      problem3: {
        description: "LP: min -3x - 5y  s.t. box + x+y<=8",
        solver: r3.solver,
        x: r3.x.toArray().map((v) => +v.toFixed(4)),
        fVal: +r3.fVal.toFixed(4),
        iterations: r3.iterations,
      },
    },
  },
});
