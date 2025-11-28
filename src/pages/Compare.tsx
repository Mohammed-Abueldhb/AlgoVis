import { useState } from "react";
import { Trophy, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TabBar } from "@/components/TabBar";
import { generateQuickSortSteps } from "@/lib/stepGenerators/quickSort";
import { generateMergeSortSteps } from "@/lib/stepGenerators/mergeSort";
import { generateInsertionSortSteps } from "@/lib/stepGenerators/insertionSort";
import { generateSelectionSortSteps } from "@/lib/stepGenerators/selectionSort";
import { generateHeapSortSteps } from "@/lib/stepGenerators/heapSort";
import { generateBinarySearchSteps } from "@/lib/stepGenerators/binarySearch";
import { generateLinearSearchSteps } from "@/lib/stepGenerators/linearSearch";
import { generateInterpolationSearchSteps } from "@/lib/stepGenerators/interpolationSearch";
import { generateExponentialSearchSteps } from "@/lib/stepGenerators/exponentialSearch";
import { generateFibonacciSearchSteps } from "@/lib/stepGenerators/fibonacciSearch";

const tabs = [
  { id: "sorting", label: "Sorting" },
  { id: "searching", label: "Searching" },
];

interface Algorithm {
  id: string;
  name: string;
  generator: (arr: number[], target?: number) => any[];
}

const sortingAlgorithms: Algorithm[] = [
  { id: "quick", name: "Quick Sort", generator: generateQuickSortSteps },
  { id: "merge", name: "Merge Sort", generator: generateMergeSortSteps },
  { id: "insertion", name: "Insertion Sort", generator: generateInsertionSortSteps },
  { id: "selection", name: "Selection Sort", generator: generateSelectionSortSteps },
  { id: "heap", name: "Heap Sort", generator: generateHeapSortSteps },
];

const searchingAlgorithms: Algorithm[] = [
  { id: "binary", name: "Binary Search", generator: generateBinarySearchSteps },
  { id: "linear", name: "Linear Search", generator: generateLinearSearchSteps },
  { id: "interpolation", name: "Interpolation Search", generator: generateInterpolationSearchSteps },
  { id: "exponential", name: "Exponential Search", generator: generateExponentialSearchSteps },
  { id: "fibonacci", name: "Fibonacci Search", generator: generateFibonacciSearchSteps },
];

interface ComparisonResult {
  id: string;
  name: string;
  time: number;
  steps: number;
  winner: boolean;
}

const Compare = () => {
  const [activeTab, setActiveTab] = useState<"sorting" | "searching">("sorting");
  const [selected, setSelected] = useState<string[]>([]);
  const [arraySize, setArraySize] = useState(20);
  const [speed, setSpeed] = useState(500);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [sharedArray, setSharedArray] = useState<number[]>([]);

  const algorithms = activeTab === "sorting" ? sortingAlgorithms : searchingAlgorithms;

  const handleToggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleStart = () => {
    if (selected.length < 2) return;
    
    setIsRunning(true);
    const newArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 10);
    setSharedArray(newArray);
    
    const target = activeTab === "searching" ? newArray[Math.floor(Math.random() * newArray.length)] : undefined;
    const newResults: ComparisonResult[] = [];

    // Run each selected algorithm
    selected.forEach(algoId => {
      const algo = algorithms.find(a => a.id === algoId);
      if (!algo) return;

      const startTime = performance.now();
      const frames = target !== undefined 
        ? algo.generator([...newArray], target)
        : algo.generator([...newArray]);
      const endTime = performance.now();

      newResults.push({
        id: algoId,
        name: algo.name,
        time: Math.round(endTime - startTime),
        steps: frames.length,
        winner: false
      });
    });

    // Sort by time and mark winner
    newResults.sort((a, b) => a.time - b.time);
    if (newResults.length > 0) {
      newResults[0].winner = true;
    }

    setResults(newResults);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient-accent">Compare</span>{" "}
            <span className="text-foreground">Algorithms</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Race algorithms side-by-side to understand performance differences
          </p>
        </div>

        {/* Type Selector */}
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => {
          setActiveTab(id as "sorting" | "searching");
          setSelected([]);
          setResults([]);
        }} />

        <div className="grid lg:grid-cols-[1fr_400px] gap-8 mt-8">
          {/* Algorithm Selection */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-xl font-semibold mb-4">Select Algorithms to Compare</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Choose at least 2 algorithms from the same category
              </p>
              
              <div className="space-y-3">
                {algorithms.map((algo) => (
                  <div
                    key={algo.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                      selected.includes(algo.id)
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <Checkbox
                      id={algo.id}
                      checked={selected.includes(algo.id)}
                      onCheckedChange={() => handleToggle(algo.id)}
                    />
                    <Label
                      htmlFor={algo.id}
                      className="flex-1 cursor-pointer"
                    >
                      {algo.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="bg-card rounded-xl p-6 border border-border animate-fade-in">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-warning" />
                  Race Results
                </h3>
                
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div
                      key={result.id}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        result.winner
                          ? 'border-success bg-success/10'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`text-2xl font-bold ${
                            result.winner ? 'text-success' : 'text-muted-foreground'
                          }`}>
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-lg">{result.name}</div>
                            {result.winner && (
                              <div className="text-sm text-success font-semibold">🏆 Winner!</div>
                            )}
                          </div>
                        </div>
                        {result.winner && <Trophy className="w-8 h-8 text-warning" />}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Generation Time</div>
                          <div className="font-mono text-lg">{result.time}ms</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Total Steps</div>
                          <div className="font-mono text-lg">{result.steps}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleStart}
                  className="w-full mt-6 bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Run Again
                </Button>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Configuration</h3>
                
                {/* Array Size */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <Label>Array Size</Label>
                    <span className="text-sm text-muted-foreground">{arraySize}</span>
                  </div>
                  <Slider
                    value={[arraySize]}
                    onValueChange={([value]) => setArraySize(value)}
                    min={5}
                    max={30}
                    step={1}
                    className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                  />
                </div>

                {/* Speed */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Animation Speed (ms)</Label>
                    <span className="text-sm text-muted-foreground">{speed}</span>
                  </div>
                  <Slider
                    value={[speed]}
                    onValueChange={([value]) => setSpeed(value)}
                    min={50}
                    max={2000}
                    step={50}
                    className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                  />
                </div>
              </div>

              <Button
                onClick={handleStart}
                disabled={selected.length < 2 || isRunning}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
                size="lg"
              >
                <Clock className="w-5 h-5 mr-2" />
                {isRunning ? 'Running...' : results.length > 0 ? 'Run Again' : 'Start Race'}
              </Button>

              {selected.length < 2 && (
                <p className="text-sm text-muted-foreground text-center">
                  Select at least 2 algorithms to start
                </p>
              )}
            </div>

            {/* Info */}
            <div className="bg-muted/30 rounded-xl p-6 border border-border">
              <h4 className="font-semibold mb-2">How It Works</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All selected algorithms run on the same random array. Times measured are for generating 
                the visualization frames. The fastest algorithm wins!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compare;
