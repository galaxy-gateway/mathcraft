/**
 * Demo: Newton's method vs gradient descent convergence rate.
 *
 * Run with: `deno task demo domains/08-optimization/convex/newton-method/demo.ts`
 */

import { emit } from "@math/core/viz";
import { Matrix, Vector } from "@math/core/linalg";
import { newtonOptimize } from "./mod.ts";
import { gradientDescent } from "../gradient-descent/mod.ts";

// Ill-conditioned quadratic: f(x) = 0.5 * x^T Q x, Q = diag(1, 100)
// Minimum at origin. Condition number = 100.
const Q = Matrix.diag([1, 100]);
const f = (x: Vector) => 0.5 * x.dot(Q.mulVec(x));
const grad = (x: Vector) => Q.mulVec(x);
const hess = (_x: Vector) => Q;

const x0 = new Vector([10, 10]);

const newtonResult = newtonOptimize(f, grad, hess, x0, { maxIter: 50 });
const gdResult = gradientDescent(f, grad, x0, {
  learningRate: 0.005,
  maxIter: 500,
});

function toLogCurve(history: number[]): Array<[number, number]> {
  return history.map((v, i) => [i, Math.log10(Math.max(v, 1e-16))]);
}

emit({
  kind: "curve",
  title: "Newton vs Gradient Descent on ill-conditioned quadratic",
  description: `Minimizing f(x) = 0.5 * x^T diag(1,100) x from x0 = (10,10). ` +
    `Newton converges in ${newtonResult.iterations} iterations (quadratic rate) ` +
    `while gradient descent takes ${gdResult.iterations} iterations (linear rate). ` +
    `The condition number kappa=100 slows GD but barely affects Newton.`,
  data: {
    xLabel: "Iteration",
    yLabel: "log10(f(x))",
    series: [
      {
        label: `Newton (${newtonResult.iterations} iters)`,
        points: toLogCurve(newtonResult.history),
      },
      { label: `GD (${gdResult.iterations} iters)`, points: toLogCurve(gdResult.history) },
    ],
  },
});
