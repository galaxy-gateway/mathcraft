import { assertAlmostEquals, assertEquals, assertThrows } from "@std/assert";
import { pcg } from "./pcg.ts";
import { bernoulli, choice, normal, shuffle, uniform } from "./distributions.ts";

Deno.test("uniform — within range", () => {
  const rng = pcg(1n);
  for (let i = 0; i < 1000; i++) {
    const v = uniform(rng, -5, 5);
    if (v < -5 || v >= 5) throw new Error(`out of range: ${v}`);
  }
});

Deno.test("normal — mean and variance converge", () => {
  const rng = pcg(2n);
  const n = 20_000;
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < n; i++) {
    const x = normal(rng, 0, 1);
    sum += x;
    sumSq += x * x;
  }
  const mean = sum / n;
  const variance = sumSq / n - mean * mean;
  assertAlmostEquals(mean, 0, 0.05);
  assertAlmostEquals(variance, 1, 0.1);
});

Deno.test("bernoulli — fraction true ≈ p", () => {
  const rng = pcg(3n);
  const n = 10_000;
  let trues = 0;
  for (let i = 0; i < n; i++) if (bernoulli(rng, 0.3)) trues++;
  assertAlmostEquals(trues / n, 0.3, 0.02);
});

Deno.test("bernoulli — rejects invalid p", () => {
  const rng = pcg(1n);
  assertThrows(() => bernoulli(rng, -0.1), RangeError);
  assertThrows(() => bernoulli(rng, 1.1), RangeError);
});

Deno.test("choice — from non-empty array", () => {
  const rng = pcg(4n);
  const items = ["a", "b", "c"];
  const seen = new Set<string>();
  for (let i = 0; i < 200; i++) seen.add(choice(rng, items));
  assertEquals(seen.size, 3);
});

Deno.test("choice — empty array throws", () => {
  assertThrows(() => choice(pcg(1n), []), RangeError);
});

Deno.test("shuffle — is a permutation", () => {
  const rng = pcg(5n);
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const shuffled = shuffle(rng, items);
  assertEquals(shuffled.length, items.length);
  assertEquals(new Set(shuffled), new Set(items));
});
