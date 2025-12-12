import {
  // Searching
  Search as MagnifyingGlass,
  Target,
  TrendingUp,
  Sparkles,
  // Sorting
  Droplets,
  ArrowDownUp,
  MousePointerClick,
  Zap,
  Layers,
  TreePine,
  // Greedy
  Network,
  Link2,
  Navigation,
  // Dynamic Programming
  Grid3x3,
  Network as NetworkIcon,
  // General
  GitCompare,
  Network as GraphNetwork,
  GraduationCap,
  Code2,
} from "lucide-react";

export const algorithmIcons = {
  // Searching
  "linear-search": MagnifyingGlass,
  "binary-search": Target,
  "interpolation-search": TrendingUp,
  "exponential-search": TrendingUp,
  "fibonacci-search": Sparkles,
  
  // Sorting
  "bubble-sort": Droplets,
  "insertion-sort": ArrowDownUp,
  "selection-sort": MousePointerClick,
  "quick-sort": Zap,
  "merge-sort": Layers,
  "heap-sort": TreePine,
  
  // Greedy
  "prim": Network,
  "kruskal": Link2,
  "dijkstra": Navigation,
  
  // Dynamic Programming
  "floyd-warshall": Grid3x3,
  "warshall": NetworkIcon,
  
  // Pages
  "compare": GitCompare,
  "graph": GraphNetwork,
  "about": GraduationCap,
  "team": Code2,
};

export const categoryIcons = {
  searching: MagnifyingGlass,
  sorting: Layers,
  "divide-conquer": GitCompare,
  graph: Network,
  "dynamic-programming": Grid3x3,
  greedy: Network,
};

export type AlgorithmSlug = keyof typeof algorithmIcons;
export type CategoryId = keyof typeof categoryIcons;

