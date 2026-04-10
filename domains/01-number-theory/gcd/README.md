# gcd — Greatest common divisor

## TL;DR

The greatest common divisor of two integers is the largest integer that
divides both. The Euclidean algorithm finds it in O(log min(a, b)) steps
by repeatedly replacing `(a, b)` with `(b, a mod b)`.

## Intuition

If some number `d` divides both `a` and `b`, it also divides any
combination like `a − kb`. So `d` divides `a mod b`, which means
`gcd(a, b) = gcd(b, a mod b)`. Each step strictly shrinks the second
argument, and when it hits zero the first holds the answer.

Worked example — `gcd(1071, 462)`:

```
1071 = 2 · 462 + 147       gcd(1071, 462) = gcd(462, 147)
 462 = 3 · 147 +  21       gcd(462, 147) = gcd(147,  21)
 147 = 7 ·  21 +   0       gcd(147,  21) = 21
```

## Statement

Given integers `a, b` (not both zero), `gcd(a, b)` is the unique positive
integer `d` such that `d | a`, `d | b`, and every common divisor of `a`
and `b` also divides `d`.

## Algorithm

```
function gcd(a, b):
    a, b ← |a|, |b|
    while b ≠ 0:
        a, b ← b, a mod b
    return a
```

See [`mod.ts`](./mod.ts) for the runnable implementation.

## Proof or justification

**Claim.** `gcd(a, b) = gcd(b, a mod b)` for `b > 0`.

Write `a = qb + r` with `r = a mod b`. Any common divisor of `a` and
`b` divides `r = a − qb`, so it's a common divisor of `b` and `r`.
Conversely any common divisor of `b` and `r` divides `a = qb + r`. The
two sets of common divisors are equal, hence have the same maximum.

**Termination.** Each step replaces `(a, b)` with `(b, r)` where
`0 ≤ r < b`. The second argument strictly decreases, so the process
terminates in finitely many steps.

**Complexity.** The worst case is consecutive Fibonacci numbers, giving
O(log min(a, b)) iterations (Lamé's theorem).

## Complexity

- Time: O(log min(|a|, |b|)) bignum operations
- Space: O(1)
- Numerical: exact (BigInt)

## Applications

- Simplifying fractions (`@math/core/numeric/rational.ts`)
- [`extended-euclidean`](../extended-euclidean/) — modular inverses
- [`crt`](../crt/) — Chinese remainder theorem
- [`applications/cryptography/rsa/`](../../../applications/cryptography/rsa/) — RSA key generation

## References

- [knuth1997taocp2] Knuth, *TAOCP Volume 2*, §4.5.2.
- [cohen1993number] Cohen, *A Course in Computational Algebraic Number Theory*, §1.3.
