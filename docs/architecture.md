# Architecture

This document explains how `math-examples` is laid out and why.

---

## Principles

1. **One concept per file.** Every theorem, algorithm, or structure gets its own
   directory with a predictable layout. This makes concepts linkable, testable
   in isolation, and composable.
2. **Runnable with zero setup.** If you have Deno, `deno task demo <path>` works.
   No bundler, no transpiler config, no `npm install`.
3. **Layered explanations.** Every `README.md` serves hobbyists, students, engineers,
   and researchers from the same source text by stacking sections in order of depth.
4. **Data-first visualization.** Every `demo.ts` emits a single JSON document conforming
   to the [visualization contract](visualization-contract.md). That decouples CLI
   output today from the Tauri GUI shipping in Phase 2.
5. **Bleeding edge next to classics.** `frontiers/` sits as a peer of `domains/` to
   signal that modern algorithms (lattice crypto, TDA, neural ODEs) are first-class,
   not appendices.

---

## Directory layout

```
math-examples/
├── core/          # Primitives everything else depends on
├── domains/       # Classical math taxonomy
├── frontiers/     # Bleeding-edge topics
├── applications/  # Math in action — "why it matters"
├── benchmarks/    # Deno.bench() for hot paths
├── scripts/       # Repo tooling
├── docs/          # Cross-cutting prose (you are here)
└── apps/          # Phase 2 interactive showcase (Rust + Tauri)
```

### `core/`

Shared primitives used by many domains. Anything that would otherwise be
reimplemented three times belongs here:

- `core/numeric/` — BigInt helpers, exact Rational, Complex
- `core/linalg/` — Vector, Matrix (dense)
- `core/random/` — Seeded PRNGs, basic distributions
- `core/viz/` — Visualization contract encoder
- `core/testing/` — Tolerance assertions, fast-check helpers

`core/` is the only module intended to be published (eventually to JSR as
`@math/core`). Everything else imports from `@math/core/*` via the import map in
`deno.json`.

### `domains/`

The math taxonomy. Subdirectories are numbered for stable ordering
(`00-foundations/` through `12-mathematical-physics/`). Each subdomain contains
concept directories with the standard five-file layout.

### `frontiers/`

Modern, cutting-edge mathematical topics that don't fit a single classical domain
or that are actively-researched. Examples: lattice cryptography, topological data
analysis, neural ODEs, homotopy type theory.

### `applications/`

Concepts from `core/`, `domains/`, and `frontiers/` composed into something useful.
RSA reuses number theory; linear regression reuses linear algebra; ray tracing
reuses geometry. `applications/` files should pull in real implementations from
elsewhere in the repo — they are the "why this matters" payoff.

### `apps/showcase/` (Phase 2)

A Rust + Tauri desktop application that reads the visualization-contract JSON
emitted by every `demo.ts` and renders it interactively. See
[visualization contract](visualization-contract.md) for the schema that bridges
the two.

---

## Per-concept layout

Every concept lives in a directory named after the concept:

```
concept-name/
├── README.md      # Layered explainer
├── mod.ts         # The implementation, exported
├── mod_test.ts    # Unit + property-based tests
├── demo.ts        # Runnable entry point; emits viz-contract JSON
└── notes.md       # Optional: deeper derivations, alternate proofs
```

The layered `README.md` sections are described in
[`authoring-guide.md`](authoring-guide.md).

---

## Module resolution

The `imports` map in `deno.json` makes cross-domain imports look like package imports:

```ts
import { Matrix } from "@math/core/linalg";
import { modularExponent } from "../../01-number-theory/modular-exponentiation/mod.ts";
```

Rules of thumb:

- **Import `core/` via `@math/core/*`.** Never via relative path.
- **Import across domains sparingly and via relative path.** Cross-domain imports
  are allowed but should be documented in the importing concept's README.
- **Applications may import anything.** That's their job.

---

## Testing

Every `mod.ts` has a sibling `mod_test.ts`. Tests fall into three flavors:

1. **Reference-value tests.** Hardcoded inputs and outputs, often from a textbook.
2. **Property-based tests** via `fast-check`. Any algorithm with an algebraic
   property — associativity, commutativity, inverse, idempotence — gets a property
   test with ≥100 iterations.
3. **Cross-check tests.** Against a known-good implementation in `npm:mathjs`
   where useful. These are allowed but the concept's own implementation must not
   depend on mathjs.

Run everything with `deno task test`. The full suite must pass before any PR merges.

---

## Visualization contract

Every `demo.ts` prints a single JSON document to stdout. The schema is versioned
and lives in [`visualization-contract.md`](visualization-contract.md). The CLI
workflow today pretty-prints this JSON; the Phase 2 Tauri app consumes the same
JSON and renders it as interactive graphics.

This is the key architectural decision that lets the CLI-first repo ship today
without blocking the interactive GUI vision.

---

## What lives outside the repo

- **External math libraries.** We are the implementation. `npm:mathjs` is allowed
  only for cross-checking in tests.
- **Generated plots.** Demos print JSON, not SVG or PNG. The renderer is the
  consumer's job (terminal, browser, Tauri app).
- **Notebooks.** Not our format. Every demo is a `.ts` file runnable via `deno run`.
