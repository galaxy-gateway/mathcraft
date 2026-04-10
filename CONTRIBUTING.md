# Contributing to mathcraft

Thanks for helping build the most complete mathematical concept repository in code.

---

## Prerequisites

- [Deno](https://deno.com) ≥ 2.5
- Git
- (Optional) An editor with the Deno extension for inline typechecking

No `npm install`. No build step. If Deno is on your PATH you're ready.

---

## Adding a new concept

1. **Scaffold it.**

   ```bash
   deno task new domains/<domain>/<subdomain>/<concept-name>
   ```

   This creates the concept directory with `README.md`, `mod.ts`, `mod_test.ts`,
   and `demo.ts` pre-filled from [`docs/concept-template.md`](docs/concept-template.md).

2. **Fill in the layered README.** Every deep-dive README has seven sections:

   - **TL;DR** — one sentence a hobbyist can read
   - **Intuition** — a student-friendly picture
   - **Statement** — formal theorem or problem definition
   - **Algorithm** — pseudocode + link to `mod.ts`
   - **Proof or justification** — for researchers
   - **Complexity** — time, space, numerical
   - **Applications** — link to `applications/` where relevant
   - **References** — BibTeX keys from `CITATIONS.bib`

   See [`docs/authoring-guide.md`](docs/authoring-guide.md) for the full template.

3. **Implement `mod.ts`.** One concept per file. Reuse `core/` primitives wherever
   possible — don't reimplement `Matrix` multiplication in a graph-theory file.

4. **Write tests.**
   - Reference-value tests against known correct outputs.
   - Property-based tests using `fast-check` for anything with an algebraic property
     (commutativity, associativity, idempotence, inverse).
   - Use `core/testing` helpers for tolerance-aware assertions.

5. **Write `demo.ts`.** It must:
   - Run via `deno task demo <path>/demo.ts` with no special flags beyond `--allow-read`.
   - Print a single JSON document conforming to the
     [visualization contract](docs/visualization-contract.md).
   - Be runnable in under 1 second.

6. **Cite sources.** Add BibTeX entries to `CITATIONS.bib` and reference their keys
   in your README. `deno task check:citations` enforces this for deep-dives.

7. **Verify.**

   ```bash
   deno task verify
   ```

   This runs `fmt:check`, `lint`, `check`, and `test`. All four must pass.

---

## Style guide

- **One concept per file.** If you find yourself implementing two theorems in `mod.ts`,
  split them.
- **Prefer explicit over clever.** Readers are here to learn. A three-line idiomatic
  reduction that obscures the algorithm is worse than ten explicit lines.
- **Comments explain *why*, not *what*.** The math explains the what.
- **No abbreviations in public API.** `modularExponent`, not `modExp`. Unless the
  abbreviation is the canonical math name (`gcd`, `lcm`, `crt`, `svd`).
- **BigInt for exact integer math.** `number` for floating point. Never mix in one file
  without a comment explaining why.
- **Deterministic by default.** Seed every PRNG. Tests must not be flaky.

---

## Commit style

Follow [Conventional Commits](https://www.conventionalcommits.org/) via commitizen:

```
feat(number-theory): add Tonelli–Shanks square root mod p

Implements Tonelli–Shanks for computing square roots modulo an odd prime.
Reuses modular exponentiation from @math/core/numeric.

Refs: README.md, CITATIONS.bib (cohen1993)
```

Types we use: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`.

The scope is the domain or subsystem (`number-theory`, `linalg`, `core`, `scripts`,
`docs`, `showcase`).

---

## Versioning and releases

We use semantic versioning for `@math/core` once it's published to JSR.

- **Patch**: a new concept in an existing domain, bug fixes in `core/`.
- **Minor**: a new domain getting its first concept, new `core/` primitive.
- **Major**: breaking change to `core/` public API or visualization contract.

After merging non-trivial work:

1. Bump `version` in `deno.json`.
2. Commit the bump: `chore(release): v0.2.0`.
3. Tag it: `git tag -a v0.2.0 -m "v0.2.0"`.
4. Push the tag: `git push origin v0.2.0`.

---

## Reporting issues

Open a GitHub issue with:

- The concept or file the issue relates to
- Minimal reproduction (a `deno run` command)
- Expected vs. actual output

Document recurring issues in [`docs/debugging.md`](docs/debugging.md).
