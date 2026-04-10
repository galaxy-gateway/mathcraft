/**
 * PCG32 — a fast, statistically good PRNG by Melissa O'Neill.
 *
 * Reference: O'Neill, "PCG: A Family of Simple Fast Space-Efficient
 * Statistically Good Algorithms for Random Number Generation" (2014).
 *
 * State is a 64-bit unsigned integer; output is 32 bits per step.
 */

const MULT = 6364136223846793005n;
const INCREMENT = 1442695040888963407n;
const MASK64 = (1n << 64n) - 1n;
const MASK32 = (1n << 32n) - 1n;

export interface Pcg {
  /** Next uniform 32-bit integer in `[0, 2³²)`. */
  nextUint32(): number;
  /** Next uniform float in `[0, 1)`. */
  next(): number;
  /** Next integer in `[lo, hi]` (inclusive both ends). */
  nextInt(lo: number, hi: number): number;
}

/**
 * Create a PCG32 generator.
 *
 * @param seed 64-bit seed. `42n` is a canonical default.
 */
export function pcg(seed: bigint = 42n): Pcg {
  let state = (BigInt.asUintN(64, seed) + INCREMENT) & MASK64;
  state = (state * MULT + INCREMENT) & MASK64;

  const step = (): number => {
    const oldState = state;
    state = (oldState * MULT + INCREMENT) & MASK64;
    const xorshifted = Number((((oldState >> 18n) ^ oldState) >> 27n) & MASK32);
    const rot = Number((oldState >> 59n) & 31n);
    // Right rotate xorshifted by rot (32-bit).
    return ((xorshifted >>> rot) | (xorshifted << ((-rot) & 31))) >>> 0;
  };

  return {
    nextUint32: step,
    next(): number {
      // Use 53 bits of randomness to produce a double in [0, 1).
      const hi = step() >>> 5; // 27 bits
      const lo = step() >>> 6; // 26 bits
      return (hi * 2 ** 26 + lo) / 2 ** 53;
    },
    nextInt(lo: number, hi: number): number {
      if (!Number.isInteger(lo) || !Number.isInteger(hi) || lo > hi) {
        throw new RangeError("nextInt requires integer lo <= hi");
      }
      const range = hi - lo + 1;
      return lo + Math.floor(step() / 2 ** 32 * range);
    },
  };
}
