# A* Search — Heuristic shortest-path finding

## TL;DR

A* finds the shortest path from a start node to a goal by combining
actual distance travelled (g-score) with a heuristic estimate of
remaining distance (h-score). With an admissible heuristic, A* is
optimal and typically much faster than Dijkstra.

## Intuition

Dijkstra explores uniformly in all directions, like an expanding circle.
A* biases the search toward the goal by asking "how far do I think I
still have to go?" at each node. If the estimate is always optimistic
(never overshoots), the first time we reach the goal it is guaranteed to
be via the shortest path.

On a grid, Manhattan distance is the classic admissible heuristic: it
counts the minimum moves ignoring obstacles, so it never overestimates.

## Statement

Given:
- A graph G = (V, E, w) with w(e) >= 0,
- A source s and goal t,
- An admissible heuristic h: V -> R with h(v) <= d*(v, t) for all v,

A* returns a shortest s-t path, or null if t is unreachable.

## Algorithm

```
function A*(G, s, t, h):
    g[s] ← 0;  f[s] ← h(s)
    open ← priority queue with (f[s], s)
    closed ← empty set
    while open not empty:
        u ← open.extractMin()
        if u = t: return reconstructPath(prev, s, t)
        closed.add(u)
        for each edge (u, v, w):
            if v in closed: continue
            tentative ← g[u] + w
            if tentative < g[v]:
                g[v] ← tentative
                f[v] ← tentative + h(v)
                prev[v] ← u
                open.insert(f[v], v)
    return null
```

See [`mod.ts`](./mod.ts) for the runnable implementation with grid
helpers and Manhattan heuristic.

## Proof or justification

**Optimality with admissible h.** When A* pops the goal from the open
set, g[t] = d*(s, t). Proof: suppose a shorter path exists through some
open node x. Then f(x) = g(x) + h(x) <= g(x) + d*(x, t) = d*(s, t) via x,
which is less than g[t]. But x would have been extracted before t —
contradiction.

**Consistency (monotonicity).** If h also satisfies h(u) <= w(u,v) + h(v)
for all edges, then g-scores are finalized when nodes are closed, and
the algorithm never re-opens a node. Manhattan distance is consistent.

## Complexity

- Time: O((V + E) log V) worst case (same as Dijkstra), but typically
  much less due to heuristic pruning.
- Space: O(V) for the open/closed sets.
- Best case (perfect heuristic): O(d) where d is the path length.

## Applications

- Video game pathfinding (grids, navmeshes).
- Robot motion planning.
- Route finding in road networks (with landmark heuristics).
- Puzzle solving (15-puzzle, Rubik's cube).
- Any goal-directed search where a distance estimate is available.

## References

- [hart1968astar] Hart, Nilsson, Raphael, "A formal basis for the heuristic determination of minimum cost paths", *IEEE Trans. SSC*, 1968.
- [cormen2009clrs] Cormen et al., *Introduction to Algorithms* (3rd ed.), Problem 24-3.
- [russell2010ai] Russell & Norvig, *Artificial Intelligence: A Modern Approach* (3rd ed.), §3.5.
