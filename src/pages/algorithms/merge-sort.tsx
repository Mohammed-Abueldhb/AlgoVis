import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ControlsPanel } from "@/components/ControlsPanel";
import { CodePanel } from "@/components/CodePanel";
import { DivideTreeView } from "@/components/DivideTreeView";
import { generateMergeSortSteps } from "@/lib/stepGenerators/mergeSort";
import { AlgorithmInfo } from "@/components/AlgorithmInfo";

interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
  treeFrame?: {
    type: 'split' | 'merge' | 'final';
    depth: number;
    l: number;
    r: number;
    arraySlice: number[];
  };
}

const MergeSort = () => {
  const navigate = useNavigate();
  const [arraySize, setArraySize] = useState(8);
  const [speed, setSpeed] = useState(800);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number>();

  const generateArray = (size: number) => {
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    const newFrames = generateMergeSortSteps(arr);
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

  const code = `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return result.concat(left.slice(i), right.slice(j));
}`;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
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
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Merge Sort Visualizer
          </h1>
          <p className="text-lg text-muted-foreground">
            Divide and conquer sorting with guaranteed O(n log n) • Watch the recursion tree build
          </p>
        </div>

        {/* Algorithm Info - Full Width */}
        <AlgorithmInfo
          name="Merge Sort"
          description="Divide and conquer sorting algorithm with guaranteed O(n log n) time complexity. Recursively divides the array and merges sorted subarrays."
          complexity={{
            best: "O(n log n)",
            avg: "O(n log n)",
            worst: "O(n log n)"
          }}
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

export default MergeSort;
