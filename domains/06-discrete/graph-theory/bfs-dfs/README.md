# BFS & DFS — Breadth-first and depth-first search

## TL;DR

BFS explores a graph layer by layer from a source; DFS goes as deep as
possible before backtracking. Both run in O(V + E) time and produce a
spanning tree of the reachable component.

## Intuition

**BFS** uses a queue. Think of dropping a stone in a pond — the wavefront
expands one hop at a time, so every node is first reached via a shortest
(fewest-hops) path.

**DFS** uses a stack (or recursion). Think of exploring a maze by always
taking the leftmost unexplored corridor; you backtrack only when you hit
a dead end.

## Statement

Given a graph G = (V, E) and a start vertex s:

- **BFS** visits every vertex reachable from s in non-decreasing order of
  hop distance.
- **DFS** visits every vertex reachable from s, exploring each branch
  fully before retreating.

Both produce:
- `order[]` — the sequence of first-visit times.
- `parent[]` — a spanning tree rooted at s (`parent[s] = -1`).

## Algorithm

### BFS

```
function bfs(G, s):
    visited[s] ← true
    Q ← queue containing s
    while Q not empty:
        u ← Q.dequeue()
        for each neighbour v of u:
            if not visited[v]:
                visited[v] ← true
                parent[v] ← u
                Q.enqueue(v)
```

### DFS (iterative)

```
function dfs(G, s):
    visited[s] ← true
    S ← stack containing s
    while S not empty:
        u ← S.pop()
        for each neighbour v of u (reverse order):
            if not visited[v]:
                visited[v] ← true
                parent[v] ← u
                S.push(v)
```

See [`mod.ts`](./mod.ts) for the runnable implementation.

## Proof or justification

**BFS correctness.** At each step the queue contains nodes at distance d
and d+1 from s. A node at distance d is dequeued before any node at
distance d+1, so the first time a node is discovered it is via a shortest
path. This is proved by induction on hop distance (see CLRS §22.2).

**DFS correctness.** The stack ensures every reachable vertex is visited:
a vertex is pushed exactly once (the `visited` check prevents re-pushing),
and every pushed vertex is eventually popped. The parenthesization theorem
(CLRS §22.3) establishes the tree structure.

## Complexity

| | Time | Space |
|---|---|---|
| BFS | O(V + E) | O(V) |
| DFS | O(V + E) | O(V) |

Both examine each vertex and edge at most once. Space is dominated by the
queue/stack and the visited array.

## Applications

- Shortest path in unweighted graphs (BFS).
- Connected-component detection (BFS or DFS).
- Topological sort (DFS on a DAG).
- Cycle detection (DFS).
- Used as sub-routine in Edmonds–Karp max-flow (BFS augmenting paths).
- Web crawling, social-network analysis, maze generation.

## References

- [cormen2009clrs] Cormen et al., *Introduction to Algorithms* (3rd ed.), §22.2–22.3.
- [sedgewick2011algorithms] Sedgewick & Wayne, *Algorithms* (4th ed.), §4.1.
- [tarjan1972dfs] Tarjan, "Depth-first search and linear graph algorithms", *SIAM J. Computing*, 1972.
