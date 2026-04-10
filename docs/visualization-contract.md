# Visualization contract

Every `demo.ts` in the repository prints a single JSON document to stdout
conforming to this schema. The CLI workflow today pretty-prints it; the
Phase 2 Tauri showcase consumes the same document and renders interactive
graphics.

**Schema version:** `1`

---

## Envelope

```ts
interface VizDocument {
  /** Schema version. Bump on breaking changes. */
  schema: 1;
  /** Discriminator for the renderer. */
  kind: VizKind;
  /** Short title rendered above the visualization. */
  title: string;
  /** Optional prose — what the reader should take away. */
  description?: string;
  /** Optional free-form annotations (text overlays, legends). */
  annotations?: Annotation[];
  /** Optional animation frames. Presence means the demo is time-stepped. */
  frames?: Frame[];
  /** The payload. Shape depends on `kind`. */
  data: VizData;
}
```

The `kind` discriminator selects the renderer. Phase 1 supports:

- `"curve"` — 1D or parametric curves over a real or complex domain
- `"heatmap"` — 2D scalar field
- `"point-cloud"` — unordered set of points in 2D or 3D
- `"graph"` — nodes and edges, optionally weighted and directed
- `"complex-plane"` — annotated points/curves on the complex plane
- `"vector-field"` — vectors sampled on a grid
- `"scalar"` — a single number or short struct; no visual, used for
  pure-number demos like prime factorizations

Phase 2's Tauri app will ship a renderer for each `kind`. Additional kinds can
be added in future schema versions.

---

## Shared types

```ts
interface Annotation {
  text: string;
  at?: [number, number]; // position in data coordinates, optional
}

interface Frame {
  step: number;
  label?: string;
  /** Partial override of `data`. Unspecified fields carry forward. */
  data: Partial<VizData>;
}
```

---

## `kind: "curve"`

```ts
interface CurveData {
  xLabel?: string;
  yLabel?: string;
  series: Array<{
    label: string;
    points: Array<[number, number]>;
  }>;
}
```

---

## `kind: "heatmap"`

```ts
interface HeatmapData {
  xRange: [number, number];
  yRange: [number, number];
  /** Row-major values[row][col]. */
  values: number[][];
}
```

---

## `kind: "point-cloud"`

```ts
interface PointCloudData {
  points: Array<[number, number] | [number, number, number]>;
  /** Per-point labels for color mapping. */
  labels?: Array<number | string>;
}
```

---

## `kind: "graph"`

```ts
interface GraphData {
  directed?: boolean;
  nodes: Array<{
    id: string;
    label?: string;
    position?: [number, number];
    group?: string | number;
  }>;
  edges: Array<{
    source: string;
    target: string;
    weight?: number;
    label?: string;
  }>;
  /** IDs of nodes to highlight, e.g. a path. */
  highlight?: { nodes?: string[]; edges?: Array<[string, string]> };
}
```

---

## `kind: "complex-plane"`

```ts
interface ComplexPlaneData {
  points?: Array<{ re: number; im: number; label?: string }>;
  curves?: Array<{
    label: string;
    samples: Array<{ re: number; im: number }>;
  }>;
}
```

---

## `kind: "vector-field"`

```ts
interface VectorFieldData {
  xRange: [number, number];
  yRange: [number, number];
  /** Grid of (dx, dy) vectors, row-major. */
  vectors: Array<Array<[number, number]>>;
}
```

---

## `kind: "scalar"`

```ts
interface ScalarData {
  value: number | string | Record<string, unknown>;
}
```

Used when the "demo" is a single number — e.g., "GCD of 1071 and 462 is 21"
or a prime factorization. The CLI prints it; the Tauri app shows it as a
styled number card.

---

## Emission helper

Demos should use the helper in `core/viz/emit.ts`:

```ts
import { emit } from "@math/core/viz";

emit({
  kind: "graph",
  title: "Dijkstra on a 6-node graph",
  description: "Shortest path from A to F.",
  data: {
    directed: false,
    nodes: [/* … */],
    edges: [/* … */],
    highlight: { nodes: ["A", "C", "F"] },
  },
});
```

`emit` wraps the document with `schema: 1`, validates the shape in development,
and pretty-prints it to stdout.
