# Spectral Clustering — Graph partitioning via Laplacian eigenvectors

## TL;DR

Spectral clustering embeds graph nodes into a low-dimensional space
using eigenvectors of the graph Laplacian, then applies k-means to find
clusters. It naturally detects community structure and handles
non-convex clusters that k-means alone would miss.

## Intuition

The graph Laplacian L = D - A encodes how "connected" each pair of nodes
is. Its smallest eigenvectors capture the coarsest structure of the
graph: the Fiedler vector (2nd-smallest eigenvector) takes similar values
on tightly-connected nodes and different values across sparse cuts.

By using the k smallest eigenvectors as coordinates, we map nodes into
a space where well-connected groups form tight clusters, making the
problem easy for k-means.

Think of it as letting the graph "vibrate" like a drum: the lowest
frequency modes reveal the natural divisions.

## Statement

Given:
- An adjacency matrix A (symmetric, non-negative),
- A desired number of clusters k,

spectral clustering produces a labelling c: V -> {0, ..., k-1} that
approximately minimizes the normalized or ratio cut.

## Algorithm

```
function spectralCluster(A, k):
    D ← diagonal degree matrix (D[i][i] = sum of row i of A)
    L ← D - A                          // graph Laplacian
    U ← k eigenvectors of L with smallest eigenvalues
    // Each row of U is a k-dimensional embedding of a node.
    labels ← kMeans(rows of U, k)
    return labels
```

For eigenvectors, we use shifted power iteration with deflation:
1. Compute S = sigma*I - L (sigma > largest eigenvalue of L).
2. Largest eigenvectors of S = smallest eigenvectors of L.
3. After finding each eigenvector, deflate to remove its component.

See [`mod.ts`](./mod.ts) for the runnable implementation.

## Proof or justification

**Laplacian properties.**
- L is symmetric positive semi-definite (x^T L x = sum over edges w_ij (x_i - x_j)^2 >= 0).
- Smallest eigenvalue is 0, with eigenvector [1, 1, ..., 1].
- Number of zero eigenvalues = number of connected components.

**Why eigenvectors work.** The ratio-cut minimization problem is NP-hard,
but relaxing the discrete constraint (labels in {0,1}) to continuous
vectors yields an eigenvector problem. The Fiedler vector solves the
relaxed 2-way cut problem (Fiedler, 1973).

**k-means in eigenspace.** Shi & Malik (2000) and Ng, Jordan & Weiss
(2002) showed that for well-separated clusters, the eigenvector embedding
maps nodes to near-orthogonal points, making k-means effective.

## Complexity

- Laplacian construction: O(n^2).
- Eigenvector computation (power iteration): O(k * maxIter * n^2).
- k-means: O(k * n * d * maxIter) where d = k.
- Total: O(k * n^2 * maxIter) dominated by eigenvector computation.

For large sparse graphs, Lanczos iteration would be more efficient
(O(k * E * maxIter)), but is beyond this educational implementation.

## Applications

- Community detection in social networks.
- Image segmentation (pixels as nodes, similarity as edge weights).
- Document clustering (similarity graph of documents).
- Protein complex detection in biological networks.
- Circuit partitioning in VLSI design.

## References

- [fiedler1973algebraic] Fiedler, "Algebraic connectivity of graphs", *Czech. Math. Journal*, 1973.
- [shi2000normalized] Shi & Malik, "Normalized cuts and image segmentation", *IEEE TPAMI*, 2000.
- [ng2002spectral] Ng, Jordan & Weiss, "On spectral clustering: Analysis and an algorithm", *NIPS*, 2002.
- [von2007tutorial] von Luxburg, "A tutorial on spectral clustering", *Statistics and Computing*, 2007.
