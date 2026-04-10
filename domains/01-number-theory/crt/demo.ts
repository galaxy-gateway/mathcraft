import { emit } from "@math/core/viz";
import { crt } from "./mod.ts";

const system = [
  { r: 2n, m: 3n },
  { r: 3n, m: 5n },
  { r: 2n, m: 7n },
];

const { x, m } = crt(system);

emit({
  kind: "scalar",
  title: `CRT solution: x ≡ ${x} (mod ${m})`,
  description: "Sun Tzu's third-century problem: find a number that leaves remainder 2 " +
    "when divided by 3, remainder 3 when divided by 5, and remainder 2 when " +
    "divided by 7. CRT gives the unique solution mod 3·5·7 = 105.",
  data: {
    value: {
      system: system.map((c) => `x ≡ ${c.r} (mod ${c.m})`),
      solution: `${x}`,
      modulus: `${m}`,
    },
  },
});
