export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
  compareIndex?: number | null;
  successIndex?: number | null;
  target?: number;
}

export function generateLinearSearchSteps(arr: number[], target: number): Frame[] {
  const frames: Frame[] = [];
  
  // Preserve the original values array - DO NOT replace with indexes
  const values = [...arr].filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v));
  
  // Validate array has values
  if (values.length === 0) {
    frames.push({
      array: [],
      labels: { title: 'Error', detail: 'Empty array' },
      compareIndex: null,
      successIndex: null,
    });
    return frames;
  }

  // Initial frame with actual values (not indexes)
  frames.push({
    array: [...values], // Actual values like [45, 23, 67, 12, 89...]
    labels: { title: 'Linear Search', detail: `Searching for ${target} in array of ${values.length} elements` },
    compareIndex: null,
    successIndex: null,
    target: target, // Include target in frame
  });

  for (let i = 0; i < values.length; i++) {
    // Frame showing comparison at index i - array contains actual values
    frames.push({
      array: [...values], // Actual values, NOT indexes
      highlights: [{ indices: [i], type: 'compare' }],
      labels: {
        title: 'Checking',
        detail: `Index ${i}: ${values[i]} ${values[i] === target ? '==' : '!='} ${target}`
      },
      compareIndex: i, // Index of the bar to highlight red
      successIndex: null,
      target: target, // Include target in frame
    });

    // Compare actual value at i with target
    if (values[i] === target) {
      // Found! Show success frame
      frames.push({
        array: [...values], // Actual values, NOT indexes
        highlights: [{ indices: [i], type: 'pivot' }],
        labels: { title: 'Found!', detail: `Target ${target} found at index ${i}` },
        compareIndex: null,
        successIndex: i, // Index of the bar to highlight green
        target: target, // Include target in frame
      });
      return frames;
    }
  }

  // Target not found after checking all elements
  frames.push({
    array: [...values], // Actual values, NOT indexes
    labels: { title: 'Not Found', detail: `Target ${target} not in array` },
    compareIndex: null,
    successIndex: null,
    target: target, // Include target in frame
  });

  return frames;
}
