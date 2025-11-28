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

interface DivideTreeViewProps {
  frame: Frame;
}

export const DivideTreeView = ({ frame }: DivideTreeViewProps) => {
  const treeFrame = frame.treeFrame;
  
  if (!treeFrame) {
    return null;
  }

  const { depth, arraySlice, type, pivotIndex } = treeFrame;
  const maxValue = Math.max(...arraySlice, 1);

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Divide & Conquer Tree</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Depth: {depth}</span>
          <span>Type: <span className="font-mono text-accent">{type}</span></span>
          <span>Range: [{treeFrame.l}..{treeFrame.r}]</span>
        </div>
      </div>

      <div className="bg-background/50 rounded-lg p-4 border border-border/50">
        <div className="flex items-center justify-center gap-2 min-h-[120px]">
          {/* Depth indicator */}
          <div className="flex flex-col items-center justify-center mr-4">
            {Array.from({ length: depth + 1 }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full mb-2 ${
                  i === depth ? 'bg-primary scale-150' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Array segment visualization */}
          <div className={`
            bg-card rounded-lg p-4 border-2 transition-all duration-300
            ${type === 'split' ? 'border-primary shadow-lg shadow-primary/20' : ''}
            ${(type === 'merge' || type === 'partition') ? 'border-success shadow-lg shadow-success/20' : ''}
            ${type === 'final' ? 'border-accent shadow-lg shadow-accent/20' : ''}
          `}>
            <div className="flex items-end justify-center gap-1 h-20">
              {arraySlice.map((value, index) => {
                const isPivot = pivotIndex !== undefined && index === arraySlice.length - 1;
                return (
                  <div
                    key={`tree-bar-${index}`}
                    className="flex flex-col items-center justify-end gap-1 flex-1 max-w-[40px] min-w-[16px]"
                    style={{ height: '100%' }}
                  >
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        isPivot ? 'bg-primary shadow-lg' : 'bg-info'
                      }`}
                      style={{
                        height: `${(value / maxValue) * 80}%`,
                        minHeight: '6px'
                      }}
                    />
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Type indicator */}
        <div className="mt-4 text-center">
          {type === 'split' && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Dividing segment</span>
            </div>
          )}
          {((type === 'merge') || (type === 'partition')) && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-muted-foreground">
                {type === 'merge' ? 'Merging segments' : 'Partitioning around pivot'}
              </span>
            </div>
          )}
          {type === 'final' && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-muted-foreground">Complete</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
