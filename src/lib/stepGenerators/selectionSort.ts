export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
}

export function generateSelectionSortSteps(arr: number[]): Frame[] {
  const frames: Frame[] = [];
  const array = [...arr];
  
  frames.push({
    array: [...array],
    labels: { title: 'Initial Array', detail: 'Starting Selection Sort' }
  });

  for (let i = 0; i < array.length - 1; i++) {
    let minIdx = i;

    frames.push({
      array: [...array],
      highlights: [{ indices: [i], type: 'pivot' }],
      labels: { title: 'Find Minimum', detail: `Searching for minimum in unsorted portion` }
    });

    for (let j = i + 1; j < array.length; j++) {
      frames.push({
        array: [...array],
        highlights: [
          { indices: [minIdx], type: 'mark' },
          { indices: [j], type: 'compare' }
        ],
        labels: { 
          title: 'Compare', 
          detail: `Current min: ${array[minIdx]}, Checking: ${array[j]}` 
        }
      });

      if (array[j] < array[minIdx]) {
        minIdx = j;
        frames.push({
          array: [...array],
          highlights: [{ indices: [minIdx], type: 'mark' }],
          labels: { title: 'New Minimum', detail: `Found smaller value: ${array[minIdx]}` }
        });
      }
    }

    if (minIdx !== i) {
      frames.push({
        array: [...array],
        highlights: [
          { indices: [i, minIdx], type: 'swap' }
        ],
        labels: { title: 'Swap', detail: `Swapping ${array[i]} with ${array[minIdx]}` }
      });

      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      
      frames.push({
        array: [...array],
        highlights: [{ indices: [i], type: 'pivot' }],
        labels: { title: 'After Swap', detail: `${array[i]} in sorted position` }
      });
    }
  }

  frames.push({
    array: [...array],
    labels: { title: 'Sorted!', detail: 'Selection Sort Complete' }
  });

  return frames;
}
