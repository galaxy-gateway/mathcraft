import * as fc from "fast-check";
import { Matrix } from "@math/core/linalg";
import { assertCloseTo, assertMatrixCloseTo } from "@math/core/testing";
import { svd } from "./mod.ts";

Deno.test("svd — 2x2 reference", () => {
  const A = Matrix.from([
    [3, 0],
    [0, 2],
  ]);
  const { U, S, Vt } = svd(A);
  // Singular values should be 3, 2 (descending)
  assertCloseTo(S.get(0), 3, 1e-10);
  assertCloseTo(S.get(1), 2, 1e-10);
  // Reconstruct: U * diag(S) * Vt = A
  const reconstructed = U.mul(Matrix.diag(S.toArray())).mul(Vt);
  assertMatrixCloseTo(reconstructed, A, 1e-10);
});

Deno.test("svd — 3x3 reference reconstruction", () => {
  const A = Matrix.from([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 10],
  ]);
  const { U, S, Vt } = svd(A);
  const reconstructed = U.mul(Matrix.diag(S.toArray())).mul(Vt);
  assertMatrixCloseTo(reconstructed, A, 1e-8);
});

Deno.test("svd — U is orthogonal", () => {
  const A = Matrix.from([
    [1, 2],
    [3, 4],
  ]);
  const { U } = svd(A);
  const UtU = U.transpose().mul(U);
  assertMatrixCloseTo(UtU, Matrix.identity(2), 1e-10);
});

Deno.test("svd — Vt is orthogonal", () => {
  const A = Matrix.from([
    [1, 2],
    [3, 4],
  ]);
  const { Vt } = svd(A);
  const VtVtT = Vt.mul(Vt.transpose());
  assertMatrixCloseTo(VtVtT, Matrix.identity(2), 1e-10);
});

Deno.test("svd — singular values are non-negative and decreasing", () => {
  const A = Matrix.from([
    [1, 0, 0],
    [0, 2, 0],
    [0, 0, 0.5],
  ]);
  const { S } = svd(A);
  for (let i = 0; i < S.length; i++) {
    if (S.get(i) < -1e-12) {
      throw new Error(`Singular value ${i} is negative: ${S.get(i)}`);
    }
    if (i > 0 && S.get(i) > S.get(i - 1) + 1e-12) {
      throw new Error(`Singular values not decreasing at index ${i}`);
    }
  }
});

Deno.test("svd — identity matrix", () => {
  const A = Matrix.identity(3);
  const { S } = svd(A);
  for (let i = 0; i < 3; i++) {
    assertCloseTo(S.get(i), 1, 1e-10);
  }
});

Deno.test("svd — property: A = U * diag(S) * Vt roundtrip", () => {
  const arbEntry = fc.double({ min: -5, max: 5, noNaN: true, noDefaultInfinity: true });
  fc.assert(
    fc.property(
      fc.array(arbEntry, { minLength: 4, maxLength: 4 }),
      (flatA) => {
        const A = new Matrix(2, 2, flatA);
        const { U, S, Vt } = svd(A);
        const reconstructed = U.mul(Matrix.diag(S.toArray())).mul(Vt);
        return reconstructed.equals(A, 1e-6);
      },
    ),
    { numRuns: 50 },
  );
});

Deno.test("svd — property: U^T U = I", () => {
  const arbEntry = fc.double({ min: -5, max: 5, noNaN: true, noDefaultInfinity: true });
  fc.assert(
    fc.property(
      fc.array(arbEntry, { minLength: 9, maxLength: 9 }),
      (flatA) => {
        // Make non-singular
        const data = [...flatA];
        for (let i = 0; i < 3; i++) {
          let s = 0;
          for (let j = 0; j < 3; j++) if (i !== j) s += Math.abs(data[i * 3 + j]);
          data[i * 3 + i] = s + 1 + Math.abs(data[i * 3 + i]);
        }
        const A = new Matrix(3, 3, data);
        const { U } = svd(A);
        const UtU = U.transpose().mul(U);
        return UtU.equals(Matrix.identity(3), 1e-6);
      },
    ),
    { numRuns: 50 },
  );
});
