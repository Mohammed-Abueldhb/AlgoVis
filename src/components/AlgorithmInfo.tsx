import { Info } from "lucide-react";

interface Complexity {
  best: string;
  avg: string;
  worst: string;
}

interface AlgorithmInfoProps {
  name: string;
  description: string;
  complexity: Complexity;
  notes?: string;
}

export const AlgorithmInfo = ({
  name,
  description,
  complexity,
  notes,
}: AlgorithmInfoProps) => {
  return (
    <div className="w-full bg-card rounded-xl p-6 border border-border mb-6">
      <div className="flex items-start gap-3 mb-4">
        <Info className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">{name}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {description}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-background/50 p-3 rounded-lg border border-border/50">
              <div className="text-muted-foreground mb-1">Best Case</div>
              <div className="font-mono font-bold text-success">{complexity.best}</div>
            </div>
            <div className="bg-background/50 p-3 rounded-lg border border-border/50">
              <div className="text-muted-foreground mb-1">Average</div>
              <div className="font-mono font-bold text-info">{complexity.avg}</div>
            </div>
            <div className="bg-background/50 p-3 rounded-lg border border-border/50">
              <div className="text-muted-foreground mb-1">Worst Case</div>
              <div className="font-mono font-bold text-warning">{complexity.worst}</div>
            </div>
          </div>
          {notes && (
            <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
              {notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
