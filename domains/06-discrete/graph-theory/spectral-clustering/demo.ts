/**
 * Demo: Spectral clustering on a small graph with two communities.
 *
 * Run with: `deno task demo domains/06-discrete/graph-theory/spectral-clustering/demo.ts`
 */

import { emit } from "@math/core/viz";
import { Matrix } from "@math/core/linalg";
import { spectralCluster } from "./mod.ts";

// A graph with two communities connected by a weak bridge:
//
//  Community A: 0—1, 0—2, 1—2
//  Community B: 3—4, 3—5, 4—5
//  Bridge: 2—3
//
const A = Matrix.from([
  [0, 1, 1, 0, 0, 0],
  [1, 0, 1, 0, 0, 0],
  [1, 1, 0, 1, 0, 0],
  [0, 0, 1, 0, 1, 1],
  [0, 0, 0, 1, 0, 1],
  [0, 0, 0, 1, 1, 0],
]);

const labels = spectralCluster(A, 2);

const positions: [number, number][] = [
  [0, 0],
  [1, 0],
  [0.5, 1],
  [2.5, 1],
  [3, 0],
  [3.5, 1],
];

const nodes = [];
for (let i = 0; i < 6; i++) {
  nodes.push({
    id: String(i),
    label: `${i} (cluster ${labels[i]})`,
    position: positions[i],
    group: labels[i],
  });
}

const edges = [
  { source: "0", target: "1" },
  { source: "0", target: "2" },
  { source: "1", target: "2" },
  { source: "2", target: "3", label: "bridge" },
  { source: "3", target: "4" },
  { source: "3", target: "5" },
  { source: "4", target: "5" },
];

emit({
  kind: "graph",
  title: "Spectral clustering: 2 communities",
  description: `Labels: [${labels.join(", ")}]. ` +
    "The Fiedler vector (2nd-smallest eigenvector of the Laplacian) " +
    "naturally separates the two densely-connected communities.",
  data: {
    directed: false,
    nodes,
    edges,
    highlight: {
      nodes: labels.map((_, i) => String(i)),
    },
  },
});
