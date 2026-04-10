# Dijkstra's Algorithm — Single-source shortest paths

## TL;DR

Dijkstra's algorithm finds shortest paths from a single source to all
other vertices in a graph with non-negative edge weights. With a binary
heap it runs in O((V + E) log V) time.

## Intuition

Imagine inflating a balloon from the source node. The air front reaches
closer nodes before farther ones. At each step we "finalize" the closest
unfinalized node — once finalized, no shorter path to it can exist
(because all remaining edges have non-negative weight).

## Statement

Given a weighted directed or undirected graph G = (V, E, w) with
w(e) >= 0 for all e, and a source vertex s, Dijkstra's algorithm
computes:

- `dist[v]` = weight of the shortest path from s to v (or +Infinity).
- `prev[v]` = predecessor of v on a shortest s-v path.

## Algorithm

```
function dijkstra(G, s):
    dist[v] ← Infinity for all v
    dist[s] ← 0
    PQ ← min-priority-queue with (0, s)
    while PQ not empty:
        (d, u) ← PQ.extractMin()
        if d > dist[u]: continue  // stale entry
        for each edge (u, v, w):
            if dist[u] + w < dist[v]:
                dist[v] ← dist[u] + w
                prev[v] ← u
                PQ.insert(dist[v], v)
```

See [`mod.ts`](./mod.ts) for the runnable implementation, including a
binary min-heap.

## Proof or justification

**Correctness** follows from the greedy-choice property: when we extract
a node u from the priority queue, `dist[u]` is optimal. Proof by
contradiction: suppose there exists a shorter path to u through some
unfinalized node x. But then `dist[x] < dist[u]`, so x would have been
extracted before u — contradicting the assumption.

**Non-negative weights are essential.** If some edge has negative weight,
the greedy choice breaks: relaxing through a negative edge could reduce a
finalized distance. See [`bellman-ford/`](../bellman-ford/) for graphs
with negative weights.

## Complexity

| Priority Queue | Time | Space |
|---|---|---|
| Binary heap | O((V + E) log V) | O(V + E) |
| Fibonacci heap | O(V log V + E) | O(V + E) |
| Array (no heap) | O(V^2) | O(V) |

Our implementation uses a binary heap (the practical sweet spot).

## Applications

- GPS / navigation systems.
- Network routing (OSPF protocol).
- Subroutine in A* search (see [`a-star/`](../a-star/)).
- Robot motion planning.
- Game AI pathfinding.

## References

- [dijkstra1959note] Dijkstra, "A note on two problems in connexion with graphs", *Numerische Mathematik*, 1959.
- [cormen2009clrs] Cormen et al., *Introduction to Algorithms* (3rd ed.), §24.3.
- [fredman1987fibonacci] Fredman & Tarjan, "Fibonacci heaps and their uses in improved network optimization algorithms", *JACM*, 1987.
