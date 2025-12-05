interface MatrixViewerProps {
  matrix: number[][];
  k: number;
  highlight?: { i?: number; j?: number };
  currentSnapshot?: number;
  totalSnapshots?: number;
}

export const MatrixViewer = ({ 
  matrix, 
  k, 
  highlight,
  currentSnapshot,
  totalSnapshots 
}: MatrixViewerProps) => {
  const formatValue = (value: number): string => {
    if (!Number.isFinite(value)) return '∞';
    if (value >= 1e6) return value.toExponential(2);
    if (value >= 1000) return value.toLocaleString();
    return String(value);
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Distance Matrix</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            Iteration k = {k === -1 ? "Initial" : k === matrix.length ? "Final" : k}
          </span>
          {currentSnapshot !== undefined && totalSnapshots !== undefined && (
            <span>
              Matrix {currentSnapshot} / {totalSnapshots}
            </span>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-2 text-sm"
          style={{ gridTemplateColumns: `repeat(${matrix.length + 1}, minmax(60px, 1fr))` }}
        >
          {/* Header row */}
          <div className="font-bold text-center p-2 border-b border-border"></div>
          {matrix.map((_, colIndex) => (
            <div key={`header-${colIndex}`} className="font-bold text-center p-2 border-b border-border">
              {colIndex}
            </div>
          ))}

          {/* Matrix rows */}
          {matrix.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="contents">
              <div className={`font-bold text-center p-2 border-r border-border ${
                k === rowIndex && k >= 0 ? 'bg-accent/20' : ''
              }`}>
                {rowIndex}
              </div>
              {row.map((value, colIndex) => {
                const isKRow = k === rowIndex && k >= 0;
                const isKCol = k === colIndex && k >= 0;
                const isUpdated = highlight?.i === rowIndex && highlight?.j === colIndex;
                
                return (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={`p-3 text-center border border-border rounded font-mono transition-colors ${
                      isUpdated ? 'bg-success/30 border-success border-2' :
                      isKRow || isKCol ? 'bg-accent/10' : 'bg-background'
                    }`}
                  >
                    {formatValue(value)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border">
        <h4 className="font-semibold mb-2 text-sm">Legend</h4>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-accent/10 border border-border rounded"></div>
            <span>Current k row/column</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-success/30 border-2 border-success rounded"></div>
            <span>Updated cell</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatrixViewer;

