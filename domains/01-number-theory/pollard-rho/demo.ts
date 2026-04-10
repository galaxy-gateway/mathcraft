import { emit } from "@math/core/viz";
import { factor } from "./mod.ts";

const targets = [
  1001n,
  8051n,
  123_456_789n,
  1_000_000_007n * 1_000_000_009n,
];

const results = targets.map((n) => ({
  n: n.toString(),
  factorization: factor(n).map((p) => p.toString()),
}));

emit({
  kind: "scalar",
  title: "Pollard's rho factorizations",
  description: "Pollard's rho finds a non-trivial factor by following the iteration " +
    "x ← x²+1 mod n and watching for cycles via gcd. Expected work is " +
    "O(n^(1/4)).",
  data: { value: results },
});
