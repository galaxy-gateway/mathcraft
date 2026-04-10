import { assertEquals } from "@std/assert";
import * as fc from "fast-check";
import { gcd, lcm } from "./mod.ts";

Deno.test("gcd — reference values", () => {
  assertEquals(gcd(1071n, 462n), 21n);
  assertEquals(gcd(48n, 18n), 6n);
  assertEquals(gcd(17n, 13n), 1n);
  assertEquals(gcd(0n, 5n), 5n);
  assertEquals(gcd(5n, 0n), 5n);
  assertEquals(gcd(0n, 0n), 0n);
});

Deno.test("gcd — absolute value of inputs", () => {
  assertEquals(gcd(-12n, 18n), 6n);
  assertEquals(gcd(12n, -18n), 6n);
  assertEquals(gcd(-12n, -18n), 6n);
});

Deno.test("gcd — property: gcd(a, b) = gcd(b, a mod b)", () => {
  fc.assert(
    fc.property(
      fc.bigInt({ min: 1n, max: 10n ** 12n }),
      fc.bigInt({ min: 1n, max: 10n ** 12n }),
      (a, b) => gcd(a, b) === gcd(b, a % b),
    ),
    { numRuns: 200 },
  );
});

Deno.test("gcd — property: divides both inputs", () => {
  fc.assert(
    fc.property(
      fc.bigInt({ min: 1n, max: 10n ** 12n }),
      fc.bigInt({ min: 1n, max: 10n ** 12n }),
      (a, b) => {
        const g = gcd(a, b);
        return a % g === 0n && b % g === 0n;
      },
    ),
    { numRuns: 200 },
  );
});

Deno.test("lcm — reference values", () => {
  assertEquals(lcm(4n, 6n), 12n);
  assertEquals(lcm(21n, 6n), 42n);
  assertEquals(lcm(0n, 5n), 0n);
});

Deno.test("lcm — property: gcd(a,b) * lcm(a,b) = |a*b|", () => {
  fc.assert(
    fc.property(
      fc.bigInt({ min: 1n, max: 10n ** 9n }),
      fc.bigInt({ min: 1n, max: 10n ** 9n }),
      (a, b) => gcd(a, b) * lcm(a, b) === a * b,
    ),
    { numRuns: 200 },
  );
});
