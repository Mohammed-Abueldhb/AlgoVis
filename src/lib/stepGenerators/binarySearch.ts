export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
  compareIndex?: number | null;
  successIndex?: number | null;
  target?: number;
}

export function generateBinarySearchSteps(arr: number[], target: number): Frame[] {
  const frames: Frame[] = [];
  
  // Preserve the original values array - DO NOT replace with indexes
  // Filter to ensure only valid numbers, then sort
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
    labels: { title: 'Sorted Array', detail: `Searching for ${target} in array of ${sortedValues.length} elements` },
    compareIndex: null,
    successIndex: null,
    target: target, // Include target in frame
  });

  let low = 0;
  let high = sortedValues.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    // Frame showing comparison at mid - array contains actual values
    frames.push({
      array: [...sortedValues], // Actual values, NOT indexes
      highlights: [
        { indices: [low], type: 'mark' },
        { indices: [high], type: 'mark' },
        { indices: [mid], type: 'compare' }
      ],
      labels: {
        title: 'Check Middle',
        detail: `Middle index: ${mid}, Value: ${sortedValues[mid]}, Target: ${target}`
      },
      compareIndex: mid, // Index of the bar to highlight
      successIndex: null,
      target: target, // Include target in frame
    });

    // Compare actual value at mid with target
    if (sortedValues[mid] === target) {
      // Found! Show success frame
      frames.push({
        array: [...sortedValues], // Actual values, NOT indexes
        highlights: [{ indices: [mid], type: 'pivot' }],
        labels: { title: 'Found!', detail: `Target ${target} found at index ${mid}` },
        compareIndex: null,
        successIndex: mid, // Index of the bar to highlight green
        target: target, // Include target in frame
      });
      return frames;
    }

    // Not found at mid, continue searching
    if (sortedValues[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // Target not found
  frames.push({
    array: [...sortedValues], // Actual values, NOT indexes
    labels: { title: 'Not Found', detail: `Target ${target} not in array` },
    compareIndex: null,
    successIndex: null,
    target: target, // Include target in frame
  });

  return frames;
}
