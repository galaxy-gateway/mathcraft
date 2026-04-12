import { useRef, useEffect } from "react";
import * as d3 from "d3";
import type { CurveData } from "../types";

interface Props {
  data: CurveData;
  width: number;
  height: number;
}

const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };
const COLORS = d3.schemeCategory10;

export default function CurveRenderer({ data, width, height }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.series?.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const w = width - MARGIN.left - MARGIN.right;
    const h = height - MARGIN.top - MARGIN.bottom;

    // Compute extent across all series
    const allPoints = data.series.flatMap((s) => s.points);
    const xExtent = d3.extent(allPoints, (p) => p[0]) as [number, number];
    const yExtent = d3.extent(allPoints, (p) => p[1]) as [number, number];

    // Pad y range slightly
    const yPad = (yExtent[1] - yExtent[0]) * 0.05 || 1;

    const xScale = d3.scaleLinear().domain(xExtent).range([0, w]);
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
      .call(d3.axisBottom(xScale).ticks(8))
      .attr("color", "var(--color-text-muted)")
      .selectAll("text")
      .attr("fill", "var(--color-text-muted)");

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(6))
      .attr("color", "var(--color-text-muted)")
      .selectAll("text")
      .attr("fill", "var(--color-text-muted)");

    // Axis labels
    if (data.xLabel) {
      g.append("text")
        .attr("x", w / 2)
        .attr("y", h + 35)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--color-text-muted)")
        .attr("font-size", "12px")
        .text(data.xLabel);
    }
    if (data.yLabel) {
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -h / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--color-text-muted)")
        .attr("font-size", "12px")
        .text(data.yLabel);
    }

    // Lines
    const line = d3
      .line<[number, number]>()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]));

    data.series.forEach((series, i) => {
      g.append("path")
        .datum(series.points)
        .attr("fill", "none")
        .attr("stroke", COLORS[i % COLORS.length])
        .attr("stroke-width", 2)
        .attr("d", line);
    });

    // Legend
    if (data.series.length > 1) {
      const legend = g
        .append("g")
        .attr("transform", `translate(${w - 120}, 5)`);
      data.series.forEach((series, i) => {
        const row = legend
          .append("g")
          .attr("transform", `translate(0, ${i * 18})`);
        row
          .append("rect")
          .attr("width", 12)
          .attr("height", 3)
          .attr("y", 4)
          .attr("fill", COLORS[i % COLORS.length]);
        row
          .append("text")
          .attr("x", 16)
          .attr("y", 9)
          .attr("fill", "var(--color-text-muted)")
          .attr("font-size", "10px")
          .text(series.label);
      });
    }
  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height} />;
}
