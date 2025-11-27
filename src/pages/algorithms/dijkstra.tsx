import { useNavigate } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dijkstra = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <Button
          onClick={() => navigate("/algorithms")}
          variant="ghost"
          className="mb-4 hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Algorithms
        </Button>

        <div className="text-center py-20">
          <Construction className="w-16 h-16 mx-auto mb-6 text-warning" />
          <h1 className="text-4xl font-bold mb-4">Dijkstra's Algorithm Visualizer</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find shortest path from source to all vertices
          </p>
          <div className="bg-card rounded-xl p-8 border border-border max-w-2xl mx-auto">
            <p className="text-muted-foreground mb-4">
              This visualizer is currently under development. Dijkstra's Algorithm implementation coming soon!
            </p>
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Time Complexity:</strong> O((V+E) log V) with priority queue</p>
              <p><strong>Use Case:</strong> Shortest path in weighted graphs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dijkstra;
