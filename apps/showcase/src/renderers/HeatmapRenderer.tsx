import { useRef, useEffect } from "react";
import * as d3 from "d3";
import type { HeatmapData } from "../types";

interface Props {
  data: HeatmapData;
  width: number;
  height: number;
}

const MARGIN = { top: 10, right: 60, bottom: 30, left: 40 };

export default function HeatmapRenderer({ data, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !svgRef.current || !data.values?.length) return;

    const rows = data.values.length;
    const cols = data.values[0].length;
    const w = width - MARGIN.left - MARGIN.right;
    const h = height - MARGIN.top - MARGIN.bottom;

    // Find value extent
    const flat = data.values.flat();
    const [vMin, vMax] = d3.extent(flat) as [number, number];
    const colorScale = d3.scaleSequential(d3.interpolateViridis).domain([vMin, vMax]);

    // Draw on canvas
    const canvas = canvasRef.current;
    canvas.width = w;
    canvas.height = h;
    canvas.style.position = "absolute";
    canvas.style.left = `${MARGIN.left}px`;
    canvas.style.top = `${MARGIN.top}px`;

    const ctx = canvas.getContext("2d")!;
    const cellW = w / cols;
    const cellH = h / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = colorScale(data.values[r][c]);
        ctx.fillRect(c * cellW, r * cellH, cellW + 0.5, cellH + 0.5);
      }
    }

    // SVG axes overlay
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const xScale = d3.scaleLinear().domain(data.xRange).range([0, w]);
    const yScale = d3.scaleLinear().domain(data.yRange).range([h, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    g.append("g")
      .attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .attr("color", "var(--color-text-muted)");

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(6))
      .attr("color", "var(--color-text-muted)");

    // Color bar
    const barWidth = 12;
    const barHeight = h;
    const barG = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left + w + 10},${MARGIN.top})`);

    const barScale = d3.scaleLinear().domain([vMax, vMin]).range([0, barHeight]);
    const steps = 50;
    for (let i = 0; i < steps; i++) {
      const val = vMin + ((vMax - vMin) * i) / steps;
      barG
        .append("rect")
        .attr("x", 0)
        .attr("y", barScale(val))
        .attr("width", barWidth)
        .attr("height", barHeight / steps + 1)
        .attr("fill", colorScale(val));
    }

    barG
      .append("g")
      .attr("transform", `translate(${barWidth}, 0)`)
      .call(d3.axisRight(barScale).ticks(5))
      .attr("color", "var(--color-text-muted)");
  }, [data, width, height]);

  return (
    <div style={{ position: "relative", width, height }}>
      <canvas ref={canvasRef} />
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      />
    </div>
  );
}
