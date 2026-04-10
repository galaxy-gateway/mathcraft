import { assertCloseTo } from "@math/core/testing";
import { assertEquals } from "@std/assert";
import * as fc from "fast-check";
import { Matrix, Vector } from "@math/core/linalg";
import { problem, quadratic, quadraticGrad } from "./mod.ts";

// ---------- quadratic helper ----------

Deno.test("quadratic — computes 0.5 x^T Q x + c^T x", () => {
  const Q = Matrix.identity(2).scale(2);
  const c = new Vector([-4, -6]);
  const x = new Vector([1, 1]);
  // 0.5 * [1,1] * [[2,0],[0,2]] * [1,1]^T + [-4,-6] * [1,1]^T
  // = 0.5 * (2+2) + (-4-6) = 2 - 10 = -8
  assertCloseTo(quadratic(Q, c, x), -8, 1e-10);
});

Deno.test("quadraticGrad — computes Qx + c", () => {
  const Q = Matrix.identity(2).scale(2);
  const c = new Vector([-4, -6]);
  const x = new Vector([1, 1]);
  const g = quadraticGrad(Q, c, x);
  // Qx + c = [2, 2] + [-4, -6] = [-2, -4]
  assertCloseTo(g.get(0), -2, 1e-10);
  assertCloseTo(g.get(1), -4, 1e-10);
});

// ---------- Unconstrained via DSL ----------

Deno.test("tiny-cvx — unconstrained quadratic with analytical gradient", () => {
  const Q = Matrix.identity(2).scale(2);
  const c = new Vector([-4, -6]);
  // min 0.5 x^T (2I) x + [-4,-6]^T x = x^2 - 4x + y^2 - 6y
  // gradient = 2x + c, setting to 0: x* = [2, 3]
  const result = problem()
    .variable("x", 2)
    .minimize(
      (x) => quadratic(Q, c, x),
      (x) => quadraticGrad(Q, c, x),
    )
    .solve({ learningRate: 0.1 });

  assertCloseTo(result.x.get(0), 2, 0.01);
  assertCloseTo(result.x.get(1), 3, 0.01);
  assertEquals(result.solver, "gradient-descent");
});

Deno.test("tiny-cvx — unconstrained with numerical gradient", () => {
  // min (x-1)^2 + (y-2)^2, optimum at (1, 2)
  const result = problem()
    .variable("x", 2)
    .minimize((x) => (x.get(0) - 1) ** 2 + (x.get(1) - 2) ** 2)
    .solve({ learningRate: 0.1 });

  assertCloseTo(result.x.get(0), 1, 0.01);
  assertCloseTo(result.x.get(1), 2, 0.01);
});

// ---------- Constrained via DSL ----------

Deno.test("tiny-cvx — constrained with subjectTo (x >= 0)", () => {
  // min (x - (-1))^2 + (y - (-1))^2 = (x+1)^2 + (y+1)^2
  // subject to x >= 0, y >= 0
  // Unconstrained min at (-1, -1), constrained min at (0, 0)
  const result = problem()
    .variable("x", 2)
    .minimize(
      (x) => (x.get(0) + 1) ** 2 + (x.get(1) + 1) ** 2,
      (x) => new Vector([2 * (x.get(0) + 1), 2 * (x.get(1) + 1)]),
    )
    .subjectTo(
      (x) => x.get(0) >= 0,
      (x) => x.get(1) >= 0,
    )
    .solve({ learningRate: 0.01, tol: 1e-4 });

  assertCloseTo(result.x.get(0), 0, 0.15);
  assertCloseTo(result.x.get(1), 0, 0.15);
  assertEquals(result.solver, "barrier");
});

Deno.test("tiny-cvx — constrained with constrainLeq", () => {
  // min x^2 + y^2 subject to x + y >= 2 (i.e., -x - y + 2 <= 0)
  // Optimum at (1, 1)
  const result = problem()
    .variable("x", 2)
    .minimize(
      (x) => x.dot(x),
      (x) => x.scale(2),
    )
    .constrainLeq(
      (x) => -x.get(0) - x.get(1) + 2, // -x - y + 2 <= 0
      (_x) => new Vector([-1, -1]),
    )
    .startFrom(new Vector([2, 2]))
    .solve({ learningRate: 0.01, tol: 1e-4 });

  assertCloseTo(result.x.get(0), 1, 0.15);
  assertCloseTo(result.x.get(1), 1, 0.15);
  assertCloseTo(result.fVal, 2, 0.3);
});

// ---------- Error handling ----------

Deno.test("tiny-cvx — throws without objective", () => {
  let threw = false;
  try {
    problem().variable("x", 2).solve();
  } catch {
    threw = true;
  }
  assertEquals(threw, true);
});

Deno.test("tiny-cvx — throws without variable", () => {
  let threw = false;
  try {
    problem().minimize((x) => x.dot(x)).solve();
  } catch {
    threw = true;
  }
  assertEquals(threw, true);
});

// ---------- Property-based ----------

Deno.test("property — DSL finds minimum of shifted quadratic", () => {
  fc.assert(
    fc.property(
      fc.float({ min: -3, max: 3, noNaN: true }),
      fc.float({ min: -3, max: 3, noNaN: true }),
      (cx, cy) => {
        const center = new Vector([cx, cy]);
        const result = problem()
          .variable("x", 2)
          .minimize(
            (x) => x.sub(center).dot(x.sub(center)),
            (x) => x.sub(center).scale(2),
          )
          .solve({ learningRate: 0.1 });
        return result.x.sub(center).norm() < 0.1;
      },
    ),
    { numRuns: 15 },
  );
});
