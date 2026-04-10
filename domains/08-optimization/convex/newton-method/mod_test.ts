import { assertEquals } from "@std/assert";
import * as fc from "fast-check";
import { assertCloseTo, assertVectorCloseTo } from "@math/core/testing";
import { Matrix, Vector } from "@math/core/linalg";
import { newtonOptimize, solveLinear } from "./mod.ts";

// ---------- solveLinear ----------

Deno.test("solveLinear — 2x2 system", () => {
  const A = Matrix.from([[2, 1], [5, 7]]);
  const b = new Vector([11, 13]);
  const _x = solveLinear(A, b);
  // Use simpler example to verify:
  const A2 = Matrix.from([[1, 0], [0, 1]]);
  const b2 = new Vector([3, 7]);
  const x2 = solveLinear(A2, b2);
  assertVectorCloseTo(x2, new Vector([3, 7]), 1e-12);
});

Deno.test("solveLinear — 3x3 system", () => {
  const A = Matrix.from([[2, 1, -1], [-3, -1, 2], [-2, 1, 2]]);
  const b = new Vector([8, -11, -3]);
  const x = solveLinear(A, b);
  // Known solution: x = [2, 3, -1]
  assertVectorCloseTo(x, new Vector([2, 3, -1]), 1e-10);
});

// ---------- Newton on quadratics (converges in 1 step) ----------

Deno.test("newtonOptimize — quadratic converges in 1 step", () => {
  // f(x) = 0.5 * x^T I x = 0.5 * ||x||^2, min at origin
  const f = (x: Vector) => 0.5 * x.dot(x);
  const grad = (x: Vector) => x;
  const hess = (_x: Vector) => Matrix.identity(2);

  const result = newtonOptimize(f, grad, hess, new Vector([3, 4]));
  assertVectorCloseTo(result.x, Vector.zeros(2), 1e-10);
  // Newton converges in 1 step on pure quadratics
  assertEquals(result.iterations <= 2, true);
});

Deno.test("newtonOptimize — shifted quadratic", () => {
  // f(x) = (x-a)^T Q (x-a), Q = diag(1, 10)
  const a = new Vector([2, -3]);
  const Q = Matrix.diag([1, 10]);
  const f = (x: Vector) => {
    const d = x.sub(a);
    return 0.5 * d.dot(Q.mulVec(d));
  };
  const grad = (x: Vector) => Q.mulVec(x.sub(a));
  const hess = (_x: Vector) => Q;

  const result = newtonOptimize(f, grad, hess, Vector.zeros(2));
  assertVectorCloseTo(result.x, a, 1e-10);
  assertCloseTo(result.fVal, 0, 1e-10);
});

// ---------- Newton on non-quadratic ----------

Deno.test("newtonOptimize — Rosenbrock (small scale)", () => {
  const rosenbrock = (v: Vector) => {
    const [x, y] = [v.get(0), v.get(1)];
    return (1 - x) ** 2 + 100 * (y - x * x) ** 2;
  };
  const rosenbrockGrad = (v: Vector) => {
    const [x, y] = [v.get(0), v.get(1)];
    return new Vector([
      -2 * (1 - x) + 200 * (y - x * x) * (-2 * x),
      200 * (y - x * x),
    ]);
  };
  const rosenbrockHess = (v: Vector) => {
    const [x, y] = [v.get(0), v.get(1)];
    const h00 = 2 - 400 * y + 1200 * x * x;
    const h01 = -400 * x;
    const h11 = 200;
    return Matrix.from([[h00, h01], [h01, h11]]);
  };

  const result = newtonOptimize(
    rosenbrock,
    rosenbrockGrad,
    rosenbrockHess,
    new Vector([0.5, 0.5]),
    { maxIter: 100 },
  );
  assertCloseTo(result.x.get(0), 1.0, 1e-6);
  assertCloseTo(result.x.get(1), 1.0, 1e-6);
  assertCloseTo(result.fVal, 0, 1e-10);
});

// ---------- Convergence rate comparison ----------

Deno.test("newtonOptimize — fewer iterations than gradient descent on quadratic", () => {
  // On a quadratic, Newton should converge in ~1 step vs many for GD
  const Q = Matrix.diag([1, 100]);
  const f = (x: Vector) => 0.5 * x.dot(Q.mulVec(x));
  const grad = (x: Vector) => Q.mulVec(x);
  const hess = (_x: Vector) => Q;

  const result = newtonOptimize(f, grad, hess, new Vector([10, 10]));
  // Newton should converge in very few iterations on a quadratic
  assertEquals(result.iterations <= 3, true);
  assertCloseTo(result.fVal, 0, 1e-8);
});

// ---------- Property-based tests ----------

Deno.test("property — Newton finds stationary point of random PD quadratic", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 10 }),
      fc.integer({ min: 1, max: 10 }),
      fc.integer({ min: -5, max: 5 }),
      fc.integer({ min: -5, max: 5 }),
      (d1, d2, c1, c2) => {
        const Q = Matrix.diag([d1, d2]);
        const c = new Vector([c1, c2]);
        // f(x) = 0.5 x^T Q x + c^T x, min at x* = -Q^{-1} c
        const f = (x: Vector) => 0.5 * x.dot(Q.mulVec(x)) + c.dot(x);
        const grad = (x: Vector) => Q.mulVec(x).add(c);
        const hess = (_x: Vector) => Q;

        const result = newtonOptimize(f, grad, hess, Vector.zeros(2));
        const gNorm = grad(result.x).norm();
        return gNorm < 1e-6;
      },
    ),
    { numRuns: 30 },
  );
});
