import { assertEquals } from "@std/assert";
import * as fc from "fast-check";
import { dijkstra, reconstructPath } from "./mod.ts";
import { addEdge, createGraph } from "../graph.ts";

Deno.test("dijkstra — simple triangle", () => {
  // 0 —1— 1 —2— 2, 0 —5— 2
  const g = createGraph(3);
  addEdge(g, 0, 1, 1);
  addEdge(g, 1, 2, 2);
  addEdge(g, 0, 2, 5);
  const r = dijkstra(g, 0);
  assertEquals(r.dist, [0, 1, 3]);
  assertEquals(r.prev, [-1, 0, 1]);
});

Deno.test("dijkstra — disconnected graph", () => {
  const g = createGraph(4);
  addEdge(g, 0, 1, 2);
  // 2 and 3 are isolated.
  const r = dijkstra(g, 0);
  assertEquals(r.dist[0], 0);
  assertEquals(r.dist[1], 2);
  assertEquals(r.dist[2], Infinity);
  assertEquals(r.dist[3], Infinity);
});

Deno.test("dijkstra — single node", () => {
  const g = createGraph(1);
  const r = dijkstra(g, 0);
  assertEquals(r.dist, [0]);
  assertEquals(r.prev, [-1]);
});

Deno.test("dijkstra — directed graph", () => {
  const g = createGraph(3, true);
  addEdge(g, 0, 1, 1);
  addEdge(g, 1, 2, 1);
  // No edge from 2 back to 0.
  const r = dijkstra(g, 0);
  assertEquals(r.dist, [0, 1, 2]);
});

Deno.test("reconstructPath — basic", () => {
  const g = createGraph(4);
  addEdge(g, 0, 1, 1);
  addEdge(g, 1, 2, 1);
  addEdge(g, 2, 3, 1);
  const r = dijkstra(g, 0);
  assertEquals(reconstructPath(r.prev, 0, 3), [0, 1, 2, 3]);
  assertEquals(reconstructPath(r.prev, 0, 0), [0]);
});

Deno.test("reconstructPath — unreachable returns null", () => {
  const g = createGraph(3);
  addEdge(g, 0, 1, 1);
  const r = dijkstra(g, 0);
  assertEquals(reconstructPath(r.prev, 0, 2), null);
});

// ── Property-based tests ─────────────────────────────────────────────

Deno.test("dijkstra — property: triangle inequality", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 3, max: 15 }),
      fc.array(
        fc.tuple(
          fc.integer({ min: 0, max: 14 }),
          fc.integer({ min: 0, max: 14 }),
          fc.integer({ min: 1, max: 100 }),
        ),
        { minLength: 1, maxLength: 30 },
      ),
      (n, edges) => {
        const g = createGraph(n);
        for (const [u, v, w] of edges) {
          if (u < n && v < n && u !== v) addEdge(g, u, v, w);
        }
        const { dist } = dijkstra(g, 0);
        // For every edge (u, v, w): dist[v] <= dist[u] + w.
        for (const [u, v, w] of edges) {
          if (u < n && v < n) {
            if (dist[u] !== Infinity) {
              if (dist[v] > dist[u] + w + 1e-9) return false;
            }
          }
        }
        return true;
      },
    ),
    { numRuns: 200 },
  );
});

Deno.test("dijkstra — property: dist[start] = 0", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 20 }),
      (n) => {
        const g = createGraph(n);
        return dijkstra(g, 0).dist[0] === 0;
      },
    ),
    { numRuns: 50 },
  );
});
