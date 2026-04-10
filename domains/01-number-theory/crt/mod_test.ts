import { assertEquals, assertThrows } from "@std/assert";
import * as fc from "fast-check";
import { crt } from "./mod.ts";
import { mod } from "@math/core/numeric";
import { gcd } from "../gcd/mod.ts";

Deno.test("crt — classic Sun Tzu problem", () => {
  // x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)  →  x = 23, m = 105
  const result = crt([
    { r: 2n, m: 3n },
    { r: 3n, m: 5n },
    { r: 2n, m: 7n },
  ]);
  assertEquals(result.x, 23n);
  assertEquals(result.m, 105n);
});

Deno.test("crt — non-coprime consistent moduli", () => {
  // x ≡ 2 (mod 4), x ≡ 4 (mod 6)  →  x = 10, m = 12
  const result = crt([
    { r: 2n, m: 4n },
    { r: 4n, m: 6n },
  ]);
  assertEquals(result.x, 10n);
  assertEquals(result.m, 12n);
});

Deno.test("crt — inconsistent system throws", () => {
  assertThrows(() =>
    crt([
      { r: 1n, m: 4n },
      { r: 2n, m: 6n },
    ])
  );
});

Deno.test("crt — property: solution satisfies all congruences", () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.record({
          r: fc.bigInt({ min: 0n, max: 100n }),
          m: fc.bigInt({ min: 2n, max: 100n }),
        }),
        { minLength: 2, maxLength: 5 },
      ),
      (congruences) => {
        // Force coprime by taking only pairwise-coprime moduli.
        const chosen: typeof congruences = [];
        for (const c of congruences) {
          if (chosen.every((k) => gcd(k.m, c.m) === 1n)) {
            chosen.push({ r: mod(c.r, c.m), m: c.m });
          }
        }
        if (chosen.length < 2) return true;
        const { x } = crt(chosen);
        return chosen.every((c) => mod(x, c.m) === c.r);
      },
    ),
    { numRuns: 100 },
  );
});
