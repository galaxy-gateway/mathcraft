/** Mirrors the viz contract from core/viz/emit.ts */

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

export interface Frame {
  step: number;
  label?: string;
  data: Record<string, unknown>;
}

export interface VizDocument {
  schema: 1;
  kind: VizKind;
  title: string;
  description?: string;
  annotations?: Annotation[];
  frames?: Frame[];
  data: Record<string, unknown>;
}

// Per-kind data shapes

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

export interface ComplexPlaneData {
  points?: Array<{ re: number; im: number; label?: string }>;
  curves?: Array<{
    label: string;
    samples: Array<{ re: number; im: number }>;
  }>;
}

export interface VectorFieldData {
  xRange: [number, number];
  yRange: [number, number];
  vectors: Array<Array<[number, number]>>;
}

export interface ScalarData {
  value: number | string | Record<string, unknown>;
}

// Backend types

export interface DemoEntry {
  path: string;
  slug: string;
  category: string;
  section: string;
}

export interface RunResult {
  stdout: string;
  stderr: string;
  exit_code: number;
}
