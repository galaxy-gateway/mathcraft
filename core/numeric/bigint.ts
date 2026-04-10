/**
 * BigInt helpers used throughout the repository.
 *
 * JavaScript's `%` is remainder, not modulo, so it returns negative values
 * for negative inputs. We export a `mod` that is always in `[0, n)`.
 */

/** True modulo: result is in `[0, n)` for positive `n`. */
export function mod(a: bigint, n: bigint): bigint {
  if (n <= 0n) throw new RangeError("modulus must be positive");
  const r = a % n;
  return r < 0n ? r + n : r;
}

/** Absolute value of a BigInt. */
export function abs(a: bigint): bigint {
  return a < 0n ? -a : a;
}

/** Minimum of two BigInts. */
export function min(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

/** Maximum of two BigInts. */
export function max(a: bigint, b: bigint): bigint {
  return a > b ? a : b;
}

/** Sign of a BigInt: -1, 0, or 1. */
export function sign(a: bigint): -1 | 0 | 1 {
  if (a > 0n) return 1;
  if (a < 0n) return -1;
  return 0;
}

/**
 * Integer square root (floor of √n).
 *
 * Uses Newton's method on BigInts. Returns 0n for n <= 0n.
 */
export function isqrt(n: bigint): bigint {
  if (n < 0n) throw new RangeError("isqrt of negative");
  if (n < 2n) return n;
  let x = n;
  let y = (x + 1n) >> 1n;
  while (y < x) {
    x = y;
    y = (x + n / x) >> 1n;
  }
  return x;
}

/** Integer power aⁿ for non-negative integer `n`. */
export function ipow(a: bigint, n: bigint): bigint {
  if (n < 0n) throw new RangeError("ipow requires n >= 0");
  let result = 1n;
  let base = a;
  let exp = n;
  while (exp > 0n) {
    if (exp & 1n) result *= base;
    base *= base;
    exp >>= 1n;
  }
  return result;
}

/**
 * Bit length of a non-negative BigInt (position of the highest set bit + 1).
 * Returns 0 for `0n`.
 */
export function bitLength(n: bigint): number {
  if (n < 0n) n = -n;
  let bits = 0;
  while (n > 0n) {
    bits++;
    n >>= 1n;
  }
  return bits;
}
