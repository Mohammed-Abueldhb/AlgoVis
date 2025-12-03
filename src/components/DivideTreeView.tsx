import { useMemo } from "react";

interface TreeFrame {
  type: 'split' | 'merge' | 'partition' | 'final';
  depth: number;
  l: number;
  r: number;
  arraySlice: number[];
  pivotIndex?: number;
  pivotValue?: number;
}

interface Frame {
  array: number[];
  highlights?: { indices: number[]; type: 'compare' | 'swap' | 'pivot' | 'mark' }[];
  labels?: { title?: string; detail?: string };
  meta?: any;
  treeFrame?: TreeFrame;
}

interface TreeNode {
  range: [number, number];
  values: number[];
  type: TreeFrame['type'];
  depth: number;
  pivotIndex?: number;
  pivotValue?: number;
  frameIndex: number;
}

interface TreeLevel {
  depth: number;
  nodes: TreeNode[];
}

interface DivideTreeViewProps {
  frames: Frame[];
  currentFrameIndex: number;
}

// Build tree snapshot from frames up to currentIndex (progressive reveal)
function buildTreeSnapshot(frames: Frame[], maxIndex: number): TreeLevel[] {
  const nodeMap = new Map<string, TreeNode>();
  
  // Only process frames up to maxIndex for progressive reveal
  for (let i = 0; i <= maxIndex && i < frames.length; i++) {
    const frame = frames[i];
    if (!frame.treeFrame) continue;
    
    const { depth, l, r, arraySlice, type, pivotIndex, pivotValue } = frame.treeFrame;
    const key = `${depth}-${l}-${r}`;
    
    // Update or add node
    nodeMap.set(key, {
      range: [l, r],
      values: arraySlice,
      type,
      depth,
      pivotIndex,
      pivotValue,
      frameIndex: i,
    });
  }
  
  // Group by depth
  const levels: TreeLevel[] = [];
  const maxDepth = Math.max(...Array.from(nodeMap.values()).map(n => n.depth), 0);
  
  for (let d = 0; d <= maxDepth; d++) {
    const nodesAtDepth = Array.from(nodeMap.values())
      .filter(n => n.depth === d)
      .sort((a, b) => a.range[0] - b.range[0]);
    
    if (nodesAtDepth.length > 0) {
      levels.push({ depth: d, nodes: nodesAtDepth });
    }
  }
  
  return levels;
}

export const DivideTreeView = ({ frames, currentFrameIndex }: DivideTreeViewProps) => {
  // Build tree progressively based on currentFrameIndex
  const tree = useMemo(
    () => buildTreeSnapshot(frames, currentFrameIndex),
    [frames, currentFrameIndex]
  );
  
  // Get current active node info
  const currentFrame = frames[currentFrameIndex];
  const activeKey = currentFrame?.treeFrame
    ? `${currentFrame.treeFrame.depth}-${currentFrame.treeFrame.l}-${currentFrame.treeFrame.r}`
    : null;
  
  if (tree.length === 0) {
    return (
      <div className="bg-card/50 rounded-xl p-6 border-2 border-border/70 text-center">
        <p className="text-muted-foreground">Press Play to start visualization</p>
      </div>
    );
  }

  const renderNode = (node: TreeNode, isActive: boolean) => {
    const { values, type, pivotIndex, pivotValue, range } = node;
    const maxValue = Math.max(...values, 1);

    return (
      <div 
        key={`node-${node.depth}-${range[0]}-${range[1]}`}
        className={`
          bg-card rounded-lg p-3 border-2 transition-all duration-300
          ${isActive && type === 'split' ? 'border-primary shadow-lg shadow-primary/30 ring-2 ring-primary/20 scale-105' : ''}
          ${isActive && (type === 'merge' || type === 'partition') ? 'border-success shadow-lg shadow-success/30 ring-2 ring-success/20 scale-105' : ''}
          ${isActive && type === 'final' ? 'border-accent shadow-lg shadow-accent/30 ring-2 ring-accent/20 scale-105' : ''}
          ${!isActive ? 'border-border/50 opacity-80 hover:opacity-100' : 'opacity-100'}
        `}
      >
        <div className="text-[10px] text-muted-foreground mb-1 font-mono flex items-center justify-between">
          <span>[{range[0]}..{range[1]}]</span>
          {pivotValue !== undefined && (
            <span className="text-primary font-semibold">P:{pivotValue}</span>
          )}
        </div>
        <div className="flex items-end justify-center gap-0.5 h-16">
          {values.map((value, index) => {
            const isPivot = pivotIndex !== undefined && index === pivotIndex;
            const barHeight = (value / maxValue) * 85;
            
            return (
              <div
                key={`node-bar-${node.depth}-${range[0]}-${index}`}
                className="flex flex-col items-center justify-end gap-0.5 flex-1 max-w-[28px] min-w-[12px]"
                style={{ height: '100%' }}
              >
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isPivot 
                      ? 'bg-gradient-to-t from-primary to-primary/70 shadow-md shadow-primary/40' 
                      : type === 'merge' 
                        ? 'bg-gradient-to-t from-success to-success/70'
                        : type === 'final'
                          ? 'bg-gradient-to-t from-accent to-accent/70'
                          : 'bg-gradient-to-t from-info to-info/70'
                  }`}
                  style={{
                    height: `${barHeight}%`,
                    minHeight: '8px'
                  }}
                />
                <div className={`text-[9px] font-mono font-semibold ${
                  isPivot ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card/50 rounded-xl p-6 border-2 border-border/70 backdrop-blur-sm">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold mb-2 text-foreground">Recursion Tree Visualization</h3>
        <div className="text-sm text-muted-foreground">
          Progressive divide-and-conquer decomposition • Active node highlighted
        </div>
      </div>

      <div className="bg-background/60 rounded-lg p-6 border border-border/50 max-h-[700px] overflow-y-auto">
        <div className="space-y-8">
          {tree.map((level) => {
            return (
              <div key={`depth-${level.depth}`} className="space-y-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: level.depth + 1 }).map((_, i) => (
                      <div
                        key={`depth-indicator-${level.depth}-${i}`}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          i === level.depth ? 'bg-primary scale-125 shadow-sm shadow-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    Level {level.depth}
                  </span>
                  <div className="flex-1 h-px bg-border/30" />
                  <span className="text-xs text-muted-foreground">
                    {level.nodes.length} {level.nodes.length === 1 ? 'node' : 'nodes'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                  {level.nodes.map(node => {
                    const nodeKey = `${node.depth}-${node.range[0]}-${node.range[1]}`;
                    const isActive = nodeKey === activeKey;
                    return renderNode(node, isActive);
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-border/50 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-t from-primary to-primary/70 shadow-sm" />
          <span className="text-muted-foreground font-medium">Split / Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-t from-success to-success/70 shadow-sm" />
          <span className="text-muted-foreground font-medium">Merge / Partition</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-t from-accent to-accent/70 shadow-sm" />
          <span className="text-muted-foreground font-medium">Complete</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-t from-info to-info/70 shadow-sm" />
          <span className="text-muted-foreground font-medium">Unsorted</span>
        </div>
      </div>
    </div>
  );
};
