interface TreeFrame {
  type: 'split' | 'merge' | 'partition' | 'final';
  depth: number;
  l: number;
  r: number;
  arraySlice: number[];
  pivotIndex?: number;
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
  const seenNodes = new Set<string>();
  frames.forEach((frame, idx) => {
    if (frame.treeFrame) {
      const key = `${frame.treeFrame.depth}-${frame.treeFrame.l}-${frame.treeFrame.r}`;
      if (!seenNodes.has(key)) {
        seenNodes.add(key);
        treeNodes.push({
          treeFrame: frame.treeFrame,
          isActive: idx === currentFrameIndex
        });
      } else if (idx === currentFrameIndex) {
        // Update active state for existing node
        const existingNode = treeNodes.find(n => 
          n.treeFrame.depth === frame.treeFrame!.depth &&
          n.treeFrame.l === frame.treeFrame!.l &&
          n.treeFrame.r === frame.treeFrame!.r
        );
        if (existingNode) {
          existingNode.isActive = true;
        }
      }
    }
  });

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
    const { arraySlice, type, pivotIndex } = node.treeFrame;
    const maxValue = Math.max(...arraySlice, 1);
    const isActive = node.isActive;

    return (
      <div 
        key={`node-${node.treeFrame.depth}-${node.treeFrame.l}-${node.treeFrame.r}`}
        className={`
          bg-card rounded-lg p-3 border-2 transition-all duration-300
          ${isActive && type === 'split' ? 'border-primary shadow-lg shadow-primary/30 ring-2 ring-primary/20' : 'border-border/50'}
          ${isActive && (type === 'merge' || type === 'partition') ? 'border-success shadow-lg shadow-success/30 ring-2 ring-success/20' : ''}
          ${isActive && type === 'final' ? 'border-accent shadow-lg shadow-accent/30 ring-2 ring-accent/20' : ''}
          ${!isActive ? 'opacity-60' : 'opacity-100'}
        `}
      >
        <div className="text-[10px] text-muted-foreground mb-1 font-mono">
          [{node.treeFrame.l}..{node.treeFrame.r}]
        </div>
        <div className="flex items-end justify-center gap-0.5 h-12">
          {arraySlice.map((value, index) => {
            const isPivot = pivotIndex !== undefined && index === arraySlice.length - 1;
            return (
              <div
                key={`node-bar-${node.treeFrame.depth}-${node.treeFrame.l}-${index}`}
                className="flex flex-col items-center justify-end gap-0.5 flex-1 max-w-[24px] min-w-[8px]"
                style={{ height: '100%' }}
              >
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isPivot ? 'bg-primary shadow-sm' : 'bg-info'
                  }`}
                  style={{
                    height: `${(value / maxValue) * 80}%`,
                    minHeight: '4px'
                  }}
                />
                <div className="text-[8px] text-muted-foreground font-mono">
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
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Divide & Conquer Tree</h3>
        <div className="text-sm text-muted-foreground">
          Full recursion tree (active node highlighted)
        </div>
      </div>

      <div className="bg-background/50 rounded-lg p-4 border border-border/50 max-h-[600px] overflow-y-auto">
        <div className="space-y-6">
          {Array.from({ length: maxDepth + 1 }).map(depth => {
            const depthNum = typeof depth === 'number' ? depth : Array.from({ length: maxDepth + 1 }).indexOf(depth);
            const nodesAtDepth = nodesByDepth[depthNum] || [];
            
            if (nodesAtDepth.length === 0) return null;
            
            return (
              <div key={`depth-${depthNum}`} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: depthNum + 1 }).map((_, i) => (
                      <div
                        key={`depth-indicator-${depthNum}-${i}`}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i === depthNum ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Depth {depthNum}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {nodesAtDepth.map(node => renderNode(node))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary" />
          <span className="text-muted-foreground">Split</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-success" />
          <span className="text-muted-foreground">Merge/Partition</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-accent" />
          <span className="text-muted-foreground">Complete</span>
        </div>
      </div>
    </div>
  );
};
