/**
 * bfs-dfs — Breadth-first search and depth-first search on graphs.
 *
 * Both return the traversal order and a parent array that encodes
 * a spanning tree rooted at `start`.
 *
 * @example
 * ```ts
 * import { bfs, dfs } from "./mod.ts";
 * import { createGraph, addEdge } from "../graph.ts";
 * const g = createGraph(4);
 * addEdge(g, 0, 1); addEdge(g, 0, 2); addEdge(g, 1, 3);
 * bfs(g, 0); // { order: [0,1,2,3], parent: [-1,0,0,1] }
 * ```
 */

import type { Graph } from "../graph.ts";

/** Result of a BFS or DFS traversal. */
export interface TraversalResult {
  /** Nodes in the order they were first visited. */
  order: number[];
  /**
   * Parent of each node in the traversal tree.
   * `parent[start] === -1`; unreachable nodes have `parent[i] === -1`.
   */
  parent: number[];
}

/**
 * Breadth-first search from `start`.
 *
 * Visits all nodes reachable from `start` layer by layer. Returns the
 * visit order and the BFS tree encoded as a parent array.
 *
 * Time: O(V + E) — each vertex and edge is examined once.
 * Space: O(V) for the queue and visited set.
 */
export function bfs(g: Graph, start: number): TraversalResult {
  const visited = new Uint8Array(g.n); // 0 = unvisited, 1 = visited
  const parent = new Int32Array(g.n).fill(-1);
  const order: number[] = [];

  const queue: number[] = [start];
  visited[start] = 1;

  while (queue.length > 0) {
    const u = queue.shift()!;
    order.push(u);
    for (const { to } of g.adj[u]) {
      if (!visited[to]) {
        visited[to] = 1;
        parent[to] = u;
        queue.push(to);
      }
    }
  }

  return { order, parent: Array.from(parent) };
}

/**
 * Depth-first search from `start` (iterative, using an explicit stack).
 *
 * Visits all reachable nodes, going as deep as possible before
 * backtracking. The iterative version avoids stack overflow on large
 * graphs and mirrors the BFS API exactly.
 *
 * Time: O(V + E).
 * Space: O(V) for the stack and visited set.
 */
export function dfs(g: Graph, start: number): TraversalResult {
  const visited = new Uint8Array(g.n);
  const parent = new Int32Array(g.n).fill(-1);
  const order: number[] = [];

  const stack: number[] = [start];
  visited[start] = 1;

  while (stack.length > 0) {
    const u = stack.pop()!;
    order.push(u);
    // Iterate neighbours in reverse so the first neighbour is explored
    // first (matching recursive DFS visit order for sorted adjacency lists).
    for (let i = g.adj[u].length - 1; i >= 0; i--) {
      const v = g.adj[u][i].to;
      if (!visited[v]) {
        visited[v] = 1;
        parent[v] = u;
        stack.push(v);
      }
    }
  }

  return { order, parent: Array.from(parent) };
}
