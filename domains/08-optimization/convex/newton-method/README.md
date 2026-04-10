# Newton's Method — Second-order optimization

## TL;DR

Newton's method uses the Hessian (second-derivative matrix) to take steps
that account for curvature, achieving quadratic convergence near the
optimum. Each iteration solves H * dx = -grad f to find the Newton step,
then applies backtracking line search for global convergence.

## Intuition

Gradient descent knows which way is downhill but not how steep the valley
is. Newton's method builds a local quadratic model of the function at
each point — like fitting a paraboloid — and jumps directly to that
paraboloid's minimum. On a pure quadratic, this gives the exact answer in
one step. On general smooth functions, the convergence is quadratic:
the number of correct digits roughly doubles each iteration.

The price is computing and inverting the Hessian, an O(n^3) operation.
For small-to-medium problems this is well worth it.

## Statement

Given f: R^n -> R twice continuously differentiable, find x* minimizing f.

The Newton step at x is the solution dx to:

  H(x) * dx = -grad f(x)

where H(x) = nabla^2 f(x) is the Hessian. The update is:

  x_{k+1} = x_k + t * dx

where t is chosen by backtracking line search.

## Algorithm

```
function newtonOptimize(f, grad, hess, x0):
    x = x0
    for k = 1, 2, ...
        g = grad(x)
        if ||g|| < tol: return x
        H = hess(x)
        dx = solve(H, -g)                // Newton step
        lambda^2 = -g^T dx               // Newton decrement
        if lambda^2 / 2 < tol: return x
        t = backtrack(f, x, g, dx)       // line search
        x = x + t * dx
```

**Backtracking line search (Armijo):** Start with t = 1. While
f(x + t*dx) > f(x) + alpha * t * g^T dx, set t = beta * t.

See [`mod.ts`](./mod.ts) for the runnable implementation.

## Proof or justification

**Quadratic convergence (local).** Near a minimizer x* where H(x*) is
positive definite, Newton's method satisfies:

  ||x_{k+1} - x*|| <= C * ||x_k - x*||^2

for some constant C. This follows from Taylor expansion: the Newton step
exactly cancels the linear and quadratic terms, leaving only the cubic
remainder.

**Global convergence.** With backtracking line search, Newton's method is
globally convergent (every limit point is a stationary point) because the
Armijo condition guarantees sufficient decrease. The method transitions
from a "damped" phase (where t < 1) to a "pure Newton" phase (where t = 1
is always accepted), at which point quadratic convergence kicks in.

**Self-concordance.** For self-concordant functions (Nesterov & Nemirovski),
one can bound the total number of iterations precisely: O(log log(1/eps))
in the quadratic convergence phase.

## Complexity

- Per iteration: O(n^3) for the linear solve, O(n^2) for the Hessian
  evaluation (if done analytically).
- Total iterations: typically very few — O(log log(1/eps)) in the pure
  Newton phase, preceded by O(1) damped steps.
- Space: O(n^2) for the Hessian.

On a pure quadratic, Newton converges in exactly 1 iteration regardless
of the condition number — a dramatic advantage over gradient descent,
which needs O(kappa * log(1/eps)) iterations where kappa is the condition
number.

## Applications

- Small-to-medium scale optimization where Hessians are available
- [`interior-point`](../interior-point/) — Newton is the inner solver
- Logistic regression and other statistical models
- Calibrating financial models (few parameters, expensive evaluations)
- Nonlinear equation solving (Newton-Raphson)

## References

- [boyd2004convex] Boyd & Vandenberghe, *Convex Optimization*, Ch. 9.5.
- [nocedal2006numerical] Nocedal & Wright, *Numerical Optimization*, Ch. 3.
- [nesterov2004introductory] Nesterov, *Introductory Lectures on Convex Optimization*, Ch. 4.
