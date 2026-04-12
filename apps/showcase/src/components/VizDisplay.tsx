import { useState, useRef, useEffect, useCallback } from "react";
import type { VizDocument } from "../types";
import AnimationScrubber from "./AnimationScrubber";
import ScalarRenderer from "../renderers/ScalarRenderer";
import CurveRenderer from "../renderers/CurveRenderer";
import GraphRenderer from "../renderers/GraphRenderer";
import HeatmapRenderer from "../renderers/HeatmapRenderer";
import PointCloudRenderer from "../renderers/PointCloudRenderer";
import ComplexPlaneRenderer from "../renderers/ComplexPlaneRenderer";
import VectorFieldRenderer from "../renderers/VectorFieldRenderer";

interface Props {
  document: VizDocument;
}

export default function VizDisplay({ document: doc }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 600, height: 400 });
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width: Math.floor(width), height: Math.floor(height) - (doc.frames ? 50 : 0) });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [doc.frames]);

  // Merge frame data over base data
  const currentData = (() => {
    if (!doc.frames || doc.frames.length === 0) return doc.data;
    const frame = doc.frames[frameIndex];
    return { ...doc.data, ...(frame?.data ?? {}) };
  })();

  const handleFrameChange = useCallback((i: number) => setFrameIndex(i), []);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 min-h-0">
        {renderViz(doc.kind, currentData, size.width, size.height)}
      </div>
      {doc.frames && doc.frames.length > 0 && (
        <AnimationScrubber frames={doc.frames} onFrameChange={handleFrameChange} />
      )}
    </div>
  );
}

function renderViz(
  kind: string,
  data: Record<string, unknown>,
  width: number,
  height: number,
) {
  if (width < 10 || height < 10) return null;

  switch (kind) {
    case "scalar":
      return <ScalarRenderer data={data as never} />;
    case "curve":
      return <CurveRenderer data={data as never} width={width} height={height} />;
    case "graph":
      return <GraphRenderer data={data as never} width={width} height={height} />;
    case "heatmap":
      return <HeatmapRenderer data={data as never} width={width} height={height} />;
    case "point-cloud":
      return <PointCloudRenderer data={data as never} width={width} height={height} />;
    case "complex-plane":
      return <ComplexPlaneRenderer data={data as never} width={width} height={height} />;
    case "vector-field":
      return <VectorFieldRenderer data={data as never} width={width} height={height} />;
    default:
      return (
        <div className="p-4 text-[var(--color-text-muted)]">
          <p>Unknown visualization kind: <code>{kind}</code></p>
          <pre className="text-xs mt-2">{JSON.stringify(data, null, 2)}</pre>
        </div>
      );
  }
}
