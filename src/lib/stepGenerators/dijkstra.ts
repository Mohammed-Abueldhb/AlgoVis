import { Edge, Graph } from '../graphGenerator';

export interface GraphFrame {
  type: 'init' | 'edgeConsider' | 'edgeSelect' | 'edgeSkip' | 'vertexRelax' | 'complete';
  edges: Edge[];
  selectedEdges: Edge[];
  currentEdge?: Edge;
  visited?: number[];
  distances?: number[];
  currentVertex?: number;
  priorityQueue?: Array<{ vertex: number; distance: number }>;
  labels?: { title?: string; detail?: string };
}

export function generateDijkstraSteps(graph: Graph, startVertex: number = 0): GraphFrame[] {
  const { numVertices, edges } = graph;
  const frames: GraphFrame[] = [];
  
  const adj: Map<number, Array<{ to: number; weight: number }>> = new Map();
  for (let i = 0; i < numVertices; i++) adj.set(i, []);
  for (const edge of edges) {
    adj.get(edge.u)!.push({ to: edge.v, weight: edge.weight });
    adj.get(edge.v)!.push({ to: edge.u, weight: edge.weight });
  }
  
  const distances = Array(numVertices).fill(Infinity);
  const visited = new Set<number>();
  const selectedEdges: Edge[] = [];
  distances[startVertex] = 0;
  let pq: [number, number][] = [[0, startVertex]];
  
  frames.push({ type: 'init', edges: [...edges], selectedEdges: [], distances: [...distances], visited: [], priorityQueue: pq.map(([d, v]) => ({ vertex: v, distance: d })), labels: { title: 'Initialize', detail: `Start from vertex ${startVertex}` } });
  
  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [dist, u] = pq.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);
    
    frames.push({ type: 'vertexRelax', edges: [...edges], selectedEdges: [...selectedEdges], distances: [...distances], visited: Array.from(visited), currentVertex: u, priorityQueue: pq.map(([d, v]) => ({ vertex: v, distance: d })), labels: { title: 'Process', detail: `Vertex ${u} dist=${dist}` } });
    
    for (const { to: v, weight } of adj.get(u)!) {
      if (visited.has(v)) continue;
      const currentEdge: Edge = { u, v, weight };
      const newDist = distances[u] + weight;
      
      frames.push({ type: 'edgeConsider', edges: [...edges], selectedEdges: [...selectedEdges], currentEdge, distances: [...distances], visited: Array.from(visited), currentVertex: u, priorityQueue: pq.map(([d, vertex]) => ({ vertex, distance: d })), labels: { title: 'Consider', detail: `Path to ${v}: ${newDist}` } });
      
      if (newDist < distances[v]) {
        distances[v] = newDist;
        pq.push([newDist, v]);
        frames.push({ type: 'edgeSelect', edges: [...edges], selectedEdges: [...selectedEdges], currentEdge, distances: [...distances], visited: Array.from(visited), currentVertex: u, priorityQueue: pq.map(([d, vertex]) => ({ vertex, distance: d })), labels: { title: 'Update', detail: `dist[${v}]=${newDist}` } });
      }
    }
  }
  
  frames.push({ type: 'complete', edges: [...edges], selectedEdges: [...selectedEdges], distances: [...distances], visited: Array.from(visited), labels: { title: 'Complete', detail: 'Shortest paths found' } });
  return frames;
}
