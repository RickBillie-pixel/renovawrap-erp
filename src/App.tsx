import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import KeukenWrappen from "./pages/KeukenWrappen";
import InterieurWrappen from "./pages/InterieurWrappen";
import Zakelijk from "./pages/Zakelijk";
import OverOns from "./pages/OverOns";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/keuken-wrappen" element={<KeukenWrappen />} />
          <Route path="/interieur-wrappen" element={<InterieurWrappen />} />
          <Route path="/zakelijk" element={<Zakelijk />} />
          <Route path="/over-ons" element={<OverOns />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
