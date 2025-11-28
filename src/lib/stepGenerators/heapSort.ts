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

  function heapify(n: number, i: number) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    const highlights: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[] = [
      { indices: [i], type: 'pivot' }
    ];
    if (left < n) highlights.push({ indices: [left], type: 'compare' });
    if (right < n) highlights.push({ indices: [right], type: 'compare' });

    frames.push({
      array: [...array],
      highlights,
      labels: { title: 'Heapify', detail: `Checking node ${i} with children` }
    });

    if (left < n && array[left] > array[largest]) {
      largest = left;
    }

    if (right < n && array[right] > array[largest]) {
      largest = right;
    }

    if (largest !== i) {
      frames.push({
        array: [...array],
        highlights: [{ indices: [i, largest], type: 'swap' }],
        labels: { title: 'Swap', detail: `Swapping ${array[i]} with ${array[largest]}` }
      });

      [array[i], array[largest]] = [array[largest], array[i]];

      frames.push({
        array: [...array],
        highlights: [{ indices: [i, largest], type: 'mark' }],
        labels: { title: 'After Swap', detail: 'Continue heapifying' }
      });

      heapify(n, largest);
    }
  }

  // Build max heap
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
    frames.push({
      array: [...array],
      highlights: [{ indices: [0, i], type: 'swap' }],
      labels: { title: 'Extract Max', detail: `Moving ${array[0]} to position ${i}` }
    });

    [array[0], array[i]] = [array[i], array[0]];

    frames.push({
      array: [...array],
      highlights: [{ indices: [i], type: 'mark' }],
      labels: { title: 'Sorted Position', detail: `${array[i]} in final position` }
    });

    heapify(i, 0);
  }

  frames.push({
    array: [...array],
    labels: { title: 'Sorted!', detail: 'Heap Sort Complete' }
  });

  return frames;
}
