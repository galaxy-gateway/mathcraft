# scripts/

Repo tooling, all TypeScript, all runnable with Deno.

| Script                | Task                        | What it does                                 |
| --------------------- | --------------------------- | -------------------------------------------- |
| `new-concept.ts`      | `deno task new`             | Scaffolds a new concept from the template    |
| `check-citations.ts`  | `deno task check:citations` | Verifies every deep-dive cites real BibTeX keys |
| `build-index.ts`      | `deno task build:index`     | Regenerates navigation tables in READMEs     |
| `bump-version.ts`     | `deno task bump`            | Bumps version in deno.json (patch/minor/major/x.y.z) |
