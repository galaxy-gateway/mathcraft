import { useRef, useEffect } from "react";
import * as d3 from "d3";
import type { PointCloudData } from "../types";

interface Props {
  data: PointCloudData;
  width: number;
  height: number;
}

const MARGIN = { top: 20, right: 20, bottom: 30, left: 40 };
const COLORS = d3.schemeCategory10;

export default function PointCloudRenderer({ data, width, height }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.points?.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const w = width - MARGIN.left - MARGIN.right;
    const h = height - MARGIN.top - MARGIN.bottom;

    // Project 3D to 2D if needed (simple isometric)
    const projected = data.points.map((p) => {
      if (p.length === 3) {
        return [p[0] - 0.5 * p[2], p[1] - 0.3 * p[2]] as [number, number];
      }
      return [p[0], p[1]] as [number, number];
    });

    const xExtent = d3.extent(projected, (p) => p[0]) as [number, number];
    const yExtent = d3.extent(projected, (p) => p[1]) as [number, number];
    const pad = 0.05;
    const xPad = (xExtent[1] - xExtent[0]) * pad || 1;
    const yPad = (yExtent[1] - yExtent[0]) * pad || 1;

    const xScale = d3
      .scaleLinear()
      .domain([xExtent[0] - xPad, xExtent[1] + xPad])
      .range([0, w]);
    const yScale = d3
      .scaleLinear()
      .domain([yExtent[0] - yPad, yExtent[1] + yPad])
      .range([h, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .attr("color", "var(--color-text-muted)");

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(6))
      .attr("color", "var(--color-text-muted)");

    // Label color mapping
    const uniqueLabels = data.labels
      ? [...new Set(data.labels)]
      : [];
    const labelColor = (i: number) => {
      if (!data.labels) return "var(--color-accent)";
      const label = data.labels[i];
      const idx = uniqueLabels.indexOf(label);
      return COLORS[idx % COLORS.length];
    };

    // Points
    projected.forEach((p, i) => {
      g.append("circle")
        .attr("cx", xScale(p[0]))
        .attr("cy", yScale(p[1]))
        .attr("r", 4)
        .attr("fill", labelColor(i))
        .attr("opacity", 0.8);
    });

    // Legend for labels
    if (uniqueLabels.length > 1 && uniqueLabels.length <= 10) {
      const legend = g.append("g").attr("transform", `translate(${w - 80}, 5)`);
      uniqueLabels.forEach((label, i) => {
        const row = legend.append("g").attr("transform", `translate(0, ${i * 16})`);
        row.append("circle").attr("r", 4).attr("cx", 4).attr("cy", 4).attr("fill", COLORS[i % COLORS.length]);
        row
          .append("text")
          .attr("x", 14)
          .attr("y", 8)
          .attr("fill", "var(--color-text-muted)")
          .attr("font-size", "10px")
          .text(String(label));
      });
    }
  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height} />;
}
