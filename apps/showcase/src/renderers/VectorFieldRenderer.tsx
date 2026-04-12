import { useRef, useEffect } from "react";
import * as d3 from "d3";
import type { VectorFieldData } from "../types";

interface Props {
  data: VectorFieldData;
  width: number;
  height: number;
}

const MARGIN = { top: 20, right: 20, bottom: 30, left: 40 };

export default function VectorFieldRenderer({ data, width, height }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.vectors?.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const w = width - MARGIN.left - MARGIN.right;
    const h = height - MARGIN.top - MARGIN.bottom;

    const rows = data.vectors.length;
    const cols = data.vectors[0].length;

    const xScale = d3.scaleLinear().domain(data.xRange).range([0, w]);
    const yScale = d3.scaleLinear().domain(data.yRange).range([h, 0]);

    const cellW = w / cols;
    const cellH = h / rows;
    const maxArrowLen = Math.min(cellW, cellH) * 0.4;

    // Find max magnitude for normalization
    let maxMag = 0;
    for (const row of data.vectors) {
      for (const [dx, dy] of row) {
        maxMag = Math.max(maxMag, Math.sqrt(dx * dx + dy * dy));
      }
    }
    if (maxMag === 0) maxMag = 1;

    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // Axes
    g.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(xScale).ticks(6)).attr("color", "var(--color-text-muted)");
    g.append("g").call(d3.axisLeft(yScale).ticks(6)).attr("color", "var(--color-text-muted)");

    // Arrow marker
    svg.append("defs").append("marker")
      .attr("id", "field-arrow")
      .attr("viewBox", "0 -3 6 6")
      .attr("refX", 6).attr("refY", 0)
      .attr("markerWidth", 4).attr("markerHeight", 4)
      .attr("orient", "auto")
      .append("path").attr("d", "M0,-3L6,0L0,3").attr("fill", "var(--color-accent)");

    // Draw vectors
    const xStep = (data.xRange[1] - data.xRange[0]) / cols;
    const yStep = (data.yRange[1] - data.yRange[0]) / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const [dx, dy] = data.vectors[r][c];
        const mag = Math.sqrt(dx * dx + dy * dy);
        if (mag < 1e-10) continue;

        const cx = xScale(data.xRange[0] + (c + 0.5) * xStep);
        const cy = yScale(data.yRange[0] + (r + 0.5) * yStep);

        const scale = (mag / maxMag) * maxArrowLen;
        const nx = (dx / mag) * scale;
        const ny = -(dy / mag) * scale; // flip y for SVG coords

        g.append("line")
          .attr("x1", cx - nx / 2)
          .attr("y1", cy - ny / 2)
          .attr("x2", cx + nx / 2)
          .attr("y2", cy + ny / 2)
          .attr("stroke", "var(--color-accent)")
          .attr("stroke-width", 1.5)
          .attr("marker-end", "url(#field-arrow)")
          .attr("opacity", 0.3 + 0.7 * (mag / maxMag));
      }
    }
  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height} />;
}
