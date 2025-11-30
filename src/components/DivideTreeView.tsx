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
  treeFrame: TreeFrame;
  isActive: boolean;
  frameIndex: number;
}

interface DivideTreeViewProps {
  frames: Frame[];
  currentFrameIndex: number;
}

export const DivideTreeView = ({ frames, currentFrameIndex }: DivideTreeViewProps) => {
  // Build complete tree structure from all frames
  const treeNodes: TreeNode[] = [];
  const maxDepth = Math.max(...frames.filter(f => f.treeFrame).map(f => f.treeFrame!.depth), 0);
  
  // Collect all unique tree frames
  const seenNodes = new Map<string, TreeNode>();
  
  frames.forEach((frame, idx) => {
    if (frame.treeFrame) {
      const key = `${frame.treeFrame.depth}-${frame.treeFrame.l}-${frame.treeFrame.r}`;
      
      if (!seenNodes.has(key)) {
        // New node
        const node: TreeNode = {
          treeFrame: frame.treeFrame,
          isActive: idx === currentFrameIndex,
          frameIndex: idx
        };
        seenNodes.set(key, node);
        treeNodes.push(node);
      } else {
        // Update existing node
        const existingNode = seenNodes.get(key)!;
        if (idx === currentFrameIndex) {
          existingNode.isActive = true;
        }
      }
    }
  });

  // Reset all isActive flags first
  treeNodes.forEach(node => node.isActive = false);
  
  // Set active based on current frame
  const currentFrame = frames[currentFrameIndex];
  if (currentFrame?.treeFrame) {
    const key = `${currentFrame.treeFrame.depth}-${currentFrame.treeFrame.l}-${currentFrame.treeFrame.r}`;
    const node = seenNodes.get(key);
    if (node) {
      node.isActive = true;
    }
  }

  if (treeNodes.length === 0) {
    return null;
  }

  // Group nodes by depth
  const nodesByDepth: { [depth: number]: TreeNode[] } = {};
  treeNodes.forEach(node => {
    if (!nodesByDepth[node.treeFrame.depth]) {
      nodesByDepth[node.treeFrame.depth] = [];
    }
    nodesByDepth[node.treeFrame.depth].push(node);
  });

  // Sort nodes at each depth by left index
  Object.keys(nodesByDepth).forEach(depth => {
    nodesByDepth[parseInt(depth)].sort((a, b) => a.treeFrame.l - b.treeFrame.l);
  });

  const renderNode = (node: TreeNode) => {
    const { arraySlice, type, pivotIndex, pivotValue } = node.treeFrame;
    const maxValue = Math.max(...arraySlice, 1);
    const isActive = node.isActive;

    return (
      <div 
        key={`node-${node.treeFrame.depth}-${node.treeFrame.l}-${node.treeFrame.r}`}
        className={`
          bg-card rounded-lg p-3 border-2 transition-all duration-300
          ${isActive && type === 'split' ? 'border-primary shadow-lg shadow-primary/30 ring-2 ring-primary/20 scale-105' : 'border-border/50'}
          ${isActive && (type === 'merge' || type === 'partition') ? 'border-success shadow-lg shadow-success/30 ring-2 ring-success/20 scale-105' : ''}
          ${isActive && type === 'final' ? 'border-accent shadow-lg shadow-accent/30 ring-2 ring-accent/20 scale-105' : ''}
          ${!isActive ? 'opacity-70 hover:opacity-90' : 'opacity-100'}
        `}
      >
        <div className="text-[10px] text-muted-foreground mb-1 font-mono flex items-center justify-between">
          <span>[{node.treeFrame.l}..{node.treeFrame.r}]</span>
          {pivotValue !== undefined && (
            <span className="text-primary font-semibold">P:{pivotValue}</span>
          )}
        </div>
        <div className="flex items-end justify-center gap-0.5 h-16">
          {arraySlice.map((value, index) => {
            const isPivot = pivotIndex !== undefined && index === pivotIndex;
            const barHeight = (value / maxValue) * 85;
            
            return (
              <div
                key={`node-bar-${node.treeFrame.depth}-${node.treeFrame.l}-${index}`}
                className="flex flex-col items-center justify-end gap-0.5 flex-1 max-w-[28px] min-w-[12px]"
                style={{ height: '100%' }}
              >
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isPivot 
                      ? 'bg-gradient-to-t from-primary to-primary/70 shadow-md shadow-primary/40' 
                      : type === 'merge' 
                        ? 'bg-gradient-to-t from-success to-success/70'
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
          Complete divide-and-conquer decomposition • Active node highlighted
        </div>
      </div>

      <div className="bg-background/60 rounded-lg p-6 border border-border/50 max-h-[700px] overflow-y-auto">
        <div className="space-y-8">
          {Array.from({ length: maxDepth + 1 }).map((_, depthNum) => {
            const nodesAtDepth = nodesByDepth[depthNum] || [];
            
            if (nodesAtDepth.length === 0) return null;
            
            return (
              <div key={`depth-${depthNum}`} className="space-y-3">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: depthNum + 1 }).map((_, i) => (
                      <div
                        key={`depth-indicator-${depthNum}-${i}`}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          i === depthNum ? 'bg-primary scale-125 shadow-sm shadow-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    Level {depthNum}
                  </span>
                  <div className="flex-1 h-px bg-border/30" />
                  <span className="text-xs text-muted-foreground">
                    {nodesAtDepth.length} {nodesAtDepth.length === 1 ? 'node' : 'nodes'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                  {nodesAtDepth.map(node => renderNode(node))}
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
