/**
 * Demo: Euclidean algorithm traced step-by-step.
 *
 * Run with: `deno task demo domains/01-number-theory/gcd/demo.ts`
 */

import { emit } from "@math/core/viz";

const a = 1071n;
const b = 462n;

// Trace the Euclidean algorithm.
const steps: Array<{ a: string; b: string; q: string; r: string }> = [];
let x = a;
let y = b;
while (y !== 0n) {
  const q = x / y;
  const r = x % y;
  steps.push({ a: x.toString(), b: y.toString(), q: q.toString(), r: r.toString() });
  x = y;
  y = r;
}

emit({
  kind: "scalar",
  title: `gcd(${a}, ${b}) = ${x}`,
  description: "The Euclidean algorithm repeatedly replaces (a, b) with (b, a mod b) " +
    "until the second number is zero. The first then holds the gcd.",
  data: {
    value: {
      inputs: { a: a.toString(), b: b.toString() },
      result: x.toString(),
      trace: steps,
    },
  },
});
