import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, GitCompare, Copy, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { TabBar } from "@/components/TabBar";
import { generateRandomGraph } from "@/lib/graphGenerator";
import { algorithmIcons } from "@/lib/algorithmIcons";
import { createCompareRun } from "@/lib/compare/compareRunStore";

// Sorting generators
import { generateQuickSortSteps } from "@/lib/stepGenerators/quickSort";
import { generateMergeSortSteps } from "@/lib/stepGenerators/mergeSort";
import { generateInsertionSortSteps } from "@/lib/stepGenerators/insertionSort";
import { generateSelectionSortSteps } from "@/lib/stepGenerators/selectionSort";
import { generateHeapSortSteps } from "@/lib/stepGenerators/heapSort";

// Searching generators
import { generateBinarySearchSteps } from "@/lib/stepGenerators/binarySearch";
import { generateLinearSearchSteps } from "@/lib/stepGenerators/linearSearch";
import { generateInterpolationSearchSteps } from "@/lib/stepGenerators/interpolationSearch";
import { generateExponentialSearchSteps } from "@/lib/stepGenerators/exponentialSearch";
import { generateFibonacciSearchSteps } from "@/lib/stepGenerators/fibonacciSearch";

// Greedy generators
import { generatePrimSteps } from "@/lib/stepGenerators/prim";
import { generateKruskalSteps } from "@/lib/stepGenerators/kruskal";
import { generateDijkstraSteps } from "@/lib/stepGenerators/dijkstra";

// Dynamic Programming generators
import { generateFloydWarshallFrames } from "@/lib/stepGenerators/floydWarshall";
import { generateWarshallNumericFrames } from "@/lib/stepGenerators/warshallNumeric";

const tabs = [
  { id: "sorting", label: "Sorting" },
  { id: "searching", label: "Searching" },
  { id: "greedy", label: "Greedy & Graph" },
  { id: "dynamic", label: "Dynamic Programming" },
];

interface Algorithm {
  id: string;
  name: string;
  generator: (...args: any[]) => any[];
  category: "sorting" | "searching" | "greedy" | "dynamic";
}

const sortingAlgorithms: Algorithm[] = [
  { id: "quick", name: "Quick Sort", generator: generateQuickSortSteps, category: "sorting" },
  { id: "merge", name: "Merge Sort", generator: generateMergeSortSteps, category: "sorting" },
  { id: "insertion", name: "Insertion Sort", generator: generateInsertionSortSteps, category: "sorting" },
  { id: "selection", name: "Selection Sort", generator: generateSelectionSortSteps, category: "sorting" },
  { id: "heap", name: "Heap Sort", generator: generateHeapSortSteps, category: "sorting" },
];

const searchingAlgorithms: Algorithm[] = [
  { id: "binary", name: "Binary Search", generator: generateBinarySearchSteps, category: "searching" },
  { id: "linear", name: "Linear Search", generator: generateLinearSearchSteps, category: "searching" },
  { id: "interpolation", name: "Interpolation Search", generator: generateInterpolationSearchSteps, category: "searching" },
  { id: "exponential", name: "Exponential Search", generator: generateExponentialSearchSteps, category: "searching" },
  { id: "fibonacci", name: "Fibonacci Search", generator: generateFibonacciSearchSteps, category: "searching" },
];

const greedyAlgorithms: Algorithm[] = [
  { id: "prim", name: "Prim's Algorithm", generator: (graph: any) => generatePrimSteps(graph), category: "greedy" },
  { id: "kruskal", name: "Kruskal's Algorithm", generator: (graph: any) => generateKruskalSteps(graph), category: "greedy" },
  { id: "dijkstra", name: "Dijkstra's Algorithm", generator: (graph: any, start: number) => generateDijkstraSteps(graph, start), category: "greedy" },
];

