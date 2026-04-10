import { assertEquals } from "@std/assert";
import * as fc from "fast-check";
import { addCapacityEdge, createCapacityGraph, maxFlow, minCutSourceSide } from "./mod.ts";

// ── Reference tests ──────────────────────────────────────────────────

Deno.test("maxFlow — simple two-path network", () => {
  // 0 --(10)--> 1 --(10)--> 3
  // 0 --(10)--> 2 --(10)--> 3
  const g = createCapacityGraph(4);
  addCapacityEdge(g, 0, 1, 10);
  addCapacityEdge(g, 0, 2, 10);
  addCapacityEdge(g, 1, 3, 10);
  addCapacityEdge(g, 2, 3, 10);
  assertEquals(maxFlow(g, 0, 3), 20);
});

Deno.test("maxFlow — bottleneck in the middle", () => {
  // 0 --(10)--> 1 --(5)--> 2
  const g = createCapacityGraph(3);
  addCapacityEdge(g, 0, 1, 10);
  addCapacityEdge(g, 1, 2, 5);
  assertEquals(maxFlow(g, 0, 2), 5);
});

Deno.test("maxFlow — CLRS example", () => {
  // Classic 6-node example from CLRS §26.
  const g = createCapacityGraph(6);
  addCapacityEdge(g, 0, 1, 16);
  addCapacityEdge(g, 0, 2, 13);
  addCapacityEdge(g, 1, 2, 4);
  addCapacityEdge(g, 1, 3, 12);
  addCapacityEdge(g, 2, 1, 10);
  addCapacityEdge(g, 2, 4, 14);
  addCapacityEdge(g, 3, 2, 9);
  addCapacityEdge(g, 3, 5, 20);
  addCapacityEdge(g, 4, 3, 7);
  addCapacityEdge(g, 4, 5, 4);
  assertEquals(maxFlow(g, 0, 5), 23);
});

Deno.test("maxFlow — no path, flow is 0", () => {
  const g = createCapacityGraph(3);
  addCapacityEdge(g, 0, 1, 5);
  // No edge from 1 to 2.
  assertEquals(maxFlow(g, 0, 2), 0);
});

Deno.test("maxFlow — single edge", () => {
  const g = createCapacityGraph(2);
  addCapacityEdge(g, 0, 1, 7);
  assertEquals(maxFlow(g, 0, 1), 7);
});

// ── Min-cut test ─────────────────────────────────────────────────────

Deno.test("minCutSourceSide — basic", () => {
  const g = createCapacityGraph(4);
  addCapacityEdge(g, 0, 1, 3);
  addCapacityEdge(g, 0, 2, 2);
  addCapacityEdge(g, 1, 3, 2);
  addCapacityEdge(g, 2, 3, 3);
  const flow = maxFlow(g, 0, 3);
  // Path 0->1->3 carries 2, path 0->2->3 carries 2. Total = 4.
  assertEquals(flow, 4);
  const sourceSide = minCutSourceSide(g, 0);
  // Source side should contain 0 but not 3 (the sink).
  assertEquals(sourceSide.has(0), true);
  assertEquals(sourceSide.has(3), false);
});

// ── Property-based tests ─────────────────────────────────────────────

Deno.test("maxFlow — property: flow = min-cut for small graphs", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 3, max: 8 }),
      fc.array(
        fc.tuple(
          fc.integer({ min: 0, max: 7 }),
          fc.integer({ min: 0, max: 7 }),
          fc.integer({ min: 1, max: 20 }),
        ),
        { minLength: 1, maxLength: 15 },
      ),
      (n, edges) => {
        const source = 0;
        const sink = n - 1;

        // Build capacity graph and a copy for min-cut computation.
        const g = createCapacityGraph(n);
        const original: number[][] = [];
        for (let i = 0; i < n; i++) original.push(new Array(n).fill(0));

        for (const [u, v, c] of edges) {
          if (u < n && v < n && u !== v) {
            addCapacityEdge(g, u, v, c);
            original[u][v] += c;
          }
        }

        const flow = maxFlow(g, source, sink);

        // Compute min-cut capacity from the residual graph.
        const sourceSide = minCutSourceSide(g, source);
        let cutCapacity = 0;
        for (const u of sourceSide) {
          for (let v = 0; v < n; v++) {
            if (!sourceSide.has(v)) {
              cutCapacity += original[u][v];
            }
          }
        }

        // Max-flow = min-cut (Ford–Fulkerson theorem).
        return flow === cutCapacity;
      },
    ),
    { numRuns: 200 },
  );
});

Deno.test("maxFlow — property: flow is non-negative", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 2, max: 8 }),
      fc.array(
        fc.tuple(
          fc.integer({ min: 0, max: 7 }),
          fc.integer({ min: 0, max: 7 }),
          fc.integer({ min: 1, max: 20 }),
        ),
        { minLength: 0, maxLength: 15 },
      ),
      (n, edges) => {
        const g = createCapacityGraph(n);
        for (const [u, v, c] of edges) {
          if (u < n && v < n && u !== v) addCapacityEdge(g, u, v, c);
        }
        return maxFlow(g, 0, n - 1) >= 0;
      },
    ),
    { numRuns: 200 },
  );
});
