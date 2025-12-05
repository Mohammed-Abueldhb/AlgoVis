import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Play, Pause, Settings, RotateCcw, SkipForward, SkipBack, ZoomIn, Trophy } from "lucide-react";
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

const CompareRunPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const compareRun = (location.state?.compareRun || 
    (() => {
      try {
        const stored = localStorage.getItem('currentCompareRun');
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    })()) as CompareRun | null;

  const [results, setResults] = useState<CompareResult[]>([]);
  const [ranking, setRanking] = useState<ReturnType<typeof computeRanking>>([]);
  const [globalSpeed, setGlobalSpeed] = useState(300);
  const [isSynced, setIsSynced] = useState(true);
  const [globalPlayState, setGlobalPlayState] = useState(false);
  const [showAnimatedPreview, setShowAnimatedPreview] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'generationTimeMs' | 'comparisons' | 'swaps' | 'steps'>('generationTimeMs');
  const [isExecuting, setIsExecuting] = useState(false);
  const syncIntervalRef = useRef<number>();
  const perCardIntervalsRef = useRef<Map<string, number>>(new Map());

  // Initialize and execute algorithms
  useEffect(() => {
    if (!compareRun) {
      navigate("/compare", { replace: true });
      return;
    }

    // Initialize results with running status
    const initialResults: CompareResult[] = compareRun.algorithms.map(algo => ({
      algorithmId: algo.id,
      algorithmName: algo.name,
      algorithmType: algo.type,
      status: 'running',
      frames: [],
      finalState: null,
      generationTimeMs: 0,
      stats: {},
      currentFrameIndex: 0,
      isPlaying: false,
      localSpeed: compareRun.settings.globalSpeedMs
    }));

    setResults(initialResults);
    setGlobalSpeed(compareRun.settings.globalSpeedMs);
    setIsSynced(compareRun.settings.sync);
    setSelectedMetric(compareRun.settings.metric);
    setIsExecuting(true);

    // Execute all algorithms independently
    const executeAlgorithms = async () => {
      const newResults: CompareResult[] = [];

      for (const algo of compareRun.algorithms) {
        try {
          let result: CompareResult;

          if (algo.type === 'sorting') {
            const input = compareRun.input.array || [];
            const generator = getGenerator(algo.id, algo.type);
            if (generator) {
              result = runSortingCompare(algo.id, algo.name, generator, input);
            } else {
              throw new Error(`Generator not found for ${algo.id}`);
            }
          } else if (algo.type === 'searching') {
            const input = compareRun.input.sortedArray || compareRun.input.array || [];
            const target = compareRun.input.target || input[Math.floor(input.length / 2)];
            const generator = getGenerator(algo.id, algo.type);
            if (generator) {
              result = runSearchingCompare(algo.id, algo.name, generator, input, target);
            } else {
              throw new Error(`Generator not found for ${algo.id}`);
            }
          } else if (algo.type === 'greedy') {
            // Use the graph from compareRun (already generated deterministically)
            const graph = compareRun.input.graph as any;
            if (!graph || !graph.numVertices) {
              throw new Error('Graph not found in compare run input');
            }
            const generator = getGenerator(algo.id, algo.type);
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
            // Use the graph from compareRun (already generated deterministically)
            const graph = compareRun.input.graph as any;
            if (!graph || !graph.numVertices) {
              throw new Error('Graph not found in compare run input');
            }
            const directedEdges = graph.edges.flatMap((e: any) => [
              { u: e.u, v: e.v, weight: e.weight },
              { u: e.v, v: e.u, weight: e.weight },
            ]);
            const generator = getGenerator(algo.id, algo.type);
            if (generator) {
              result = runDPCompare(algo.id, algo.name, generator, graph.numVertices, directedEdges);
            } else {
              throw new Error(`Generator not found for ${algo.id}`);
            }
          } else {
            throw new Error(`Unknown algorithm type: ${algo.type}`);
          }

          newResults.push(result);
        } catch (error: any) {
          newResults.push({
            algorithmId: algo.id,
            algorithmName: algo.name,
            algorithmType: algo.type,
            status: 'error',
            frames: [],
            finalState: null,
            generationTimeMs: 0,
            stats: {},
            error: error.message || 'Unknown error'
          });
        }

        // Update results as each completes (for live updates)
        setResults(prev => {
          const updated = [...prev];
          const index = updated.findIndex(r => r.algorithmId === algo.id);
          if (index >= 0) {
            updated[index] = newResults[newResults.length - 1];
          }
          return updated;
        });
      }

      // All algorithms finished - compute ranking
      const finalRanking = computeRanking(newResults, compareRun.settings.metric);
      setRanking(finalRanking);
      setIsExecuting(false);
    };

    executeAlgorithms();
  }, [compareRun, navigate]);

  // Get generator function
  const getGenerator = (id: string, type: string): ((...args: any[]) => any[]) | null => {
    const generators: Record<string, any> = {
      // Sorting
      'quick': generateQuickSortSteps,
      'merge': generateMergeSortSteps,
      'insertion': generateInsertionSortSteps,
      'selection': generateSelectionSortSteps,
      'heap': generateHeapSortSteps,
      // Searching
      'binary': generateBinarySearchSteps,
      'linear': generateLinearSearchSteps,
      'interpolation': generateInterpolationSearchSteps,
      'exponential': generateExponentialSearchSteps,
      'fibonacci': generateFibonacciSearchSteps,
      // Greedy
      'prim': generatePrimSteps,
      'kruskal': generateKruskalSteps,
      'dijkstra': generateDijkstraSteps,
      // Dynamic
      'floyd': generateFloydWarshallFrames,
      'warshall': generateWarshallNumericFrames,
    };
    return generators[id] || null;
  };

  // Sync playback logic
  useEffect(() => {
    if (!isSynced || !globalPlayState || !showAnimatedPreview) {
      // Clear sync interval
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = undefined;
      }
      return;
    }

    // Sync playback: advance all cards in lockstep
    syncIntervalRef.current = window.setInterval(() => {
      setResults(prev => {
        const updated = prev.map(result => {
          if (result.status !== 'finished' && result.status !== 'error') {
            const nextIndex = Math.min(
              (result.currentFrameIndex || 0) + 1,
              result.frames.length - 1
            );
            if (nextIndex >= result.frames.length - 1) {
              // Finished
              return { ...result, currentFrameIndex: result.frames.length - 1, isPlaying: false };
            }
            return { ...result, currentFrameIndex: nextIndex };
          }
          return result;
        });

        // Check if all finished
        const allFinished = updated.every(r => 
          r.status === 'finished' || 
          r.status === 'error' || 
          (r.currentFrameIndex || 0) >= (r.frames.length - 1)
        );

        if (allFinished) {
          setGlobalPlayState(false);
        }

        return updated;
      });
    }, globalSpeed);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isSynced, globalPlayState, globalSpeed, showAnimatedPreview]);

  // Per-card playback (when not synced)
  const handleCardPlayPause = useCallback((resultId: string, playing: boolean) => {
    setResults(prev => prev.map(r => {
      if (r.algorithmId === resultId) {
        return { ...r, isPlaying: playing };
      }
      return r;
    }));

    if (!playing) {
      // Stop per-card interval
      const interval = perCardIntervalsRef.current.get(resultId);
      if (interval) {
        clearInterval(interval);
        perCardIntervalsRef.current.delete(resultId);
      }
      return;
    }

    // Start per-card interval
    const result = results.find(r => r.algorithmId === resultId);
    if (!result || result.frames.length === 0) return;

    const speed = result.localSpeed || globalSpeed;
    const interval = window.setInterval(() => {
      setResults(prev => prev.map(r => {
        if (r.algorithmId === resultId) {
          const nextIndex = Math.min(
            (r.currentFrameIndex || 0) + 1,
            r.frames.length - 1
          );
          if (nextIndex >= r.frames.length - 1) {
            // Finished
            const cardInterval = perCardIntervalsRef.current.get(resultId);
            if (cardInterval) {
              clearInterval(cardInterval);
              perCardIntervalsRef.current.delete(resultId);
            }
            return { ...r, currentFrameIndex: r.frames.length - 1, isPlaying: false };
          }
          return { ...r, currentFrameIndex: nextIndex };
        }
        return r;
      });
    }, speed);

    perCardIntervalsRef.current.set(resultId, interval);
  }, [results, globalSpeed]);

  const handleCardStep = useCallback((resultId: string, direction: 'next' | 'prev') => {
    setResults(prev => prev.map(r => {
      if (r.algorithmId === resultId) {
        const current = r.currentFrameIndex || 0;
        const next = direction === 'next' 
          ? Math.min(current + 1, r.frames.length - 1)
          : Math.max(current - 1, 0);
        return { ...r, currentFrameIndex: next, isPlaying: false };
      }
      return r;
    }));
  }, []);

  const handleLocalSpeedChange = useCallback((resultId: string, speed: number) => {
    setResults(prev => prev.map(r => 
      r.algorithmId === resultId ? { ...r, localSpeed: speed } : r
    ));
  }, []);

  // Recompute ranking when metric changes
  useEffect(() => {
    if (results.length > 0 && results.every(r => r.status === 'finished' || r.status === 'error')) {
      const newRanking = computeRanking(results, selectedMetric);
      setRanking(newRanking);
    }
  }, [results, selectedMetric]);

  const handleRunAgain = () => {
    navigate("/compare");
  };

  if (!compareRun) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No comparison data found.</p>
          <Button onClick={() => navigate("/compare")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Compare
          </Button>
        </div>
      </div>
    );
  }

  const algorithmType = compareRun.algorithms[0]?.type === "dynamic" ? "dp" : 
                        compareRun.algorithms[0]?.type || "sorting";

  // Get current frame for a result
  const getCurrentFrame = (result: CompareResult) => {
    if (!showAnimatedPreview || result.frames.length === 0) {
      return result.finalState;
    }
    const index = result.currentFrameIndex || 0;
    return result.frames[index] || result.finalState;
  };

  // Get place for a result
  const getPlace = (resultId: string) => {
    const rank = ranking.find(r => r.algorithmId === resultId);
    return rank?.place;
  };

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
                Step-by-step visualization of {compareRun.algorithms.length} algorithm{compareRun.algorithms.length > 1 ? "s" : ""}
                {compareRun.seed && ` • Seed: ${compareRun.seed}`}
              </p>
            </div>
            <Button
              onClick={handleRunAgain}
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
                  checked={isSynced}
                  onChange={(e) => setIsSynced(e.target.checked)}
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
              {showAnimatedPreview && isSynced && (
                <Button
                  onClick={() => {
                    if (globalPlayState) {
                      setGlobalPlayState(false);
                    } else {
                      // Reset all to start
                      setResults(prev => prev.map(r => ({
                        ...r,
                        currentFrameIndex: 0,
                        isPlaying: true
                      })));
                      setGlobalPlayState(true);
                    }
                  }}
                  size="sm"
                  variant="outline"
                >
                  {globalPlayState ? (
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

        {/* Results Grid */}
        <div 
          className="grid gap-6 w-full mb-6"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))"
          }}
        >
          {results.map((result) => {
            const place = getPlace(result.algorithmId);
            const currentFrame = getCurrentFrame(result);
            const isPlaying = isSynced ? globalPlayState : result.isPlaying || false;

            return (
              <div
                key={result.algorithmId}
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
                    algorithmType={result.algorithmType === "dynamic" ? "dp" : result.algorithmType}
                    frame={currentFrame}
                    frames={result.frames}
                    playbackSpeedMs={result.localSpeed || globalSpeed}
                    showAnimatedPreview={showAnimatedPreview}
                    localSpeed={result.localSpeed}
                    onLocalSpeedChange={(speed) => handleLocalSpeedChange(result.algorithmId, speed)}
                    isSynced={isSynced}
                    globalPlayState={globalPlayState}
                    onPlayStateChange={(playing) => {
                      if (!isSynced) {
                        handleCardPlayPause(result.algorithmId, playing);
                      } else {
                        setGlobalPlayState(playing);
                      }
                    }}
                    onZoom={() => {
                      // TODO: Open modal with full-size visualizer
                      console.log("Zoom clicked for", result.algorithmName);
                    }}
                  />
                </div>

                {/* Per-Card Controls */}
                {showAnimatedPreview && result.frames.length > 0 && (
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCardStep(result.algorithmId, 'prev')}
                        disabled={(result.currentFrameIndex || 0) === 0}
                        className="h-7 px-2"
                      >
                        <SkipBack className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (isSynced) {
                            setGlobalPlayState(!globalPlayState);
                          } else {
                            handleCardPlayPause(result.algorithmId, !isPlaying);
                          }
                        }}
                        className="h-7 px-2"
                      >
                        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCardStep(result.algorithmId, 'next')}
                        disabled={(result.currentFrameIndex || 0) >= result.frames.length - 1}
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
                      onValueChange={([value]) => handleLocalSpeedChange(result.algorithmId, value)}
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
                        <div>Steps: {result.stats.steps || result.frames.length}</div>
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
