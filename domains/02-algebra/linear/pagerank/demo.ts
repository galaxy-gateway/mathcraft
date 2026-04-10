/**
 * Demo: PageRank on a small web graph.
 *
 * Run with: `deno task demo domains/02-algebra/linear/pagerank/demo.ts`
 */

import { emit } from "@math/core/viz";
import { Matrix } from "@math/core/linalg";
import { pagerank } from "./mod.ts";

// A small 4-page web graph:
//   0 -> 1, 2
//   1 -> 2
//   2 -> 0
//   3 -> 2
const A = Matrix.from([
  [0, 1, 1, 0],
  [0, 0, 1, 0],
  [1, 0, 0, 0],
  [0, 0, 1, 0],
]);

const ranks = pagerank(A, 0.85);

const labels = ["Page 0", "Page 1", "Page 2", "Page 3"];

emit({
  kind: "graph",
  title: "PageRank: Web Graph with 4 Pages",
  description: "PageRank scores for a small directed web graph. " +
    "Page 2 has the highest rank because it receives the most inbound links.",
  data: {
    directed: true,
    nodes: labels.map((label, i) => ({
      id: `${i}`,
      label: `${label} (${ranks.get(i).toFixed(4)})`,
      group: i,
    })),
    edges: [
      { source: "0", target: "1" },
      { source: "0", target: "2" },
      { source: "1", target: "2" },
      { source: "2", target: "0" },
      { source: "3", target: "2" },
    ],
  },
});
