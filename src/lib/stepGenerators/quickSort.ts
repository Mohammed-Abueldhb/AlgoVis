export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
}

export function generateQuickSortSteps(arr: number[]): Frame[] {
  const frames: Frame[] = [];
  const array = [...arr];
  
  frames.push({
    array: [...array],
    labels: { title: 'Initial Array', detail: 'Starting Quick Sort' }
  });

  function partition(low: number, high: number): number {
    const pivot = array[high];
    frames.push({
      array: [...array],
      highlights: [{ indices: [high], type: 'pivot' }],
      labels: { title: 'Select Pivot', detail: `Pivot: ${pivot} at index ${high}` }
    });

    let i = low - 1;

    for (let j = low; j < high; j++) {
      frames.push({
        array: [...array],
        highlights: [
          { indices: [high], type: 'pivot' },
          { indices: [j], type: 'compare' }
        ],
        labels: { title: 'Compare', detail: `Comparing ${array[j]} with pivot ${pivot}` }
      });

      if (array[j] < pivot) {
        i++;
        frames.push({
          array: [...array],
          highlights: [
            { indices: [high], type: 'pivot' },
            { indices: [i, j], type: 'swap' }
          ],
          labels: { title: 'Swap', detail: `Swapping ${array[i]} and ${array[j]}` }
        });
        
        [array[i], array[j]] = [array[j], array[i]];
        
        frames.push({
          array: [...array],
          highlights: [
            { indices: [high], type: 'pivot' },
            { indices: [i, j], type: 'mark' }
          ],
          labels: { title: 'After Swap' }
        });
      }
    }

    frames.push({
      array: [...array],
      highlights: [
        { indices: [high], type: 'pivot' },
        { indices: [i + 1], type: 'swap' }
      ],
      labels: { title: 'Place Pivot', detail: `Moving pivot to position ${i + 1}` }
    });

    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    
    frames.push({
      array: [...array],
      highlights: [{ indices: [i + 1], type: 'mark' }],
      labels: { title: 'Pivot in Place' }
    });

    return i + 1;
  }

  function quickSort(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    }
  }

  quickSort(0, array.length - 1);

  frames.push({
    array: [...array],
    labels: { title: 'Sorted!', detail: 'Quick Sort Complete' }
  });

  return frames;
}
