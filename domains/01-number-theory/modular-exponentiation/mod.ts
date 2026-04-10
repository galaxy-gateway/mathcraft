/**
 * Modular exponentiation — `base^exponent mod modulus` via binary exponentiation.
 *
 * @example
 * ```ts
 * import { modPow } from "./mod.ts";
 * modPow(2n, 10n, 1000n); // 24n
 * ```
 */
import { mod } from "@math/core/numeric";

/**
 * Compute `base^exponent mod modulus` in O(log exponent) multiplications.
 *
 * Handles non-negative exponents directly. Negative exponents are resolved
 * by computing the modular inverse of `base` first (delegated to the
 * caller; see `extended-euclidean/modInverse`).
 */
export function modPow(
  base: bigint,
  exponent: bigint,
  modulus: bigint,
): bigint {
  if (modulus <= 0n) throw new RangeError("modulus must be positive");
  if (exponent < 0n) {
    throw new RangeError(
      "modPow: negative exponent — compute the modular inverse first",
    );
  }
  if (modulus === 1n) return 0n;

  let result = 1n;
  let b = mod(base, modulus);
  let e = exponent;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % modulus;
    e >>= 1n;
    b = (b * b) % modulus;
  }
  return result;
}
