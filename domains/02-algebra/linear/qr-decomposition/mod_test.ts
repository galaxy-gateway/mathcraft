import * as fc from "fast-check";
import { Matrix, Vector } from "@math/core/linalg";
import { assertCloseTo, assertMatrixCloseTo, assertVectorCloseTo } from "@math/core/testing";
import { qr, qrSolve } from "./mod.ts";

Deno.test("qr — 3x3 reference, A = QR", () => {
  const A = Matrix.from([
    [1, 1, 0],
    [1, 0, 1],
    [0, 1, 1],
  ]);
  const { Q, R } = qr(A);
  // Verify A = QR
  assertMatrixCloseTo(Q.mul(R), A, 1e-10);
});

Deno.test("qr — Q has orthonormal columns", () => {
  const A = Matrix.from([
    [12, -51, 4],
    [6, 167, -68],
    [-4, 24, -41],
  ]);
  const { Q } = qr(A);
  // Q^T Q should be identity
  const QtQ = Q.transpose().mul(Q);
  assertMatrixCloseTo(QtQ, Matrix.identity(3), 1e-10);
});

Deno.test("qr — R is upper-triangular", () => {
  const A = Matrix.from([
    [12, -51, 4],
    [6, 167, -68],
    [-4, 24, -41],
  ]);
  const { R } = qr(A);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < i; j++) {
      assertCloseTo(R.get(i, j), 0, 1e-10, `R[${i}][${j}]`);
    }
  }
});

Deno.test("qr — R diagonal is positive", () => {
  // Classical Gram-Schmidt produces positive diagonal in R
  const A = Matrix.from([
    [1, 2],
    [3, 4],
    [5, 6],
  ]);
  const { R } = qr(A);
  for (let i = 0; i < 2; i++) {
    if (R.get(i, i) <= 0) {
      throw new Error(`R[${i}][${i}] = ${R.get(i, i)} should be positive`);
    }
  }
});

Deno.test("qr — identity matrix", () => {
  const A = Matrix.identity(3);
  const { Q, R } = qr(A);
  assertMatrixCloseTo(Q, Matrix.identity(3), 1e-12);
  assertMatrixCloseTo(R, Matrix.identity(3), 1e-12);
});

Deno.test("qrSolve — 3x3 reference", () => {
  const A = Matrix.from([
    [1, 1, 0],
    [1, 0, 1],
    [0, 1, 1],
  ]);
  const b = new Vector([2, 3, 3]);
  const { Q, R } = qr(A);
  const x = qrSolve(Q, R, b);
  assertVectorCloseTo(A.mulVec(x), b, 1e-10);
});

Deno.test("qrSolve — overdetermined least squares (tall matrix)", () => {
  // 4x2 system, least-squares via QR
  const A = Matrix.from([
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
  ]);
  const b = new Vector([1, 2, 2, 3]);
  const { Q, R } = qr(A);
  const x = qrSolve(Q, R, b);
  // Check that the normal equation holds: A^T A x = A^T b
  const AtA = A.transpose().mul(A);
  const Atb = A.transpose().mulVec(b);
  assertVectorCloseTo(AtA.mulVec(x), Atb, 1e-8);
});

Deno.test("qr — property: Q^T Q = I for random matrices", () => {
  const arbEntry = fc.double({ min: -10, max: 10, noNaN: true, noDefaultInfinity: true });
  fc.assert(
    fc.property(
      fc.array(arbEntry, { minLength: 9, maxLength: 9 }),
      (flatA) => {
        // Make diag-dominant to ensure linear independence
        const data = [...flatA];
        for (let i = 0; i < 3; i++) {
          let rowSum = 0;
          for (let j = 0; j < 3; j++) {
            if (i !== j) rowSum += Math.abs(data[i * 3 + j]);
          }
          data[i * 3 + i] = rowSum + 1 + Math.abs(data[i * 3 + i]);
        }
        const A = new Matrix(3, 3, data);
        const { Q } = qr(A);
        const QtQ = Q.transpose().mul(Q);
        return QtQ.equals(Matrix.identity(3), 1e-8);
      },
    ),
    { numRuns: 100 },
  );
});

Deno.test("qr — property: A = QR roundtrip", () => {
  const arbEntry = fc.double({ min: -10, max: 10, noNaN: true, noDefaultInfinity: true });
  fc.assert(
    fc.property(
      fc.array(arbEntry, { minLength: 9, maxLength: 9 }),
      (flatA) => {
        const data = [...flatA];
        for (let i = 0; i < 3; i++) {
          let rowSum = 0;
          for (let j = 0; j < 3; j++) {
            if (i !== j) rowSum += Math.abs(data[i * 3 + j]);
          }
          data[i * 3 + i] = rowSum + 1 + Math.abs(data[i * 3 + i]);
        }
        const A = new Matrix(3, 3, data);
        const { Q, R } = qr(A);
        return Q.mul(R).equals(A, 1e-8);
      },
    ),
    { numRuns: 100 },
  );
});
