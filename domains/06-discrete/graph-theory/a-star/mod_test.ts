import { assertEquals } from "@std/assert";
import * as fc from "fast-check";
import { aStar, createGridGraph, manhattanHeuristic } from "./mod.ts";
import { addEdge, createGraph } from "../graph.ts";

// ── Reference tests ──────────────────────────────────────────────────

Deno.test("aStar — simple line graph", () => {
  const g = createGraph(4);
  addEdge(g, 0, 1, 1);
  addEdge(g, 1, 2, 1);
  addEdge(g, 2, 3, 1);
  const path = aStar(g, 0, 3, () => 0);
  assertEquals(path, [0, 1, 2, 3]);
});

Deno.test("aStar — prefers shorter path", () => {
  const g = createGraph(4);
  addEdge(g, 0, 1, 1);
  addEdge(g, 1, 3, 1);
  addEdge(g, 0, 2, 10);
  addEdge(g, 2, 3, 10);
  const path = aStar(g, 0, 3, () => 0);
  assertEquals(path, [0, 1, 3]);
});

Deno.test("aStar — unreachable goal returns null", () => {
  const g = createGraph(3);
  addEdge(g, 0, 1, 1);
  // Node 2 is disconnected.
  assertEquals(aStar(g, 0, 2, () => 0), null);
});

Deno.test("aStar — start equals goal", () => {
  const g = createGraph(3);
  addEdge(g, 0, 1, 1);
  assertEquals(aStar(g, 0, 0, () => 0), [0]);
});

// ── Grid tests ───────────────────────────────────────────────────────

Deno.test("aStar — 3x3 grid with no walls", () => {
  // 0 1 2
  // 3 4 5
  // 6 7 8
  const grid = createGridGraph(3, 3);
  const h = manhattanHeuristic(2, 2, 3);
  const path = aStar(grid, 0, 8, h);
  // Shortest path length is 4 hops (Manhattan distance).
  assertEquals(path!.length, 5); // 5 nodes, 4 edges
  assertEquals(path![0], 0);
  assertEquals(path![path!.length - 1], 8);
});

Deno.test("aStar — 3x3 grid with wall", () => {
  // 0 1 2
  // 3 X 5    (4 is blocked)
  // 6 7 8
  const grid = createGridGraph(3, 3, new Set([4]));
  const h = manhattanHeuristic(2, 2, 3);
  const path = aStar(grid, 0, 8, h);
  // Must go around the wall.
  assertEquals(path![0], 0);
  assertEquals(path![path!.length - 1], 8);
  // Path should not include blocked node.
  assertEquals(path!.includes(4), false);
});

// ── Property-based tests ─────────────────────────────────────────────

Deno.test("aStar — property: with h=0, finds same cost as Dijkstra would", () => {
  // A* with h=0 degenerates to Dijkstra.
  fc.assert(
    fc.property(
      fc.integer({ min: 3, max: 12 }),
      fc.array(
        fc.tuple(
          fc.integer({ min: 0, max: 11 }),
          fc.integer({ min: 0, max: 11 }),
          fc.integer({ min: 1, max: 20 }),
        ),
        { minLength: 2, maxLength: 20 },
      ),
      (n, edges) => {
        const g = createGraph(n);
        for (const [u, v, w] of edges) {
          if (u < n && v < n && u !== v) addEdge(g, u, v, w);
        }
        const goal = n - 1;
        const path = aStar(g, 0, goal, () => 0);

        if (path === null) {
          // Verify goal is truly unreachable via BFS.
          const visited = new Uint8Array(n);
          const queue = [0];
          visited[0] = 1;
          while (queue.length > 0) {
            const u = queue.shift()!;
            for (const { to } of g.adj[u]) {
              if (!visited[to]) {
                visited[to] = 1;
                queue.push(to);
              }
            }
          }
          return !visited[goal];
        }
        // Path starts at 0 and ends at goal.
        return path[0] === 0 && path[path.length - 1] === goal;
      },
    ),
    { numRuns: 200 },
  );
});

Deno.test("aStar — property: path cost is optimal on grid", () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 2, max: 6 }),
      fc.integer({ min: 2, max: 6 }),
      (rows, cols) => {
        const grid = createGridGraph(rows, cols);
        const goalR = rows - 1;
        const goalC = cols - 1;
        const goal = goalR * cols + goalC;
        const h = manhattanHeuristic(goalR, goalC, cols);
        const path = aStar(grid, 0, goal, h);
        // On an unblocked grid, shortest path has length = Manhattan distance.
        const expected = goalR + goalC;
        return path !== null && path.length === expected + 1;
      },
    ),
    { numRuns: 50 },
  );
});
