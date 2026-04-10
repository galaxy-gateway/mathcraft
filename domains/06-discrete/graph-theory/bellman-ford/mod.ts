/**
 * bellman-ford — Single-source shortest paths with negative edge weights.
 *
 * Unlike Dijkstra, Bellman–Ford handles negative weights and can detect
 * negative-weight cycles reachable from the source.
 *
 * @example
 * ```ts
 * import { bellmanFord } from "./mod.ts";
 * import { createGraph, addEdge } from "../graph.ts";
 * const g = createGraph(3, true);
 * addEdge(g, 0, 1, 4); addEdge(g, 0, 2, 5); addEdge(g, 1, 2, -3);
 * bellmanFord(g, 0); // { dist: [0, 4, 1], prev: [-1, 0, 1], hasNegativeCycle: false }
 * ```
 */

import type { Graph } from "../graph.ts";

/** Result of the Bellman–Ford algorithm. */
export interface BellmanFordResult {
  /** Shortest distance from start to each node (Infinity if unreachable). */
  dist: number[];
  /** Previous node on the shortest path (-1 for start / unreachable). */
  prev: number[];
  /** True if a negative-weight cycle is reachable from start. */
  hasNegativeCycle: boolean;
}

/**
 * Bellman–Ford algorithm from `start`.
 *
 * Performs V-1 relaxation passes over all edges, then one more pass to
 * detect negative cycles.
 *
 * Time: O(V * E).
 * Space: O(V).
 */
export function bellmanFord(g: Graph, start: number): BellmanFordResult {
  const { n } = g;
  const dist = new Array<number>(n).fill(Infinity);
  const prev = new Array<number>(n).fill(-1);
  dist[start] = 0;

  // Collect all edges for easy iteration.
  const edges: Array<[number, number, number]> = [];
  for (let u = 0; u < n; u++) {
    for (const { to: v, weight: w } of g.adj[u]) {
      edges.push([u, v, w]);
    }
  }

  // Relax all edges V-1 times.
  for (let i = 0; i < n - 1; i++) {
    let changed = false;
    for (const [u, v, w] of edges) {
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = u;
        changed = true;
      }
    }
    // Early termination: if no distance changed, we are done.
    if (!changed) break;
  }

  // One more pass to detect negative cycles.
  let hasNegativeCycle = false;
  for (const [u, v, w] of edges) {
    if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
      hasNegativeCycle = true;
      break;
    }
  }

  return { dist, prev, hasNegativeCycle };
}

/**
 * Reconstruct the shortest path from `start` to `end` using the
 * predecessor array.
 *
 * Returns null if `end` is unreachable.
 */
export function reconstructPath(prev: number[], start: number, end: number): number[] | null {
  if (prev[end] === -1 && end !== start) return null;
  const path: number[] = [];
  let cur = end;
  while (cur !== -1) {
    path.push(cur);
    cur = prev[cur];
  }
  path.reverse();
  return path;
}
