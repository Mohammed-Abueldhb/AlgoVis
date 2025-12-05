export type WarshallWeightedFrame =
  | { type: "matrixSnapshot"; matrix: number[][]; k: number; i?: number; j?: number }
  | { type: "info"; text: string };

export interface WarshallWeightedEdge {
  u: number;
  v: number;
  weight: number;
}

/**
 * Generate Warshall frames using WEIGHTED transitive closure
 * Similar to Floyd-Warshall but with Warshall's step ordering
 * Produces REAL NUMERIC values (weights or Infinity)
 */
export function generateWarshallWeightedFrames(
  n: number,
  edges: WarshallWeightedEdge[]
): WarshallWeightedFrame[] {
  const INF = Number.POSITIVE_INFINITY;
  const frames: WarshallWeightedFrame[] = [];
  
  // Initialize matrix with edge weights
  const matrix: number[][] = Array.from({ length: n }, () =>
    Array(n).fill(INF)
  );

  // Initialize: distance from vertex to itself is 0
  for (let i = 0; i < n; i++) {
    matrix[i][i] = 0;
  }

  // Initialize: direct edges with weights
  for (const { u, v, weight } of edges) {
    matrix[u][v] = Math.min(matrix[u][v], weight);
  }

  frames.push({
    type: "info",
    text: `Starting Weighted Warshall algorithm for ${n} vertices. Initial matrix: direct edges with weights.`,
  });
  
  // Initial snapshot (k = -1)
  frames.push({
    type: "matrixSnapshot",
    matrix: matrix.map((row) => [...row]),
    k: -1,
  });

  // Main algorithm: weighted transitive closure
  // matrix[i][j] = min(matrix[i][j], matrix[i][k] + matrix[k][j])
  for (let k = 0; k < n; k++) {
    let lastUpdated: { i: number; j: number } | null = null;
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (matrix[i][k] !== INF && matrix[k][j] !== INF) {
          const throughK = matrix[i][k] + matrix[k][j];
          if (throughK < matrix[i][j]) {
            matrix[i][j] = throughK;
            lastUpdated = { i, j };
          }
        }
      }
    }
    
    // Emit snapshot after completing all i,j loops for this k
    frames.push({
      type: "matrixSnapshot",
      matrix: matrix.map((row) => [...row]),
      k,
      i: lastUpdated?.i,
      j: lastUpdated?.j,
    });
  }

  frames.push({
    type: "info",
    text: `Algorithm complete! Final matrix contains shortest weighted paths between all pairs of vertices.`,
  });
  
  return frames;
}

