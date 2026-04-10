# Singular Value Decomposition (SVD)

## TL;DR

Every m x n matrix A can be written as A = U diag(S) Vt, where U and V are
orthogonal and S contains the non-negative singular values. SVD is the
Swiss army knife of linear algebra: it reveals rank, condition number,
best low-rank approximations, and pseudoinverses.

## Intuition

Any linear map can be decomposed into three steps: (1) rotate/reflect the
input (V^T), (2) scale along coordinate axes (diag(S)), (3) rotate/reflect
the output (U). The singular values in S are the "stretching factors" --
how much each orthogonal direction gets amplified.

A circle mapped through A becomes an ellipse; the singular values are the
semi-axis lengths and U, V give the orientations.

## Statement

For any m x n real matrix A, there exist orthogonal matrices U (m x m),
V (n x n) and non-negative reals sigma_1 >= sigma_2 >= ... >= sigma_p >= 0
(p = min(m,n)) such that A = U * diag(sigma_1, ..., sigma_p) * V^T.

## Algorithm

One-sided Jacobi SVD:

```
B = copy(A), V = I
repeat until convergence:
    for each pair (p, q) with p < q:
        compute angle to zero B[:,p]^T B[:,q]
        apply Jacobi rotation to columns p,q of B and V
sigma[j] = ||B[:,j]||
U[:,j] = B[:,j] / sigma[j]
Sort by decreasing singular value
```

See [`mod.ts`](./mod.ts) for the runnable implementation.

## Proof or justification

**Existence.** A^T A is symmetric positive semi-definite, so it has an
eigendecomposition A^T A = V D V^T with D = diag(sigma_1^2, ...). Setting
U = A V diag(1/sigma_i) for non-zero singular values (and extending
orthogonally) gives A = U diag(S) V^T.

**Jacobi convergence.** Each rotation zeroes out one off-diagonal element of
B^T B while preserving the Frobenius norm. The sum of squared off-diagonal
elements decreases monotonically, guaranteeing convergence.

## Complexity

- Time: O(n^3) per sweep, typically O(n^3 log n) total for Jacobi
- Space: O(mn)
- Note: Production code uses bidiagonalization + implicit QR (LAPACK's
  dgesdd), which is O(mn^2) for m >= n. Jacobi is simpler but slower.

## Applications

- Low-rank matrix approximation (Eckart-Young theorem)
- Principal Component Analysis (PCA)
- Image compression
- Pseudoinverse and least-squares
- Latent Semantic Analysis in NLP
- Recommender systems (matrix completion)

## References

- [golub2013matrix] Golub & Van Loan, *Matrix Computations*, 4th ed., ch. 8.
- [trefethen1997numerical] Trefethen & Bau, *Numerical Linear Algebra*, Lectures 4-5.
- [demmel1997applied] Demmel, *Applied Numerical Linear Algebra*, §3.4.
