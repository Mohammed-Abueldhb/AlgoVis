export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
  treeFrame?: {
    type: 'split' | 'merge' | 'final';
    depth: number;
    l: number;
    r: number;
    arraySlice: number[];
    parentRange?: { l: number; r: number };
  };
}

export function generateMergeSortSteps(arr: number[]): Frame[] {
  const frames: Frame[] = [];
  const array = [...arr];
  
  // Initial state
  frames.push({
    array: [...array],
    labels: { title: 'Initial Array', detail: 'Starting Merge Sort - Building Recursion Tree' },
    treeFrame: {
      type: 'split',
      depth: 0,
      l: 0,
      r: array.length - 1,
      arraySlice: [...array]
    }
  });

  function mergeSortRecursive(left: number, right: number, depth: number = 0) {
    if (left >= right) {
      // Base case: single element (leaf node)
      frames.push({
        array: [...array],
        labels: { 
          title: 'Base Case', 
          detail: `Single element [${array[left]}] at depth ${depth}` 
        },
        treeFrame: {
          type: 'split',
          depth,
          l: left,
          r: right,
          arraySlice: [array[left]]
        }
      });
      return;
    }

    const mid = Math.floor((left + right) / 2);

    // Show the split
    frames.push({
      array: [...array],
      labels: { 
        title: 'Divide', 
        detail: `Splitting [${left}..${right}] at mid=${mid} (depth ${depth})` 
      },
      treeFrame: {
        type: 'split',
        depth,
        l: left,
        r: right,
        arraySlice: array.slice(left, right + 1)
      }
    });

    // Recursively sort left half
    mergeSortRecursive(left, mid, depth + 1);

    // Recursively sort right half
    mergeSortRecursive(mid + 1, right, depth + 1);

    // Merge the two halves
    merge(left, mid, right, depth);
  }

  function merge(left: number, mid: number, right: number, depth: number) {
    const leftArr = array.slice(left, mid + 1);
    const rightArr = array.slice(mid + 1, right + 1);
    
    frames.push({
      array: [...array],
      labels: { 
        title: 'Merging', 
        detail: `Merge [${left}..${mid}] and [${mid + 1}..${right}] at depth ${depth}` 
      },
      treeFrame: {
        type: 'merge',
        depth,
        l: left,
        r: right,
        arraySlice: array.slice(left, right + 1)
      }
    });

    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
      if (leftArr[i] <= rightArr[j]) {
        array[k] = leftArr[i];
        i++;
      } else {
        array[k] = rightArr[j];
        j++;
      }
      k++;
    }

    while (i < leftArr.length) {
      array[k] = leftArr[i];
      i++;
      k++;
    }

    while (j < rightArr.length) {
      array[k] = rightArr[j];
      j++;
      k++;
    }

    // Show merged result
    frames.push({
      array: [...array],
      labels: { 
        title: 'Merged Result', 
        detail: `Completed merge [${left}..${right}]: ${array.slice(left, right + 1).join(', ')}` 
      },
      treeFrame: {
        type: 'merge',
        depth,
        l: left,
        r: right,
        arraySlice: array.slice(left, right + 1)
      }
    });
  }

  mergeSortRecursive(0, array.length - 1, 0);

  frames.push({
    array: [...array],
    labels: { title: 'Sorted!', detail: 'Merge Sort Complete' },
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
