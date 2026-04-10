# crt — Chinese Remainder Theorem

## TL;DR

Given a system of congruences `x ≡ rᵢ (mod mᵢ)` with coprime moduli, the
Chinese Remainder Theorem says there's a unique solution `x` modulo the
product of the `mᵢ`. Our implementation also handles the non-coprime case
(as long as the congruences are mutually consistent).

## Intuition

One congruence `x ≡ r₁ (mod m₁)` defines an arithmetic progression. Two
congruences define a finer progression with period `lcm(m₁, m₂)` — if
the periods are compatible. CRT gives you the intersection in closed
form using Bezout coefficients from extended Euclidean.

Sun Tzu's 3rd-century problem: find a number that leaves remainder 2, 3,
and 2 when divided by 3, 5, and 7 respectively. Answer: 23, and more
generally 23 + 105k.

## Statement

**Classical CRT.** If `m₁, m₂, …, mₙ` are pairwise coprime positive integers,
the system
```
x ≡ r₁ (mod m₁)
x ≡ r₂ (mod m₂)
…
x ≡ rₙ (mod mₙ)
```
has a unique solution modulo `M = m₁·m₂·⋯·mₙ`.

**Generalized.** Drop the coprimality requirement. The system has a
solution iff `rᵢ ≡ rⱼ (mod gcd(mᵢ, mⱼ))` for every pair `(i, j)`, in
which case the solution is unique modulo `lcm(m₁, …, mₙ)`.

## Algorithm

Fold congruences pairwise. To combine `x ≡ r₁ (mod m₁)` with
`x ≡ r₂ (mod m₂)`:

```
(g, s, _) ← extendedGcd(m₁, m₂)
require (r₂ − r₁) mod g = 0          # consistency
lcm ← (m₁ / g) · m₂
new_r ← r₁ + (((r₂ − r₁) / g) · s) · m₁  (mod lcm)
```

Result: `x ≡ new_r (mod lcm)`. Fold this with the next congruence, and
so on. See [`mod.ts`](./mod.ts).

## Proof or justification

The solution in the two-congruence case is a direct consequence of the
Bezout identity: if `g = s·m₁ + t·m₂` and `g | (r₂ − r₁)`, then
`((r₂ − r₁)/g · s · m₁)` is exactly what we add to `r₁` to land on a
number that reduces to `r₂` mod `m₂` without disturbing `r₁ mod m₁`.

Uniqueness modulo `lcm` comes from the structure of ℤ/lcm as
∏ ℤ/(mᵢ / gᵢ) — any two solutions differ by a multiple of every `mᵢ`,
hence by a multiple of their lcm.

## Complexity

- Time: O(n · (log M)²) for `n` congruences, dominated by extended Euclidean.
- Space: O(log M).
- Numerical: exact.

## Applications

- RSA speed-up: decrypt with CRT factoring through `p` and `q` separately
  for a 4× speedup (see [`applications/cryptography/rsa/`](../../../applications/cryptography/rsa/)).
- Garner's algorithm for reconstructing big integers from residues.
- Polynomial interpolation (Lagrange is CRT for polynomials).

## References

- [knuth1997taocp2] Knuth, *TAOCP Volume 2*, §4.3.2.
- [cohen1993number] Cohen, §1.3.
