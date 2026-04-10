# Linear regression from scratch

## TL;DR

Fit a linear model `y = Xβ` by two routes: the closed-form normal equation
`β = (XᵀX)⁻¹Xᵀy`, and iterative gradient descent on MSE. Both compose
primitives from `@math/core/linalg`.

## What this demonstrates

Linear regression is the "hello world" of machine learning, and it's pure
linear algebra under the hood:

- **Matrix multiplication** (`Xᵀ X`, `Xᵀ y`) from `@math/core/linalg`.
- **Gaussian elimination** to solve the normal equation (inlined here;
  the full version lives in `domains/02-algebra/linear/gauss-elimination/`).
- **Gradient descent** — the same algorithm used in
  `domains/08-optimization/convex/gradient-descent/`, specialized to the
  MSE loss landscape.

## API

```ts
normalEquation(X, y) → Vector           // closed-form
gradientDescentLR(X, y, lr, iters)      // iterative, returns {beta, losses}
predict(X, beta) → Vector
mse(y, yHat) → number
```

See [`mod.ts`](./mod.ts).

## When to use which

- **Normal equation:** O(n³) in the number of features. Fast and exact for
  small feature counts (n < 10k). No learning rate to tune.
- **Gradient descent:** O(m·n) per iteration. Scales to millions of
  examples and features. Requires choosing a learning rate and iteration
  count.

## Complexity

- Normal equation: O(mn² + n³).
- Gradient descent: O(mn) per iteration × number of iterations.

## References

- [trefethen1997numerical] Trefethen & Bau, *Numerical Linear Algebra*, §11 (least squares).
- [boyd2004convex] Boyd & Vandenberghe, *Convex Optimization*, §3.1 (quadratic minimization).
