export interface WarshallNumericFrame {
  type: "initial" | "check" | "update" | "final";
  k: number;
  i: number;
  j: number;
  matrix: number[][];
  highlight: {
    kCell?: [number, number];
    currentCell?: [number, number];
    viaCells?: [[number, number], [number, number]];
    updated?: boolean;
  };
  metadata: {
    kIndex: number;
    iIndex: number;
    jIndex: number;
    lastUpdate?: { from: number; to: number };
  };
}

export interface WarshallNumericEdge {
  u: number;
  v: number;
  weight: number;
}

/**
 * Generate Warshall frames using WEIGHTED SHORTEST-PATH logic (identical to Floyd-Warshall)
 * matrix[i][j] = min(matrix[i][j], matrix[i][k] + matrix[k][j])
 * Uses Infinity for no direct edge, carries forward real weights
 */
export function generateWarshallNumericFrames(
  n: number,
  edges: WarshallNumericEdge[]
): WarshallNumericFrame[] {
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

  const frames: WarshallNumericFrame[] = [];
  
  // FRAME 0: Initial matrix (CRITICAL - must be first)
  frames.push({
    type: "initial",
    k: -1,
    i: -1,
    j: -1,
    matrix: dist.map((row) => row.map((val) => val)), // Deep copy
    highlight: {},
    metadata: {
      kIndex: -1,
      iIndex: -1,
      jIndex: -1,
    },
  });

  // Main algorithm: try all intermediate vertices
  // matrix[i][j] = min(matrix[i][j], matrix[i][k] + matrix[k][j])
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const prevValue = dist[i][j];
        
        // CHECK FRAME: Show what we're checking
        frames.push({
          type: "check",
          k,
          i,
          j,
          matrix: dist.map((row) => row.map((val) => val)), // Current state
          highlight: {
            kCell: [k, k],
            currentCell: [i, j],
            viaCells: [[i, k], [k, j]],
            updated: false,
          },
          metadata: {
            kIndex: k,
            iIndex: i,
            jIndex: j,
          },
        });

        // Check if path via k is shorter
        if (dist[i][k] !== INF && dist[k][j] !== INF) {
          const viaK = dist[i][k] + dist[k][j];
          if (viaK < dist[i][j]) {
            // UPDATE FRAME: Show the update
            dist[i][j] = viaK;
            frames.push({
              type: "update",
              k,
              i,
              j,
              matrix: dist.map((row) => row.map((val) => val)), // Updated state
              highlight: {
                kCell: [k, k],
                currentCell: [i, j],
                viaCells: [[i, k], [k, j]],
                updated: true,
              },
              metadata: {
                kIndex: k,
                iIndex: i,
                jIndex: j,
                lastUpdate: { from: prevValue, to: viaK },
              },
            });
          }
        }
      }
    }
  }

  // FINAL FRAME: Always show final matrix
  frames.push({
    type: "final",
    k: n - 1,
    i: n - 1,
    j: n - 1,
    matrix: dist.map((row) => row.map((val) => val)), // Deep copy
    highlight: {},
    metadata: {
      kIndex: n - 1,
      iIndex: n - 1,
      jIndex: n - 1,
    },
  });
  
  return frames;
}
