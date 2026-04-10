# RSA — Public-key encryption from number theory

## TL;DR

RSA encryption works because modular exponentiation is fast but factoring
the product of two large primes is hard. This implementation composes
GCD, extended Euclidean, modular exponentiation, and Miller–Rabin from
`domains/01-number-theory/`.

## What this demonstrates

This is an **application** — it reuses four number-theory primitives to
build a complete (textbook) cryptosystem:

1. **Miller–Rabin** generates random primes `p, q`.
2. **Extended Euclidean** computes the private key `d = e⁻¹ mod φ(n)`.
3. **Modular exponentiation** performs `m^e mod n` (encrypt) and
   `c^d mod n` (decrypt).
4. **GCD** (via extended Euclidean) guarantees `gcd(e, φ(n)) = 1`.

See each concept's README for the standalone explanation; this file
documents how they compose.

## How RSA works

1. **Key generation.** Choose distinct primes `p, q`. Compute `n = pq`,
   `φ(n) = (p−1)(q−1)`. Choose `e = 65537` (standard). Compute
   `d ≡ e⁻¹ (mod φ(n))`. Public key: `(n, e)`. Private key: `(n, d)`.
2. **Encrypt.** `c = m^e mod n`.
3. **Decrypt.** `m = c^d mod n`.
4. **Sign.** `σ = hash^d mod n`.
5. **Verify.** `σ^e mod n = hash`.

See [`mod.ts`](./mod.ts).

## Caveat

This is **textbook RSA** — no padding. Without OAEP or PSS padding it's
vulnerable to chosen-ciphertext attacks, multiplicative homomorphism, and
more. Educational only.

## Complexity

- Key generation: dominated by primality testing. Each Miller–Rabin test
  is O(k · log³ n). Finding a b-bit prime takes O(b) attempts.
- Encrypt / decrypt: one modular exponentiation, O(log e · (log n)²)
  bit operations.
- Signature is the same cost as decrypt.

## References

- [rivest1978rsa] Rivest, Shamir, Adleman, "A Method for Obtaining
  Digital Signatures and Public-Key Cryptosystems" (1978).
- [cohen1993number] Cohen, §8.7 (RSA and primality).
