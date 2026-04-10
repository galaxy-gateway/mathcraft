import { assertEquals } from "@std/assert";
import { sqrtMod } from "./mod.ts";
import { mod } from "@math/core/numeric";
import { isQuadraticResidue } from "../quadratic-residues/mod.ts";

Deno.test("sqrtMod — small primes, brute force check", () => {
  const primes = [3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n];
  for (const p of primes) {
    for (let a = 0n; a < p; a++) {
      const root = sqrtMod(a, p);
      if (root === null) {
        if (isQuadraticResidue(a, p)) {
          throw new Error(`${a} is a QR mod ${p} but got null`);
        }
      } else {
        assertEquals(mod(root * root, p), a);
      }
    }
  }
});

Deno.test("sqrtMod — large prime with p ≡ 3 (mod 4)", () => {
  const p = 1_000_000_007n; // p ≡ 3 mod 4
  const a = 123456789n;
  const root = sqrtMod(a, p);
  if (root !== null) {
    assertEquals(mod(root * root, p), a);
  }
});

Deno.test("sqrtMod — large prime with p ≡ 1 (mod 4) uses Tonelli–Shanks branch", () => {
  const p = 1_000_000_009n; // p ≡ 1 mod 4
  let tested = 0;
  for (let a = 1n; a <= 100n; a++) {
    const root = sqrtMod(a, p);
    if (root !== null) {
      assertEquals(mod(root * root, p), a);
      tested++;
    }
  }
  if (tested === 0) throw new Error("no residues found; flaky test");
});

Deno.test("sqrtMod — returns 0 for a ≡ 0", () => {
  assertEquals(sqrtMod(0n, 7n), 0n);
  assertEquals(sqrtMod(14n, 7n), 0n);
});
