import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Info, Shuffle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { generateFloydWarshallFrames, FloydWarshallFrame } from "@/lib/stepGenerators/floydWarshall";
import { generateRandomGraph, Graph } from "@/lib/graphGenerator";
import { GraphView } from "@/components/GraphView";
import { MatrixViewerWithFrames } from "@/components/MatrixViewerWithFrames";
import { GraphLegend } from "@/components/GraphLegend";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const FloydWarshall = () => {
  // ALL HOOKS MUST BE DECLARED FIRST - BEFORE ANY CONDITIONAL LOGIC OR EARLY RETURNS
  const navigate = useNavigate();
  const [speed, setSpeed] = useState(800);
  const [nodeCount, setNodeCount] = useState(5);
  const [density, setDensity] = useState(0.5);
  const [graph, setGraph] = useState<Graph | null>(null);
  const [frames, setFrames] = useState<FloydWarshallFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Generate graph immediately on mount and when nodeCount or density changes
  useEffect(() => {
    setIsLoading(true);
    try {
      const newGraph = generateRandomGraph(nodeCount, density);
      if (newGraph && newGraph.numVertices > 0) {
        setGraph(newGraph);
      } else {
        // Fallback: generate a minimal valid graph
        const fallbackGraph = generateRandomGraph(4, 0.5);
        setGraph(fallbackGraph);
      }
    } catch (error) {
      console.error("Error generating graph:", error);
      // Fallback: generate a minimal valid graph
      const fallbackGraph = generateRandomGraph(4, 0.5);
      setGraph(fallbackGraph);
    } finally {
      setIsLoading(false);
    }
  }, [nodeCount, density]);

  // Regenerate frames whenever graph changes
  useEffect(() => {
    if (!graph || !graph.numVertices || graph.numVertices <= 0) {
      setFrames([]);
      setCurrentFrameIndex(0);
      return;
    }

    try {
      // Always regenerate frames when graph changes
      const directedEdges = graph.edges.flatMap((e) => [
        { u: e.u, v: e.v, weight: e.weight },
        { u: e.v, v: e.u, weight: e.weight },
      ]);
      const newFrames = generateFloydWarshallFrames(graph.numVertices, directedEdges);
      if (newFrames && newFrames.length > 0) {
        setFrames(newFrames);
        setCurrentFrameIndex(0);
      } else {
        setFrames([]);
        setCurrentFrameIndex(0);
      }
    } catch (error) {
      console.error("Error generating frames:", error);
      setFrames([]);
      setCurrentFrameIndex(0);
    }
  }, [graph]);

  // Helper functions - these are not hooks, so they can be after hooks
  const generateGraph = () => {
    const newGraph = generateRandomGraph(nodeCount, density);
    setGraph(newGraph);
  };

  const runAlgorithm = () => {
    if (!graph || graph.edges.length === 0) return;
    
    // Regenerate frames from current graph
    const directedEdges = graph.edges.flatMap((e) => [
      { u: e.u, v: e.v, weight: e.weight },
      { u: e.v, v: e.u, weight: e.weight },
    ]);
    const newFrames = generateFloydWarshallFrames(graph.numVertices, directedEdges);
    setFrames(newFrames);
    setCurrentFrameIndex(0);
  };

  // Compute node positions - always compute, even if we return early (for consistency)
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

  // NOW we can do conditional returns - all hooks have been called
  // Loading guards to prevent crashes
  if (!graph) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-lg">Loading graph…</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner message="Generating graph..." />
        </div>
      </div>
    );
  }

  // Additional safety check - ensure graph has valid structure
  if (!graph.numVertices || graph.numVertices <= 0) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-lg">Preparing graph…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <Button
            onClick={() => navigate("/algorithms")}
            variant="ghost"
            className="mb-4 hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Algorithms
          </Button>
          <h1 className="text-4xl font-bold mb-2">Floyd–Warshall Algorithm Visualizer</h1>
          <p className="text-muted-foreground">All-pairs shortest paths using dynamic programming</p>
        </div>

        {/* Main Layout: Graph + Matrix (left) and Controls (right) */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Left Area: Graph + Matrix (large content area) */}
          <div className="flex-1 lg:flex-[0.7] space-y-6">
            {/* Graph at the top */}
            <div>
              <GraphView
                nodes={nodes}
                edges={graph.edges || []}
                selectedEdges={[]}
                theme="dp"
              />
            </div>

            {/* Matrix Viewer - large and prominent in the left area */}
            <MatrixViewerWithFrames
              frames={frames}
              initialIndex={currentFrameIndex}
              speedMs={speed}
              onFrameChange={(index) => setCurrentFrameIndex(index)}
            />
          </div>

          {/* Right Column: Controls + Info */}
          <div className="flex-1 lg:flex-[0.3] space-y-6">
            {/* Controls Panel */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="font-medium mb-3 text-sm">Controls</h3>
              
              {/* Node Count */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <Label>Node Count</Label>
                  <span className="text-sm text-muted-foreground">{nodeCount}</span>
                </div>
                <Slider
                  value={[nodeCount]}
                  onValueChange={(value) => {
                    setNodeCount(value[0]);
                    // Graph and frames will regenerate automatically via useEffect
                  }}
                  min={4}
                  max={8}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Density */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <Label>Edge Density</Label>
                  <span className="text-sm text-muted-foreground">{(density * 100).toFixed(0)}%</span>
                </div>
                <Slider
                  value={[density * 100]}
                  onValueChange={(value) => {
                    setDensity(value[0] / 100);
                    // Graph and frames will regenerate automatically via useEffect
                  }}
                  min={30}
                  max={80}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Run Algorithm Button */}
              <Button 
                onClick={runAlgorithm} 
                className="w-full bg-primary hover:bg-primary/90 mb-4"
                disabled={!graph || graph.edges.length === 0}
              >
                <Play className="w-4 h-4 mr-2" />
                Run Algorithm
              </Button>

              {/* Generate Graph Button */}
              <Button onClick={generateGraph} className="w-full bg-secondary hover:bg-secondary/90 mb-6">
                <Shuffle className="w-4 h-4 mr-2" />
                Generate New Graph
              </Button>

              {/* Info Card */}
              <div className="bg-muted/30 rounded-lg p-3 border border-border">
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <div className="font-medium mb-1.5">Algorithm Info</div>
                    <div className="space-y-0.5 text-muted-foreground">
                      <div>Time: <span className="font-mono text-xs">O(V³)</span></div>
                      <div>Space: <span className="font-mono text-xs">O(V²)</span></div>
                      <div className="pt-1.5 border-t border-border mt-1.5">
                        <span className="font-medium">Frames:</span> {frames.length} total
                        <br />
                        <span className="text-xs">(Step-by-step visualization)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Graph Legend */}
            <GraphLegend theme="dp" />

            {/* How It Works */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="font-medium mb-2.5 text-sm text-muted-foreground">How It Works</h3>
              <div className="text-xs text-muted-foreground space-y-2">
                <p>Finds shortest paths between all pairs of vertices.</p>
                <ol className="list-decimal list-inside space-y-1 ml-1">
                  <li>Initialize distance matrix with direct edges</li>
                  <li>For each intermediate vertex k, update distances</li>
                  <li>Rule: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])</li>
                </ol>
                <p className="pt-2 border-t border-border mt-2">
                  Final matrix shows shortest path distances (or ∞ if unreachable).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloydWarshall;
