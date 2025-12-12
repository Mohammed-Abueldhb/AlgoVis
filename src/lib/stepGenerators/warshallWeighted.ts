export interface WarshallWeightedFrame {
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

export interface WarshallWeightedEdge {
  u: number;
  v: number;
  weight?: number;
}

/**
 * Generate Warshall frames for boolean reachability (transitive closure)
 * reachable[i][j] = reachable[i][j] OR (reachable[i][k] AND reachable[k][j])
 * Matrix values are strictly 0 (not reachable) or 1 (reachable)
 */
export function generateWarshallWeightedFrames(
  n: number,
  edges: WarshallWeightedEdge[]
): WarshallWeightedFrame[] {
  const reachable: number[][] = Array.from({ length: n }, () =>
    Array(n).fill(0)
  );

  // Initialize diagonal as reachable and direct edges as reachable
  for (let i = 0; i < n; i++) {
    reachable[i][i] = 1;
  }

  for (const { u, v } of edges) {
    reachable[u][v] = 1;
  }

  const frames: WarshallWeightedFrame[] = [];

  // FRAME 0: Initial reachability matrix
  frames.push({
    type: "initial",
    k: -1,
    i: -1,
    j: -1,
    matrix: reachable.map((row) => [...row]),
    highlight: {},
    metadata: {
      kIndex: -1,
      iIndex: -1,
      jIndex: -1,
    },
  });

  // Main algorithm: boolean transitive closure
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const prevValue = reachable[i][j];

        // CHECK FRAME: show current evaluation
        frames.push({
          type: "check",
          k,
          i,
          j,
          matrix: reachable.map((row) => [...row]),
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

        // Boolean update: reachable via k
        if (reachable[i][k] === 1 && reachable[k][j] === 1) {
          if (reachable[i][j] === 0) {
            reachable[i][j] = 1;
            frames.push({
              type: "update",
              k,
              i,
              j,
              matrix: reachable.map((row) => [...row]),
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
                lastUpdate: { from: prevValue, to: 1 },
              },
            });
          }
        }
      }
    }
  }

  // FINAL FRAME: final reachability matrix
  frames.push({
    type: "final",
    k: n - 1,
    i: n - 1,
    j: n - 1,
    matrix: reachable.map((row) => [...row]),
    highlight: {},
    metadata: {
      kIndex: n - 1,
      iIndex: n - 1,
      jIndex: n - 1,
    },
  });

  return frames;
}
  
