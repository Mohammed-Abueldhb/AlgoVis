import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { generateFloydWarshallFrames, FloydWarshallFrame } from "@/lib/stepGenerators/floydWarshall";
import { generateDijkstraSteps, GraphFrame } from "@/lib/stepGenerators/dijkstra";
import { generateRandomGraph, Graph, Edge } from "@/lib/graphGenerator";
import { GraphView } from "@/components/GraphView";
import { MatrixViewerWithFrames } from "@/components/MatrixViewerWithFrames";

interface LocationState {
  nodeCount?: number;
  edgeDensity?: number;
  sourceNode?: number;
}

// Enhanced Dijkstra Graph Component with better visuals
const DijkstraGraphView = ({ 
  nodes, 
  edges, 
  frame 
}: { 
  nodes: Array<{ id: number; x: number; y: number; label: string }>;
  edges: Edge[];
  frame: GraphFrame;
}) => {
  const size = 400;
  const centerX = size / 2;
  const centerY = size / 2;
  
  const isEdgeSelected = (edge: Edge) => {
    return frame.selectedEdges?.some(e => 
      (e.u === edge.u && e.v === edge.v) || (e.u === edge.v && e.v === edge.u)
    ) || false;
  };

  const isCurrentEdge = (edge: Edge) => {
    if (!frame.currentEdge) return false;
    const curr = frame.currentEdge;
    return (curr.u === edge.u && curr.v === edge.v) || (curr.u === edge.v && curr.v === edge.u);
  };

  const isRelaxedEdge = (edge: Edge) => {
    if (!frame.relaxedEdge) return false;
    const relaxed = frame.relaxedEdge;
    return (relaxed.u === edge.u && relaxed.v === edge.v) || (relaxed.u === edge.v && relaxed.v === edge.u);
  };

  const isNodeVisited = (nodeId: number) => {
    return frame.visited?.includes(nodeId) || false;
  };

  const isCurrentNode = (nodeId: number) => {
    return frame.currentVertex === nodeId;
  };

  // Get node position
  const getNodePos = (nodeId: number) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) return { x: node.x, y: node.y };
    // Fallback calculation
    const angle = (nodeId * 2 * Math.PI) / nodes.length - Math.PI / 2;
    const radius = 120;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  return (
    <div className="bg-background/50 rounded-lg p-4 border border-border/50">
      <svg width="100%" height="400" viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
        {/* Draw edges - fade inactive ones */}
        {edges.map((edge, i) => {
          const pos1 = getNodePos(edge.u);
          const pos2 = getNodePos(edge.v);
          
          const selected = isEdgeSelected(edge);
          const current = isCurrentEdge(edge);
          const relaxed = isRelaxedEdge(edge);
          const isActive = selected || current || relaxed;
          
          let edgeColor = "rgba(255, 255, 255, 0.25)"; // Faded inactive
          let strokeWidth = 2;
          let glow = "none";
          
          if (relaxed) {
            edgeColor = "#fbbf24"; // Yellow for relaxed
            strokeWidth = 3.5;
            glow = "drop-shadow(0 0 6px rgba(251, 191, 36, 0.8))";
          } else if (current) {
            edgeColor = "#ef4444"; // Red for considering
            strokeWidth = 3;
            glow = "drop-shadow(0 0 4px rgba(239, 68, 68, 0.6))";
          } else if (selected) {
            edgeColor = "#22c55e"; // Green for selected
            strokeWidth = 3.5;
            glow = "drop-shadow(0 0 6px rgba(34, 197, 94, 0.7))";
          }

          return (
            <g key={`edge-${i}`}>
              <line
                x1={pos1.x}
                y1={pos1.y}
                x2={pos2.x}
                y2={pos2.y}
                stroke={edgeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="transition-all duration-300"
                style={{ filter: glow }}
              />
              {/* Edge weight label */}
              <text
                x={(pos1.x + pos2.x) / 2}
                y={(pos1.y + pos2.y) / 2 - 8}
                fill={isActive ? "#ffffff" : "rgba(255, 255, 255, 0.6)"}
                fontSize="11"
                fontFamily="monospace"
                textAnchor="middle"
                className="pointer-events-none"
                style={{
                  textShadow: "0 0 4px rgba(0, 0, 0, 0.8)",
                  fontWeight: "600"
                }}
              >
                {edge.weight}
              </text>
            </g>
          );
        })}

        {/* Draw nodes with enhanced visuals */}
        {nodes.map((node) => {
          const pos = getNodePos(node.id);
          const visited = isNodeVisited(node.id);
          const current = isCurrentNode(node.id);
          
          let nodeFill = "#6d5dfc"; // Default purple
          let nodeStroke = "#9b8aff";
          let nodeRadius = 18; // Increased by ~15%
          let glow = "drop-shadow(0 0 8px rgba(125, 110, 255, 0.6))";
          let scale = 1;
          
          if (current) {
            nodeFill = "#06b6d4"; // Cyan for current
            nodeStroke = "#22d3ee";
            nodeRadius = 20; // Slightly larger when active
            glow = "drop-shadow(0 0 12px rgba(6, 182, 212, 0.9))";
            scale = 1.1;
          } else if (visited) {
            nodeFill = "#22c55e"; // Green for visited
            nodeStroke = "#4ade80";
            glow = "drop-shadow(0 0 8px rgba(34, 197, 94, 0.7))";
          }

          return (
            <g key={`vertex-${node.id}`} style={{ transform: `scale(${scale})`, transformOrigin: `${pos.x}px ${pos.y}px` }}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeRadius}
                fill={nodeFill}
                stroke={nodeStroke}
                strokeWidth={2.5}
                className="transition-all duration-300"
                style={{ filter: glow }}
              />
              <text
                x={pos.x}
                y={pos.y + 5}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="13"
                fontWeight="700"
                className="pointer-events-none"
                style={{
                  textShadow: "0 0 4px rgba(0, 0, 0, 0.8)"
                }}
              >
                {node.id}
              </text>
              {/* Distance label below node */}
              {frame.distances && frame.distances[node.id] !== undefined && (
                <text
                  x={pos.x}
                  y={pos.y + nodeRadius + 16}
                  textAnchor="middle"
                  fill={frame.distances[node.id] === Infinity ? "rgba(255, 255, 255, 0.5)" : "#06b6d4"}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="600"
                  className="pointer-events-none"
                  style={{
                    textShadow: "0 0 3px rgba(0, 0, 0, 0.9)"
                  }}
                >
                  {frame.distances[node.id] === Infinity ? "∞" : frame.distances[node.id]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const FloydVsDijkstraComparePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  // ALL HOOKS AT TOP LEVEL
  const [nodeCount, setNodeCount] = useState(state?.nodeCount || 6);
  const [edgeDensity, setEdgeDensity] = useState(state?.edgeDensity || 0.4);
  const [sourceNode, setSourceNode] = useState(state?.sourceNode || 0);
  const [graph, setGraph] = useState<Graph | null>(null);
  const [floydFrames, setFloydFrames] = useState<FloydWarshallFrame[]>([]);
  const [dijkstraFrames, setDijkstraFrames] = useState<GraphFrame[]>([]);
  const [floydFrameIndex, setFloydFrameIndex] = useState(0);
  const [dijkstraFrameIndex, setDijkstraFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [autoStarted, setAutoStarted] = useState(false);
  const animationRef = useRef<number>();

  // Generate ONE shared graph
  useEffect(() => {
    const newGraph = generateRandomGraph(nodeCount, edgeDensity);
    setGraph(newGraph);
  }, [nodeCount, edgeDensity]);

  // Generate Floyd-Warshall frames from the SAME graph
  useEffect(() => {
    if (!graph || !graph.numVertices || graph.numVertices <= 0) {
      setFloydFrames([]);
      return;
    }

    try {
      const directedEdges = graph.edges.flatMap((e) => [
        { u: e.u, v: e.v, weight: e.weight },
        { u: e.v, v: e.u, weight: e.weight },
      ]);
      const frames = generateFloydWarshallFrames(graph.numVertices, directedEdges);
      setFloydFrames(frames);
      setFloydFrameIndex(0);
    } catch (error) {
      console.error("Error generating Floyd frames:", error);
      setFloydFrames([]);
    }
  }, [graph]);

  // Generate Dijkstra frames from the SAME graph
  useEffect(() => {
    if (!graph || !graph.numVertices || graph.numVertices <= 0) {
      setDijkstraFrames([]);
      return;
    }

    try {
      const frames = generateDijkstraSteps(graph, sourceNode);
      setDijkstraFrames(frames);
      setDijkstraFrameIndex(0);
    } catch (error) {
      console.error("Error generating Dijkstra frames:", error);
      setDijkstraFrames([]);
    }
  }, [graph, sourceNode]);

  // Auto-start both algorithms on page load (only once)
  useEffect(() => {
    if (!graph || autoStarted) return;
    if (floydFrames.length > 0 && dijkstraFrames.length > 0) {
      // Reset to start
      setFloydFrameIndex(0);
      setDijkstraFrameIndex(0);
      // Start playing automatically
      setIsPlaying(true);
      setAutoStarted(true);
    }
  }, [graph, floydFrames.length, dijkstraFrames.length, autoStarted]);

  // Synchronized playback - CRITICAL: Both must step together
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = window.setTimeout(() => {
        // Update both indices together
        const nextFloyd = Math.min(floydFrameIndex + 1, floydFrames.length - 1);
        const nextDijkstra = Math.min(dijkstraFrameIndex + 1, dijkstraFrames.length - 1);
        
        setFloydFrameIndex(nextFloyd);
        setDijkstraFrameIndex(nextDijkstra);
        
        // Stop if both reached the end
        if (nextFloyd >= floydFrames.length - 1 && nextDijkstra >= dijkstraFrames.length - 1) {
          setIsPlaying(false);
        }
      }, speed);
    }
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isPlaying, floydFrameIndex, dijkstraFrameIndex, floydFrames.length, dijkstraFrames.length, speed]);

  // Helper functions
  const handlePlayPause = () => {
    if (floydFrameIndex >= floydFrames.length - 1 && dijkstraFrameIndex >= dijkstraFrames.length - 1) {
      setFloydFrameIndex(0);
      setDijkstraFrameIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setFloydFrameIndex(0);
    setDijkstraFrameIndex(0);
    setIsPlaying(false);
  };

  // Compute node positions for graph visualization (shared across all views)
  const nodes = graph && graph.numVertices > 0
    ? Array.from({ length: graph.numVertices }, (_, i) => {
        const angle = (i * 2 * Math.PI) / graph.numVertices - Math.PI / 2;
        const radius = 150;
        return {
          id: i,
          x: 250 + radius * Math.cos(angle),
          y: 200 + radius * Math.sin(angle),
          label: String(i)
        };
      })
    : [];

  // Get current frames
  const currentDijkstraFrame = dijkstraFrames[dijkstraFrameIndex] || {
    type: 'init' as const,
    edges: [],
    selectedEdges: [],
    visited: [],
    distances: [],
    currentVertex: undefined,
    priorityQueue: [],
  };

  // Loading guards
  if (!graph) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-lg">Generating graph…</p>
        </div>
      </div>
    );
  }

  if (!floydFrames.length || !dijkstraFrames.length) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-lg">Preparing algorithm frames…</p>
        </div>
      </div>
    );
  }

  // Get current Dijkstra distances and priority queue
  const dijkstraDistances = currentDijkstraFrame.distances || [];
  const priorityQueue = currentDijkstraFrame.priorityQueue || [];
  const currentVertex = currentDijkstraFrame.currentVertex;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="container mx-auto max-w-[1800px]">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate("/compare")}
            variant="ghost"
            className="mb-4 hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Compare
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Code className="w-8 h-8 text-accent" />
            <h1 className="text-4xl font-bold">Floyd–Warshall vs Dijkstra</h1>
          </div>
          <p className="text-muted-foreground">All-Pairs vs Single-Source Shortest Path Comparison</p>
        </div>

        {/* Playback Controls */}
        <div className="bg-card rounded-xl p-6 border border-border mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Button onClick={handlePlayPause} size="sm">
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </>
              )}
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Label className="text-sm whitespace-nowrap">Speed:</Label>
              <Slider
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                min={100}
                max={1000}
                step={50}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-16">{speed}ms</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Floyd: {floydFrameIndex + 1} / {floydFrames.length} | 
              Dijkstra: {dijkstraFrameIndex + 1} / {dijkstraFrames.length}
            </div>
          </div>
        </div>

        {/* Main Comparison Layout: Floyd (30%) | Graph (40%) | Dijkstra (30%) */}
        <div className="grid lg:grid-cols-[1fr_1.3fr_1fr] gap-6 items-stretch">
          {/* LEFT: Floyd-Warshall Matrix */}
          <div className="flex flex-col">
            <div className="bg-card rounded-xl p-4 border border-border flex flex-col min-h-[650px] max-h-[650px]">
              <h3 className="font-semibold text-lg mb-2 text-accent">All-Pairs Shortest Path</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Full distance matrix
              </p>
              <div className="flex-1 overflow-auto">
                <MatrixViewerWithFrames
                  frames={floydFrames}
                  initialIndex={floydFrameIndex}
                  speedMs={speed}
                  onFrameChange={(index) => {
                    setFloydFrameIndex(index);
                    setIsPlaying(false);
                  }}
                />
              </div>
            </div>
          </div>

          {/* CENTER: Shared Graph (40% width, scaled down) */}
          <div className="flex flex-col">
            <div className="bg-card rounded-xl p-6 border border-border flex flex-col min-h-[650px] max-h-[650px]">
              <h3 className="font-semibold text-xl mb-3 text-center">Shared Graph</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Same graph instance used by both algorithms
              </p>
              <div className="flex-1 flex items-center justify-center">
                <div 
                  className="mx-auto"
                  style={{
                    maxWidth: '520px',
                    maxHeight: '520px',
                    aspectRatio: '1 / 1',
                    transform: 'scale(0.9)'
                  }}
                >
                  <div className="bg-background/50 rounded-lg p-6 border border-border/50 w-full h-full">
                    <svg width="100%" height="100%" viewBox="0 0 500 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                      {/* Draw edges */}
                      {graph.edges.map((edge, i) => {
                        const pos1 = nodes.find(n => n.id === edge.u);
                        const pos2 = nodes.find(n => n.id === edge.v);
                        
                        if (!pos1 || !pos2) return null;

                        const selected = currentDijkstraFrame.selectedEdges?.some(e =>
                          (e.u === edge.u && e.v === edge.v) || (e.u === edge.v && e.v === edge.u)
                        ) || false;
                        const considering = currentDijkstraFrame.currentEdge && (
                          (currentDijkstraFrame.currentEdge.u === edge.u && currentDijkstraFrame.currentEdge.v === edge.v) ||
                          (currentDijkstraFrame.currentEdge.u === edge.v && currentDijkstraFrame.currentEdge.v === edge.u)
                        );
                        
                        const edgeColor = selected ? "#22c55e" : considering ? "#fbbf24" : "rgba(255, 255, 255, 0.4)";
                        const strokeWidth = selected ? 3.5 : considering ? 3 : 2.5;
                        const glow = selected 
                          ? "drop-shadow(0 0 6px rgba(34, 197, 94, 0.7))"
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
                              strokeLinecap="round"
                              className="transition-all duration-300"
                              style={{ filter: glow }}
                            />
                            <text
                              x={(pos1.x + pos2.x) / 2}
                              y={(pos1.y + pos2.y) / 2 - 10}
                              fill="#e0e7ff"
                              fontSize="13"
                              fontFamily="monospace"
                              textAnchor="middle"
                              className="pointer-events-none"
                              style={{
                                textShadow: "0 0 4px rgba(0, 0, 0, 0.8)",
                                fontWeight: "600"
                              }}
                            >
                              {edge.weight}
                            </text>
                          </g>
                        );
                      })}

                      {/* Draw nodes */}
                      {nodes.map((node) => {
                        const visited = currentDijkstraFrame.visited?.includes(node.id) || false;
                        const current = currentDijkstraFrame.currentVertex === node.id;
                        
                        let nodeFill = "#6d5dfc";
                        let nodeStroke = "#9b8aff";
                        let nodeRadius = 20; // Larger for center
                        let glow = "drop-shadow(0 0 8px rgba(125, 110, 255, 0.6))";
                        
                        if (current) {
                          nodeFill = "#06b6d4";
                          nodeStroke = "#22d3ee";
                          nodeRadius = 22;
                          glow = "drop-shadow(0 0 12px rgba(6, 182, 212, 0.9))";
                        } else if (visited) {
                          nodeFill = "#22c55e";
                          nodeStroke = "#4ade80";
                          glow = "drop-shadow(0 0 8px rgba(34, 197, 94, 0.7))";
                        }

                        return (
                          <g key={`vertex-${node.id}`}>
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={nodeRadius}
                              fill={nodeFill}
                              stroke={nodeStroke}
                              strokeWidth={2.5}
                              className="transition-all duration-300"
                              style={{ filter: glow }}
                            />
                            <text
                              x={node.x}
                              y={node.y + 5}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="14"
                              fontWeight="700"
                              className="pointer-events-none"
                              style={{
                                textShadow: "0 0 4px rgba(0, 0, 0, 0.8)"
                              }}
                            >
                              {node.id}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Dijkstra Graph + Numerical Panel */}
          <div className="flex flex-col">
            <div className="bg-card rounded-xl p-4 border border-border flex flex-col min-h-[650px] max-h-[650px]">
              <h3 className="font-semibold text-lg mb-2 text-accent">Single-Source Shortest Path</h3>
              <p className="text-sm text-muted-foreground mb-4">
                From source node {sourceNode}
              </p>
              
              {/* Live Graph Visualization */}
              <div className="mb-4 flex-1 min-h-[300px]">
                <DijkstraGraphView
                  nodes={nodes}
                  edges={graph.edges || []}
                  frame={currentDijkstraFrame}
                />
              </div>

              {/* Live Numerical Panel */}
              <div className="space-y-3 mt-4">
                {/* Current Node Label */}
                {currentVertex !== undefined && (
                  <div className="bg-accent/10 rounded-lg p-3 border border-accent/30">
                    <div className="text-sm font-semibold text-accent">
                      Current Node: <span className="font-mono text-base">{currentVertex}</span>
                    </div>
                  </div>
                )}

                {/* Distances Table */}
                <div className="bg-muted/30 rounded-lg p-3 border border-border">
                  <h4 className="font-semibold mb-2 text-sm">Distances from Node {sourceNode}</h4>
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                    {dijkstraDistances.map((dist, i) => (
                      <div
                        key={i}
                        className={`flex justify-between items-center p-1.5 rounded text-xs ${
                          i === sourceNode ? 'bg-accent/20' : 
                          i === currentVertex ? 'bg-cyan-500/20' : ''
                        }`}
                      >
                        <span className="font-medium">Node {i}:</span>
                        <span className={`font-mono font-semibold ${
                          dist === Infinity ? 'text-muted-foreground' : 'text-accent'
                        }`}>
                          {dist === Infinity ? '∞' : dist}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority Queue */}
                {priorityQueue.length > 0 && (
                  <div className="bg-muted/30 rounded-lg p-3 border border-border">
                    <h4 className="font-semibold mb-2 text-sm">Priority Queue</h4>
                    <div className="space-y-1 text-xs font-mono max-h-[80px] overflow-y-auto">
                      {priorityQueue.slice(0, 6).map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span>V{item.vertex}:</span>
                          <span className="text-accent font-semibold">{item.distance}</span>
                        </div>
                      ))}
                      {priorityQueue.length > 6 && (
                        <div className="text-muted-foreground text-xs">+{priorityQueue.length - 6} more</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloydVsDijkstraComparePage;
