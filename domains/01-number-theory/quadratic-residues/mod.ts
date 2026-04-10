/**
 * Quadratic residues and the Legendre symbol.
 *
 * An integer `a` is a *quadratic residue* mod an odd prime `p` if there
 * exists `x` with `x² ≡ a (mod p)`. Euler's criterion says
 *
 *   a^((p−1)/2) ≡  1  (mod p)   iff a is a nonzero QR
 *   a^((p−1)/2) ≡ −1  (mod p)   iff a is a non-residue
 *
 * The Legendre symbol `(a/p)` packages this as +1, −1, or 0.
 *
 * @example
 * ```ts
 * import { legendreSymbol, isQuadraticResidue } from "./mod.ts";
 * legendreSymbol(2n, 7n);     // 1   (2 is a QR mod 7; 3² ≡ 2)
 * isQuadraticResidue(3n, 7n); // false
 * ```
 */

import { modPow } from "../modular-exponentiation/mod.ts";

/**
 * Legendre symbol `(a / p)` for an odd prime `p`.
 *
 * Returns 0 if `p | a`, +1 if `a` is a nonzero quadratic residue, −1 if not.
 */
export function legendreSymbol(a: bigint, p: bigint): -1 | 0 | 1 {
  if (p <= 2n) throw new RangeError("legendreSymbol requires odd prime p > 2");
  const r = modPow(a, (p - 1n) / 2n, p);
  if (r === 0n) return 0;
  if (r === 1n) return 1;
  if (r === p - 1n) return -1;
  throw new Error(
    `legendreSymbol: unexpected value ${r} — is p=${p} actually an odd prime?`,
  );
}

/** Return true if `a` is a nonzero quadratic residue mod the odd prime `p`. */
export function isQuadraticResidue(a: bigint, p: bigint): boolean {
  return legendreSymbol(a, p) === 1;
}
