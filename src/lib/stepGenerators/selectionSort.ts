// TODO: Implement Selection Sort step generator

export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
}

export function generateSelectionSortSteps(arr: number[]): Frame[] {
  return [
    {
      array: [...arr],
      labels: { title: 'Selection Sort', detail: 'Implementation coming soon' }
    }
  ];
}
