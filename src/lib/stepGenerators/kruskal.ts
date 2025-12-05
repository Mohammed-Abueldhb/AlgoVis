import { Edge, Graph } from '../graphGenerator';

export interface GraphFrame {
  type: 'init' | 'graphSnapshot' | 'complete';
  edges: Edge[];
  selectedEdges: Edge[];
  currentEdge?: Edge;
  visited?: number[];
  numVertices?: number; // Include numVertices for proper visualization
  labels?: { title?: string; detail?: string };
  finalState?: {
    mstEdges: Edge[];
    totalWeight: number;
  };
}

class UnionFind {
  parent: number[];
  rank: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = Array(n).fill(0);
  }
  find(x: number): number {
    // Path compression
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }
  union(x: number, y: number): boolean {
    const px = this.find(x);
    const py = this.find(y);
    if (px === py) return false;
    // Union by rank
    if (this.rank[px] < this.rank[py]) {
      this.parent[px] = py;
    } else if (this.rank[px] > this.rank[py]) {
      this.parent[py] = px;
    } else {
      this.parent[py] = px;
      this.rank[px]++;
    }
    return true;
  }
}

export function generateKruskalSteps(graph: Graph): GraphFrame[] {
  const { numVertices, edges } = graph;
  const frames: GraphFrame[] = [];
  
  // Sort edges by weight ASC
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  
  frames.push({
    type: 'init',
    edges: [...edges],
    selectedEdges: [],
    numVertices: numVertices,
    labels: { title: 'Initialize', detail: `Sorted ${edges.length} edges by weight` }
  });
  
  const uf = new UnionFind(numVertices);
  const selectedEdges: Edge[] = [];
  
  for (const edge of sortedEdges) {
    if (selectedEdges.length >= numVertices - 1) break;
    
    // Emit exploring frame
    frames.push({
      type: 'graphSnapshot',
      edges: [...edges],
      selectedEdges: [...selectedEdges],
      currentEdge: edge,
      numVertices: numVertices,
      labels: { title: 'Exploring', detail: `Checking edge (${edge.u},${edge.v}) w=${edge.weight}` }
    });
    
    if (uf.union(edge.u, edge.v)) {
      // Union success - edge chosen
      selectedEdges.push(edge);
      frames.push({
        type: 'graphSnapshot',
        edges: [...edges],
        selectedEdges: [...selectedEdges],
        currentEdge: edge,
        numVertices: numVertices,
        labels: { title: 'Chosen', detail: `Added to MST` }
      });
    } else {
      // Union failed - edge rejected (would create cycle)
      frames.push({
        type: 'graphSnapshot',
        edges: [...edges],
        selectedEdges: [...selectedEdges],
        currentEdge: edge,
        numVertices: numVertices,
        labels: { title: 'Rejected', detail: 'Would create cycle' }
      });
    }
  }
  
  const totalWeight = selectedEdges.reduce((sum, e) => sum + e.weight, 0);
  
  frames.push({
    type: 'complete',
    edges: [...edges],
    selectedEdges: [...selectedEdges],
    numVertices: numVertices,
    finalState: {
      mstEdges: [...selectedEdges],
      totalWeight
    },
    labels: { title: 'Complete', detail: `MST weight: ${totalWeight}` }
  });
  
  return frames;
}
