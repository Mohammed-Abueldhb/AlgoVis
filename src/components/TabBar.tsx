import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const TabBar = ({ tabs, activeTab, onTabChange, className }: TabBarProps) => {
  return (
    <div className={cn("flex justify-center gap-2 flex-wrap mb-8", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-6 py-3 rounded-full font-medium transition-all duration-300",
            "hover:scale-105",
            activeTab === tab.id
              ? "bg-primary text-primary-foreground shadow-lg"
              : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
