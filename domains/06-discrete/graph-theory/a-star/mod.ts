/**
 * a-star — A* search algorithm for shortest paths with a heuristic.
 *
 * A* extends Dijkstra by adding a heuristic function h(v) that estimates
 * the remaining cost to the goal. With an admissible heuristic (never
 * overestimates), A* is guaranteed to find the optimal path while
 * exploring fewer nodes than Dijkstra.
 *
 * @example
 * ```ts
 * import { aStar } from "./mod.ts";
 * import { createGraph, addEdge } from "../graph.ts";
 * const g = createGraph(3);
 * addEdge(g, 0, 1, 1); addEdge(g, 1, 2, 1);
 * aStar(g, 0, 2, () => 0); // [0, 1, 2]
 * ```
 */

import type { Graph } from "../graph.ts";

/**
 * A* search from `start` to `goal`.
 *
 * @param g       The graph.
 * @param start   Source node.
 * @param goal    Target node.
 * @param h       Heuristic function: `h(v)` estimates cost from v to goal.
 *                Must be admissible (h(v) <= true cost) for optimality.
 * @returns       The shortest path as an array of node indices, or null
 *                if goal is unreachable.
 */
export function aStar(
  g: Graph,
  start: number,
  goal: number,
  h: (node: number) => number,
): number[] | null {
  const gScore = new Array<number>(g.n).fill(Infinity);
  const fScore = new Array<number>(g.n).fill(Infinity);
  const prev = new Array<number>(g.n).fill(-1);
  const closed = new Uint8Array(g.n);

  gScore[start] = 0;
  fScore[start] = h(start);

  // Open set as a min-heap keyed by fScore.
  const heap = new MinHeap();
  heap.push(fScore[start], start);

  while (heap.size > 0) {
    const [, u] = heap.pop()!;

    if (u === goal) {
      return buildPath(prev, start, goal);
    }

    if (closed[u]) continue;
    closed[u] = 1;

    for (const { to: v, weight: w } of g.adj[u]) {
      if (closed[v]) continue;
      const tentative = gScore[u] + w;
      if (tentative < gScore[v]) {
        gScore[v] = tentative;
        fScore[v] = tentative + h(v);
        prev[v] = u;
        heap.push(fScore[v], v);
      }
    }
  }

  return null; // goal unreachable
}

/** Reconstruct path by following prev pointers. */
function buildPath(prev: number[], start: number, goal: number): number[] {
  const path: number[] = [];
  let cur = goal;
  while (cur !== -1) {
    path.push(cur);
    if (cur === start) break;
    cur = prev[cur];
  }
  path.reverse();
  return path;
}

/**
 * Create a Manhattan-distance heuristic for a grid graph.
 *
 * Nodes are numbered row-major: node = row * cols + col.
 */
export function manhattanHeuristic(
  goalRow: number,
  goalCol: number,
  cols: number,
): (node: number) => number {
  return (node: number) => {
    const r = Math.floor(node / cols);
    const c = node % cols;
    return Math.abs(r - goalRow) + Math.abs(c - goalCol);
  };
}

/**
 * Build a grid graph where each cell connects to its 4-neighbours.
 *
 * @param rows    Number of rows.
 * @param cols    Number of columns.
 * @param blocked Set of node indices that are impassable walls.
 */
export function createGridGraph(
  rows: number,
  cols: number,
  blocked: Set<number> = new Set(),
): Graph {
  const n = rows * cols;
  const adj: { to: number; weight: number }[][] = [];
  for (let i = 0; i < n; i++) adj.push([]);

  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u = r * cols + c;
      if (blocked.has(u)) continue;
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const v = nr * cols + nc;
          if (!blocked.has(v)) {
            adj[u].push({ to: v, weight: 1 });
          }
        }
      }
    }
  }

  return { n, adj, directed: false };
}

// ── Binary min-heap ──────────────────────────────────────────────────

class MinHeap {
  private keys: number[] = [];
  private vals: number[] = [];

  get size(): number {
    return this.keys.length;
  }

  push(key: number, val: number): void {
    this.keys.push(key);
    this.vals.push(val);
    this.#bubbleUp(this.keys.length - 1);
  }

  pop(): [number, number] | undefined {
    if (this.keys.length === 0) return undefined;
    const topKey = this.keys[0];
    const topVal = this.vals[0];
    const n = this.keys.length - 1;
    if (n > 0) {
      this.keys[0] = this.keys[n];
      this.vals[0] = this.vals[n];
    }
    this.keys.pop();
    this.vals.pop();
    if (this.keys.length > 0) this.#sinkDown(0);
    return [topKey, topVal];
  }

  #bubbleUp(i: number): void {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.keys[p] <= this.keys[i]) break;
      this.#swap(i, p);
      i = p;
    }
  }

  #sinkDown(i: number): void {
    const n = this.keys.length;
    while (true) {
      let min = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && this.keys[l] < this.keys[min]) min = l;
      if (r < n && this.keys[r] < this.keys[min]) min = r;
      if (min === i) break;
      this.#swap(i, min);
      i = min;
    }
  }

  #swap(a: number, b: number): void {
    [this.keys[a], this.keys[b]] = [this.keys[b], this.keys[a]];
    [this.vals[a], this.vals[b]] = [this.vals[b], this.vals[a]];
  }
}
