/**
 * Vietoris–Rips complex and persistent homology (H₀).
 *
 * Given a point cloud, builds the Vietoris–Rips complex at every scale
 * parameter ε and tracks when connected components (H₀) are born and die.
 * This gives a *persistence barcode* summarizing the topological structure
 * of the data across scales.
 *
 * For simplicity this implements only H₀ (connected components) via
 * union-find. H₁ (loops) and higher require a full boundary matrix
 * reduction — a natural Phase 3 extension.
 *
 * @example
 * ```ts
 * import { persistentH0 } from "./mod.ts";
 * const pts = [[0,0], [1,0], [5,5], [5,6]];
 * persistentH0(pts);
 * // Returns bars like [{birth: 0, death: 1}, {birth: 0, death: 1.41}, {birth: 0, death: Infinity}]
 * ```
 */

export interface Bar {
  /** Scale at which this feature is born. */
  birth: number;
  /** Scale at which it dies (merges). Infinity for the last component. */
  death: number;
}

/** Euclidean distance between two points. */
function dist(a: readonly number[], b: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

/** Union-Find with path compression and union by rank. */
class UnionFind {
  parent: number[];
  rank: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }
  find(x: number): number {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(x: number, y: number): boolean {
    const rx = this.find(x);
    const ry = this.find(y);
    if (rx === ry) return false;
    if (this.rank[rx] < this.rank[ry]) this.parent[rx] = ry;
    else if (this.rank[rx] > this.rank[ry]) this.parent[ry] = rx;
    else {
      this.parent[ry] = rx;
      this.rank[rx]++;
    }
    return true;
  }
}

/**
 * Compute the H₀ persistence barcode of a point cloud.
 *
 * Every point starts as its own connected component (born at ε = 0).
 * Edges are added in order of increasing weight; when an edge merges two
 * components, the younger one "dies" at the current edge weight.
 *
 * Returns `n` bars. One has `death = Infinity` (the surviving component);
 * the rest have finite death times.
 */
export function persistentH0(points: readonly (readonly number[])[]): Bar[] {
  const n = points.length;
  if (n === 0) return [];

  // Compute all pairwise distances and sort edges.
  const edges: Array<{ i: number; j: number; d: number }> = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      edges.push({ i, j, d: dist(points[i], points[j]) });
    }
  }
  edges.sort((a, b) => a.d - b.d);

  // Birth time of each component = 0 (every point is born at ε = 0).
  const birthTime = new Array(n).fill(0);
  const uf = new UnionFind(n);
  const bars: Bar[] = [];

  for (const { i, j, d } of edges) {
    const ri = uf.find(i);
    const rj = uf.find(j);
    if (ri === rj) continue;

    // The younger component dies. By convention: the one born later,
    // or if tied, the higher-index root.
    const [dies, survives] =
      birthTime[ri] > birthTime[rj] || (birthTime[ri] === birthTime[rj] && ri > rj)
        ? [ri, rj]
        : [rj, ri];

    bars.push({ birth: birthTime[dies], death: d });
    uf.union(survives, dies);
    // The surviving component keeps its birth time.
    const root = uf.find(survives);
    birthTime[root] = birthTime[survives];
  }

  // The last surviving component has infinite death.
  const root = uf.find(0);
  bars.push({ birth: birthTime[root], death: Infinity });

  return bars;
}

/**
 * Build the Vietoris–Rips 1-skeleton (edge list) at radius `epsilon`.
 *
 * An edge (i, j) exists iff dist(points[i], points[j]) ≤ epsilon.
 */
export function ripsEdges(
  points: readonly (readonly number[])[],
  epsilon: number,
): Array<[number, number, number]> {
  const out: Array<[number, number, number]> = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const d = dist(points[i], points[j]);
      if (d <= epsilon) out.push([i, j, d]);
    }
  }
  return out;
}
