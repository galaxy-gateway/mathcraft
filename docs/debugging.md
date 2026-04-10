# Debugging notes

Common pitfalls when writing math code in TypeScript on Deno.

---

## BigInt vs number

TypeScript has two integer types. Mixing them is a `TypeError` at runtime:

```ts
1n + 1;      // TypeError
BigInt(1) + 1; // TypeError
```

Rules:

- **Use `BigInt` for exact integer math.** Number theory, cryptography, modular
  arithmetic, combinatorics with large results.
- **Use `number` for floating point.** Linear algebra, optimization, analysis,
  geometry.
- **Never mix them in one file without a comment** explaining the boundary. If
  you need to convert: `Number(bigintValue)` or `BigInt(numberValue)` (the
  latter throws on non-integers).

### Common trap: literal precedence

```ts
const n = 2 ** 53;           // number: 9007199254740992 (precise)
const m = 2 ** 53 + 1;       // number: 9007199254740992 (wrong!)
const k = (1n << 53n) + 1n;  // bigint: 9007199254740993n (correct)
```

Use `BigInt` the moment your integers might exceed `Number.MAX_SAFE_INTEGER`
(≈ 9 × 10¹⁵).

---

## Floating point comparisons

Never compare floats with `===`:

```ts
0.1 + 0.2 === 0.3; // false
```

Use the tolerance helpers in `@math/core/testing`:

```ts
import { assertCloseTo } from "@math/core/testing";
assertCloseTo(0.1 + 0.2, 0.3, 1e-10);
```

Typical tolerances:

- `1e-10` — general floating-point arithmetic
- `1e-8`  — iterative methods (gradient descent, power iteration)
- `1e-6`  — SVD, QR on larger matrices
- exact   — BigInt or Rational; use `assertEquals`

---

## NaN propagation

`NaN` is contagious and never equal to anything, including itself:

```ts
NaN === NaN; // false
Number.isNaN(NaN); // true  ← use this
```

Sources of `NaN` in this repo so far:

- `Math.sqrt` of a negative number
- `0 / 0` or `Infinity - Infinity`
- `Math.log` of a non-positive
- SVD of a rank-deficient matrix without regularization

Guard at module boundaries; let internal code assume inputs are finite.

---

## Modular arithmetic and negative inputs

JavaScript's `%` is **remainder**, not modulo. For negative operands the sign
follows the dividend:

```ts
(-7) % 3;  // -1
```

For true modulo that's always in `[0, n)`:

```ts
function mod(a: bigint, n: bigint): bigint {
  return ((a % n) + n) % n;
}
```

`@math/core/numeric` exports this as `mod`.

---

## PRNGs and determinism

Never use `Math.random()` in a test or demo. It's unseeded, so tests flake and
demos are unreproducible. Use `@math/core/random`:

```ts
import { pcg } from "@math/core/random";
const rng = pcg(42n);
rng.next(); // deterministic
```

---

## Deno permission errors in demos

Demos should need at most `--allow-read` (for imports). If you see:

```
error: Requires net access to "..."
```

you're probably importing from `https://...` in a concept file. Don't. All
imports must go through `deno.json`'s import map so they're reviewable and
lockable.

---

## Matrix indexing

`core/linalg/Matrix` uses `(row, col)` 0-indexed. A stack trace like

```
Error: index out of bounds: row=3, rows=3
```

almost always means you forgot the `< rows`, not `≤ rows` boundary. Integer
underflow (`-1`) shows up as the same error with a negative row.

---

## Property-based test shrinkers

When a `fast-check` property fails, the shrinker finds a minimal counterexample.
If shrinking hangs:

- Cap integers with `fc.integer({ min, max })` — unbounded integers can produce
  values that trigger slow paths.
- Avoid properties that depend on global state (they shrink to wrong inputs).
- If a test needs ≥100 but ≤10k iterations, pass `{ numRuns: 500 }` explicitly.
