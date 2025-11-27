export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
}

export function generateBinarySearchSteps(arr: number[], target: number): Frame[] {
  const frames: Frame[] = [];
  const array = [...arr].sort((a, b) => a - b); // Binary search requires sorted array
  
  frames.push({
    array: [...array],
    labels: { title: 'Sorted Array', detail: `Searching for ${target}` }
  });

  let left = 0;
  let right = array.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    frames.push({
      array: [...array],
      highlights: [
        { indices: [left], type: 'mark' },
        { indices: [right], type: 'mark' },
        { indices: [mid], type: 'compare' }
      ],
      labels: {
        title: 'Check Middle',
        detail: `Middle index: ${mid}, Value: ${array[mid]}, Target: ${target}`
      }
    });

    if (array[mid] === target) {
      frames.push({
        array: [...array],
        highlights: [{ indices: [mid], type: 'pivot' }],
        labels: { title: 'Found!', detail: `Target ${target} found at index ${mid}` }
      });
      return frames;
    }

    if (array[mid] < target) {
      frames.push({
        array: [...array],
        highlights: [{ indices: [mid], type: 'swap' }],
        labels: {
          title: 'Search Right',
          detail: `${array[mid]} < ${target}, search right half`
        }
      });
      left = mid + 1;
    } else {
      frames.push({
        array: [...array],
        highlights: [{ indices: [mid], type: 'swap' }],
        labels: {
          title: 'Search Left',
          detail: `${array[mid]} > ${target}, search left half`
        }
      });
      right = mid - 1;
    }
  }

  frames.push({
    array: [...array],
    labels: { title: 'Not Found', detail: `Target ${target} not in array` }
  });

  return frames;
}
