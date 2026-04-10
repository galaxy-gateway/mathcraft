# pollard-rho — Integer factorization via cycle detection

## TL;DR

Pollard's rho uses the birthday paradox to find a non-trivial factor of a
composite integer in expected O(n^(1/4)) work — dramatically better than
trial division's O(√n).

## Intuition

Iterate `x ← x² + 1 (mod n)` starting from a random point. Modulo any
prime divisor `p | n`, this sequence eventually enters a cycle whose
expected length is only O(√p). If we compare two points in the sequence
that have "collided modulo p" but not modulo `n`, their difference shares
the factor `p` with `n` — which we extract via `gcd`.

The ρ in the name comes from the shape of the sequence: a tail
followed by a loop, like a lowercase rho.

## Statement

Given a composite `n > 1`, find an integer `d` with `1 < d < n` and
`d | n`.

## Algorithm

Brent's variant of Pollard's rho uses a "tortoise and hare":

```
function rho(n, seed):
    f(x) ← (x² + 1) mod n
    x, y ← seed
    d ← 1
    while d = 1:
        x ← f(x)
        y ← f(f(y))
        d ← gcd(|x − y|, n)
    return d if d ≠ n else retry
```

For full factorization, combine with [`miller-rabin`](../miller-rabin/)
to detect prime factors and recurse on non-prime parts.

See [`mod.ts`](./mod.ts).

## Proof or justification

**Cycle length.** By the birthday paradox, after ≈ √p iterations the
sequence modulo `p` is expected to collide. Brent's tortoise-and-hare
detects the collision in O(1) extra state.

**Factor extraction.** If `x ≡ y (mod p)` but `x ≢ y (mod n)`, then
`p | (x − y)` and `p | n`, so `gcd(|x − y|, n)` is a multiple of `p`
strictly less than `n`.

**Failure mode.** The algorithm can return `n` (meaning the cycle in the
full sequence and the cycle mod `p` coincided). Retry with a different
seed or polynomial.

## Complexity

- Time: expected O(p^(1/2)) operations, where `p` is the smallest prime
  factor of `n`. In the worst case for semiprimes with `p ≈ √n`, this is
  O(n^(1/4)).
- Space: O(1).
- Numerical: exact.

## Applications

- RSA cryptanalysis for ill-chosen (small-factor) keys.
- Factoring intermediate integers in [`crt`](../crt/)-based speed-ups.
- Number-theoretic CTF challenges.

## References

- [pollard1975monte] Pollard, "A Monte Carlo Method for Factorization" (1975).
- [knuth1997taocp2] Knuth, *TAOCP Volume 2*, §4.5.4.
- [cohen1993number] Cohen, §8.5.
