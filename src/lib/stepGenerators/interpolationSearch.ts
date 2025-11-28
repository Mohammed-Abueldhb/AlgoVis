export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
}

export function generateInterpolationSearchSteps(arr: number[], target: number): Frame[] {
  const frames: Frame[] = [];
  const array = [...arr].sort((a, b) => a - b);
  
  frames.push({
    array: [...array],
    labels: { title: 'Sorted Array', detail: `Searching for ${target}` }
  });

  let low = 0;
  let high = array.length - 1;

  while (low <= high && target >= array[low] && target <= array[high]) {
    if (low === high) {
      frames.push({
        array: [...array],
        highlights: [{ indices: [low], type: 'compare' }],
        labels: { title: 'Check Position', detail: `Checking index ${low}` }
      });

      if (array[low] === target) {
        frames.push({
          array: [...array],
          highlights: [{ indices: [low], type: 'pivot' }],
          labels: { title: 'Found!', detail: `Target ${target} found at index ${low}` }
        });
        return frames;
      }
      break;
    }

    // Calculate probe position using interpolation formula
    const pos = low + Math.floor(
      ((target - array[low]) * (high - low)) / (array[high] - array[low])
    );

    frames.push({
      array: [...array],
      highlights: [
        { indices: [low], type: 'mark' },
        { indices: [high], type: 'mark' },
        { indices: [pos], type: 'compare' }
      ],
      labels: {
        title: 'Interpolate Position',
        detail: `Calculated position: ${pos}, Value: ${array[pos]}, Target: ${target}`
      }
    });

    if (array[pos] === target) {
      frames.push({
        array: [...array],
        highlights: [{ indices: [pos], type: 'pivot' }],
        labels: { title: 'Found!', detail: `Target ${target} found at index ${pos}` }
      });
      return frames;
    }

    if (array[pos] < target) {
      frames.push({
        array: [...array],
        highlights: [{ indices: [pos], type: 'swap' }],
        labels: {
          title: 'Search Right',
          detail: `${array[pos]} < ${target}, search right half`
        }
      });
      low = pos + 1;
    } else {
      frames.push({
        array: [...array],
        highlights: [{ indices: [pos], type: 'swap' }],
        labels: {
          title: 'Search Left',
          detail: `${array[pos]} > ${target}, search left half`
        }
      });
      high = pos - 1;
    }
  }

  frames.push({
    array: [...array],
    labels: { title: 'Not Found', detail: `Target ${target} not in array` }
  });

  return frames;
}
