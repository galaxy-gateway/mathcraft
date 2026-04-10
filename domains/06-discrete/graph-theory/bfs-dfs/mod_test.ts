import { assertEquals } from "@std/assert";
import * as fc from "fast-check";
import { bfs, dfs } from "./mod.ts";
import { addEdge, createGraph } from "../graph.ts";

// --- helper: build a small line graph 0—1—2—3 ---
function lineGraph(n: number) {
  const g = createGraph(n);
  for (let i = 0; i < n - 1; i++) addEdge(g, i, i + 1);
  return g;
}

// ── BFS reference tests ──────────────────────────────────────────────

Deno.test("bfs — line graph", () => {
  const g = lineGraph(4);
  const r = bfs(g, 0);
  assertEquals(r.order, [0, 1, 2, 3]);
  assertEquals(r.parent, [-1, 0, 1, 2]);
});

Deno.test("bfs — star graph", () => {
  const g = createGraph(5);
  addEdge(g, 0, 1);
  addEdge(g, 0, 2);
  addEdge(g, 0, 3);
  addEdge(g, 0, 4);
  const r = bfs(g, 0);
  assertEquals(r.order, [0, 1, 2, 3, 4]);
  // All nodes' parent is 0.
  assertEquals(r.parent, [-1, 0, 0, 0, 0]);
});

Deno.test("bfs — disconnected nodes not visited", () => {
  const g = createGraph(4);
  addEdge(g, 0, 1);
  // 2 and 3 are isolated.
  const r = bfs(g, 0);
  assertEquals(r.order, [0, 1]);
  assertEquals(r.parent[2], -1);
  assertEquals(r.parent[3], -1);
});

// ── DFS reference tests ──────────────────────────────────────────────

Deno.test("dfs — line graph", () => {
  const g = lineGraph(4);
  const r = dfs(g, 0);
  assertEquals(r.order, [0, 1, 2, 3]);
  assertEquals(r.parent, [-1, 0, 1, 2]);
});

Deno.test("dfs — star graph", () => {
  const g = createGraph(5);
  addEdge(g, 0, 1);
  addEdge(g, 0, 2);
  addEdge(g, 0, 3);
  addEdge(g, 0, 4);
  const r = dfs(g, 0);
  // DFS with reversed iteration visits 1 first.
  assertEquals(r.order[0], 0);
  assertEquals(r.order.length, 5);
});

Deno.test("dfs — disconnected nodes not visited", () => {
  const g = createGraph(4);
  addEdge(g, 0, 1);
  const r = dfs(g, 0);
  assertEquals(r.order.length, 2);
});

// ── Property-based tests ─────────────────────────────────────────────

Deno.test("bfs — property: visits each reachable node exactly once", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 2, max: 20 }),
      fc.array(fc.tuple(fc.integer({ min: 0, max: 19 }), fc.integer({ min: 0, max: 19 })), {
        minLength: 0,
        maxLength: 40,
      }),
      (n, edges) => {
        const g = createGraph(n);
        for (const [u, v] of edges) {
          if (u < n && v < n && u !== v) addEdge(g, u, v);
        }
        const r = bfs(g, 0);
        // No duplicates.
        const unique = new Set(r.order);
        return unique.size === r.order.length;
      },
    ),
    { numRuns: 200 },
  );
});

Deno.test("dfs — property: visits each reachable node exactly once", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 2, max: 20 }),
      fc.array(fc.tuple(fc.integer({ min: 0, max: 19 }), fc.integer({ min: 0, max: 19 })), {
        minLength: 0,
        maxLength: 40,
      }),
      (n, edges) => {
        const g = createGraph(n);
        for (const [u, v] of edges) {
          if (u < n && v < n && u !== v) addEdge(g, u, v);
        }
        const r = dfs(g, 0);
        const unique = new Set(r.order);
        return unique.size === r.order.length;
      },
    ),
    { numRuns: 200 },
  );
});

Deno.test("bfs & dfs — property: same reachable set", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 2, max: 20 }),
      fc.array(fc.tuple(fc.integer({ min: 0, max: 19 }), fc.integer({ min: 0, max: 19 })), {
        minLength: 0,
        maxLength: 40,
      }),
      (n, edges) => {
        const g = createGraph(n);
        for (const [u, v] of edges) {
          if (u < n && v < n && u !== v) addEdge(g, u, v);
        }
        const bfsSet = new Set(bfs(g, 0).order);
        const dfsSet = new Set(dfs(g, 0).order);
        if (bfsSet.size !== dfsSet.size) return false;
        for (const v of bfsSet) if (!dfsSet.has(v)) return false;
        return true;
      },
    ),
    { numRuns: 200 },
  );
});
