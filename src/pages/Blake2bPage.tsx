import { useState } from "react";
import { ArrowLeft, Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Blake2bPage = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [currentRound, setCurrentRound] = useState(0);
  const [inputText, setInputText] = useState("Hello BLAKE2b!");

  const totalRounds = 12;

  // Placeholder visualization state
  const h = Array(8).fill(0).map((_, i) => `h[${i}]`);
  const m = Array(16).fill(0).map((_, i) => `m[${i}]`);
  const v = Array(16).fill(0).map((_, i) => `v[${i}]`);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="mb-4 hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold mb-2">BLAKE2b Cryptographic Hash</h1>
          <p className="text-muted-foreground">
            Interactive visualization of the BLAKE2b hashing algorithm
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Main Visualizer */}
          <div className="space-y-6">
            {/* Input */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <Label className="mb-2 block">Input Message</Label>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to hash..."
                className="bg-input border-border font-mono"
                rows={3}
              />
              <Button className="mt-3 bg-primary hover:bg-primary/90" size="sm">
                Hash Message
              </Button>
            </div>

            {/* State Visualization */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Round {currentRound} / {totalRounds}</h3>
              
              <div className="space-y-6">
                {/* State vector v[0..15] */}
                <div>
                  <div className="text-sm text-muted-foreground mb-2">State Vector (v)</div>
                  <div className="grid grid-cols-4 gap-2">
                    {v.map((val, i) => (
                      <div
                        key={i}
                        className="bg-accent/10 rounded p-2 text-center font-mono text-sm border border-accent/30"
                      >
                        {val}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message block m[0..15] */}
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Message Block (m)</div>
                  <div className="grid grid-cols-8 gap-2">
                    {m.map((val, i) => (
                      <div
                        key={i}
                        className="bg-primary/10 rounded p-2 text-center font-mono text-xs border border-primary/30"
                      >
                        {val}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hash state h[0..7] */}
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Hash State (h)</div>
                  <div className="grid grid-cols-4 gap-2">
                    {h.map((val, i) => (
                      <div
                        key={i}
                        className="bg-cyan/10 rounded p-2 text-center font-mono text-sm border border-cyan/30"
                      >
                        {val}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-muted/30 rounded-xl p-6 border border-border">
              <h4 className="font-semibold mb-2">About BLAKE2b</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                BLAKE2b is a cryptographic hash function faster than MD5, SHA-1, SHA-2, and SHA-3, 
                yet is at least as secure as SHA-3. It processes data in 128-byte blocks using 12 
                rounds of mixing operations.
              </p>
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border space-y-6">
              <h3 className="font-semibold">Controls</h3>
              
              {/* Playback */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={() => setCurrentRound(Math.max(0, currentRound - 1))}
                  variant="outline"
                  size="icon"
                  disabled={currentRound === 0}
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  size="icon"
                  className="w-12 h-12 bg-primary"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                
                <Button
                  onClick={() => setCurrentRound(Math.min(totalRounds, currentRound + 1))}
                  variant="outline"
                  size="icon"
                  disabled={currentRound >= totalRounds}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              {/* Speed */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Speed (ms)</Label>
                  <span className="text-sm text-muted-foreground">{speed}</span>
                </div>
                <Slider
                  value={[speed]}
                  onValueChange={([value]) => setSpeed(value)}
                  min={100}
                  max={2000}
                  step={100}
                  className="[&_[role=slider]]:bg-accent"
                />
              </div>

              <div className="pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Current Round: {currentRound} / {totalRounds}
                </div>
              </div>
            </div>

            {/* Sample Inputs */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h4 className="font-semibold mb-3">Sample Inputs</h4>
              <div className="space-y-2">
                {["Hello World", "BLAKE2b", "Cryptography"].map((sample) => (
                  <Button
                    key={sample}
                    onClick={() => setInputText(sample)}
                    variant="outline"
                    className="w-full justify-start font-mono text-sm"
                    size="sm"
                  >
                    {sample}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blake2bPage;