const dynamicAlgorithms: Algorithm[] = [
  { id: "floyd", name: "Floyd–Warshall", generator: (n: number, edges: any[]) => generateFloydWarshallFrames(n, edges), category: "dynamic" },
  { id: "warshall", name: "Warshall", generator: (n: number, edges: any[]) => generateWarshallNumericFrames(n, edges), category: "dynamic" },
];

const Compare = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"sorting" | "searching" | "greedy" | "dynamic">("sorting");
  const [selected, setSelected] = useState<string[]>([]);
  const [arraySize, setArraySize] = useState(20);
  const [isRunning, setIsRunning] = useState(false);
  const [searchTarget, setSearchTarget] = useState<number | "">("");
  const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 1000000));
  const [seedLocked, setSeedLocked] = useState(false);
  const [globalSpeed, setGlobalSpeed] = useState(300);

  const getAlgorithms = () => {
    switch (activeTab) {
      case "sorting": return sortingAlgorithms;
      case "searching": return searchingAlgorithms;
      case "greedy": return greedyAlgorithms;
      case "dynamic": return dynamicAlgorithms;
      default: return sortingAlgorithms;
    }
  };

  const algorithms = getAlgorithms();

  const handleToggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCopySeed = () => {
    navigator.clipboard.writeText(seed.toString());
  };

  const handleStart = () => {
    if (selected.length < 2 || selected.length > 4) return;

    setIsRunning(true);

    // Get selected algorithm objects
    const selectedAlgorithms = selected
      .map(id => algorithms.find(a => a.id === id))
      .filter((a): a is Algorithm => a !== undefined)
      .map(a => ({
        id: a.id,
        name: a.name,
        type: a.category
      }));

    // Determine input configuration
    let inputConfig: {
      type: 'array' | 'graph';
      size?: number;
      nodeCount?: number;
      density?: number;
      target?: number;
      seed: number;
    };

    if (activeTab === "sorting" || activeTab === "searching") {
      inputConfig = {
        type: 'array',
        size: arraySize,
        target: activeTab === "searching" 
          ? (searchTarget !== "" ? Number(searchTarget) : undefined)
          : undefined,
        seed: seedLocked ? seed : Math.floor(Math.random() * 1000000)
      };
    } else {
      // Greedy or Dynamic
      const nodeCount = Math.max(4, Math.min(8, arraySize));
      inputConfig = {
        type: 'graph',
        nodeCount,
        density: 0.5,
        seed: seedLocked ? seed : Math.floor(Math.random() * 1000000)
      };
    }

    // Create compare run
    const compareRun = createCompareRun(
      selectedAlgorithms,
      inputConfig,
      {
        globalSpeedMs: globalSpeed,
        sync: true,
        metric: 'generationTimeMs'
      }
    );

    // Store in localStorage as backup
    try {
      localStorage.setItem('currentCompareRun', JSON.stringify(compareRun));
    } catch (e) {
      console.warn('Failed to save compare run to localStorage', e);
    }

    // Navigate to run page
    navigate("/compare/run", {
      state: { compareRun }
    });

    setIsRunning(false);
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-6 lg:p-10">
      <div className="w-full flex flex-col gap-6">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GitCompare className="w-10 h-10 text-accent" />
            <h1 className="text-5xl font-bold">
              <span className="text-gradient-accent">Compare</span>{" "}
              <span className="text-foreground">Algorithms</span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select algorithms and configure inputs to run a fair comparison
          </p>
        </div>

        {/* Type Selector */}
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => {
          setActiveTab(id as typeof activeTab);
          setSelected([]);
          setSearchTarget("");
        }} />

        <div className="w-full grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Algorithm Selection */}
          <div className="space-y-6 w-full">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-xl font-semibold mb-4">Select Algorithms to Compare</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Choose 2-4 algorithms from the same category
              </p>

              <div className="space-y-3">
                {algorithms.map((algo) => {
                  const iconKey = 
                    algo.id === "quick" ? "quick-sort" :
                    algo.id === "merge" ? "merge-sort" :
                    algo.id === "insertion" ? "insertion-sort" :
                    algo.id === "selection" ? "selection-sort" :
                    algo.id === "heap" ? "heap-sort" :
                    algo.id === "binary" ? "binary-search" :
                    algo.id === "linear" ? "linear-search" :
                    algo.id === "interpolation" ? "interpolation-search" :
                    algo.id === "exponential" ? "exponential-search" :
                    algo.id === "fibonacci" ? "fibonacci-search" :
                    algo.id === "floyd" ? "floyd-warshall" :
                    algo.id;
                  const Icon = algorithmIcons[iconKey as keyof typeof algorithmIcons];
                  return (
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
                        disabled={!selected.includes(algo.id) && selected.length >= 4}
                      />
                      {Icon && (
                        <Icon className="w-5 h-5 text-accent flex-shrink-0" />
                      )}
                      <Label
                        htmlFor={algo.id}
                        className="flex-1 cursor-pointer"
                      >
                        {algo.name}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Configuration</h3>

                {/* Seed Control */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <Label>Random Seed</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopySeed}
                        className="h-7 px-2"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant={seedLocked ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSeedLocked(!seedLocked)}
                        className="h-7 px-2"
                      >
                        <Lock className={`w-3 h-3 ${seedLocked ? '' : 'opacity-50'}`} />
                      </Button>
                    </div>
                  </div>
                  <Input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(Number(e.target.value) || 0)}
                    disabled={seedLocked}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {seedLocked ? "Seed locked - same input will be used" : "Change seed to generate different input"}
                  </p>
                </div>

                {/* Array Size / Graph Size */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <Label>
                      {activeTab === "greedy" || activeTab === "dynamic" 
                        ? "Node Count" 
                        : "Array Size"}
                    </Label>
                    <span className="text-sm text-muted-foreground">{arraySize}</span>
                  </div>
                  <Slider
                    value={[arraySize]}
                    onValueChange={([value]) => setArraySize(value)}
                    min={activeTab === "greedy" || activeTab === "dynamic" ? 4 : 5}
                    max={activeTab === "greedy" || activeTab === "dynamic" ? 8 : 30}
                    step={1}
                    className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                  />
                </div>

                {/* Search Target Input (only for searching) */}
                {activeTab === "searching" && (
                  <div className="space-y-3 mb-6">
                    <Label htmlFor="search-target">Target Value</Label>
                    <Input
                      id="search-target"
                      type="number"
                      value={searchTarget}
                      onChange={(e) => setSearchTarget(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="Enter target (or leave empty for random)"
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Changing target does not regenerate the array
                    </p>
                  </div>
                )}

                {/* Global Speed */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <Label>Global Speed (ms/frame)</Label>
                    <span className="text-sm text-muted-foreground">{globalSpeed}ms</span>
                  </div>
                  <Slider
                    value={[globalSpeed]}
                    onValueChange={([value]) => setGlobalSpeed(value)}
                    min={10}
                    max={2000}
                    step={10}
                    className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                  />
                </div>
              </div>

              <Button
                onClick={handleStart}
                disabled={selected.length < 2 || selected.length > 4 || isRunning}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
                size="lg"
              >
                <Clock className="w-5 h-5 mr-2" />
                {isRunning ? 'Running...' : 'Run'}
              </Button>

              {selected.length < 2 && (
                <p className="text-sm text-muted-foreground text-center">
                  Select at least 2 algorithms to start
                </p>
              )}
              {selected.length > 4 && (
                <p className="text-sm text-warning text-center">
                  Maximum 4 algorithms allowed
                </p>
              )}
            </div>

            {/* Info */}
            <div className="bg-muted/30 rounded-xl p-6 border border-border">
              <h4 className="font-semibold mb-2">How It Works</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All selected algorithms run on the same input. Ranking is computed after all algorithms finish based on the selected metric.
                {activeTab === "searching" && " You can specify a target value or leave it empty for a random target."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compare;
