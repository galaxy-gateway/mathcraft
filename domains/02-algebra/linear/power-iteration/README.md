# Power Iteration

## TL;DR

Power iteration finds the dominant eigenvalue (largest in absolute value)
and its eigenvector by repeatedly multiplying a vector by A and normalizing.
Simple, robust, and the basis of PageRank.

## Intuition

When you multiply a random vector by A many times, the component along the
dominant eigenvector gets amplified the most at each step. After enough
iterations the vector is nearly parallel to the dominant eigenvector, and the
Rayleigh quotient x^T A x / (x^T x) converges to the dominant eigenvalue.

## Statement

Given a square matrix A with eigenvalues |lambda_1| > |lambda_2| >= ...,
power iteration produces a sequence x_k that converges to the eigenvector
of lambda_1. The convergence rate is |lambda_2 / lambda_1| per iteration.

## Algorithm

```
x = random unit vector
repeat:
    y = A * x
    eigenvalue = x . y          (Rayleigh quotient)
    x = y / ||y||
until |eigenvalue change| < tol
return eigenvalue, x
```

See [`mod.ts`](./mod.ts) for the runnable implementation.

## Proof or justification

**Convergence.** Expand x_0 in the eigenbasis: x_0 = sum c_i v_i. Then
A^k x_0 = sum c_i lambda_i^k v_i = lambda_1^k (c_1 v_1 + sum_{i>1} c_i
(lambda_i/lambda_1)^k v_i). Since |lambda_i/lambda_1| < 1 for i > 1, the
sum converges to c_1 v_1 (up to normalization).

**Rate.** Error decreases by factor |lambda_2/lambda_1| per step. Wide
eigenvalue gaps mean fast convergence.

**Failure mode.** If |lambda_1| = |lambda_2| (e.g., eigenvalues +3 and -3),
the method may not converge. Shifted variants handle this case.

## Complexity

- Time: O(n^2) per iteration (matrix-vector product)
- Space: O(n)
- Total: O(n^2 * k) where k depends on the eigenvalue gap

## Applications

- PageRank (see [`pagerank`](../pagerank/))
- Dominant mode analysis in dynamical systems
- Starting point for more sophisticated eigensolvers
- Spectral clustering (via top eigenvectors)

## References

- [golub2013matrix] Golub & Van Loan, *Matrix Computations*, 4th ed., §7.3.
- [trefethen1997numerical] Trefethen & Bau, *Numerical Linear Algebra*, Lecture 27.
