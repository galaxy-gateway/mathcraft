# Concept template

Copy-paste scaffold the `new-concept.ts` script uses when creating a new concept.

---

## `README.md`

```markdown
# {{concept-name}}

## TL;DR

<One-sentence summary a hobbyist can read.>

## Intuition

<Analogy, picture, or small worked example.>

## Statement

<Formal theorem, problem, or definition.>

## Algorithm

```
Input:  …
Output: …
```

See [`mod.ts`](./mod.ts) for the runnable implementation.

## Proof or justification

<Proof sketch or link.>

## Complexity

- Time: …
- Space: …
- Numerical: …

## Applications

- …

## References

- [key1] …
- [key2] …
```

---

## `mod.ts`

```ts
/**
 * {{concept-name}} — one-line description.
 *
 * @example
 * ```ts
 * import { {{exportName}} } from "./mod.ts";
 * {{exportName}}(…);
 * ```
 */
export function {{exportName}}(/* args */): unknown {
  throw new Error("not implemented");
}
```

---

## `mod_test.ts`

```ts
import { assertEquals } from "@std/assert";
import * as fc from "fast-check";
import { {{exportName}} } from "./mod.ts";

Deno.test("{{concept-name}} — reference value", () => {
  assertEquals({{exportName}}(/* args */), /* expected */);
});

Deno.test("{{concept-name}} — property", () => {
  fc.assert(
    fc.property(fc.integer(), (n) => {
      // property to check
      return true;
    }),
    { numRuns: 100 },
  );
});
```

---

## `demo.ts`

```ts
import { emit } from "@math/core/viz";
import { {{exportName}} } from "./mod.ts";

const input = /* small illustrative input */ null;
const result = {{exportName}}(input as never);

emit({
  kind: "curve",
  title: "{{concept-name}}",
  description: "What the reader should take away.",
  series: [],
  annotations: [{ text: String(result) }],
});
```
