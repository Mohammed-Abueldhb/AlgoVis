export interface TreeFrame {
  type: "split" | "merge" | "final";
  depth: number;
  l: number;
  r: number;
  arraySlice: number[];
  parentRange?: { l: number; r: number };
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

export function generateMergeSortSteps(arr: number[]): Frame[] {
  const frames: Frame[] = [];
  const array = [...arr];

  const recursionTree: RecursionTreeLevel[] = [];

  const addTreeNode = (
    depth: number,
    l: number,
    r: number,
    type: TreeFrame["type"]
  ) => {
    if (l > r) return;

    if (!recursionTree[depth]) {
      recursionTree[depth] = { depth, nodes: [] };
    }

    const level = recursionTree[depth];

    // Avoid duplicates for the same range and type at a given depth
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
    });
  };

  if (array.length > 0) {
    // Root node containing the full array at depth 0
    addTreeNode(0, 0, array.length - 1, "split");
  }

  function mergeSortRecursive(left: number, right: number, depth: number = 0) {
    if (left >= right) {
      // Leaf node (single element segment)
      addTreeNode(depth, left, right, "split");

      frames.push({
        array: [...array],
        labels: {
          title: "Base Case",
          detail: `Single element [${array[left]}] at depth ${depth}`,
        },
        treeFrame: {
          type: "split",
          depth,
          l: left,
          r: right,
          arraySlice: array.slice(left, right + 1),
        },
      });
      return;
    }

    const mid = Math.floor((left + right) / 2);

    // Divide step: show current segment being split
    addTreeNode(depth, left, right, "split");

    frames.push({
      array: [...array],
      labels: {
        title: "Divide",
        detail: `Splitting [${left}..${right}] at mid=${mid} (depth ${depth})`,
      },
      treeFrame: {
        type: "split",
        depth,
        l: left,
        r: right,
        arraySlice: array.slice(left, right + 1),
      },
    });

    // Recursively sort left and right halves
    mergeSortRecursive(left, mid, depth + 1);
    mergeSortRecursive(mid + 1, right, depth + 1);

    // Merge the two halves and record merge nodes one level deeper
    merge(left, mid, right, depth);
  }

  function merge(left: number, mid: number, right: number, depth: number) {
    const leftArr = array.slice(left, mid + 1);
    const rightArr = array.slice(mid + 1, right + 1);

    // Pre-merge frame highlighting the merge operation
    frames.push({
      array: [...array],
      labels: {
        title: "Merging",
        detail: `Merge [${left}..${mid}] and [${mid + 1}..${right}] at depth ${depth}`,
      },
      treeFrame: {
        type: "merge",
        depth: depth + 1,
        l: left,
        r: right,
        arraySlice: [...leftArr, ...rightArr],
      },
    });

    let i = 0,
      j = 0,
      k = left;

    while (i < leftArr.length && j < rightArr.length) {
      // Frame: comparison
      frames.push({
        array: [...array],
        highlights: [
          { indices: [left + i], type: 'compare' },
          { indices: [mid + 1 + j], type: 'compare' }
        ],
        labels: {
          title: 'Compare',
          detail: `Comparing ${leftArr[i]} and ${rightArr[j]}`
        }
      });

      if (leftArr[i] <= rightArr[j]) {
        array[k] = leftArr[i];
        // Frame: take from left
        frames.push({
          array: [...array],
          highlights: [{ indices: [k], type: 'mark' }],
          labels: {
            title: 'Take Left',
            detail: `Taking ${leftArr[i]} from left array`
          }
        });
        i++;
      } else {
        array[k] = rightArr[j];
        // Frame: take from right
        frames.push({
          array: [...array],
          highlights: [{ indices: [k], type: 'mark' }],
          labels: {
            title: 'Take Right',
            detail: `Taking ${rightArr[j]} from right array`
          }
        });
        j++;
      }
      k++;
    }

    while (i < leftArr.length) {
      array[k] = leftArr[i];
      // Frame: copy remaining from left
      frames.push({
        array: [...array],
        highlights: [{ indices: [k], type: 'mark' }],
        labels: {
          title: 'Copy Left',
          detail: `Copying remaining ${leftArr[i]} from left`
        }
      });
      i++;
      k++;
    }

    while (j < rightArr.length) {
      array[k] = rightArr[j];
      // Frame: copy remaining from right
      frames.push({
        array: [...array],
        highlights: [{ indices: [k], type: 'mark' }],
        labels: {
          title: 'Copy Right',
          detail: `Copying remaining ${rightArr[j]} from right`
        }
      });
      j++;
      k++;
    }

    // Merged node appears one level deeper than its children
    addTreeNode(depth + 1, left, right, "merge");

    frames.push({
      array: [...array],
      labels: {
        title: "Merged Result",
        detail: `Completed merge [${left}..${right}]: ${array
          .slice(left, right + 1)
          .join(", ")}`,
      },
      treeFrame: {
        type: "merge",
        depth: depth + 1,
        l: left,
        r: right,
        arraySlice: array.slice(left, right + 1),
      },
    });
  }

  if (array.length > 0) {
    mergeSortRecursive(0, array.length - 1, 0);
  }

  frames.push({
    array: [...array],
    labels: { title: "Sorted!", detail: "Merge Sort Complete" },
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
