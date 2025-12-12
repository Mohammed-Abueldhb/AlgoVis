import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface MatrixSnapshot {
  matrix: number[][];
  k: number;
}

interface MatrixViewerProps {
  snapshots: MatrixSnapshot[];
  initialIndex?: number;
  speedMs?: number;
  onPlayEnd?: () => void;
  onSnapshotChange?: (index: number) => void;
}


const formatValue = (value: number): string => {
  if (!Number.isFinite(value)) return '∞';
  if (value >= 1e6) return value.toExponential(2);
  if (value >= 1000) return value.toLocaleString();
  if (Math.abs(value) < 1e-2 && value !== 0) return value.toExponential(2);
  return String(value);
};

export const MatrixViewer = ({
  snapshots,
  initialIndex = 0,
  speedMs = 800,
  onPlayEnd,
  onSnapshotChange,
}: MatrixViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(speedMs);
  const animationRef = useRef<number>();

  const currentSnapshot = snapshots[currentIndex];
  const matrix = currentSnapshot?.matrix || [];

  // Playback effect
  useEffect(() => {
    if (isPlaying && currentIndex < snapshots.length - 1) {
      animationRef.current = window.setTimeout(() => {
        setCurrentIndex(prev => {
          const next = prev + 1;
          if (onSnapshotChange) onSnapshotChange(next);
          return next;
        });
      }, speed);
    } else if (currentIndex >= snapshots.length - 1 && isPlaying) {
      setIsPlaying(false);
      if (onPlayEnd) onPlayEnd();
    }
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isPlaying, currentIndex, snapshots.length, speed, onPlayEnd, onSnapshotChange]);

  const handlePlayPause = () => {
    if (currentIndex >= snapshots.length - 1) {
      setCurrentIndex(0);
      if (onSnapshotChange) onSnapshotChange(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentIndex < snapshots.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      if (onSnapshotChange) onSnapshotChange(next);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      if (onSnapshotChange) onSnapshotChange(prev);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
    if (onSnapshotChange) onSnapshotChange(0);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
    if (onSnapshotChange) onSnapshotChange(index);
  };

  if (snapshots.length === 0 || !currentSnapshot) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border">
        <p className="text-muted-foreground">No matrix data available</p>
      </div>
    );
  }

  const k = currentSnapshot.k;
  const isKRow = (rowIndex: number) => k >= 0 && k === rowIndex;
  const isKCol = (colIndex: number) => k >= 0 && k === colIndex;

  // Get previous snapshot for tooltip
  const previousSnapshot = currentIndex > 0 ? snapshots[currentIndex - 1] : null;
  const getPreviousValue = (i: number, j: number): number | null => {
    if (!previousSnapshot) return null;
    return previousSnapshot.matrix[i]?.[j] ?? null;
  };

  return (
    <TooltipProvider>
      <div className="bg-card rounded-xl p-6 border border-border">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Distance Matrix</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Iteration k = {k === -1 ? "Initial" : k}
            </span>
            <span>
              Snapshot {currentIndex + 1} / {snapshots.length}
            </span>
          </div>
        </div>

        {/* Thumbnail Strip */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {snapshots.map((snapshot, idx) => (
              <button
                key={idx}
                onClick={() => handleThumbnailClick(idx)}
                className={`px-3 py-2 rounded-md text-xs font-mono border transition-all ${
                  idx === currentIndex
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted hover:bg-muted/80 border-border"
                }`}
                aria-label={`Go to snapshot ${idx + 1}, k=${snapshot.k === -1 ? 'Initial' : snapshot.k}`}
              >
                k={snapshot.k === -1 ? "Init" : snapshot.k}
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
                  isKCol(colIndex) ? "bg-accent/20" : ""
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
                    isKRow(rowIndex) ? "bg-accent/20" : ""
                  }`}
                >
                  {rowIndex}
                </div>
                {row.map((value, colIndex) => {
                  const isInfinity = !Number.isFinite(value);
                  const isKRowCell = isKRow(rowIndex);
                  const isKColCell = isKCol(colIndex);
                  const prevValue = getPreviousValue(rowIndex, colIndex);

                  return (
                    <Tooltip key={`cell-${rowIndex}-${colIndex}`}>
                      <TooltipTrigger asChild>
                        <div
                          className={`p-3 text-center border rounded font-mono transition-all duration-200 ${
                            isKRowCell || isKColCell
                              ? "border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/10"
                              : isInfinity
                              ? "border-border bg-muted/20"
                              : "border-border bg-background"
                          }`}
                          aria-label={`Cell [${rowIndex}, ${colIndex}]: ${formatValue(value)}`}
                        >
                          {formatValue(value)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1 text-xs">
                          <div><span className="font-medium">Position:</span> [{rowIndex}, {colIndex}]</div>
                          <div><span className="font-medium">Value:</span> {formatValue(value)}</div>
                          {prevValue !== null && prevValue !== value && (
                            <div><span className="font-medium">Previous:</span> {formatValue(prevValue)}</div>
                          )}
                          {isInfinity && <div className="text-muted-foreground">Unreachable (∞)</div>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
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
              aria-label="Previous snapshot"
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
              disabled={currentIndex >= snapshots.length - 1}
              aria-label="Next snapshot"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="icon"
              aria-label="Reset to first snapshot"
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
              <div className="w-3 h-3 border border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/10 rounded"></div>
              <span>Current k row/column</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs">∞</span>
              <span>Infinity / Unreachable</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MatrixViewer;
