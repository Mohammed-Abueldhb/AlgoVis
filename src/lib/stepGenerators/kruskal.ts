import { Edge, Graph } from '../graphGenerator';

export interface GraphFrame {
  type: 'init' | 'edgeConsider' | 'edgeSelect' | 'edgeSkip' | 'complete';
  edges: Edge[];
  selectedEdges: Edge[];
  currentEdge?: Edge;
  visited?: number[];
  labels?: { title?: string; detail?: string };
}

class UnionFind {
  parent: number[];
  rank: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = Array(n).fill(0);
  }
  find(x: number): number {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(x: number, y: number): boolean {
    const px = this.find(x), py = this.find(y);
    if (px === py) return false;
    if (this.rank[px] < this.rank[py]) this.parent[px] = py;
    else if (this.rank[px] > this.rank[py]) this.parent[py] = px;
    else { this.parent[py] = px; this.rank[px]++; }
    return true;
  }
}

export function generateKruskalSteps(graph: Graph): GraphFrame[] {
  const { numVertices, edges } = graph;
  const frames: GraphFrame[] = [];
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  
  frames.push({ type: 'init', edges: [...edges], selectedEdges: [], labels: { title: 'Initialize', detail: `Sorted ${edges.length} edges` } });
  
  const uf = new UnionFind(numVertices);
  const selectedEdges: Edge[] = [];
  
  for (const edge of sortedEdges) {
    if (selectedEdges.length >= numVertices - 1) break;
    frames.push({ type: 'edgeConsider', edges: [...edges], selectedEdges: [...selectedEdges], currentEdge: edge, labels: { title: 'Consider', detail: `Edge (${edge.u},${edge.v}) w=${edge.weight}` } });
    
    if (uf.union(edge.u, edge.v)) {
      selectedEdges.push(edge);
      frames.push({ type: 'edgeSelect', edges: [...edges], selectedEdges: [...selectedEdges], currentEdge: edge, labels: { title: 'Select', detail: `Added to MST` } });
    } else {
      frames.push({ type: 'edgeSkip', edges: [...edges], selectedEdges: [...selectedEdges], currentEdge: edge, labels: { title: 'Skip', detail: 'Would create cycle' } });
    }
  }
  
  frames.push({ type: 'complete', edges: [...edges], selectedEdges: [...selectedEdges], labels: { title: 'Complete', detail: `MST weight: ${selectedEdges.reduce((s, e) => s + e.weight, 0)}` } });
  return frames;
}
