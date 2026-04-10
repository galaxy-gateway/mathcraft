import { emit } from "@math/core/viz";
import { modPow } from "./mod.ts";

// Compute 2^n mod 1000 for n = 0..31 — illustrates orbit behavior.
const points: Array<[number, number]> = [];
for (let n = 0n; n <= 31n; n++) {
  points.push([Number(n), Number(modPow(2n, n, 1000n))]);
}

emit({
  kind: "curve",
  title: "2ⁿ mod 1000",
  description: "Binary exponentiation keeps work logarithmic in the exponent. The orbit " +
    "of powers of 2 mod 1000 shows the characteristic cyclic behavior of " +
    "modular arithmetic.",
  data: {
    xLabel: "n",
    yLabel: "2ⁿ mod 1000",
    series: [{ label: "2ⁿ mod 1000", points }],
  },
});
