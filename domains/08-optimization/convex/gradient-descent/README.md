# Gradient Descent — First-order convex optimization

## TL;DR

Gradient descent minimizes a differentiable function by repeatedly stepping
in the direction of the negative gradient. Four variants are implemented:
vanilla, momentum, Nesterov accelerated, and Adam. On convex functions with
Lipschitz gradients, vanilla GD converges at O(1/k); accelerated methods
achieve O(1/k^2).

## Intuition

Imagine standing on a foggy hillside with no map. You can only feel the
local slope under your feet. The steepest descent direction is the negative
gradient. Taking small steps downhill is gradient descent.

**Momentum** is like rolling a heavy ball — it accumulates velocity and
can push through shallow local variations.

**Nesterov's trick** is to peek ahead (evaluate the gradient at the
extrapolated position) before deciding the step, which gives a tighter
convergence guarantee.

**Adam** adapts the step size per coordinate using running averages of the
gradient and its square — coordinates that receive frequent large gradients
get smaller effective learning rates.

## Statement

Given a differentiable function f: R^n -> R, find x* such that
f(x*) <= f(x) for all x in R^n.

Necessary condition (first-order): grad f(x*) = 0.
Sufficient for convex f: any stationary point is a global minimum.

## Algorithm

### Vanilla gradient descent
```
x_{k+1} = x_k - lr * grad f(x_k)
```

### Momentum (Polyak heavy-ball)
```
v_{k+1} = beta * v_k - lr * grad f(x_k)
x_{k+1} = x_k + v_{k+1}
```

### Nesterov accelerated gradient
```
y_k     = x_k + beta * v_k              (look-ahead)
v_{k+1} = beta * v_k - lr * grad f(y_k)
x_{k+1} = x_k + v_{k+1}
```

### Adam
```
m_{k+1} = beta1 * m_k + (1 - beta1) * g_k
v_{k+1} = beta2 * v_k + (1 - beta2) * g_k^2
m_hat   = m_{k+1} / (1 - beta1^{k+1})
v_hat   = v_{k+1} / (1 - beta2^{k+1})
x_{k+1} = x_k - lr * m_hat / (sqrt(v_hat) + eps)
```

See [`mod.ts`](./mod.ts) for the runnable implementations.

## Proof or justification

**Vanilla GD on L-smooth convex functions.** If grad f is L-Lipschitz and
lr = 1/L, then f(x_k) - f(x*) <= L ||x_0 - x*||^2 / (2k). This follows
from the descent lemma:

  f(y) <= f(x) + grad f(x)^T (y - x) + (L/2) ||y - x||^2

Substituting y = x - (1/L) grad f(x) gives a guaranteed decrease of
||grad f(x)||^2 / (2L) per step.

**Nesterov acceleration.** Nesterov (1983) showed that by coupling the
gradient step with an extrapolation (the "momentum" term), one achieves
f(x_k) - f(x*) = O(L ||x_0 - x*||^2 / k^2), which is optimal for
first-order methods (Nemirovsky & Yudin lower bound).

**Adam.** No worst-case rate for general convex functions matches
accelerated methods, but Adam is highly effective in practice, especially
on stochastic and non-convex objectives (e.g., neural network training).

## Complexity

| Variant  | Rate (convex, L-smooth) | Per-iteration cost |
|----------|------------------------|--------------------|
| Vanilla  | O(1/k)                 | O(n) — one gradient |
| Momentum | O(1/k) to O(1/k^2)*   | O(n)               |
| Nesterov | O(1/k^2)               | O(n)               |
| Adam     | O(1/sqrt(k)) bound**   | O(n)               |

(*) Heavy-ball achieves O(1/k^2) on strongly convex quadratics.
(**) The original Adam convergence proof had issues; corrected analyses
    (e.g., AMSGrad) provide O(1/sqrt(k)).

Space: O(n) for vanilla, O(n) for momentum/Nesterov (velocity), O(n)
for Adam (two moment vectors).

## Applications

- Training neural networks (Adam, SGD with momentum)
- Logistic regression, SVMs, ridge regression
- Signal processing (LASSO via proximal gradient)
- [`newton-method`](../newton-method/) — second-order alternative
- [`interior-point`](../interior-point/) — constrained optimization
- [`tiny-cvx`](../tiny-cvx/) — DSL that uses GD as a backend

## References

- [cauchy1847methode] Cauchy, "Methode generale pour la resolution des systemes d'equations simultanees," 1847.
- [polyak1964some] Polyak, "Some methods of speeding up the convergence of iteration methods," 1964.
- [nesterov1983method] Nesterov, "A method of solving a convex programming problem with convergence rate O(1/k^2)," 1983.
- [kingma2015adam] Kingma & Ba, "Adam: A Method for Stochastic Optimization," ICLR 2015.
- [boyd2004convex] Boyd & Vandenberghe, *Convex Optimization*, Ch. 9.
