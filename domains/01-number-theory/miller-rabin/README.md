# miller-rabin — Probabilistic primality testing

## TL;DR

Miller–Rabin is a Fermat-style primality test that can't be fooled by
Carmichael numbers. With a fixed witness set it's deterministic for all
64-bit integers, which is what we use here.

## Intuition

Fermat's little theorem says that if `n` is prime then `a^(n−1) ≡ 1 (mod n)`
for any `a` coprime to `n`. The converse isn't true — Carmichael numbers
satisfy it too — so Fermat's test has blind spots.

Miller–Rabin squeezes more information out of the factoring
`n − 1 = 2^r · d`. For a prime, raising `a` to `d` and then squaring `r`
times must produce the sequence `… 1` or it must hit `−1 (mod n)` first.
If neither happens, `n` is composite.

## Statement

Let `n > 2` be odd. Write `n − 1 = 2^r · d` with `d` odd. A witness `a`
is a "Miller–Rabin witness for compositeness" if

1. `a^d ≢ 1 (mod n)`, and
2. `a^(2ⁱ · d) ≢ −1 (mod n)` for all `0 ≤ i < r`.

**Theorem (Monier; Rabin).** If `n` is composite, at least 3/4 of the
integers in `[1, n−1]` are witnesses.

## Algorithm

```
function isProbablePrime(n):
    handle small primes and trial division
    write n − 1 = 2^r · d with d odd
    for each witness a in SMALL_PRIMES:
        x ← a^d mod n
        if x = 1 or x = n − 1: continue
        for i in 1..r − 1:
            x ← x² mod n
            if x = n − 1: continue outer loop
        return composite
    return probably prime
```

See [`mod.ts`](./mod.ts).

## Proof or justification

If `n` is prime, the sequence `a^d, a^(2d), a^(4d), … a^(n−1)` must end
at 1, and because the only square roots of 1 modulo a prime are `±1`,
the first `1` in the sequence must be preceded by `−1`. If neither
condition holds the witness proves `n` is composite.

The Monier/Rabin bound on the density of witnesses is stronger than the
1/2 bound of the Solovay–Strassen test.

**Deterministic witness sets.** Jaeschke (1993) and successors have shown
specific small witness sets are deterministic up to various bounds. The
set `{2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}` is deterministic for
all `n < 3.317 · 10¹⁴` — comfortably covering 64-bit integers.

## Complexity

- Time: O(k · log³ n) bit operations, where k is the number of witnesses.
- Space: O(log n).
- Numerical: exact.

## Applications

- [`applications/cryptography/rsa/`](../../../applications/cryptography/rsa/) — RSA key generation searches for random primes with this test.
- [`pollard-rho`](../pollard-rho/) — trial-division-then-Pollard-rho factoring uses this to detect prime factors.
- Generating safe primes for Diffie–Hellman.

## References

- [miller1976riemann] Miller, "Riemann's Hypothesis and Tests for Primality" (1976).
- [rabin1980probabilistic] Rabin, "Probabilistic Algorithm for Testing Primality" (1980).
- [cohen1993number] Cohen, §8.2.
