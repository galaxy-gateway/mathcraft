/**
 * Demo: QR algorithm for eigenvalues of a symmetric matrix.
 *
 * Run with: `deno task demo domains/02-algebra/linear/qr-eigenvalues/demo.ts`
 */

import { emit } from "@math/core/viz";
import { Matrix } from "@math/core/linalg";
import { qrEigenvalues } from "./mod.ts";

const A = Matrix.from([
  [4, 1, 1],
  [1, 3, 1],
  [1, 1, 2],
]);

const eigenvalues = qrEigenvalues(A);

const trace = 4 + 3 + 2;
const eigSum = eigenvalues.toArray().reduce((a, b) => a + b, 0);

emit({
  kind: "scalar",
  title: "QR Algorithm: Eigenvalues of a Symmetric Matrix",
  description: "Compute eigenvalues of a 3x3 symmetric matrix using the shifted QR algorithm. " +
    "Eigenvalue sum should equal the trace (sum of diagonal).",
  data: {
    value: {
      A: A.toArray(),
      eigenvalues: eigenvalues.toArray(),
      trace,
      eigenvalueSum: eigSum,
      traceMatch: Math.abs(eigSum - trace) < 1e-8,
    },
  },
});
