import { Edge } from "@/lib/graphGenerator";

interface Node {
  id: number;
  x: number;
  y: number;
  label: string;
}

interface GraphViewProps {
  nodes: Node[];
  edges: Edge[];
  selectedEdges?: Edge[];
  currentEdge?: Edge;
  theme?: "greedy" | "dp";
  nodeStates?: Set<number> | number[]; // Visited nodes
  edgeStates?: Map<string, "selected" | "considering" | "normal">; // Edge states
}

export const GraphView = ({ 
  nodes, 
  edges, 
  selectedEdges = [], 
  currentEdge,
  theme = "greedy",
  nodeStates,
  edgeStates
}: GraphViewProps) => {
  const size = 500;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = Math.min(size * 0.35, 150);

  // Calculate positions if not provided
  const maxVertex = edges.length > 0 
    ? Math.max(...edges.flatMap(e => [e.u, e.v])) 
    : (nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) : 0);
  const numVertices = nodes.length > 0 ? nodes.length : maxVertex + 1;
  
  const vertexPositions = nodes.length > 0
    ? nodes.map(n => ({ x: n.x, y: n.y, id: n.id }))
    : Array.from({ length: numVertices }, (_, i) => {
        const angle = (i * 2 * Math.PI) / numVertices - Math.PI / 2;
        return {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          id: i
        };
      });

  const isEdgeSelected = (edge: Edge) => {
    if (edgeStates) {
      const key = `${edge.u}-${edge.v}`;
      const altKey = `${edge.v}-${edge.u}`;
      return edgeStates.get(key) === "selected" || edgeStates.get(altKey) === "selected";
    }
    return selectedEdges.some(e =>
      (e.u === edge.u && e.v === edge.v) || (e.u === edge.v && e.v === edge.u)
    );
  };

  const isCurrentEdge = (edge: Edge) => {
    if (edgeStates) {
      const key = `${edge.u}-${edge.v}`;
      const altKey = `${edge.v}-${edge.u}`;
      const state = edgeStates.get(key) || edgeStates.get(altKey);
      return state === "considering";
    }
    if (!currentEdge) return false;
    return (currentEdge.u === edge.u && currentEdge.v === edge.v) ||
           (currentEdge.u === edge.v && currentEdge.v === edge.u);
  };

  const isNodeVisited = (nodeId: number) => {
    if (!nodeStates) return false;
    if (nodeStates instanceof Set) return nodeStates.has(nodeId);
    return nodeStates.includes(nodeId);
  };

  // Theme-based colors
  const isDPTheme = theme === "dp";
  
  // DP Theme colors (as specified)
  const nodeFill = isDPTheme ? "#6d5dfc" : "#06b6d4"; // Lavender-purple for DP
  const nodeStroke = isDPTheme ? "#9b8aff" : "#0891b2";
  const nodeStrokeWidth = isDPTheme ? 1.8 : 2;
  const nodeGlow = isDPTheme 
    ? "drop-shadow(0 0 6px rgba(125, 110, 255, 0.55))" 
    : "drop-shadow(0 0 4px rgba(6, 182, 212, 0.5))";
  
  // Edge colors - DP theme uses specific colors
  const edgeColorNormal = isDPTheme ? "rgba(255, 255, 255, 0.45)" : "#9EE7C4";
  const edgeColorSelected = isDPTheme ? "#22c55e" : "#22c55e"; // Green for selected
  const edgeColorConsidering = isDPTheme ? "#fbbf24" : "#fbbf24"; // Amber for considering
  const edgeStrokeWidth = isDPTheme ? 2.1 : 2;
  const edgeStrokeLinecap = isDPTheme ? "round" : "butt";

  return (
    <div className="bg-card rounded-xl p-6 border border-border mb-6">
      <h3 className="text-lg font-semibold mb-4">Graph</h3>
      <div className="bg-background/50 rounded-lg p-4 border border-border/50">
        <svg width="100%" height="400" viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
          {/* Draw edges */}
          {edges.map((edge, i) => {
            const pos1 = vertexPositions.find(p => p.id === edge.u);
            const pos2 = vertexPositions.find(p => p.id === edge.v);
            
            if (!pos1 || !pos2) return null;

            const selected = isEdgeSelected(edge);
            const considering = isCurrentEdge(edge);
            const edgeColor = selected ? edgeColorSelected : considering ? edgeColorConsidering : edgeColorNormal;
            const strokeWidth = selected ? (edgeStrokeWidth + 1) : considering ? (edgeStrokeWidth + 0.5) : edgeStrokeWidth;
            const edgeGlow = selected 
              ? "drop-shadow(0 0 4px rgba(34, 197, 94, 0.6))"
              : considering
              ? "drop-shadow(0 0 4px rgba(251, 191, 36, 0.6))"
              : "none";

            return (
              <g key={`edge-${i}`}>
                <line
                  x1={pos1.x}
                  y1={pos1.y}
                  x2={pos2.x}
                  y2={pos2.y}
                  stroke={edgeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap={edgeStrokeLinecap}
                  className="transition-all duration-200"
                  style={isDPTheme && edgeGlow !== "none" ? { filter: edgeGlow } : {}}
                />
                {/* Edge weight label - centered above the line */}
                <text
                  x={(pos1.x + pos2.x) / 2}
                  y={(pos1.y + pos2.y) / 2 - 8}
                  fill={isDPTheme ? "#e0e7ff" : "#ffffff"}
                  fontSize={isDPTheme ? 12 : 11}
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="pointer-events-none"
                  style={{
                    textShadow: isDPTheme 
                      ? "0 0 4px rgba(0, 0, 0, 0.45)" 
                      : "0 0 4px rgba(0, 0, 0, 0.6), 0 0 2px rgba(0, 0, 0, 0.8)",
                    fontWeight: "500"
                  }}
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Draw nodes */}
          {vertexPositions.map((pos) => {
            const visited = isNodeVisited(pos.id);
            
            return (
              <g key={`vertex-${pos.id}`}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isDPTheme ? 16 : 14}
                  fill={nodeFill}
                  stroke={nodeStroke}
                  strokeWidth={nodeStrokeWidth}
                  className="transition-all duration-200"
                  style={{ filter: nodeGlow }}
                />
                <text
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight={isDPTheme ? 600 : "bold"}
                  className="pointer-events-none"
                  style={{
                    textShadow: isDPTheme ? "0 0 3px rgba(0, 0, 0, 0.5)" : "none"
                  }}
                >
                  {pos.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default GraphView;
