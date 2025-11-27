import { useState } from "react";
import { Search, ArrowUpDown, Boxes, Network } from "lucide-react";
import { TabBar } from "@/components/TabBar";
import { AlgorithmCard } from "@/components/AlgorithmCard";

const tabs = [
  { id: "searching", label: "Searching" },
  { id: "sorting", label: "Sorting" },
  { id: "divide-conquer", label: "Divide & Conquer" },
  { id: "graph", label: "Greedy & Graph" },
];

const algorithms = {
  searching: [
    { name: "Linear Search", slug: "linear-search", description: "Sequential search through array elements", icon: <Search className="w-6 h-6 text-accent" /> },
    { name: "Binary Search", slug: "binary-search", description: "Efficient search in sorted arrays using divide and conquer", icon: <Search className="w-6 h-6 text-primary" /> },
    { name: "Interpolation Search", slug: "interpolation-search", description: "Improved binary search for uniformly distributed data", icon: <Search className="w-6 h-6 text-cyan" /> },
    { name: "Exponential Search", slug: "exponential-search", description: "Search algorithm for unbounded or infinite arrays", icon: <Search className="w-6 h-6 text-warning" /> },
    { name: "Fibonacci Search", slug: "fibonacci-search", description: "Divide and conquer using Fibonacci numbers", icon: <Search className="w-6 h-6 text-success" /> },
  ],
  sorting: [
    { name: "Selection Sort", slug: "selection-sort", description: "Simple sorting by repeatedly finding minimum element", icon: <ArrowUpDown className="w-6 h-6 text-accent" /> },
    { name: "Insertion Sort", slug: "insertion-sort", description: "Build sorted array one element at a time", icon: <ArrowUpDown className="w-6 h-6 text-primary" /> },
    { name: "Merge Sort", slug: "merge-sort", description: "Divide and conquer sorting with guaranteed O(n log n)", icon: <ArrowUpDown className="w-6 h-6 text-cyan" /> },
    { name: "Quick Sort", slug: "quick-sort", description: "Efficient partitioning-based sorting algorithm", icon: <ArrowUpDown className="w-6 h-6 text-warning" /> },
    { name: "Heap Sort", slug: "heap-sort", description: "Comparison-based sorting using binary heap", icon: <ArrowUpDown className="w-6 h-6 text-success" /> },
  ],
  "divide-conquer": [
    { name: "Binary Search", slug: "binary-search", description: "Repeatedly divide search space in half", icon: <Boxes className="w-6 h-6 text-primary" /> },
    { name: "Merge Sort", slug: "merge-sort", description: "Divide array into halves and merge sorted parts", icon: <Boxes className="w-6 h-6 text-cyan" /> },
    { name: "Quick Sort", slug: "quick-sort", description: "Partition around pivot and recursively sort", icon: <Boxes className="w-6 h-6 text-warning" /> },
  ],
  graph: [
    { name: "Prim's Algorithm", slug: "prim", description: "Find minimum spanning tree using greedy approach", icon: <Network className="w-6 h-6 text-success" /> },
    { name: "Kruskal's Algorithm", slug: "kruskal", description: "Build MST by adding edges in order of weight", icon: <Network className="w-6 h-6 text-accent" /> },
    { name: "Dijkstra's Algorithm", slug: "dijkstra", description: "Find shortest path from source to all vertices", icon: <Network className="w-6 h-6 text-primary" /> },
  ],
};

const Algorithms = () => {
  const [activeTab, setActiveTab] = useState("searching");

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient-primary">Explore</span>{" "}
            <span className="text-foreground">Algorithms</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select a category and dive into interactive algorithm visualizations
          </p>
        </div>

        {/* Tabs */}
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Algorithm Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {algorithms[activeTab as keyof typeof algorithms].map((algo) => (
            <AlgorithmCard
              key={algo.slug}
              name={algo.name}
              description={algo.description}
              slug={algo.slug}
              icon={algo.icon}
              category={tabs.find(t => t.id === activeTab)?.label}
            />
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-20 text-center">
          <div className="bg-card rounded-2xl p-8 border border-border max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-3">Can't decide?</h3>
            <p className="text-muted-foreground mb-6">
              Try the comparison tool to run multiple algorithms side-by-side and see performance differences
            </p>
            <a
              href="/compare"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
            >
              Compare Algorithms
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Algorithms;
