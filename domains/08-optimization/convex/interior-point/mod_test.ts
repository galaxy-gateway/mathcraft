import { assertCloseTo } from "@math/core/testing";
import { assertEquals } from "@std/assert";
import * as fc from "fast-check";
import { Vector } from "@math/core/linalg";
import { barrierMethod } from "./mod.ts";
import type { Constraint } from "./mod.ts";

// ---------- Box constraints ----------

Deno.test("barrierMethod — minimize linear on a box", () => {
  // minimize x + y  subject to  0 <= x <= 1, 0 <= y <= 1
  // Optimum at (0, 0) with f* = 0
  const f = (v: Vector) => v.get(0) + v.get(1);
  const gradF = (_v: Vector) => new Vector([1, 1]);

  const constraints: Constraint[] = [
    { g: (v) => -v.get(0), gradG: (_v) => new Vector([-1, 0]) }, // x >= 0
    { g: (v) => -v.get(1), gradG: (_v) => new Vector([0, -1]) }, // y >= 0
    { g: (v) => v.get(0) - 1, gradG: (_v) => new Vector([1, 0]) }, // x <= 1
    { g: (v) => v.get(1) - 1, gradG: (_v) => new Vector([0, 1]) }, // y <= 1
  ];

  const result = barrierMethod(f, gradF, constraints, new Vector([0.5, 0.5]), {
    t0: 1,
    mu: 10,
    outerTol: 1e-4,
    innerMaxIter: 200,
    innerLearningRate: 0.01,
  });

  // Should be close to (0, 0) — barrier keeps it strictly inside
  assertCloseTo(result.fVal, 0, 0.1);
  assertEquals(result.x.get(0) < 0.1, true);
  assertEquals(result.x.get(1) < 0.1, true);
});

Deno.test("barrierMethod — minimize quadratic on a box", () => {
  // minimize (x-2)^2 + (y-2)^2  subject to  0 <= x <= 1, 0 <= y <= 1
  // Unconstrained min is at (2,2), but constrained optimum is at (1,1)
  const f = (v: Vector) => (v.get(0) - 2) ** 2 + (v.get(1) - 2) ** 2;
  const gradF = (v: Vector) => new Vector([2 * (v.get(0) - 2), 2 * (v.get(1) - 2)]);

  const constraints: Constraint[] = [
    { g: (v) => -v.get(0), gradG: (_v) => new Vector([-1, 0]) },
    { g: (v) => -v.get(1), gradG: (_v) => new Vector([0, -1]) },
    { g: (v) => v.get(0) - 1, gradG: (_v) => new Vector([1, 0]) },
    { g: (v) => v.get(1) - 1, gradG: (_v) => new Vector([0, 1]) },
  ];

  const result = barrierMethod(f, gradF, constraints, new Vector([0.5, 0.5]), {
    t0: 1,
    mu: 10,
    outerTol: 1e-4,
    innerMaxIter: 500,
    innerLearningRate: 0.005,
  });

  assertCloseTo(result.x.get(0), 1.0, 0.1);
  assertCloseTo(result.x.get(1), 1.0, 0.1);
  assertCloseTo(result.fVal, 2.0, 0.2);
});

Deno.test("barrierMethod — 1D constrained", () => {
  // minimize x^2  subject to x >= 1
  // Optimum at x = 1
  const f = (v: Vector) => v.get(0) ** 2;
  const gradF = (v: Vector) => new Vector([2 * v.get(0)]);

  const constraints: Constraint[] = [
    { g: (v) => -v.get(0) + 1, gradG: (_v) => new Vector([-1]) }, // x >= 1 => -x + 1 <= 0
  ];

  const result = barrierMethod(f, gradF, constraints, new Vector([2]), {
    t0: 1,
    mu: 10,
    outerTol: 1e-4,
    innerMaxIter: 300,
    innerLearningRate: 0.01,
  });

  assertCloseTo(result.x.get(0), 1.0, 0.1);
  assertCloseTo(result.fVal, 1.0, 0.2);
});

Deno.test("barrierMethod — infeasible initial point throws", () => {
  const f = (v: Vector) => v.get(0);
  const gradF = (_v: Vector) => new Vector([1]);
  const constraints: Constraint[] = [
    { g: (v) => v.get(0) - 1, gradG: (_v) => new Vector([1]) }, // x <= 1
  ];

  let threw = false;
  try {
    barrierMethod(f, gradF, constraints, new Vector([2]));
  } catch {
    threw = true;
  }
  assertEquals(threw, true);
});

// ---------- Property: solution is feasible ----------

Deno.test("property — barrier method returns feasible point", () => {
  fc.assert(
    fc.property(
      fc.float({ min: Math.fround(0.1), max: Math.fround(0.9), noNaN: true }),
      fc.float({ min: Math.fround(0.1), max: Math.fround(0.9), noNaN: true }),
      (x0, y0) => {
        const f = (v: Vector) => v.get(0) + v.get(1);
        const gradF = (_v: Vector) => new Vector([1, 1]);
        const constraints: Constraint[] = [
          { g: (v) => -v.get(0), gradG: (_v) => new Vector([-1, 0]) },
          { g: (v) => -v.get(1), gradG: (_v) => new Vector([0, -1]) },
          { g: (v) => v.get(0) - 1, gradG: (_v) => new Vector([1, 0]) },
          { g: (v) => v.get(1) - 1, gradG: (_v) => new Vector([0, 1]) },
        ];
        const result = barrierMethod(f, gradF, constraints, new Vector([x0, y0]), {
          t0: 1,
          mu: 10,
          outerTol: 1e-3,
          innerMaxIter: 200,
        });
        // Result must be strictly feasible (barrier keeps it inside)
        return constraints.every((c) => c.g(result.x) < 0);
      },
    ),
    { numRuns: 15 },
  );
});
