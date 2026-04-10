# QR Decomposition

## TL;DR

QR decomposition factors A into Q (orthonormal columns) times R
(upper-triangular). It is more numerically stable than LU for solving
least-squares problems and is the foundation of the QR eigenvalue algorithm.

## Intuition

The columns of A span some subspace. Gram-Schmidt orthogonalization walks
through those columns one by one, subtracting away the components that lie
along previously processed directions, then normalizing. The result is an
orthonormal basis Q for the column space, and R records the coefficients
used in the expansion A = QR.

## Statement

Given an m x n matrix A with m >= n and linearly independent columns, there
exist a unique m x n matrix Q with orthonormal columns and a unique n x n
upper-triangular matrix R with positive diagonal such that A = QR.

## Algorithm

Classical Gram-Schmidt:

```
for j = 0 to n-1:
    v = A[:, j]
    for i = 0 to j-1:
        R[i][j] = q[i] . A[:, j]
        v = v - R[i][j] * q[i]
    R[j][j] = ||v||
    q[j] = v / R[j][j]
```

See [`mod.ts`](./mod.ts) for the runnable implementation.

## Proof or justification

**Orthonormality.** By construction, each q[j] is orthogonal to q[0..j-1]
(we subtract all projections) and has unit norm (we normalize). Formally,
this is the Gram-Schmidt process applied to the columns of A.

**Factorization.** Column j of A can be written as a linear combination of
q[0..j] (the projections plus the normalized remainder). Collecting
coefficients gives the j-th column of R.

**Uniqueness.** If Q has orthonormal columns and R has positive diagonal,
both are uniquely determined by A (Golub & Van Loan, Theorem 5.2.2).

## Complexity

- Time: O(mn^2) for an m x n matrix
- Space: O(mn)
- Numerical note: Classical Gram-Schmidt can lose orthogonality for
  ill-conditioned matrices. Modified Gram-Schmidt or Householder
  reflections are preferred in production.

## Applications

- Solving least-squares problems (Ax approximately equals b)
- QR algorithm for eigenvalues (see [`qr-eigenvalues`](../qr-eigenvalues/))
- Orthogonal bases for Krylov subspaces (GMRES, Arnoldi)
- Statistical regression (fitting linear models)

## References

- [golub2013matrix] Golub & Van Loan, *Matrix Computations*, 4th ed., §5.2.
- [trefethen1997numerical] Trefethen & Bau, *Numerical Linear Algebra*, Lectures 7-8.
