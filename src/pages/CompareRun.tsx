import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Play, Pause, Settings, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MiniVisualizer } from "@/components/compare/MiniVisualizer";
import { GraphMiniView } from "@/components/compare/GraphMiniView";
import { Trophy } from "lucide-react";

// Shared Graph Component for Dynamic Programming
const SharedGraphView = ({ graph }: { graph: { numVertices: number; edges: any[] } }) => {
  const numVertices = graph.numVertices;
  const edges = graph.edges || [];
  
  // Calculate node positions (same as GraphMiniView)
  const size = 300;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = Math.min(size * 0.35, 100);
  
  const nodes = Array.from({ length: numVertices }, (_, i) => {
    const angle = (i * 2 * Math.PI) / numVertices - Math.PI / 2;
    return {
      id: i,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });

  return (
    <div className="w-full bg-background/50 rounded-lg p-4 border border-border/30">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="w-full h-full min-h-[300px]">
        {/* Draw edges */}
        {edges.map((edge, i) => {
          const pos1 = nodes[edge.u];
          const pos2 = nodes[edge.v];
          
          if (!pos1 || !pos2) return null;
          
          // Calculate midpoint for weight label
          const labelPos = computeLabelPos(pos1.x, pos1.y, pos2.x, pos2.y, {
            width: size,
            height: size,
            padding: 12,
          });
          const labelText = formatWeight(edge.weight);
          const fontSize = labelText.length > 4 ? 10 : 11;
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
                stroke="#6FA8FF"
                strokeWidth="1.5"
                opacity="0.5"
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
              >
                {labelText}
              </text>
            </g>
          );
        })}
        
        {/* Draw vertices */}
        {nodes.map((pos, i) => (
          <g key={`vertex-${i}`}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r="14"
              fill="#3b82f6"
              stroke="#1e40af"
              strokeWidth="2"
              className="transition-all duration-200"
            />
            {/* Node ID */}
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dy="4"
              fontSize="14px"
              fill="#ffffff"
              fontWeight="bold"
              className="pointer-events-none"
              style={{ textShadow: "0 0 2px rgba(0, 0, 0, 0.5)" }}
            >
              {pos.id}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// Helper functions (same as GraphMiniView)
function computeLabelPos(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  viewport: { width: number; height: number; padding?: number }
): { x: number; y: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  
  let nx = -dy / len;
  let ny = dx / len;
  
  let mx = (x1 + x2) / 2;
  let my = (y1 + y2) / 2;
  
  let offset = Math.max(12, Math.min(24, Math.round(len * 0.08)));
  
  if (Math.abs(dy / len) < 0.3) {
    offset *= 1.15;
  }
  if (Math.abs(dx / len) < 0.1) {
    offset *= 0.9;
  }
  
  let lx = mx + nx * offset;
  let ly = my + ny * offset;
  
  const pad = viewport.padding ?? 12;
  const maxX = viewport.width - pad;
  const maxY = viewport.height - pad;
  
  lx = Math.max(pad, Math.min(maxX, lx));
  ly = Math.max(pad, Math.min(maxY, ly));
  
  if (lx === pad || lx === maxX || ly === pad || ly === maxY) {
    nx = -nx;
    ny = -ny;
    lx = mx + nx * offset;
    ly = my + ny * offset;
    lx = Math.max(pad, Math.min(maxX, lx));
    ly = Math.max(pad, Math.min(maxY, ly));
  }
  
  return { x: lx, y: ly };
}

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
  return String(Math.round(weight * 10) / 10);
}

interface CompareResult {
  id: string;
  name: string;
  time: number;
  winner: boolean;
  finalFrame: any;
  frames: any[];
  localSpeed?: number;
  currentFrameIndex?: number;
  playing?: boolean;
  finishOrder?: number | null;
}

interface CompareRunData {
  category: "sorting" | "searching" | "greedy" | "dynamic";
  results: CompareResult[];
  input?: {
    type: "array" | "graph";
    array?: number[];
    graph?: any;
    target?: number;
  };
}

const CompareRun = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const runData = location.state as CompareRunData | null;

  const [results, setResults] = useState<CompareResult[]>([]);
  const [globalSpeed, setGlobalSpeed] = useState(300);
  const [isSynced, setIsSynced] = useState(true);
  const [globalPlayState, setGlobalPlayState] = useState(false);
  const [showAnimatedPreview, setShowAnimatedPreview] = useState(true);
  const syncIntervalRef = useRef<number>();
  const globalFinishCounterRef = useRef<number>(1);

  useEffect(() => {
    if (!runData || !runData.results || runData.results.length === 0) {
      // If no data, redirect back to compare page
      navigate("/compare", { replace: true });
      return;
    }
    // Initialize results with currentFrameIndex, playing state, and finishOrder
    const initializedResults = runData.results.map((r, idx) => ({
      ...r,
      id: r.id || `result-${idx}`,
      currentFrameIndex: 0,
      playing: false,
      frames: r.frames || [],
      finishOrder: null, // No ranking until algorithm finishes
      winner: false, // Will be set based on finishOrder === 1
    }));
    setResults(initializedResults);
    // Reset finish counter
    globalFinishCounterRef.current = 1;
    // Initialize local speeds from results
    setGlobalSpeed(runData.results[0]?.localSpeed || 300);
  }, [runData, navigate]);

  // Synced playback interval
  useEffect(() => {
    if (isSynced && globalPlayState && showAnimatedPreview) {
      syncIntervalRef.current = window.setInterval(() => {
        setResults(prev => {
          const updated = prev.map(r => {
            const max = Math.max((r.frames?.length || 1) - 1, 0);
            const currentIdx = r.currentFrameIndex || 0;
            const next = Math.min(currentIdx + 1, max);
            const isFinished = next >= max;
            
            // Assign finishOrder when algorithm reaches last frame
            let finishOrder = r.finishOrder;
            if (isFinished && finishOrder === null) {
              finishOrder = globalFinishCounterRef.current++;
            }
            
            return {
              ...r,
              currentFrameIndex: next,
              playing: !isFinished,
              finishOrder,
              winner: finishOrder === 1, // Winner is the first to finish
            };
          });
          
          // Check if all algorithms finished
          const allFinished = updated.every(r => {
            const max = Math.max((r.frames?.length || 1) - 1, 0);
            return (r.currentFrameIndex || 0) >= max;
          });
          
          if (allFinished && syncIntervalRef.current) {
            clearInterval(syncIntervalRef.current);
            syncIntervalRef.current = undefined;
            setGlobalPlayState(false);
          }
          
          return updated;
        });
      }, globalSpeed);
    } else {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = undefined;
      }
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isSynced, globalPlayState, showAnimatedPreview, globalSpeed]);

  const handleLocalSpeedChange = (resultId: string, speed: number) => {
    setResults(prev => prev.map(r => 
      r.id === resultId ? { ...r, localSpeed: speed } : r
    ));
  };

  const handleFrameChange = (resultId: string, frameIndex: number) => {
    setResults(prev => prev.map(r => {
      if (r.id !== resultId) return r;
      
      const max = Math.max((r.frames?.length || 1) - 1, 0);
      const isFinished = frameIndex >= max;
      
      // Assign finishOrder when algorithm reaches last frame
      let finishOrder = r.finishOrder;
      if (isFinished && finishOrder === null) {
        finishOrder = globalFinishCounterRef.current++;
      }
      
      return {
        ...r,
        currentFrameIndex: frameIndex,
        finishOrder,
        winner: finishOrder === 1,
      };
    }));
  };

  const handlePlayStateChange = (resultId: string, playing: boolean) => {
    if (isSynced) {
      setGlobalPlayState(playing);
    } else {
      setResults(prev => prev.map(r => 
        r.id === resultId ? { ...r, playing } : r
      ));
    }
  };

  const handleRunAgain = () => {
    navigate("/compare");
  };

  const algorithmType = runData?.category === "dynamic" ? "dp" : runData?.category || "sorting";

  if (!runData || results.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No comparison data found.</p>
          <Button onClick={() => navigate("/compare")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Compare
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-10">
      <div className="container mx-auto max-w-[1800px]">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button
            onClick={() => navigate("/compare")}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Selection
          </Button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-gradient-accent">Compare</span>{" "}
                <span className="text-foreground">Results</span>
              </h1>
              <p className="text-muted-foreground">
                Step-by-step visualization of {results.length} algorithm{results.length > 1 ? "s" : ""}
              </p>
            </div>
            <Button
              onClick={handleRunAgain}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Run Again
            </Button>
          </div>
        </div>

        {/* Global Controls */}
        <div className="bg-card rounded-xl p-6 border border-border mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Step-by-Step Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="animate-preview"
                  checked={showAnimatedPreview}
                  onChange={(e) => setShowAnimatedPreview(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="animate-preview" className="text-sm cursor-pointer">
                  Step-by-Step Preview
                </Label>
              </div>

              {/* Sync Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sync-playback"
                  checked={isSynced}
                  onChange={(e) => setIsSynced(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="sync-playback" className="text-sm cursor-pointer">
                  Sync Playback
                </Label>
              </div>

              {/* Global Speed */}
              {showAnimatedPreview && (
                <div className="flex items-center gap-2 w-48">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-xs text-muted-foreground whitespace-nowrap">Global Speed:</Label>
                  <Slider
                    value={[globalSpeed]}
                    onValueChange={([value]) => setGlobalSpeed(value)}
                    min={10}
                    max={1000}
                    step={10}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-14">
                    {globalSpeed}ms
                  </span>
                </div>
              )}

              {/* Global Play/Pause */}
              {showAnimatedPreview && isSynced && (
                <Button
                  onClick={() => {
                    if (!globalPlayState) {
                      // Reset all to frame 0 if at the end, and reset finishOrder
                      globalFinishCounterRef.current = 1;
                      setResults(prev => prev.map(r => {
                        const max = Math.max((r.frames?.length || 1) - 1, 0);
                        const currentIdx = r.currentFrameIndex || 0;
                        if (currentIdx >= max) {
                          return { 
                            ...r, 
                            currentFrameIndex: 0, 
                            playing: true,
                            finishOrder: null,
                            winner: false,
                          };
                        }
                        return { ...r, playing: true };
                      }));
                    }
                    setGlobalPlayState(!globalPlayState);
                  }}
                  size="sm"
                  variant="outline"
                >
                  {globalPlayState ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause All
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play All
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div 
          className={`gap-6 w-full ${
            runData?.category === "dynamic" && results.length === 2
              ? "flex flex-row items-stretch"
              : "grid"
          }`}
          style={
            runData?.category === "dynamic" && results.length === 2
              ? {}
              : {
                  gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))"
                }
          }
        >
          {results.map((result, resultIndex) => {
            // For DP with 2 results, insert graph between first and second
            const shouldShowGraphBefore = 
              runData?.category === "dynamic" && 
              results.length === 2 && 
              resultIndex === 1 && 
              runData.input?.graph;
            
            return (
              <React.Fragment key={`result-wrapper-${result.id}`}>
                {shouldShowGraphBefore && (
                  <div key="shared-graph" className="flex-1 flex items-center justify-center px-6">
                    <div className="bg-card rounded-xl border-2 border-border p-6 w-full max-w-md">
                      <div className="text-sm font-semibold mb-4 text-center text-muted-foreground">
                        Shared Graph
                      </div>
                      <SharedGraphView graph={runData.input.graph} />
                    </div>
                  </div>
                )}
                <div
                  key={result.id}
                  className={`p-6 rounded-xl border-2 transition-all flex flex-col flex-1 ${
                    result.winner
                      ? 'border-success bg-success/10'
                      : 'border-border bg-card'
                  }`}
                >
              {/* Algorithm Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {result.finishOrder !== null && (
                    <div className={`text-2xl font-bold ${
                      result.winner ? 'text-success' : 'text-muted-foreground'
                    }`}>
                      #{result.finishOrder}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-lg">
                      {result.finishOrder !== null && `#${result.finishOrder} `}
                      {result.name}
                    </div>
                    {result.winner && (
                      <div className="text-sm text-success font-semibold flex items-center gap-1 mt-1">
                        <Trophy className="w-4 h-4" /> Winner!
                      </div>
                    )}
                  </div>
                </div>
                {result.winner && <Trophy className="w-6 h-6 text-warning" />}
              </div>

              {/* Mini Visualization */}
              <div className="mb-4 flex-1 min-h-[300px]">
                <MiniVisualizer
                  algorithmType={algorithmType}
                  frames={result.frames || []}
                  finalState={result.finalFrame}
                  playbackSpeedMs={isSynced ? globalSpeed : (result.localSpeed || globalSpeed)}
                  showAnimatedPreview={showAnimatedPreview}
                  localSpeed={result.localSpeed}
                  onLocalSpeedChange={(speed) => handleLocalSpeedChange(result.id, speed)}
                  isSynced={isSynced}
                  globalPlayState={globalPlayState}
                  currentFrameIndex={result.currentFrameIndex ?? 0}
                  onFrameChange={(idx) => handleFrameChange(result.id, idx)}
                  onPlayStateChange={(playing) => handlePlayStateChange(result.id, playing)}
                  onZoom={() => {
                    // TODO: Open modal with full-size visualizer
                    console.log("Zoom clicked for", result.name);
                  }}
                />
              </div>

              {/* Generation Time */}
              <div className="mt-auto pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Generation Time</div>
                    <div className="font-mono text-xl font-bold">{result.time}ms</div>
                  </div>
                  {result.winner && (
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">Fastest</div>
                      <div className="text-success font-semibold">✓</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CompareRun;

