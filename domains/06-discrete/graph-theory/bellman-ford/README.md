# Bellman–Ford — Shortest paths with negative weights

## TL;DR

The Bellman–Ford algorithm computes single-source shortest paths in
O(V * E) time and, unlike Dijkstra, works correctly with negative edge
weights. It also detects negative-weight cycles.

## Intuition

Repeat V-1 times: scan every edge and "relax" it (update the destination
if the path through this edge is shorter). After k passes, all shortest
paths using at most k edges are correct. Since any simple shortest path
uses at most V-1 edges, V-1 passes suffice.

If a V-th pass still improves some distance, a negative cycle exists
(you can always go around it one more time to reduce the total).

## Statement

Given a weighted directed graph G = (V, E, w) (weights may be negative)
and a source vertex s:

- If no negative-weight cycle is reachable from s, the algorithm returns
  `dist[v]` = shortest-path weight from s to v for every v.
- If a negative cycle is reachable, the algorithm reports its existence
  (shortest paths are undefined in that case).

## Algorithm

```
function bellmanFord(G, s):
    dist[v] ← Infinity for all v
    dist[s] ← 0
    for i = 1 to |V| - 1:
        for each edge (u, v, w):
            if dist[u] + w < dist[v]:
                dist[v] ← dist[u] + w
                prev[v] ← u
    // Negative-cycle detection:
    for each edge (u, v, w):
        if dist[u] + w < dist[v]:
            return "negative cycle"
```

See [`mod.ts`](./mod.ts) for the runnable implementation (with early
termination optimization).

## Proof or justification

**Correctness.** After pass k, `dist[v]` is optimal among all paths
from s to v using at most k edges. Proof by induction on k: if the
shortest k-edge path to v goes through u, then after pass k-1 `dist[u]`
is correct for (k-1) edges, and pass k relaxes (u, v). After V-1 passes,
all simple paths (at most V-1 edges) are covered.

**Negative-cycle detection.** If pass V can still relax an edge, there
exists a path with V edges that is shorter than any (V-1)-edge path,
which is only possible if the path contains a cycle of negative total
weight.

## Complexity

- Time: O(V * E). With early termination, often much faster in practice.
- Space: O(V + E).

Compared to Dijkstra's O((V + E) log V): Bellman–Ford is slower but
handles negative weights.

## Applications

- Arbitrage detection in currency exchange (negative cycles in log-weight
  graph).
- Distance-vector routing protocols (e.g., RIP).
- Subroutine in Johnson's all-pairs shortest paths algorithm.
- Constraint-satisfaction systems (difference constraints).

## References

- [bellman1958routing] Bellman, "On a routing problem", *Quarterly of Applied Mathematics*, 1958.
- [ford1956network] Ford, "Network flow theory", RAND Corporation, 1956.
- [cormen2009clrs] Cormen et al., *Introduction to Algorithms* (3rd ed.), §24.1.
