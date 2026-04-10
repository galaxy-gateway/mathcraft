# Vietoris–Rips complex and persistent homology

## TL;DR

Given a point cloud, the Vietoris–Rips complex connects points within
distance ε. Sweeping ε from 0 to ∞ and tracking how connected components
appear and merge gives a "barcode" that summarizes the topological shape
of the data at every scale simultaneously.

## Intuition

Imagine inflating balls of radius ε/2 around each point. When two balls
overlap, draw an edge. As ε grows, clusters of points merge. The
persistence barcode records each connected component's "birth" (when a
point appears) and "death" (when it merges into an older component). Long
bars represent robust features; short bars represent noise.

## Statement

**Vietoris–Rips complex.** Given a metric space `(X, d)` and radius `ε`,
the Rips complex `Rips_ε(X)` is the simplicial complex whose k-simplices
are subsets `{x₀, …, xₖ} ⊂ X` with `d(xᵢ, xⱼ) ≤ ε` for all pairs.

**Persistent H₀.** Sweeping `ε` over `[0, ∞)` gives a nested family of
complexes (a filtration). The zeroth homology `H₀` counts connected
components. Tracking births and deaths as `ε` grows yields the H₀
persistence barcode.

## Algorithm

1. Compute all pairwise distances. Sort edges by weight.
2. Initialize a union-find with each point as its own component.
3. Process edges in order. When an edge merges two components, the
   younger one "dies" at the current edge weight. Record a bar
   `[birth, death]`.
4. The last surviving component has `death = ∞`.

This is Kruskal's algorithm in disguise, tracking component lifetimes.

See [`mod.ts`](./mod.ts).

## Proof or justification

The Rips filtration is an increasing family of simplicial complexes.
Persistent homology is a functor from this filtration to the category of
persistence modules. For H₀, the structure theorem says the persistence
module decomposes into interval summands — the bars.

Because our algorithm processes edges in sorted order and uses union-find,
each merge event corresponds exactly to a bar's death. The elder rule
(older component survives) ensures the decomposition is unique.

## Complexity

- Time: O(n² log n) for pairwise distances + edge sorting. The union-find
  operations are O(n · α(n)) ≈ O(n).
- Space: O(n²) for the edge list.
- For H₁ and higher: a full boundary matrix reduction costs O(n³) in
  the worst case (not implemented here).

## Applications

- Topological data analysis of protein structures, materials, sensor
  networks.
- Feature engineering for machine learning on point clouds.
- Shape recognition and comparison.
- See [`frontiers/topological-data-analysis/`](../) for planned H₁
  extensions.

## References

- [edelsbrunner2002topological] Edelsbrunner, Letscher, Zomorodian,
  "Topological Persistence and Simplification" (2002).
