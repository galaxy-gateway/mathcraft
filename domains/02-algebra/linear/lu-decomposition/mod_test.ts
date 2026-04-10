import * as fc from "fast-check";
import { Matrix, Vector } from "@math/core/linalg";
import { assertMatrixCloseTo, assertVectorCloseTo } from "@math/core/testing";
import { lu, luSolve } from "./mod.ts";

Deno.test("lu — 3x3 reference, PA = LU", () => {
  const A = Matrix.from([
    [2, 3, 1],
    [4, 7, 5],
    [6, 18, 22],
  ]);
  const { L, U, P } = lu(A);

  // Verify PA = LU
  const PA = P.mul(A);
  const LU = L.mul(U);
  assertMatrixCloseTo(PA, LU, 1e-10);
});

Deno.test("lu — L is unit lower-triangular", () => {
  const A = Matrix.from([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 10],
  ]);
  const { L } = lu(A);
  for (let i = 0; i < 3; i++) {
    // Diagonal is 1
    if (Math.abs(L.get(i, i) - 1) > 1e-12) {
      throw new Error(`L diagonal [${i}] should be 1, got ${L.get(i, i)}`);
    }
    // Upper part is 0
    for (let j = i + 1; j < 3; j++) {
      if (Math.abs(L.get(i, j)) > 1e-12) {
        throw new Error(`L upper [${i},${j}] should be 0, got ${L.get(i, j)}`);
      }
    }
  }
});

Deno.test("lu — U is upper-triangular", () => {
  const A = Matrix.from([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 10],
  ]);
  const { U } = lu(A);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < i; j++) {
      if (Math.abs(U.get(i, j)) > 1e-12) {
        throw new Error(`U lower [${i},${j}] should be 0, got ${U.get(i, j)}`);
      }
    }
  }
});

Deno.test("lu — identity matrix", () => {
  const A = Matrix.identity(3);
  const { L, U, P } = lu(A);
  assertMatrixCloseTo(L, Matrix.identity(3), 1e-12);
  assertMatrixCloseTo(U, Matrix.identity(3), 1e-12);
  assertMatrixCloseTo(P, Matrix.identity(3), 1e-12);
});

Deno.test("luSolve — 3x3 reference", () => {
  const A = Matrix.from([
    [2, 1, -1],
    [-3, -1, 2],
    [-2, 1, 2],
  ]);
  const b = new Vector([8, -11, -3]);
  const { L, U, P } = lu(A);
  const x = luSolve(L, U, P, b);
  // Verify Ax = b
  assertVectorCloseTo(A.mulVec(x), b, 1e-10);
});

Deno.test("luSolve — diagonal matrix", () => {
  const A = Matrix.diag([2, 3, 5]);
  const b = new Vector([4, 9, 25]);
  const { L, U, P } = lu(A);
  const x = luSolve(L, U, P, b);
  assertVectorCloseTo(x, new Vector([2, 3, 5]), 1e-10);
});

Deno.test("lu — property: PA = LU for random diag-dominant matrices", () => {
  const arbEntry = fc.double({ min: -10, max: 10, noNaN: true, noDefaultInfinity: true });
  fc.assert(
    fc.property(
      fc.array(arbEntry, { minLength: 9, maxLength: 9 }),
      (flatA) => {
        // Make diagonally dominant
        const data = [...flatA];
        for (let i = 0; i < 3; i++) {
          let rowSum = 0;
          for (let j = 0; j < 3; j++) {
            if (i !== j) rowSum += Math.abs(data[i * 3 + j]);
          }
          data[i * 3 + i] = rowSum + 1 + Math.abs(data[i * 3 + i]);
        }
        const A = new Matrix(3, 3, data);
        const { L, U, P } = lu(A);
        const PA = P.mul(A);
        const LU = L.mul(U);
        return PA.equals(LU, 1e-8);
      },
    ),
    { numRuns: 100 },
  );
});

Deno.test("luSolve — property: Ax = b roundtrip", () => {
  const arbEntry = fc.double({ min: -5, max: 5, noNaN: true, noDefaultInfinity: true });
  fc.assert(
    fc.property(
      fc.array(arbEntry, { minLength: 9, maxLength: 9 }),
      fc.array(arbEntry, { minLength: 3, maxLength: 3 }),
      (flatA, flatB) => {
        const data = [...flatA];
        for (let i = 0; i < 3; i++) {
          let rowSum = 0;
          for (let j = 0; j < 3; j++) {
            if (i !== j) rowSum += Math.abs(data[i * 3 + j]);
          }
          data[i * 3 + i] = rowSum + 1 + Math.abs(data[i * 3 + i]);
        }
        const A = new Matrix(3, 3, data);
        const b = new Vector(flatB);
        const { L, U, P } = lu(A);
        const x = luSolve(L, U, P, b);
        const Ax = A.mulVec(x);
        return Ax.equals(b, 1e-6);
      },
    ),
    { numRuns: 100 },
  );
});
