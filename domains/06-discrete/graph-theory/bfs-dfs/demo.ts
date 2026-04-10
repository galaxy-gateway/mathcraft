/**
 * Demo: BFS and DFS on a small graph.
 *
 * Run with: `deno task demo domains/06-discrete/graph-theory/bfs-dfs/demo.ts`
 */

import { emit } from "@math/core/viz";
import { addEdge, createGraph } from "../graph.ts";
import { bfs, dfs } from "./mod.ts";

// Build a small undirected graph:
//   0 — 1 — 3
//   |       |
//   2 ——————4
const g = createGraph(5);
addEdge(g, 0, 1);
addEdge(g, 0, 2);
addEdge(g, 1, 3);
addEdge(g, 3, 4);
addEdge(g, 2, 4);

const bfsResult = bfs(g, 0);
const dfsResult = dfs(g, 0);

const nodes = [
  { id: "0", position: [0, 0] as [number, number] },
  { id: "1", position: [1, 0] as [number, number] },
  { id: "2", position: [0, 1] as [number, number] },
  { id: "3", position: [2, 0] as [number, number] },
  { id: "4", position: [2, 1] as [number, number] },
];

const edges = [
  { source: "0", target: "1" },
  { source: "0", target: "2" },
  { source: "1", target: "3" },
  { source: "3", target: "4" },
  { source: "2", target: "4" },
];

emit({
  kind: "graph",
  title: "BFS traversal from node 0",
  description: `Visit order: [${bfsResult.order.join(", ")}]. ` +
    `Parent tree: [${bfsResult.parent.join(", ")}].`,
  data: {
    directed: false,
    nodes,
    edges,
    highlight: { nodes: bfsResult.order.map(String) },
  },
});

emit({
  kind: "graph",
  title: "DFS traversal from node 0",
  description: `Visit order: [${dfsResult.order.join(", ")}]. ` +
    `Parent tree: [${dfsResult.parent.join(", ")}].`,
  data: {
    directed: false,
    nodes,
    edges,
    highlight: { nodes: dfsResult.order.map(String) },
  },
});
