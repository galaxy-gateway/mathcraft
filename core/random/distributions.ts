/**
 * Basic probability distributions on top of a Pcg generator.
 *
 * Each function takes a `Pcg` and produces one sample. For many samples,
 * call in a loop.
 */

import type { Pcg } from "./pcg.ts";

/** Uniform continuous on `[lo, hi)`. */
export function uniform(rng: Pcg, lo: number, hi: number): number {
  return lo + (hi - lo) * rng.next();
}

/** Standard normal sample via Box–Muller. */
export function normal(rng: Pcg, mean = 0, stddev = 1): number {
  // Box–Muller: two uniforms produce two normals; we emit the first.
  let u1 = rng.next();
  while (u1 === 0) u1 = rng.next(); // avoid log(0)
  const u2 = rng.next();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + stddev * z;
}

/** Bernoulli trial with success probability `p`. */
export function bernoulli(rng: Pcg, p: number): boolean {
  if (p < 0 || p > 1) throw new RangeError("p must be in [0, 1]");
  return rng.next() < p;
}

/** Random element of an array. */
export function choice<T>(rng: Pcg, items: readonly T[]): T {
  if (items.length === 0) throw new RangeError("choice from empty array");
  return items[rng.nextInt(0, items.length - 1)];
}

/** Fisher–Yates shuffle. Returns a new array. */
export function shuffle<T>(rng: Pcg, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
