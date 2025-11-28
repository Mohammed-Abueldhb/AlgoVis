# Divide & Conquer Tree Visualization

## Overview
The Divide & Conquer Tree View provides a visual representation of the recursive splitting and merging process in divide-and-conquer algorithms like Merge Sort and Quick Sort.

## Frame Structure

### Merge Sort Tree Frames
```typescript
{
  array: number[],           // Current state of entire array
  treeFrame: {
    type: 'split' | 'merge' | 'final',
    depth: number,           // Recursion depth (0 = root)
    l: number,               // Left boundary index
    r: number,               // Right boundary index
    arraySlice: number[]     // Segment being processed
  }
}
```

**Example Merge Sort Frames:**
```javascript
// Initial split
{ type: 'split', depth: 0, l: 0, r: 7, arraySlice: [38,27,43,3,9,82,10,1] }

// Deeper split
{ type: 'split', depth: 1, l: 0, r: 3, arraySlice: [38,27,43,3] }

// Merge operation
{ type: 'merge', depth: 1, l: 0, r: 3, arraySlice: [27,38,3,43] }

// Final sorted
{ type: 'final', depth: 0, l: 0, r: 7, arraySlice: [1,3,9,10,27,38,43,82] }
```

### Quick Sort Tree Frames
```typescript
{
  array: number[],
  treeFrame: {
    type: 'split' | 'partition' | 'final',
    depth: number,
    l: number,
    r: number,
    arraySlice: number[],
    pivotIndex?: number      // Index of pivot element
  }
}
```

**Example Quick Sort Frames:**
```javascript
// Partition range
{ type: 'split', depth: 0, l: 0, r: 7, arraySlice: [38,27,43,3,9,82,10,1] }

// Partitioning with pivot
{ type: 'partition', depth: 0, l: 0, r: 7, arraySlice: [38,27,43,3,9,82,10,1], pivotIndex: 7 }

// After partition, recursing left
{ type: 'split', depth: 1, l: 0, r: 3, arraySlice: [1,27,43,3] }
```

## Component Usage

### DivideTreeView Component
Located at `src/components/DivideTreeView.tsx`

**Features:**
- Displays current recursion depth with visual indicators
- Shows array segment as mini-bars
- Color-coded borders based on operation type:
  - **Blue (primary)**: Split operations
  - **Green (success)**: Merge/Partition operations
  - **Accent**: Final/Complete state
- Highlights pivot elements in Quick Sort
- Responsive design with semantic theme colors

**Integration:**
```tsx
import { DivideTreeView } from "@/components/DivideTreeView";

<DivideTreeView frame={currentFrame} />
```

## Visual Indicators

### Depth Display
- Vertical dots on the left show recursion depth
- Current depth is larger and highlighted in primary color
- Parent depths shown in muted color

### Operation Types
1. **Split** (Blue border + shadow): Array is being divided
2. **Merge/Partition** (Green border + shadow): Segments are being combined or partitioned
3. **Final** (Accent border + shadow): Algorithm complete

### Bar Colors
- **Primary (blue)**: Pivot elements in Quick Sort
- **Info (cyan)**: Regular array elements
- Mini-bars scale to fit segment size

## Performance Considerations
- Frame generation happens once during "Build Steps"
- Tree view updates via state change (no heavy computation)
- Efficiently handles arrays up to size 30
- Uses CSS transitions for smooth visual updates

## Theme Integration
All colors use semantic tokens from `src/index.css`:
- `--primary`, `--success`, `--accent`, `--info`
- `--border`, `--card`, `--muted-foreground`
- Ensures consistency across light/dark themes
