import { Play, Pause, SkipForward, SkipBack, RotateCcw, Shuffle, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ControlsPanelProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onRandomize: () => void;
  arraySize: number;
  onArraySizeChange: (size: number) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  currentStep?: number;
  totalSteps?: number;
  targetValue?: number;
  onTargetChange?: (value: number) => void;
  showTarget?: boolean;
  onRunSearch?: () => void;
}

export const ControlsPanel = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onReset,
  onRandomize,
  arraySize,
  onArraySizeChange,
  speed,
  onSpeedChange,
  currentStep = 0,
  totalSteps = 0,
  targetValue,
  onTargetChange,
  showTarget = false,
  onRunSearch,
}: ControlsPanelProps) => {
  return (
    <div className="bg-card rounded-xl p-6 border border-border space-y-6">
      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          onClick={onPrev}
          variant="outline"
          size="icon"
          disabled={currentStep === 0}
          className="hover:bg-accent/10 hover:border-accent"
        >
          <SkipBack className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={onPlayPause}
          size="icon"
          className="w-12 h-12 bg-primary hover:bg-primary/90"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
        
        <Button
          onClick={onNext}
          variant="outline"
          size="icon"
          disabled={currentStep >= totalSteps - 1}
          className="hover:bg-accent/10 hover:border-accent"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-8 bg-border mx-2" />
        
        <Button
          onClick={onReset}
          variant="outline"
          size="icon"
          className="hover:bg-accent/10 hover:border-accent"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress */}
      {totalSteps > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}
        </div>
      )}

      {/* Array Size */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Array Size</Label>
          <span className="text-sm text-muted-foreground">{arraySize}</span>
        </div>
        <Slider
          value={[arraySize]}
          onValueChange={([value]) => onArraySizeChange(value)}
          min={5}
          max={30}
          step={1}
          className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
        />
      </div>

      {/* Speed */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Speed (ms)</Label>
          <span className="text-sm text-muted-foreground">{speed}</span>
        </div>
        <Slider
          value={[speed]}
          onValueChange={([value]) => onSpeedChange(value)}
          min={50}
          max={2000}
          step={50}
          className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
        />
      </div>

      {/* Target Value (for search algorithms) */}
      {showTarget && onTargetChange !== undefined && (
        <div className="space-y-2">
          <Label>Target Value</Label>
          <Input
            type="number"
            value={targetValue ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              onTargetChange(val === "" ? 0 : Number(val));
            }}
            placeholder="Enter target value"
            className="bg-input border-border"
          />
        </div>
      )}

      {/* Run Search Button (for search algorithms) */}
      {showTarget && onRunSearch && (
        <Button
          onClick={onRunSearch}
          className="w-full bg-accent hover:bg-accent/90"
        >
          <Search className="w-4 h-4 mr-2" />
          Run Search
        </Button>
      )}

      {/* Generate New Array */}
      <Button
        onClick={onRandomize}
        className="w-full bg-secondary hover:bg-secondary/90"
      >
        <Shuffle className="w-4 h-4 mr-2" />
        Generate New Array
      </Button>
    </div>
  );
};
