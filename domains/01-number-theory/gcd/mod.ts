/**
 * gcd — Greatest common divisor via the Euclidean algorithm.
 *
 * @example
 * ```ts
 * import { gcd } from "./mod.ts";
 * gcd(1071n, 462n); // 21n
 * ```
 */
import { abs } from "@math/core/numeric";

export function gcd(a: bigint, b: bigint): bigint {
  let x = abs(a);
  let y = abs(b);
  while (y !== 0n) {
    [x, y] = [y, x % y];
  }
  return x;
}

/** Least common multiple, derived from gcd. */
export function lcm(a: bigint, b: bigint): bigint {
  if (a === 0n || b === 0n) return 0n;
  return abs(a * b) / gcd(a, b);
}
