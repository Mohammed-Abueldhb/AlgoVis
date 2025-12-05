import { Edge, Graph } from '../graphGenerator';

export interface GraphFrame {
  type: 'init' | 'graphSnapshot' | 'complete';
  edges: Edge[];
  selectedEdges: Edge[];
  currentEdge?: Edge;
  visited: number[];
  labels?: { title?: string; detail?: string };
  finalState?: {
    mstEdges: Edge[];
    totalWeight: number;
  };
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
  // Priority queue: [weight, from, to]
  let pq: [number, number, number][] = [];
  
  // Add edges from starting vertex
  for (const edge of adj.get(0)!) {
    if (!visited.has(edge.v)) {
      pq.push([edge.weight, 0, edge.v]);
    }
  }
  pq.sort((a, b) => a[0] - b[0]);
  
  frames.push({
    type: 'init',
    edges: [...edges],
    selectedEdges: [],
    visited: [0],
    labels: { title: 'Initialize', detail: 'Starting from vertex 0' }
  });
  
  while (pq.length > 0 && selectedEdges.length < numVertices - 1) {
    const [weight, from, to] = pq.shift()!;
    
    if (visited.has(to)) {
      continue; // Skip if already visited
    }
    
    const currentEdge: Edge = { u: from, v: to, weight };
    
    // Emit exploring frame
    frames.push({
      type: 'graphSnapshot',
      edges: [...edges],
      selectedEdges: [...selectedEdges],
      currentEdge,
      visited: Array.from(visited),
      labels: { title: 'Exploring', detail: `Checking edge (${from},${to}) w=${weight}` }
    });
    
    visited.add(to);
    selectedEdges.push(currentEdge);
    
    // Emit chosen frame
    frames.push({
      type: 'graphSnapshot',
      edges: [...edges],
      selectedEdges: [...selectedEdges],
      currentEdge,
      visited: Array.from(visited),
      labels: { title: 'Chosen', detail: `Added to MST` }
    });
    
    // Add edges from newly added node
    for (const edge of adj.get(to)!) {
      if (!visited.has(edge.v)) {
        pq.push([edge.weight, to, edge.v]);
      }
    }
    pq.sort((a, b) => a[0] - b[0]);
  }
  
  const totalWeight = selectedEdges.reduce((sum, e) => sum + e.weight, 0);
  
  frames.push({
    type: 'complete',
    edges: [...edges],
    selectedEdges: [...selectedEdges],
    visited: Array.from(visited),
    finalState: {
      mstEdges: [...selectedEdges],
      totalWeight
    },
    labels: { title: 'Complete', detail: `MST weight: ${totalWeight}` }
  });
  
  return frames;
}
