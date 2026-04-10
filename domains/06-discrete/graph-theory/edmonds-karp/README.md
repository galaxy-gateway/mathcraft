# Edmonds–Karp — Maximum flow via BFS augmenting paths

## TL;DR

The Edmonds–Karp algorithm computes the maximum flow in a directed
network in O(V * E^2) time by repeatedly finding shortest augmenting
paths with BFS and pushing flow along them.

## Intuition

Imagine water flowing through a network of pipes from a source to a
sink. Each pipe has a maximum capacity. We want to push as much water as
possible from source to sink without exceeding any pipe's capacity.

Edmonds–Karp works by repeatedly:
1. Finding any path with available capacity (using BFS for shortest).
2. Pushing as much flow as the tightest pipe allows (the "bottleneck").
3. Updating remaining capacities (including "reverse" capacity that
   allows future rerouting).

Using BFS guarantees that augmenting-path lengths never decrease, which
bounds the total iterations to O(V * E).

## Statement

Given a directed graph G = (V, E) with capacity function c: E -> R+,
a source s, and a sink t, the **maximum flow** is the maximum total
flow from s to t that respects:
- **Capacity constraint**: 0 <= f(u,v) <= c(u,v) for all (u,v).
- **Flow conservation**: for all v != s,t: sum of inflow = sum of outflow.

The **max-flow min-cut theorem** states that the maximum flow equals the
minimum total capacity of edges whose removal disconnects s from t.

## Algorithm

```
function EdmondsKarp(G, s, t):
    totalFlow ← 0
    while BFS finds path P from s to t in residual graph:
        bottleneck ← min capacity along P
        for each edge (u, v) in P:
            residual[u][v] -= bottleneck
            residual[v][u] += bottleneck
        totalFlow += bottleneck
    return totalFlow
```

See [`mod.ts`](./mod.ts) for the runnable implementation, including
min-cut extraction.

## Proof or justification

**Termination.** Each BFS augmentation increases flow by at least 1
(for integer capacities). BFS ensures augmenting-path length is
non-decreasing; each length value can be used for at most O(E)
augmentations, and path length is bounded by V. Total augmentations:
O(V * E).

**Optimality (max-flow = min-cut).** When no augmenting path exists, the
nodes reachable from s in the residual graph form the source side of a
minimum cut. Every edge crossing the cut is saturated, so total flow
equals cut capacity. Since flow <= any cut capacity, this flow is maximum.

This is the **max-flow min-cut theorem** (Ford & Fulkerson, 1956).

## Complexity

| Variant | Time |
|---|---|
| Edmonds–Karp (BFS) | O(V * E^2) |
| Ford–Fulkerson (DFS) | O(E * maxFlow) — may not terminate for irrational capacities |
| Dinic's algorithm | O(V^2 * E) |
| Push-relabel | O(V^2 * E) or O(V^3) |

Space: O(V^2) for the capacity matrix.

## Applications

- Network routing and bandwidth allocation.
- Bipartite matching (reduce to max-flow).
- Image segmentation (graph cuts).
- Project selection / closure problems.
- Baseball elimination problem.
- Airline scheduling.

## References

- [edmonds1972karp] Edmonds & Karp, "Theoretical improvements in algorithmic efficiency for network flow problems", *JACM*, 1972.
- [ford1956maxflow] Ford & Fulkerson, "Maximal flow through a network", *Canadian J. Math*, 1956.
- [cormen2009clrs] Cormen et al., *Introduction to Algorithms* (3rd ed.), §26.
