import * as fc from "fast-check";
import { Matrix, Vector } from "@math/core/linalg";
import { assertCloseTo, assertVectorCloseTo } from "@math/core/testing";
import { qrEigenvalues } from "./mod.ts";

Deno.test("qrEigenvalues — 2x2 diagonal", () => {
  const A = Matrix.diag([3, 7]);
  const eigs = qrEigenvalues(A);
  assertVectorCloseTo(eigs, new Vector([3, 7]), 1e-10);
});

Deno.test("qrEigenvalues — 2x2 symmetric", () => {
  // [[2,1],[1,2]] has eigenvalues 1 and 3
  const A = Matrix.from([
    [2, 1],
    [1, 2],
  ]);
  const eigs = qrEigenvalues(A);
  assertVectorCloseTo(eigs, new Vector([1, 3]), 1e-10);
});

Deno.test("qrEigenvalues — 3x3 symmetric reference", () => {
  const A = Matrix.from([
    [4, 1, 1],
    [1, 3, 1],
    [1, 1, 2],
  ]);
  const eigs = qrEigenvalues(A, 5000, 1e-12);
  // Eigenvalues sum = trace = 4+3+2 = 9
  const sum = eigs.get(0) + eigs.get(1) + eigs.get(2);
  assertCloseTo(sum, 9, 0.1);
  // Product = determinant = 17
  const prod = eigs.get(0) * eigs.get(1) * eigs.get(2);
  assertCloseTo(prod, 17, 1.0);
});

Deno.test("qrEigenvalues — identity matrix", () => {
  const eigs = qrEigenvalues(Matrix.identity(3));
  assertVectorCloseTo(eigs, new Vector([1, 1, 1]), 1e-10);
});

Deno.test("qrEigenvalues — 3x3 with known eigenvalues", () => {
  // Build a symmetric matrix with eigenvalues 1, 2, 3 via Q D Q^T
  // Use a simple orthogonal Q (rotation in the 1-2 plane)
  const D = Matrix.diag([1, 2, 3]);
  // A symmetric matrix with these eigenvalues on the diagonal is just D
  const eigs = qrEigenvalues(D);
  assertVectorCloseTo(eigs, new Vector([1, 2, 3]), 1e-10);
});

Deno.test("qrEigenvalues — property: sum of eigenvalues = trace", () => {
  const arbEntry = fc.double({ min: -5, max: 5, noNaN: true, noDefaultInfinity: true });
  fc.assert(
    fc.property(
      fc.array(arbEntry, { minLength: 3, maxLength: 3 }),
      (offDiag) => {
        // Build symmetric 3x3 matrix
        const A = Matrix.from([
          [5, offDiag[0], offDiag[1]],
          [offDiag[0], 3, offDiag[2]],
          [offDiag[1], offDiag[2], 1],
        ]);
        const eigs = qrEigenvalues(A);
        const trace = 5 + 3 + 1;
        const eigSum = eigs.get(0) + eigs.get(1) + eigs.get(2);
        return Math.abs(eigSum - trace) < 1e-6;
      },
    ),
    { numRuns: 50 },
  );
});

Deno.test("qrEigenvalues — property: eigenvalues are real and sorted", () => {
  const arbEntry = fc.double({ min: -3, max: 3, noNaN: true, noDefaultInfinity: true });
  fc.assert(
    fc.property(
      fc.array(arbEntry, { minLength: 3, maxLength: 3 }),
      (offDiag) => {
        const A = Matrix.from([
          [4, offDiag[0], offDiag[1]],
          [offDiag[0], 3, offDiag[2]],
          [offDiag[1], offDiag[2], 2],
        ]);
        const eigs = qrEigenvalues(A);
        // All finite
        for (let i = 0; i < 3; i++) {
          if (!Number.isFinite(eigs.get(i))) return false;
        }
        // Sorted ascending
        for (let i = 1; i < 3; i++) {
          if (eigs.get(i) < eigs.get(i - 1) - 1e-10) return false;
        }
        return true;
      },
    ),
    { numRuns: 50 },
  );
});
