# PageRank

## TL;DR

PageRank models a "random surfer" who follows hyperlinks with probability d
and teleports to a random page with probability 1-d. The stationary
distribution of this Markov chain gives each page an importance score.
Power iteration on the Google matrix converges quickly because the
second-largest eigenvalue is at most d (typically 0.85).

## Intuition

A page is important if important pages link to it. This circular definition
is resolved by the stationary distribution of the random walk: start on any
page, follow a random outgoing link (or teleport), and repeat. The fraction
of time spent on each page, in the long run, is its PageRank.

## Statement

Given a directed graph with n pages and adjacency matrix A (A[i][j] = 1 if
page i links to page j), define the Google matrix:

    M = d * H + (1 - d)/n * J

where H is the column-stochastic hyperlink matrix (distributing each page's
rank equally among its out-links, with dangling nodes distributing to all
pages) and J is the all-ones matrix. The PageRank vector r satisfies Mr = r
and sum(r) = 1.

## Algorithm

```
function pagerank(A, d, tol):
    r = uniform vector (1/n each)
    repeat:
        r_new = d * H * r + (1-d)/n * ones
        if ||r_new - r||_1 < tol: break
        r = r_new
    return r
```

Dangling nodes (out-degree 0) distribute their mass uniformly.

See [`mod.ts`](./mod.ts) for the runnable implementation.

## Proof or justification

**Existence and uniqueness.** The Google matrix M is a column-stochastic
matrix with all positive entries (due to the teleport term), so by the
Perron-Frobenius theorem it has a unique stationary distribution.

**Convergence.** The second-largest eigenvalue of M is at most d (the
damping factor). Power iteration converges geometrically with rate d,
so with d = 0.85, each iteration reduces the error by ~15%.

**Dangling nodes.** A dangling page (no outlinks) acts as if it links to
all pages, preventing the random surfer from getting stuck.

## Complexity

- Time: O(n * E) per iteration where E is the number of edges
  (sparse), or O(n^2) per iteration (dense, as here)
- Space: O(n + E) or O(n^2) dense
- Iterations: O(log(1/tol) / log(1/d)), typically 50-100

## Applications

- Web search ranking (Google's original algorithm)
- Citation network analysis
- Social network influence scores
- Recommendation systems
- Any graph where "importance flows through links"

## References

- [brin1998anatomy] Brin & Page, "The Anatomy of a Large-Scale Hypertextual Web Search Engine," 1998.
- [langville2006google] Langville & Meyer, *Google's PageRank and Beyond*, 2006.
- [golub2013matrix] Golub & Van Loan, *Matrix Computations*, 4th ed., §7.3.
