import React, { useState, useEffect, useRef, useMemo } from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { TooltipProvider } from "@/components/ui/tooltip";
import MatrixCell from "./MatrixCell";
import { FloydWarshallFrame } from "@/lib/stepGenerators/floydWarshall";
import { WarshallWeightedFrame } from "@/lib/stepGenerators/warshallWeighted";

// Union type for frame structures that have the same shape
type MatrixFrame = FloydWarshallFrame | WarshallWeightedFrame;

interface MatrixViewerWithFramesProps {
  frames: MatrixFrame[];
  initialIndex?: number;
  speedMs?: number;
  onPlayEnd?: () => void;
  onFrameChange?: (index: number) => void;
  mode?: "distance" | "reachability";
}

export const MatrixViewerWithFrames = ({
  frames,
  initialIndex = 0,
  speedMs = 800,
  onPlayEnd,
  onFrameChange,
  mode = "distance",
}: MatrixViewerWithFramesProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(speedMs);
  const animationRef = useRef<number>();

  // Get current frame
  const currentFrame = frames[currentIndex];
  
  // Initialize matrix state from first frame and update when frames change
  const [matrixState, setMatrixState] = useState<number[][]>(() => {
    if (frames.length > 0 && frames[0].matrix) {
      return frames[0].matrix.map(row => [...row]);
    }
    return [];
  });

  // Reset to initial index when frames array changes (new graph)
  // Use a ref to track the previous first frame to detect actual graph changes
  const prevFirstFrameRef = useRef<number[][] | null>(null);
  
  useEffect(() => {
    if (frames.length > 0 && frames[0]?.matrix) {
      const firstFrameMatrix = frames[0].matrix;
      const prevMatrix = prevFirstFrameRef.current;
      
      // Check if this is a new graph (different matrix size or completely different)
      const isNewGraph = !prevMatrix || 
        prevMatrix.length !== firstFrameMatrix.length ||
        (prevMatrix.length > 0 && prevMatrix[0].length !== firstFrameMatrix[0]?.length);
      
      if (isNewGraph) {
        setCurrentIndex(0);
        if (onFrameChange) onFrameChange(0);
        setIsPlaying(false);
        setMatrixState(firstFrameMatrix.map(row => [...row]));
        prevFirstFrameRef.current = firstFrameMatrix.map(row => [...row]);
      }
    } else if (frames.length === 0) {
      setMatrixState([]);
      prevFirstFrameRef.current = null;
    }
  }, [frames, onFrameChange]);

  // Sync currentIndex with initialIndex when it changes externally (parent-controlled playback)
  useEffect(() => {
    if (initialIndex !== undefined && initialIndex !== currentIndex) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex]);

  // Update matrix state when current frame changes
  useEffect(() => {
    if (currentFrame && currentFrame.matrix) {
      const newMatrix = currentFrame.matrix;
      
      // If matrix size changed (different graph), update completely
      setMatrixState(prevMatrix => {
        if (prevMatrix.length !== newMatrix.length || 
            (prevMatrix.length > 0 && prevMatrix[0].length !== newMatrix[0]?.length)) {
          return newMatrix.map(row => [...row]);
        }
        
        // Otherwise, update only changed cells
        return newMatrix.map((row, i) => 
          row.map((val, j) => {
            // Always update to match current frame
            return newMatrix[i][j];
          })
        );
      });
    }
  }, [currentFrame]);

  // Playback effect
  useEffect(() => {
    if (isPlaying && currentIndex < frames.length - 1) {
      animationRef.current = window.setTimeout(() => {
        setCurrentIndex(prev => {
          const next = prev + 1;
          if (onFrameChange) onFrameChange(next);
          return next;
        });
      }, speed);
    } else if (currentIndex >= frames.length - 1 && isPlaying) {
      setIsPlaying(false);
      if (onPlayEnd) onPlayEnd();
    }
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isPlaying, currentIndex, frames.length, speed, onPlayEnd, onFrameChange]);

  const handlePlayPause = () => {
    if (currentIndex >= frames.length - 1) {
      setCurrentIndex(0);
      if (onFrameChange) onFrameChange(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentIndex < frames.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      if (onFrameChange) onFrameChange(next);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      if (onFrameChange) onFrameChange(prev);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
    if (onFrameChange) onFrameChange(0);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
    if (onFrameChange) onFrameChange(index);
  };

  if (frames.length === 0 || !currentFrame) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border">
        <h3 className="text-lg font-medium mb-2">
          {mode === "reachability" ? "Reachability Matrix" : "Distance Matrix"}
        </h3>
        <div className="flex items-center justify-center p-12">
          <p className="text-muted-foreground">Preparing algorithm visualization...</p>
        </div>
      </div>
    );
  }

  const matrix = matrixState;
  const k = currentFrame.k;
  const highlight = currentFrame.highlight || {};
  
  // Extract highlight information
  const viaIK = highlight.viaCells?.[0] || null; // [i, k]
  const viaKJ = highlight.viaCells?.[1] || null; // [k, j]
  const currentCell = highlight.currentCell || null; // [i, j]
  const isUpdated = highlight.updated === true;

  // Get previous frame for value comparison
  const previousFrame = currentIndex > 0 ? frames[currentIndex - 1] : null;
  const previousMatrix = previousFrame?.matrix || null;

  // Compute highlight state for each cell (memoized)
  const getCellHighlight = useMemo(() => {
    return (i: number, j: number): "none" | "viaIK" | "viaKJ" | "current" | "updated" => {
      // Check if this cell is (i, k)
      if (viaIK && viaIK[0] === i && viaIK[1] === j) {
        return "viaIK";
      }
      // Check if this cell is (k, j)
      if (viaKJ && viaKJ[0] === i && viaKJ[1] === j) {
        return "viaKJ";
      }
      // Check if this cell is (i, j)
      if (currentCell && currentCell[0] === i && currentCell[1] === j) {
        if (isUpdated) {
          return "updated";
        }
        return "current";
      }
      return "none";
    };
  }, [viaIK, viaKJ, currentCell, isUpdated]);

  // Get previous value for a cell
  const getPreviousValue = (i: number, j: number): number | null => {
    if (!previousMatrix) return null;
    return previousMatrix[i]?.[j] ?? null;
  };

  // Extract unique k values for thumbnail strip (one per k)
  const kSnapshots = useMemo(() => {
    const kMap = new Map<number, number>(); // k -> frame index
    frames.forEach((frame, idx) => {
      const k = frame.k;
      if (!kMap.has(k) || k === -1) {
        kMap.set(k, idx);
      } else {
        // Keep the last frame for each k
        kMap.set(k, idx);
      }
    });
    return Array.from(kMap.entries())
      .sort(([a], [b]) => {
        if (a === -1) return -1;
        if (b === -1) return 1;
        return a - b;
      })
      .map(([k, idx]) => ({ k, frameIndex: idx }));
  }, [frames]);

  return (
    <TooltipProvider>
      <div className="bg-card rounded-xl p-6 border border-border">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">
            {mode === "reachability" ? "Reachability Matrix" : "Distance Matrix"}
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Iteration k = {k === -1 ? "Initial" : k}
              {currentFrame.i >= 0 && currentFrame.j >= 0 && (
                <> | Checking ({currentFrame.i}, {currentFrame.j})</>
              )}
            </span>
            <span>
              Frame {currentIndex + 1} / {frames.length}
            </span>
          </div>
        </div>

        {/* Thumbnail Strip */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {kSnapshots.map(({ k, frameIndex }) => (
              <button
                key={`k-${k}-${frameIndex}`}
                onClick={() => handleThumbnailClick(frameIndex)}
                className={`px-3 py-2 rounded-md text-xs font-mono border transition-all ${
                  frameIndex === currentIndex
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted hover:bg-muted/80 border-border"
                }`}
                aria-label={`Go to k=${k === -1 ? 'Initial' : k}`}
              >
                k={k === -1 ? "Init" : k}
              </button>
            ))}
          </div>
        </div>

        {/* Main Matrix Display */}
        <div className="mb-6 overflow-x-auto">
          <div
            className="inline-grid gap-1 text-sm"
            style={{ gridTemplateColumns: `repeat(${matrix.length + 1}, minmax(70px, 1fr))` }}
          >
            {/* Header row */}
            <div className="font-bold text-center p-2 border-b-2 border-border"></div>
            {matrix.map((_, colIndex) => (
              <div
                key={`header-${colIndex}`}
                className={`font-bold text-center p-2 border-b-2 border-border ${
                  k >= 0 && k === colIndex ? "bg-accent/20" : ""
                }`}
              >
                {colIndex}
              </div>
            ))}

            {/* Matrix rows */}
            {matrix.map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} className="contents">
                <div
                  className={`font-bold text-center p-2 border-r-2 border-border ${
                    k >= 0 && k === rowIndex ? "bg-accent/20" : ""
                  }`}
                >
                  {rowIndex}
                </div>
                {row.map((value, colIndex) => {
                  const highlightType = getCellHighlight(rowIndex, colIndex);
                  const previousValue = getPreviousValue(rowIndex, colIndex);

                  return (
                    <MatrixCell
                      key={`cell-${rowIndex}-${colIndex}`}
                      rowIndex={rowIndex}
                      colIndex={colIndex}
                      value={value}
                      highlightType={highlightType}
                      previousValue={previousValue}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Playback Controls */}
          <div className="flex gap-2 items-center">
            <Button
              onClick={handlePrev}
              variant="outline"
              size="icon"
              disabled={currentIndex === 0}
              aria-label="Previous frame"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              onClick={handlePlayPause}
              className="flex-1"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
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
              disabled={currentIndex >= frames.length - 1}
              aria-label="Next frame"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="icon"
              aria-label="Reset to first frame"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Animation Speed</Label>
              <span className="text-xs text-muted-foreground">{speed}ms</span>
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
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Legend</h4>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-cyan-400 bg-cyan-50/50 rounded"></div>
              <span>(i, k) or (k, j) - via cells</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-yellow-400 bg-yellow-50/50 rounded"></div>
              <span>(i, j) - current cell being checked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-green-500 bg-green-100/70 rounded animate-pulse"></div>
              <span>(i, j) - updated cell</span>
            </div>
            {mode === "distance" && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">∞</span>
                <span>Infinity / Unreachable</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MatrixViewerWithFrames;

