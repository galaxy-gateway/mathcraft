/**
 * edmonds-karp — Maximum flow via BFS-based augmenting paths.
 *
 * The Edmonds–Karp algorithm is the BFS variant of Ford–Fulkerson. It
 * finds max-flow in O(V * E^2) time by always augmenting along a
 * shortest (fewest-edges) path in the residual graph.
 *
 * @example
 * ```ts
 * import { maxFlow, createCapacityGraph, addCapacityEdge } from "./mod.ts";
 * const g = createCapacityGraph(4);
 * addCapacityEdge(g, 0, 1, 10);
 * addCapacityEdge(g, 0, 2, 10);
 * addCapacityEdge(g, 1, 3, 10);
 * addCapacityEdge(g, 2, 3, 10);
 * maxFlow(g, 0, 3); // 20
 * ```
 */

/**
 * A capacity graph using an adjacency-matrix representation.
 *
 * We use a separate type from the shared `Graph` because max-flow
 * algorithms need mutable residual capacities, which adjacency matrices
 * handle more cleanly.
 */
export interface CapacityGraph {
  n: number;
  /** capacity[u][v] = remaining capacity of edge u -> v. */
  capacity: number[][];
}

/** Create an empty directed capacity graph with n nodes. */
export function createCapacityGraph(n: number): CapacityGraph {
  const capacity: number[][] = [];
  for (let i = 0; i < n; i++) {
    capacity.push(new Array(n).fill(0));
  }
  return { n, capacity };
}

/**
 * Add a directed edge with the given capacity.
 *
 * If the edge already exists, the capacity is *added* to the existing
 * value (allowing parallel edges to be represented).
 */
export function addCapacityEdge(g: CapacityGraph, u: number, v: number, cap: number): void {
  g.capacity[u][v] += cap;
}

/**
 * Compute the maximum flow from `source` to `sink` using Edmonds–Karp.
 *
 * Modifies the capacity graph in-place (residual graph after flow).
 * Returns the total flow value.
 *
 * Time: O(V * E^2).
 * Space: O(V^2) for the capacity matrix.
 */
export function maxFlow(g: CapacityGraph, source: number, sink: number): number {
  let totalFlow = 0;

  // Repeat: find augmenting path via BFS, push flow.
  while (true) {
    const parent = bfsAugmentingPath(g, source, sink);
    if (parent === null) break; // No more augmenting paths.

    // Find bottleneck capacity along the path.
    let bottleneck = Infinity;
    let v = sink;
    while (v !== source) {
      const u = parent[v];
      bottleneck = Math.min(bottleneck, g.capacity[u][v]);
      v = u;
    }

    // Update residual capacities.
    v = sink;
    while (v !== source) {
      const u = parent[v];
      g.capacity[u][v] -= bottleneck;
      g.capacity[v][u] += bottleneck; // reverse edge
      v = u;
    }

    totalFlow += bottleneck;
  }

  return totalFlow;
}

/**
 * BFS to find an augmenting path in the residual graph.
 *
 * Returns a parent array encoding the path, or null if sink is
 * unreachable from source.
 */
function bfsAugmentingPath(
  g: CapacityGraph,
  source: number,
  sink: number,
): Int32Array | null {
  const parent = new Int32Array(g.n).fill(-1);
  const visited = new Uint8Array(g.n);
  visited[source] = 1;
  const queue: number[] = [source];

  while (queue.length > 0) {
    const u = queue.shift()!;
    for (let v = 0; v < g.n; v++) {
      if (!visited[v] && g.capacity[u][v] > 0) {
        visited[v] = 1;
        parent[v] = u;
        if (v === sink) return parent;
        queue.push(v);
      }
    }
  }

  return null; // sink not reachable
}

/**
 * Compute the minimum cut after running maxFlow.
 *
 * Returns the set of nodes reachable from source in the residual graph
 * (the "source side" of the min-cut).
 */
export function minCutSourceSide(g: CapacityGraph, source: number): Set<number> {
  const visited = new Set<number>();
  const queue: number[] = [source];
  visited.add(source);

  while (queue.length > 0) {
    const u = queue.shift()!;
    for (let v = 0; v < g.n; v++) {
      if (!visited.has(v) && g.capacity[u][v] > 0) {
        visited.add(v);
        queue.push(v);
      }
    }
  }

  return visited;
}
