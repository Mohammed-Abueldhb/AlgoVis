export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
  treeFrame?: {
    type: 'split' | 'partition' | 'final';
    depth: number;
    l: number;
    r: number;
    arraySlice: number[];
    pivotIndex?: number;
    pivotValue?: number;
  };
}

export function generateQuickSortSteps(arr: number[]): Frame[] {
  const frames: Frame[] = [];
  const array = [...arr];
  
  frames.push({
    array: [...array],
    labels: { title: 'Initial Array', detail: 'Starting Quick Sort - Building Recursion Tree' },
    treeFrame: {
      type: 'split',
      depth: 0,
      l: 0,
      r: array.length - 1,
      arraySlice: [...array]
    }
  });

  function quickSortRecursive(low: number, high: number, depth: number = 0) {
    if (low >= high) {
      // Base case
      if (low === high) {
        frames.push({
          array: [...array],
          labels: { 
            title: 'Base Case', 
            detail: `Single element [${array[low]}] at depth ${depth}` 
          },
          treeFrame: {
            type: 'split',
            depth,
            l: low,
            r: high,
            arraySlice: [array[low]]
          }
        });
      }
      return;
    }

    // Show the range to partition
    frames.push({
      array: [...array],
      labels: { 
        title: 'Partition Range', 
        detail: `Partitioning [${low}..${high}] at depth ${depth}` 
      },
      treeFrame: {
        type: 'split',
        depth,
        l: low,
        r: high,
        arraySlice: array.slice(low, high + 1)
      }
    });

    // Partition and get pivot position
    const pivotIndex = partition(low, high, depth);

    // Show partitioned state
    frames.push({
      array: [...array],
      labels: { 
        title: 'Partitioned', 
        detail: `Pivot ${array[pivotIndex]} at position ${pivotIndex}, depth ${depth}` 
      },
      treeFrame: {
        type: 'partition',
        depth,
        l: low,
        r: high,
        arraySlice: array.slice(low, high + 1),
        pivotIndex: pivotIndex - low,
        pivotValue: array[pivotIndex]
      }
    });

    // Recursively sort left and right
    quickSortRecursive(low, pivotIndex - 1, depth + 1);
    quickSortRecursive(pivotIndex + 1, high, depth + 1);
  }

  function partition(low: number, high: number, depth: number): number {
    const pivot = array[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (array[j] < pivot) {
        i++;
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    return i + 1;
  }

  quickSortRecursive(0, array.length - 1, 0);

  frames.push({
    array: [...array],
    labels: { title: 'Sorted!', detail: 'Quick Sort Complete' },
    treeFrame: {
      type: 'final',
      depth: 0,
      l: 0,
      r: array.length - 1,
      arraySlice: [...array]
    }
  });

  return frames;
}
