/**
 * Miller–Rabin primality test.
 *
 * A probabilistic primality test. For a composite `n` the probability that
 * a single random witness fails to detect compositeness is at most 1/4,
 * so `k` independent rounds drop the false-positive rate to at most 4⁻ᵏ.
 *
 * For 64-bit inputs, testing the deterministic witness set
 * {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37} is deterministic.
 *
 * @example
 * ```ts
 * import { isProbablePrime } from "./mod.ts";
 * isProbablePrime(1000000007n); // true
 * ```
 */

import { modPow } from "../modular-exponentiation/mod.ts";

/** Small primes used as trial divisors and as deterministic witnesses. */
const SMALL_PRIMES: readonly bigint[] = [
  2n,
  3n,
  5n,
  7n,
  11n,
  13n,
  17n,
  19n,
  23n,
  29n,
  31n,
  37n,
];

/**
 * Test whether `n` is prime.
 *
 * Uses the deterministic witness set for `n < 2⁶⁴`. Above that, the
 * witnesses are still a good heuristic but the result is probabilistic.
 */
export function isProbablePrime(n: bigint): boolean {
  if (n < 2n) return false;
  for (const p of SMALL_PRIMES) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }

  // Write n − 1 = 2^r · d with d odd.
  let d = n - 1n;
  let r = 0n;
  while ((d & 1n) === 0n) {
    d >>= 1n;
    r += 1n;
  }

  witnessLoop:
  for (const a of SMALL_PRIMES) {
    if (a >= n) continue;
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    for (let i = 0n; i < r - 1n; i++) {
      x = (x * x) % n;
      if (x === n - 1n) continue witnessLoop;
    }
    return false;
  }
  return true;
}
