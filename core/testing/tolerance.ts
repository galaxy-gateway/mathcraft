/**
 * Tolerance-aware assertions.
 *
 * `assertCloseTo` compares scalars; `assertVectorCloseTo` and
 * `assertMatrixCloseTo` compare structured numeric types from
 * `@math/core/linalg`.
 */

import { Matrix } from "../linalg/matrix.ts";
import { Vector } from "../linalg/vector.ts";

export const DEFAULT_TOLERANCE = 1e-10;

/**
 * Assert that `actual` is within `tolerance` of `expected`.
 *
 * Unlike `@std/assert`'s `assertAlmostEquals`, this throws with a message
 * that includes the actual delta — useful when debugging iterative methods
 * that are *almost* converged.
 */
export function assertCloseTo(
  actual: number,
  expected: number,
  tolerance = DEFAULT_TOLERANCE,
  message?: string,
): void {
  if (Number.isNaN(actual) || Number.isNaN(expected)) {
    throw new Error(`${message ?? ""} NaN detected (actual=${actual}, expected=${expected})`);
  }
  const delta = Math.abs(actual - expected);
  if (delta > tolerance) {
    throw new Error(
      `${
        message ?? "values not close"
      }: actual=${actual}, expected=${expected}, delta=${delta}, tol=${tolerance}`,
    );
  }
}

/** Element-wise tolerance assertion on two `Vector`s. */
export function assertVectorCloseTo(
  actual: Vector,
  expected: Vector,
  tolerance = DEFAULT_TOLERANCE,
): void {
  if (actual.length !== expected.length) {
    throw new Error(
      `Vector length mismatch: actual=${actual.length}, expected=${expected.length}`,
    );
  }
  for (let i = 0; i < actual.length; i++) {
    assertCloseTo(actual.get(i), expected.get(i), tolerance, `index ${i}`);
  }
}

/** Element-wise tolerance assertion on two `Matrix`es. */
export function assertMatrixCloseTo(
  actual: Matrix,
  expected: Matrix,
  tolerance = DEFAULT_TOLERANCE,
): void {
  if (actual.rows !== expected.rows || actual.cols !== expected.cols) {
    throw new Error(
      `Matrix shape mismatch: actual ${actual.rows}×${actual.cols}, expected ${expected.rows}×${expected.cols}`,
    );
  }
  for (let r = 0; r < actual.rows; r++) {
    for (let c = 0; c < actual.cols; c++) {
      assertCloseTo(
        actual.get(r, c),
        expected.get(r, c),
        tolerance,
        `cell (${r}, ${c})`,
      );
    }
  }
}
