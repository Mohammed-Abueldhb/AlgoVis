interface Edge {
  u: number;
  v: number;
  weight: number;
}

interface GraphFrame {
  type: 'init' | 'edgeConsider' | 'edgeSelect' | 'edgeSkip' | 'vertexRelax' | 'complete';
  edges: Edge[];
  selectedEdges: Edge[];
  currentEdge?: Edge;
  visited?: number[];
  distances?: number[];
  currentVertex?: number;
  priorityQueue?: Array<{ vertex: number; distance: number }>;
  components?: number[][];
  labels?: { title?: string; detail?: string };
}

interface GraphVisualizerProps {
  frame: GraphFrame;
  numVertices?: number;
}

export const GraphVisualizer = ({ frame, numVertices = 6 }: GraphVisualizerProps) => {
  // Calculate vertex positions in a circle
  const centerX = 250;
  const centerY = 200;
  const radius = 120;
  
  const vertexPositions = Array.from({ length: numVertices }, (_, i) => {
    const angle = (i * 2 * Math.PI) / numVertices - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });

  const isEdgeSelected = (edge: Edge) => {
    return frame.selectedEdges.some(e => 
      (e.u === edge.u && e.v === edge.v) || (e.u === edge.v && e.v === edge.u)
    );
  };

  const isCurrentEdge = (edge: Edge) => {
    if (!frame.currentEdge) return false;
    const curr = frame.currentEdge;
    return (curr.u === edge.u && curr.v === edge.v) || (curr.u === edge.v && curr.v === edge.u);
  };

  const isVertexVisited = (vertex: number) => {
    return frame.visited?.includes(vertex) || false;
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Graph Visualization</h3>
        {frame.labels && (
          <div>
            <div className="font-semibold text-accent">{frame.labels.title}</div>
            {frame.labels.detail && (
              <div className="text-sm text-muted-foreground mt-1">{frame.labels.detail}</div>
            )}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_200px] gap-4">
        {/* Graph SVG */}
        <div className="bg-background/50 rounded-lg p-4 border border-border/50">
          <svg width="500" height="400" className="w-full h-auto">
            {/* Draw edges */}
            {frame.edges.map((edge, i) => {
              const pos1 = vertexPositions[edge.u];
              const pos2 = vertexPositions[edge.v];
              const selected = isEdgeSelected(edge);
              const current = isCurrentEdge(edge);
              
              return (
                <g key={`edge-${i}`}>
                  <line
                    x1={pos1.x}
                    y1={pos1.y}
                    x2={pos2.x}
                    y2={pos2.y}
                    className={`transition-all duration-300 ${
                      selected ? 'stroke-success' : current ? 'stroke-warning' : 'stroke-muted'
                    }`}
                    strokeWidth={selected ? 4 : current ? 3 : 2}
                  />
                  {/* Edge weight label */}
                  <text
                    x={(pos1.x + pos2.x) / 2}
                    y={(pos1.y + pos2.y) / 2 - 5}
                    className={`text-xs font-mono fill-current ${
                      selected ? 'text-success' : current ? 'text-warning' : 'text-muted-foreground'
                    }`}
                    textAnchor="middle"
                  >
                    {edge.weight}
                  </text>
                </g>
              );
            })}

            {/* Draw vertices */}
            {vertexPositions.map((pos, i) => {
              const visited = isVertexVisited(i);
              const isCurrent = frame.currentVertex === i;
              
              return (
                <g key={`vertex-${i}`}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={20}
                    className={`transition-all duration-300 ${
                      visited ? 'fill-primary' : 'fill-card'
                    } ${isCurrent ? 'stroke-accent' : 'stroke-border'}`}
                    strokeWidth={isCurrent ? 3 : 2}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 5}
                    className={`text-sm font-bold fill-current ${
                      visited ? 'text-primary-foreground' : 'text-foreground'
                    }`}
                    textAnchor="middle"
                  >
                    {i}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          {/* Distances (for Dijkstra) */}
          {frame.distances && (
            <div className="bg-background/50 rounded-lg p-3 border border-border/50">
              <h4 className="text-sm font-semibold mb-2">Distances</h4>
              <div className="space-y-1 text-xs font-mono">
                {frame.distances.map((dist, i) => (
                  <div key={i} className="flex justify-between">
                    <span>Vertex {i}:</span>
                    <span className={dist === Infinity ? 'text-muted-foreground' : 'text-accent'}>
                      {dist === Infinity ? '∞' : dist}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority Queue (for Dijkstra) */}
          {frame.priorityQueue && frame.priorityQueue.length > 0 && (
            <div className="bg-background/50 rounded-lg p-3 border border-border/50">
              <h4 className="text-sm font-semibold mb-2">Priority Queue</h4>
              <div className="space-y-1 text-xs font-mono">
                {frame.priorityQueue.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>V{item.vertex}:</span>
                    <span className="text-accent">{item.distance}</span>
                  </div>
                ))}
                {frame.priorityQueue.length > 5 && (
                  <div className="text-muted-foreground">+{frame.priorityQueue.length - 5} more</div>
                )}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="bg-background/50 rounded-lg p-3 border border-border/50">
            <h4 className="text-sm font-semibold mb-2">Legend</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-success" />
                <span className="text-muted-foreground">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-warning" />
                <span className="text-muted-foreground">Considering</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
