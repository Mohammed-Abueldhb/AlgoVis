export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
  compareIndex?: number | null;
  successIndex?: number | null;
  target?: number;
}

export function generateInterpolationSearchSteps(arr: number[], target: number): Frame[] {
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
    labels: { title: 'Sorted Array', detail: `Searching for ${target} in array of ${sortedValues.length} elements` },
    compareIndex: null,
    successIndex: null,
  });

  let low = 0;
  let high = sortedValues.length - 1;

  while (low <= high && target >= sortedValues[low] && target <= sortedValues[high]) {
    if (low === high) {
      // Only one element left to check
      frames.push({
        array: [...sortedValues], // Actual values, NOT indexes
        highlights: [{ indices: [low], type: 'compare' }],
        labels: { title: 'Check Position', detail: `Checking index ${low}, Value: ${sortedValues[low]}` },
        compareIndex: low,
        successIndex: null,
        target: target, // Include target in frame
      });

      // Compare actual value with target
      if (sortedValues[low] === target) {
        frames.push({
          array: [...sortedValues], // Actual values, NOT indexes
          highlights: [{ indices: [low], type: 'pivot' }],
          labels: { title: 'Found!', detail: `Target ${target} found at index ${low}` },
          compareIndex: null,
          successIndex: low,
          target: target, // Include target in frame
        });
        return frames;
      }
      break;
    }

    // Calculate probe position using interpolation formula
    // Use actual values in the calculation
    const probe = low + Math.floor(
      ((target - sortedValues[low]) * (high - low)) / (sortedValues[high] - sortedValues[low])
    );

    // Ensure probe is within bounds
    const clampedPos = Math.max(low, Math.min(high, probe));

    frames.push({
      array: [...sortedValues], // Actual values, NOT indexes
      highlights: [
        { indices: [low], type: 'mark' },
        { indices: [high], type: 'mark' },
        { indices: [clampedPos], type: 'compare' }
      ],
      labels: {
        title: 'Interpolate Position',
        detail: `Calculated position: ${clampedPos}, Value: ${sortedValues[clampedPos]}, Target: ${target}`
      },
      compareIndex: clampedPos, // Index of the bar to highlight red
      successIndex: null,
      target: target, // Include target in frame
    });

    // Compare actual value at probe position with target
    if (sortedValues[clampedPos] === target) {
      // Found! Show success frame
      frames.push({
        array: [...sortedValues], // Actual values, NOT indexes
        highlights: [{ indices: [clampedPos], type: 'pivot' }],
        labels: { title: 'Found!', detail: `Target ${target} found at index ${clampedPos}` },
        compareIndex: null,
        successIndex: clampedPos, // Index of the bar to highlight green
        target: target, // Include target in frame
      });
      return frames;
    }

    // Not found at probe position, adjust search range
    if (sortedValues[clampedPos] < target) {
      low = clampedPos + 1;
    } else {
      high = clampedPos - 1;
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
