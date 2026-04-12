import { useRef, useEffect } from "react";
import * as d3 from "d3";
import type { GraphData, GraphNode, GraphEdge } from "../types";

interface Props {
  data: GraphData;
  width: number;
  height: number;
}

const COLORS = d3.schemeCategory10;

export default function GraphRenderer({ data, width, height }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const MARGIN = 40;
    const w = width - 2 * MARGIN;
    const h = height - 2 * MARGIN;

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN},${MARGIN})`);

    const highlightNodes = new Set(data.highlight?.nodes ?? []);
    const highlightEdges = new Set(
      (data.highlight?.edges ?? []).map(([s, t]) => `${s}->${t}`),
    );

    // Arrow marker for directed graphs
    if (data.directed) {
      svg
        .append("defs")
        .append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "var(--color-text-muted)");

      svg
        .select("defs")
        .append("marker")
        .attr("id", "arrowhead-highlight")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#f59e0b");
    }

    // Determine if we have positions
    const hasPositions = data.nodes.every((n) => n.position != null);

    // Build node position map
    type NodePos = GraphNode & { x: number; y: number };
    let nodePositions: NodePos[];

    if (hasPositions) {
      const xs = data.nodes.map((n) => n.position![0]);
      const ys = data.nodes.map((n) => n.position![1]);
      const xScale = d3
        .scaleLinear()
        .domain([Math.min(...xs), Math.max(...xs)])
        .range([0, w]);
      const yScale = d3
        .scaleLinear()
        .domain([Math.min(...ys), Math.max(...ys)])
        .range([0, h]);

      nodePositions = data.nodes.map((n) => ({
        ...n,
        x: xScale(n.position![0]),
        y: yScale(n.position![1]),
      }));
    } else {
      // Force-directed layout
      const simNodes = data.nodes.map((n) => ({ ...n, x: w / 2, y: h / 2 }));
      const simLinks = data.edges.map((e) => ({
        source: data.nodes.findIndex((n) => n.id === e.source),
        target: data.nodes.findIndex((n) => n.id === e.target),
      }));

      const simulation = d3
        .forceSimulation(simNodes)
        .force(
          "link",
          d3
            .forceLink(simLinks)
            .distance(80)
            .id((_, i) => i),
        )
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(w / 2, h / 2))
        .force("collision", d3.forceCollide(30))
        .stop();

      for (let i = 0; i < 300; i++) simulation.tick();

      nodePositions = simNodes as NodePos[];
    }

    const nodeById = new Map(nodePositions.map((n) => [n.id, n]));

    // Group colors
    const groups = [...new Set(data.nodes.map((n) => n.group).filter((g) => g != null))];
    const groupColor = (g?: string | number) => {
      if (g == null) return "var(--color-text-muted)";
      const idx = groups.indexOf(g);
      return COLORS[idx % COLORS.length];
    };

    // Draw edges
    const edgeG = g.append("g");
    data.edges.forEach((edge: GraphEdge) => {
      const s = nodeById.get(edge.source);
      const t = nodeById.get(edge.target);
      if (!s || !t) return;

      const edgeKey = `${edge.source}->${edge.target}`;
      const edgeKeyRev = `${edge.target}->${edge.source}`;
      const isHighlighted =
        highlightEdges.has(edgeKey) || highlightEdges.has(edgeKeyRev);

      edgeG
        .append("line")
        .attr("x1", s.x)
        .attr("y1", s.y)
        .attr("x2", t.x)
        .attr("y2", t.y)
        .attr("stroke", isHighlighted ? "#f59e0b" : "var(--color-border)")
        .attr("stroke-width", isHighlighted ? 2.5 : 1.5)
        .attr("marker-end", data.directed ? (isHighlighted ? "url(#arrowhead-highlight)" : "url(#arrowhead)") : null);

      // Edge label
      if (edge.weight != null || edge.label) {
        edgeG
          .append("text")
          .attr("x", (s.x + t.x) / 2)
          .attr("y", (s.y + t.y) / 2 - 6)
          .attr("text-anchor", "middle")
          .attr("fill", "var(--color-text-muted)")
          .attr("font-size", "9px")
          .text(edge.label ?? String(edge.weight));
      }
    });

    // Draw nodes
    const nodeG = g.append("g");
    nodePositions.forEach((node) => {
      const isHighlighted = highlightNodes.has(node.id);

      nodeG
        .append("circle")
        .attr("cx", node.x)
        .attr("cy", node.y)
        .attr("r", isHighlighted ? 10 : 8)
        .attr("fill", isHighlighted ? "#f59e0b" : groupColor(node.group))
        .attr("stroke", isHighlighted ? "#fbbf24" : "var(--color-bg)")
        .attr("stroke-width", 2);

      nodeG
        .append("text")
        .attr("x", node.x)
        .attr("y", node.y + 20)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--color-text)")
        .attr("font-size", "11px")
        .attr("font-weight", isHighlighted ? "bold" : "normal")
        .text(node.label ?? node.id);
    });
  }, [data, width, height]);

  return <svg ref={svgRef} width={width} height={height} />;
}
