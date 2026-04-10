# extended-euclidean — Extended Euclidean algorithm

## TL;DR

Extended Euclidean finds integers `x, y` such that `ax + by = gcd(a, b)`,
and in doing so gives you the modular inverse of `a` mod `b` for free.

## Intuition

The ordinary Euclidean algorithm throws away the quotients at each step.
Extended Euclidean keeps them, so it can express the gcd as a linear
combination of the original inputs. When `gcd(a, n) = 1`, the `x`
coefficient is exactly `a⁻¹ mod n` — because `ax ≡ 1 (mod n)`.

## Statement

Given integers `a, b`, there exist integers `x, y` such that
`ax + by = gcd(a, b)`. Extended Euclidean finds such a pair.

## Algorithm

```
function extendedGcd(a, b):
    (oldR, r)  ← (a, b)
    (oldS, s)  ← (1, 0)
    (oldT, t)  ← (0, 1)
    while r ≠ 0:
        q ← oldR div r
        (oldR, r) ← (r, oldR − q·r)
        (oldS, s) ← (s, oldS − q·s)
        (oldT, t) ← (t, oldT − q·t)
    return (gcd = oldR, x = oldS, y = oldT)
```

See [`mod.ts`](./mod.ts).

## Proof or justification

At every step we maintain the invariants
`oldR = oldS·a + oldT·b` and `r = s·a + t·b`. Subtracting `q` times the
second from the first shows they're preserved under the update. When `r`
becomes zero, `oldR = gcd(a, b)` (from the standard Euclidean argument),
and the invariant gives us the Bezout coefficients.

## Complexity

- Time: O(log min(|a|, |b|))
- Space: O(1)
- Numerical: exact (BigInt)

## Applications

- [`modInverse`](./mod.ts) — the star application
- [`crt`](../crt/) — Chinese remainder theorem uses it to merge congruences
- [`applications/cryptography/rsa/`](../../../applications/cryptography/rsa/) — computing the private key `d` from `e` mod `φ(n)`

## References

- [knuth1997taocp2] Knuth, *TAOCP Volume 2*, §4.5.2, Algorithm X.
- [cohen1993number] Cohen, §1.3.6.
