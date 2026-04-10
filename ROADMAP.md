# Roadmap

mathcraft is built in phases. Phase 1 establishes the pattern with four
flagship deep-dives and a pair of frontier/application seeds. Later phases fan out.

---

## Phase 1 — Foundation (current)

Goal: set the quality bar and prove the architecture end-to-end.

### Infrastructure

- [x] `deno.json` workspace with tasks (`test`, `fmt`, `lint`, `check`, `demo`, `new`, `verify`)
- [x] Root `README.md`, `ROADMAP.md`, `CONTRIBUTING.md`, `CITATIONS.bib`
- [x] `docs/` — architecture, authoring guide, concept template, visualization contract,
      debugging notes, glossary
- [x] Full taxonomy directory skeleton with stub READMEs

### `core/` primitives

- [x] `core/numeric/` — bigint helpers, rational, complex
- [x] `core/linalg/` — vector, matrix (dense)
- [x] `core/random/` — PCG, basic distributions
- [x] `core/viz/emit.ts` — visualization contract encoder
- [x] `core/testing/` — tolerance helpers, fast-check integration

### Flagship deep-dives

1. **`domains/01-number-theory/`**
   - [x] GCD
   - [x] Extended Euclidean
   - [x] Modular exponentiation
   - [x] Miller–Rabin primality
   - [x] Pollard's rho factorization
   - [x] Chinese remainder theorem
   - [x] Quadratic residues
   - [x] Tonelli–Shanks

2. **`domains/02-algebra/linear/`**
   - [x] Gauss elimination
   - [x] LU decomposition
   - [x] QR decomposition (Gram–Schmidt)
   - [x] SVD (via Jacobi rotations, toy scale)
   - [x] Power iteration
   - [x] QR algorithm for eigenvalues
   - [x] PageRank

3. **`domains/06-discrete/graph-theory/`**
   - [x] BFS, DFS
   - [x] Dijkstra
   - [x] A*
   - [x] Bellman–Ford
   - [x] Edmonds–Karp max flow
   - [x] Spectral clustering

4. **`domains/08-optimization/convex/`**
   - [x] Gradient descent (vanilla, momentum, Nesterov, Adam)
   - [x] Newton's method
   - [x] Interior point (log-barrier intro)
   - [x] Tiny CVX-style DSL sketch

### Frontier seeds

- [x] `frontiers/lattice-cryptography/lwe/` — toy LWE encryption
- [x] `frontiers/topological-data-analysis/vietoris-rips/` — Vietoris–Rips + persistent homology

### Application seeds

- [x] `applications/cryptography/rsa/` — RSA reusing number theory primitives
- [x] `applications/machine-learning/linear-regression-from-scratch/` — reusing linalg

### Tooling

- [x] `scripts/new-concept.ts` — scaffolds a concept from template
- [x] `scripts/check-citations.ts` — enforces references on deep-dives
- [x] `scripts/build-index.ts` — regenerates navigation tables
- [x] `apps/showcase/README.md` — Phase 2 architecture stub

---

## Phase 2 — Interactive Showcase

Goal: replace the CLI JSON output with a rich interactive viewer without touching
demo code.

- [ ] `apps/showcase/` — Rust + Tauri application
- [ ] Embedded webview renderer for each `kind` in the visualization contract
      (`graph`, `curve`, `heatmap`, `point-cloud`, `complex-plane`, `vector-field`)
- [ ] Demo picker that discovers every `demo.ts` under `domains/`, `frontiers/`,
      `applications/` at runtime
- [ ] Concept browser with the same layered README rendering as GitHub
- [ ] "Step" controls for algorithms that emit animation frames

---

## Phase 3 — Taxonomy Fill

Goal: at least one complete concept inside every `domains/` subdirectory.

Priority order (easy wins first, frontier bridges later):

1. `domains/00-foundations/` — propositional logic evaluator, naive set ops, induction examples
2. `domains/02-algebra/abstract/` — cyclic groups, dihedral groups, rings ℤ/nℤ, finite fields
3. `domains/03-analysis/numerical/` — Newton root finding, Simpson quadrature, RK4 ODE
4. `domains/04-geometry/computational/` — convex hull (Graham scan), Delaunay, Voronoi
5. `domains/07-probability/distributions/` — inverse CDF sampling, MCMC (Metropolis), Gibbs
6. `domains/09-information-theory/` — entropy, Huffman, arithmetic coding
7. `domains/10-category-theory/` — `Functor`, `Monad`, `Applicative` in TS's type system
8. `domains/11-dynamical-systems/` — logistic map, Lorenz attractor, Poincaré sections
9. `domains/05-topology/` — simplicial complexes, Euler characteristic
10. `domains/12-mathematical-physics/` — Lagrangian pendulum, symplectic integrators

---

## Phase 4 — Frontiers and Applications at Scale

Goal: build the "bleeding edge reference" reputation.

### Frontiers to deepen

- `frontiers/quantum-computing/` — qubit, Bell states, Grover, Shor (toy scale)
- `frontiers/neural-differential-equations/` — Neural ODE forward/backward pass
- `frontiers/homotopy-type-theory/` — identity types, equivalences (in TS's type system)
- `frontiers/differential-privacy/` — Laplace mechanism, RDP accountant
- `frontiers/spectral-graph-learning/` — graph Laplacian, GCN forward pass
- `frontiers/sum-of-squares-hierarchies/` — SDP relaxation walkthrough
- `frontiers/free-energy-principle/` — variational free energy on a toy agent

### Applications to expand

- `applications/signal-processing/` — FFT from scratch, wavelets, filter design
- `applications/computer-graphics/` — ray tracing, quaternions, splines
- `applications/physics-simulation/` — N-body, rigid body, stable fluids
- `applications/finance/` — Black–Scholes, Monte Carlo option pricing
- `applications/compression/` — Huffman, arithmetic, LZW
- `applications/puzzles/` — Rubik's cube as group theory, Sudoku as SAT

---

## Phase 5 — Publishing

- [ ] Publish `@math/core` to JSR so downstream projects can depend on the primitives
- [ ] Tag `v1.0.0` once every `domains/` subdirectory has at least one concept
- [ ] Ship `apps/showcase` as a signed DMG/MSI release

---

## Ongoing

- Benchmark suite (`deno bench benchmarks/`) tracking perf of hot algorithms across
  Deno versions.
- `CITATIONS.bib` grows with every concept. The `check:citations` script keeps it honest.
