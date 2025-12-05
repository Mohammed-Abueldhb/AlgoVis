import { useState, useEffect } from "react";
import { TabBar } from "@/components/TabBar";
import { AlgorithmCard } from "@/components/AlgorithmCard";
import { algorithmIcons } from "@/lib/algorithmIcons";

const tabs = [
  { id: "searching", label: "Searching" },
  { id: "sorting", label: "Sorting" },
  { id: "divide-conquer", label: "Divide & Conquer" },
  { id: "graph", label: "Greedy & Graph" },
  { id: "dynamic-programming", label: "Dynamic Programming" },
];

const algorithms = {
  searching: [
    { name: "Linear Search", slug: "linear-search", description: "Sequential search through array elements" },
    { name: "Binary Search", slug: "binary-search", description: "Efficient search in sorted arrays using divide and conquer" },
    { name: "Interpolation Search", slug: "interpolation-search", description: "Improved binary search for uniformly distributed data" },
    { name: "Exponential Search", slug: "exponential-search", description: "Search algorithm for unbounded or infinite arrays" },
    { name: "Fibonacci Search", slug: "fibonacci-search", description: "Divide and conquer using Fibonacci numbers" },
  ],
  sorting: [
    { name: "Selection Sort", slug: "selection-sort", description: "Simple sorting by repeatedly finding minimum element" },
    { name: "Insertion Sort", slug: "insertion-sort", description: "Build sorted array one element at a time" },
    { name: "Merge Sort", slug: "merge-sort", description: "Divide and conquer sorting with guaranteed O(n log n)" },
    { name: "Quick Sort", slug: "quick-sort", description: "Efficient partitioning-based sorting algorithm" },
    { name: "Heap Sort", slug: "heap-sort", description: "Comparison-based sorting using binary heap" },
  ],
  "divide-conquer": [
    { name: "Binary Search", slug: "binary-search", description: "Repeatedly divide search space in half" },
    { name: "Merge Sort", slug: "merge-sort", description: "Divide array into halves and merge sorted parts" },
    { name: "Quick Sort", slug: "quick-sort", description: "Partition around pivot and recursively sort" },
  ],
  graph: [
    { name: "Prim's Algorithm", slug: "prim", description: "Find minimum spanning tree using greedy approach" },
    { name: "Kruskal's Algorithm", slug: "kruskal", description: "Build MST by adding edges in order of weight" },
    { name: "Dijkstra's Algorithm", slug: "dijkstra", description: "Find shortest path from source to all vertices" },
  ],
  "dynamic-programming": [
    { name: "Floyd–Warshall", slug: "floyd-warshall", description: "All-pairs shortest paths with dynamic programming" },
    { name: "Warshall", slug: "warshall", description: "Transitive closure using dynamic programming" },
  ],
};

const Algorithms = () => {
  const [activeTab, setActiveTab] = useState(() => {
    const saved = sessionStorage.getItem("algorithmsActiveTab");
    return saved || "searching";
  });

  useEffect(() => {
    sessionStorage.setItem("algorithmsActiveTab", activeTab);
  }, [activeTab]);

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
          {algorithms[activeTab as keyof typeof algorithms].map((algo) => {
            const Icon = algorithmIcons[algo.slug as keyof typeof algorithmIcons];
            return (
              <AlgorithmCard
                key={algo.slug}
                name={algo.name}
                description={algo.description}
                slug={algo.slug}
                category={tabs.find(t => t.id === activeTab)?.label}
                icon={Icon ? <Icon className="w-7 h-7 text-accent" /> : undefined}
              />
            );
          })}
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
