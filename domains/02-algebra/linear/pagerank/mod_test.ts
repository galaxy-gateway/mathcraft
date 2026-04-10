import { assertEquals } from "@std/assert";
import * as fc from "fast-check";
import { Matrix } from "@math/core/linalg";
import { assertCloseTo } from "@math/core/testing";
import { pagerank } from "./mod.ts";

Deno.test("pagerank — 3-node triangle graph", () => {
  // All nodes link to one other in a cycle: 0->1, 1->2, 2->0
  // By symmetry, all ranks should be equal = 1/3
  const A = Matrix.from([
    [0, 1, 0],
    [0, 0, 1],
    [1, 0, 0],
  ]);
  const ranks = pagerank(A);
  for (let i = 0; i < 3; i++) {
    assertCloseTo(ranks.get(i), 1 / 3, 1e-8);
  }
});

Deno.test("pagerank — ranks sum to 1", () => {
  const A = Matrix.from([
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 0, 0, 1],
    [1, 1, 0, 0],
  ]);
  const ranks = pagerank(A);
  const sum = ranks.toArray().reduce((a, b) => a + b, 0);
  assertCloseTo(sum, 1, 1e-10);
});

Deno.test("pagerank — star graph: hub has highest rank", () => {
  // Node 0 is a hub: all other nodes link to it
  // 1->0, 2->0, 3->0, 0->1,2,3
  const A = Matrix.from([
    [0, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
  ]);
  const ranks = pagerank(A);
  // Node 0 should have the highest rank
  for (let i = 1; i < 4; i++) {
    assertEquals(ranks.get(0) > ranks.get(i), true);
  }
});

Deno.test("pagerank — dangling node handled", () => {
  // Node 2 has no outgoing links (dangling)
  const A = Matrix.from([
    [0, 1, 0],
    [1, 0, 1],
    [0, 0, 0],
  ]);
  const ranks = pagerank(A);
  const sum = ranks.toArray().reduce((a, b) => a + b, 0);
  assertCloseTo(sum, 1, 1e-8);
  // All ranks should be positive
  for (let i = 0; i < 3; i++) {
    assertEquals(ranks.get(i) > 0, true);
  }
});

Deno.test("pagerank — damping factor effect", () => {
  const A = Matrix.from([
    [0, 1, 0],
    [0, 0, 1],
    [1, 0, 0],
  ]);
  // With d=1 (no teleport), all equal in a cycle
  const ranks1 = pagerank(A, 1.0, 1e-10);
  for (let i = 0; i < 3; i++) {
    assertCloseTo(ranks1.get(i), 1 / 3, 1e-6);
  }
  // With d=0 (pure teleport), all equal
  const ranks0 = pagerank(A, 0.0, 1e-10);
  for (let i = 0; i < 3; i++) {
    assertCloseTo(ranks0.get(i), 1 / 3, 1e-6);
  }
});

Deno.test("pagerank — known 4-node reference", () => {
  // Classic example: 0->1, 0->2, 1->2, 2->0, 3->2
  const A = Matrix.from([
    [0, 1, 1, 0],
    [0, 0, 1, 0],
    [1, 0, 0, 0],
    [0, 0, 1, 0],
  ]);
  const ranks = pagerank(A, 0.85);
  // Node 2 should have highest rank (most inlinks)
  assertEquals(ranks.get(2) > ranks.get(0), true);
  assertEquals(ranks.get(2) > ranks.get(1), true);
  assertEquals(ranks.get(2) > ranks.get(3), true);
});

Deno.test("pagerank — property: all ranks positive and sum to 1", () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.array(fc.integer({ min: 0, max: 1 }), { minLength: 4, maxLength: 4 }),
        { minLength: 4, maxLength: 4 },
      ),
      (rows) => {
        // Clear diagonal (no self-links)
        for (let i = 0; i < 4; i++) rows[i][i] = 0;
        // Ensure at least one link per row for non-trivial graph
        for (let i = 0; i < 4; i++) {
          if (rows[i].every((v) => v === 0)) {
            rows[i][(i + 1) % 4] = 1;
          }
        }
        const A = Matrix.from(rows);
        const ranks = pagerank(A, 0.85, 1e-8);
        // All positive
        for (let i = 0; i < 4; i++) {
          if (ranks.get(i) <= 0) return false;
        }
        // Sum to 1
        const sum = ranks.toArray().reduce((a, b) => a + b, 0);
        return Math.abs(sum - 1) < 1e-6;
      },
    ),
    { numRuns: 50 },
  );
});
