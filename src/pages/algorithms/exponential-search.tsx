import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ControlsPanel } from "@/components/ControlsPanel";
import { CodePanel } from "@/components/CodePanel";
import { AlgorithmInfo } from "@/components/AlgorithmInfo";
import { generateExponentialSearchSteps, Frame } from "@/lib/stepGenerators/exponentialSearch";

const ExponentialSearch = () => {
  const navigate = useNavigate();
  const [arraySize, setArraySize] = useState(15);
  const [speed, setSpeed] = useState(600);
  const [target, setTarget] = useState<number | "">("");
  const [array, setArray] = useState<number[]>([]);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number>();

  // Generate array only - does NOT rebuild steps
  const generateArray = (size: number = arraySize) => {
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 10);
    const sortedArr = [...arr].sort((a, b) => a - b);
    setArray(sortedArr);
    setFrames([{ array: sortedArr, labels: { title: 'Sorted Array', detail: `Array ready. Enter target and click Run Search.` } }]);
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  // Run search on existing array with current target
  const runSearch = () => {
    if (array.length === 0 || target === "") return;
    const newFrames = generateExponentialSearchSteps([...array], Number(target));
    setFrames(newFrames);
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    generateArray(arraySize);
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

  const handleArraySizeChange = (size: number) => {
    setArraySize(size);
    generateArray(size);
  };

  const frame = frames[currentFrame] || { array: [], highlights: [] };
  const maxValue = Math.max(...(frame.array.length > 0 ? frame.array : [100]));

  const getBarColor = (index: number) => {
    const highlights = frame.highlights || [];
    for (const h of highlights) {
      if (h.indices.includes(index)) {
        switch (h.type) {
          case 'pivot': return 'bg-success shadow-lg';
          case 'compare': return 'bg-accent shadow-lg animate-pulse';
          case 'swap': return 'bg-danger shadow-lg';
          case 'mark': return 'bg-muted shadow-sm';
        }
      }
    }
    return 'bg-info';
  };

  const code = `function exponentialSearch(arr, target) {
  if (arr[0] === target) return 0;
  
  // Find range where element may be present
  let i = 1;
  while (i < arr.length && arr[i] <= target) {
    i *= 2;
  }
  
  // Binary search in found range
  return binarySearch(arr, target, 
    Math.floor(i / 2), 
    Math.min(i, arr.length - 1)
  );
}

function binarySearch(arr, target, left, right) {
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) return mid;
    
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
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
          <h1 className="text-4xl font-bold mb-2">Exponential Search Visualizer</h1>
          <p className="text-muted-foreground">Search for unbounded or infinite arrays</p>
        </div>

        {/* Algorithm Info - Full Width */}
        <AlgorithmInfo
          name="Exponential Search"
          description="An efficient search algorithm for unbounded or infinite arrays. It works by finding a range where the target element may be present using exponential increments, then performs binary search within that range."
          complexity={{
            best: "O(1)",
            avg: "O(log n)",
            worst: "O(log n)"
          }}
        />

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Main Visualizer */}
          <div className="space-y-6">
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
                <div className="w-4 h-4 rounded bg-muted" />
                <span className="text-muted-foreground">Search Range</span>
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
              onRandomize={() => generateArray(arraySize)}
              arraySize={arraySize}
              onArraySizeChange={handleArraySizeChange}
              speed={speed}
              onSpeedChange={setSpeed}
              currentStep={currentFrame}
              totalSteps={frames.length}
              showTarget={true}
              targetValue={target === "" ? undefined : Number(target)}
              onTargetChange={(value) => {
                // Only update target, don't regenerate array
                setTarget(value === 0 ? "" : value);
              }}
              onRunSearch={runSearch}
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

export default ExponentialSearch;
