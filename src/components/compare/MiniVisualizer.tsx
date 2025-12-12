import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { GraphMiniView } from "./GraphMiniView";

interface MiniVisualizerProps {
  algorithmType: "sorting" | "searching" | "greedy" | "dp";
  frames?: any[];
  finalState?: any;
  playbackSpeedMs?: number;
  showAnimatedPreview?: boolean;
  onZoom?: () => void;
  syncId?: string;
  highlight?: any;
  onFrameChange?: (frameIndex: number) => void;
  isSynced?: boolean;
  globalPlayState?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
  currentFrameIndex?: number;
  localSpeed?: number;
  onLocalSpeedChange?: (speed: number) => void;
}

export const MiniVisualizer = ({
  algorithmType,
  frames = [],
  finalState,
  playbackSpeedMs = 300,
  showAnimatedPreview = false,
  onZoom,
  syncId,
  highlight,
  onFrameChange,
  isSynced = false,
  globalPlayState = false,
  onPlayStateChange,
  currentFrameIndex: externalFrameIndex,
  localSpeed,
  onLocalSpeedChange,
}: MiniVisualizerProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [internalFrameIndex, setInternalFrameIndex] = useState(0);
  const animationRef = useRef<number>();

  // Use external frame index when synced, internal when not
  const currentFrameIndex = isSynced && externalFrameIndex !== undefined 
    ? externalFrameIndex 
    : internalFrameIndex;

  // Sync with global play state if synced
  useEffect(() => {
    if (isSynced && globalPlayState !== undefined) {
      setIsAnimating(globalPlayState);
    }
  }, [isSynced, globalPlayState]);

  // Update internal index when external changes (synced mode)
  useEffect(() => {
    if (isSynced && externalFrameIndex !== undefined) {
      setInternalFrameIndex(externalFrameIndex);
    }
  }, [isSynced, externalFrameIndex]);

  // Get current frame
  const getCurrentFrame = () => {
    if (showAnimatedPreview && frames.length > 0) {
      // Use currentFrameIndex to get the exact frame
      const frame = frames[currentFrameIndex];
      if (frame) return frame;
      // Fallback to last frame if index is out of bounds
      return frames[frames.length - 1];
    }
    // If not in preview mode, use finalState or last frame
    return finalState || (frames.length > 0 ? frames[frames.length - 1] : null);
  };

  const currentFrame = getCurrentFrame();

  // Animation logic (only when NOT synced)
  useEffect(() => {
    if (!isSynced && showAnimatedPreview && isAnimating && frames.length > 0 && playbackSpeedMs > 0) {
      animationRef.current = window.setInterval(() => {
        setInternalFrameIndex((prev) => {
          const max = frames.length - 1;
          const next = Math.min(prev + 1, max);
          if (onFrameChange) onFrameChange(next);
          if (next >= max) {
            setIsAnimating(false);
            if (onPlayStateChange) onPlayStateChange(false);
          }
          return next;
        });
      }, playbackSpeedMs);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = undefined;
      }
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isSynced, showAnimatedPreview, isAnimating, frames.length, playbackSpeedMs, onFrameChange, onPlayStateChange]);

  const handlePlayPause = () => {
    if (frames.length === 0) return;
    const newState = !isAnimating;
    setIsAnimating(newState);
    if (onPlayStateChange) onPlayStateChange(newState);
    if (!newState && currentFrameIndex >= frames.length - 1) {
      const resetIndex = 0;
      if (isSynced) {
        if (onFrameChange) onFrameChange(resetIndex);
      } else {
        setInternalFrameIndex(resetIndex);
        if (onFrameChange) onFrameChange(resetIndex);
      }
    }
  };

  const handleStepForward = () => {
    if (frames.length === 0) return;
    const max = frames.length - 1;
    const next = Math.min(currentFrameIndex + 1, max);
    if (isSynced) {
      if (onFrameChange) onFrameChange(next);
    } else {
      setInternalFrameIndex(next);
      if (onFrameChange) onFrameChange(next);
    }
    setIsAnimating(false);
    if (onPlayStateChange) onPlayStateChange(false);
  };

  const handleStepBack = () => {
    if (frames.length === 0) return;
    const prev = Math.max(currentFrameIndex - 1, 0);
    if (isSynced) {
      if (onFrameChange) onFrameChange(prev);
    } else {
      setInternalFrameIndex(prev);
      if (onFrameChange) onFrameChange(prev);
    }
    setIsAnimating(false);
    if (onPlayStateChange) onPlayStateChange(false);
  };

  // Sorting algorithms - bars grow from bottom
  if (algorithmType === "sorting" && currentFrame) {
    const array = currentFrame.array || currentFrame.values || [];
    const maxValue = Math.max(...(array.length > 0 ? array : [100]), 1);
    const values = array.slice(0, 20);
    const highlights = currentFrame.highlights || [];

    // Determine bar colors: base, active (compare), swapped
    const getBarColor = (index: number) => {
      const highlight = highlights.find((h: any) => 
        h.indices?.includes(index) || h.i === index || h.j === index
      );
      
      if (highlight?.type === 'swap') {
        return '#FF7B7B'; // Light red for swapped
      } else if (highlight?.type === 'compare' || highlight?.type === 'pivot' || highlight?.type === 'mark') {
        return '#53E0C1'; // Accent color for active/comparing
      } else {
        // Base gradient: #6BA8FF → #8AB6FF
        return 'rgba(120, 170, 255, 0.9)';
      }
    };

    return (
      <div className="bg-card rounded-lg p-3 border border-border/50 min-w-[220px] flex-1">
        <div className="flex items-end h-40 w-full gap-1 mb-2">
          {values.map((value: number, index: number) => {
            const barHeight = (value / maxValue) * 95;
            const barColor = getBarColor(index);
            return (
              <div
                key={`bar-${index}`}
                className="rounded-t-md transition-all duration-100"
                style={{
                  height: `${barHeight}%`,
                  width: `${100 / values.length}%`,
                  minHeight: '4px',
                  backgroundColor: barColor,
                }}
              />
            );
          })}
        </div>
        {showAnimatedPreview && frames.length > 0 && (
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStepBack}
                disabled={currentFrameIndex === 0}
                className="h-6 px-1"
              >
                <SkipBack className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                disabled={isSynced}
                className="h-6 px-1"
                title={isSynced ? "Use Play All button when synced" : ""}
              >
                {isAnimating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStepForward}
                disabled={currentFrameIndex >= frames.length - 1}
                className="h-6 px-1"
              >
                <SkipForward className="w-3 h-3" />
              </Button>
            </div>
            {onZoom && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onZoom}
                className="h-6 px-1"
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Searching algorithms - show array with found element highlighted
  if (algorithmType === "searching" && currentFrame) {
    // Get array from frame, ensure it's an array of numbers
    const rawArray = currentFrame.array || currentFrame.values || [];
    const array = Array.isArray(rawArray) 
      ? rawArray.filter((v: any) => typeof v === 'number' && !isNaN(v) && isFinite(v))
      : [];
    
    const compareIndex = currentFrame.compareIndex ?? null;
    const successIndex = currentFrame.successIndex ?? null;
    
    // Limit to first 20 elements for display
    const values = array.slice(0, 20);

    // Calculate min, max, and range for proper height scaling
    const MIN_HEIGHT = 20; // Minimum bar height in pixels
    const MAX_HEIGHT = 160; // Maximum bar height in pixels
    
    let minVal = 0;
    let maxVal = 100;
    let range = 1;
    
    if (values.length > 0) {
      minVal = Math.min(...values);
      maxVal = Math.max(...values);
      range = Math.max(maxVal - minVal, 1); // Ensure at least 1 to avoid division by zero
    }

    // Determine bar color: green for success, red for compare, base for normal
    const getBarColor = (index: number) => {
      if (successIndex === index) {
        return '#4ADE80'; // Green for success
      } else if (compareIndex === index) {
        return '#FF6B6B'; // Red for comparison
      } else {
        return '#6FA8FF'; // Base color
      }
    };

    // If no values, show message
    if (values.length === 0) {
      return (
        <div className="bg-card rounded-lg p-3 border border-border/50 min-w-[220px] flex-1">
          <div className="text-sm text-muted-foreground text-center py-8">
            No data to display
          </div>
        </div>
      );
    }

    // Get target from frame
    const target = currentFrame.target ?? null;

    return (
      <div className="bg-card rounded-lg p-3 border border-border/50 min-w-[220px] flex-1">
        {/* Display target above bars */}
        {target !== null && (
          <div className="text-xs text-muted-foreground text-center mb-2 font-medium">
            Searching for: <span className="text-accent font-semibold">{target}</span>
          </div>
        )}
        <div className="flex items-end w-full gap-0.5 mb-2 relative" style={{ height: `${MAX_HEIGHT}px` }}>
          {values.map((value: number, index: number) => {
            // Calculate bar height using proper normalization
            // heightPx = ((value - minVal) / range) * (MAX_HEIGHT - MIN_HEIGHT) + MIN_HEIGHT
            const normalizedValue = range > 0 ? (value - minVal) / range : 0;
            const heightPx = normalizedValue * (MAX_HEIGHT - MIN_HEIGHT) + MIN_HEIGHT;
            const barColor = getBarColor(index);
            const isComparing = compareIndex === index;
            
            return (
              <div
                key={`bar-${index}`}
                className="flex flex-col items-center justify-end flex-1"
                style={{
                  width: `${100 / values.length}%`,
                  minWidth: '8px',
                }}
              >
                <div
                  className={`rounded-t-md transition-all duration-100 w-full ${
                    isComparing ? 'animate-pulse' : ''
                  }`}
                  style={{
                    height: `${heightPx}px`,
                    minHeight: `${MIN_HEIGHT}px`,
                    backgroundColor: barColor,
                  }}
                  title={`Index ${index}: Value ${value}`}
                />
                {/* Bar number/label - shows actual value */}
                <div
                  className="text-[10px] font-mono mt-0.5 text-center leading-tight"
                  style={{
                    color: '#C9D7FF',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={`Index ${index}: Value ${value}`}
                >
                  {value}
                </div>
              </div>
            );
          })}
        </div>
        {showAnimatedPreview && frames.length > 0 && (
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStepBack}
                disabled={currentFrameIndex === 0}
                className="h-6 px-1"
              >
                <SkipBack className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                disabled={isSynced}
                className="h-6 px-1"
                title={isSynced ? "Use Play All button when synced" : ""}
              >
                {isAnimating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStepForward}
                disabled={currentFrameIndex >= frames.length - 1}
                className="h-6 px-1"
              >
                <SkipForward className="w-3 h-3" />
              </Button>
            </div>
            {onZoom && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onZoom}
                className="h-6 px-1"
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Greedy algorithms - show graph using GraphMiniView
  if (algorithmType === "greedy" && currentFrame) {
    const nodes = currentFrame.nodes || [];
    const edges = currentFrame.edges || [];
    const selectedEdges = currentFrame.selectedEdges || [];
    const currentEdge = currentFrame.currentEdge ?? null;
    const relaxedEdge = currentFrame.relaxedEdge ?? null; // For Dijkstra
    const distances = currentFrame.distances; // For Dijkstra
    const currentVertex = currentFrame.currentVertex ?? null; // For Dijkstra
    
    // Calculate numVertices from nodes if available, otherwise from edges
    const numVertices = nodes.length > 0
      ? nodes.length
      : currentFrame?.visited?.length 
        ? Math.max(...currentFrame.visited) + 1
        : currentFrame?.edges?.length 
          ? Math.max(...currentFrame.edges.flatMap((e: any) => [e.u, e.v])) + 1
          : 6;

    return (
      <div className="bg-card rounded-lg p-3 border border-border/50 min-w-[220px] flex-1">
        <div className="mb-2">
          <GraphMiniView
            nodes={nodes}
            edges={edges}
            selectedEdges={selectedEdges}
            currentEdge={currentEdge}
            numVertices={numVertices}
            distances={distances}
            relaxedEdge={relaxedEdge}
            currentVertex={currentVertex}
          />
        </div>
        {showAnimatedPreview && frames.length > 0 && (
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStepBack}
                disabled={currentFrameIndex === 0}
                className="h-6 px-1"
              >
                <SkipBack className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                disabled={isSynced}
                className="h-6 px-1"
                title={isSynced ? "Use Play All button when synced" : ""}
              >
                {isAnimating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStepForward}
                disabled={currentFrameIndex >= frames.length - 1}
                className="h-6 px-1"
              >
                <SkipForward className="w-3 h-3" />
              </Button>
            </div>
            {onZoom && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onZoom}
                className="h-6 px-1"
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Dynamic Programming - show matrix
  if (algorithmType === "dp") {
    // Always show matrix - use currentFrame if available, otherwise use initial frame, otherwise last frame
    let matrix: number[][] | null = null;
    let frameType = "initial";
    let k = -1;
    let i = -1;
    let j = -1;
    let highlight: any = {};

    if (currentFrame) {
      matrix = currentFrame.matrix || currentFrame.dist;
      frameType = currentFrame.type || "initial";
      k = currentFrame.k !== undefined ? currentFrame.k : -1;
      i = currentFrame.i !== undefined ? currentFrame.i : -1;
      j = currentFrame.j !== undefined ? currentFrame.j : -1;
      highlight = currentFrame.highlight || {};
    } else if (frames.length > 0) {
      // Try to get initial frame first (type: "initial" or k === -1)
      const initialFrame = frames.find((f: any) => f.type === "initial" || f.k === -1);
      if (initialFrame) {
        matrix = initialFrame.matrix || initialFrame.dist;
        frameType = initialFrame.type || "initial";
        k = initialFrame.k !== undefined ? initialFrame.k : -1;
      } else {
        // Fallback to last frame
        const lastFrame = frames[frames.length - 1];
        matrix = lastFrame.matrix || lastFrame.dist;
        frameType = lastFrame.type || "final";
        k = lastFrame.k !== undefined ? lastFrame.k : -1;
      }
    }

    // If still no matrix, create empty one to prevent "No matrix data"
    if (!matrix || !Array.isArray(matrix) || matrix.length === 0) {
      matrix = Array.from({ length: 4 }, () => Array(4).fill(0));
    }
    
    const formatValue = (value: number): string => {
      if (!Number.isFinite(value)) return '∞';
      if (value >= 1e6) return value.toExponential(2);
      if (value >= 1000) return value.toLocaleString();
      return String(value);
    };

    const maxSize = Math.min(matrix.length, 8);
    
    // Extract highlight info from current frame ONLY (per-frame, not accumulated)
    const currentCell = highlight.currentCell || (i >= 0 && j >= 0 ? [i, j] : null);
    const viaCells = highlight.viaCells || [];
    const isUpdated = highlight.updated === true;
    
    // Only highlight the 3 active cells: (i,k), (k,j), (i,j)
    // Extract via cells: [i,k] and [k,j]
    const viaIK = viaCells.length > 0 ? viaCells[0] : null; // [i, k]
    const viaKJ = viaCells.length > 1 ? viaCells[1] : null; // [k, j]
    const activeIJ = currentCell; // [i, j]

    return (
      <div className="bg-card rounded-lg p-3 border border-border/50 min-w-[220px] flex-1">
        <div className="text-xs text-muted-foreground mb-2 text-center">
          {frameType === "initial" ? 'Initial' : 
           frameType === "final" ? 'Final' : 
           k >= 0 ? `k = ${k}` : 'Matrix'}
        </div>
        <div className="overflow-x-auto mb-2 bg-[#0F172A] rounded p-2">
          <div className="inline-grid gap-1 min-w-max" style={{ gridTemplateColumns: `repeat(${maxSize}, 1fr)` }}>
            {matrix.slice(0, maxSize).map((row: number[], rowIndex: number) =>
              row.slice(0, maxSize).map((value: number, colIndex: number) => {
                // Check if this cell is one of the 3 active cells (per-frame only)
                const isActiveIJ = activeIJ && activeIJ[0] === rowIndex && activeIJ[1] === colIndex;
                const isActiveIK = viaIK && viaIK[0] === rowIndex && viaIK[1] === colIndex;
                const isActiveKJ = viaKJ && viaKJ[0] === rowIndex && viaKJ[1] === colIndex;
                
                // Determine cell background color (only for the 3 active cells)
                let bgColor = '#1E293B'; // default
                let animateClass = '';
                let fontSize = '11px';
                
                // Priority: updated cell > current cell > via cells
                if (isUpdated && isActiveIJ) {
                  bgColor = '#4ADE80'; // green for updated cell
                  animateClass = 'animate-pulse';
                } else if (isActiveIJ) {
                  bgColor = '#FFD86B'; // yellow for current cell (i,j)
                } else if (isActiveIK || isActiveKJ) {
                  bgColor = '#2DD4BF'; // cyan for via cells (i,k) or (k,j)
                }
                
                // Adjust font size for long numbers
                const valueStr = formatValue(value);
                if (valueStr.length > 4) {
                  fontSize = '9px';
                } else if (valueStr.length > 2) {
                  fontSize = '10px';
                }
                
                return (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={`text-center border border-border/30 min-w-[38px] h-[38px] flex items-center justify-center font-mono text-white transition-colors duration-150 ${animateClass}`}
                    style={{ 
                      backgroundColor: bgColor,
                      fontSize: fontSize
                    }}
                  >
                    {valueStr}
                  </div>
                );
              })
            )}
          </div>
        </div>
        {showAnimatedPreview && frames.length > 0 && (
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStepBack}
                disabled={currentFrameIndex === 0}
                className="h-6 px-1"
              >
                <SkipBack className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                disabled={isSynced}
                className="h-6 px-1"
                title={isSynced ? "Use Play All button when synced" : ""}
              >
                {isAnimating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStepForward}
                disabled={currentFrameIndex >= frames.length - 1}
                className="h-6 px-1"
              >
                <SkipForward className="w-3 h-3" />
              </Button>
            </div>
            {onZoom && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onZoom}
                className="h-6 px-1"
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default placeholder
  return (
    <div className="bg-card rounded-lg p-3 border border-border/50 h-40 flex items-center justify-center min-w-[220px] flex-1">
      <div className="text-xs text-muted-foreground text-center">
        No visualization data
      </div>
    </div>
  );
};
