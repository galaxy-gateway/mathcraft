/**
 * dijkstra — Single-source shortest paths for non-negative edge weights.
 *
 * Uses a binary min-heap priority queue for O((V + E) log V) time.
 *
 * @example
 * ```ts
 * import { dijkstra } from "./mod.ts";
 * import { createGraph, addEdge } from "../graph.ts";
 * const g = createGraph(4);
 * addEdge(g, 0, 1, 1); addEdge(g, 1, 2, 2); addEdge(g, 0, 2, 5);
 * dijkstra(g, 0); // { dist: [0, 1, 3, Infinity], prev: [-1, 0, 1, -1] }
 * ```
 */

import type { Graph } from "../graph.ts";

/** Result of Dijkstra's algorithm. */
export interface DijkstraResult {
  /** Shortest distance from start to each node (Infinity if unreachable). */
  dist: number[];
  /** Previous node on the shortest path (-1 for start / unreachable). */
  prev: number[];
}

/**
 * Dijkstra's algorithm from `start`.
 *
 * Requires all edge weights >= 0. Returns shortest-path distances and
 * a predecessor array from which any shortest path can be reconstructed.
 */
export function dijkstra(g: Graph, start: number): DijkstraResult {
  const dist = new Array<number>(g.n).fill(Infinity);
  const prev = new Array<number>(g.n).fill(-1);
  dist[start] = 0;

  // Min-heap of [distance, node].
  const heap = new MinHeap();
  heap.push(0, start);

  while (heap.size > 0) {
    const [d, u] = heap.pop()!;
    // Skip stale entries.
    if (d > dist[u]) continue;

    for (const { to: v, weight: w } of g.adj[u]) {
      const nd = d + w;
      if (nd < dist[v]) {
        dist[v] = nd;
        prev[v] = u;
        heap.push(nd, v);
      }
    }
  }

  return { dist, prev };
}

/**
 * Reconstruct the shortest path from `start` to `end` using the
 * predecessor array returned by `dijkstra`.
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

// ── Binary min-heap ──────────────────────────────────────────────────

/** A simple binary min-heap keyed by distance. */
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
