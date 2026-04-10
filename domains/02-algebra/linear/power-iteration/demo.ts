/**
 * Demo: Power iteration on a 3x3 matrix.
 *
 * Run with: `deno task demo domains/02-algebra/linear/power-iteration/demo.ts`
 */

import { emit } from "@math/core/viz";
import { Matrix, Vector } from "@math/core/linalg";
import { powerIteration } from "./mod.ts";

const A = Matrix.from([
  [4, 1, 1],
  [1, 3, 1],
  [1, 1, 2],
]);

const { eigenvalue, iterations } = powerIteration(A);

// Trace the convergence by running a few steps manually
const traceSteps: Array<{ iter: number; eigenvalueEstimate: number }> = [];
let x = Vector.ones(3).normalized();
for (let i = 0; i < Math.min(iterations, 15); i++) {
  const y = A.mulVec(x);
  const est = x.dot(y);
  traceSteps.push({ iter: i, eigenvalueEstimate: est });
  x = y.scale(1 / y.norm());
}

emit({
  kind: "curve",
  title: "Power Iteration Convergence",
  description:
    `Dominant eigenvalue of A is ~${eigenvalue.toFixed(6)}, found in ${iterations} iterations. ` +
    "The curve shows the Rayleigh quotient converging to the true eigenvalue.",
  data: {
    xLabel: "Iteration",
    yLabel: "Eigenvalue estimate",
    series: [
      {
        label: "Rayleigh quotient",
        points: traceSteps.map((s) => [s.iter, s.eigenvalueEstimate] as [number, number]),
      },
    ],
  },
});
