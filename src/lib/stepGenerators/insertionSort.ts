export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
}

export function generateInsertionSortSteps(arr: number[]): Frame[] {
  const frames: Frame[] = [];
  const array = [...arr];
  
  frames.push({
    array: [...array],
    labels: { title: 'Initial Array', detail: 'Starting Insertion Sort' }
  });

  for (let i = 1; i < array.length; i++) {
    const key = array[i];
    let j = i - 1;

    frames.push({
      array: [...array],
      highlights: [{ indices: [i], type: 'pivot' }],
      labels: { title: 'Select Element', detail: `Inserting ${key} into sorted portion` }
    });

    while (j >= 0 && array[j] > key) {
      frames.push({
        array: [...array],
        highlights: [
          { indices: [j], type: 'compare' },
          { indices: [i], type: 'pivot' }
        ],
        labels: { title: 'Compare', detail: `${array[j]} > ${key}, shift right` }
      });

      array[j + 1] = array[j];
      
      frames.push({
        array: [...array],
        highlights: [{ indices: [j + 1], type: 'swap' }],
        labels: { title: 'Shift', detail: 'Moving element right' }
      });
      
      j--;
    }

    array[j + 1] = key;
    
    frames.push({
      array: [...array],
      highlights: [{ indices: [j + 1], type: 'mark' }],
      labels: { title: 'Insert', detail: `Placed ${key} at position ${j + 1}` }
    });
  }

  frames.push({
    array: [...array],
    labels: { title: 'Sorted!', detail: 'Insertion Sort Complete' }
  });

  return frames;
}
