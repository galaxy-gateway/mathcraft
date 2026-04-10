/**
 * Chinese Remainder Theorem — combine congruences with pairwise-coprime moduli.
 *
 * @example
 * ```ts
 * import { crt } from "./mod.ts";
 * // Find x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)
 * crt([{ r: 2n, m: 3n }, { r: 3n, m: 5n }, { r: 2n, m: 7n }]);
 * // { x: 23n, m: 105n }
 * ```
 */

import { mod } from "@math/core/numeric";
import { extendedGcd } from "../extended-euclidean/mod.ts";

export interface Congruence {
  /** The remainder: x ≡ r (mod m). */
  r: bigint;
  /** The modulus. */
  m: bigint;
}

export interface CrtResult {
  x: bigint;
  m: bigint;
}

/**
 * Solve a system of congruences using the general CRT (allows non-coprime
 * moduli as long as all pairs are consistent).
 *
 * Returns `{ x, m }` where `m` is the lcm of the inputs' moduli and `x`
 * is the unique solution in `[0, m)`. Throws if the system is
 * inconsistent.
 */
export function crt(congruences: readonly Congruence[]): CrtResult {
  if (congruences.length === 0) {
    throw new RangeError("crt requires at least one congruence");
  }

  let x = mod(congruences[0].r, congruences[0].m);
  let m = congruences[0].m;
  if (m <= 0n) throw new RangeError("moduli must be positive");

  for (let i = 1; i < congruences.length; i++) {
    const { r: r2, m: m2 } = congruences[i];
    if (m2 <= 0n) throw new RangeError("moduli must be positive");
    const { g, x: s } = extendedGcd(m, m2);
    const diff = mod(r2 - x, m2);
    if (diff % g !== 0n) {
      throw new RangeError(
        `crt: inconsistent congruences (diff ${diff} not divisible by gcd ${g})`,
      );
    }
    const lcm = (m / g) * m2;
    const add = mod((diff / g) * s, m2 / g) * m;
    x = mod(x + add, lcm);
    m = lcm;
  }

  return { x, m };
}
