import { assertEquals } from "@std/assert";
import { assertCloseTo, assertVectorCloseTo } from "@math/core/testing";
import { Matrix, Vector } from "@math/core/linalg";
import { gradientDescentLR, mse, normalEquation, predict } from "./mod.ts";

// y = 2x + 1, with intercept column.
const X = Matrix.from([
  [1, 1],
  [1, 2],
  [1, 3],
  [1, 4],
  [1, 5],
]);
const y = new Vector([3, 5, 7, 9, 11]);

Deno.test("normalEquation — perfect linear fit", () => {
  const beta = normalEquation(X, y);
  assertCloseTo(beta.get(0), 1, 1e-8); // intercept
  assertCloseTo(beta.get(1), 2, 1e-8); // slope
});

Deno.test("normalEquation — predictions match", () => {
  const beta = normalEquation(X, y);
  const preds = predict(X, beta);
  assertVectorCloseTo(preds, y, 1e-8);
});

Deno.test("gradientDescentLR — converges to correct solution", () => {
  const { beta, losses } = gradientDescentLR(X, y, 0.01, 5000);
  assertCloseTo(beta.get(0), 1, 0.1);
  assertCloseTo(beta.get(1), 2, 0.1);
  // Losses should decrease monotonically.
  for (let i = 1; i < losses.length; i++) {
    if (losses[i] > losses[i - 1] + 1e-12) {
      throw new Error(`Loss increased at step ${i}: ${losses[i - 1]} → ${losses[i]}`);
    }
  }
});

Deno.test("mse — zero for perfect fit", () => {
  const beta = normalEquation(X, y);
  const preds = predict(X, beta);
  assertCloseTo(mse(y, preds), 0, 1e-14);
});

Deno.test("mse — nonzero for imperfect predictions", () => {
  const preds = new Vector([2, 5, 7, 9, 11]); // first is off by 1
  const error = mse(y, preds);
  assertEquals(error > 0, true);
  assertCloseTo(error, 1 / 5, 1e-12); // (1² + 0 + 0 + 0 + 0) / 5 = 0.2
});
