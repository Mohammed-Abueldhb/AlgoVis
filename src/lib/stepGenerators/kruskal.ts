export interface Edge {
  u: number;
  v: number;
  weight: number;
}

export interface GraphFrame {
  type: 'init' | 'edgeConsider' | 'edgeSelect' | 'edgeSkip' | 'complete';
  edges: Edge[];
  selectedEdges: Edge[];
  currentEdge?: Edge;
  components?: number[][];
  labels?: { title?: string; detail?: string };
}

class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = Array(size).fill(0);
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) return false;

    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
    return true;
  }
}

export function generateKruskalSteps(numVertices: number = 6): GraphFrame[] {
  const frames: GraphFrame[] = [];
  
  // Sample graph edges
  const allEdges: Edge[] = [
    { u: 0, v: 1, weight: 4 },
    { u: 0, v: 2, weight: 3 },
    { u: 1, v: 2, weight: 1 },
    { u: 1, v: 3, weight: 2 },
    { u: 2, v: 3, weight: 4 },
    { u: 3, v: 4, weight: 2 },
    { u: 3, v: 5, weight: 6 },
    { u: 4, v: 5, weight: 3 }
  ];

  // Sort edges by weight
  const sortedEdges = [...allEdges].sort((a, b) => a.weight - b.weight);

  frames.push({
    type: 'init',
    edges: sortedEdges,
    selectedEdges: [],
    labels: { title: 'Initialize', detail: 'Sort edges by weight' }
  });

  const uf = new UnionFind(numVertices);
  const selectedEdges: Edge[] = [];

  for (const edge of sortedEdges) {
    frames.push({
      type: 'edgeConsider',
      edges: sortedEdges,
      selectedEdges: [...selectedEdges],
      currentEdge: edge,
      labels: { title: 'Consider Edge', detail: `Edge (${edge.u}, ${edge.v}) weight ${edge.weight}` }
    });

    if (uf.find(edge.u) !== uf.find(edge.v)) {
      uf.union(edge.u, edge.v);
      selectedEdges.push(edge);
      
      frames.push({
        type: 'edgeSelect',
        edges: sortedEdges,
        selectedEdges: [...selectedEdges],
        currentEdge: edge,
        labels: { title: 'Add Edge to MST', detail: `Selected edge (${edge.u}, ${edge.v})` }
      });

      if (selectedEdges.length === numVertices - 1) break;
    } else {
      frames.push({
        type: 'edgeSkip',
        edges: sortedEdges,
        selectedEdges: [...selectedEdges],
        currentEdge: edge,
        labels: { title: 'Skip Edge', detail: 'Would create a cycle' }
      });
    }
  }

  frames.push({
    type: 'complete',
    edges: sortedEdges,
    selectedEdges: [...selectedEdges],
    labels: { title: 'Complete', detail: `MST weight: ${selectedEdges.reduce((sum, e) => sum + e.weight, 0)}` }
  });

  return frames;
}
