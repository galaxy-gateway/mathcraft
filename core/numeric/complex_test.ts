import { assertAlmostEquals, assertEquals, assertThrows } from "@std/assert";
import { Complex } from "./complex.ts";

Deno.test("Complex — construction and constants", () => {
  const z = new Complex(3, 4);
  assertEquals(z.re, 3);
  assertEquals(z.im, 4);
  assertEquals(Complex.I.re, 0);
  assertEquals(Complex.I.im, 1);
});

Deno.test("Complex — arithmetic", () => {
  const a = new Complex(1, 2);
  const b = new Complex(3, 4);
  const sum = a.add(b);
  assertEquals(sum.re, 4);
  assertEquals(sum.im, 6);

  const product = a.mul(b);
  assertEquals(product.re, -5);
  assertEquals(product.im, 10);
});

Deno.test("Complex — i² = -1", () => {
  const isq = Complex.I.mul(Complex.I);
  assertEquals(isq.re, -1);
  assertEquals(isq.im, 0);
});

Deno.test("Complex — abs and arg", () => {
  const z = new Complex(3, 4);
  assertEquals(z.abs(), 5);
  assertAlmostEquals(new Complex(1, 1).arg(), Math.PI / 4, 1e-10);
});

Deno.test("Complex — division by zero throws", () => {
  assertThrows(() => new Complex(1, 0).div(Complex.ZERO), RangeError);
});

Deno.test("Complex — Euler's identity: e^(iπ) + 1 = 0", () => {
  const iPi = new Complex(0, Math.PI);
  const result = iPi.exp().add(Complex.ONE);
  assertAlmostEquals(result.re, 0, 1e-10);
  assertAlmostEquals(result.im, 0, 1e-10);
});
