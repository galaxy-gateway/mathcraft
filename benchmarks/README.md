# benchmarks/

Hot-path benchmarks tracked via `Deno.bench()`. Run with:

```bash
deno task bench
```

Add a benchmark when a concept in `core/` or a flagship deep-dive exposes a
performance-sensitive function. The goal is to track perf across Deno
versions and catch regressions.

**Planned benchmarks:**

- `core/linalg` — matmul, LU solve, QR, SVD
- `domains/01-number-theory/modular-exponentiation` — `aᵇ mod n` on 2048-bit BigInts
- `domains/06-discrete/graph-theory/dijkstra` — shortest path on 10k-node random graph
- `domains/08-optimization/convex/gradient-descent` — iterations per second on a 100-dim quadratic
