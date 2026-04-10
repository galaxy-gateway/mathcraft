import { assertEquals } from "@std/assert";
import { assertCloseTo } from "@math/core/testing";
import { persistentH0, ripsEdges } from "./mod.ts";

Deno.test("persistentH0 — two-cluster point cloud", () => {
  // Two tight clusters far apart: (0,0),(1,0),(0,1)  and  (10,10),(11,10)
  const pts = [[0, 0], [1, 0], [0, 1], [10, 10], [11, 10]];
  const bars = persistentH0(pts);
  // 5 points → 5 bars, one with Infinity death.
  assertEquals(bars.length, 5);
  const finite = bars.filter((b) => b.death < Infinity);
  assertEquals(finite.length, 4);

  // All births at 0.
  for (const b of bars) assertEquals(b.birth, 0);

  // The infinite bar persists → 1 connected component at large ε.
  const inf = bars.filter((b) => b.death === Infinity);
  assertEquals(inf.length, 1);
});

Deno.test("persistentH0 — collinear points merge sequentially", () => {
  const pts = [[0], [1], [3]];
  const bars = persistentH0(pts);
  assertEquals(bars.length, 3);
  const deaths = bars.filter((b) => b.death < Infinity).map((b) => b.death).sort();
  assertCloseTo(deaths[0], 1, 1e-10);
  assertCloseTo(deaths[1], 2, 1e-10);
});

Deno.test("persistentH0 — single point", () => {
  assertEquals(persistentH0([[5, 5]]), [{ birth: 0, death: Infinity }]);
});

Deno.test("persistentH0 — empty point cloud", () => {
  assertEquals(persistentH0([]), []);
});

Deno.test("ripsEdges — threshold filters correctly", () => {
  const pts = [[0, 0], [1, 0], [10, 0]];
  assertEquals(ripsEdges(pts, 0.5).length, 0);
  assertEquals(ripsEdges(pts, 1.0).length, 1);
  assertEquals(ripsEdges(pts, 10.0).length, 3);
});
