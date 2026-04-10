/**
 * Demo: Dijkstra's shortest-path algorithm on a small weighted graph.
 *
 * Run with: `deno task demo domains/06-discrete/graph-theory/dijkstra/demo.ts`
 */

import { emit } from "@math/core/viz";
import { addEdge, createGraph } from "../graph.ts";
import { dijkstra, reconstructPath } from "./mod.ts";

// Weighted graph:
//   0 —(4)— 1 —(1)— 3
//   |               |
//  (2)             (3)
//   |               |
//   2 ——(5)——————— 4
const g = createGraph(5);
addEdge(g, 0, 1, 4);
addEdge(g, 0, 2, 2);
addEdge(g, 1, 3, 1);
addEdge(g, 3, 4, 3);
addEdge(g, 2, 4, 5);

const result = dijkstra(g, 0);
const pathTo4 = reconstructPath(result.prev, 0, 4)!;

const nodes = [
  { id: "0", label: "0 (d=0)", position: [0, 0] as [number, number] },
  { id: "1", label: `1 (d=${result.dist[1]})`, position: [1, 0] as [number, number] },
  { id: "2", label: `2 (d=${result.dist[2]})`, position: [0, 1] as [number, number] },
  { id: "3", label: `3 (d=${result.dist[3]})`, position: [2, 0] as [number, number] },
  { id: "4", label: `4 (d=${result.dist[4]})`, position: [2, 1] as [number, number] },
];

const edges = [
  { source: "0", target: "1", weight: 4, label: "4" },
  { source: "0", target: "2", weight: 2, label: "2" },
  { source: "1", target: "3", weight: 1, label: "1" },
  { source: "3", target: "4", weight: 3, label: "3" },
  { source: "2", target: "4", weight: 5, label: "5" },
];

// Highlight shortest-path edges to node 4.
const highlightEdges: [string, string][] = [];
for (let i = 0; i < pathTo4.length - 1; i++) {
  highlightEdges.push([String(pathTo4[i]), String(pathTo4[i + 1])]);
}

emit({
  kind: "graph",
  title: "Dijkstra: shortest paths from node 0",
  description: `Distances: [${result.dist.join(", ")}]. ` +
    `Shortest path to 4: [${pathTo4.join(" → ")}] with cost ${result.dist[4]}.`,
  data: {
    directed: false,
    nodes,
    edges,
    highlight: {
      nodes: pathTo4.map(String),
      edges: highlightEdges,
    },
  },
});
