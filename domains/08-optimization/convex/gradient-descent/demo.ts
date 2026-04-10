/**
 * Demo: Gradient descent variants on the Rosenbrock function.
 *
 * Run with: `deno task demo domains/08-optimization/convex/gradient-descent/demo.ts`
 */

import { emit } from "@math/core/viz";
import { Vector } from "@math/core/linalg";
import { adam, gradientDescent, momentumGD, nesterovGD } from "./mod.ts";

// Rosenbrock: f(x, y) = (1 - x)^2 + 100(y - x^2)^2
// Minimum at (1, 1)
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

const x0 = new Vector([-1, 1]);
const maxIter = 5000;

const vanilla = gradientDescent(rosenbrock, rosenbrockGrad, x0, {
  learningRate: 0.001,
  maxIter,
});
const momentum = momentumGD(rosenbrock, rosenbrockGrad, x0, {
  learningRate: 0.001,
  beta: 0.9,
  maxIter,
});
const nesterov = nesterovGD(rosenbrock, rosenbrockGrad, x0, {
  learningRate: 0.001,
  beta: 0.9,
  maxIter,
});
const adamResult = adam(rosenbrock, rosenbrockGrad, x0, {
  learningRate: 0.01,
  maxIter,
});

// Convergence curves (subsample for reasonable output size)
function subsample(arr: number[], maxPoints: number): Array<[number, number]> {
  const step = Math.max(1, Math.floor(arr.length / maxPoints));
  const points: Array<[number, number]> = [];
  for (let i = 0; i < arr.length; i += step) {
    points.push([i, Math.log10(Math.max(arr[i], 1e-16))]);
  }
  return points;
}

emit({
  kind: "curve",
  title: "Gradient descent variants on Rosenbrock",
  description: "Convergence comparison: log10(f(x)) vs iteration for vanilla GD, " +
    "momentum, Nesterov, and Adam starting from (-1, 1). The Rosenbrock " +
    "minimum is at (1, 1) with f* = 0.",
  data: {
    xLabel: "Iteration",
    yLabel: "log10(f(x))",
    series: [
      {
        label: `Vanilla GD (${vanilla.iterations} iters)`,
        points: subsample(vanilla.history, 100),
      },
      {
        label: `Momentum (${momentum.iterations} iters)`,
        points: subsample(momentum.history, 100),
      },
      {
        label: `Nesterov (${nesterov.iterations} iters)`,
        points: subsample(nesterov.history, 100),
      },
      {
        label: `Adam (${adamResult.iterations} iters)`,
        points: subsample(adamResult.history, 100),
      },
    ],
  },
});
