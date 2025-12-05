import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import Home from "./pages/Home";
import Algorithms from "./pages/Algorithms";
import Compare from "./pages/Compare";
import CompareRunPage from "./pages/CompareRun";
import About from "./pages/About";

import QuickSort from "./pages/algorithms/quick-sort";
import BinarySearch from "./pages/algorithms/binary-search";
import LinearSearch from "./pages/algorithms/linear-search";
import InsertionSort from "./pages/algorithms/insertion-sort";
import SelectionSort from "./pages/algorithms/selection-sort";
import MergeSort from "./pages/algorithms/merge-sort";
import HeapSort from "./pages/algorithms/heap-sort";
import InterpolationSearch from "./pages/algorithms/interpolation-search";
import ExponentialSearch from "./pages/algorithms/exponential-search";
import FibonacciSearch from "./pages/algorithms/fibonacci-search";
import Prim from "./pages/algorithms/prim";
import Kruskal from "./pages/algorithms/kruskal";
import Dijkstra from "./pages/algorithms/dijkstra";
import FloydWarshall from "./pages/algorithms/floyd-warshall";
import Warshall from "./pages/algorithms/warshall";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/algorithms" element={<Algorithms />} />
          <Route path="/algorithms/quick-sort" element={<QuickSort />} />
          <Route path="/algorithms/binary-search" element={<BinarySearch />} />
          <Route path="/algorithms/linear-search" element={<LinearSearch />} />
          <Route path="/algorithms/insertion-sort" element={<InsertionSort />} />
          <Route path="/algorithms/selection-sort" element={<SelectionSort />} />
          <Route path="/algorithms/merge-sort" element={<MergeSort />} />
          <Route path="/algorithms/heap-sort" element={<HeapSort />} />
          <Route path="/algorithms/interpolation-search" element={<InterpolationSearch />} />
          <Route path="/algorithms/exponential-search" element={<ExponentialSearch />} />
          <Route path="/algorithms/fibonacci-search" element={<FibonacciSearch />} />
          <Route path="/algorithms/prim" element={<Prim />} />
          <Route path="/algorithms/kruskal" element={<Kruskal />} />
          <Route path="/algorithms/dijkstra" element={<Dijkstra />} />
          <Route path="/algorithms/floyd-warshall" element={<FloydWarshall />} />
          <Route path="/algorithms/warshall" element={<Warshall />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/compare/run" element={<CompareRunPage />} />
          <Route path="/about" element={<About />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
