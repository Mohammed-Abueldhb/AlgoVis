import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import Home from "./pages/Home";
import Algorithms from "./pages/Algorithms";
import Compare from "./pages/Compare";
import About from "./pages/About";
import Blake2bPage from "./pages/Blake2bPage";
import QuickSort from "./pages/algorithms/quick-sort";
import BinarySearch from "./pages/algorithms/binary-search";
import LinearSearch from "./pages/algorithms/linear-search";
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
          <Route path="/compare" element={<Compare />} />
          <Route path="/blake2b" element={<Blake2bPage />} />
          <Route path="/about" element={<About />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
