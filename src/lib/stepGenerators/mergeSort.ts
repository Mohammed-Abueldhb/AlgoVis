export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
}

export function generateMergeSortSteps(arr: number[]): Frame[] {
  const frames: Frame[] = [];
  const array = [...arr];
  
  frames.push({
    array: [...array],
    labels: { title: 'Initial Array', detail: 'Starting Merge Sort' }
  });

  function merge(left: number, mid: number, right: number) {
    const leftArr = array.slice(left, mid + 1);
    const rightArr = array.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    frames.push({
      array: [...array],
      highlights: [
        { indices: Array.from({ length: mid - left + 1 }, (_, idx) => left + idx), type: 'mark' },
        { indices: Array.from({ length: right - mid }, (_, idx) => mid + 1 + idx), type: 'pivot' }
      ],
      labels: { title: 'Merging', detail: `Merge subarrays [${left}..${mid}] and [${mid + 1}..${right}]` }
    });

    while (i < leftArr.length && j < rightArr.length) {
      frames.push({
        array: [...array],
        highlights: [
          { indices: [k], type: 'compare' }
        ],
        labels: { title: 'Compare', detail: `Comparing ${leftArr[i]} and ${rightArr[j]}` }
      });

      if (leftArr[i] <= rightArr[j]) {
        array[k] = leftArr[i];
        i++;
      } else {
        array[k] = rightArr[j];
        j++;
      }

      frames.push({
        array: [...array],
        highlights: [{ indices: [k], type: 'swap' }],
        labels: { title: 'Place Element', detail: `Placed ${array[k]} at position ${k}` }
      });
      
      k++;
    }

    while (i < leftArr.length) {
      array[k] = leftArr[i];
      frames.push({
        array: [...array],
        highlights: [{ indices: [k], type: 'swap' }],
        labels: { title: 'Copy Remaining', detail: `Copying ${array[k]} from left` }
      });
      i++;
      k++;
    }

    while (j < rightArr.length) {
      array[k] = rightArr[j];
      frames.push({
        array: [...array],
        highlights: [{ indices: [k], type: 'swap' }],
        labels: { title: 'Copy Remaining', detail: `Copying ${array[k]} from right` }
      });
      j++;
      k++;
    }

    frames.push({
      array: [...array],
      highlights: [
        { indices: Array.from({ length: right - left + 1 }, (_, idx) => left + idx), type: 'mark' }
      ],
      labels: { title: 'Merged', detail: `Subarray [${left}..${right}] merged` }
    });
  }

  function mergeSort(left: number, right: number) {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);

      frames.push({
        array: [...array],
        highlights: [
          { indices: Array.from({ length: right - left + 1 }, (_, idx) => left + idx), type: 'pivot' }
        ],
        labels: { title: 'Divide', detail: `Split at index ${mid}` }
      });

      mergeSort(left, mid);
      mergeSort(mid + 1, right);
      merge(left, mid, right);
    }
  }

  mergeSort(0, array.length - 1);

  frames.push({
    array: [...array],
    labels: { title: 'Sorted!', detail: 'Merge Sort Complete' }
  });

  return frames;
}
