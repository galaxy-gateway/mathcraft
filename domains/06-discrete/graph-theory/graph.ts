/**
 * graph.ts — Shared graph types and construction helpers for graph-theory concepts.
 *
 * All graph algorithms in this directory share these types. Graphs are
 * represented as adjacency lists, which is efficient for sparse graphs
 * and the most common representation in algorithm textbooks.
 *
 * @example
 * ```ts
 * import { createGraph, addEdge } from "./graph.ts";
 * const g = createGraph(4);
 * addEdge(g, 0, 1, 3);
 * addEdge(g, 1, 2, 5);
 * ```
 */

/** A single directed edge with a numeric weight. */
export interface Edge {
  to: number;
  weight: number;
}

/**
 * An adjacency-list graph.
 *
 * - `n`: number of nodes (labelled 0..n-1).
 * - `adj[u]`: list of edges leaving node `u`.
 * - `directed`: if false, `addEdge` inserts edges in both directions.
 */
export interface Graph {
  n: number;
  adj: Edge[][];
  directed: boolean;
}

/**
 * Create an empty graph with `n` nodes.
 *
 * @param n Number of nodes (labelled 0 through n-1).
 * @param directed If true, edges go one way only. Default: false (undirected).
 */
export function createGraph(n: number, directed = false): Graph {
  const adj: Edge[][] = [];
  for (let i = 0; i < n; i++) adj.push([]);
  return { n, adj, directed };
}

/**
 * Add an edge from `u` to `v` with optional weight (default 1).
 *
 * For undirected graphs the reverse edge `v → u` is added automatically.
 */
export function addEdge(g: Graph, u: number, v: number, w = 1): void {
  g.adj[u].push({ to: v, weight: w });
  if (!g.directed) {
    g.adj[v].push({ to: u, weight: w });
  }
}
