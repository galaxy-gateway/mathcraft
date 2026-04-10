/**
 * Demo: SVD of a 3x3 matrix.
 *
 * Run with: `deno task demo domains/02-algebra/linear/svd/demo.ts`
 */

import { emit } from "@math/core/viz";
import { Matrix } from "@math/core/linalg";
import { svd } from "./mod.ts";

const A = Matrix.from([
  [1, 2, 0],
  [0, 3, 1],
  [1, 0, 2],
]);

const { U, S, Vt } = svd(A);
const reconstructed = U.mul(Matrix.diag(S.toArray())).mul(Vt);

emit({
  kind: "scalar",
  title: "Singular Value Decomposition: A = U diag(S) Vt",
  description: "Decompose a 3x3 matrix using one-sided Jacobi SVD. " +
    "The singular values reveal the 'stretching factors' of the linear map.",
  data: {
    value: {
      A: A.toArray(),
      U: U.toArray(),
      singularValues: S.toArray(),
      Vt: Vt.toArray(),
      reconstruction: reconstructed.toArray(),
    },
  },
});
