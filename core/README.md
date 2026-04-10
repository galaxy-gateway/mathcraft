# core/

Shared primitives used across every mathcraft domain. This is the only
module intended to be published (eventually to JSR as `@math/core`).

| Module                 | Contents                                    |
| ---------------------- | ------------------------------------------- |
| [`numeric/`](./numeric/) | BigInt helpers, Rational, Complex         |
| [`linalg/`](./linalg/) | Vector, Matrix (dense)                      |
| [`random/`](./random/) | Seeded PRNG (PCG) and basic distributions   |
| [`viz/`](./viz/)       | Visualization contract encoder              |
| [`testing/`](./testing/) | Tolerance assertions, fast-check helpers  |

Import from domains via the import map:

```ts
import { Matrix, Vector } from "@math/core/linalg";
import { mod, modInverse } from "@math/core/numeric";
import { pcg } from "@math/core/random";
import { emit } from "@math/core/viz";
import { assertCloseTo } from "@math/core/testing";
```
