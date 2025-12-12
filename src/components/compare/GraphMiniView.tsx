interface Edge {
  u: number;
  v: number;
  weight: number;
  state?: "normal" | "exploring" | "chosen" | "rejected";
}

interface Node {
  id: number;
  x: number;
  y: number;
}

interface Viewport {
  width: number;
  height: number;
  padding?: number;
}

/**
 * Compute label position for edge weight, ensuring it stays inside viewport
 */
function computeLabelPos(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  viewport: Viewport
): { x: number; y: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  
  // Normal vector (perpendicular to edge, pointing "up" relative to edge direction)
  let nx = -dy / len;
  let ny = dx / len;
  
  // Midpoint
  let mx = (x1 + x2) / 2;
  let my = (y1 + y2) / 2;
  
  // Base offset - scale with edge length but clamp to reasonable range
  let offset = Math.max(12, Math.min(24, Math.round(len * 0.08)));
  
  // Adjust offset for near-horizontal edges (more space above)
  if (Math.abs(dy / len) < 0.3) {
    offset *= 1.15;
  }
  // Reduce offset for very steep edges
  if (Math.abs(dx / len) < 0.1) {
    offset *= 0.9;
  }
  
  // Initial label position along normal
  let lx = mx + nx * offset;
  let ly = my + ny * offset;
  
  const pad = viewport.padding ?? 12;
  const maxX = viewport.width - pad;
  const maxY = viewport.height - pad;
  
  // Clamp to viewport bounds
  lx = Math.max(pad, Math.min(maxX, lx));
  ly = Math.max(pad, Math.min(maxY, ly));
  
  // If label was clamped to boundary, try flipping normal (other side of edge)
  if (lx === pad || lx === maxX || ly === pad || ly === maxY) {
    nx = -nx;
    ny = -ny;
    lx = mx + nx * offset;
    ly = my + ny * offset;
    // Re-clamp
    lx = Math.max(pad, Math.min(maxX, lx));
    ly = Math.max(pad, Math.min(maxY, ly));
  }
  
  return { x: lx, y: ly };
}

/**
 * Format weight for display: handle Infinity and large numbers
 */
function formatWeight(weight: number): string {
  if (weight === Infinity || weight === Number.POSITIVE_INFINITY || !Number.isFinite(weight)) {
    return "∞";
  }
  if (weight >= 10000) {
    return (weight / 1000).toFixed(1) + "k";
  }
  if (weight >= 1000) {
    return (weight / 1000).toFixed(1) + "k";
  }
  return String(Math.round(weight * 10) / 10); // Round to 1 decimal
}

interface GraphMiniViewProps {
  nodes?: Node[];
  edges: Edge[];
  selectedEdges: Edge[];
  currentEdge?: Edge | null;
  numVertices: number;
  distances?: number[]; // For Dijkstra: distance from source to each node
  relaxedEdge?: Edge | null; // For Dijkstra: edge that was just relaxed (yellow)
  currentVertex?: number | null; // For Dijkstra: currently selected node
}

