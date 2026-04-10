/**
 * Demo: LU decomposition of a 3x3 matrix.
 *
 * Run with: `deno task demo domains/02-algebra/linear/lu-decomposition/demo.ts`
 */

import { emit } from "@math/core/viz";
import { Matrix, Vector } from "@math/core/linalg";
import { lu, luSolve } from "./mod.ts";

const A = Matrix.from([
  [2, 3, 1],
  [4, 7, 5],
  [6, 18, 22],
]);
const b = new Vector([1, 2, 3]);

const { L, U, P } = lu(A);
const x = luSolve(L, U, P, b);

emit({
  kind: "scalar",
  title: "LU Decomposition: PA = LU",
  description: "Factor a 3x3 matrix into P (permutation), L (unit lower-triangular), " +
    "and U (upper-triangular), then solve Ax = b by forward and back substitution.",
  data: {
    value: {
      A: A.toArray(),
      L: L.toArray(),
      U: U.toArray(),
      P: P.toArray(),
      b: b.toArray(),
      x: x.toArray(),
      verification_Ax: A.mulVec(x).toArray(),
    },
  },
});
