/**
 * Compare Run Store
 * Manages state for compare runs including input generation, algorithm execution, and results
 */

import { generateRandomGraph } from '../graphGenerator';

export interface CompareRun {
  id: string;
  seed: number;
  createdAt: string;
  input: {
    type: 'array' | 'graph';
    array?: number[];
    sortedArray?: number[];
    graph?: any;
    target?: number;
  };
  algorithms: Array<{
    id: string;
    name: string;
    type: 'sorting' | 'searching' | 'greedy' | 'dynamic';
  }>;
  settings: {
    globalSpeedMs: number;
    sync: boolean;
    metric: 'generationTimeMs' | 'comparisons' | 'swaps' | 'steps';
  };
  results?: CompareResult[];
  status: 'pending' | 'running' | 'completed' | 'error';
}

export interface CompareResult {
  algorithmId: string;
  algorithmName: string;
  algorithmType: 'sorting' | 'searching' | 'greedy' | 'dynamic';
  status: 'running' | 'finished' | 'error';
  frames: any[];
  finalState: any;
  generationTimeMs: number;
  stats: {
    comparisons?: number;
    swaps?: number;
    steps?: number;
  };
  error?: string;
  localSpeed?: number;
  currentFrameIndex?: number;
  isPlaying?: boolean;
}

/**
 * Deterministic array generator using seed
 */
export function generateDeterministicArray(size: number, seed: number): number[] {
  // Simple seeded random number generator (Linear Congruential Generator)
  let state = seed;
  const next = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
  
  return Array.from({ length: size }, () => Math.floor(next() * 90) + 10);
}

/**
 * Generate unsorted array for sorting algorithms
 */
export function generateUnsortedArray(size: number, seed: number): number[] {
  return generateDeterministicArray(size, seed);
}

/**
 * Generate sorted array for searching algorithms
 */
export function generateSortedArray(size: number, seed: number): number[] {
  const array = generateDeterministicArray(size, seed);
  return [...array].sort((a, b) => a - b);
}

/**
 * Generate both unsorted and sorted arrays from same seed
 */
export function generateBothArrays(size: number, seed: number): {
  unsorted: number[];
  sorted: number[];
} {
  const unsorted = generateUnsortedArray(size, seed);
  const sorted = [...unsorted].sort((a, b) => a - b);
  return { unsorted, sorted };
}

/**
 * Create a new compare run
 */
export function createCompareRun(
  algorithms: Array<{ id: string; name: string; type: 'sorting' | 'searching' | 'greedy' | 'dynamic' }>,
  inputConfig: {
    type: 'array' | 'graph';
    size?: number;
    nodeCount?: number;
    density?: number;
    target?: number;
    seed?: number;
  },
  settings: {
    globalSpeedMs?: number;
    sync?: boolean;
    metric?: 'generationTimeMs' | 'comparisons' | 'swaps' | 'steps';
  }
): CompareRun {
  const seed = inputConfig.seed || Math.floor(Math.random() * 1000000);
  const runId = `compare-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  let input: CompareRun['input'];

  if (inputConfig.type === 'array') {
    const size = inputConfig.size || 20;
    
    // Determine if we need both sorted and unsorted
    const hasSorting = algorithms.some(a => a.type === 'sorting');
    const hasSearching = algorithms.some(a => a.type === 'searching');
    
    if (hasSorting && hasSearching) {
      // Mixed: generate both
      const { unsorted, sorted } = generateBothArrays(size, seed);
      input = {
        type: 'array',
        array: unsorted,
        sortedArray: sorted,
        target: inputConfig.target
      };
    } else if (hasSorting) {
      // Only sorting: unsorted array
      input = {
        type: 'array',
        array: generateUnsortedArray(size, seed)
      };
    } else if (hasSearching) {
      // Only searching: sorted array
      const sorted = generateSortedArray(size, seed);
      input = {
        type: 'array',
        array: sorted,
        sortedArray: sorted,
        target: inputConfig.target || sorted[Math.floor(sorted.length / 2)]
      };
    } else {
      // Fallback
      input = {
        type: 'array',
        array: generateUnsortedArray(size, seed)
      };
    }
  } else {
    // Graph input (for greedy/dynamic)
    // Generate graph deterministically using seed
    const nodeCount = inputConfig.nodeCount || 5;
    const density = inputConfig.density || 0.5;
    const graph = generateRandomGraph(nodeCount, density, seed);
    
    input = {
      type: 'graph',
      graph: graph
    };
  }

  return {
    id: runId,
    seed,
    createdAt: new Date().toISOString(),
    input,
    algorithms,
    settings: {
      globalSpeedMs: settings.globalSpeedMs || 300,
      sync: settings.sync !== undefined ? settings.sync : true,
      metric: settings.metric || 'generationTimeMs'
    },
    status: 'pending'
  };
}

/**
 * Compute ranking from results
 */
export function computeRanking(
  results: CompareResult[],
  metric: 'generationTimeMs' | 'comparisons' | 'swaps' | 'steps'
): Array<{
  place: number;
  algorithmId: string;
  algorithmName: string;
  metricValue: number;
  details: CompareResult;
}> {
  const finished = results.filter(r => r.status === 'finished');
  
  if (finished.length === 0) return [];

  // Get metric value for each result
  const withMetrics = finished.map(result => {
    let metricValue: number;
    
    switch (metric) {
      case 'generationTimeMs':
        metricValue = result.generationTimeMs;
        break;
      case 'comparisons':
        metricValue = result.stats.comparisons || 0;
        break;
      case 'swaps':
        metricValue = result.stats.swaps || 0;
        break;
      case 'steps':
        metricValue = result.stats.steps || result.frames.length;
        break;
      default:
        metricValue = result.generationTimeMs;
    }

    return {
      ...result,
      metricValue
    };
  });

  // Sort by metric (lower is better for all current metrics)
  withMetrics.sort((a, b) => {
    if (a.metricValue !== b.metricValue) {
      return a.metricValue - b.metricValue;
    }
    // Tie-break by secondary metrics
    if (a.stats.comparisons !== undefined && b.stats.comparisons !== undefined) {
      if (a.stats.comparisons !== b.stats.comparisons) {
        return a.stats.comparisons - b.stats.comparisons;
      }
    }
    if (a.stats.swaps !== undefined && b.stats.swaps !== undefined) {
      if (a.stats.swaps !== b.stats.swaps) {
        return a.stats.swaps - b.stats.swaps;
      }
    }
    // Final tie-break: algorithmId order
    return a.algorithmId.localeCompare(b.algorithmId);
  });

  // Assign places
  return withMetrics.map((result, index) => ({
    place: index + 1,
    algorithmId: result.algorithmId,
    algorithmName: result.algorithmName,
    metricValue: result.metricValue,
    details: result
  }));
}

