/**
 * Demo: Edmonds–Karp max-flow on a small network.
 *
 * Run with: `deno task demo domains/06-discrete/graph-theory/edmonds-karp/demo.ts`
 */

import { emit } from "@math/core/viz";
import { addCapacityEdge, createCapacityGraph, maxFlow, minCutSourceSide } from "./mod.ts";

// Network:
//         10       10
//   S(0) ----> 1 ----> T(3)
//    |                  ^
//    |----> 2 ----> 3 --+
//      10       10
//
// Actually let's use the CLRS-like example:
//   0 --(16)--> 1 --(12)--> 3 --(20)--> 5
//   0 --(13)--> 2 --(14)--> 4 --(4)---> 5
//   Plus cross-edges: 1->2(4), 2->1(10), 3->2(9), 4->3(7)
const g = createCapacityGraph(6);
const edgeList: [number, number, number][] = [
  [0, 1, 16],
  [0, 2, 13],
  [1, 2, 4],
  [1, 3, 12],
  [2, 1, 10],
  [2, 4, 14],
  [3, 2, 9],
  [3, 5, 20],
  [4, 3, 7],
  [4, 5, 4],
];

// Save original capacities for display.
const origCap: Record<string, number> = {};
for (const [u, v, c] of edgeList) {
  addCapacityEdge(g, u, v, c);
  origCap[`${u}-${v}`] = c;
}

const flow = maxFlow(g, 0, 5);
const sourceSide = minCutSourceSide(g, 0);

const nodes = [
  { id: "0", label: "S", position: [0, 0.5] as [number, number] },
  { id: "1", label: "1", position: [1, 0] as [number, number] },
  { id: "2", label: "2", position: [1, 1] as [number, number] },
  { id: "3", label: "3", position: [2, 0] as [number, number] },
  { id: "4", label: "4", position: [2, 1] as [number, number] },
  { id: "5", label: "T", position: [3, 0.5] as [number, number] },
];

const edges = edgeList.map(([u, v]) => ({
  source: String(u),
  target: String(v),
  label: String(origCap[`${u}-${v}`]),
}));

emit({
  kind: "graph",
  title: `Edmonds-Karp max-flow = ${flow}`,
  description: `Maximum flow from S(0) to T(5) is ${flow}. ` +
    `Min-cut source side: {${[...sourceSide].sort().join(", ")}}.`,
  data: {
    directed: true,
    nodes,
    edges,
    highlight: {
      nodes: [...sourceSide].map(String),
    },
  },
});
