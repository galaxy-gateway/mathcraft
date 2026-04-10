# QR Algorithm for Eigenvalues

## TL;DR

The QR algorithm computes all eigenvalues of a matrix by iterating
A_{k+1} = R_k Q_k (where A_k = Q_k R_k). With Wilkinson shifts, it
converges cubically for symmetric matrices and is the workhorse behind
LAPACK's eigenvalue routines.

## Intuition

Each QR iteration is a similarity transformation (A_{k+1} = Q^T A_k Q),
so it preserves eigenvalues. The shifted QR step "targets" the eigenvalue
nearest the bottom-right corner, making the sub-diagonal entry converge to
zero cubically fast. Once it is small enough, we deflate (peel off the
converged eigenvalue) and continue with a smaller matrix.

## Statement

Given a symmetric n x n matrix A, the QR algorithm produces a sequence of
similar matrices A_k that converge to a diagonal matrix whose entries are
the eigenvalues of A.

## Algorithm

```
function qrEigenvalues(A):
    M = copy(A)
    while size > 1:
        if |M[size-1][size-2]| < tol:
            eigenvalues.push(M[size-1][size-1])
            deflate (shrink M)
            continue
        shift = wilkinsonShift(bottom-right 2x2)
        QR-decompose (M - shift * I) using Givens rotations
        M = R * Q + shift * I
    eigenvalues.push(M[0][0])
    sort eigenvalues
    return eigenvalues
```

See [`mod.ts`](./mod.ts) for the runnable implementation.

## Proof or justification

**Similarity.** If A = QR, then RQ = Q^T A Q, a similarity transformation.
Eigenvalues are preserved.

**Convergence.** For a symmetric matrix with distinct eigenvalues, the
shifted QR iteration converges cubically. The Wilkinson shift ensures
convergence even when eigenvalues are close.

**Deflation.** When the (n-1, n-2) sub-diagonal entry is negligible, the
bottom-right element is an eigenvalue to working precision. Removing it
reduces the problem size by one.

## Complexity

- Time: O(n^3) per iteration, O(n) iterations typical with shifts, so
  O(n^3) total (with Hessenberg reduction preprocessing, O(n^2) per iter)
- Space: O(n^2)
- Note: production code first reduces to tridiagonal form (for symmetric)
  or Hessenberg form (for general), then applies the QR iteration.

## Applications

- Computing all eigenvalues of symmetric matrices (vibration analysis, PCA)
- Underpins LAPACK routines dsyev/dsyevd
- Stability analysis of dynamical systems
- Quantum chemistry (Hamiltonian eigenvalues)

## References

- [golub2013matrix] Golub & Van Loan, *Matrix Computations*, 4th ed., ch. 7.
- [trefethen1997numerical] Trefethen & Bau, *Numerical Linear Algebra*, Lectures 25-29.
- [wilkinson1965algebraic] Wilkinson, *The Algebraic Eigenvalue Problem*.
