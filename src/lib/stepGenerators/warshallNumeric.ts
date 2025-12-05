export type WarshallNumericFrame =
  | { type: "matrixSnapshot"; matrix: number[][]; k: number; i?: number; j?: number }
  | { type: "info"; text: string };

export interface WarshallNumericEdge {
  u: number;
  v: number;
  weight: number;
}

/**
 * Generate Warshall frames using TRUE TRANSITIVE CLOSURE logic
 * matrix[i][j] = 1 if a path exists from i to j, else 0
 */
export function generateWarshallNumericFrames(
  n: number,
  edges: WarshallNumericEdge[]
): WarshallNumericFrame[] {
  const frames: WarshallNumericFrame[] = [];
  
  // True transitive closure: 1 if path exists, 0 otherwise
  const matrix: number[][] = Array.from({ length: n }, () =>
    Array(n).fill(0)
  );

  // Initialize: diagonal = 0 (no self-loops in standard transitive closure)
  // Initialize: direct edges = 1 if edge exists
  for (const { u, v } of edges) {
    if (u !== v) {
      matrix[u][v] = 1; // Path exists if edge exists
    }
  }

  frames.push({
    type: "info",
    text: `Starting Warshall algorithm for ${n} vertices. Initial adjacency matrix: direct edges only.`,
  });
  
  // Initial snapshot (k = -1)
  frames.push({
    type: "matrixSnapshot",
    matrix: matrix.map((row) => [...row]),
    k: -1,
  });

  // Main algorithm: transitive closure
  // matrix[i][j] = matrix[i][j] OR (matrix[i][k] AND matrix[k][j])
  for (let k = 0; k < n; k++) {
    let lastUpdated: { i: number; j: number } | null = null;
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        // Transitive closure: path exists if direct path OR path through k
        const oldValue = matrix[i][j];
        matrix[i][j] = matrix[i][j] || (matrix[i][k] && matrix[k][j] ? 1 : 0);
        if (matrix[i][j] !== oldValue) {
          lastUpdated = { i, j };
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
    text: `Algorithm complete! Final matrix contains transitive closure (1 = path exists, 0 = no path).`,
  });
  
  return frames;
}
