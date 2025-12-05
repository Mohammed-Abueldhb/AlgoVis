/**
 * Unified Compare Runner
 * Generates CompareResult for all algorithm types with deterministic behavior
 */

import { CompareResult } from './compareRunStore';

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
  let frames: any[] = [];
  let error: string | undefined;
  
  try {
    frames = generator([...input]); // Clone to avoid mutation
  } catch (e: any) {
    error = e.message || 'Unknown error';
    frames = [];
  }
  
  const endTime = performance.now();

  // SECTION G: Ensure at least one frame
  if (frames.length === 0) {
    frames = [{ array: input, values: input }];
  }

  // Extract final state from last frame
  const finalFrame = frames[frames.length - 1] || frames[0];
  const finalState = {
    array: finalFrame?.array || finalFrame?.values || input,
    sorted: true
  };

  // Count stats
  let comparisons = 0;
  let swaps = 0;
  
  frames.forEach((frame: any) => {
    if (frame.highlights) {
      frame.highlights.forEach((h: any) => {
        if (h.type === 'compare') comparisons++;
        if (h.type === 'swap') swaps++;
      });
    }
  });

  return {
    algorithmId,
    algorithmName,
    algorithmType: 'sorting',
    status: error ? 'error' : 'finished',
    frames,
    finalState,
    generationTimeMs: Math.round(endTime - startTime),
    stats: {
      comparisons,
      swaps,
      steps: frames.length
    },
    error
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
  let frames: any[] = [];
  let error: string | undefined;
  
  try {
    frames = generator([...input], target); // Clone to avoid mutation
  } catch (e: any) {
    error = e.message || 'Unknown error';
    frames = [];
  }
  
  const endTime = performance.now();

  // SECTION G: Ensure at least one frame
  if (frames.length === 0) {
    frames = [{ array: input, values: input, target }];
  }

  // Extract final state from last frame
  const finalFrame = frames[frames.length - 1] || frames[0];
  const finalState = {
    array: finalFrame?.array || finalFrame?.values || input,
    target,
    found: finalFrame?.highlights?.some((h: any) => h.type === 'found' || h.type === 'pivot') || false
  };

  // Count comparisons (probes)
  let comparisons = 0;
  frames.forEach((frame: any) => {
    if (frame.pointers || frame.highlights) {
      comparisons++;
    }
  });

  return {
    algorithmId,
    algorithmName,
    algorithmType: 'searching',
    status: error ? 'error' : 'finished',
    frames,
    finalState,
    generationTimeMs: Math.round(endTime - startTime),
    stats: {
      comparisons,
      steps: frames.length
    },
    error
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
  let frames: any[] = [];
  let error: string | undefined;
  
  try {
    frames = startVertex !== undefined 
      ? generator(graph, startVertex)
      : generator(graph);
  } catch (e: any) {
    error = e.message || 'Unknown error';
    frames = [];
  }
  
  const endTime = performance.now();

  // SECTION G: Ensure at least one frame
  if (frames.length === 0) {
    frames = [{ type: 'graphSnapshot', nodes: [], edges: graph.edges }];
  }

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
    algorithmType: 'greedy',
    status: error ? 'error' : 'finished',
    frames,
    finalState,
    generationTimeMs: Math.round(endTime - startTime),
    stats: {
      steps: frames.length
    },
    error
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
  let frames: any[] = [];
  let error: string | undefined;
  
  try {
    frames = generator(numVertices, edges);
  } catch (e: any) {
    error = e.message || 'Unknown error';
    frames = [];
  }
  
  const endTime = performance.now();

  // SECTION G: Ensure at least one frame
  if (frames.length === 0) {
    const emptyMatrix = Array(numVertices).fill(null).map(() => Array(numVertices).fill(0));
    frames = [{ type: "matrixSnapshot", matrix: emptyMatrix, dist: emptyMatrix, k: -1 }];
  }

  // Extract final state from last matrix snapshot
  const matrixSnapshots = frames.filter((f: any) => f.type === "matrixSnapshot");
  const finalSnapshot = matrixSnapshots[matrixSnapshots.length - 1] || matrixSnapshots[0] || frames[0];
  const finalState = {
    matrix: finalSnapshot?.matrix || finalSnapshot?.dist,
    k: finalSnapshot?.k,
    type: "matrixSnapshot"
  };

  return {
    algorithmId,
    algorithmName,
    algorithmType: 'dynamic',
    status: error ? 'error' : 'finished',
    frames,
    finalState,
    generationTimeMs: Math.round(endTime - startTime),
    stats: {
      steps: frames.length
    },
    error
  };
}
