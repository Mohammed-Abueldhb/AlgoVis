export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
  compareIndex?: number | null;
  successIndex?: number | null;
  target?: number;
}

export function generateExponentialSearchSteps(arr: number[], target: number): Frame[] {
  const frames: Frame[] = [];
  
  // Preserve the original values array - DO NOT replace with indexes
  const values = [...arr].filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v));
  const sortedValues = [...values].sort((a, b) => a - b);
  
  // Validate array has values
  if (sortedValues.length === 0) {
    frames.push({
      array: [],
      labels: { title: 'Error', detail: 'Empty array' },
      compareIndex: null,
      successIndex: null,
    });
    return frames;
  }
  
  // Initial frame with sorted values (actual numeric values, not indexes)
  frames.push({
    array: [...sortedValues], // Actual values like [15, 23, 45, 67, 89...]
    labels: { title: 'Sorted Array', detail: `Searching for ${target}` },
    compareIndex: null,
    successIndex: null,
    target: target, // Include target in frame
  });

  const n = sortedValues.length;

  // Check first element
  frames.push({
    array: [...sortedValues], // Actual values, NOT indexes
    highlights: [{ indices: [0], type: 'compare' }],
    labels: { title: 'Check First', detail: `Checking first element: ${sortedValues[0]}` },
    compareIndex: 0,
    successIndex: null,
    target: target, // Include target in frame
  });

  // Compare actual value with target
  if (sortedValues[0] === target) {
    frames.push({
      array: [...sortedValues], // Actual values, NOT indexes
      highlights: [{ indices: [0], type: 'pivot' }],
    labels: { title: 'Found!', detail: `Target ${target} found at index 0` },
    compareIndex: null,
    successIndex: 0,
    target: target, // Include target in frame
    });
    return frames;
  }

  // Find range exponentially
  let i = 1;
  while (i < n && sortedValues[i] <= target) {
    frames.push({
      array: [...sortedValues], // Actual values, NOT indexes
      highlights: [{ indices: [i], type: 'compare' }],
      labels: {
        title: 'Exponential Growth',
        detail: `Checking index ${i}: ${sortedValues[i]} ${sortedValues[i] <= target ? '<=' : '>'} ${target}`
      },
      compareIndex: i,
      successIndex: null,
      target: target, // Include target in frame
    });

    // Compare actual value with target
    if (sortedValues[i] === target) {
      frames.push({
        array: [...sortedValues], // Actual values, NOT indexes
        highlights: [{ indices: [i], type: 'pivot' }],
    labels: { title: 'Found!', detail: `Target ${target} found at index ${i}` },
    compareIndex: null,
    successIndex: i,
    target: target, // Include target in frame
    });
    return frames;
    }

    i *= 2;
  }

  // Binary search in found range
  const left = Math.floor(i / 2);
  const right = Math.min(i, n - 1);

  frames.push({
    array: [...sortedValues], // Actual values, NOT indexes
    highlights: [
      { indices: Array.from({ length: right - left + 1 }, (_, idx) => left + idx), type: 'mark' }
    ],
    labels: {
      title: 'Range Found',
      detail: `Binary search in range [${left}..${right}]`
    },
    compareIndex: null,
    successIndex: null,
    target: target, // Include target in frame
  });

  // Perform binary search
  let low = left;
  let high = right;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    frames.push({
      array: [...sortedValues], // Actual values, NOT indexes
      highlights: [
        { indices: [low], type: 'mark' },
        { indices: [high], type: 'mark' },
        { indices: [mid], type: 'compare' }
      ],
      labels: {
        title: 'Binary Search',
        detail: `Middle index: ${mid}, Value: ${sortedValues[mid]}, Target: ${target}`
      },
      compareIndex: mid,
      successIndex: null,
      target: target, // Include target in frame
    });

    // Compare actual value with target
    if (sortedValues[mid] === target) {
      frames.push({
        array: [...sortedValues], // Actual values, NOT indexes
        highlights: [{ indices: [mid], type: 'pivot' }],
    labels: { title: 'Found!', detail: `Target ${target} found at index ${mid}` },
    compareIndex: null,
    successIndex: mid,
    target: target, // Include target in frame
    });
    return frames;
    }

    if (sortedValues[mid] < target) {
      frames.push({
        array: [...sortedValues], // Actual values, NOT indexes
        highlights: [{ indices: [mid], type: 'swap' }],
        labels: {
          title: 'Search Right',
          detail: `${sortedValues[mid]} < ${target}, search right half`
        },
        compareIndex: null,
        successIndex: null,
        target: target, // Include target in frame
      });
      low = mid + 1;
    } else {
      frames.push({
        array: [...sortedValues], // Actual values, NOT indexes
        highlights: [{ indices: [mid], type: 'swap' }],
        labels: {
          title: 'Search Left',
          detail: `${sortedValues[mid]} > ${target}, search left half`
        },
        compareIndex: null,
        successIndex: null,
        target: target, // Include target in frame
      });
      high = mid - 1;
    }
  }

  frames.push({
    array: [...sortedValues], // Actual values, NOT indexes
    labels: { title: 'Not Found', detail: `Target ${target} not in array` },
    compareIndex: null,
    successIndex: null,
    target: target, // Include target in frame
  });

  return frames;
}
