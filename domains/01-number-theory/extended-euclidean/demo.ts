/**
 * Demo: Extended Euclidean on (240, 46).
 *
 * Run: `deno task demo domains/01-number-theory/extended-euclidean/demo.ts`
 */
import { emit } from "@math/core/viz";
import { extendedGcd, modInverse } from "./mod.ts";

const a = 240n;
const b = 46n;
const { g, x, y } = extendedGcd(a, b);

emit({
  kind: "scalar",
  title: `Bezout: ${a}·x + ${b}·y = ${g}`,
  description: "Extended Euclidean returns gcd and Bezout coefficients in one pass. " +
    "As a bonus, when gcd(a, n) = 1 the x coefficient is a modular inverse.",
  data: {
    value: {
      a: a.toString(),
      b: b.toString(),
      g: g.toString(),
      x: x.toString(),
      y: y.toString(),
      check: `${a}·${x} + ${b}·${y} = ${a * x + b * y}`,
      inverseExample: `3⁻¹ mod 11 = ${modInverse(3n, 11n)}`,
    },
  },
});
