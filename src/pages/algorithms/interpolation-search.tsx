import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ControlsPanel } from "@/components/ControlsPanel";
import { CodePanel } from "@/components/CodePanel";
import { generateInterpolationSearchSteps, Frame } from "@/lib/stepGenerators/interpolationSearch";
import { AlgorithmInfo } from "@/components/AlgorithmInfo";

const InterpolationSearch = () => {
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
    const newFrames = generateInterpolationSearchSteps([...array], Number(target));
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

  const code = `function interpolationSearch(arr, target) {
  let low = 0, high = arr.length - 1;
  
  while (low <= high && target >= arr[low] && target <= arr[high]) {
    if (low === high) {
      return arr[low] === target ? low : -1;
    }
    
    // Interpolation formula
    const pos = low + Math.floor(
      ((target - arr[low]) * (high - low)) / 
      (arr[high] - arr[low])
    );
    
    if (arr[pos] === target) {
      return pos;
    }
    
    if (arr[pos] < target) {
      low = pos + 1;
    } else {
      high = pos - 1;
    }
  }
  
  return -1;
}`;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => navigate("/algorithms")}
            variant="ghost"
            className="mb-4 hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Algorithms
          </Button>
          <h1 className="text-4xl font-bold mb-2">Interpolation Search Visualizer</h1>
          <p className="text-muted-foreground">Improved binary search for uniformly distributed data.</p>
        </div>

        {/* Algorithm Info - Full Width */}
        <AlgorithmInfo
          name="Interpolation Search"
          description="Improved binary search for uniformly distributed data. Estimates the probe position based on the value distribution."
          complexity={{
            best: "O(1)",
            avg: "O(log log n)",
            worst: "O(n)"
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
                <span className="text-muted-foreground">Interpolated Position</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted" />
                <span className="text-muted-foreground">Search Bounds</span>
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
              onArraySizeChange={(size) => {
                setArraySize(size);
                generateArray(size);
              }}
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

export default InterpolationSearch;
