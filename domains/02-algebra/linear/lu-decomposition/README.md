# LU Decomposition

## TL;DR

LU decomposition factors a matrix A into a product PA = LU, where P is a
permutation, L is unit lower-triangular, and U is upper-triangular. Once
computed, solving Ax = b for any b requires only O(n^2) forward/back
substitution instead of O(n^3) elimination.

## Intuition

Gaussian elimination transforms A into upper-triangular form U by
subtracting multiples of rows. If we record those multipliers, they form a
lower-triangular matrix L. The row swaps we performed are captured by P.
This means we have "frozen" the elimination process into two simple
triangular factors that can be reused for any right-hand side.

## Statement

Given an n x n matrix A, find permutation matrix P, unit lower-triangular L,
and upper-triangular U such that PA = LU.

## Algorithm

```
function lu(A):
    L = I, U = copy(A), perm = [0..n-1]
    for col = 0 to n-1:
        pivot = argmax |U[r][col]| for r >= col
        swap rows col and pivot in U, L (computed part), perm
        for r = col+1 to n-1:
            L[r][col] = U[r][col] / U[col][col]
            U[r] -= L[r][col] * U[col]
    Build P from perm
    return {L, U, P}
```

To solve Ax = b:
1. Compute Pb
2. Forward-substitute Ly = Pb
3. Back-substitute Ux = y

See [`mod.ts`](./mod.ts) for the runnable implementation.

## Proof or justification

**Correctness.** The elimination steps are identical to Gaussian elimination.
Recording multipliers in L means we can reproduce the elimination: L * U
applies the multipliers in L to rows of U, reconstructing the original row
ordering PA.

**Uniqueness.** For non-singular A with a fixed pivoting strategy, the
factorization is unique (L has unit diagonal).

## Complexity

- Factorization: O(n^3) — same as Gaussian elimination
- Each solve: O(n^2) — forward + back substitution
- Space: O(n^2) for L and U
- Key win: factor once, solve for many right-hand sides cheaply

## Applications

- Repeated solves with the same coefficient matrix (e.g., time-stepping PDEs)
- Computing determinants: det(A) = det(U) * sign(P)
- Matrix inversion (column by column)
- Foundation for Cholesky decomposition (symmetric positive-definite case)

## References

- [golub2013matrix] Golub & Van Loan, *Matrix Computations*, 4th ed., §3.2.
- [trefethen1997numerical] Trefethen & Bau, *Numerical Linear Algebra*, Lecture 20.
