interface Edge {
  u: number;
  v: number;
  weight: number;
  state?: "normal" | "exploring" | "chosen" | "rejected";
}

interface GraphMiniViewProps {
  edges: Edge[];
  selectedEdges: Edge[];
  currentEdge?: Edge;
  numVertices: number;
}

export const GraphMiniView = ({ edges, selectedEdges, currentEdge, numVertices }: GraphMiniViewProps) => {
  const size = 200;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = Math.min(size * 0.35, 70);
  
  // Calculate vertex positions in a circle
  const vertexPositions = Array.from({ length: numVertices }, (_, i) => {
    const angle = (i * 2 * Math.PI) / numVertices - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      id: i
    };
  });

  const getEdgeState = (edge: Edge): "normal" | "exploring" | "chosen" | "rejected" => {
    // Check if it's the current edge being explored
    if (currentEdge && 
        ((currentEdge.u === edge.u && currentEdge.v === edge.v) || 
         (currentEdge.u === edge.v && currentEdge.v === edge.u))) {
      return "exploring";
    }
    
    // Check if it's selected/chosen (in MST or SP tree)
    if (selectedEdges.some(e => 
      (e.u === edge.u && e.v === edge.v) || (e.u === edge.v && e.v === edge.u)
    )) {
      return "chosen";
    }
    
    return "normal";
  };

  const getEdgeColor = (state: string) => {
    switch (state) {
      case "chosen": return "#22c55e"; // lime/green
      case "exploring": return "#eab308"; // yellow
      case "rejected": return "#ef4444"; // red
      default: return "#6b7280"; // gray
    }
  };

  const getEdgeWidth = (state: string) => {
    return state === "chosen" ? 3 : state === "exploring" ? 2.5 : 1.5;
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
          
          return (
            <g key={`edge-${i}`}>
              <line
                x1={pos1.x}
                y1={pos1.y}
                x2={pos2.x}
                y2={pos2.y}
                stroke={getEdgeColor(state)}
                strokeWidth={getEdgeWidth(state)}
                className="transition-all duration-200"
              />
            </g>
          );
        })}
        
        {/* Draw vertices */}
        {vertexPositions.map((pos, i) => (
          <g key={`vertex-${i}`}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r="12"
              fill="#3b82f6"
              stroke="#1e40af"
              strokeWidth="2"
              className="transition-all duration-200"
            />
            <text
              x={pos.x}
              y={pos.y + 4}
              textAnchor="middle"
              className="text-[9px] fill-foreground font-semibold"
            >
              {i}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
