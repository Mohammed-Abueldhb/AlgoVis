import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, GitCompare, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar } from "@/components/TabBar";
import { generateRandomGraph } from "@/lib/graphGenerator";
import { algorithmIcons } from "@/lib/algorithmIcons";

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
import { generateWarshallWeightedFrames } from "@/lib/stepGenerators/warshallWeighted";

const tabs = [
  { id: "sorting", label: "Sorting" },
  { id: "searching", label: "Searching" },
  { id: "greedy", label: "Greedy & Graph" },
  { id: "dynamic", label: "Dynamic Programming" },
  { id: "floyd-vs-dijkstra", label: "All-Pairs vs Single-Source" },
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
  { id: "warshall", name: "Warshall", generator: (n: number, edges: any[]) => generateWarshallWeightedFrames(n, edges), category: "dynamic" },
];

interface CompareResult {
  id: string;
  name: string;
  time: number;
  winner: boolean;
  finalFrame: any;
  frames: any[];
  localSpeed?: number;
}

const Compare = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"sorting" | "searching" | "greedy" | "dynamic" | "floyd-vs-dijkstra">("sorting");
  const [selected, setSelected] = useState<string[]>([]);
  const [arraySize, setArraySize] = useState(20);
  const [isRunning, setIsRunning] = useState(false);
  const [searchTarget, setSearchTarget] = useState<number | "">("");
  const [sharedArray, setSharedArray] = useState<number[]>([]);
  const [globalSpeed, setGlobalSpeed] = useState(300);
  
  // Floyd vs Dijkstra specific state
  const [nodeCount, setNodeCount] = useState(6);
  const [edgeDensity, setEdgeDensity] = useState(0.4);
  const [sourceNode, setSourceNode] = useState(0);

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


  const getFinalFrame = (frames: any[], category: string): any => {
    if (!frames || frames.length === 0) return null;

    const lastFrame = frames[frames.length - 1];

    // For sorting/searching, return the last frame with array
    if (category === "sorting" || category === "searching") {
      for (let i = frames.length - 1; i >= 0; i--) {
        if (frames[i]?.array) {
          return frames[i];
        }
      }
      return lastFrame;
    }

    // For greedy, return the last frame (should be complete state with selectedEdges)
    if (category === "greedy") {
      for (let i = frames.length - 1; i >= 0; i--) {
        const frame = frames[i];
        if (frame?.type === "complete" || (frame?.selectedEdges && frame.selectedEdges.length > 0)) {
          return frame;
        }
      }
      return lastFrame;
    }

    // For dynamic programming, find the final frame (type: "final") or last frame with matrix
    if (category === "dynamic") {
      // Look for final frame first
      const finalFrame = frames.find((f: any) => f.type === "final");
      if (finalFrame) return finalFrame;
      
      // Otherwise, find last frame with matrix
      for (let i = frames.length - 1; i >= 0; i--) {
        const frame = frames[i];
        if (frame?.matrix || frame?.dist) {
          return frame;
        }
      }
      
      // Fallback to last frame
      return lastFrame;
    }

    return lastFrame;
  };

  const handleStart = () => {
    if (selected.length < 2) return;

    setIsRunning(true);
    const newResults: CompareResult[] = [];
    let inputData: any = {};

    // Generate shared input based on category
    if (activeTab === "sorting" || activeTab === "searching") {
      // For searching: generate sorted array of real values (3-42)
      // For sorting: generate random array
      const newArray = activeTab === "searching"
        ? Array.from({ length: arraySize }, () => Math.floor(Math.random() * 40) + 3).sort((a, b) => a - b)
        : Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 10);
      setSharedArray(newArray);

      // For searching, use provided target or random
      const target = activeTab === "searching" 
        ? (searchTarget !== "" ? Number(searchTarget) : newArray[Math.floor(Math.random() * newArray.length)])
        : undefined;

      selected.forEach(algoId => {
        const algo = algorithms.find(a => a.id === algoId);
        if (!algo) return;

        const startTime = performance.now();
        let frames = target !== undefined
          ? algo.generator([...newArray], target)
          : algo.generator([...newArray]);
        const endTime = performance.now();

        // Ensure at least initial + final frames
        if (!frames || frames.length === 0) {
          frames = [
            { array: [...newArray], labels: { title: 'Initial', detail: 'Starting' } },
            { array: [...newArray], labels: { title: 'Final', detail: 'Complete' } }
          ];
        } else if (frames.length === 1) {
          // Add final frame if only one frame exists
          frames.push({
            ...frames[0],
            labels: { title: 'Final', detail: 'Complete' }
          });
        }

        const finalFrame = getFinalFrame(frames, activeTab);

        newResults.push({
          id: algoId,
          name: algo.name,
          time: Math.round(endTime - startTime),
          winner: false,
          finalFrame,
          frames,
          localSpeed: globalSpeed,
        });
      });

      // Prepare input data
      inputData = {
        type: "array",
        array: newArray,
        target: activeTab === "searching" ? target : undefined
      };
    } else if (activeTab === "greedy") {
      // Use arraySize as node count for greedy algorithms
      const nodeCount = Math.max(4, Math.min(8, arraySize));
      const graph = generateRandomGraph(nodeCount, 0.5);

      selected.forEach(algoId => {
        const algo = algorithms.find(a => a.id === algoId);
        if (!algo) return;

        const startTime = performance.now();
        const frames = algoId === "dijkstra"
          ? algo.generator(graph, 0)
          : algo.generator(graph);
        const endTime = performance.now();

        const finalFrame = getFinalFrame(frames, activeTab);

        newResults.push({
          id: algoId,
          name: algo.name,
          time: Math.round(endTime - startTime),
          winner: false,
          finalFrame,
          frames,
          localSpeed: globalSpeed,
        });
      });

      // Prepare input data
      inputData = {
        type: "graph",
        graph: graph
      };
    } else if (activeTab === "dynamic") {
      // Use arraySize as node count for DP algorithms
      const nodeCount = Math.max(4, Math.min(8, arraySize));
      const graph = generateRandomGraph(nodeCount, 0.5);
      const directedEdges = graph.edges.flatMap((e: any) => [
        { u: e.u, v: e.v, weight: e.weight },
        { u: e.v, v: e.u, weight: e.weight },
      ]);

      selected.forEach(algoId => {
        const algo = algorithms.find(a => a.id === algoId);
        if (!algo) return;

        const startTime = performance.now();
        const frames = algo.generator(graph.numVertices, directedEdges);
        const endTime = performance.now();

        const finalFrame = getFinalFrame(frames, activeTab);

        newResults.push({
          id: algoId,
          name: algo.name,
          time: Math.round(endTime - startTime),
          winner: false,
          finalFrame,
          frames,
          localSpeed: globalSpeed,
        });
      });

      // Prepare input data
      inputData = {
        type: "graph",
        graph: { numVertices: nodeCount, edges: directedEdges }
      };
    }

    // Do NOT sort by time or assign winner
    // Ranking will be determined by finish order in CompareRun

    // Navigate to run page with results
    navigate("/compare/run", {
      state: {
        category: activeTab,
        results: newResults,
        input: inputData
      }
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
            Race algorithms side-by-side to understand performance differences
          </p>
        </div>

        {/* Type Selector */}
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => {
          setActiveTab(id as typeof activeTab);
          setSelected([]);
          setSearchTarget("");
        }} />

        {/* Special Tab: Floyd vs Dijkstra */}
        {activeTab === "floyd-vs-dijkstra" ? (
          <div className="w-full space-y-6">
            {/* THEORY SECTION - FIRST */}
            <div className="bg-card rounded-xl p-8 border border-border">
              <div className="flex items-center gap-3 mb-6">
                <Code className="w-6 h-6 text-accent" />
                <h2 className="text-2xl font-bold">All-Pairs vs Single-Source Shortest Path</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                {/* LEFT - Floyd-Warshall */}
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <h3 className="font-semibold text-lg mb-3 text-accent">Floyd–Warshall</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>{" "}
                        <span className="font-medium">Dynamic Programming</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Problem Type:</span>{" "}
                        <span className="font-medium">All-Pairs Shortest Path (APSP)</span>
                      </div>
                      <div className="pt-2">
                        <span className="text-muted-foreground">Description:</span>
                        <p className="mt-1">
                          Computes the shortest distance between <strong>EVERY pair</strong> of nodes in the graph.
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Key Property:</span>
                        <p className="mt-1">Produces a full distance matrix between all nodes.</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time Complexity:</span>{" "}
                        <span className="font-mono">O(N³)</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Use Case:</span>
                        <p className="mt-1">Used when we need shortest paths between all possible pairs.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT - Dijkstra */}
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <h3 className="font-semibold text-lg mb-3 text-accent">Dijkstra</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>{" "}
                        <span className="font-medium">Greedy Algorithm</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Problem Type:</span>{" "}
                        <span className="font-medium">Single-Source Shortest Path (SSSP)</span>
                      </div>
                      <div className="pt-2">
                        <span className="text-muted-foreground">Description:</span>
                        <p className="mt-1">
                          Computes the shortest distances from <strong>ONE selected source node</strong> to all other nodes.
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Key Property:</span>
                        <p className="mt-1">Produces only ONE row of distances.</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time Complexity:</span>{" "}
                        <span className="font-mono">O(E log V)</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Use Case:</span>
                        <p className="mt-1">Used for routing, navigation, and real-time shortest path from a source.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* KEY DIFFERENCE BOX */}
              <div className="bg-accent/10 rounded-lg p-4 border-2 border-accent/30">
                <h4 className="font-semibold mb-3 text-accent">Key Differences</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Floyd →</strong> All pairs at once (matrix output)
                  </div>
                  <div>
                    <strong>Dijkstra →</strong> One source at a time (distance list)
                  </div>
                  <div>
                    <strong>Floyd</strong> is heavier but complete
                  </div>
                  <div>
                    <strong>Dijkstra</strong> is faster but limited to a single source
                  </div>
                </div>
              </div>
            </div>

            {/* CONTROLS SECTION - SECOND */}
            <div className="w-full grid lg:grid-cols-[1fr_350px] gap-6">
              <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="text-xl font-semibold mb-4">Algorithm Selection</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-accent/30 bg-accent/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                      <div>
                        <div className="font-semibold">Floyd–Warshall</div>
                        <div className="text-sm text-muted-foreground">All-Pairs Shortest Path (Locked)</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-accent/30 bg-accent/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                      <div>
                        <div className="font-semibold">Dijkstra</div>
                        <div className="text-sm text-muted-foreground">Single-Source Shortest Path (Locked)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-card rounded-xl p-6 border border-border space-y-6">
                  <h3 className="font-semibold mb-4">Configuration</h3>

                  {/* Node Count */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Node Count</Label>
                      <span className="text-sm text-muted-foreground">{nodeCount}</span>
                    </div>
                    <Slider
                      value={[nodeCount]}
                      onValueChange={([value]) => {
                        setNodeCount(value);
                        setSourceNode(Math.min(sourceNode, value - 1));
                      }}
                      min={4}
                      max={8}
                      step={1}
                      className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                    />
                  </div>

                  {/* Edge Density */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Edge Density</Label>
                      <span className="text-sm text-muted-foreground">{(edgeDensity * 100).toFixed(0)}%</span>
                    </div>
                    <Slider
                      value={[edgeDensity * 100]}
                      onValueChange={([value]) => setEdgeDensity(value / 100)}
                      min={30}
                      max={80}
                      step={10}
                      className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent"
                    />
                  </div>

                  {/* Source Node Selector */}
                  <div className="space-y-3">
                    <Label htmlFor="source-node">Source Node (for Dijkstra)</Label>
                    <Select
                      value={sourceNode.toString()}
                      onValueChange={(value) => setSourceNode(Number(value))}
                    >
                      <SelectTrigger id="source-node">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: nodeCount }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            Node {i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => {
                      navigate("/compare/floyd-vs-dijkstra", {
                        state: {
                          nodeCount,
                          edgeDensity,
                          sourceNode,
                        }
                      });
                    }}
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    <Clock className="w-5 h-5 mr-2" />
                    Run Comparison
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Algorithm Selection */}
          <div className="space-y-6 w-full">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="text-xl font-semibold mb-4">Select Algorithms to Compare</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Choose at least 2 algorithms from the same category
              </p>

              <div className="space-y-3">
                {algorithms.map((algo) => {
                  // Map algorithm IDs to icon keys
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
              </div>

              <Button
                onClick={handleStart}
                disabled={selected.length < 2 || isRunning}
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
            </div>

            {/* Info */}
            <div className="bg-muted/30 rounded-xl p-6 border border-border">
              <h4 className="font-semibold mb-2">How It Works</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All selected algorithms run on the same input. The fastest algorithm (by generation time) wins!
                {activeTab === "searching" && " You can specify a target value or leave it empty for a random target."}
              </p>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
