import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Info, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GraphVisualizer } from "@/components/GraphVisualizer";
import { generateFloydWarshallFrames, FloydWarshallFrame } from "@/lib/stepGenerators/floydWarshall";
import { generateRandomGraph, Graph } from "@/lib/graphGenerator";
import { Play, Pause, SkipForward, SkipBack, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { MatrixViewerWithFrames } from "@/components/MatrixViewerWithFrames";

const FloydWarshallPage = () => {
  // ALL HOOKS AT TOP LEVEL - NO CONDITIONAL HOOKS
  const navigate = useNavigate();
  const [speed, setSpeed] = useState(300);
  const [nodeCount, setNodeCount] = useState(6);
  const [edgeDensity, setEdgeDensity] = useState(0.4);
  const [graph, setGraph] = useState<Graph | null>(null);
  const [frames, setFrames] = useState<FloydWarshallFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number>();

  // Generate graph on mount and when nodeCount or edgeDensity changes
  useEffect(() => {
    const newGraph = generateRandomGraph(nodeCount, edgeDensity);
    setGraph(newGraph);
  }, [nodeCount, edgeDensity]);

  // Generate frames when graph changes
  useEffect(() => {
    if (!graph || !graph.numVertices || graph.numVertices <= 0) {
      setFrames([]);
      setCurrentFrameIndex(0);
      return;
    }

    try {
      // Convert to directed edges (both directions for undirected graph)
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

  // Playback effect
  useEffect(() => {
    if (isPlaying && currentFrameIndex < frames.length - 1) {
      animationRef.current = window.setTimeout(() => {
        setCurrentFrameIndex(prev => prev + 1);
      }, speed);
    } else if (currentFrameIndex >= frames.length - 1) {
      setIsPlaying(false);
    }
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isPlaying, currentFrameIndex, frames.length, speed]);

  // Helper functions (not hooks)
  const generateGraph = () => {
    const newGraph = generateRandomGraph(nodeCount, edgeDensity);
    setGraph(newGraph);
  };

  const handlePlayPause = () => {
    if (currentFrameIndex >= frames.length - 1) {
      setCurrentFrameIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentFrameIndex < frames.length - 1) {
      setCurrentFrameIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentFrameIndex > 0) {
      setCurrentFrameIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentFrameIndex(0);
    setIsPlaying(false);
  };

  const goToFirstFrame = () => {
    setCurrentFrameIndex(0);
    setIsPlaying(false);
  };

  const goToLastFrame = () => {
    if (frames.length > 0) {
      setCurrentFrameIndex(frames.length - 1);
      setIsPlaying(false);
    }
  };

  // Create a GraphFrame for GraphVisualizer (convert from FloydWarshallFrame)
  const currentFrame = frames[currentFrameIndex];
  const graphFrame = graph ? {
    type: 'graphSnapshot' as const,
    edges: graph.edges,
    selectedEdges: [],
    visited: [],
    distances: [],
  } : {
    type: 'init' as const,
    edges: [],
    selectedEdges: [],
    visited: [],
    distances: [],
  };

  // Loading guards - AFTER all hooks
  if (!graph) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-lg">Generating graph…</p>
        </div>
      </div>
    );
  }

  if (!frames.length) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-lg">Preparing algorithm frames…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
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

        {/* Main Layout: Graph (left) and Controls (right) */}
        <div className="grid lg:grid-cols-[1fr_350px] gap-8 mb-6">
          {/* Left: Graph Visualizer */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-accent mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Algorithm Info</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Time Complexity</div>
                      <div className="font-mono">O(V³)</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Space Complexity</div>
                      <div className="font-mono">O(V²)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Graph Visualizer */}
            <GraphVisualizer frame={graphFrame} numVertices={graph.numVertices} />
          </div>

          {/* Right: Controls Panel */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Controls</h3>

              {/* Playback Controls */}
              <div className="flex gap-2 mb-6">
                <Button
                  onClick={goToFirstFrame}
                  variant="outline"
                  size="icon"
                  disabled={currentFrameIndex === 0}
                  title="Go to first frame"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handlePrev}
                  variant="outline"
                  size="icon"
                  disabled={currentFrameIndex === 0}
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button onClick={handlePlayPause} className="flex-1">
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
                <Button
                  onClick={handleNext}
                  variant="outline"
                  size="icon"
                  disabled={currentFrameIndex >= frames.length - 1}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
                <Button
                  onClick={goToLastFrame}
                  variant="outline"
                  size="icon"
                  disabled={currentFrameIndex >= frames.length - 1}
                  title="Go to last frame"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button onClick={handleReset} variant="outline" size="icon">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Step {currentFrameIndex + 1}</span>
                  <span>{frames.length} total</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentFrameIndex + 1) / frames.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Speed Control */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center">
                  <Label>Animation Speed</Label>
                  <span className="text-sm text-muted-foreground">{speed}ms</span>
                </div>
                <Slider
                  value={[speed]}
                  onValueChange={(value) => setSpeed(value[0])}
                  min={100}
                  max={1000}
                  step={50}
                  className="w-full"
                />
              </div>

              {/* Node Count */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <Label>Node Count</Label>
                  <span className="text-sm text-muted-foreground">{nodeCount}</span>
                </div>
                <Slider
                  value={[nodeCount]}
                  onValueChange={(value) => setNodeCount(value[0])}
                  min={4}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Edge Density */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <Label>Edge Density</Label>
                  <span className="text-sm text-muted-foreground">{(edgeDensity * 100).toFixed(0)}%</span>
                </div>
                <Slider
                  value={[edgeDensity * 100]}
                  onValueChange={(value) => setEdgeDensity(value[0] / 100)}
                  min={30}
                  max={80}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Generate Graph Button */}
              <Button onClick={generateGraph} className="w-full bg-secondary hover:bg-secondary/90">
                <Shuffle className="w-4 h-4 mr-2" />
                Generate New Graph
              </Button>
            </div>

            {/* Algorithm Description */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-semibold mb-3">How It Works</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Finds shortest paths between all pairs of vertices.</p>
                <ol className="list-decimal list-inside space-y-1 ml-1">
                  <li>Initialize distance matrix with direct edges</li>
                  <li>For each intermediate vertex k, update distances</li>
                  <li>Rule: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])</li>
                </ol>
                <p className="mt-4 pt-4 border-t border-border">
                  <strong>Use Case:</strong> Network routing, pathfinding in graphs
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Matrix Section */}
        <div className="mt-6">
          <MatrixViewerWithFrames
            frames={frames}
            initialIndex={currentFrameIndex}
            speedMs={speed}
            onFrameChange={(index) => {
              setCurrentFrameIndex(index);
              setIsPlaying(false);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FloydWarshallPage;
