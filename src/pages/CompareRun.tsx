import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Play, Pause, Settings, RotateCcw, SkipForward, SkipBack, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MiniVisualizer } from "@/components/compare/MiniVisualizer";
import { CompareRun, CompareResult, computeRanking } from "@/lib/compare/compareRunStore";
import { 
  runSortingCompare, 
  runSearchingCompare, 
  runGreedyCompare, 
  runDPCompare 
} from "@/lib/compare/compareRunner";
import { generateRandomGraph } from "@/lib/graphGenerator";

// Import all generators
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
import { generatePrimSteps } from "@/lib/stepGenerators/prim";
import { generateKruskalSteps } from "@/lib/stepGenerators/kruskal";
import { generateDijkstraSteps } from "@/lib/stepGenerators/dijkstra";
import { generateFloydWarshallFrames } from "@/lib/stepGenerators/floydWarshall";
import { generateWarshallNumericFrames } from "@/lib/stepGenerators/warshallNumeric";

interface ResultWithPlayback extends CompareResult {
  id: number;
  currentFrameIndex: number;
  playing: boolean;
}

const CompareRunPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // SECTION A: Load run input correctly
  const incomingRun = location.state?.runData ?? location.state?.compareRun ?? (() => {
    try {
      const stored = localStorage.getItem("compareRun");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Failed to parse compareRun from localStorage", e);
    }
    return null;
  })() as CompareRun | null;

  if (!incomingRun) {
    navigate("/compare", { replace: true });
    return null;
  }

  const [run, setRun] = useState<CompareRun>(incomingRun);
  const [results, setResults] = useState<ResultWithPlayback[]>([]);
  const [globalPlaying, setGlobalPlaying] = useState(false);
  const [globalSpeed, setGlobalSpeed] = useState(run.settings.globalSpeedMs || 300);
  const [syncPlaybackEnabled, setSyncPlaybackEnabled] = useState(run.settings.sync !== false);
  const [showAnimatedPreview, setShowAnimatedPreview] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'generationTimeMs' | 'comparisons' | 'swaps' | 'steps'>(run.settings.metric || 'generationTimeMs');
  const [isGenerating, setIsGenerating] = useState(false);

  // Store run in localStorage
  useEffect(() => {
    try {
      localStorage.setItem("compareRun", JSON.stringify(run));
    } catch (e) {
      console.warn("Failed to save compareRun to localStorage", e);
    }
  }, [run]);

  // SECTION F: Clear old results before generating new ones
  useEffect(() => {
    localStorage.removeItem("compareResults");
  }, []);

  // SECTION B: Generate results immediately after mount
  useEffect(() => {
    async function generate() {
      setIsGenerating(true);
      
      // SECTION F: Clear old results
      localStorage.removeItem("compareResults");

      const generated: CompareResult[] = [];

      // Get generator function
      const getGenerator = (id: string): ((...args: any[]) => any[]) | null => {
        const generators: Record<string, any> = {
          'quick': generateQuickSortSteps,
          'merge': generateMergeSortSteps,
          'insertion': generateInsertionSortSteps,
          'selection': generateSelectionSortSteps,
          'heap': generateHeapSortSteps,
          'binary': generateBinarySearchSteps,
          'linear': generateLinearSearchSteps,
          'interpolation': generateInterpolationSearchSteps,
          'exponential': generateExponentialSearchSteps,
          'fibonacci': generateFibonacciSearchSteps,
          'prim': generatePrimSteps,
          'kruskal': generateKruskalSteps,
          'dijkstra': generateDijkstraSteps,
          'floyd': generateFloydWarshallFrames,
          'warshall': generateWarshallNumericFrames,
        };
        return generators[id] || null;
      };

      for (const algo of run.algorithms) {
        try {
          let result: CompareResult;

          if (algo.type === 'sorting') {
            // Sorting gets shuffled/unsorted array
            const input = run.input.array || [];
            const generator = getGenerator(algo.id);
            if (generator) {
              result = runSortingCompare(algo.id, algo.name, generator, input);
            } else {
              throw new Error(`Generator not found for ${algo.id}`);
            }
          } else if (algo.type === 'searching') {
            // Searching gets sorted array
            const input = run.input.sortedArray || run.input.array || [];
            const target = run.input.target || input[Math.floor(input.length / 2)];
            const generator = getGenerator(algo.id);
            if (generator) {
              result = runSearchingCompare(algo.id, algo.name, generator, input, target);
            } else {
              throw new Error(`Generator not found for ${algo.id}`);
            }
          } else if (algo.type === 'greedy') {
            const graph = run.input.graph as any;
            if (!graph || !graph.numVertices) {
              throw new Error('Graph not found in compare run input');
            }
            const generator = getGenerator(algo.id);
            if (generator) {
              result = runGreedyCompare(
                algo.id, 
                algo.name, 
                generator, 
                graph,
                algo.id === 'dijkstra' ? 0 : undefined
              );
            } else {
              throw new Error(`Generator not found for ${algo.id}`);
            }
          } else if (algo.type === 'dynamic') {
            const graph = run.input.graph as any;
            if (!graph || !graph.numVertices) {
              throw new Error('Graph not found in compare run input');
            }
            const directedEdges = graph.edges.flatMap((e: any) => [
              { u: e.u, v: e.v, weight: e.weight },
              { u: e.v, v: e.u, weight: e.weight },
            ]);
            const generator = getGenerator(algo.id);
            if (generator) {
              result = runDPCompare(algo.id, algo.name, generator, graph.numVertices, directedEdges);
            } else {
              throw new Error(`Generator not found for ${algo.id}`);
            }
          } else {
            throw new Error(`Unknown algorithm type: ${algo.type}`);
          }

          // SECTION G: Ensure at least one frame
          if (!result.frames || result.frames.length === 0) {
            result.frames = [result.finalState || { array: run.input.array || [] }];
          }

          generated.push(result);
        } catch (error: any) {
          generated.push({
            algorithmId: algo.id,
            algorithmName: algo.name,
            algorithmType: algo.type,
            status: 'error',
            frames: [{ error: error.message || 'Unknown error' }],
            finalState: { error: error.message || 'Unknown error' },
            generationTimeMs: 0,
            stats: {},
            error: error.message || 'Unknown error'
          });
        }
      }

      // Map results with playback state
      const resultsWithPlayback: ResultWithPlayback[] = generated.map((g, idx) => ({
        ...g,
        id: idx,
        currentFrameIndex: 0,
        playing: false,
      }));

      setResults(resultsWithPlayback);
      setIsGenerating(false);

      // Store results in localStorage
      try {
        localStorage.setItem("compareResults", JSON.stringify(generated));
      } catch (e) {
        console.warn("Failed to save results to localStorage", e);
      }
    }

    generate();
  }, [run]);

  // SECTION C: Fixed Playback Engine
  useEffect(() => {
    if (!globalPlaying || !syncPlaybackEnabled) {
      return;
    }

    const interval = setInterval(() => {
      setResults(prev =>
        prev.map(r => {
          if (!r.playing) return r;

          const maxIndex = (r.frames?.length ?? 1) - 1;
          const next = Math.min((r.currentFrameIndex || 0) + 1, maxIndex);

          if (next >= maxIndex) {
            return { ...r, currentFrameIndex: maxIndex, playing: false };
          }

          return { ...r, currentFrameIndex: next };
        })
      );
    }, globalSpeed);

    return () => clearInterval(interval);
  }, [globalPlaying, globalSpeed, syncPlaybackEnabled]);

  // Play All
  function handlePlayAll() {
    setResults(prev =>
      prev.map(r => ({ ...r, playing: true, currentFrameIndex: 0 }))
    );
    setGlobalPlaying(true);
  }

  // Pause All
  function handlePauseAll() {
    setGlobalPlaying(false);
    setResults(prev =>
      prev.map(r => ({ ...r, playing: false }))
    );
  }

  // Handle step forward/backward
  const handleStep = (resultId: number, direction: 'next' | 'prev') => {
    setResults(prev => prev.map(r => {
      if (r.id !== resultId) return r;
      const current = r.currentFrameIndex || 0;
      const maxIndex = (r.frames?.length ?? 1) - 1;
      const next = direction === 'next' 
        ? Math.min(current + 1, maxIndex)
        : Math.max(current - 1, 0);
      return { ...r, currentFrameIndex: next, playing: false };
    }));
  };

  // Handle local speed change
  const handleLocalSpeedChange = (resultId: number, speed: number) => {
    setResults(prev => prev.map(r => 
      r.id === resultId ? { ...r, localSpeed: speed } : r
    ));
  };

  // SECTION E: Compute ranking from current results only
  const ranking = [...results]
    .filter(r => r.status === 'finished' && !r.error)
    .sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (selectedMetric) {
        case 'generationTimeMs':
          aValue = a.generationTimeMs;
          bValue = b.generationTimeMs;
          break;
        case 'comparisons':
          aValue = a.stats.comparisons || 0;
          bValue = b.stats.comparisons || 0;
          break;
        case 'swaps':
          aValue = a.stats.swaps || 0;
          bValue = b.stats.swaps || 0;
          break;
        case 'steps':
          aValue = a.stats.steps || a.frames.length;
          bValue = b.stats.steps || b.frames.length;
          break;
        default:
          aValue = a.generationTimeMs;
          bValue = b.generationTimeMs;
      }

      return aValue - bValue;
    })
    .map((r, idx) => ({
      place: idx + 1,
      algorithmId: r.algorithmId,
      algorithmName: r.algorithmName,
      metricValue: selectedMetric === 'generationTimeMs' ? r.generationTimeMs :
                   selectedMetric === 'comparisons' ? (r.stats.comparisons || 0) :
                   selectedMetric === 'swaps' ? (r.stats.swaps || 0) :
                   (r.stats.steps || r.frames.length),
      details: r
    }));

  // Get place for a result
  const getPlace = (resultId: string) => {
    const rank = ranking.find(r => r.algorithmId === resultId);
    return rank?.place;
  };

  // Get current frame
  const getCurrentFrame = (result: ResultWithPlayback) => {
    if (!showAnimatedPreview || !result.frames || result.frames.length === 0) {
      return result.finalState;
    }
    const index = result.currentFrameIndex || 0;
    return result.frames[index] || result.frames[result.frames.length - 1] || result.finalState;
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4 mx-auto"></div>
          <p className="text-xl text-muted-foreground">Generating results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-10">
      <div className="container mx-auto max-w-[1800px]">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => navigate("/compare")}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Selection
          </Button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-gradient-accent">Compare</span>{" "}
                <span className="text-foreground">Results</span>
              </h1>
              <p className="text-muted-foreground">
                Step-by-step visualization of {run.algorithms.length} algorithm{run.algorithms.length > 1 ? "s" : ""}
                {run.seed && ` • Seed: ${run.seed}`}
              </p>
            </div>
            <Button
              onClick={() => {
                localStorage.removeItem("compareRun");
                localStorage.removeItem("compareResults");
                navigate("/compare");
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Run Again
            </Button>
          </div>
        </div>

        {/* Global Controls */}
        <div className="bg-card rounded-xl p-6 border border-border mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Step-by-Step Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="animate-preview"
                  checked={showAnimatedPreview}
                  onChange={(e) => setShowAnimatedPreview(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="animate-preview" className="text-sm cursor-pointer">
                  Step-by-Step Preview
                </Label>
              </div>

              {/* Sync Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sync-playback"
                  checked={syncPlaybackEnabled}
                  onChange={(e) => {
                    setSyncPlaybackEnabled(e.target.checked);
                    if (!e.target.checked) {
                      setGlobalPlaying(false);
                      setResults(prev => prev.map(r => ({ ...r, playing: false })));
                    }
                  }}
                  className="w-4 h-4"
                />
                <Label htmlFor="sync-playback" className="text-sm cursor-pointer">
                  Sync Playback
                </Label>
              </div>

              {/* Global Speed */}
              {showAnimatedPreview && (
                <div className="flex items-center gap-2 w-48">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-xs text-muted-foreground whitespace-nowrap">Global Speed:</Label>
                  <Slider
                    value={[globalSpeed]}
                    onValueChange={([value]) => setGlobalSpeed(value)}
                    min={10}
                    max={2000}
                    step={10}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-14">
                    {globalSpeed}ms
                  </span>
                </div>
              )}

              {/* Global Play/Pause */}
              {showAnimatedPreview && syncPlaybackEnabled && (
                <Button
                  onClick={globalPlaying ? handlePauseAll : handlePlayAll}
                  size="sm"
                  variant="outline"
                >
                  {globalPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause All
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play All
                    </>
                  )}
                </Button>
              )}

              {/* Metric Selector */}
              {ranking.length > 0 && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Metric:</Label>
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value as any)}
                    className="px-3 py-1 rounded-md bg-background border border-border text-sm"
                  >
                    <option value="generationTimeMs">Time (ms)</option>
                    <option value="comparisons">Comparisons</option>
                    <option value="swaps">Swaps</option>
                    <option value="steps">Steps</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION B: Results Grid - Always Renders */}
        <div 
          className="grid gap-6 w-full mb-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "20px"
          }}
        >
          {results.map((result) => {
            const place = getPlace(result.algorithmId);
            const currentFrame = getCurrentFrame(result);
            const algorithmType = result.algorithmType === "dynamic" ? "dp" : result.algorithmType;

            return (
              <div
                key={result.id}
                className={`p-6 rounded-xl border-2 transition-all flex flex-col ${
                  place === 1
                    ? 'border-success bg-success/10'
                    : place === 2
                    ? 'border-accent/50 bg-accent/5'
                    : place === 3
                    ? 'border-warning/50 bg-warning/5'
                    : 'border-border bg-card'
                }`}
              >
                {/* Algorithm Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {place && (
                      <div className={`text-2xl font-bold ${
                        place === 1 ? 'text-success' : 
                        place === 2 ? 'text-accent' : 
                        place === 3 ? 'text-warning' : 
                        'text-muted-foreground'
                      }`}>
                        #{place}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-lg">{result.algorithmName}</div>
                      <div className="text-xs text-muted-foreground uppercase">
                        {result.algorithmType}
                      </div>
                    </div>
                  </div>
                  {place === 1 && <Trophy className="w-6 h-6 text-warning" />}
                </div>

                {/* Status Indicator */}
                <div className="mb-3">
                  {result.status === 'running' && (
                    <div className="text-xs text-accent flex items-center gap-1">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                      Running...
                    </div>
                  )}
                  {result.status === 'finished' && (
                    <div className="text-xs text-success flex items-center gap-1">
                      <div className="w-2 h-2 bg-success rounded-full" />
                      Finished
                    </div>
                  )}
                  {result.status === 'error' && (
                    <div className="text-xs text-destructive flex items-center gap-1">
                      <div className="w-2 h-2 bg-destructive rounded-full" />
                      Error: {result.error}
                    </div>
                  )}
                </div>

                {/* Mini Visualization */}
                <div className="mb-4 flex-1 min-h-[300px]">
                  <MiniVisualizer
                    algorithmType={algorithmType}
                    frames={result.frames ?? []}
                    finalState={currentFrame || result.finalState}
                    playbackSpeedMs={result.localSpeed || globalSpeed}
                    showAnimatedPreview={showAnimatedPreview}
                    isSynced={syncPlaybackEnabled}
                    globalPlayState={result.playing}
                    onFrameChange={(frameIndex) => {
                      setResults(prev => prev.map(r => 
                        r.id === result.id 
                          ? { ...r, currentFrameIndex: frameIndex }
                          : r
                      ));
                    }}
                    onPlayStateChange={(playing) => {
                      if (!syncPlaybackEnabled) {
                        setResults(prev => prev.map(r => 
                          r.id === result.id ? { ...r, playing } : r
                        ));
                      }
                    }}
                    onZoom={() => {
                      console.log("Zoom clicked for", result.algorithmName);
                    }}
                  />
                </div>

                {/* Per-Card Controls */}
                {showAnimatedPreview && result.frames && result.frames.length > 0 && (
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStep(result.id, 'prev')}
                        disabled={(result.currentFrameIndex || 0) === 0 || syncPlaybackEnabled}
                        className="h-7 px-2"
                      >
                        <SkipBack className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (syncPlaybackEnabled) {
                            if (globalPlaying) handlePauseAll();
                            else handlePlayAll();
                          } else {
                            setResults(prev => prev.map(r => 
                              r.id === result.id ? { ...r, playing: !r.playing } : r
                            ));
                          }
                        }}
                        disabled={syncPlaybackEnabled}
                        className="h-7 px-2"
                      >
                        {result.playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStep(result.id, 'next')}
                        disabled={(result.currentFrameIndex || 0) >= (result.frames?.length ?? 1) - 1 || syncPlaybackEnabled}
                        className="h-7 px-2"
                      >
                        <SkipForward className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(result.currentFrameIndex || 0) + 1} / {result.frames.length}
                    </div>
                  </div>
                )}

                {/* Per-Card Speed */}
                {showAnimatedPreview && (
                  <div className="flex items-center gap-2 mb-4">
                    <Label className="text-xs w-16">Speed:</Label>
                    <Slider
                      value={[result.localSpeed || globalSpeed]}
                      onValueChange={([value]) => handleLocalSpeedChange(result.id, value)}
                      min={10}
                      max={2000}
                      step={10}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-14">
                      {result.localSpeed || globalSpeed}ms
                    </span>
                  </div>
                )}

                {/* Generation Time & Stats */}
                <div className="mt-auto pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Generation Time</div>
                      <div className="font-mono text-lg font-bold">
                        {result.generationTimeMs}ms
                      </div>
                    </div>
                    {result.stats && (
                      <div className="text-right text-xs text-muted-foreground">
                        {result.stats.comparisons !== undefined && (
                          <div>Comparisons: {result.stats.comparisons}</div>
                        )}
                        {result.stats.swaps !== undefined && (
                          <div>Swaps: {result.stats.swaps}</div>
                        )}
                        <div>Steps: {result.stats.steps || (result.frames?.length ?? 0)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ranking Summary */}
        {ranking.length > 0 && (
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning" />
              Final Ranking
            </h3>
            <div className="space-y-2">
              {ranking.map((rank) => (
                <div
                  key={rank.algorithmId}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    rank.place === 1 ? 'bg-success/10 border border-success' :
                    rank.place === 2 ? 'bg-accent/10 border border-accent/50' :
                    rank.place === 3 ? 'bg-warning/10 border border-warning/50' :
                    'bg-muted/30 border border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-xl font-bold ${
                      rank.place === 1 ? 'text-success' :
                      rank.place === 2 ? 'text-accent' :
                      rank.place === 3 ? 'text-warning' :
                      'text-muted-foreground'
                    }`}>
                      #{rank.place}
                    </div>
                    <div>
                      <div className="font-semibold">{rank.algorithmName}</div>
                      <div className="text-xs text-muted-foreground">
                        {selectedMetric === 'generationTimeMs' && `${rank.metricValue}ms`}
                        {selectedMetric === 'comparisons' && `${rank.metricValue} comparisons`}
                        {selectedMetric === 'swaps' && `${rank.metricValue} swaps`}
                        {selectedMetric === 'steps' && `${rank.metricValue} steps`}
                      </div>
                    </div>
                  </div>
                  {rank.place <= 3 && (
                    <Trophy className={`w-5 h-5 ${
                      rank.place === 1 ? 'text-warning' :
                      rank.place === 2 ? 'text-muted-foreground' :
                      'text-muted-foreground/50'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareRunPage;
