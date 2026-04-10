/**
 * Pollard's rho factorization.
 *
 * A randomized, sublinear-in-√n algorithm for finding a non-trivial factor
 * of a composite integer. Uses Brent's cycle-detection variant.
 *
 * @example
 * ```ts
 * import { factor } from "./mod.ts";
 * factor(8051n); // [83n, 97n]
 * ```
 */

import { abs } from "@math/core/numeric";
import { gcd } from "../gcd/mod.ts";
import { isProbablePrime } from "../miller-rabin/mod.ts";

/**
 * Return a non-trivial factor of `n`, or `null` if none found on this attempt.
 *
 * `seed` controls the starting point; vary it to retry on failure.
 */
export function pollardRho(n: bigint, seed: bigint = 2n): bigint | null {
  if (n % 2n === 0n) return 2n;
  if (n < 2n) return null;

  const f = (x: bigint): bigint => (x * x + 1n) % n;

  let x = seed;
  let y = seed;
  let d = 1n;
  while (d === 1n) {
    x = f(x);
    y = f(f(y));
    d = gcd(abs(x - y), n);
  }
  if (d === n) return null;
  return d;
}

/**
 * Fully factor `n` into prime powers.
 *
 * Uses trial division for small factors, Miller–Rabin to detect primality,
 * and Pollard's rho for larger composite parts. Returns a sorted array of
 * prime factors (with multiplicity).
 */
export function factor(n: bigint): bigint[] {
  if (n < 2n) return [];
  const factors: bigint[] = [];

  // Trial division by small primes.
  const smallPrimes = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n];
  for (const p of smallPrimes) {
    while (n % p === 0n) {
      factors.push(p);
      n /= p;
    }
  }

  const stack: bigint[] = n > 1n ? [n] : [];
  while (stack.length > 0) {
    const m = stack.pop()!;
    if (m === 1n) continue;
    if (isProbablePrime(m)) {
      factors.push(m);
      continue;
    }
    let d: bigint | null = null;
    let seed = 2n;
    while (d === null) {
      d = pollardRho(m, seed);
      seed++;
    }
    stack.push(d, m / d);
  }

  factors.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  return factors;
}
