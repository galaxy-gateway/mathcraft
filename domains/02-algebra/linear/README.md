# 02.linear — Linear algebra

> **Flagship deep-dive.** Fully populated reference for the per-concept pattern.

Linear algebra is the language of everything continuous and high-dimensional:
graphics, physics, optimization, statistics, machine learning. If number
theory is the foundation for crypto, linear algebra is the foundation for
almost everything else in this repo.

## Concepts

| Concept                           | Summary                                    |
| --------------------------------- | ------------------------------------------ |
| [`gauss-elimination/`](./gauss-elimination/) | Solve Ax = b, compute rank and determinant |
| [`lu-decomposition/`](./lu-decomposition/) | Factor A = LU for repeated solves   |
| [`qr-decomposition/`](./qr-decomposition/) | Classical Gram–Schmidt orthogonalization |
| [`power-iteration/`](./power-iteration/) | Dominant eigenvalue/eigenvector      |
| [`qr-eigenvalues/`](./qr-eigenvalues/) | QR algorithm for full spectrum         |
| [`svd/`](./svd/)                  | Singular value decomposition (Jacobi)      |
| [`pagerank/`](./pagerank/)        | Power iteration on a stochastic graph      |

All concepts import `Matrix` and `Vector` from [`@math/core/linalg`](../../../core/linalg/mod.ts).
