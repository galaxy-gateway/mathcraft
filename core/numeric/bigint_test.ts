import { assertEquals, assertThrows } from "@std/assert";
import * as fc from "fast-check";
import { abs, bitLength, ipow, isqrt, max, min, mod, sign } from "./bigint.ts";

Deno.test("mod — positive inputs", () => {
  assertEquals(mod(7n, 3n), 1n);
  assertEquals(mod(9n, 3n), 0n);
});

Deno.test("mod — negative dividend is always non-negative", () => {
  assertEquals(mod(-1n, 3n), 2n);
  assertEquals(mod(-7n, 3n), 2n);
});

Deno.test("mod — rejects non-positive modulus", () => {
  assertThrows(() => mod(1n, 0n), RangeError);
  assertThrows(() => mod(1n, -3n), RangeError);
});

Deno.test("mod — property: result is in [0, n)", () => {
  fc.assert(
    fc.property(
      fc.bigInt({ min: -1_000_000n, max: 1_000_000n }),
      fc.bigInt({ min: 1n, max: 1_000_000n }),
      (a, n) => {
        const r = mod(a, n);
        return r >= 0n && r < n;
      },
    ),
    { numRuns: 200 },
  );
});

Deno.test("abs, min, max, sign", () => {
  assertEquals(abs(-5n), 5n);
  assertEquals(abs(5n), 5n);
  assertEquals(min(3n, 4n), 3n);
  assertEquals(max(3n, 4n), 4n);
  assertEquals(sign(-7n), -1);
  assertEquals(sign(0n), 0);
  assertEquals(sign(3n), 1);
});

Deno.test("isqrt — reference values", () => {
  assertEquals(isqrt(0n), 0n);
  assertEquals(isqrt(1n), 1n);
  assertEquals(isqrt(15n), 3n);
  assertEquals(isqrt(16n), 4n);
  assertEquals(isqrt(99n), 9n);
  assertEquals(isqrt(100n), 10n);
});

Deno.test("isqrt — property: r² ≤ n < (r+1)²", () => {
  fc.assert(
    fc.property(fc.bigInt({ min: 0n, max: 10n ** 18n }), (n) => {
      const r = isqrt(n);
      return r * r <= n && n < (r + 1n) * (r + 1n);
    }),
    { numRuns: 200 },
  );
});

Deno.test("ipow — reference values", () => {
  assertEquals(ipow(2n, 0n), 1n);
  assertEquals(ipow(2n, 10n), 1024n);
  assertEquals(ipow(3n, 5n), 243n);
});

Deno.test("ipow — rejects negative exponent", () => {
  assertThrows(() => ipow(2n, -1n), RangeError);
});

Deno.test("bitLength", () => {
  assertEquals(bitLength(0n), 0);
  assertEquals(bitLength(1n), 1);
  assertEquals(bitLength(2n), 2);
  assertEquals(bitLength(255n), 8);
  assertEquals(bitLength(256n), 9);
});
