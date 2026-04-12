# showcase — Interactive mathcraft viewer

A Rust + Tauri v2 desktop application that turns the CLI JSON output of every
`demo.ts` into rich, interactive visualizations — without requiring any demo
to be rewritten.

## Running the app

```bash
cd apps/showcase
npm install
npm run tauri dev
```

The `deno` CLI must be on your PATH — the app shells out to it when running demos.

## Building a release binary

```bash
npm run tauri build
```

Produces a native binary + installer in `src-tauri/target/release/bundle/`.

---

## Why Rust + Tauri

- **Small binaries.** Tauri apps are 5–20 MB vs Electron's 100+ MB.
- **Real OS integration.** Native window, menu, file dialogs.
- **Rust backend.** Safe concurrency, fast filesystem scanning, sandboxing of
  child `deno` processes.
- **Web frontend.** Mature visualization ecosystem (D3, Three.js) for each
  viz kind.

---

## How it works

1. On launch, the Rust backend scans the repo's `domains/`, `frontiers/`, and
   `applications/` directories for every `demo.ts` file.
2. The user picks a concept from the browser. The UI renders the concept's
   `README.md` alongside a "Run demo" button.
3. Clicking "Run demo" spawns `deno run --allow-read <path>/demo.ts` as a
   child process, collects its stdout, and parses it as a
   [viz-contract document](../../docs/visualization-contract.md).
4. The frontend dispatches on the document's `kind` field and renders:
   - `graph` → force-directed or user-positioned layout (D3)
   - `curve` → line chart
   - `heatmap` → 2D colormap
   - `point-cloud` → 2D/3D scatter
   - `complex-plane` → annotated Argand diagram
   - `vector-field` → arrow grid
   - `scalar` → styled number card
5. If the document has `frames`, the UI shows a scrubber to step through the
   animation.

---

## Directory layout

```
showcase/
├── src-tauri/              # Rust backend
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       ├── main.rs
│       ├── lib.rs          # Tauri command registration
│       ├── scan.rs         # Discovers demo.ts files
│       └── run.rs          # Spawns deno child processes
├── src/                    # React + TypeScript frontend
│   ├── App.tsx             # Shell: sidebar + main panel
│   ├── types.ts            # Mirrors core/viz/emit.ts
│   ├── hooks/              # useDemos, useRunDemo
│   ├── components/         # Sidebar, DemoPanel, VizDisplay, AnimationScrubber
│   └── renderers/          # One per viz kind
├── package.json            # frontend deps (Vite + React + D3)
├── vite.config.ts
├── tsconfig.json
└── README.md               # this file
```

---

## What Phase 2 ships

- Tauri v2 binary (macOS/Linux/Windows)
- Renderers for all seven viz-contract `kind` values:
  `scalar`, `curve`, `heatmap`, `point-cloud`, `graph`, `complex-plane`, `vector-field`
- Concept browser sidebar grouped by section → category → concept
- Animation scrubber for `frames`-based demos

---

## What does **not** change in Phase 2

Nothing in the rest of the repo. Every `demo.ts` remains a pure function from
stdin (nothing) to stdout (one JSON document). The viz contract is the
interface, not the Tauri app's data model.

This is the key architectural decision of mathcraft: the CLI-first repo
ships today, and the GUI can be built, rebuilt, or replaced without touching
a single concept file.
