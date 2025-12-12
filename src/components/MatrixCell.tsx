import React, { memo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MatrixCellProps {
  rowIndex: number;
  colIndex: number;
  value: number;
  highlightType: "none" | "viaIK" | "viaKJ" | "current" | "updated";
  previousValue?: number | null;
}

const formatValue = (value: number): string => {
  if (!Number.isFinite(value)) return '∞';
  if (value >= 1e6) return value.toExponential(2);
  if (value >= 1000) return value.toLocaleString();
  if (Math.abs(value) < 1e-2 && value !== 0) return value.toExponential(2);
  return String(value);
};

const MatrixCell = memo(({ 
  rowIndex, 
  colIndex, 
  value, 
  highlightType,
  previousValue 
}: MatrixCellProps) => {
  const isInfinity = !Number.isFinite(value);
  
  // Determine cell styling based on highlight type
  let cellClassName = "p-3 text-center border rounded font-mono";
  
  switch (highlightType) {
    case "viaIK":
      // Color A: (i, k) - cyan/blue
      cellClassName += " border-cyan-400 dark:border-cyan-600 bg-cyan-50/50 dark:bg-cyan-950/30";
      break;
    case "viaKJ":
      // Color B: (k, j) - cyan/blue
      cellClassName += " border-cyan-400 dark:border-cyan-600 bg-cyan-50/50 dark:bg-cyan-950/30";
      break;
    case "current":
      // Color C: (i, j) - yellow (checking)
      cellClassName += " border-yellow-400 dark:border-yellow-600 bg-yellow-50/50 dark:bg-yellow-950/30";
      break;
    case "updated":
      // Color C (updated): (i, j) - green (updated)
      cellClassName += " border-green-500 dark:border-green-600 bg-green-100/70 dark:bg-green-950/40 animate-pulse";
      break;
    default:
      // No highlight - standard styling
      if (isInfinity) {
        cellClassName += " border-border bg-muted/20";
      } else {
        cellClassName += " border-border bg-background";
      }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cellClassName}
          aria-label={`Cell [${rowIndex}, ${colIndex}]: ${formatValue(value)}`}
        >
          {formatValue(value)}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1 text-xs">
          <div><span className="font-medium">Position:</span> [{rowIndex}, {colIndex}]</div>
          <div><span className="font-medium">Value:</span> {formatValue(value)}</div>
          {previousValue !== null && previousValue !== undefined && previousValue !== value && (
            <div><span className="font-medium">Previous:</span> {formatValue(previousValue)}</div>
          )}
          {isInfinity && <div className="text-muted-foreground">Unreachable (∞)</div>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}, (prevProps, nextProps) => {
  // Only re-render if value, highlight type, or previous value changed
  return (
    prevProps.value === nextProps.value &&
    prevProps.highlightType === nextProps.highlightType &&
    prevProps.previousValue === nextProps.previousValue
  );
});

MatrixCell.displayName = "MatrixCell";

export default MatrixCell;










