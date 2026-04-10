/**
 * @math/core/random — seeded pseudo-random number generation.
 *
 * All PRNGs in this module are deterministic given a seed. Never use
 * `Math.random()` in tests or demos; use `pcg(seed)` instead.
 */

export * from "./pcg.ts";
export * from "./distributions.ts";
