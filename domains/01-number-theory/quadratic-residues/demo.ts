import { emit } from "@math/core/viz";
import { legendreSymbol } from "./mod.ts";

// Plot (a / p) for p = 23 across a = 0..22.
const p = 23n;
const points: Array<[number, number]> = [];
for (let a = 0n; a < p; a++) {
  points.push([Number(a), legendreSymbol(a, p)]);
}

emit({
  kind: "curve",
  title: `Legendre symbol (a/${p}) for a = 0..${p - 1n}`,
  description: "The Legendre symbol partitions ℤ/p into quadratic residues (+1), " +
    "non-residues (−1), and zero. For an odd prime p there are exactly " +
    "(p−1)/2 of each non-zero class.",
  data: {
    xLabel: "a",
    yLabel: "(a/p)",
    series: [{ label: `(a/${p})`, points }],
  },
});
