# modular-exponentiation — Fast `aᵇ mod n`

## TL;DR

Binary exponentiation computes `aᵇ mod n` in O(log b) multiplications by
squaring the base and reading the bits of `b` from low to high. It's the
workhorse of every modular-arithmetic cryptosystem.

## Intuition

`2¹³ = 2¹⁺⁴⁺⁸ = 2¹ · 2⁴ · 2⁸`. Binary exponentiation walks the bits of
the exponent; at each step it squares the running base (so you have
`a¹, a², a⁴, a⁸, …` available), and multiplies the result by the base
whenever the current bit is set.

## Statement

Given integers `a, b ≥ 0` and `n ≥ 1`, compute `aᵇ mod n`.

## Algorithm

```
function modPow(a, b, n):
    result ← 1
    a ← a mod n
    while b > 0:
        if b is odd:
            result ← (result · a) mod n
        a ← (a · a) mod n
        b ← b div 2
    return result
```

See [`mod.ts`](./mod.ts).

## Proof or justification

Let the exponent be `b = ∑ bᵢ · 2ⁱ`. Then
`aᵇ = ∏_{bᵢ=1} a^(2ⁱ)`. The loop invariant is that at iteration `i`, the
variable `a` holds `a^(2ⁱ) mod n` and `result` holds the partial product
over the bits processed so far. Correctness follows by induction.

## Complexity

- Time: O(log b) multiplications. Each multiplication is O((log n)²) for
  BigInt, so the total is O(log b · (log n)²).
- Space: O(1) besides the BigInt representation itself.
- Numerical: exact.

## Applications

- [`miller-rabin`](../miller-rabin/) — repeatedly computes `aᵈ mod n`
- [`tonelli-shanks`](../tonelli-shanks/) — square roots mod a prime
- [`applications/cryptography/rsa/`](../../../applications/cryptography/rsa/) — the dominant cost of RSA encrypt/decrypt
- Diffie–Hellman key exchange
- Lucas sequences, Fermat tests

## References

- [knuth1997taocp2] Knuth, *TAOCP Volume 2*, §4.6.3.
- [cohen1993number] Cohen, §1.2.
