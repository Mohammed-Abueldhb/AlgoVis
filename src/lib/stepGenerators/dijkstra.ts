import { Edge, Graph } from "../graphGenerator";

export interface Node {
  id: number;
  x: number;
  y: number;
}

export interface GraphFrame {
  // Rich semantic frame types so the visualizer can distinguish
  // between different stages of the algorithm.
  type:
    | "initial"
    | "selectNode"
    | "checkEdge"
    | "relax"
    | "finalizeNode"
    | "complete";
  nodes: Node[];
  edges: Edge[];
  selectedEdges: Edge[];
  currentEdge?: Edge | null;
  relaxedEdge?: Edge | null; // Edge that was just relaxed (yellow)
  visited?: number[];
  distances?: number[];
  currentVertex?: number | null;
  priorityQueue?: Array<{ vertex: number; distance: number }>;
  labels?: { title?: string; detail?: string };
  meta?: {
    currentNode?: number;
    neighbor?: number;
    prevDist?: number;
    newDist?: number;
  };
}

export function generateDijkstraSteps(
  graph: Graph,
  startVertex: number = 0
): GraphFrame[] {
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

  const adj: Map<number, Array<{ to: number; weight: number }>> = new Map();
  for (let i = 0; i < numVertices; i++) adj.set(i, []);
  for (const edge of edges) {
    adj.get(edge.u)!.push({ to: edge.v, weight: edge.weight });
    adj.get(edge.v)!.push({ to: edge.u, weight: edge.weight });
  }

  const distances = Array(numVertices).fill(Infinity);
  const visited = new Set<number>();
  const selectedEdges: Edge[] = [];
  const prev: Array<number | null> = Array(numVertices).fill(null);

  distances[startVertex] = 0;
  let pq: [number, number][] = [[0, startVertex]];

  // Frame 0: Initial state - all nodes, all edges faint, dist=∞ except source=0
  frames.push({
    type: "initial",
    nodes: [...nodes], // All nodes with positions
    edges: [...edges], // All edges
    selectedEdges: [], // No visited edges yet
    currentEdge: null, // No edge being considered
    relaxedEdge: null, // No relaxed edge yet
    distances: [...distances],
    visited: [],
    currentVertex: null,
    priorityQueue: pq.map(([d, v]) => ({ vertex: v, distance: d })),
    labels: {
      title: "Initialize",
      detail: `Start from vertex ${startVertex}, dist[${startVertex}] = 0`,
    },
    meta: {
      currentNode: startVertex,
    },
  });

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [dist, u] = pq.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);

    // Step 1: Select node u from priority queue
    frames.push({
      type: "selectNode",
      nodes: [...nodes], // All nodes (constant)
      edges: [...edges], // All edges (constant)
      selectedEdges: [...selectedEdges], // Current selected edges
      currentEdge: null, // No edge being considered yet
      relaxedEdge: null, // No relaxed edge yet
      distances: [...distances],
      visited: Array.from(visited),
      currentVertex: u, // Highlight this node
      priorityQueue: pq.map(([d, v]) => ({ vertex: v, distance: d })),
      labels: {
        title: "Select Node",
        detail: `Selected vertex ${u} with distance ${dist}`,
      },
      meta: {
        currentNode: u,
      },
    });

    for (const { to: v, weight } of adj.get(u)!) {
      if (visited.has(v)) continue;
      const currentEdge: Edge = { u, v, weight };
      const prevDist = distances[v];
      const newDist = distances[u] + weight;

      // Step 2: Check edge u→v (highlight in red)
      frames.push({
        type: "checkEdge",
        nodes: [...nodes], // All nodes (constant)
        edges: [...edges], // All edges (constant)
        selectedEdges: [...selectedEdges], // Current selected edges
        currentEdge, // Edge being considered (highlighted in red)
        relaxedEdge: null, // Not relaxed yet
        distances: [...distances],
        visited: Array.from(visited),
        currentVertex: u,
        priorityQueue: pq.map(([d, vertex]) => ({ vertex, distance: d })),
        labels: {
          title: "Check Edge",
          detail: `Checking ${u} → ${v}: dist[${v}] = ${prevDist}, via ${u} = ${newDist}`,
        },
        meta: {
          currentNode: u,
          neighbor: v,
          prevDist,
          newDist,
        },
      });

      if (newDist < distances[v]) {
        // Step 3: Relax edge (update distance, highlight in yellow)
        distances[v] = newDist;
        prev[v] = u;
        pq.push([newDist, v]);

        frames.push({
          type: "relax",
          nodes: [...nodes], // All nodes (constant)
          edges: [...edges], // All edges (constant)
          selectedEdges: [...selectedEdges], // No change yet
          currentEdge: null, // No longer highlighting in red
          relaxedEdge: currentEdge, // Edge that was relaxed (highlighted in yellow)
          distances: [...distances], // Updated distances
          visited: Array.from(visited),
          currentVertex: u,
          priorityQueue: pq.map(([d, vertex]) => ({ vertex, distance: d })),
          labels: {
            title: "Relax Edge",
            detail: `Relaxed: dist[${v}] updated from ${prevDist} to ${newDist}`,
          },
          meta: {
            currentNode: u,
            neighbor: v,
            prevDist,
            newDist,
          },
        });
      } else {
        // Edge is not improving the distance - skip it
        frames.push({
          type: "checkEdge",
          nodes: [...nodes], // All nodes (constant)
          edges: [...edges], // All edges (constant)
          selectedEdges: [...selectedEdges], // No change
          currentEdge: null, // No longer highlighting
          relaxedEdge: null, // Not relaxed
          distances: [...distances],
          visited: Array.from(visited),
          currentVertex: u,
          priorityQueue: pq.map(([d, vertex]) => ({ vertex, distance: d })),
          labels: {
            title: "Skip Edge",
            detail: `Skipped: dist[${v}] = ${prevDist} is already better than ${newDist}`,
          },
          meta: {
            currentNode: u,
            neighbor: v,
            prevDist,
            newDist,
          },
        });
      }
    }

    // Step 4: Finalize node u (mark as visited, add edge to shortest path tree)
    const prevU = prev[u];
    if (prevU !== null) {
      const edgeToU = edges.find(
        (e) => (e.u === prevU && e.v === u) || (e.u === u && e.v === prevU)
      ) ?? { u: prevU, v: u, weight: 0 };
      
      if (!selectedEdges.some(e => 
        (e.u === edgeToU.u && e.v === edgeToU.v) || (e.u === edgeToU.v && e.v === edgeToU.u)
      )) {
        selectedEdges.push(edgeToU);
      }
    }

    frames.push({
      type: "finalizeNode",
      nodes: [...nodes], // All nodes (constant)
      edges: [...edges], // All edges (constant)
      selectedEdges: [...selectedEdges], // Updated with edge to u
      currentEdge: null, // No edge being considered
      relaxedEdge: null, // No relaxed edge
      distances: [...distances],
      visited: Array.from(visited),
      currentVertex: u, // Still highlighting u
      priorityQueue: pq.map(([d, v]) => ({ vertex: v, distance: d })),
      labels: {
        title: "Finalize Node",
        detail: `Vertex ${u} finalized with distance ${distances[u]}`,
      },
      meta: {
        currentNode: u,
      },
    });
  }

  // Final frame: Complete
  frames.push({
    type: "complete",
    nodes: [...nodes], // All nodes (constant)
    edges: [...edges], // All edges (constant)
    selectedEdges: [...selectedEdges], // Final shortest-path tree edges
    currentEdge: null, // No edge being considered
    relaxedEdge: null, // No relaxed edge
    distances: [...distances],
    visited: Array.from(visited),
    currentVertex: null, // No current vertex
    labels: {
      title: "Complete",
      detail: "All shortest paths from the source have been found",
    },
  });

  return frames;
}
