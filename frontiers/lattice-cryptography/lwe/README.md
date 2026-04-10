# LWE — Learning With Errors encryption

## TL;DR

Learning With Errors hides a secret vector inside noisy dot products
modulo a number `q`. Breaking it is as hard as solving worst-case lattice
problems — the basis for post-quantum cryptography standards like Kyber.

## Intuition

Imagine someone picks a secret vector `s` and publishes many noisy
observations `bᵢ = ⟨aᵢ, s⟩ + eᵢ (mod q)`, where the `eᵢ` are tiny.
Without `s`, the pairs `(aᵢ, bᵢ)` look like random noise — but with `s`,
the small errors are easily peeled off. This asymmetry is the
cryptographic one-way function.

## Statement

**Decision-LWE.** Given `(A, b)` where either `b = As + e (mod q)` for
a random secret `s` and small error `e`, or `b` is uniformly random,
distinguish the two cases.

**Search-LWE.** Given `(A, b = As + e)`, recover `s`.

Both are reducible to worst-case problems on lattices (Regev 2005).

## Algorithm

**Key generation.** Sample `s ← ℤ_q^n`, `A ← ℤ_q^{m×n}`, `e ← χ^m`
(small). Publish `(A, b = As + e)`.

**Encrypt bit `μ`.** Choose random binary `r ∈ {0,1}^m`. Compute
`u = Aᵀr (mod q)`, `v = bᵀr + μ·⌊q/2⌋ (mod q)`.

**Decrypt.** Compute `v − ⟨s, u⟩ (mod q)`. Round: closer to 0 → 0,
closer to `q/2` → 1.

See [`mod.ts`](./mod.ts).

## Proof or justification

**Correctness.** `v − ⟨s, u⟩ = bᵀr − sᵀAᵀr + μ·⌊q/2⌋
= eᵀr + μ·⌊q/2⌋ (mod q)`. Since `e` and `r` are small, `eᵀr` is a
small number, so `v − ⟨s, u⟩` is close to either 0 (for `μ = 0`) or
`⌊q/2⌋` (for `μ = 1`).

**Security.** Regev (2005) showed that LWE with appropriate parameters
is at least as hard as quantumly solving worst-case lattice problems
(GapSVP, SIVP).

## Complexity

- Key generation: O(m · n) multiplications mod q.
- Encrypt / decrypt: O(m · n).
- Key size: O(m · n · log q) bits.
- Ciphertext size: O(n · log q) bits per bit encrypted.

## Applications

- NIST post-quantum standard **Kyber** (ML-KEM) is based on module-LWE.
- **Dilithium** (ML-DSA) digital signatures.
- Fully homomorphic encryption (FHE) schemes.
- Identity-based encryption from lattices.

## References

- [regev2005lattices] Regev, "On Lattices, Learning with Errors, Random Linear Codes, and Cryptography" (STOC 2005).
