# 01 — Number theory

> **Flagship deep-dive.** This domain is fully populated as a reference for
> the per-concept pattern every other domain should follow.

Number theory studies the integers — primes, divisibility, modular arithmetic,
and the surprisingly deep structures that arise from them. It powers modern
cryptography and much of theoretical computer science.

## Concepts

| Concept                   | Summary                                          |
| ------------------------- | ------------------------------------------------ |
| [`gcd/`](./gcd/)          | Greatest common divisor via the Euclidean algorithm |
| [`extended-euclidean/`](./extended-euclidean/) | Bezout coefficients and modular inverses |
| [`modular-exponentiation/`](./modular-exponentiation/) | Fast `aᵇ mod n` via binary exponentiation |
| [`miller-rabin/`](./miller-rabin/) | Probabilistic primality testing        |
| [`pollard-rho/`](./pollard-rho/) | Integer factorization via cycle detection |
| [`crt/`](./crt/)          | Chinese remainder theorem                        |
| [`quadratic-residues/`](./quadratic-residues/) | Legendre symbol, Euler's criterion |
| [`tonelli-shanks/`](./tonelli-shanks/) | Square roots modulo an odd prime         |

Every concept directory contains `README.md`, `mod.ts`, `mod_test.ts`, and
`demo.ts`. Read them in the order above — each builds on the previous.

## Why these?

Together they form the computational toolkit behind RSA, lattice cryptography,
elliptic curve cryptography, and much of classical algorithm design. After
working through them you can implement [RSA from scratch](../../applications/cryptography/rsa/).
