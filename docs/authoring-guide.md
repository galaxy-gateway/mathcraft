# Authoring guide

How to write a concept file that serves hobbyists, students, engineers, and
researchers from a single source.

---

## The layered README

Every deep-dive `README.md` follows this outline. Skip nothing.

### `# Concept name`

A single H1 matching the concept directory name.

### `## TL;DR`

**One sentence.** The shortest true thing you can say about this concept. A
math-curious hobbyist should get value from this sentence alone.

> Example: *Extended Euclidean finds integers x, y such that ax + by = gcd(a, b),
> and in doing so gives you the modular inverse of a mod b for free.*

### `## Intuition`

A student-friendly picture. Analogy, a worked small example, or a geometric
interpretation. No formal notation unless you define it inline. This is where
the reader builds a mental model.

### `## Statement`

The formal theorem, problem, or definition. Notation is allowed and expected.
If the concept is an algorithm, state the problem it solves and any
preconditions.

### `## Algorithm`

Pseudocode, then a link to the `mod.ts` implementation. Keep the pseudocode
short — the TypeScript is the source of truth.

```
Input:  a, b ∈ ℤ
Output: (gcd, x, y) with ax + by = gcd
…
```

See [`mod.ts`](./mod.ts) for the runnable implementation.

### `## Proof or justification`

Why it works. Proof sketch is fine — link out to a textbook proof if a full
proof would bloat the file. This section is for researchers and anyone who
wants to verify correctness.

### `## Complexity`

Time, space, and numerical behavior. Include the standard "best / average /
worst" breakdown for non-trivial algorithms.

### `## Applications`

Bullet list of places this concept shows up in `applications/` or elsewhere
in the repo, with links. If nothing yet, say so — leaving this empty is an
invitation for future contributors.

### `## References`

BibTeX keys from `CITATIONS.bib`, each on its own line:

```
- [cohen1993] Cohen, A Course in Computational Algebraic Number Theory, 1993.
- [knuth1997taocp2] Knuth, TAOCP Volume 2, 1997, §4.5.2.
```

`deno task check:citations` enforces that every key exists in `CITATIONS.bib`.

---

## `mod.ts`

- **One export per concept.** Helper functions may be unexported.
- **Document the public API with JSDoc.** Include `@param`, `@returns`, and an
  `@example` runnable via `deno eval`.
- **Reuse `core/`.** Don't reimplement matrix multiplication in a graph file.
- **Numeric types:**
  - `BigInt` for exact integer math (number theory, crypto).
  - `number` for floating point (linalg, optimization, analysis).
  - `Rational` from `@math/core/numeric` when you need exact arithmetic on
    non-integers.
  - Never mix `number` and `bigint` in one file without a comment.

---

## `mod_test.ts`

Every concept has at least:

1. **Reference-value tests.** Hardcoded inputs and outputs. These catch naive
   regressions and document expected behavior.
2. **Property-based tests** via `fast-check`. Any algebraic property —
   associativity, commutativity, inverse, idempotence, monotonicity — gets a
   property test.
3. **Edge cases.** Zero, one, negative, overflow.

Use `@math/core/testing` helpers for tolerance-aware comparisons:

```ts
import { assertCloseTo } from "@math/core/testing";
assertCloseTo(actual, expected, 1e-10);
```

---

## `demo.ts`

- **Single file.** No CLI args unless absolutely necessary.
- **Prints JSON to stdout.** A single object conforming to the
  [visualization contract](visualization-contract.md).
- **Runs in under 1 second.** Demos are for illustration, not benchmarks. Use
  small inputs.
- **Runnable with `deno task demo <path>`.** No special flags beyond `--allow-read`.

Skeleton:

```ts
import { emit } from "@math/core/viz";
import { myConcept } from "./mod.ts";

const input = /* small illustrative input */;
const result = myConcept(input);

emit({
  kind: "curve",
  title: "My concept",
  description: "What the reader should take away",
  series: [{ label: "result", points: result.points }],
});
```

---

## `notes.md` (optional)

Deeper derivations, alternate proofs, historical context, tangents. Anything
too long for the main README. Not required, but welcome.

---

## Checklist before opening a PR

- [ ] `README.md` has all seven layered sections
- [ ] Every reference is in `CITATIONS.bib`
- [ ] `mod.ts` exports the concept with JSDoc
- [ ] `mod_test.ts` has reference-value AND property-based tests
- [ ] `demo.ts` emits valid viz-contract JSON and runs in under 1 second
- [ ] `deno task verify` passes
- [ ] Commit message follows the Conventional Commits format in `CONTRIBUTING.md`
