# Glossary

Shared math notation and terminology used across the repo.

---

## Notation

| Symbol             | Meaning                                           |
| ------------------ | ------------------------------------------------- |
| ℕ, ℤ, ℚ, ℝ, ℂ     | Naturals, integers, rationals, reals, complex     |
| ℤ/nℤ, 𝔽ₚ          | Integers mod n, finite field of order p           |
| a ≡ b (mod n)      | a and b have the same remainder mod n             |
| gcd(a, b), lcm     | Greatest common divisor, least common multiple    |
| ⟨v, w⟩, v · w      | Inner product / dot product                       |
| ‖v‖                | Norm (L² unless stated otherwise)                 |
| Aᵀ, A*, A⁻¹        | Transpose, conjugate transpose, inverse           |
| O(f), Θ(f), Ω(f)   | Asymptotic upper / tight / lower bound            |
| G = (V, E)         | Graph with vertex set V and edge set E            |
| ⊕, ⊗              | Direct sum, tensor product                        |
| ∇f, Hf             | Gradient and Hessian of f                         |
| 𝔼[X], Var(X)      | Expectation and variance                          |

---

## Terms

- **Dense / sparse** — whether most entries of a matrix or tensor are nonzero.
- **Concept** — in this repo, one mathematical idea packaged as a directory with
  `README.md`, `mod.ts`, `mod_test.ts`, and `demo.ts`.
- **Deep-dive** — a domain that has been fully built out as a flagship example
  of the per-concept pattern. Phase 1 has four: number theory, linear algebra,
  graph theory, convex optimization.
- **Frontier** — a modern, cutting-edge topic surfaced in `frontiers/` rather
  than a classical `domains/` subdirectory. Examples: lattice crypto, TDA.
- **Property-based test** — a test that asserts a mathematical property (e.g.,
  `gcd(a, b) = gcd(b, a mod b)`) holds for many randomly generated inputs.
- **Visualization contract** — the versioned JSON schema every `demo.ts` emits.
  See [`visualization-contract.md`](visualization-contract.md).
- **Viz kind** — the discriminator in the visualization contract selecting the
  renderer: `curve`, `heatmap`, `point-cloud`, `graph`, `complex-plane`,
  `vector-field`, `scalar`.
