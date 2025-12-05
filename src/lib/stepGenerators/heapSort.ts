export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
}

export function generateHeapSortSteps(arr: number[]): Frame[] {
  const frames: Frame[] = [];
  const array = [...arr];
  const n = array.length;
  
  frames.push({
    array: [...array],
    labels: { title: 'Initial Array', detail: 'Starting Heap Sort' }
  });

  // Helper function to swap elements
  const swap = (i: number, j: number) => {
    [array[i], array[j]] = [array[j], array[i]];
  };

  // Heapify function following the exact pattern specified
  function heapify(n: number, i: number) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    // Show comparison frame
    const compareHighlights: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[] = [
      { indices: [i], type: 'pivot' }
    ];
    if (left < n) compareHighlights.push({ indices: [left], type: 'compare' });
    if (right < n) compareHighlights.push({ indices: [right], type: 'compare' });

    frames.push({
      array: [...array],
      highlights: compareHighlights,
      labels: { title: 'Heapify', detail: `Comparing node ${i} with children` }
    });

    // Find largest among root, left child, and right child
    if (left < n && array[left] > array[largest]) {
      largest = left;
    }

    if (right < n && array[right] > array[largest]) {
      largest = right;
    }

    // If largest is not root, swap and continue heapifying
    if (largest !== i) {
      // Show swap frame before swap
      frames.push({
        array: [...array],
        highlights: [{ indices: [i, largest], type: 'swap' }],
        labels: { title: 'Swap', detail: `Swapping ${array[i]} with ${array[largest]}` }
      });

      swap(i, largest);

      // Show array after swap
      frames.push({
        array: [...array],
        highlights: [{ indices: [largest], type: 'mark' }],
        labels: { title: 'After Swap', detail: 'Continue heapifying subtree' }
      });

      // Recursively heapify the affected sub-tree
      heapify(n, largest);
    }
  }

  // Build max heap - start from the last non-leaf node
  frames.push({
    array: [...array],
    labels: { title: 'Build Heap', detail: 'Building max heap from array' }
  });

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }

  frames.push({
    array: [...array],
    labels: { title: 'Max Heap Built', detail: 'Heap property established' }
  });

  // Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    // Show swap frame before moving root to end
    frames.push({
      array: [...array],
      highlights: [{ indices: [0, i], type: 'swap' }],
      labels: { title: 'Extract Max', detail: `Moving root ${array[0]} to position ${i}` }
    });

    // Move current root to end
    swap(0, i);

    // Show array after swap
    frames.push({
      array: [...array],
      highlights: [{ indices: [i], type: 'mark' }],
      labels: { title: 'Sorted Position', detail: `${array[i]} in final sorted position` }
    });

    // Call heapify on the reduced heap
    heapify(i, 0);
  }

  frames.push({
    array: [...array],
    labels: { title: 'Sorted!', detail: 'Heap Sort Complete - Array is sorted in ascending order' }
  });

  return frames;
}
