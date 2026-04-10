import { assertEquals, assertThrows } from "@std/assert";
import { isQuadraticResidue, legendreSymbol } from "./mod.ts";
import { mod } from "@math/core/numeric";

Deno.test("legendreSymbol — reference values mod 7", () => {
  // QRs mod 7: squares are {0, 1, 4, 2, 2, 4, 1} → {1, 2, 4}
  assertEquals(legendreSymbol(0n, 7n), 0);
  assertEquals(legendreSymbol(1n, 7n), 1);
  assertEquals(legendreSymbol(2n, 7n), 1);
  assertEquals(legendreSymbol(3n, 7n), -1);
  assertEquals(legendreSymbol(4n, 7n), 1);
  assertEquals(legendreSymbol(5n, 7n), -1);
  assertEquals(legendreSymbol(6n, 7n), -1);
});

Deno.test("legendreSymbol — reference values mod 11", () => {
  // QRs mod 11: {1, 3, 4, 5, 9}
  const qr = new Set([1n, 3n, 4n, 5n, 9n]);
  for (let a = 1n; a < 11n; a++) {
    const expected = qr.has(a) ? 1 : -1;
    assertEquals(legendreSymbol(a, 11n), expected);
  }
});

Deno.test("legendreSymbol — matches brute force on small primes", () => {
  const primes = [3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n];
  for (const p of primes) {
    const squares = new Set<bigint>();
    for (let x = 1n; x < p; x++) squares.add(mod(x * x, p));
    for (let a = 0n; a < p; a++) {
      const expected = a === 0n ? 0 : (squares.has(a) ? 1 : -1);
      assertEquals(legendreSymbol(a, p), expected);
    }
  }
});

Deno.test("legendreSymbol — rejects p <= 2", () => {
  assertThrows(() => legendreSymbol(1n, 2n), RangeError);
});

Deno.test("isQuadraticResidue", () => {
  assertEquals(isQuadraticResidue(2n, 7n), true);
  assertEquals(isQuadraticResidue(3n, 7n), false);
  assertEquals(isQuadraticResidue(0n, 7n), false);
});
