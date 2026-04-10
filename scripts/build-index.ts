#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Discover all concept directories and print a summary table.
 *
 * Usage:
 *   deno task build:index
 *
 * Scans domains/, frontiers/, applications/ for directories containing
 * mod.ts and prints a markdown table of all concepts.
 */

import { walk } from "jsr:@std/fs@^1.0.6/walk";

interface Concept {
  path: string;
  hasReadme: boolean;
  hasTest: boolean;
  hasDemo: boolean;
}

const concepts: Concept[] = [];

for await (
  const entry of walk(".", {
    includeDirs: false,
    match: [/mod\.ts$/],
    skip: [/node_modules/, /\.git/, /core\//, /scripts\//],
  })
) {
  const dir = entry.path.replace(/\/mod\.ts$/, "");
  // Skip barrel modules (mod.ts that re-export).
  if (dir === "." || dir.endsWith("/mod")) continue;

  const hasReadme = await exists(`${dir}/README.md`);
  const hasTest = await exists(`${dir}/mod_test.ts`);
  const hasDemo = await exists(`${dir}/demo.ts`);

  concepts.push({ path: dir, hasReadme, hasTest, hasDemo });
}

concepts.sort((a, b) => a.path.localeCompare(b.path));

console.log(`# Concept index (${concepts.length} concepts)\n`);
console.log("| Path | README | Tests | Demo |");
console.log("| ---- | :----: | :---: | :--: |");
for (const c of concepts) {
  const check = (b: boolean) => (b ? "yes" : "—");
  console.log(
    `| \`${c.path}\` | ${check(c.hasReadme)} | ${check(c.hasTest)} | ${check(c.hasDemo)} |`,
  );
}

async function exists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}
