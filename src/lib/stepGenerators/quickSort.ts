export interface TreeFrame {
  type: "split" | "partition" | "final";
  depth: number;
  l: number;
  r: number;
  arraySlice: number[];
  pivotIndex?: number;
  pivotValue?: number;
}

export interface RecursionTreeLevel {
  depth: number;
  nodes: TreeFrame[];
}

export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: "compare" | "swap" | "pivot" | "mark" }[];
  labels?: { title?: string; detail?: string };
  meta?: {
    recursionTree?: RecursionTreeLevel[];
    [key: string]: any;
  };
  treeFrame?: TreeFrame;
}

export function generateQuickSortSteps(arr: number[]): Frame[] {
  const frames: Frame[] = [];
  const array = [...arr];

  const recursionTree: RecursionTreeLevel[] = [];

  const addTreeNode = (
    depth: number,
    l: number,
    r: number,
    type: TreeFrame["type"],
    options?: { pivotIndex?: number; pivotValue?: number }
  ) => {
    if (l > r) return;

    if (!recursionTree[depth]) {
      recursionTree[depth] = { depth, nodes: [] };
    }

    const level = recursionTree[depth];

    const exists = level.nodes.some(
      (node) => node.l === l && node.r === r && node.type === type
    );
    if (exists) return;

    level.nodes.push({
      type,
      depth,
      l,
      r,
      arraySlice: array.slice(l, r + 1),
      pivotIndex: options?.pivotIndex,
      pivotValue: options?.pivotValue,
    });
  };

  if (array.length > 0) {
    // Root node at depth 0 containing the full array
    addTreeNode(0, 0, array.length - 1, "split");
  }

  function quickSortRecursive(low: number, high: number, depth: number = 0) {
    if (low >= high) {
      // Leaf segment (length 1)
      addTreeNode(depth, low, high, "split");

      frames.push({
        array: [...array],
        labels: {
          title: "Base Case",
          detail: `Single element [${array[low]}] at depth ${depth}`,
        },
        treeFrame: {
          type: "split",
          depth,
          l: low,
          r: high,
          arraySlice: array.slice(low, high + 1),
        },
      });
      return;
    }

    // Show the current range being partitioned
    frames.push({
      array: [...array],
      labels: {
        title: "Partition Range",
        detail: `Partitioning [${low}..${high}] at depth ${depth}`,
      },
      treeFrame: {
        type: "split",
        depth,
        l: low,
        r: high,
        arraySlice: array.slice(low, high + 1),
      },
    });

    const pivotIndex = partition(low, high);
    const pivotValue = array[pivotIndex];

    const childDepth = depth + 1;

    // After partitioning, create three logical children:
    // left (< pivot), pivot, and right (> pivot)
    if (low <= pivotIndex - 1) {
      addTreeNode(childDepth, low, pivotIndex - 1, "split");
    }

    // Pivot as its own node
    addTreeNode(childDepth, pivotIndex, pivotIndex, "partition", {
      pivotIndex: 0,
      pivotValue,
    });

    if (pivotIndex + 1 <= high) {
      addTreeNode(childDepth, pivotIndex + 1, high, "split");
    }

    // Frame describing the partitioned state, with the pivot highlighted
    frames.push({
      array: [...array],
      labels: {
        title: "Partitioned",
        detail: `Pivot ${pivotValue} at position ${pivotIndex}, depth ${depth}`,
      },
      treeFrame: {
        type: "partition",
        depth: childDepth,
        l: pivotIndex,
        r: pivotIndex,
        arraySlice: [pivotValue],
        pivotIndex: 0,
        pivotValue,
      },
    });

    // Recursively sort left and right partitions
    quickSortRecursive(low, pivotIndex - 1, childDepth);
    quickSortRecursive(pivotIndex + 1, high, childDepth);
  }

  function partition(low: number, high: number): number {
    const pivot = array[high];
    let i = low - 1;

    // Frame: start partition
    frames.push({
      array: [...array],
      highlights: [{ indices: [high], type: 'pivot' }],
      labels: {
        title: 'Partition',
        detail: `Pivot: ${pivot} at index ${high}`
      }
    });

    for (let j = low; j < high; j++) {
      // Frame: comparison
      frames.push({
        array: [...array],
        highlights: [
          { indices: [j], type: 'compare' },
          { indices: [high], type: 'pivot' }
        ],
        labels: {
          title: 'Compare',
          detail: `Comparing ${array[j]} with pivot ${pivot}`
        }
      });

      if (array[j] < pivot) {
        i++;
        if (i !== j) {
          // Frame: swap
          frames.push({
            array: [...array],
            highlights: [{ indices: [i, j], type: 'swap' }],
            labels: {
              title: 'Swap',
              detail: `Swapping ${array[i]} and ${array[j]}`
            }
          });
          [array[i], array[j]] = [array[j], array[i]];
          // Frame: after swap
          frames.push({
            array: [...array],
            highlights: [{ indices: [i], type: 'mark' }],
            labels: {
              title: 'After Swap',
              detail: `${array[i]} moved to position ${i}`
            }
          });
        }
      }
    }

    // Frame: final swap with pivot
    if (i + 1 !== high) {
      frames.push({
        array: [...array],
        highlights: [{ indices: [i + 1, high], type: 'swap' }],
        labels: {
          title: 'Place Pivot',
          detail: `Placing pivot ${pivot} at position ${i + 1}`
        }
      });
      [array[i + 1], array[high]] = [array[high], array[i + 1]];
      // Frame: after pivot placement
      frames.push({
        array: [...array],
        highlights: [{ indices: [i + 1], type: 'pivot' }],
        labels: {
          title: 'Pivot Placed',
          detail: `Pivot ${pivot} at final position ${i + 1}`
        }
      });
    }
    return i + 1;
  }

  if (array.length > 0) {
    quickSortRecursive(0, array.length - 1, 0);
  }

  frames.push({
    array: [...array],
    labels: { title: "Sorted!", detail: "Quick Sort Complete" },
    treeFrame: {
      type: "final",
      depth: 0,
      l: 0,
      r: array.length - 1,
      arraySlice: [...array],
    },
  });

  // Attach the complete recursion tree to every frame so the visualizer
  // can render a stable, persistent tree independent of the current step.
  frames.forEach((frame) => {
    frame.meta = {
      ...(frame.meta || {}),
      recursionTree,
    };
  });

  return frames;
}
