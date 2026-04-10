# tonelli-shanks — Square roots modulo an odd prime

## TL;DR

Tonelli–Shanks computes a square root of `a` modulo an odd prime `p`
(when one exists). For `p ≡ 3 (mod 4)` there's a closed-form shortcut;
otherwise the general algorithm does O(log² p) modular multiplications.

## Intuition

Finding `x` with `x² ≡ a (mod p)` is the modular analogue of taking a
square root. When `p ≡ 3 (mod 4)` you can simply compute
`a^((p+1)/4) mod p` — a single modular exponentiation. For `p ≡ 1 (mod 4)`
the exponent trick doesn't directly work; Tonelli–Shanks uses a
quadratic non-residue `z` to "rotate" candidates toward the correct root.

## Statement

Given an odd prime `p` and an integer `a` with `(a/p) = 1`, find `x`
with `x² ≡ a (mod p)`.

## Algorithm

```
if p ≡ 3 (mod 4):
    return a^((p + 1) / 4) mod p

# General Tonelli–Shanks:
factor p − 1 = Q · 2^S with Q odd
find a quadratic non-residue z
M ← S
c ← z^Q mod p
t ← a^Q mod p
R ← a^((Q+1)/2) mod p
loop:
    if t = 1: return R
    find least i with t^(2^i) = 1 mod p   (0 < i < M)
    b ← c^(2^(M−i−1)) mod p
    M ← i
    c ← b² mod p
    t ← t · c mod p
    R ← R · b mod p
```

See [`mod.ts`](./mod.ts).

## Proof or justification

The state `(R, t, c)` maintains the invariants
- `R² = t · a (mod p)`,
- `t^(2^M) = 1 (mod p)` and `t` has order dividing `2^M`,
- `c^(2^M) = 1 (mod p)` and `c` has exact order `2^M`.

When `t = 1` the first invariant collapses to `R² = a`, so `R` is the
desired root. Each iteration strictly decreases `M` by replacing `t`
with a power of smaller 2-adic order, so the loop terminates in at most
`S` iterations.

## Complexity

- Time: O(log² p) modular multiplications in the general case, or
  O(log p) for `p ≡ 3 (mod 4)`.
- Expected: finding a non-residue `z` takes ~2 tries.
- Space: O(log p).
- Numerical: exact.

## Applications

- Elliptic curve point decompression.
- Lifting points in lattice-based cryptography.
- Recovering plaintext from the Rabin cryptosystem.
- Competition / CTF number theory problems.

## References

- [tonelli1891bemerkung] Tonelli, "Bemerkung über die Auflösung quadratischer Congruenzen" (1891).
- [shanks1973five] Shanks, "Five Number-theoretic Algorithms" (1973).
- [cohen1993number] Cohen, §1.5.
