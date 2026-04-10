/**
 * @math/core — shared primitives used across every math-examples domain.
 *
 * This is the public entry point. Subsystems are available as their own
 * barrel modules via the import map in `deno.json`:
 *
 *   - @math/core/numeric — BigInt helpers, Rational, Complex
 *   - @math/core/linalg  — Vector, Matrix
 *   - @math/core/random  — Seeded PRNG and distributions
 *   - @math/core/viz     — Visualization contract encoder
 *   - @math/core/testing — Tolerance assertions, fast-check helpers
 */

export * from "./numeric/mod.ts";
export * from "./linalg/mod.ts";
export * from "./random/mod.ts";
export * from "./viz/mod.ts";
export * from "./testing/mod.ts";
