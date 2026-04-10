import { assertEquals } from "@std/assert";
import * as fc from "fast-check";
import { Matrix, Vector } from "@math/core/linalg";
import { assertCloseTo, assertVectorCloseTo } from "@math/core/testing";
import { gaussEliminate } from "./mod.ts";

Deno.test("gaussEliminate — 2x2 reference", () => {
  const A = Matrix.from([
    [2, 1],
    [5, 7],
  ]);
  const b = new Vector([11, 13]);
  const { x, rank, determinant } = gaussEliminate(A, b);
  // Verify Ax = b rather than hardcoding a possibly wrong expected value.
  assertVectorCloseTo(A.mulVec(x), b);
  assertEquals(rank, 2);
  assertCloseTo(determinant, 9);
});

Deno.test("gaussEliminate — 3x3 reference", () => {
  // A = [[1,2,3],[0,1,4],[5,6,0]], b = [1,2,3]
  // Solution: x = [31/3, -38/3, 10/3] (approximately)
  const A = Matrix.from([
    [1, 2, 3],
    [0, 1, 4],
    [5, 6, 0],
  ]);
  const b = new Vector([1, 2, 3]);
  const { x, rank } = gaussEliminate(A, b);
  // Verify Ax = b
  assertVectorCloseTo(A.mulVec(x), b, 1e-10);
  assertEquals(rank, 3);
});

Deno.test("gaussEliminate — identity matrix", () => {
  const A = Matrix.identity(3);
  const b = new Vector([4, 5, 6]);
  const { x } = gaussEliminate(A, b);
  assertVectorCloseTo(x, b);
});

Deno.test("gaussEliminate — determinant sign with row swap", () => {
  // Rows that need swapping: first row has zero in pivot position
  const A = Matrix.from([
    [0, 1],
    [1, 0],
  ]);
  const b = new Vector([3, 7]);
  const { x, determinant } = gaussEliminate(A, b);
  assertVectorCloseTo(x, new Vector([7, 3]));
  assertCloseTo(determinant, -1);
});

Deno.test("gaussEliminate — singular matrix throws", () => {
  const A = Matrix.from([
    [1, 2],
    [2, 4],
  ]);
  const b = new Vector([3, 6]);
  let threw = false;
  try {
    gaussEliminate(A, b);
  } catch {
    threw = true;
  }
  assertEquals(threw, true);
});

Deno.test("gaussEliminate — property: Ax = b roundtrip", () => {
  // Generate a random invertible 3x3 matrix (diag-dominant to ensure invertibility)
  const arbEntry = fc.double({ min: -10, max: 10, noNaN: true, noDefaultInfinity: true });
  fc.assert(
    fc.property(
      fc.array(arbEntry, { minLength: 9, maxLength: 9 }),
      fc.array(arbEntry, { minLength: 3, maxLength: 3 }),
      (flatA, flatB) => {
        // Make diagonally dominant to ensure invertibility
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
        const { x } = gaussEliminate(A, b);
        const Ax = A.mulVec(x);
        for (let i = 0; i < 3; i++) {
          if (Math.abs(Ax.get(i) - b.get(i)) > 1e-6) return false;
        }
        return true;
      },
    ),
    { numRuns: 100 },
  );
});

Deno.test("gaussEliminate — property: determinant matches product of diag", () => {
  // For a diagonal matrix, det = product of diagonal entries
  const arbDiag = fc.double({ min: 0.5, max: 10, noNaN: true, noDefaultInfinity: true });
  fc.assert(
    fc.property(
      fc.array(arbDiag, { minLength: 3, maxLength: 3 }),
      (diag) => {
        const A = Matrix.diag(diag);
        const b = new Vector([1, 1, 1]);
        const { determinant } = gaussEliminate(A, b);
        const expected = diag.reduce((a, b) => a * b, 1);
        return Math.abs(determinant - expected) < 1e-8;
      },
    ),
    { numRuns: 50 },
  );
});
