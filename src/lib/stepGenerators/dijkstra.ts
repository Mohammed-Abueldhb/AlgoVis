export interface Edge {
  u: number;
  v: number;
  weight: number;
}

export interface GraphFrame {
  type: 'init' | 'vertexRelax' | 'edgeConsider' | 'edgeSelect' | 'complete';
  edges: Edge[];
  selectedEdges: Edge[];
  currentEdge?: Edge;
  distances: number[];
  currentVertex?: number;
  visited: number[];
  priorityQueue?: Array<{ vertex: number; distance: number }>;
  labels?: { title?: string; detail?: string };
}

export function generateDijkstraSteps(numVertices: number = 6, startVertex: number = 0): GraphFrame[] {
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

  const distances = Array(numVertices).fill(Infinity);
  distances[startVertex] = 0;
  const visited = new Set<number>();
  const selectedEdges: Edge[] = [];
  const pq: Array<{ vertex: number; distance: number }> = [{ vertex: startVertex, distance: 0 }];

  frames.push({
    type: 'init',
    edges: allEdges,
    selectedEdges: [],
    distances: [...distances],
    visited: [],
    priorityQueue: [...pq],
    labels: { title: 'Initialize', detail: `Start from vertex ${startVertex}` }
  });

  while (pq.length > 0) {
    pq.sort((a, b) => a.distance - b.distance);
    const { vertex: u, distance: dist } = pq.shift()!;

    if (visited.has(u)) continue;
    visited.add(u);

    frames.push({
      type: 'vertexRelax',
      edges: allEdges,
      selectedEdges: [...selectedEdges],
      distances: [...distances],
      currentVertex: u,
      visited: Array.from(visited),
      priorityQueue: [...pq],
      labels: { title: 'Visit Vertex', detail: `Processing vertex ${u} (distance: ${dist})` }
    });

    // Find all edges from u
    const neighbors = allEdges.filter(e => e.u === u || e.v === u);

    for (const edge of neighbors) {
      const v = edge.u === u ? edge.v : edge.u;
      
      if (visited.has(v)) continue;

      frames.push({
        type: 'edgeConsider',
        edges: allEdges,
        selectedEdges: [...selectedEdges],
        currentEdge: edge,
        distances: [...distances],
        currentVertex: u,
        visited: Array.from(visited),
        priorityQueue: [...pq],
        labels: { title: 'Consider Edge', detail: `Check edge (${edge.u}, ${edge.v}) weight ${edge.weight}` }
      });

      const newDist = distances[u] + edge.weight;

      if (newDist < distances[v]) {
        distances[v] = newDist;
        pq.push({ vertex: v, distance: newDist });
        selectedEdges.push(edge);

        frames.push({
          type: 'edgeSelect',
          edges: allEdges,
          selectedEdges: [...selectedEdges],
          currentEdge: edge,
          distances: [...distances],
          currentVertex: u,
          visited: Array.from(visited),
          priorityQueue: [...pq],
          labels: { title: 'Update Distance', detail: `Updated distance to ${v}: ${newDist}` }
        });
      }
    }
  }

  frames.push({
    type: 'complete',
    edges: allEdges,
    selectedEdges: [...selectedEdges],
    distances: [...distances],
    visited: Array.from(visited),
    labels: { title: 'Complete', detail: 'All shortest paths found' }
  });

  return frames;
}
