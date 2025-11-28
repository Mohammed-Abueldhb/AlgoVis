export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
}

export function generateExponentialSearchSteps(arr: number[], target: number): Frame[] {
  const frames: Frame[] = [];
  const array = [...arr].sort((a, b) => a - b);
  
  frames.push({
    array: [...array],
    labels: { title: 'Sorted Array', detail: `Searching for ${target}` }
  });

  const n = array.length;

  // Check first element
  frames.push({
    array: [...array],
    highlights: [{ indices: [0], type: 'compare' }],
    labels: { title: 'Check First', detail: `Checking first element: ${array[0]}` }
  });

  if (array[0] === target) {
    frames.push({
      array: [...array],
      highlights: [{ indices: [0], type: 'pivot' }],
      labels: { title: 'Found!', detail: `Target ${target} found at index 0` }
    });
    return frames;
  }

  // Find range exponentially
  let i = 1;
  while (i < n && array[i] <= target) {
    frames.push({
      array: [...array],
      highlights: [{ indices: [i], type: 'compare' }],
      labels: {
        title: 'Exponential Growth',
        detail: `Checking index ${i}: ${array[i]} ${array[i] <= target ? '<=' : '>'} ${target}`
      }
    });

    if (array[i] === target) {
      frames.push({
        array: [...array],
        highlights: [{ indices: [i], type: 'pivot' }],
        labels: { title: 'Found!', detail: `Target ${target} found at index ${i}` }
      });
      return frames;
    }

    i *= 2;
  }

  // Binary search in found range
  const left = Math.floor(i / 2);
  const right = Math.min(i, n - 1);

  frames.push({
    array: [...array],
    highlights: [
      { indices: Array.from({ length: right - left + 1 }, (_, idx) => left + idx), type: 'mark' }
    ],
    labels: {
      title: 'Range Found',
      detail: `Binary search in range [${left}..${right}]`
    }
  });

  // Perform binary search
  let low = left;
  let high = right;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    frames.push({
      array: [...array],
      highlights: [
        { indices: [low], type: 'mark' },
        { indices: [high], type: 'mark' },
        { indices: [mid], type: 'compare' }
      ],
      labels: {
        title: 'Binary Search',
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
      low = mid + 1;
    } else {
      frames.push({
        array: [...array],
        highlights: [{ indices: [mid], type: 'swap' }],
        labels: {
          title: 'Search Left',
          detail: `${array[mid]} > ${target}, search left half`
        }
      });
      high = mid - 1;
    }
  }

  frames.push({
    array: [...array],
    labels: { title: 'Not Found', detail: `Target ${target} not in array` }
  });

  return frames;
}
