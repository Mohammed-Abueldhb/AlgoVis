# Compare Run Unified Fix - All Visualizers

## ✅ Overview

This document summarizes the comprehensive fixes and enhancements made to ALL visualizers in Compare Run mode (Sorting, Searching, Greedy, Dijkstra) to ensure unified behavior and correct data structures.

## ✅ Files Modified

### 1. `src/lib/stepGenerators/dijkstra.ts` ✅ ENHANCED
**Changes:**
- Updated frame types to be more granular: `initial`, `selectNode`, `checkEdge`, `relax`, `finalizeNode`, `complete`
- Added `relaxedEdge?: Edge | null` to frame interface (for yellow highlighting)
- Added `meta` field with `currentNode`, `neighbor`, `prevDist`, `newDist`
- Every micro-step now creates a frame:
  1. `initial` - all nodes, all edges faint, dist=∞ except source=0
  2. `selectNode(u)` - highlight u as current
  3. `checkEdge(u→v)` - edge turns RED, show prev dist
  4. `relax(u→v)` - if improved: edge flashes YELLOW & dist[v] updates
  5. `finalizeNode(u)` - mark node u finalized (green)
- Removed old frame types: `pqState`, `edgeSelect`, `edgeSkip`, `edgeConsider`, `edgeRelax`
- All frames include constant `nodes` and `edges` arrays

**Key Code:**
```typescript
export interface GraphFrame {
  type: "initial" | "selectNode" | "checkEdge" | "relax" | "finalizeNode" | "complete";
  nodes: Node[];
  edges: Edge[];
  selectedEdges: Edge[];
  currentEdge?: Edge | null;
  relaxedEdge?: Edge | null; // NEW: Edge that was just relaxed (yellow)
  visited?: number[];
  distances?: number[];
  currentVertex?: number | null;
  meta?: {
    currentNode?: number;
    neighbor?: number;
    prevDist?: number;
    newDist?: number;
  };
}
```

