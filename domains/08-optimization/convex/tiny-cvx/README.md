# tiny-cvx — A mini DSL for convex programs

## TL;DR

tiny-cvx is a fluent builder API for specifying and solving convex
optimization problems. It composes gradient descent (unconstrained) and
the interior-point barrier method (constrained) from sibling modules,
providing a high-level interface inspired by CVXPY and CVX.

## Intuition

Real optimization libraries like CVXPY let you write math-like code:

```python
x = cp.Variable(2)
prob = cp.Problem(cp.Minimize(cp.quad_form(x, Q) + c @ x),
                  [x >= 0])
prob.solve()
```

tiny-cvx captures this same idea in TypeScript with a builder pattern:

```ts
problem()
  .variable("x", 2)
  .minimize((x) => quadratic(Q, c, x))
  .subjectTo((x) => x.get(0) >= 0)
  .solve()
```

The DSL doesn't implement new solvers. Instead, it routes unconstrained
problems to gradient descent and constrained problems to the barrier
method. The educational point is the **composition**: a thin declarative
layer on top of numerical primitives makes optimization accessible.

## Statement

A convex program in standard form:

```
minimize    f(x)
subject to  g_i(x) <= 0,  i = 1, ..., m
```

where f is convex and each g_i is convex.

The DSL supports:
- Arbitrary convex objectives (with optional analytical gradient)
- Non-negativity constraints via `subjectTo((x) => x.get(i) >= 0)`
- General inequality constraints via `constrainLeq(g, gradG)`
- Custom initial points via `startFrom(x0)`

## Algorithm

The solve method dispatches:

1. **No constraints:** Run gradient descent from the initial point (or
   the origin). Supports both analytical and numerical gradients.

2. **With constraints:** Convert all constraints to `g(x) <= 0` form
   and invoke the barrier method. Boolean predicates from `subjectTo`
   are pattern-matched to detect common forms like `x_i >= 0`.

```
function solve():
    if no constraints:
        return gradientDescent(f, grad, x0)
    else:
        return barrierMethod(f, grad, constraints, x0)
```

See [`mod.ts`](./mod.ts) for the full implementation.

## Proof or justification

The DSL is a composition layer, so its correctness reduces to the
correctness of the underlying solvers:

- **Gradient descent** converges to the global minimum for convex f
  with Lipschitz gradient (see [`gradient-descent`](../gradient-descent/)).
- **Barrier method** converges to the constrained optimum with duality
  gap m/t (see [`interior-point`](../interior-point/)).

The `subjectTo` constraint parser uses a probing heuristic to detect
`x_i >= 0` patterns. If the probe fails, a fallback constant constraint
is used, which may be less precise. For reliable results, prefer
`constrainLeq` with explicit g and gradG.

## Complexity

Same as the underlying solver:
- Unconstrained: O(k * n) where k = iterations, n = dimension.
- Constrained: O(outer * inner * n) where outer = barrier iterations,
  inner = centering steps per outer iteration.

The DSL overhead (constraint parsing, dispatch) is negligible.

## Applications

- Rapid prototyping of convex programs
- Teaching: write optimization problems in near-mathematical notation
- Portfolio optimization: `minimize((w) => -expectedReturn(w))`
  subject to weight constraints
- Regression with constraints (non-negative least squares, etc.)
- Signal processing (denoising with convex penalties)

## References

- [diamond2016cvxpy] Diamond & Boyd, "CVXPY: A Python-Embedded Modeling Language for Convex Optimization," JMLR 2016.
- [grant2014cvx] Grant & Boyd, "CVX: Matlab Software for Disciplined Convex Programming," 2014.
- [boyd2004convex] Boyd & Vandenberghe, *Convex Optimization*, Ch. 4 (Convex optimization problems).
