/**
 * Tonelli–Shanks — compute √a mod p for an odd prime p.
 *
 * Returns an `x` with `x² ≡ a (mod p)` if one exists, or `null` if `a`
 * is a non-residue. The negative square root `p − x` is also valid.
 *
 * @example
 * ```ts
 * import { sqrtMod } from "./mod.ts";
 * sqrtMod(10n, 13n); // 6n (6² = 36 ≡ 10 mod 13)
 * sqrtMod(5n, 7n);   // null — 5 is not a QR mod 7
 * ```
 */

import { mod } from "@math/core/numeric";
import { modPow } from "../modular-exponentiation/mod.ts";
import { legendreSymbol } from "../quadratic-residues/mod.ts";

/**
 * Square root of `a` modulo the odd prime `p`, or `null` if none exists.
 *
 * Returns the canonical positive root; `p − x` is also a valid root.
 */
export function sqrtMod(a: bigint, p: bigint): bigint | null {
  const aModP = mod(a, p);
  if (aModP === 0n) return 0n;
  if (p === 2n) return aModP;

  if (legendreSymbol(aModP, p) !== 1) return null;

  // Fast path: p ≡ 3 (mod 4)  →  x = a^((p+1)/4) mod p.
  if (p % 4n === 3n) {
    return modPow(aModP, (p + 1n) / 4n, p);
  }

  // Tonelli–Shanks general case.
  // Factor p − 1 = Q · 2^S with Q odd.
  let Q = p - 1n;
  let S = 0n;
  while ((Q & 1n) === 0n) {
    Q >>= 1n;
    S += 1n;
  }

  // Find a quadratic non-residue z.
  let z = 2n;
  while (legendreSymbol(z, p) !== -1) z += 1n;

  let M = S;
  let c = modPow(z, Q, p);
  let t = modPow(aModP, Q, p);
  let R = modPow(aModP, (Q + 1n) / 2n, p);

  while (true) {
    if (t === 1n) return R;
    // Find the least i, 0 < i < M, with t^(2^i) ≡ 1 (mod p).
    let i = 1n;
    let temp = (t * t) % p;
    while (temp !== 1n) {
      temp = (temp * temp) % p;
      i += 1n;
      if (i === M) throw new Error("Tonelli–Shanks did not converge");
    }
    const exp = 1n << (M - i - 1n);
    const b = modPow(c, exp, p);
    M = i;
    c = (b * b) % p;
    t = (t * c) % p;
    R = (R * b) % p;
  }
}
