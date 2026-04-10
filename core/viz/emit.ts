/**
 * Visualization contract (schema v1).
 *
 * `VizDocument` is the one object every `demo.ts` emits to stdout. The
 * `kind` discriminator selects the renderer in the Phase 2 Tauri app.
 */

export const SCHEMA_VERSION = 1 as const;

export type VizKind =
  | "curve"
  | "heatmap"
  | "point-cloud"
  | "graph"
  | "complex-plane"
  | "vector-field"
  | "scalar";

export interface Annotation {
  text: string;
  at?: [number, number];
}

export interface CurveData {
  xLabel?: string;
  yLabel?: string;
  series: Array<{
    label: string;
    points: Array<[number, number]>;
  }>;
}

export interface HeatmapData {
  xRange: [number, number];
  yRange: [number, number];
  /** Row-major `values[row][col]`. */
  values: number[][];
}

export interface PointCloudData {
  points: Array<[number, number] | [number, number, number]>;
  labels?: Array<number | string>;
}

export interface GraphNode {
  id: string;
  label?: string;
  position?: [number, number];
  group?: string | number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight?: number;
  label?: string;
}

export interface GraphData {
  directed?: boolean;
  nodes: GraphNode[];
  edges: GraphEdge[];
  highlight?: {
    nodes?: string[];
    edges?: Array<[string, string]>;
  };
}

export interface ComplexPlanePoint {
  re: number;
  im: number;
  label?: string;
}

export interface ComplexPlaneCurve {
  label: string;
  samples: Array<{ re: number; im: number }>;
}

export interface ComplexPlaneData {
  points?: ComplexPlanePoint[];
  curves?: ComplexPlaneCurve[];
}

export interface VectorFieldData {
  xRange: [number, number];
  yRange: [number, number];
  vectors: Array<Array<[number, number]>>;
}

export interface ScalarData {
  value: number | string | Record<string, unknown>;
}

export type VizData =
  | ({ kind: "curve" } & CurveData)
  | ({ kind: "heatmap" } & HeatmapData)
  | ({ kind: "point-cloud" } & PointCloudData)
  | ({ kind: "graph" } & GraphData)
  | ({ kind: "complex-plane" } & ComplexPlaneData)
  | ({ kind: "vector-field" } & VectorFieldData)
  | ({ kind: "scalar" } & ScalarData);

export interface Frame {
  step: number;
  label?: string;
  data: Record<string, unknown>;
}

export interface VizDocument {
  schema: typeof SCHEMA_VERSION;
  kind: VizKind;
  title: string;
  description?: string;
  annotations?: Annotation[];
  frames?: Frame[];
  data: Record<string, unknown>;
}

export interface EmitOptions {
  kind: VizKind;
  title: string;
  description?: string;
  annotations?: Annotation[];
  frames?: Frame[];
  data: Record<string, unknown>;
}

/**
 * Build a `VizDocument` from the caller's options. Pure; no I/O.
 *
 * `emit()` wraps this with `console.log(JSON.stringify(…, null, 2))` for
 * convenient use in `demo.ts` files; `buildDocument` is exported separately
 * so tests can assert on the document shape without capturing stdout.
 */
export function buildDocument(opts: EmitOptions): VizDocument {
  if (!opts.title) throw new Error("VizDocument requires a non-empty title");
  if (!opts.data) throw new Error("VizDocument requires data");
  return {
    schema: SCHEMA_VERSION,
    kind: opts.kind,
    title: opts.title,
    description: opts.description,
    annotations: opts.annotations,
    frames: opts.frames,
    data: opts.data,
  };
}

/**
 * Pretty-print a visualization document to stdout.
 *
 * Use this in `demo.ts` files. The Phase 2 Tauri app will parse the exact
 * same JSON and render it interactively.
 */
export function emit(opts: EmitOptions): void {
  const doc = buildDocument(opts);
  console.log(JSON.stringify(doc, null, 2));
}
