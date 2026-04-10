# Interior-Point Method — Constrained convex optimization via log-barrier

## TL;DR

The interior-point (log-barrier) method solves constrained convex programs
by converting them into a sequence of unconstrained problems. A logarithmic
barrier function penalizes proximity to constraint boundaries, and as the
barrier parameter grows, the solution converges to the true constrained
optimum. The duality gap is bounded by m/t where m is the number of
constraints and t is the barrier parameter.

## Intuition

Imagine a ball rolling on a table with walls around the edges. The log-barrier
acts like invisible force fields near the walls: as the ball approaches a
wall, the repulsive force grows to infinity (like -log(distance-to-wall)).
Far from the walls, the ball follows the objective function freely.

By gradually turning down the barrier strength (equivalently, increasing t),
the "force field" concentrates into a thin layer at the boundary, and the
ball settles closer and closer to the true constrained optimum.

The key insight is that each subproblem is an **unconstrained** optimization
(we can use gradient descent or Newton's method), and the outer loop only
needs to increase one scalar parameter.

## Statement

**Constrained problem:**
```
minimize    f(x)
subject to  g_i(x) <= 0,  i = 1, ..., m
```

where f and all g_i are convex.

**Barrier reformulation:**
```
minimize    t * f(x) - sum_{i=1}^{m} log(-g_i(x))
```

The term phi(x) = -sum log(-g_i(x)) is the log-barrier function. It is
defined only on the strictly feasible set {x : g_i(x) < 0 for all i}
and goes to infinity as any constraint approaches zero.

## Algorithm

```
function barrierMethod(f, gradF, constraints, x0, t0, mu):
    t = t0
    x = x0    (must be strictly feasible)
    while m / t > tolerance:
        // Centering step: solve unconstrained subproblem
        x = minimize  t * f(x) + phi(x)  starting from x
        // Increase barrier parameter
        t = mu * t
    return x
```

The centering step uses gradient descent (or Newton's method for faster
convergence) on the combined objective t * f(x) + phi(x).

See [`mod.ts`](./mod.ts) for the runnable implementation.

## Proof or justification

**Duality gap bound.** Let x*(t) be the minimizer of t*f(x) + phi(x).
Then x*(t) is feasible and satisfies:

  f(x*(t)) - f* <= m / t

where f* is the true constrained optimum. This follows from weak duality:
the log-barrier implicitly defines dual variables lambda_i = 1 / (t * (-g_i(x)))
that are dual feasible, and the duality gap is exactly m/t.

**Convergence.** After k outer iterations with t_k = t_0 * mu^k, the
duality gap is m / (t_0 * mu^k). To achieve gap <= epsilon, we need
k = ceil(log(m / (epsilon * t_0)) / log(mu)) outer iterations.

**Centering.** Each centering step solves a self-concordant minimization
(the log-barrier is self-concordant), so Newton's method converges in
O(sqrt(m) * log(1/eps)) iterations for the centering step (or fewer
with warm-starting).

## Complexity

- Outer iterations: O(log(m / epsilon)) for mu > 1.
- Per centering step (Newton): O(sqrt(m)) Newton iterations, each
  costing O(n^3) for the linear system solve.
- Total: O(sqrt(m) * log(m/eps) * n^3) arithmetic operations.
- This implementation uses gradient descent for centering, which is
  simpler but slower than Newton.

## Applications

- Linear programming (LP) — this is how modern LP solvers work
- Semidefinite programming (SDP)
- Quadratically constrained quadratic programs (QCQP)
- Portfolio optimization with risk constraints
- [`tiny-cvx`](../tiny-cvx/) — uses this as a constrained solver backend
- Engineering design optimization

## References

- [boyd2004convex] Boyd & Vandenberghe, *Convex Optimization*, Ch. 11.
- [nesterov1994interior] Nesterov & Nemirovski, *Interior-Point Polynomial Algorithms in Convex Programming*, 1994.
- [wright1997primal] Wright, *Primal-Dual Interior-Point Methods*, 1997.
