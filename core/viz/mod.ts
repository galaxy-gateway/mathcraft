/**
 * @math/core/viz — visualization contract encoder.
 *
 * Every `demo.ts` in the repository prints a single `VizDocument` to stdout.
 * Today the CLI workflow pretty-prints that JSON. In Phase 2, the Rust +
 * Tauri showcase app will consume the same JSON and render interactive
 * graphics — without any demo needing to be rewritten.
 *
 * See `docs/visualization-contract.md` for the full schema.
 */

export * from "./emit.ts";
