import { assertEquals } from "@std/assert";
import { Matrix, Vector } from "@math/core/linalg";
import { assertCloseTo } from "@math/core/testing";
import { powerIteration } from "./mod.ts";

Deno.test("powerIteration — 2x2 diagonal matrix", () => {
  // Eigenvalues are 5 and 1; dominant is 5
  const A = Matrix.diag([5, 1]);
  const { eigenvalue, eigenvector } = powerIteration(A);
  assertCloseTo(eigenvalue, 5, 1e-6);
  // Eigenvector should be close to [1, 0] (up to sign)
  assertCloseTo(Math.abs(eigenvector.get(0)), 1, 1e-6);
});

Deno.test("powerIteration — 3x3 symmetric matrix", () => {
  const A = Matrix.from([
    [4, 1, 1],
    [1, 3, 1],
    [1, 1, 2],
  ]);
  const { eigenvalue, eigenvector } = powerIteration(A, 2000, 1e-12);
  // Check Av = lambda * v
  const Av = A.mulVec(eigenvector);
  const lambdaV = eigenvector.scale(eigenvalue);
  for (let i = 0; i < 3; i++) {
    assertCloseTo(Av.get(i), lambdaV.get(i), 1e-4);
  }
});

Deno.test("powerIteration — convergence: Av = lambda * v", () => {
  const A = Matrix.from([
    [2, -1],
    [-1, 2],
  ]);
  // Eigenvalues: 3 and 1. Use [1, -1] as initial vector to avoid the
  // degenerate case where [1,1] is an eigenvector for eigenvalue 1.
  const { eigenvalue, eigenvector } = powerIteration(A, 1000, 1e-10, new Vector([1, -1]));
  assertCloseTo(eigenvalue, 3, 1e-6);
  const Av = A.mulVec(eigenvector);
  const lambdaV = eigenvector.scale(eigenvalue);
  for (let i = 0; i < 2; i++) {
    assertCloseTo(Av.get(i), lambdaV.get(i), 1e-6);
  }
});

Deno.test("powerIteration — eigenvector has unit norm", () => {
  const A = Matrix.from([
    [3, 1],
    [1, 3],
  ]);
  const { eigenvector } = powerIteration(A);
  assertCloseTo(eigenvector.norm(), 1, 1e-10);
});

Deno.test("powerIteration — reports iteration count", () => {
  const A = Matrix.diag([10, 1]);
  const { iterations } = powerIteration(A);
  assertEquals(iterations < 100, true);
});

Deno.test("powerIteration — property: Av = lambda * v for diagonal-dominant matrices", () => {
  // Use well-conditioned diagonal-dominant matrices to avoid flakiness.
  const diags = [
    [10, 1],
    [20, 3],
    [15, 5],
    [100, 10],
    [7, 2],
  ];
  for (const [d1, d2] of diags) {
    const A = Matrix.diag([d1, d2]);
    const { eigenvalue, eigenvector } = powerIteration(A, 1000, 1e-10);
    const Av = A.mulVec(eigenvector);
    const lambdaV = eigenvector.scale(eigenvalue);
    if (!Av.equals(lambdaV, 0.01)) {
      throw new Error(`Failed for diag [${d1}, ${d2}]: lambda=${eigenvalue}`);
    }
  }
});
