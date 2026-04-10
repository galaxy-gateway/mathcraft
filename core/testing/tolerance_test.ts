import { assertThrows } from "@std/assert";
import { assertCloseTo, assertMatrixCloseTo, assertVectorCloseTo } from "./tolerance.ts";
import { Matrix } from "../linalg/matrix.ts";
import { Vector } from "../linalg/vector.ts";

Deno.test("assertCloseTo — accepts within tolerance", () => {
  assertCloseTo(0.1 + 0.2, 0.3, 1e-10);
});

Deno.test("assertCloseTo — rejects outside tolerance", () => {
  assertThrows(() => assertCloseTo(1, 2, 1e-10));
});

Deno.test("assertCloseTo — rejects NaN", () => {
  assertThrows(() => assertCloseTo(NaN, 1, 1e-10));
});

Deno.test("assertVectorCloseTo — shape check", () => {
  assertThrows(() => assertVectorCloseTo(new Vector([1, 2]), new Vector([1, 2, 3])));
});

Deno.test("assertVectorCloseTo — element-wise", () => {
  assertVectorCloseTo(new Vector([1.00000001, 2]), new Vector([1, 2]), 1e-6);
  assertThrows(() => assertVectorCloseTo(new Vector([1.1, 2]), new Vector([1, 2]), 1e-6));
});

Deno.test("assertMatrixCloseTo — shape check", () => {
  const a = Matrix.from([[1]]);
  const b = Matrix.from([[1], [2]]);
  assertThrows(() => assertMatrixCloseTo(a, b));
});

Deno.test("assertMatrixCloseTo — element-wise", () => {
  assertMatrixCloseTo(
    Matrix.from([[1.0000001, 2]]),
    Matrix.from([[1, 2]]),
    1e-5,
  );
});