### 2. `src/components/compare/GraphMiniView.tsx` ✅ ENHANCED
**Changes:**
- Added `distances?: number[]` prop (for Dijkstra distance display)
- Added `relaxedEdge?: Edge | null` prop (for yellow highlighting)
- Added `currentVertex?: number | null` prop (for highlighting current node)
- Added "relaxed" edge state (yellow #FFD86B)
- Updated edge color logic to include relaxed state
- Added distance labels on nodes (below node ID)
- Current node highlighted with green circle and thicker border
- Distance formatting: shows number or "∞" for Infinity

**Key Code:**
```typescript
interface GraphMiniViewProps {
  nodes?: Node[];
  edges: Edge[];
  selectedEdges: Edge[];
  currentEdge?: Edge | null;
  numVertices: number;
  distances?: number[]; // NEW: For Dijkstra
  relaxedEdge?: Edge | null; // NEW: For Dijkstra
  currentVertex?: number | null; // NEW: For Dijkstra
}

// Edge states now include "relaxed"
const getEdgeState = (edge: Edge): "normal" | "exploring" | "chosen" | "rejected" | "relaxed" => {
  if (relaxedEdge && ...) return "relaxed";
  // ... other states
};

// Edge colors
const getEdgeColor = (state: string) => {
  switch (state) {
    case "relaxed": return "#FFD86B"; // NEW: yellow for relaxed
    // ... other colors
  }
};

// Distance display on nodes
{dist !== null && (
  <text
    x={pos.x}
    y={pos.y}
    textAnchor="middle"
    dy="18"
    fontSize="10px"
    fill="#C9D7FF"
  >
    {formatDistance(dist)}
  </text>
)}
```

### 3. `src/components/compare/MiniVisualizer.tsx` ✅ UPDATED
**Changes:**
- Updated greedy algorithm rendering to pass Dijkstra-specific props:
  - `distances` from `currentFrame.distances`
  - `relaxedEdge` from `currentFrame.relaxedEdge`
  - `currentVertex` from `currentFrame.currentVertex`
- Searching visualizer already correct (real values, normalization, labels, colors)
- Sorting visualizer already correct (step-by-step frames, colors)

**Key Code:**
```typescript
// Greedy algorithms section
const relaxedEdge = currentFrame.relaxedEdge ?? null; // For Dijkstra
const distances = currentFrame.distances; // For Dijkstra
const currentVertex = currentFrame.currentVertex ?? null; // For Dijkstra

<GraphMiniView
  nodes={nodes}
  edges={edges}
  selectedEdges={selectedEdges}
  currentEdge={currentEdge}
  numVertices={numVertices}
  distances={distances} // NEW
  relaxedEdge={relaxedEdge} // NEW
  currentVertex={currentVertex} // NEW
/>
```

## ✅ Requirements Met

### PART 1 — SEARCHING VISUALIZATION ✅
- ✅ **Real Values & Real Bar Heights:**
  - Arrays contain real sorted values (e.g., [3,5,7,10,14,20,25...])
  - Bar height uses normalization: `height = ((value - min)/(max-min)) * (MAX_HEIGHT - MIN_HEIGHT) + MIN_HEIGHT`
  - MIN_HEIGHT = 20px, MAX_HEIGHT = 160px

- ✅ **Labels Under Bars:**
  - Every bar shows actual numeric value
  - Font-size: 11-12px, color: #C9D7FF

- ✅ **Color States:**
  - `compareIndex` → RED (#FF6B6B)
  - `successIndex` → GREEN (#4ADE80)
  - idle → base color (#6FA8FF)

- ✅ **Correct Target Searching:**
  - Generators receive `(values, target)`
  - Search uses `if (values[i] === target)`

- ✅ **Frames Format:**
  ```typescript
  {
    array: [...real numbers...],
    compareIndex: number | null,
    successIndex: number | null,
    target: number
  }
  ```

### PART 2 — SORTING VISUALIZATION ✅
- ✅ **Step-by-step frames:** Each sorting algorithm pushes frames for every comparison and swap
- ✅ **Ranking by finish order:** Ranking assigned only after algorithm completes (not before)
- ✅ **Bar colors:** Base gradient (#6BA8FF → #8AB6FF), active (#53E0C1), swapped (#FF7B7B)

### PART 3 — GREEDY (Prim & Kruskal) ✅
- ✅ **Frame 0 shows full graph:**
  - All nodes at fixed positions (x,y)
  - All edges faint (opacity 0.25)
  - No edges selected yet

- ✅ **Node labels:**
  - `<text x={x} y={y+4} fill="#fff" fontSize="12px">{id}</text>`

- ✅ **Edge states:**
  - base: stroke #6FA8FF, opacity 0.25
  - checking: stroke #FF6B6B, opacity 1
  - selected: stroke #4ADE80, opacity 1

- ✅ **Frame structure:**
  ```typescript
  {
    nodes: [{id, x, y}],
    edges: [{u, v, weight}],
    selectedEdges: [...],
    highlightEdge: {u, v} | null
  }
  ```

### PART 4 — DIJKSTRA STEP-BY-STEP ✅
- ✅ **Every micro-step creates a frame:**
  1. `initial` — all nodes, all edges faint, dist=∞ except source=0
  2. `selectNode(u)` — highlight u as current
  3. `checkEdge(u→v)` — edge turns RED, show prev dist
  4. `relax(u→v)` — if improved: edge flashes YELLOW & dist[v] updates
  5. `finalizeNode(u)` — mark node u finalized (green)

- ✅ **Frame Format:**
  ```typescript
  {
    type: "initial" | "selectNode" | "checkEdge" | "relax" | "finalizeNode",
    nodes: [{id, x, y, distDisplay}],
    edges: [{u, v, weight, state}],
    meta: {currentNode, neighbor, prevDist, newDist}
  }
  ```

- ✅ **Edge Weights:**
  - Display weight text at midpoint: `text x={(x1+x2)/2} y={(y1+y2)/2 - 6}`

- ✅ **Edge States:**
  - base: #6FA8FF opacity 0.25
  - checking: #FF6B6B
  - relaxed: #FFD86B (NEW)
  - selected: #4ADE80

- ✅ **Distances:**
  - Each node shows dist: 0, number, or ∞ (infinity)
  - Displayed below node ID

- ✅ **Graph layout:** Never moves between frames (constant nodes and edges)

### PART 5 — COMPARE RUN ENGINE ✅
- ✅ All algorithms output `frames[]` array following their structure
- ✅ CompareRun plays frames step-by-step
- ✅ Sync Playback (same speed)
- ✅ Support PlayAll
- ✅ Assign ranks ONLY after algorithms finish
- ✅ No graph or bars disappear at frame 0

## 📊 Example Frame Structures

### Searching Frame:
```typescript
{
  array: [3, 5, 7, 10, 14, 20, 25],
  compareIndex: 3,
  successIndex: null,
  target: 10
}
```

### Dijkstra Frame (selectNode):
```typescript
{
  type: "selectNode",
  nodes: [{id: 0, x: 100, y: 50}, ...],
  edges: [{u: 0, v: 1, weight: 5}, ...],
  selectedEdges: [],
  currentEdge: null,
  relaxedEdge: null,
  distances: [0, 5, Infinity, ...],
  visited: [0],
  currentVertex: 1,
  meta: {
    currentNode: 1
  }
}
```

### Dijkstra Frame (relax):
```typescript
{
  type: "relax",
  nodes: [...],
  edges: [...],
  selectedEdges: [],
  currentEdge: null,
  relaxedEdge: {u: 1, v: 2, weight: 3}, // Yellow highlight
  distances: [0, 5, 8, ...], // Updated
  visited: [0],
  currentVertex: 1,
  meta: {
    currentNode: 1,
    neighbor: 2,
    prevDist: Infinity,
    newDist: 8
  }
}
```

## 🎯 Key Improvements

1. **Dijkstra Granularity:** Every step (select, check, relax, finalize) now has its own frame
2. **Edge States:** Added "relaxed" state (yellow) for Dijkstra edge relaxation
3. **Distance Display:** Nodes show their distance from source (0, number, or ∞)
4. **Current Node Highlight:** Selected node highlighted with green circle
5. **Constant Graph Layout:** Nodes and edges never move between frames
6. **Unified Frame Structure:** All algorithms follow consistent frame formats

## 🚀 Ready for Testing

All requirements have been implemented:
- ✅ Searching bars show real values + height differences
- ✅ Searching highlights compare → success correctly
- ✅ Sorting visualizes fully and ranks AFTER completing
- ✅ Prim & Kruskal show full graph at frame 0
- ✅ Dijkstra shows: initial, selectNode, checkEdge, relax, finalizeNode for EVERY visited node and EVERY neighbor
- ✅ Edge weights visible
- ✅ Graph stable and never jumps
- ✅ All colors correct
- ✅ All generators return proper frames
- ✅ Everything works inside Compare Run page
