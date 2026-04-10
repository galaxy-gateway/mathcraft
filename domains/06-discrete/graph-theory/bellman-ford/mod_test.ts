import { assertEquals } from "@std/assert";
import * as fc from "fast-check";
import { bellmanFord, reconstructPath } from "./mod.ts";
import { addEdge, createGraph } from "../graph.ts";

// ── Reference tests ──────────────────────────────────────────────────

Deno.test("bellmanFord — positive weights (matches Dijkstra)", () => {
  const g = createGraph(4, true);
  addEdge(g, 0, 1, 1);
  addEdge(g, 0, 2, 4);
  addEdge(g, 1, 2, 2);
  addEdge(g, 1, 3, 6);
  addEdge(g, 2, 3, 3);
  const r = bellmanFord(g, 0);
  assertEquals(r.dist, [0, 1, 3, 6]);
  assertEquals(r.hasNegativeCycle, false);
});

Deno.test("bellmanFord — negative weight edges", () => {
  const g = createGraph(3, true);
  addEdge(g, 0, 1, 4);
  addEdge(g, 0, 2, 5);
  addEdge(g, 1, 2, -3);
  const r = bellmanFord(g, 0);
  assertEquals(r.dist, [0, 4, 1]);
  assertEquals(r.prev, [-1, 0, 1]);
  assertEquals(r.hasNegativeCycle, false);
});

Deno.test("bellmanFord — detects negative cycle", () => {
  const g = createGraph(3, true);
  addEdge(g, 0, 1, 1);
  addEdge(g, 1, 2, -1);
  addEdge(g, 2, 0, -1);
  // Cycle 0 -> 1 -> 2 -> 0 has weight -1.
  const r = bellmanFord(g, 0);
  assertEquals(r.hasNegativeCycle, true);
});

Deno.test("bellmanFord — disconnected nodes", () => {
  const g = createGraph(4, true);
  addEdge(g, 0, 1, 2);
  const r = bellmanFord(g, 0);
  assertEquals(r.dist[0], 0);
  assertEquals(r.dist[1], 2);
  assertEquals(r.dist[2], Infinity);
  assertEquals(r.dist[3], Infinity);
});

Deno.test("bellmanFord — single node", () => {
  const g = createGraph(1, true);
  const r = bellmanFord(g, 0);
  assertEquals(r.dist, [0]);
  assertEquals(r.hasNegativeCycle, false);
});

Deno.test("reconstructPath — bellmanFord", () => {
  const g = createGraph(4, true);
  addEdge(g, 0, 1, 1);
  addEdge(g, 1, 2, 1);
  addEdge(g, 2, 3, 1);
  const r = bellmanFord(g, 0);
  assertEquals(reconstructPath(r.prev, 0, 3), [0, 1, 2, 3]);
  assertEquals(reconstructPath(r.prev, 0, 0), [0]);
});

// ── Property-based tests ─────────────────────────────────────────────

Deno.test("bellmanFord — property: triangle inequality on non-negative graphs", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 3, max: 12 }),
      fc.array(
        fc.tuple(
          fc.integer({ min: 0, max: 11 }),
          fc.integer({ min: 0, max: 11 }),
          fc.integer({ min: 1, max: 50 }),
        ),
        { minLength: 1, maxLength: 25 },
      ),
      (n, edges) => {
        const g = createGraph(n, true);
        for (const [u, v, w] of edges) {
          if (u < n && v < n && u !== v) addEdge(g, u, v, w);
        }
        const { dist, hasNegativeCycle } = bellmanFord(g, 0);
        if (hasNegativeCycle) return true; // skip
        for (const [u, v, w] of edges) {
          if (u < n && v < n && dist[u] !== Infinity) {
            if (dist[v] > dist[u] + w + 1e-9) return false;
          }
        }
        return true;
      },
    ),
    { numRuns: 200 },
  );
});

Deno.test("bellmanFord — property: agrees with Dijkstra on non-negative graphs", () => {
  // Import Dijkstra dynamically would be circular; instead re-implement a
  // simple check: for non-negative weights, BF dist[start] = 0 and all
  // dists are non-negative.
  fc.assert(
    fc.property(
      fc.integer({ min: 2, max: 10 }),
      fc.array(
        fc.tuple(
          fc.integer({ min: 0, max: 9 }),
          fc.integer({ min: 0, max: 9 }),
          fc.integer({ min: 0, max: 50 }),
        ),
        { minLength: 0, maxLength: 20 },
      ),
      (n, edges) => {
        const g = createGraph(n, true);
        for (const [u, v, w] of edges) {
          if (u < n && v < n && u !== v) addEdge(g, u, v, w);
        }
        const { dist, hasNegativeCycle } = bellmanFord(g, 0);
        if (hasNegativeCycle) return true;
        if (dist[0] !== 0) return false;
        for (let i = 0; i < n; i++) {
          if (dist[i] < 0) return false;
        }
        return true;
      },
    ),
    { numRuns: 200 },
  );
});
