import { emit } from "@math/core/viz";
import { Matrix, Vector } from "@math/core/linalg";
import { gradientDescentLR, normalEquation, predict } from "./mod.ts";

// Dataset: y ≈ 3x + 2 with noise.
const xs = [1, 2, 3, 4, 5, 6, 7, 8];
const ys = [4.8, 8.1, 11.2, 13.9, 17.1, 19.8, 23.2, 25.9];

const X = Matrix.from(xs.map((x) => [1, x]));
const y = new Vector(ys);

const betaNE = normalEquation(X, y);
const { beta: betaGD } = gradientDescentLR(X, y, 0.01, 500);

const predsNE = predict(X, betaNE);
const predsGD = predict(X, betaGD);

emit({
  kind: "curve",
  title: "Linear regression: normal equation vs gradient descent",
  description:
    `Normal equation gives β = [${betaNE.get(0).toFixed(3)}, ${betaNE.get(1).toFixed(3)}] ` +
    `(closed-form). Gradient descent after 500 steps: ` +
    `β = [${betaGD.get(0).toFixed(3)}, ${betaGD.get(1).toFixed(3)}].`,
  data: {
    xLabel: "x",
    yLabel: "y",
    series: [
      { label: "data", points: xs.map((x, i) => [x, ys[i]] as [number, number]) },
      {
        label: "normal-equation fit",
        points: xs.map((x, i) => [x, predsNE.get(i)] as [number, number]),
      },
      {
        label: "GD fit (500 steps)",
        points: xs.map((x, i) => [x, predsGD.get(i)] as [number, number]),
      },
    ],
  },
});
