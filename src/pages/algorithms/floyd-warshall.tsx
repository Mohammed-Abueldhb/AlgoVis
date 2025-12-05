import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Info, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { generateFloydWarshallFrames, FloydWarshallFrame } from "@/lib/stepGenerators/floydWarshall";
import { generateRandomGraph, Graph } from "@/lib/graphGenerator";
import { GraphView } from "@/components/GraphView";
import { MatrixViewer } from "@/components/MatrixViewer";
import { GraphLegend } from "@/components/GraphLegend";

const FloydWarshall = () => {
  const navigate = useNavigate();
  const [speed, setSpeed] = useState(800);
  const [nodeCount, setNodeCount] = useState(5);
  const [density, setDensity] = useState(0.5);
  const [graph, setGraph] = useState<Graph>({ numVertices: 5, edges: [] });
  const [frames, setFrames] = useState<FloydWarshallFrame[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number>();

  const generateGraph = () => {
    const newGraph = generateRandomGraph(nodeCount, density);
    setGraph(newGraph);
    const directedEdges = newGraph.edges.flatMap((e) => [
      { u: e.u, v: e.v, weight: e.weight },
      { u: e.v, v: e.u, weight: e.weight },
    ]);
    const newFrames = generateFloydWarshallFrames(newGraph.numVertices, directedEdges);
    setFrames(newFrames);
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    generateGraph();
  }, []);

  useEffect(() => {
    if (isPlaying && currentFrame < frames.length - 1) {
      animationRef.current = window.setTimeout(() => {
        setCurrentFrame(prev => prev + 1);
      }, speed);
    } else if (currentFrame >= frames.length - 1) {
      setIsPlaying(false);
    }
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isPlaying, currentFrame, frames.length, speed]);

  const handlePlayPause = () => {
    if (currentFrame >= frames.length - 1) {
      setCurrentFrame(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentFrame < frames.length - 1) {
      setCurrentFrame(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentFrame > 0) {
      setCurrentFrame(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  // Get the matrix to display - show last matrix snapshot even if current frame is info
  const displayFrame = frames[currentFrame];
  const matrixSnapshots = frames.filter(f => f.type === "matrixSnapshot");
  
  const getDisplayMatrix = () => {
    if (displayFrame?.type === "matrixSnapshot") {
      return displayFrame.dist;
    }
    // If current frame is info, find the last matrix snapshot
    for (let i = currentFrame; i >= 0; i--) {
      if (frames[i]?.type === "matrixSnapshot") {
        return frames[i].dist;
      }
    }
    // Fallback: use last snapshot if available
    if (matrixSnapshots.length > 0) {
      return matrixSnapshots[matrixSnapshots.length - 1].dist;
    }
    return null;
  };

  const getCurrentMatrixFrame = () => {
    if (displayFrame?.type === "matrixSnapshot") {
      return displayFrame;
    }
    // If current frame is info, find the last matrix snapshot
    for (let i = currentFrame; i >= 0; i--) {
      if (frames[i]?.type === "matrixSnapshot") {
        return frames[i];
      }
    }
    // Fallback: use last snapshot if available
    if (matrixSnapshots.length > 0) {
      return matrixSnapshots[matrixSnapshots.length - 1];
    }
    return null;
  };

  const matrix = getDisplayMatrix();
  const currentMatrixFrame = getCurrentMatrixFrame();
  const infoText = displayFrame?.type === "info" ? displayFrame.text : null;

  // Count matrix snapshots for display
  const currentSnapshotIndex = currentMatrixFrame 
    ? matrixSnapshots.findIndex(f => f === currentMatrixFrame) + 1 
    : matrixSnapshots.length;

  // Generate node positions for GraphView
  const nodes = Array.from({ length: graph.numVertices }, (_, i) => {
    const angle = (i * 2 * Math.PI) / graph.numVertices - Math.PI / 2;
    const radius = 150;
    return {
      id: i,
      x: 250 + radius * Math.cos(angle),
      y: 200 + radius * Math.sin(angle),
      label: String(i)
    };
  });

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

        <div className="grid lg:grid-cols-[1fr_350px] gap-8">
          <div className="space-y-6">
            {/* Graph View - Always visible, DP theme */}
            <GraphView
              nodes={nodes}
              edges={graph.edges}
              selectedEdges={[]}
              theme="dp"
            />

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

            {/* Matrix Viewer - Always visible, even after completion */}
            {matrix && currentMatrixFrame && (
              <MatrixViewer
                matrix={matrix}
                k={currentMatrixFrame.k}
                highlight={currentMatrixFrame.i !== undefined && currentMatrixFrame.j !== undefined 
                  ? { i: currentMatrixFrame.i, j: currentMatrixFrame.j }
                  : undefined
                }
                currentSnapshot={currentSnapshotIndex}
                totalSnapshots={matrixSnapshots.length}
              />
            )}

            {/* Graph Legend */}
            <GraphLegend theme="dp" />

            {/* Info text */}
            {infoText && (
              <div className="bg-info/10 border border-info/30 rounded-lg p-4">
                <p className="text-sm text-foreground">{infoText}</p>
              </div>
            )}
          </div>

          {/* Controls Sidebar */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Controls</h3>

              {/* Playback Controls */}
              <div className="flex gap-2 mb-6">
                <Button
                  onClick={handlePrev}
                  variant="outline"
                  size="icon"
                  disabled={currentFrame === 0}
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
                  disabled={currentFrame >= frames.length - 1}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
                <Button onClick={handleReset} variant="outline" size="icon">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Step {currentFrame + 1}</span>
                  <span>{frames.length} total</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentFrame + 1) / frames.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Node Count */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <Label>Node Count</Label>
                  <span className="text-sm text-muted-foreground">{nodeCount}</span>
                </div>
                <Slider
                  value={[nodeCount]}
                  onValueChange={(value) => {
                    const newCount = value[0];
                    setNodeCount(newCount);
                    const newGraph = generateRandomGraph(newCount, density);
                    setGraph(newGraph);
                    const directedEdges = newGraph.edges.flatMap((e) => [
                      { u: e.u, v: e.v, weight: e.weight },
                      { u: e.v, v: e.u, weight: e.weight },
                    ]);
                    const newFrames = generateFloydWarshallFrames(newGraph.numVertices, directedEdges);
                    setFrames(newFrames);
                    setCurrentFrame(0);
                    setIsPlaying(false);
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
                    const newDensity = value[0] / 100;
                    setDensity(newDensity);
                    const newGraph = generateRandomGraph(nodeCount, newDensity);
                    setGraph(newGraph);
                    const directedEdges = newGraph.edges.flatMap((e) => [
                      { u: e.u, v: e.v, weight: e.weight },
                      { u: e.v, v: e.u, weight: e.weight },
                    ]);
                    const newFrames = generateFloydWarshallFrames(newGraph.numVertices, directedEdges);
                    setFrames(newFrames);
                    setCurrentFrame(0);
                    setIsPlaying(false);
                  }}
                  min={30}
                  max={80}
                  step={10}
                  className="w-full"
                />
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
                  min={200}
                  max={2000}
                  step={100}
                  className="w-full"
                />
              </div>

              {/* Generate Graph Button */}
              <Button onClick={generateGraph} className="w-full bg-secondary hover:bg-secondary/90">
                <Shuffle className="w-4 h-4 mr-2" />
                Generate New Graph
              </Button>
              
              {/* Note about matrix persistence */}
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                Matrix remains visible after completion. Use Play/Step to review snapshots.
              </p>
            </div>

            {/* Algorithm Description */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-semibold mb-3">How It Works</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>1. Initialize distance matrix with direct edges</p>
                <p>2. For each intermediate vertex k, update distances</p>
                <p>3. Check if path through k is shorter: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])</p>
                <p className="mt-4 pt-4 border-t border-border">
                  <strong>Use Case:</strong> Network routing, pathfinding
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
