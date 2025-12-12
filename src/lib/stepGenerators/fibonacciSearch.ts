export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
  compareIndex?: number | null;
  successIndex?: number | null;
  target?: number;
}

export function generateFibonacciSearchSteps(arr: number[], target: number): Frame[] {
  const frames: Frame[] = [];
  
  // Preserve the original values array - DO NOT replace with indexes
  const values = [...arr].filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v));
  const sortedValues = [...values].sort((a, b) => a - b);
  const n = sortedValues.length;
  
  // Validate array has values
  if (n === 0) {
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
    labels: { title: 'Sorted Array', detail: `Searching for ${target} using Fibonacci` },
    compareIndex: null,
    successIndex: null,
    target: target, // Include target in frame
  });

  // Generate Fibonacci numbers
  let fibM2 = 0; // (m-2)'th Fibonacci
  let fibM1 = 1; // (m-1)'th Fibonacci
  let fibM = fibM2 + fibM1; // m'th Fibonacci

  while (fibM < n) {
    fibM2 = fibM1;
    fibM1 = fibM;
    fibM = fibM2 + fibM1;
  }

  frames.push({
    array: [...sortedValues], // Actual values, NOT indexes
    labels: {
      title: 'Fibonacci Numbers',
      detail: `Using Fibonacci: ${fibM2}, ${fibM1}, ${fibM}`
    },
    compareIndex: null,
    successIndex: null,
    target: target, // Include target in frame
  });

  let offset = -1;

  while (fibM > 1) {
    const i = Math.min(offset + fibM2, n - 1);

    frames.push({
      array: [...sortedValues], // Actual values, NOT indexes
      highlights: [{ indices: [i], type: 'compare' }],
      labels: {
        title: 'Check Position',
        detail: `Checking index ${i}: ${sortedValues[i]} vs ${target}`
      },
      compareIndex: i, // Index of the bar to highlight red
      successIndex: null,
      target: target, // Include target in frame
    });

    // Compare actual value at i with target
    if (sortedValues[i] < target) {
      frames.push({
        array: [...sortedValues], // Actual values, NOT indexes
        highlights: [{ indices: [i], type: 'swap' }],
        labels: {
          title: 'Move Right',
          detail: `${sortedValues[i]} < ${target}, eliminate left portion`
        },
        compareIndex: null,
        successIndex: null,
        target: target, // Include target in frame
      });

      fibM = fibM1;
      fibM1 = fibM2;
      fibM2 = fibM - fibM1;
      offset = i;
    } else if (sortedValues[i] > target) {
      frames.push({
        array: [...sortedValues], // Actual values, NOT indexes
        highlights: [{ indices: [i], type: 'swap' }],
        labels: {
          title: 'Move Left',
          detail: `${sortedValues[i]} > ${target}, eliminate right portion`
        },
        compareIndex: null,
        successIndex: null,
        target: target, // Include target in frame
      });

      fibM = fibM2;
      fibM1 = fibM1 - fibM2;
      fibM2 = fibM - fibM1;
    } else {
      // Found! Show success frame
      frames.push({
        array: [...sortedValues], // Actual values, NOT indexes
        highlights: [{ indices: [i], type: 'pivot' }],
        labels: { title: 'Found!', detail: `Target ${target} found at index ${i}` },
        compareIndex: null,
        successIndex: i, // Index of the bar to highlight green
        target: target, // Include target in frame
      });
      return frames;
    }
  }

  // Check last element
  if (fibM1 && offset + 1 < n) {
    const lastIdx = offset + 1;
    frames.push({
      array: [...sortedValues], // Actual values, NOT indexes
      highlights: [{ indices: [lastIdx], type: 'compare' }],
      labels: {
        title: 'Check Last',
        detail: `Checking remaining element at ${lastIdx}`
      },
      compareIndex: lastIdx,
      successIndex: null,
      target: target, // Include target in frame
    });

    // Compare actual value with target
    if (sortedValues[lastIdx] === target) {
      frames.push({
        array: [...sortedValues], // Actual values, NOT indexes
        highlights: [{ indices: [lastIdx], type: 'pivot' }],
        labels: { title: 'Found!', detail: `Target ${target} found at index ${lastIdx}` },
        compareIndex: null,
        successIndex: lastIdx,
      });
      return frames;
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
