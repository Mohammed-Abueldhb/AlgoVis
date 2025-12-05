import { Edge, Graph } from "../graphGenerator";

export interface GraphFrame {
  // Rich semantic frame types so the visualizer can distinguish
  // between different stages of the algorithm.
  type:
    | "init"
    | "edgeConsider"
    | "edgeRelax"
    | "edgeSkip"
    | "vertexFinalized"
    | "pqState"
    | "edgeSelect"
    | "complete";
  edges: Edge[];
  selectedEdges: Edge[];
  currentEdge?: Edge;
  visited?: number[];
  distances?: number[];
  currentVertex?: number;
  priorityQueue?: Array<{ vertex: number; distance: number }>;
  labels?: { title?: string; detail?: string };
}

export function generateDijkstraSteps(
  graph: Graph,
  startVertex: number = 0
): GraphFrame[] {
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
  const prev: Array<number | null> = Array(numVertices).fill(null);

  distances[startVertex] = 0;
  let pq: [number, number][] = [[0, startVertex]];

  // Initial state
  frames.push({
    type: "init",
    edges: [...edges],
    selectedEdges: [],
    distances: [...distances],
    visited: [],
    priorityQueue: pq.map(([d, v]) => ({ vertex: v, distance: d })),
    labels: {
      title: "Initialize",
      detail: `Start from vertex ${startVertex}`,
    },
  });

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [dist, u] = pq.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);

    // Priority queue state snapshot
    frames.push({
      type: "pqState",
      edges: [...edges],
      selectedEdges: [...selectedEdges],
      distances: [...distances],
      visited: Array.from(visited),
      currentVertex: u,
      priorityQueue: pq.map(([d, v]) => ({ vertex: v, distance: d })),
      labels: {
        title: "Priority Queue",
        detail: `Next vertex to process: ${u} (dist=${dist})`,
      },
    });

    // Mark vertex as finalized
    frames.push({
      type: "vertexFinalized",
      edges: [...edges],
      selectedEdges: [...selectedEdges],
      distances: [...distances],
      visited: Array.from(visited),
      currentVertex: u,
      priorityQueue: pq.map(([d, v]) => ({ vertex: v, distance: d })),
      labels: { title: "Process", detail: `Finalize vertex ${u}` },
    });

    for (const { to: v, weight } of adj.get(u)!) {
      if (visited.has(v)) continue;
      const currentEdge: Edge = { u, v, weight };
      const newDist = distances[u] + weight;

      // Edge is being considered
      frames.push({
        type: "edgeConsider",
        edges: [...edges],
        selectedEdges: [...selectedEdges],
        currentEdge,
        distances: [...distances],
        visited: Array.from(visited),
        currentVertex: u,
        priorityQueue: pq.map(([d, vertex]) => ({ vertex, distance: d })),
        labels: {
          title: "Consider Edge",
          detail: `Trying path ${u} → ${v} with cost ${newDist}`,
        },
      });

      if (newDist < distances[v]) {
        // Relaxation step
        distances[v] = newDist;
        prev[v] = u;
        pq.push([newDist, v]);

        frames.push({
          type: "edgeRelax",
          edges: [...edges],
          selectedEdges: [...selectedEdges],
          currentEdge,
          distances: [...distances],
          visited: Array.from(visited),
          currentVertex: u,
          priorityQueue: pq.map(([d, vertex]) => ({ vertex, distance: d })),
          labels: {
            title: "Relax Edge",
            detail: `Updated dist[${v}] = ${newDist}`,
          },
        });
      } else {
        // Edge is not improving the distance
        frames.push({
          type: "edgeSkip",
          edges: [...edges],
          selectedEdges: [...selectedEdges],
          currentEdge,
          distances: [...distances],
          visited: Array.from(visited),
          currentVertex: u,
          priorityQueue: pq.map(([d, vertex]) => ({ vertex, distance: d })),
          labels: {
            title: "Skip Edge",
            detail: `Existing dist[${v}] = ${distances[v]} is better`,
          },
        });
      }
    }
  }

  // After Dijkstra completes, select the edges that form the
  // shortest-path tree based on the predecessor array.
  for (let v = 0; v < numVertices; v++) {
    const u = prev[v];
    if (u === null) continue;

    const edge =
      edges.find(
        (e) => (e.u === u && e.v === v) || (e.u === v && e.v === u)
      ) ?? { u, v, weight: 0 };

    selectedEdges.push(edge);

    frames.push({
      type: "edgeSelect",
      edges: [...edges],
      selectedEdges: [...selectedEdges],
      currentEdge: edge,
      distances: [...distances],
      visited: Array.from(visited),
      labels: {
        title: "Shortest Path Tree",
        detail: `Edge (${u},${v}) is part of the SPT`,
      },
    });
  }

  frames.push({
    type: "complete",
    edges: [...edges],
    selectedEdges: [...selectedEdges],
    distances: [...distances],
    visited: Array.from(visited),
    labels: {
      title: "Complete",
      detail: "All shortest paths from the source have been found",
    },
  });

  return frames;
}
