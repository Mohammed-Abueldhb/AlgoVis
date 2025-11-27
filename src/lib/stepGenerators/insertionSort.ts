// TODO: Implement Insertion Sort step generator

export interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
}

export function generateInsertionSortSteps(arr: number[]): Frame[] {
  return [
    {
      array: [...arr],
      labels: { title: 'Insertion Sort', detail: 'Implementation coming soon' }
    }
  ];
}
