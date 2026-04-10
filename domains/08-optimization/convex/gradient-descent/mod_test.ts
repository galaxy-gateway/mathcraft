import { assertEquals } from "@std/assert";
import * as fc from "fast-check";
import { assertCloseTo, assertVectorCloseTo } from "@math/core/testing";
import { Vector } from "@math/core/linalg";
import { adam, gradientDescent, momentumGD, nesterovGD } from "./mod.ts";

// ---------- Test functions ----------

/** f(x) = x^T x, grad = 2x, minimum at origin. */
const quadratic = (x: Vector) => x.dot(x);
const quadraticGrad = (x: Vector) => x.scale(2);

/** Rosenbrock: f(x,y) = (1-x)^2 + 100(y-x^2)^2, minimum at (1,1). */
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

// ---------- gradientDescent ----------

Deno.test("gradientDescent — minimizes simple quadratic", () => {
  const result = gradientDescent(quadratic, quadraticGrad, new Vector([3, 4]), {
    learningRate: 0.1,
  });
  assertVectorCloseTo(result.x, Vector.zeros(2), 1e-6);
  assertCloseTo(result.fVal, 0, 1e-6);
});

Deno.test("gradientDescent — 1D quadratic f(x) = (x-3)^2", () => {
  const f = (x: Vector) => (x.get(0) - 3) ** 2;
  const grad = (x: Vector) => new Vector([2 * (x.get(0) - 3)]);
  const result = gradientDescent(f, grad, new Vector([0]), {
    learningRate: 0.1,
  });
  assertCloseTo(result.x.get(0), 3, 1e-6);
});

Deno.test("gradientDescent — history is monotonically decreasing on quadratic", () => {
  const result = gradientDescent(quadratic, quadraticGrad, new Vector([5, -3]), {
    learningRate: 0.1,
  });
  for (let i = 1; i < result.history.length; i++) {
    assertEquals(result.history[i] <= result.history[i - 1], true);
  }
});

// ---------- momentumGD ----------

Deno.test("momentumGD — minimizes simple quadratic", () => {
  const result = momentumGD(quadratic, quadraticGrad, new Vector([3, 4]), {
    learningRate: 0.01,
    beta: 0.9,
  });
  assertVectorCloseTo(result.x, Vector.zeros(2), 1e-5);
});

Deno.test("momentumGD — converges faster than vanilla on elongated quadratic", () => {
  // f(x,y) = 50*x^2 + y^2  (condition number 50)
  const f = (v: Vector) => 50 * v.get(0) ** 2 + v.get(1) ** 2;
  const grad = (v: Vector) => new Vector([100 * v.get(0), 2 * v.get(1)]);
  const x0 = new Vector([1, 1]);

  const vanilla = gradientDescent(f, grad, x0, { learningRate: 0.005, tol: 1e-6 });
  const momentum = momentumGD(f, grad, x0, { learningRate: 0.005, beta: 0.9, tol: 1e-6 });

  // Momentum should use fewer iterations (or equal)
  assertEquals(momentum.iterations <= vanilla.iterations, true);
});

// ---------- nesterovGD ----------

Deno.test("nesterovGD — minimizes simple quadratic", () => {
  const result = nesterovGD(quadratic, quadraticGrad, new Vector([3, 4]), {
    learningRate: 0.01,
    beta: 0.9,
  });
  assertVectorCloseTo(result.x, Vector.zeros(2), 1e-5);
});

// ---------- adam ----------

Deno.test("adam — minimizes simple quadratic", () => {
  const result = adam(quadratic, quadraticGrad, new Vector([3, 4]), {
    learningRate: 0.1,
  });
  assertVectorCloseTo(result.x, Vector.zeros(2), 1e-4);
});

Deno.test("adam — minimizes Rosenbrock (starting near optimum)", () => {
  const result = adam(rosenbrock, rosenbrockGrad, new Vector([0.5, 0.5]), {
    learningRate: 0.01,
    maxIter: 50000,
    tol: 1e-7,
  });
  assertCloseTo(result.x.get(0), 1.0, 0.05);
  assertCloseTo(result.x.get(1), 1.0, 0.05);
});

// ---------- Property-based tests ----------

Deno.test("property — gradient descent finds point where ||grad|| < tol", () => {
  fc.assert(
    fc.property(
      fc.float({ min: -10, max: 10, noNaN: true }),
      fc.float({ min: -10, max: 10, noNaN: true }),
      (a, b) => {
        const x0 = new Vector([a, b]);
        const result = gradientDescent(quadratic, quadraticGrad, x0, {
          learningRate: 0.1,
          tol: 1e-6,
        });
        const g = quadraticGrad(result.x);
        return g.norm() < 1e-5;
      },
    ),
    { numRuns: 50 },
  );
});

Deno.test("property — adam converges on shifted quadratics", () => {
  fc.assert(
    fc.property(
      fc.float({ min: -5, max: 5, noNaN: true }),
      fc.float({ min: -5, max: 5, noNaN: true }),
      (cx, cy) => {
        const center = new Vector([cx, cy]);
        const f = (x: Vector) => x.sub(center).dot(x.sub(center));
        const grad = (x: Vector) => x.sub(center).scale(2);
        const result = adam(f, grad, Vector.zeros(2), {
          learningRate: 0.1,
          maxIter: 5000,
          tol: 1e-5,
        });
        return result.x.sub(center).norm() < 0.1;
      },
    ),
    { numRuns: 20 },
  );
});
