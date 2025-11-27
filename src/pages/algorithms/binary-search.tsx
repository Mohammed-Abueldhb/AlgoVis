import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ControlsPanel } from "@/components/ControlsPanel";
import { CodePanel } from "@/components/CodePanel";
import { generateBinarySearchSteps, Frame } from "@/lib/stepGenerators/binarySearch";

const BinarySearch = () => {
  const navigate = useNavigate();
  const [arraySize, setArraySize] = useState(15);
  const [speed, setSpeed] = useState(800);
  const [targetValue, setTargetValue] = useState(50);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number>();

  const generateArray = (size: number, target: number) => {
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 10);
    const newFrames = generateBinarySearchSteps(arr, target);
    setFrames(newFrames);
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    generateArray(arraySize, targetValue);
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

  const frame = frames[currentFrame] || { array: [], highlights: [] };
  const maxValue = Math.max(...(frame.array.length > 0 ? frame.array : [100]));

  const getBarColor = (index: number) => {
    const highlights = frame.highlights || [];
    for (const h of highlights) {
      if (h.indices.includes(index)) {
        switch (h.type) {
          case 'pivot': return 'bg-success shadow-lg';
          case 'compare': return 'bg-accent shadow-lg';
          case 'swap': return 'bg-danger shadow-lg';
          case 'mark': return 'bg-primary shadow-lg';
        }
      }
    }
    return 'bg-info';
  };

  const code = `function binarySearch(arr, target) {
  arr.sort((a, b) => a - b); // Must be sorted
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid; // Found!
    }
    
    if (arr[mid] < target) {
      left = mid + 1; // Search right half
    } else {
      right = mid - 1; // Search left half
    }
  }
  
  return -1; // Not found
}`;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate("/algorithms")}
            variant="ghost"
            className="mb-4 hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Algorithms
          </Button>
          <h1 className="text-4xl font-bold mb-2">Binary Search Visualizer</h1>
          <p className="text-muted-foreground">Efficient search algorithm for sorted arrays</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Main Visualizer */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-start gap-3 mb-4">
                <Info className="w-5 h-5 text-accent mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Algorithm Info</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Best Case</div>
                      <div className="font-mono">O(1)</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Average</div>
                      <div className="font-mono">O(log n)</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Worst Case</div>
                      <div className="font-mono">O(log n)</div>
                    </div>
                  </div>
                </div>
              </div>
              {frame.labels && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="font-semibold text-accent">{frame.labels.title}</div>
                  {frame.labels.detail && (
                    <div className="text-sm text-muted-foreground mt-1">{frame.labels.detail}</div>
                  )}
                </div>
              )}
            </div>

            {/* Visualizer */}
            <div className="bg-card rounded-xl p-8 border border-border min-h-[500px]">
              <div className="flex items-end justify-center gap-1 h-96">
                {frame.array.map((value, index) => (
                  <div
                    key={`bar-${index}-${value}`}
                    className="flex flex-col items-center justify-end gap-2 flex-1 max-w-[60px] min-w-[20px]"
                    style={{ height: '100%' }}
                  >
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${getBarColor(index)}`}
                      style={{ 
                        height: `${(value / maxValue) * 85}%`,
                        minHeight: '8px'
                      }}
                    />
                    <div className="text-xs text-muted-foreground font-mono whitespace-nowrap">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-success" />
                <span className="text-muted-foreground">Found</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-accent" />
                <span className="text-muted-foreground">Checking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary" />
                <span className="text-muted-foreground">Range Bounds</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-danger" />
                <span className="text-muted-foreground">Eliminated</span>
              </div>
            </div>

            {/* Code Panel - Mobile */}
            <div className="lg:hidden">
              <CodePanel code={code} collapsible defaultOpen={false} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ControlsPanel
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              onPrev={handlePrev}
              onReset={handleReset}
              onRandomize={() => generateArray(arraySize, targetValue)}
              arraySize={arraySize}
              onArraySizeChange={(size) => {
                setArraySize(size);
                generateArray(size, targetValue);
              }}
              speed={speed}
              onSpeedChange={setSpeed}
              currentStep={currentFrame}
              totalSteps={frames.length}
              showTarget={true}
              targetValue={targetValue}
              onTargetChange={(value) => {
                setTargetValue(value);
                generateArray(arraySize, value);
              }}
            />

            {/* Code Panel - Desktop */}
            <div className="hidden lg:block">
              <CodePanel code={code} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinarySearch;
