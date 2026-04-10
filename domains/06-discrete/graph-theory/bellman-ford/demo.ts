/**
 * Demo: Bellman–Ford on a directed graph with negative edges.
 *
 * Run with: `deno task demo domains/06-discrete/graph-theory/bellman-ford/demo.ts`
 */

import { emit } from "@math/core/viz";
import { addEdge, createGraph } from "../graph.ts";
import { bellmanFord } from "./mod.ts";

// Directed graph with a negative-weight edge:
//   0 --(4)--> 1 --(-3)--> 2
//   |                       ^
//   +-------(5)-------------+
const g = createGraph(4, true);
addEdge(g, 0, 1, 4);
addEdge(g, 0, 2, 5);
addEdge(g, 1, 2, -3);
addEdge(g, 1, 3, 6);
addEdge(g, 2, 3, 2);

const result = bellmanFord(g, 0);

const nodes = [
  { id: "0", label: `0 (d=0)`, position: [0, 0] as [number, number] },
  { id: "1", label: `1 (d=${result.dist[1]})`, position: [1, 0] as [number, number] },
  { id: "2", label: `2 (d=${result.dist[2]})`, position: [2, 0] as [number, number] },
  { id: "3", label: `3 (d=${result.dist[3]})`, position: [3, 0] as [number, number] },
];

const edges = [
  { source: "0", target: "1", label: "4" },
  { source: "0", target: "2", label: "5" },
  { source: "1", target: "2", label: "-3" },
  { source: "1", target: "3", label: "6" },
  { source: "2", target: "3", label: "2" },
];

emit({
  kind: "graph",
  title: "Bellman-Ford: shortest paths from node 0",
  description: `Distances: [${result.dist.join(", ")}]. ` +
    `Negative cycle detected: ${result.hasNegativeCycle}. ` +
    `Path 0->1->2 has cost ${result.dist[2]} (via negative edge 1->2 with weight -3).`,
  data: {
    directed: true,
    nodes,
    edges,
    highlight: {
      nodes: ["0", "1", "2", "3"],
    },
  },
});
