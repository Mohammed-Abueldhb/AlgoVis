export interface Edge {
  u: number;
  v: number;
  weight: number;
}

export interface Graph {
  numVertices: number;
  edges: Edge[];
}

/**
 * Generate a random connected graph
 * @param numVertices Number of vertices (4-12)
 * @param density Edge density (0.3-0.8)
 */
export function generateRandomGraph(numVertices: number = 6, density: number = 0.4): Graph {
  const edges: Edge[] = [];
  
  // Ensure connectivity by creating a spanning tree first
  for (let i = 1; i < numVertices; i++) {
    edges.push({
      u: Math.floor(Math.random() * i), // Connect to a random previous node
      v: i,
      weight: Math.floor(Math.random() * 50) + 1,
    });
  }
  
  // Add random additional edges based on density
  for (let u = 0; u < numVertices; u++) {
    for (let v = u + 2; v < numVertices; v++) {
      // Check if edge doesn't already exist
      const exists = edges.some(e => 
        (e.u === u && e.v === v) || (e.u === v && e.v === u)
      );
      
      if (!exists && Math.random() < density) {
        edges.push({
          u,
          v,
          weight: Math.floor(Math.random() * 50) + 1,
        });
      }
    }
  }
  
  return { numVertices, edges };
}
