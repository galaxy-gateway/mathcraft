/**
 * Demo: A* search on a 5x5 grid with obstacles.
 *
 * Run with: `deno task demo domains/06-discrete/graph-theory/a-star/demo.ts`
 */

import { emit } from "@math/core/viz";
import { aStar, createGridGraph, manhattanHeuristic } from "./mod.ts";

const rows = 5;
const cols = 5;

// Block some cells to create a wall.
//   S . . . .
//   . X X X .
//   . . . X .
//   . X . . .
//   . . . . G
const blocked = new Set([6, 7, 8, 13, 16]);
const grid = createGridGraph(rows, cols, blocked);

const start = 0;
const goal = 24;
const h = manhattanHeuristic(4, 4, cols);
const path = aStar(grid, start, goal, h);

// Build visualization nodes.
const nodes = [];
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const id = r * cols + c;
    const label = blocked.has(id) ? "X" : id === start ? "S" : id === goal ? "G" : String(id);
    nodes.push({
      id: String(id),
      label,
      position: [c, r] as [number, number],
      group: blocked.has(id) ? "wall" : "open",
    });
  }
}

// Build edges (only between open neighbours).
const edges = [];
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const u = r * cols + c;
    if (blocked.has(u)) continue;
    // Right neighbour.
    if (c + 1 < cols && !blocked.has(u + 1)) {
      edges.push({ source: String(u), target: String(u + 1) });
    }
    // Down neighbour.
    if (r + 1 < rows && !blocked.has(u + cols)) {
      edges.push({ source: String(u), target: String(u + cols) });
    }
  }
}

const highlightEdges: [string, string][] = [];
if (path) {
  for (let i = 0; i < path.length - 1; i++) {
    highlightEdges.push([String(path[i]), String(path[i + 1])]);
  }
}

emit({
  kind: "graph",
  title: "A* search on a 5x5 grid",
  description: path
    ? `Path found (${path.length - 1} steps): [${path.join(" -> ")}].`
    : "No path found!",
  data: {
    directed: false,
    nodes,
    edges,
    highlight: {
      nodes: path?.map(String) ?? [],
      edges: highlightEdges,
    },
  },
});
