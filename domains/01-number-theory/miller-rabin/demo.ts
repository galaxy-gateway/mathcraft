import { emit } from "@math/core/viz";
import { isProbablePrime } from "./mod.ts";

// Count primes below each power of 10. Known: π(10) = 4, π(100) = 25,
// π(1000) = 168, π(10000) = 1229.
const points: Array<[number, number]> = [];
let count = 0;
for (let n = 2n; n <= 10000n; n++) {
  if (isProbablePrime(n)) count++;
  if (n === 10n || n === 100n || n === 1000n || n === 10000n) {
    points.push([Number(n), count]);
  }
}

emit({
  kind: "curve",
  title: "Prime counting function π(x) up to 10⁴",
  description: "Miller–Rabin declares a number composite if it fails for any witness, " +
    "and prime if it passes all of them. For n < 3.3·10¹⁴ the fixed witness " +
    "set {2,3,5,7,11,13,17,19,23,29,31,37} is deterministic.",
  data: {
    xLabel: "x",
    yLabel: "π(x)",
    series: [{ label: "π(x) via Miller–Rabin", points }],
  },
});
