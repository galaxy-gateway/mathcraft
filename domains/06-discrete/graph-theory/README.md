# 06.graph-theory — Graph theory

> **Flagship deep-dive.** Fully populated reference for the per-concept pattern.

Graphs are the universal abstraction for relations. They model social networks,
road systems, dependency graphs, molecules, web pages, and state machines.

## Concepts

| Concept                                      | Summary                                 |
| -------------------------------------------- | --------------------------------------- |
| [`bfs-dfs/`](./bfs-dfs/)                     | Breadth-first and depth-first traversal |
| [`dijkstra/`](./dijkstra/)                   | Shortest paths with non-negative weights |
| [`a-star/`](./a-star/)                       | Heuristic shortest paths                |
| [`bellman-ford/`](./bellman-ford/)           | Shortest paths allowing negative weights |
| [`edmonds-karp/`](./edmonds-karp/)           | Maximum flow via BFS-augmenting paths   |
| [`spectral-clustering/`](./spectral-clustering/) | Graph Laplacian eigenvector clustering |

All concepts operate on a shared `Graph` type defined in [`mod.ts`](./graph.ts).
