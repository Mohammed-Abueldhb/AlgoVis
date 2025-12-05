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
}: MiniVisualizerProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const animationRef = useRef<number>();

  // Sync with global play state if synced
  useEffect(() => {
    if (isSynced && globalPlayState !== undefined) {
      setIsAnimating(globalPlayState);
    }
  }, [isSynced, globalPlayState]);

  // Get current frame
  const getCurrentFrame = () => {
    if (showAnimatedPreview && frames.length > 0) {
      return frames[currentFrameIndex] || frames[frames.length - 1] || finalState;
    }
    return finalState || (frames.length > 0 ? frames[frames.length - 1] : null);
  };

  const currentFrame = getCurrentFrame();

  // Animation logic
  useEffect(() => {
    if (showAnimatedPreview && isAnimating && frames.length > 0 && playbackSpeedMs > 0) {
      animationRef.current = window.setInterval(() => {
        setCurrentFrameIndex((prev) => {
          const next = prev >= frames.length - 1 ? frames.length - 1 : prev + 1;
          if (onFrameChange) onFrameChange(next);
          if (next >= frames.length - 1) {
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
  }, [showAnimatedPreview, isAnimating, frames.length, playbackSpeedMs, onFrameChange, onPlayStateChange]);

  const handlePlayPause = () => {
    if (frames.length === 0) return;
    const newState = !isAnimating;
    setIsAnimating(newState);
    if (onPlayStateChange) onPlayStateChange(newState);
    if (!newState && currentFrameIndex >= frames.length - 1) {
      setCurrentFrameIndex(0);
      if (onFrameChange) onFrameChange(0);
    }
  };

  const handleStepForward = () => {
    if (frames.length === 0) return;
    const next = Math.min(currentFrameIndex + 1, frames.length - 1);
    setCurrentFrameIndex(next);
    if (onFrameChange) onFrameChange(next);
    setIsAnimating(false);
    if (onPlayStateChange) onPlayStateChange(false);
  };

  const handleStepBack = () => {
    if (frames.length === 0) return;
    const prev = Math.max(currentFrameIndex - 1, 0);
    setCurrentFrameIndex(prev);
    if (onFrameChange) onFrameChange(prev);
    setIsAnimating(false);
    if (onPlayStateChange) onPlayStateChange(false);
  };

  // Sorting algorithms - bars grow from bottom
  if (algorithmType === "sorting" && currentFrame) {
    const array = currentFrame.array || currentFrame.values || [];
    const maxValue = Math.max(...(array.length > 0 ? array : [100]), 1);
    const values = array.slice(0, 20);
    const highlights = currentFrame.highlights || [];

    return (
      <div className="bg-card rounded-lg p-3 border border-border/50 min-w-[220px] flex-1">
        <div className="flex items-end h-40 w-full gap-1 mb-2">
          {values.map((value: number, index: number) => {
            const barHeight = (value / maxValue) * 95;
            const isHighlighted = highlights.some((h: any) => 
              h.indices?.includes(index) || h.i === index || h.j === index
            );
            return (
              <div
                key={`bar-${index}`}
                className={`rounded-t-md transition-all duration-100 ${
                  isHighlighted ? 'bg-accent' : 'bg-blue-400'
                }`}
                style={{
                  height: `${barHeight}%`,
                  width: `${100 / values.length}%`,
                  minHeight: '4px'
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
                className="h-6 px-1"
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
    const array = currentFrame.array || currentFrame.values || [];
    const maxValue = Math.max(...(array.length > 0 ? array : [100]), 1);
    const highlights = currentFrame.highlights || currentFrame.pointers || {};
    const foundIndex = highlights.find?.((h: any) => h.type === 'found' || h.type === 'pivot')?.indices?.[0] 
      || highlights.probe;
    const values = array.slice(0, 20);

    return (
      <div className="bg-card rounded-lg p-3 border border-border/50 min-w-[220px] flex-1">
        <div className="flex items-end h-40 w-full gap-1 mb-2 relative">
          {values.map((value: number, index: number) => {
            const barHeight = (value / maxValue) * 95;
            const isFound = foundIndex === index;
            const isProbing = highlights.left === index || highlights.right === index || highlights.mid === index;
            return (
              <div
                key={`bar-${index}`}
                className={`rounded-t-md transition-all duration-100 relative ${
                  isFound ? 'bg-green-500' : isProbing ? 'bg-accent' : 'bg-blue-400'
                }`}
                style={{
                  height: `${barHeight}%`,
                  width: `${100 / values.length}%`,
                  minHeight: '4px'
                }}
              >
                {isFound && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs text-green-600 font-bold">
                    ✓
                  </div>
                )}
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
                className="h-6 px-1"
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
    const edges = currentFrame.edges || [];
    const selectedEdges = currentFrame.selectedEdges || [];
    const currentEdge = currentFrame.currentEdge;
    // SECTION D: Use numVertices from frame, fallback to calculating from edges
    const numVertices = currentFrame.numVertices ?? (
      edges.length > 0
        ? Math.max(...edges.flatMap((e: any) => [e.u, e.v])) + 1
        : 6
    );

    return (
      <div className="bg-card rounded-lg p-3 border border-border/50 min-w-[220px] flex-1">
        <div className="mb-2">
          <GraphMiniView
            edges={edges}
            selectedEdges={selectedEdges}
            currentEdge={currentEdge}
            numVertices={numVertices}
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
                className="h-6 px-1"
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
  if (algorithmType === "dp" && currentFrame) {
    const matrix = currentFrame.matrix || currentFrame.dist;
    if (!matrix || !Array.isArray(matrix)) {
      return (
        <div className="bg-card rounded-lg p-3 border border-border/50 h-40 flex items-center justify-center min-w-[220px] flex-1">
          <div className="text-xs text-muted-foreground text-center">
            No matrix data
          </div>
        </div>
      );
    }
    
    const formatValue = (value: number): string => {
      if (!Number.isFinite(value)) return '∞';
      if (value >= 1e6) return value.toExponential(2);
      if (value >= 1000) return value.toLocaleString();
      return String(value);
    };

    const maxSize = Math.min(matrix.length, 8);
    const k = currentFrame.k !== undefined ? currentFrame.k : -1;

    return (
      <div className="bg-card rounded-lg p-3 border border-border/50 min-w-[220px] flex-1">
        <div className="text-xs text-muted-foreground mb-2 text-center">
          {k === -1 ? 'Initial' : k >= matrix.length ? 'Final' : `k = ${k}`}
        </div>
        <div className="overflow-x-auto mb-2 bg-background/50 rounded p-2">
          <div className="inline-grid gap-1 text-[9px] min-w-max" style={{ gridTemplateColumns: `repeat(${maxSize}, 1fr)` }}>
            {matrix.slice(0, maxSize).map((row: number[], rowIndex: number) =>
              row.slice(0, maxSize).map((value: number, colIndex: number) => {
                const isKRow = k >= 0 && k === rowIndex;
                const isKCol = k >= 0 && k === colIndex;
                const isUpdated = currentFrame.i === rowIndex && currentFrame.j === colIndex;
                return (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={`px-1.5 py-1 text-center border border-border/30 bg-background min-w-[28px] font-mono ${
                      isUpdated ? 'bg-success/30 border-success' :
                      isKRow || isKCol ? 'bg-accent/10' : ''
                    }`}
                  >
                    {formatValue(value)}
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
                className="h-6 px-1"
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
