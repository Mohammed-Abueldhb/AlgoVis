import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ControlsPanel } from "@/components/ControlsPanel";
import { CodePanel } from "@/components/CodePanel";
import { DivideTreeView } from "@/components/DivideTreeView";
import { generateMergeSortSteps } from "@/lib/stepGenerators/mergeSort";

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
            Merge Sort Visualizer
          </h1>
          <p className="text-lg text-muted-foreground">
            Divide and conquer sorting with guaranteed O(n log n) • Watch the recursion tree build
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Main Visualizer */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border-2 border-border/70 shadow-lg">
              <div className="flex items-start gap-3 mb-4">
                <Info className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-3">Algorithm Complexity</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                      <div className="text-muted-foreground mb-1">Best Case</div>
                      <div className="font-mono font-bold text-success">O(n log n)</div>
                    </div>
                    <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                      <div className="text-muted-foreground mb-1">Average</div>
                      <div className="font-mono font-bold text-info">O(n log n)</div>
                    </div>
                    <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                      <div className="text-muted-foreground mb-1">Worst Case</div>
                      <div className="font-mono font-bold text-warning">O(n log n)</div>
                    </div>
                  </div>
                </div>
              </div>
              {frame.labels && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="font-bold text-accent text-lg">{frame.labels.title}</div>
                  {frame.labels.detail && (
                    <div className="text-sm text-muted-foreground mt-2">{frame.labels.detail}</div>
                  )}
                </div>
              )}
            </div>

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
