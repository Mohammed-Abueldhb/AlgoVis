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
      <h4 className="font-medium mb-2.5 text-sm text-muted-foreground">Graph Legend</h4>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full border"
            style={{
              backgroundColor: "#ef4444",
              borderColor: "#dc2626",
            }}
          />
          <span className="text-muted-foreground">Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-0.5 rounded"
            style={{
              backgroundColor: "#22c55e",
            }}
          />
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-0.5 rounded"
            style={{
              backgroundColor: "#f59e0b",
            }}
          />
          <span className="text-muted-foreground">Considering</span>
        </div>
      </div>
    </div>
  );
};

export default GraphLegend;

