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
  visited: number[];
  labels?: { title?: string; detail?: string };
}

export function generatePrimSteps(numVertices: number = 6): GraphFrame[] {
  const frames: GraphFrame[] = [];
  
  // Sample graph edges (weight, u, v)
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

  frames.push({
    type: 'init',
    edges: allEdges,
    selectedEdges: [],
    visited: [0],
    labels: { title: 'Initialize', detail: 'Start from vertex 0' }
  });

  const visited = new Set<number>([0]);
  const selectedEdges: Edge[] = [];
  const priorityQueue: Edge[] = [];

  // Add edges from vertex 0
  allEdges.forEach(edge => {
    if (edge.u === 0 || edge.v === 0) {
      priorityQueue.push(edge);
    }
  });
  priorityQueue.sort((a, b) => a.weight - b.weight);

  while (selectedEdges.length < numVertices - 1 && priorityQueue.length > 0) {
    const edge = priorityQueue.shift()!;
    
    frames.push({
      type: 'edgeConsider',
      edges: allEdges,
      selectedEdges: [...selectedEdges],
      currentEdge: edge,
      visited: Array.from(visited),
      labels: { title: 'Consider Edge', detail: `Edge (${edge.u}, ${edge.v}) weight ${edge.weight}` }
    });

    const newVertex = visited.has(edge.u) ? edge.v : edge.u;
    
    if (!visited.has(newVertex)) {
      selectedEdges.push(edge);
      visited.add(newVertex);
      
      frames.push({
        type: 'edgeSelect',
        edges: allEdges,
        selectedEdges: [...selectedEdges],
        currentEdge: edge,
        visited: Array.from(visited),
        labels: { title: 'Add Edge to MST', detail: `Selected edge (${edge.u}, ${edge.v})` }
      });

      // Add new edges from the new vertex
      allEdges.forEach(e => {
        if ((e.u === newVertex && !visited.has(e.v)) || 
            (e.v === newVertex && !visited.has(e.u))) {
          priorityQueue.push(e);
        }
      });
      priorityQueue.sort((a, b) => a.weight - b.weight);
    } else {
      frames.push({
        type: 'edgeSkip',
        edges: allEdges,
        selectedEdges: [...selectedEdges],
        currentEdge: edge,
        visited: Array.from(visited),
        labels: { title: 'Skip Edge', detail: 'Both vertices already in MST' }
      });
    }
  }

  frames.push({
    type: 'complete',
    edges: allEdges,
    selectedEdges: [...selectedEdges],
    visited: Array.from(visited),
    labels: { title: 'Complete', detail: `MST weight: ${selectedEdges.reduce((sum, e) => sum + e.weight, 0)}` }
  });

  return frames;
}
