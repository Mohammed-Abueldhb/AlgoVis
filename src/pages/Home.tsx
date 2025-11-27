import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Eye, Trophy } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-gradient-primary">Algorithm</span>{" "}
            <span className="text-foreground">Visualizer</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Explore, understand, and master algorithms through beautiful interactive visualizations
          </p>

          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Button
              onClick={() => navigate("/algorithms")}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-lg px-8"
            >
              Explore Algorithms
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button
              onClick={() => navigate("/compare")}
              variant="outline"
              size="lg"
              className="text-lg px-8 border-accent/30 hover:border-accent hover:bg-accent/10"
            >
              Compare Algorithms
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
            <div className="bg-card rounded-xl p-6 border border-border hover-lift">
              <div className="text-4xl font-bold text-gradient-primary mb-2">13+</div>
              <div className="text-muted-foreground">Algorithms</div>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border hover-lift">
              <div className="text-4xl font-bold text-gradient-accent mb-2">4</div>
              <div className="text-muted-foreground">Categories</div>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border hover-lift">
              <div className="text-4xl font-bold text-cyan mb-2">∞</div>
              <div className="text-muted-foreground">Learning</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4 animate-slide-up">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Eye className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Visual Learning</h3>
            <p className="text-muted-foreground">
              Watch algorithms come to life with step-by-step animations and color-coded operations
            </p>
          </div>

          <div className="text-center space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
              <Zap className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold">Interactive Controls</h3>
            <p className="text-muted-foreground">
              Control speed, array size, and step through each operation at your own pace
            </p>
          </div>

          <div className="text-center space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-xl font-semibold">Compare & Learn</h3>
            <p className="text-muted-foreground">
              Race algorithms side-by-side to understand performance differences
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto bg-card rounded-2xl p-12 border border-border glow-on-hover">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-muted-foreground mb-8">
            Dive into the world of algorithms with our interactive visualizations
          </p>
          <Button
            onClick={() => navigate("/algorithms")}
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
