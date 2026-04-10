# quadratic-residues — Quadratic residues and Legendre symbol

## TL;DR

An integer `a` is a quadratic residue mod an odd prime `p` if the
equation `x² ≡ a (mod p)` has a solution. Euler's criterion gives
`(a/p) ≡ a^((p−1)/2) (mod p)`, which is +1 for a nonzero residue,
−1 for a non-residue, and 0 if `p | a`.

## Intuition

Half the nonzero residues mod `p` are squares and half aren't — exactly
`(p−1)/2` of each. The Legendre symbol is a cheap test for which side a
given `a` is on, computed as a single modular exponentiation.

## Statement

For an odd prime `p` and any integer `a`:

```
(a / p) =  0         if p | a
        = +1         if a is a quadratic residue mod p, a ≢ 0
        = −1         otherwise
```

**Euler's criterion.** `a^((p−1)/2) ≡ (a/p)  (mod p)`.

## Algorithm

One call to [`modPow`](../modular-exponentiation/mod.ts):

```
function legendre(a, p):
    r ← a^((p − 1) / 2) mod p
    return 0  if r = 0
    return 1  if r = 1
    return −1 if r = p − 1
```

See [`mod.ts`](./mod.ts).

## Proof or justification

The multiplicative group `(ℤ/p)*` is cyclic of order `p − 1`. Let `g` be
a generator. Every nonzero residue has the form `gᵏ`, and `gᵏ` is a
square iff `k` is even. Then `(gᵏ)^((p−1)/2) = g^(k(p−1)/2)`. This is
1 if `k` is even (since `g^(p−1) = 1`) and `−1` if `k` is odd (since
`g^((p−1)/2) = −1`, the only non-identity element of order 2). This
proves Euler's criterion.

**Counting.** The map `x ↦ x²` on `(ℤ/p)*` is 2-to-1, so the image has
size `(p − 1) / 2`.

## Complexity

- Time: O((log p)³) for one `modPow` (the dominant cost).
- Space: O(log p).
- Numerical: exact.

## Applications

- [`tonelli-shanks`](../tonelli-shanks/) — once you know `a` is a
  residue, Tonelli–Shanks computes an actual square root.
- Solovay–Strassen primality test.
- Blum Blum Shub cryptographic PRNG.
- [Blum integers](https://en.wikipedia.org/wiki/Blum_integer) in
  cryptographic protocols.

## References

- [cohen1993number] Cohen, *A Course in Computational Algebraic Number Theory*, §1.4.
- [knuth1997taocp2] Knuth, *TAOCP Volume 2*, §4.5.4.
