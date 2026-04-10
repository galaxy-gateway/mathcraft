import { assertAlmostEquals, assertEquals, assertThrows } from "@std/assert";
import * as fc from "fast-check";
import { Vector } from "./vector.ts";

Deno.test("Vector — construction and accessors", () => {
  const v = new Vector([1, 2, 3]);
  assertEquals(v.length, 3);
  assertEquals(v.get(0), 1);
  assertEquals(v.get(2), 3);
  assertThrows(() => v.get(3), RangeError);
});

Deno.test("Vector — zeros, ones, basis", () => {
  assertEquals(Vector.zeros(3).toArray(), [0, 0, 0]);
  assertEquals(Vector.ones(3).toArray(), [1, 1, 1]);
  assertEquals(Vector.basis(3, 1).toArray(), [0, 1, 0]);
});

Deno.test("Vector — add, sub, scale", () => {
  const a = new Vector([1, 2, 3]);
  const b = new Vector([4, 5, 6]);
  assertEquals(a.add(b).toArray(), [5, 7, 9]);
  assertEquals(b.sub(a).toArray(), [3, 3, 3]);
  assertEquals(a.scale(2).toArray(), [2, 4, 6]);
});

Deno.test("Vector — dot product and norm", () => {
  const a = new Vector([3, 4]);
  assertEquals(a.dot(a), 25);
  assertEquals(a.norm(), 5);
});

Deno.test("Vector — normalized length is 1", () => {
  const v = new Vector([1, 2, 2]).normalized();
  assertAlmostEquals(v.norm(), 1, 1e-12);
});

Deno.test("Vector — size mismatch throws", () => {
  assertThrows(() => new Vector([1, 2]).add(new Vector([1, 2, 3])), RangeError);
});

Deno.test("Vector — property: commutativity of addition", () => {
  fc.assert(
    fc.property(
      fc.array(fc.float({ noNaN: true, noDefaultInfinity: true }), {
        minLength: 1,
        maxLength: 20,
      }),
      fc.array(fc.float({ noNaN: true, noDefaultInfinity: true }), {
        minLength: 1,
        maxLength: 20,
      }),
      (a, b) => {
        const n = Math.min(a.length, b.length);
        const va = new Vector(a.slice(0, n));
        const vb = new Vector(b.slice(0, n));
        return va.add(vb).equals(vb.add(va), 1e-12);
      },
    ),
    { numRuns: 100 },
  );
});
