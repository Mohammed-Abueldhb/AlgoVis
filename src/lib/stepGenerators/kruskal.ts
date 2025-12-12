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
  visited?: number[];
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
  
  // Sort edges by weight ASC
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  
  // Frame 0: Show all nodes and edges (faint), no selected edges
  frames.push({
    type: 'init',
    nodes: [...nodes], // All nodes with positions
    edges: [...edges], // All edges
    selectedEdges: [], // No selected edges yet
    currentEdge: null, // No edge being considered
    labels: { title: 'Initialize', detail: `Sorted ${edges.length} edges by weight` }
  });
  
  const uf = new UnionFind(numVertices);
  const selectedEdges: Edge[] = [];
  
  for (const edge of sortedEdges) {
    if (selectedEdges.length >= numVertices - 1) break;
    
    // Emit exploring frame - highlight current edge
    frames.push({
      type: 'graphSnapshot',
      nodes: [...nodes], // All nodes (constant)
      edges: [...edges], // All edges (constant)
      selectedEdges: [...selectedEdges], // Current selected edges
      currentEdge: edge, // Edge being considered (highlighted)
      labels: { title: 'Exploring', detail: `Checking edge (${edge.u},${edge.v}) w=${edge.weight}` }
    });
    
    if (uf.union(edge.u, edge.v)) {
      // Union success - edge chosen
      selectedEdges.push(edge);
      frames.push({
        type: 'graphSnapshot',
        nodes: [...nodes], // All nodes (constant)
        edges: [...edges], // All edges (constant)
        selectedEdges: [...selectedEdges], // Updated with new edge
        currentEdge: null, // No longer highlighting
        labels: { title: 'Chosen', detail: `Added to MST` }
      });
    } else {
      // Union failed - edge rejected (would create cycle)
      frames.push({
        type: 'graphSnapshot',
        nodes: [...nodes], // All nodes (constant)
        edges: [...edges], // All edges (constant)
        selectedEdges: [...selectedEdges], // No change
        currentEdge: null, // No longer highlighting
        labels: { title: 'Rejected', detail: 'Would create cycle' }
      });
    }
  }
  
  const totalWeight = selectedEdges.reduce((sum, e) => sum + e.weight, 0);
  
  frames.push({
    type: 'complete',
    nodes: [...nodes], // All nodes (constant)
    edges: [...edges], // All edges (constant)
    selectedEdges: [...selectedEdges], // Final MST edges
    currentEdge: null, // No edge being considered
    finalState: {
      mstEdges: [...selectedEdges],
      totalWeight
    },
    labels: { title: 'Complete', detail: `MST weight: ${totalWeight}` }
  });
  
  return frames;
}
