import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ControlsPanel } from "@/components/ControlsPanel";
import { CodePanel } from "@/components/CodePanel";
import { DivideTreeView } from "@/components/DivideTreeView";
import { AlgorithmInfo } from "@/components/AlgorithmInfo";
import { generateQuickSortSteps } from "@/lib/stepGenerators/quickSort";

interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
  treeFrame?: {
    type: 'split' | 'partition' | 'final';
    depth: number;
    l: number;
    r: number;
    arraySlice: number[];
    pivotIndex?: number;
    pivotValue?: number;
  };
}

const QuickSort = () => {
  const navigate = useNavigate();
  const [arraySize, setArraySize] = useState(8);
  const [speed, setSpeed] = useState(800);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number>();

  const generateArray = (size: number) => {
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    const newFrames = generateQuickSortSteps(arr);
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

  const code = `function quickSort(arr, low, high) {
  if (low < high) {
    // Partition the array
    const pivot = arr[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    const pi = i + 1;
    
    // Recursively sort subarrays
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}`;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
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
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Quick Sort Visualizer
          </h1>
          <p className="text-lg text-muted-foreground">
            Divide and conquer with in-place partitioning • Watch pivot selection and recursion
          </p>
        </div>

        {/* Algorithm Info - Full Width */}
        <AlgorithmInfo
          name="Quick Sort"
          description="Divide-and-conquer sorting algorithm using partitioning. Selects a pivot element and partitions the array around it, then recursively sorts the subarrays."
          complexity={{
            best: "O(n log n)",
            avg: "O(n log n)",
            worst: "O(n²)"
          }}
          notes="Array does not regenerate when target/controls change unless user clicks Generate Array."
        />

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Main Visualizer */}
          <div className="space-y-6">
            {/* Recursion Tree View */}
            <DivideTreeView frames={frames} currentFrameIndex={currentFrame} />

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

export default QuickSort;
