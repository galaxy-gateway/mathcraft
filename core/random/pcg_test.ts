import { assertEquals, assertThrows } from "@std/assert";
import { pcg } from "./pcg.ts";

Deno.test("pcg — deterministic given a seed", () => {
  const a = pcg(42n);
  const b = pcg(42n);
  for (let i = 0; i < 10; i++) {
    assertEquals(a.nextUint32(), b.nextUint32());
  }
});

Deno.test("pcg — different seeds give different streams", () => {
  const a = pcg(1n);
  const b = pcg(2n);
  let different = false;
  for (let i = 0; i < 10; i++) {
    if (a.nextUint32() !== b.nextUint32()) {
      different = true;
      break;
    }
  }
  assertEquals(different, true);
});

Deno.test("pcg — next() returns values in [0, 1)", () => {
  const rng = pcg(7n);
  for (let i = 0; i < 1000; i++) {
    const v = rng.next();
    if (v < 0 || v >= 1) throw new Error(`out of range: ${v}`);
  }
});

Deno.test("pcg — nextInt respects bounds", () => {
  const rng = pcg(99n);
  for (let i = 0; i < 1000; i++) {
    const v = rng.nextInt(5, 10);
    if (v < 5 || v > 10) throw new Error(`out of range: ${v}`);
    if (!Number.isInteger(v)) throw new Error(`not integer: ${v}`);
  }
});

Deno.test("pcg — nextInt rejects invalid ranges", () => {
  const rng = pcg(1n);
  assertThrows(() => rng.nextInt(5, 4), RangeError);
  assertThrows(() => rng.nextInt(1.5, 5), RangeError);
});
