import { useRef, useEffect } from "react";
import * as d3 from "d3";
import type { ComplexPlaneData } from "../types";

interface Props {
  data: ComplexPlaneData;
  width: number;
  height: number;
}

const MARGIN = { top: 20, right: 20, bottom: 30, left: 40 };
const COLORS = d3.schemeCategory10;

export default function ComplexPlaneRenderer({ data, width, height }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const w = width - MARGIN.left - MARGIN.right;
    const h = height - MARGIN.top - MARGIN.bottom;

    // Collect all coordinates to determine scale
    const allRe: number[] = [];
    const allIm: number[] = [];
    data.points?.forEach((p) => {
      allRe.push(p.re);
      allIm.push(p.im);
    });
    data.curves?.forEach((c) => {
      c.samples.forEach((s) => {
        allRe.push(s.re);
        allIm.push(s.im);
      });
    });

    if (allRe.length === 0) return;

    const reExtent = d3.extent(allRe) as [number, number];
    const imExtent = d3.extent(allIm) as [number, number];
    const pad = Math.max((reExtent[1] - reExtent[0]) * 0.1, (imExtent[1] - imExtent[0]) * 0.1, 0.5);

    const xScale = d3.scaleLinear().domain([reExtent[0] - pad, reExtent[1] + pad]).range([0, w]);
    const yScale = d3.scaleLinear().domain([imExtent[0] - pad, imExtent[1] + pad]).range([h, 0]);

    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // Grid lines at origin
    if (xScale.domain()[0] <= 0 && xScale.domain()[1] >= 0) {
      g.append("line")
        .attr("x1", xScale(0)).attr("y1", 0)
        .attr("x2", xScale(0)).attr("y2", h)
        .attr("stroke", "var(--color-border)").attr("stroke-dasharray", "3,3");
    }
    if (yScale.domain()[0] <= 0 && yScale.domain()[1] >= 0) {
      g.append("line")
        .attr("x1", 0).attr("y1", yScale(0))
        .attr("x2", w).attr("y2", yScale(0))
        .attr("stroke", "var(--color-border)").attr("stroke-dasharray", "3,3");
    }

    // Axes
    g.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(xScale).ticks(6)).attr("color", "var(--color-text-muted)");
    g.append("g").call(d3.axisLeft(yScale).ticks(6)).attr("color", "var(--color-text-muted)");

    // Axis labels
    g.append("text").attr("x", w / 2).attr("y", h + 28).attr("text-anchor", "middle").attr("fill", "var(--color-text-muted)").attr("font-size", "11px").text("Re");
    g.append("text").attr("transform", "rotate(-90)").attr("x", -h / 2).attr("y", -30).attr("text-anchor", "middle").attr("fill", "var(--color-text-muted)").attr("font-size", "11px").text("Im");

    // Curves
    data.curves?.forEach((curve, i) => {
      const line = d3.line<{ re: number; im: number }>()
        .x((d) => xScale(d.re))
        .y((d) => yScale(d.im));
      g.append("path")
        .datum(curve.samples)
        .attr("fill", "none")
        .attr("stroke", COLORS[i % COLORS.length])
        .attr("stroke-width", 2)
        .attr("d", line);
    });

    // Points
    data.points?.forEach((p) => {
      g.append("circle")
        .attr("cx", xScale(p.re))
        .attr("cy", yScale(p.im))
        .attr("r", 5)
        .attr("fill", "var(--color-accent)")
        .attr("stroke", "var(--color-bg)")
        .attr("stroke-width", 1.5);

      if (p.label) {
        g.append("text")
          .attr("x", xScale(p.re) + 8)
          .attr("y", yScale(p.im) + 4)
          .attr("fill", "var(--color-text)")
          .attr("font-size", "10px")
          .text(p.label);
      }
    });
  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height} />;
}
