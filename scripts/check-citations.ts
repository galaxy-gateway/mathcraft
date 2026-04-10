#!/usr/bin/env -S deno run --allow-read

/**
 * Verify that every deep-dive README.md has a ## References section and
 * that every cited key exists in CITATIONS.bib.
 *
 * Usage:
 *   deno task check:citations
 */

import { walk } from "jsr:@std/fs@^1.0.6/walk";

const bibPath = "CITATIONS.bib";
const bibText = await Deno.readTextFile(bibPath);

// Extract all BibTeX keys: @type{key, ...}
const bibKeys = new Set<string>();
for (const match of bibText.matchAll(/@\w+\{(\w+)/g)) {
  bibKeys.add(match[1]);
}

let errors = 0;
let checked = 0;

// Walk concept directories: any dir with both mod.ts and README.md is
// a concept that should have references.
for await (
  const entry of walk(".", {
    includeDirs: false,
    match: [/README\.md$/],
    skip: [/node_modules/, /\.git/, /core\//],
  })
) {
  const path = entry.path;

  // Only check concept-level READMEs (those in dirs that also have mod.ts).
  const dir = path.replace(/\/README\.md$/, "");
  try {
    await Deno.stat(`${dir}/mod.ts`);
  } catch {
    continue; // Not a concept directory.
  }

  checked++;
  const text = await Deno.readTextFile(path);

  // Must have a ## References section.
  if (!text.includes("## References")) {
    console.error(`MISSING ## References: ${path}`);
    errors++;
    continue;
  }

  // Check that every [key] citation exists in bib.
  const refSection = text.slice(text.indexOf("## References"));
  for (const match of refSection.matchAll(/\[(\w+)\]/g)) {
    const key = match[1];
    if (!bibKeys.has(key)) {
      console.error(`UNKNOWN citation key [${key}] in ${path}`);
      errors++;
    }
  }
}

console.log(`Checked ${checked} concept READMEs.`);
if (errors > 0) {
  console.error(`${errors} error(s) found.`);
  Deno.exit(1);
} else {
  console.log("All citations OK.");
}
