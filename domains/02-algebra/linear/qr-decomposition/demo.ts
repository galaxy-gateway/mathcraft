/**
 * Demo: QR decomposition via Gram-Schmidt.
 *
 * Run with: `deno task demo domains/02-algebra/linear/qr-decomposition/demo.ts`
 */

import { emit } from "@math/core/viz";
import { Matrix, Vector } from "@math/core/linalg";
import { qr, qrSolve } from "./mod.ts";

const A = Matrix.from([
  [12, -51, 4],
  [6, 167, -68],
  [-4, 24, -41],
]);
const b = new Vector([1, 2, 3]);

const { Q, R } = qr(A);
const x = qrSolve(Q, R, b);

emit({
  kind: "scalar",
  title: "QR Decomposition: A = QR (Gram-Schmidt)",
  description: "Decompose a 3x3 matrix into Q (orthonormal columns) and R (upper-triangular) " +
    "using classical Gram-Schmidt, then solve Ax = b via back substitution on Rx = Q^Tb.",
  data: {
    value: {
      A: A.toArray(),
      Q: Q.toArray(),
      R: R.toArray(),
      QtQ_is_identity: Q.transpose().mul(Q).toArray(),
      b: b.toArray(),
      x: x.toArray(),
      verification_Ax: A.mulVec(x).toArray(),
    },
  },
});
