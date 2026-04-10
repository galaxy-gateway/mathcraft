# mathcraft

> The go-to reference for mathematical concepts in code — from foundations to the bleeding edge.

**mathcraft** is a TypeScript-on-Deno repository that aims to be the most complete
mathematical concept reference available as working code. It spans every major branch
of mathematics, shows how each concept can be used to build interesting or useful
things, and explicitly surfaces bleeding-edge algorithms alongside the classics.

No install step. No bundler. Just Deno, TypeScript, and markdown.

```bash
git clone <this-repo> && cd mathcraft
deno task test                                    # run everything
deno task demo domains/01-number-theory/extended-euclidean/demo.ts
```

---

## Who this is for

Every concept file is written in layers so four audiences can share the same source:

- **Math-curious hobbyists** — start with the TL;DR and the intuition.
- **Students learning math** — intuition, statement, worked examples, visualizations.
- **Working engineers** — clean reusable implementations in `core/` and `domains/`.
- **Researchers & practitioners** — proof sketches, complexity analysis, citations.

See [`docs/authoring-guide.md`](docs/authoring-guide.md) for the layered template every
concept follows.

---

## Repository map

| Path            | What lives here                                                 |
| --------------- | --------------------------------------------------------------- |
| `core/`         | Shared primitives: numeric types, linalg, PRNGs, viz, testing   |
| `domains/`      | The math taxonomy — concepts organized by branch of math        |
| `frontiers/`    | Bleeding-edge topics (lattice crypto, TDA, neural ODEs, HoTT…)  |
| `applications/` | Math in action — crypto, ML, graphics, physics, finance         |
| `benchmarks/`   | `Deno.bench()` suites for hot algorithms                        |
| `scripts/`      | Repo tooling (scaffolding, citation check, index builder)       |
| `apps/`         | Future interactive visualizer (Rust + Tauri, Phase 2)           |
| `docs/`         | Architecture, authoring guide, debugging notes, glossary        |

### Math domains

| Code                          | Domain                   | Status     |
| ----------------------------- | ------------------------ | ---------- |
| `domains/00-foundations/`     | Logic, set theory, proof | skeleton   |
| `domains/01-number-theory/`   | Number theory            | **flagship** |
| `domains/02-algebra/linear/`  | Linear algebra           | **flagship** |
| `domains/02-algebra/abstract/`| Groups, rings, fields    | skeleton   |
| `domains/03-analysis/`        | Real, complex, numerical | skeleton   |
| `domains/04-geometry/`        | Euclidean, differential  | skeleton   |
| `domains/05-topology/`        | Point-set, algebraic     | skeleton   |
| `domains/06-discrete/graph-theory/` | Graph theory       | **flagship** |
| `domains/07-probability/`     | Measure, stats, processes| skeleton   |
| `domains/08-optimization/convex/`   | Convex optimization| **flagship** |
| `domains/09-information-theory/` | Entropy, coding       | skeleton   |
| `domains/10-category-theory/` | Functors, monads, limits | skeleton   |
| `domains/11-dynamical-systems/` | Chaos, bifurcations    | skeleton   |
| `domains/12-mathematical-physics/` | Mechanics, tensors  | skeleton   |

See [`ROADMAP.md`](ROADMAP.md) for what's built, what's next, and how the flagships
establish the pattern the rest of the repo follows.

---

## How it's organized

Every concept is a directory with the same shape:

```
concept-name/
├── README.md    # Layered explainer (TL;DR → intuition → proof → references)
├── mod.ts       # The implementation, exported
├── mod_test.ts  # Unit + property-based tests
├── demo.ts      # Runnable entry point emitting viz-contract JSON
└── notes.md     # Optional deeper derivations
```

Every `demo.ts` emits a single JSON document conforming to the
[visualization contract](docs/visualization-contract.md). Today those print to the
terminal; the Phase 2 Tauri app will render the same JSON as interactive graphics
without any demo needing to be rewritten.

---

## Contributing

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) and
[`docs/authoring-guide.md`](docs/authoring-guide.md), then:

```bash
deno task new domains/02-algebra/abstract/cyclic-groups
```

This scaffolds a new concept from `docs/concept-template.md`. Fill in the layers,
add tests, and open a PR.

---

## License

MIT
