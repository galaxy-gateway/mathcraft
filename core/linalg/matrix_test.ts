import { assertEquals, assertThrows } from "@std/assert";
import * as fc from "fast-check";
import { Matrix } from "./matrix.ts";
import { Vector } from "./vector.ts";

Deno.test("Matrix — from nested array", () => {
  const m = Matrix.from([
    [1, 2, 3],
    [4, 5, 6],
  ]);
  assertEquals(m.rows, 2);
  assertEquals(m.cols, 3);
  assertEquals(m.get(1, 2), 6);
});

Deno.test("Matrix — identity", () => {
  const I = Matrix.identity(3);
  assertEquals(I.toArray(), [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]);
});

Deno.test("Matrix — multiplication", () => {
  const a = Matrix.from([
    [1, 2],
    [3, 4],
  ]);
  const b = Matrix.from([
    [5, 6],
    [7, 8],
  ]);
  assertEquals(a.mul(b).toArray(), [
    [19, 22],
    [43, 50],
  ]);
});

Deno.test("Matrix — A * I = A", () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.array(fc.integer({ min: -10, max: 10 }), { minLength: 3, maxLength: 3 }),
        { minLength: 3, maxLength: 3 },
      ),
      (rows) => {
        const A = Matrix.from(rows);
        return A.mul(Matrix.identity(3)).equals(A);
      },
    ),
    { numRuns: 50 },
  );
});

Deno.test("Matrix — transpose", () => {
  const m = Matrix.from([
    [1, 2, 3],
    [4, 5, 6],
  ]);
  assertEquals(m.transpose().toArray(), [
    [1, 4],
    [2, 5],
    [3, 6],
  ]);
});

Deno.test("Matrix — (Aᵀ)ᵀ = A property", () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.array(fc.integer({ min: -50, max: 50 }), { minLength: 2, maxLength: 4 }),
        { minLength: 2, maxLength: 4 },
      ),
      (rows) => {
        const cols = rows[0].length;
        if (!rows.every((row) => row.length === cols)) return true;
        const A = Matrix.from(rows);
        return A.transpose().transpose().equals(A);
      },
    ),
    { numRuns: 50 },
  );
});

Deno.test("Matrix — mulVec", () => {
  const A = Matrix.from([
    [1, 2, 3],
    [4, 5, 6],
  ]);
  const v = new Vector([1, 1, 1]);
  assertEquals(A.mulVec(v).toArray(), [6, 15]);
});

Deno.test("Matrix — shape mismatches throw", () => {
  const A = Matrix.from([[1, 2]]);
  const B = Matrix.from([[1, 2]]);
  assertThrows(() => A.mul(B), RangeError);
  assertThrows(() => A.add(Matrix.from([[1]])), RangeError);
});
