/**
 * Demo: Gaussian elimination step-by-step.
 *
 * Run with: `deno task demo domains/02-algebra/linear/gauss-elimination/demo.ts`
 */

import { emit } from "@math/core/viz";
import { Matrix, Vector } from "@math/core/linalg";
import { gaussEliminate } from "./mod.ts";

const A = Matrix.from([
  [2, 1, -1],
  [-3, -1, 2],
  [-2, 1, 2],
]);
const b = new Vector([8, -11, -3]);

const { x, rank, determinant } = gaussEliminate(A, b);

emit({
  kind: "scalar",
  title: "Gaussian Elimination: Solve Ax = b",
  description: "Solve a 3x3 system using Gaussian elimination with partial pivoting. " +
    "The algorithm forward-eliminates to upper-triangular form, then back-substitutes.",
  data: {
    value: {
      A: A.toArray(),
      b: b.toArray(),
      x: x.toArray(),
      rank,
      determinant,
      verification: A.mulVec(x).toArray(),
    },
  },
});