export const GraphMiniView = ({ 
  nodes, 
  edges, 
  selectedEdges, 
  currentEdge, 
  numVertices,
  distances,
  relaxedEdge,
  currentVertex
}: GraphMiniViewProps) => {
  const size = 200;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = Math.min(size * 0.35, 70);
  
  // Use provided nodes or calculate positions in a circle
  const vertexPositions: Node[] = nodes && nodes.length > 0
    ? nodes
    : Array.from({ length: numVertices }, (_, i) => {
        const angle = (i * 2 * Math.PI) / numVertices - Math.PI / 2;
        return {
          id: i,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        };
      });

  const getEdgeState = (edge: Edge): "normal" | "exploring" | "chosen" | "rejected" | "relaxed" => {
    // Check if it's the relaxed edge (yellow, for Dijkstra)
    if (relaxedEdge && 
        ((relaxedEdge.u === edge.u && relaxedEdge.v === edge.v) || 
         (relaxedEdge.u === edge.v && relaxedEdge.v === edge.u))) {
      return "relaxed";
    }
    
    // Check if it's the current edge being explored (highlight)
    if (currentEdge && 
        ((currentEdge.u === edge.u && currentEdge.v === edge.v) || 
         (currentEdge.u === edge.v && currentEdge.v === edge.u))) {
      return "exploring";
    }
    
    // Check if it's selected/chosen (in MST or shortest path tree)
    if (selectedEdges.some(e => 
      (e.u === edge.u && e.v === edge.v) || (e.u === edge.v && e.v === edge.u)
    )) {
      return "chosen";
    }
    
    return "normal";
  };

  const getEdgeColor = (state: string) => {
    switch (state) {
      case "chosen": return "#4ADE80"; // green for selected
      case "relaxed": return "#FFD86B"; // yellow for relaxed (Dijkstra)
      case "exploring": return "#FF6B6B"; // red for highlight during consideration
      case "rejected": return "#FF6B6B"; // red for rejected
      default: return "#6FA8FF"; // base color
    }
  };

  const getEdgeOpacity = (state: string) => {
    switch (state) {
      case "chosen": return 1; // Full opacity for selected
      case "relaxed": return 1; // Full opacity for relaxed
      case "exploring": return 1; // Full opacity for highlight
      case "rejected": return 1; // Full opacity for rejected
      default: return 0.25; // Faint for base edges
    }
  };

  const getEdgeWidth = (state: string) => {
    return state === "chosen" ? 3 : state === "exploring" ? 2.5 : 1.5;
  };

  // Define viewport for label positioning
  const viewport: Viewport = {
    width: size,
    height: size,
    padding: 12,
  };

  return (
    <div className="w-full h-40 bg-background/50 rounded-lg p-2 border border-border/30">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
        {/* Draw edges */}
        {edges.map((edge, i) => {
          const pos1 = vertexPositions[edge.u];
          const pos2 = vertexPositions[edge.v];
          const state = getEdgeState(edge);
          
          if (!pos1 || !pos2) return null;
          
          // Compute robust label position
          const labelPos = computeLabelPos(pos1.x, pos1.y, pos2.x, pos2.y, viewport);
          const labelText = formatWeight(edge.weight);
          
          // Determine font size based on label length
          const fontSize = labelText.length > 4 ? 10 : 11;
          
          // Estimate text width for background rectangle (approximate: ~6px per char)
          const textWidth = labelText.length * 6;
          const textHeight = fontSize + 4;
          const bgPadding = 4;
          
          return (
            <g key={`edge-${i}`} className="edge-group" style={{ pointerEvents: "none" }}>
              <line
                x1={pos1.x}
                y1={pos1.y}
                x2={pos2.x}
                y2={pos2.y}
                stroke={getEdgeColor(state)}
                strokeWidth={getEdgeWidth(state)}
                opacity={getEdgeOpacity(state)}
                className="transition-all duration-200"
              />
              {/* Background rectangle for readability */}
              <rect
                x={labelPos.x - textWidth / 2 - bgPadding}
                y={labelPos.y - textHeight / 2 - bgPadding}
                width={textWidth + bgPadding * 2}
                height={textHeight + bgPadding * 2}
                rx={3}
                fill="rgba(10, 20, 30, 0.45)"
                stroke="none"
                style={{ pointerEvents: "none" }}
              />
              {/* Edge weight label */}
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={fontSize}
                fill="#E6F3FF"
                fontWeight="bold"
                className="pointer-events-none"
                style={{ 
                  textShadow: "0 0 2px rgba(0, 0, 0, 0.8)",
                  userSelect: "none"
                }}
                aria-label={`weight: ${labelText === "∞" ? "infinity" : labelText}`}
              >
                {labelText}
              </text>
            </g>
          );
        })}
        
        {/* Draw vertices */}
        {vertexPositions.map((pos, i) => {
          const isCurrent = currentVertex === i;
          const dist = distances && distances[i] !== undefined ? distances[i] : null;
          const formatDistance = (d: number): string => {
            if (!Number.isFinite(d)) return "∞";
            return String(d);
          };
          
          return (
            <g key={`vertex-${i}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="12"
                fill={isCurrent ? "#4ADE80" : "#3b82f6"}
                stroke={isCurrent ? "#22c55e" : "#1e40af"}
                strokeWidth={isCurrent ? "3" : "2"}
                className="transition-all duration-200"
              />
              {/* Node ID */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dy={dist !== null ? "-8" : "4"}
                fontSize="12px"
                fill="#ffffff"
                fontWeight="bold"
                className="pointer-events-none"
                style={{ textShadow: "0 0 2px rgba(0, 0, 0, 0.5)" }}
              >
                {pos.id}
              </text>
              {/* Distance label (for Dijkstra) */}
              {dist !== null && (
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dy="18"
                  fontSize="10px"
                  fill="#C9D7FF"
                  fontWeight="normal"
                  className="pointer-events-none"
                  style={{ textShadow: "0 0 2px rgba(0, 0, 0, 0.5)" }}
                >
                  {formatDistance(dist)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
