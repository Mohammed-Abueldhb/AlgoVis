import { Edge, Graph } from '../graphGenerator';

export interface Node {
  id: number;
  x: number;
  y: number;
}

export interface GraphFrame {
  type: 'init' | 'graphSnapshot' | 'complete';
  nodes: Node[];
  edges: Edge[];
  selectedEdges: Edge[];
  currentEdge?: Edge | null;
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
  
  // Calculate node positions (constant across all frames)
  const size = 200;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = Math.min(size * 0.35, 70);
  
  const nodes: Node[] = Array.from({ length: numVertices }, (_, i) => {
    const angle = (i * 2 * Math.PI) / numVertices - Math.PI / 2;
    return {
      id: i,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
  
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
  
  // Frame 0: Show all nodes and edges (faint), no selected edges
  frames.push({
    type: 'init',
    nodes: [...nodes], // All nodes with positions
    edges: [...edges], // All edges
    selectedEdges: [], // No selected edges yet
    currentEdge: null, // No edge being considered
    visited: [0],
    labels: { title: 'Initialize', detail: 'Starting from vertex 0' }
  });
  
  while (pq.length > 0 && selectedEdges.length < numVertices - 1) {
    const [weight, from, to] = pq.shift()!;
    
    if (visited.has(to)) {
      continue; // Skip if already visited
    }
    
    const currentEdge: Edge = { u: from, v: to, weight };
    
    // Emit exploring frame - highlight current edge
    frames.push({
      type: 'graphSnapshot',
      nodes: [...nodes], // All nodes (constant)
      edges: [...edges], // All edges (constant)
      selectedEdges: [...selectedEdges], // Current selected edges
      currentEdge, // Edge being considered (highlighted)
      visited: Array.from(visited),
      labels: { title: 'Exploring', detail: `Checking edge (${from},${to}) w=${weight}` }
    });
    
    visited.add(to);
    selectedEdges.push(currentEdge);
    
    // Emit chosen frame - edge is now selected
    frames.push({
      type: 'graphSnapshot',
      nodes: [...nodes], // All nodes (constant)
      edges: [...edges], // All edges (constant)
      selectedEdges: [...selectedEdges], // Updated with new edge
      currentEdge: null, // No longer highlighting
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
    nodes: [...nodes], // All nodes (constant)
    edges: [...edges], // All edges (constant)
    selectedEdges: [...selectedEdges], // Final MST edges
    currentEdge: null, // No edge being considered
    visited: Array.from(visited),
    finalState: {
      mstEdges: [...selectedEdges],
      totalWeight
    },
    labels: { title: 'Complete', detail: `MST weight: ${totalWeight}` }
  });
  
  return frames;
}
