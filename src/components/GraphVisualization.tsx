"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface GraphVisualizationProps {
  paths: Array<{ role_names: string[] }>;
  currentRole: string;
  targetRole: string;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  type: "current" | "target" | "intermediate";
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

export default function GraphVisualization({
  paths,
  currentRole,
  targetRole,
}: GraphVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({ width: Math.max(width, 400), height: 500 });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || paths.length === 0) return;

    const { width, height } = dimensions;

    const nodeSet = new Set<string>();
    const linkSet = new Set<string>();
    const links: GraphLink[] = [];

    paths.forEach((path) => {
      path.role_names.forEach((role) => nodeSet.add(role));
      for (let i = 0; i < path.role_names.length - 1; i++) {
        const key = `${path.role_names[i]}|${path.role_names[i + 1]}`;
        if (!linkSet.has(key)) {
          linkSet.add(key);
          links.push({
            source: path.role_names[i],
            target: path.role_names[i + 1],
          });
        }
      }
    });

    const nodes: GraphNode[] = Array.from(nodeSet).map((id) => ({
      id,
      type:
        id === currentRole
          ? "current"
          : id === targetRole
            ? "target"
            : "intermediate",
    }));

    d3.select(svg).selectAll("*").remove();

    const svgSelection = d3
      .select(svg)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svgSelection.append("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svgSelection.call(zoom);

    g.append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#6366f1");

    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#6366f1")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)");

    const nodeGroup = g
      .append("g")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .join("g")
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    nodeGroup
      .append("circle")
      .attr("r", 20)
      .attr("fill", (d) => {
        if (d.type === "current") return "#22c55e";
        if (d.type === "target") return "#eab308";
        return "#6366f1";
      })
      .attr("stroke", (d) => {
        if (d.type === "current") return "#4ade80";
        if (d.type === "target") return "#facc15";
        return "#818cf8";
      })
      .attr("stroke-width", 2)
      .attr("opacity", 0)
      .transition()
      .duration(600)
      .delay((_, i) => i * 100)
      .attr("opacity", 1);

    nodeGroup
      .append("text")
      .text((d) => d.id)
      .attr("text-anchor", "middle")
      .attr("dy", 35)
      .attr("fill", "#e2e8f0")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .attr("opacity", 0)
      .transition()
      .duration(600)
      .delay((_, i) => i * 100)
      .attr("opacity", 1);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x ?? 0)
        .attr("y1", (d) => (d.source as GraphNode).y ?? 0)
        .attr("x2", (d) => (d.target as GraphNode).x ?? 0)
        .attr("y2", (d) => (d.target as GraphNode).y ?? 0);

      nodeGroup.attr(
        "transform",
        (d) => `translate(${d.x ?? 0},${d.y ?? 0})`
      );
    });

    return () => {
      simulation.stop();
    };
  }, [paths, currentRole, targetRole, dimensions]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden bg-gray-900/50 border border-gray-700"
    >
      <svg ref={svgRef} className="w-full" style={{ height: "500px" }} />
      <div className="flex items-center justify-center gap-6 py-3 border-t border-gray-700 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
          Current Role
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
          Target Role
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
          Intermediate
        </span>
      </div>
    </div>
  );
}
