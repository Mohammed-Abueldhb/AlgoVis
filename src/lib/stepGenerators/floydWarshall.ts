export type FloydWarshallFrame =
  | { type: "matrixSnapshot"; dist: number[][]; k: number; i?: number; j?: number }
  | { type: "info"; text: string };

export interface FloydWarshallEdge {
  u: number;
  v: number;
  weight: number;
}

export function generateFloydWarshallFrames(
  n: number,
  edges: FloydWarshallEdge[]
): FloydWarshallFrame[] {
  const INF = Number.POSITIVE_INFINITY;
  const dist: number[][] = Array.from({ length: n }, () =>
    Array(n).fill(INF)
  );

  // Initialize: distance from vertex to itself is 0
  for (let i = 0; i < n; i++) {
    dist[i][i] = 0;
  }

  // Initialize: direct edges (use min if multiple edges between same pair)
  for (const { u, v, weight } of edges) {
    dist[u][v] = Math.min(dist[u][v], weight);
  }

  const frames: FloydWarshallFrame[] = [];
  
  frames.push({
    type: "info",
    text: `Starting Floyd-Warshall algorithm for ${n} vertices. Initial distance matrix: direct edges only.`,
  });
  
  // Initial snapshot (k = -1)
  frames.push({
    type: "matrixSnapshot",
    dist: dist.map((row) => [...row]),
    k: -1,
  });

  // Main algorithm: try all intermediate vertices
  for (let k = 0; k < n; k++) {
    let lastUpdated: { i: number; j: number } | null = null;
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] !== INF && dist[k][j] !== INF) {
          const throughK = dist[i][k] + dist[k][j];
          if (throughK < dist[i][j]) {
            dist[i][j] = throughK;
            lastUpdated = { i, j };
          }
        }
      }
    }
    
    // Emit snapshot after completing all i,j loops for this k
    frames.push({
      type: "matrixSnapshot",
      dist: dist.map((row) => [...row]),
      k,
      i: lastUpdated?.i,
      j: lastUpdated?.j,
    });
  }

  frames.push({
    type: "info",
    text: `Algorithm complete! Final matrix contains shortest paths between all pairs of vertices.`,
  });

  return frames;
}
