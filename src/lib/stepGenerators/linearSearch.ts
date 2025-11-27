export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
}

export function generateLinearSearchSteps(arr: number[], target: number): Frame[] {
  const frames: Frame[] = [];
  const array = [...arr];
  
  frames.push({
    array: [...array],
    labels: { title: 'Linear Search', detail: `Searching for ${target}` }
  });

  for (let i = 0; i < array.length; i++) {
    frames.push({
      array: [...array],
      highlights: [{ indices: [i], type: 'compare' }],
      labels: {
        title: 'Checking',
        detail: `Index ${i}: ${array[i]} ${array[i] === target ? '==' : '!='} ${target}`
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

    frames.push({
      array: [...array],
      highlights: [{ indices: [i], type: 'swap' }],
      labels: { title: 'Not Match', detail: `Continue searching...` }
    });
  }

  frames.push({
    array: [...array],
    labels: { title: 'Not Found', detail: `Target ${target} not in array` }
  });

  return frames;
}
