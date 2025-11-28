export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
}

export function generateFibonacciSearchSteps(arr: number[], target: number): Frame[] {
  const frames: Frame[] = [];
  const array = [...arr].sort((a, b) => a - b);
  const n = array.length;
  
  frames.push({
    array: [...array],
    labels: { title: 'Sorted Array', detail: `Searching for ${target} using Fibonacci` }
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
    array: [...array],
    labels: {
      title: 'Fibonacci Numbers',
      detail: `Using Fibonacci: ${fibM2}, ${fibM1}, ${fibM}`
    }
  });

  let offset = -1;

  while (fibM > 1) {
    const i = Math.min(offset + fibM2, n - 1);

    frames.push({
      array: [...array],
      highlights: [{ indices: [i], type: 'compare' }],
      labels: {
        title: 'Check Position',
        detail: `Checking index ${i}: ${array[i]} vs ${target}`
      }
    });

    if (array[i] < target) {
      frames.push({
        array: [...array],
        highlights: [{ indices: [i], type: 'swap' }],
        labels: {
          title: 'Move Right',
          detail: `${array[i]} < ${target}, eliminate left portion`
        }
      });

      fibM = fibM1;
      fibM1 = fibM2;
      fibM2 = fibM - fibM1;
      offset = i;
    } else if (array[i] > target) {
      frames.push({
        array: [...array],
        highlights: [{ indices: [i], type: 'swap' }],
        labels: {
          title: 'Move Left',
          detail: `${array[i]} > ${target}, eliminate right portion`
        }
      });

      fibM = fibM2;
      fibM1 = fibM1 - fibM2;
      fibM2 = fibM - fibM1;
    } else {
      frames.push({
        array: [...array],
        highlights: [{ indices: [i], type: 'pivot' }],
        labels: { title: 'Found!', detail: `Target ${target} found at index ${i}` }
      });
      return frames;
    }
  }

  // Check last element
  if (fibM1 && offset + 1 < n) {
    const lastIdx = offset + 1;
    frames.push({
      array: [...array],
      highlights: [{ indices: [lastIdx], type: 'compare' }],
      labels: {
        title: 'Check Last',
        detail: `Checking remaining element at ${lastIdx}`
      }
    });

    if (array[lastIdx] === target) {
      frames.push({
        array: [...array],
        highlights: [{ indices: [lastIdx], type: 'pivot' }],
        labels: { title: 'Found!', detail: `Target ${target} found at index ${lastIdx}` }
      });
      return frames;
    }
  }

  frames.push({
    array: [...array],
    labels: { title: 'Not Found', detail: `Target ${target} not in array` }
  });

  return frames;
}
