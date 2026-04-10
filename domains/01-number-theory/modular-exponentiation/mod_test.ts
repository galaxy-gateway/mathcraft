import { assertEquals, assertThrows } from "@std/assert";
import * as fc from "fast-check";
import { modPow } from "./mod.ts";
import { mod } from "@math/core/numeric";

Deno.test("modPow — reference values", () => {
  assertEquals(modPow(2n, 10n, 1000n), 24n);
  assertEquals(modPow(3n, 200n, 50n), 1n);
  assertEquals(modPow(5n, 0n, 7n), 1n);
  assertEquals(modPow(7n, 1n, 9n), 7n);
});

Deno.test("modPow — modulus 1 always returns 0", () => {
  assertEquals(modPow(1234n, 5678n, 1n), 0n);
});

Deno.test("modPow — rejects negative exponent and non-positive modulus", () => {
  assertThrows(() => modPow(2n, -1n, 10n), RangeError);
  assertThrows(() => modPow(2n, 1n, 0n), RangeError);
});

Deno.test("modPow — property: matches naive for small inputs", () => {
  const naive = (b: bigint, e: bigint, m: bigint): bigint => {
    if (m === 1n) return 0n;
    let r = 1n;
    for (let i = 0n; i < e; i++) r = (r * b) % m;
    return r;
  };
  fc.assert(
    fc.property(
      fc.bigInt({ min: 0n, max: 100n }),
      fc.bigInt({ min: 0n, max: 50n }),
      fc.bigInt({ min: 1n, max: 1000n }),
      (b, e, m) => modPow(b, e, m) === naive(mod(b, m), e, m),
    ),
    { numRuns: 100 },
  );
});

Deno.test("modPow — handles RSA-sized inputs fast", () => {
  const p = 65537n;
  const modulus = 10n ** 50n + 1n;
  const base = 123456789n;
  const start = performance.now();
  const result = modPow(base, p, modulus);
  const ms = performance.now() - start;
  if (ms > 100) throw new Error(`too slow: ${ms}ms`);
  if (result < 0n || result >= modulus) throw new Error("out of range");
});
