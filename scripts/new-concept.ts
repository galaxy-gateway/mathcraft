#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Scaffold a new concept directory from the standard template.
 *
 * Usage:
 *   deno task new domains/02-algebra/abstract/cyclic-groups
 *
 * Creates:
 *   domains/02-algebra/abstract/cyclic-groups/
 *     ├── README.md
 *     ├── mod.ts
 *     ├── mod_test.ts
 *     └── demo.ts
 */

const conceptPath = Deno.args[0];
if (!conceptPath) {
  console.error("Usage: deno task new <path>");
  console.error("  e.g. deno task new domains/02-algebra/abstract/cyclic-groups");
  Deno.exit(1);
}

const conceptName = conceptPath.split("/").pop()!;
const exportName = conceptName
  .split("-")
  .map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1)))
  .join("");

const readme = `# ${conceptName}

## TL;DR

<One-sentence summary.>

## Intuition

<Analogy, picture, or small worked example.>

## Statement

<Formal theorem, problem, or definition.>

## Algorithm

\`\`\`
Input:  …
Output: …
\`\`\`

See [\`mod.ts\`](./mod.ts) for the runnable implementation.

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
`;

const modTs = `/**
 * ${conceptName} — one-line description.
 *
 * @example
 * \`\`\`ts
 * import { ${exportName} } from "./mod.ts";
 * ${exportName}(/* args */);
 * \`\`\`
 */
export function ${exportName}(/* args */): unknown {
  throw new Error("not implemented");
}
`;

const modTestTs = `import { assertEquals } from "@std/assert";
// import * as fc from "fast-check";
import { ${exportName} } from "./mod.ts";

Deno.test("${conceptName} — reference value", () => {
  // assertEquals(${exportName}(/* args */), /* expected */);
});
`;

const demoTs = `import { emit } from "@math/core/viz";
// import { ${exportName} } from "./mod.ts";

emit({
  kind: "scalar",
  title: "${conceptName}",
  description: "TODO: describe what the reader should take away.",
  data: { value: "TODO" },
});
`;

try {
  await Deno.mkdir(conceptPath, { recursive: true });
  await Deno.writeTextFile(`${conceptPath}/README.md`, readme);
  await Deno.writeTextFile(`${conceptPath}/mod.ts`, modTs);
  await Deno.writeTextFile(`${conceptPath}/mod_test.ts`, modTestTs);
  await Deno.writeTextFile(`${conceptPath}/demo.ts`, demoTs);
  console.log(`✓ Scaffolded ${conceptPath}/`);
  console.log("  Created: README.md, mod.ts, mod_test.ts, demo.ts");
  console.log(`  Export name: ${exportName}`);
} catch (e) {
  console.error(`Error: ${e}`);
  Deno.exit(1);
}
