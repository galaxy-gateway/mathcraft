import { assertEquals, assertThrows } from "@std/assert";
import * as fc from "fast-check";
import { Rational } from "./rational.ts";

Deno.test("Rational — reduction and sign normalization", () => {
  const r = Rational.of(4n, 8n);
  assertEquals(r.num, 1n);
  assertEquals(r.den, 2n);

  const neg = Rational.of(1n, -2n);
  assertEquals(neg.num, -1n);
  assertEquals(neg.den, 2n);
});

Deno.test("Rational — arithmetic", () => {
  const half = Rational.of(1n, 2n);
  const third = Rational.of(1n, 3n);
  assertEquals(half.add(third).equals(Rational.of(5n, 6n)), true);
  assertEquals(half.sub(third).equals(Rational.of(1n, 6n)), true);
  assertEquals(half.mul(third).equals(Rational.of(1n, 6n)), true);
  assertEquals(half.div(third).equals(Rational.of(3n, 2n)), true);
});

Deno.test("Rational — division by zero", () => {
  assertThrows(() => Rational.of(1n, 0n), RangeError);
  assertThrows(() => Rational.ONE.div(Rational.ZERO), RangeError);
});

Deno.test("Rational — property: (a+b) - b = a", () => {
  fc.assert(
    fc.property(
      fc.bigInt({ min: -1000n, max: 1000n }),
      fc.bigInt({ min: 1n, max: 1000n }),
      fc.bigInt({ min: -1000n, max: 1000n }),
      fc.bigInt({ min: 1n, max: 1000n }),
      (an, ad, bn, bd) => {
        const a = Rational.of(an, ad);
        const b = Rational.of(bn, bd);
        return a.add(b).sub(b).equals(a);
      },
    ),
    { numRuns: 200 },
  );
});
