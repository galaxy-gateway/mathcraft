/**
 * Demo: Interior-point (log-barrier) method on box-constrained linear program.
 *
 * Run with: `deno task demo domains/08-optimization/convex/interior-point/demo.ts`
 */

import { emit } from "@math/core/viz";
import { Vector } from "@math/core/linalg";
import { barrierMethod } from "./mod.ts";
import type { Constraint } from "./mod.ts";

// Minimize  -x - 2y  subject to  0 <= x <= 3,  0 <= y <= 2,  x + y <= 4
// Optimum at (2, 2) with f* = -6
const f = (v: Vector) => -v.get(0) - 2 * v.get(1);
const gradF = (_v: Vector) => new Vector([-1, -2]);

const constraints: Constraint[] = [
  { g: (v) => -v.get(0), gradG: (_v) => new Vector([-1, 0]) }, // x >= 0
  { g: (v) => -v.get(1), gradG: (_v) => new Vector([0, -1]) }, // y >= 0
  { g: (v) => v.get(0) - 3, gradG: (_v) => new Vector([1, 0]) }, // x <= 3
  { g: (v) => v.get(1) - 2, gradG: (_v) => new Vector([0, 1]) }, // y <= 2
  { g: (v) => v.get(0) + v.get(1) - 4, gradG: (_v) => new Vector([1, 1]) }, // x+y <= 4
];

const result = barrierMethod(f, gradF, constraints, new Vector([1, 1]), {
  t0: 1,
  mu: 5,
  outerTol: 1e-4,
  innerMaxIter: 300,
  innerLearningRate: 0.01,
});

// Show convergence of objective value across outer iterations
const convergencePoints: Array<[number, number]> = result.history.map((v, i) => [i, v]);

emit({
  kind: "curve",
  title: "Interior-point convergence on box-constrained LP",
  description: `Minimize -x - 2y subject to box constraints and x+y <= 4. ` +
    `Optimal value is -6 at (2, 2). Barrier method found f* = ${result.fVal.toFixed(4)} ` +
    `at (${result.x.get(0).toFixed(4)}, ${result.x.get(1).toFixed(4)}) ` +
    `in ${result.outerIterations} outer iterations ` +
    `(${result.totalInnerIterations} total inner iterations).`,
  data: {
    xLabel: "Outer iteration",
    yLabel: "f(x)",
    series: [
      { label: "Objective value", points: convergencePoints },
      {
        label: "Optimal (-6)",
        points: [[0, -6], [convergencePoints.length - 1, -6]],
      },
    ],
  },
});
