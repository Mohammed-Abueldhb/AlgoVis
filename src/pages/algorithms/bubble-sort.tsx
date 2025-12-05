import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ControlsPanel } from "@/components/ControlsPanel";
import { CodePanel } from "@/components/CodePanel";
import { AlgorithmInfo } from "@/components/AlgorithmInfo";

// TODO: Import bubble sort generator when implemented
// import { generateBubbleSortSteps } from "@/lib/stepGenerators/bubbleSort";

interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'mark' }[];
  labels?: { title?: string; detail?: string };
}

const BubbleSort = () => {
  const navigate = useNavigate();
  const [arraySize, setArraySize] = useState(8);
  const [speed, setSpeed] = useState(800);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [array, setArray] = useState<number[]>([]);
  const animationRef = useRef<number>();

  // Generate initial array
  useEffect(() => {
    generateArray();
  }, [arraySize]);

  const generateArray = () => {
    const newArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 10);
    setArray(newArray);
    setFrames([]);
    setCurrentFrameIndex(0);
    setIsPlaying(false);
  };

  const runAlgorithm = () => {
    // TODO: Implement bubble sort generator
    // For now, create a placeholder implementation
    const steps: Frame[] = [];
    const arr = [...array];
    
    // Simple bubble sort implementation
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        steps.push({
          array: [...arr],
          highlights: [
            { indices: [j, j + 1], type: 'compare' }
          ],
          labels: {
            title: `Comparing ${arr[j]} and ${arr[j + 1]}`,
            detail: `Pass ${i + 1}, Position ${j}`
          }
        });
        
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          steps.push({
            array: [...arr],
            highlights: [
              { indices: [j, j + 1], type: 'swap' }
            ],
            labels: {
              title: `Swapped ${arr[j + 1]} and ${arr[j]}`,
              detail: `Pass ${i + 1}, Position ${j}`
            }
          });
        }
      }
    }
    
    steps.push({
      array: [...arr],
      highlights: [],
      labels: { title: "Sorting Complete", detail: "Array is now sorted" }
    });
    
    setFrames(steps);
    setCurrentFrameIndex(0);
  };

  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      animationRef.current = window.setInterval(() => {
        setCurrentFrameIndex((prev) => {
          if (prev >= frames.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, frames.length, speed]);

  const currentFrame = frames[currentFrameIndex] || { array, highlights: [] };
  const values = currentFrame.array;
  const maxValue = Math.max(...(values.length > 0 ? values : [100]));

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/algorithms")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Algorithms
          </Button>
          <h1 className="text-4xl font-bold mb-2">Bubble Sort</h1>
        </div>

        <AlgorithmInfo
          name="Bubble Sort"
          description="Simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order."
          complexity={{
            best: "O(n)",
            avg: "O(n²)",
            worst: "O(n²)"
          }}
          notes="This is a placeholder implementation. A proper generator will be added later."
        />

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-semibold mb-4">Visualization</h2>
              <div className="flex items-end h-64 w-full gap-1 mb-4">
                {values.map((value, index) => {
                  const barHeight = (value / maxValue) * 95;
                  const highlight = currentFrame.highlights?.find(h => h.indices.includes(index));
                  let bgColor = "bg-blue-400";
                  if (highlight?.type === 'compare') bgColor = "bg-yellow-400";
                  if (highlight?.type === 'swap') bgColor = "bg-red-500";
                  if (highlight?.type === 'mark') bgColor = "bg-green-500";

                  return (
                    <div
                      key={index}
                      className={`${bgColor} rounded-t-md transition-all duration-100 flex-1`}
                      style={{ height: `${barHeight}%`, minHeight: '4px' }}
                    />
                  );
                })}
              </div>
              {currentFrame.labels && (
                <div className="text-center">
                  <p className="font-semibold">{currentFrame.labels.title}</p>
                  {currentFrame.labels.detail && (
                    <p className="text-sm text-muted-foreground">{currentFrame.labels.detail}</p>
                  )}
                </div>
              )}
            </div>

            <ControlsPanel
              arraySize={arraySize}
              onArraySizeChange={setArraySize}
              speed={speed}
              onSpeedChange={setSpeed}
              onGenerateArray={generateArray}
              onRun={runAlgorithm}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onStepForward={() => {
                if (currentFrameIndex < frames.length - 1) {
                  setCurrentFrameIndex(currentFrameIndex + 1);
                }
              }}
              onStepBackward={() => {
                if (currentFrameIndex > 0) {
                  setCurrentFrameIndex(currentFrameIndex - 1);
                }
              }}
              canStepForward={currentFrameIndex < frames.length - 1}
              canStepBackward={currentFrameIndex > 0}
              currentStep={currentFrameIndex + 1}
              totalSteps={frames.length}
            />
          </div>

          <CodePanel algorithmName="Bubble Sort" />
        </div>
      </div>
    </div>
  );
};

export default BubbleSort;


