import { useNavigate } from "react-router-dom";
import { Code, Play } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface AlgorithmCardProps {
  name: string;
  description: string;
  slug: string;
  icon?: React.ReactNode;
  category?: string;
}

export const AlgorithmCard = ({ name, description, slug, icon, category }: AlgorithmCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-xl p-6 hover-lift glow-on-hover border border-border group">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
          {icon || <div className="w-6 h-6 bg-accent/50 rounded" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold mb-1 text-foreground truncate">{name}</h3>
          {category && (
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{category}</span>
          )}
        </div>
      </div>
      
      <p className="text-muted-foreground mb-6 line-clamp-2 min-h-[3rem]">{description}</p>
      
      <div className="flex gap-3">
        <Button
          onClick={() => navigate(`/algorithms/${slug}`)}
          className="flex-1 bg-primary hover:bg-primary/90"
          size="sm"
        >
          <Play className="w-4 h-4 mr-2" />
          Visualize
        </Button>
        <Button
          onClick={() => navigate(`/algorithms/${slug}#code`)}
          variant="outline"
          className="border-accent/30 hover:border-accent hover:bg-accent/10"
          size="sm"
        >
          <Code className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
