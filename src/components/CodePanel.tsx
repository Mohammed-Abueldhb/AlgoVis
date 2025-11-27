import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";

interface CodePanelProps {
  code: string;
  language?: string;
  title?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export const CodePanel = ({ 
  code, 
  language = "typescript", 
  title = "Implementation",
  collapsible = false,
  defaultOpen = true 
}: CodePanelProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {collapsible ? (
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="ghost"
          className="w-full justify-between p-4 hover:bg-muted/50"
        >
          <span className="font-semibold">{title}</span>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </Button>
      ) : (
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">{title}</h3>
        </div>
      )}
      
      {(!collapsible || isOpen) && (
        <div className="p-4 overflow-x-auto">
          <pre className="font-mono text-sm leading-relaxed">
            <code className="text-foreground">{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
