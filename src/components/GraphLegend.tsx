interface GraphLegendProps {
  theme?: "greedy" | "dp";
}

export const GraphLegend = ({ theme = "greedy" }: GraphLegendProps) => {
  const isDPTheme = theme === "dp";

  if (!isDPTheme) {
    return null; // Greedy theme doesn't need this legend
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <h4 className="font-semibold mb-3 text-sm">Graph Legend</h4>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-3">
          <div 
            className="w-5 h-5 rounded-full border-2"
            style={{
              backgroundColor: "#ef4444",
              borderColor: "#dc2626",
              filter: "drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))"
            }}
          />
          <span className="text-muted-foreground">Visited</span>
        </div>
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-1 rounded"
            style={{
              backgroundColor: "#22c55e",
              filter: "drop-shadow(0 0 2px rgba(34, 197, 94, 0.5))"
            }}
          />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-1 rounded"
            style={{
              backgroundColor: "#f59e0b",
              filter: "drop-shadow(0 0 2px rgba(245, 158, 11, 0.5))"
            }}
          />
          <span className="text-muted-foreground">Considering</span>
        </div>
      </div>
    </div>
  );
};

export default GraphLegend;

