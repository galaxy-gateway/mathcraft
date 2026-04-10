import { assertEquals, assertThrows } from "@std/assert";
import * as fc from "fast-check";
import { extendedGcd, modInverse } from "./mod.ts";
import { gcd } from "../gcd/mod.ts";
import { mod } from "@math/core/numeric";

Deno.test("extendedGcd — reference value", () => {
  const { g, x, y } = extendedGcd(240n, 46n);
  assertEquals(g, 2n);
  assertEquals(240n * x + 46n * y, 2n);
});

Deno.test("extendedGcd — property: ax + by = g = gcd(a, b)", () => {
  fc.assert(
    fc.property(
      fc.bigInt({ min: 1n, max: 10n ** 12n }),
      fc.bigInt({ min: 1n, max: 10n ** 12n }),
      (a, b) => {
        const { g, x, y } = extendedGcd(a, b);
        return g === gcd(a, b) && a * x + b * y === g;
      },
    ),
    { numRuns: 200 },
  );
});

Deno.test("modInverse — reference values", () => {
  assertEquals(modInverse(3n, 11n), 4n); // 3*4 = 12 ≡ 1
  assertEquals(modInverse(7n, 26n), 15n); // 7*15 = 105 ≡ 1
});

Deno.test("modInverse — throws when no inverse exists", () => {
  assertThrows(() => modInverse(6n, 9n), RangeError); // gcd = 3
});

Deno.test("modInverse — property: a * modInverse(a, n) ≡ 1 (mod n)", () => {
  fc.assert(
    fc.property(
      fc.bigInt({ min: 2n, max: 10n ** 9n }),
      fc.bigInt({ min: 2n, max: 10n ** 9n }),
      (a, n) => {
        if (gcd(a, n) !== 1n) return true; // skip non-invertible
        const inv = modInverse(a, n);
        return mod(a * inv, n) === 1n;
      },
    ),
    { numRuns: 200 },
  );
});
