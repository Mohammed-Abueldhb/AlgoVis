import { Edge, Graph } from '../graphGenerator';

export interface GraphFrame {
  type: 'init' | 'edgeConsider' | 'edgeSelect' | 'edgeSkip' | 'complete';
  edges: Edge[];
  selectedEdges: Edge[];
  currentEdge?: Edge;
  visited: number[];
  labels?: { title?: string; detail?: string };
}

export function generatePrimSteps(graph: Graph): GraphFrame[] {
  const { numVertices, edges } = graph;
  const frames: GraphFrame[] = [];
  
  const adj: Map<number, Edge[]> = new Map();
  for (let i = 0; i < numVertices; i++) adj.set(i, []);
  for (const edge of edges) {
    adj.get(edge.u)!.push(edge);
    adj.get(edge.v)!.push({ u: edge.v, v: edge.u, weight: edge.weight });
  }
  
  const visited = new Set<number>([0]);
  const selectedEdges: Edge[] = [];
  let pq: [number, number, number][] = [];
  
  for (const edge of adj.get(0)!) pq.push([edge.weight, 0, edge.v]);
  pq.sort((a, b) => a[0] - b[0]);
  
  frames.push({ type: 'init', edges: [...edges], selectedEdges: [], visited: [0], labels: { title: 'Initialize', detail: 'Starting from vertex 0' } });
  
  while (pq.length > 0 && selectedEdges.length < numVertices - 1) {
    const [weight, from, to] = pq.shift()!;
    const currentEdge: Edge = { u: from, v: to, weight };
    
    frames.push({ type: 'edgeConsider', edges: [...edges], selectedEdges: [...selectedEdges], currentEdge, visited: Array.from(visited), labels: { title: 'Consider', detail: `Edge (${from},${to}) w=${weight}` } });
    
    if (visited.has(to)) {
      frames.push({ type: 'edgeSkip', edges: [...edges], selectedEdges: [...selectedEdges], currentEdge, visited: Array.from(visited), labels: { title: 'Skip', detail: 'Already visited' } });
      continue;
    }
    
    visited.add(to);
    selectedEdges.push(currentEdge);
    frames.push({ type: 'edgeSelect', edges: [...edges], selectedEdges: [...selectedEdges], currentEdge, visited: Array.from(visited), labels: { title: 'Select', detail: `Added edge` } });
    
    for (const edge of adj.get(to)!) {
      if (!visited.has(edge.v)) pq.push([edge.weight, to, edge.v]);
    }
    pq.sort((a, b) => a[0] - b[0]);
  }
  
  frames.push({ type: 'complete', edges: [...edges], selectedEdges: [...selectedEdges], visited: Array.from(visited), labels: { title: 'Complete', detail: `MST weight: ${selectedEdges.reduce((s, e) => s + e.weight, 0)}` } });
  return frames;
}
