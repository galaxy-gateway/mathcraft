/**
 * Extended Euclidean algorithm — finds (g, x, y) such that ax + by = g = gcd(a, b).
 *
 * @example
 * ```ts
 * import { extendedGcd, modInverse } from "./mod.ts";
 * extendedGcd(240n, 46n); // { g: 2n, x: -9n, y: 47n }
 * modInverse(3n, 11n);    // 4n   (since 3 * 4 ≡ 1 mod 11)
 * ```
 */

import { mod } from "@math/core/numeric";

export interface BezoutResult {
  g: bigint;
  x: bigint;
  y: bigint;
}

/**
 * Iterative extended Euclidean.
 *
 * Returns the gcd and Bezout coefficients: `a*x + b*y = g`.
 */
export function extendedGcd(a: bigint, b: bigint): BezoutResult {
  let oldR = a;
  let r = b;
  let oldS = 1n;
  let s = 0n;
  let oldT = 0n;
  let t = 1n;

  while (r !== 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
    [oldT, t] = [t, oldT - q * t];
  }

  // Normalize so g is non-negative.
  if (oldR < 0n) {
    return { g: -oldR, x: -oldS, y: -oldT };
  }
  return { g: oldR, x: oldS, y: oldT };
}

/**
 * Modular inverse of `a` mod `n`, or throws if none exists.
 *
 * Exists iff `gcd(a, n) = 1`.
 */
export function modInverse(a: bigint, n: bigint): bigint {
  if (n <= 1n) throw new RangeError("modInverse requires modulus > 1");
  const { g, x } = extendedGcd(mod(a, n), n);
  if (g !== 1n) {
    throw new RangeError(`${a} has no inverse mod ${n} (gcd=${g})`);
  }
  return mod(x, n);
}
