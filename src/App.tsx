import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import KeukenWrappen from "./pages/KeukenWrappen";
import InterieurWrappen from "./pages/InterieurWrappen";
import Zakelijk from "./pages/Zakelijk";
import OverOns from "./pages/OverOns";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/keuken-wrappen" element={<KeukenWrappen />} />
        <Route path="/interieur-wrappen" element={<InterieurWrappen />} />
        <Route path="/zakelijk" element={<Zakelijk />} />
        <Route path="/over-ons" element={<OverOns />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AnimatedRoutes />
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
