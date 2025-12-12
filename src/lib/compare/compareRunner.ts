/**
 * Unified Compare Runner
 * Generates CompareResult for all algorithm types with deterministic behavior
 */

export interface CompareResult {
  algorithmId: string;
  algorithmName: string;
  frames: any[];
  finalState: any;
  generationTimeMs: number;
  category: "sorting" | "searching" | "greedy" | "dynamic";
}

export interface CompareInput {
  type: "array" | "graph";
  array?: number[];
  graph?: { numVertices: number; edges: any[] };
  target?: number;
  seed?: number;
}

/**
 * Deterministic array generator using seed
 */
export function generateDeterministicArray(size: number, seed: number = 12345): number[] {
  // Simple seeded random number generator
  let state = seed;
  const next = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
  
  return Array.from({ length: size }, () => Math.floor(next() * 90) + 10);
}

/**
 * Run sorting algorithm comparison
 */
export function runSortingCompare(
  algorithmId: string,
  algorithmName: string,
  generator: (arr: number[]) => any[],
  input: number[]
): CompareResult {
  const startTime = performance.now();
  const frames = generator([...input]); // Clone to avoid mutation
  const endTime = performance.now();

  // Extract final state from last frame
  const finalFrame = frames[frames.length - 1] || frames[0];
  const finalState = {
    array: finalFrame?.array || finalFrame?.values || input,
    sorted: true
  };

  return {
    algorithmId,
    algorithmName,
    frames,
    finalState,
    generationTimeMs: Math.round(endTime - startTime),
    category: "sorting"
  };
}

/**
 * Run searching algorithm comparison
 */
export function runSearchingCompare(
  algorithmId: string,
  algorithmName: string,
  generator: (arr: number[], target: number) => any[],
  input: number[],
  target: number
): CompareResult {
  const startTime = performance.now();
  const frames = generator([...input], target); // Clone to avoid mutation
  const endTime = performance.now();

  // Extract final state from last frame
  const finalFrame = frames[frames.length - 1] || frames[0];
  const finalState = {
    array: finalFrame?.array || finalFrame?.values || input,
    target,
    found: finalFrame?.highlights?.some((h: any) => h.type === 'found') || false
  };

  return {
    algorithmId,
    algorithmName,
    frames,
    finalState,
    generationTimeMs: Math.round(endTime - startTime),
    category: "searching"
  };
}

/**
 * Run greedy algorithm comparison
 */
export function runGreedyCompare(
  algorithmId: string,
  algorithmName: string,
  generator: (graph: any, ...args: any[]) => any[],
  graph: { numVertices: number; edges: any[] },
  startVertex?: number
): CompareResult {
  const startTime = performance.now();
  const frames = startVertex !== undefined 
    ? generator(graph, startVertex)
    : generator(graph);
  const endTime = performance.now();

  // Extract final state from last frame
  const finalFrame = frames[frames.length - 1] || frames[0];
  const finalState = {
    edges: finalFrame?.edges || graph.edges,
    selectedEdges: finalFrame?.selectedEdges || [],
    visited: finalFrame?.visited || [],
    finalState: finalFrame?.finalState || finalFrame
  };

  return {
    algorithmId,
    algorithmName,
    frames,
    finalState,
    generationTimeMs: Math.round(endTime - startTime),
    category: "greedy"
  };
}

/**
 * Run dynamic programming algorithm comparison
 */
export function runDPCompare(
  algorithmId: string,
  algorithmName: string,
  generator: (n: number, edges: any[]) => any[],
  numVertices: number,
  edges: any[]
): CompareResult {
  const startTime = performance.now();
  const frames = generator(numVertices, edges);
  const endTime = performance.now();

  // Extract final state from last matrix snapshot
  const matrixSnapshots = frames.filter((f: any) => f.type === "matrixSnapshot");
  const finalSnapshot = matrixSnapshots[matrixSnapshots.length - 1] || matrixSnapshots[0];
  const finalState = {
    matrix: finalSnapshot?.matrix || finalSnapshot?.dist,
    k: finalSnapshot?.k,
    type: "matrixSnapshot"
  };

  return {
    algorithmId,
    algorithmName,
    frames,
    finalState,
    generationTimeMs: Math.round(endTime - startTime),
    category: "dynamic"
  };
}

