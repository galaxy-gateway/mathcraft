# Gaussian Elimination

## TL;DR

Gaussian elimination transforms a linear system Ax = b into upper-triangular
form by row operations, then solves by back substitution. With partial
pivoting it is the standard direct method for dense linear systems.

## Intuition

Think of a system of equations as a set of constraints. Elimination
systematically removes variables from equations by subtracting multiples of
one equation from another. After enough steps, the last equation involves
only one variable, the second-to-last involves two, and so on — making back
substitution trivial.

Worked example — solve:

```
2x +  y -  z =  8
-3x -  y + 2z = -11
-2x +  y + 2z = -3
```

Forward elimination produces:

```
2x + y - z = 8
     0.5y + 0.5z = 1
               z = -1
```

Back substitution: z = -1, y = 3, x = 2.

## Statement

Given an n x n non-singular matrix A and vector b, find x such that Ax = b.
Partial pivoting: at each step, swap the current row with the row below it
that has the largest absolute value in the pivot column.

## Algorithm

```
function gaussEliminate(A, b):
    Form augmented matrix [A | b]
    For col = 0 to n-1:
        Find pivot: row with max |a[r][col]| for r >= col
        Swap rows col and pivot
        For each row r > col:
            factor = a[r][col] / a[col][col]
            Subtract factor * row[col] from row[r]
    Back substitute to find x
    Return {x, rank, determinant}
```

See [`mod.ts`](./mod.ts) for the runnable implementation.

## Proof or justification

**Correctness.** Row operations (add a scalar multiple of one row to another,
swap two rows) do not change the solution set of Ax = b. After forward
elimination the system is upper-triangular, and back substitution correctly
inverts a triangular system by construction.

**Partial pivoting.** Choosing the largest pivot minimizes the magnitude of
the multipliers (factor <= 1), bounding round-off error growth. In practice,
partial pivoting makes Gaussian elimination stable for almost all matrices.

**Determinant.** The determinant equals the product of pivots times (-1)^s
where s is the number of row swaps.

## Complexity

- Time: O(n^3) arithmetic operations
- Space: O(n^2)
- Numerical: stable with partial pivoting (growth factor bounded by 2^(n-1)
  in theory, much smaller in practice)

## Applications

- Solving dense linear systems directly
- Computing determinants and matrix rank
- Foundation for LU decomposition (next topic)
- Circuit analysis, structural engineering, least squares

## References

- [golub2013matrix] Golub & Van Loan, *Matrix Computations*, 4th ed., §3.4.
- [trefethen1997numerical] Trefethen & Bau, *Numerical Linear Algebra*, Lectures 20-22.
