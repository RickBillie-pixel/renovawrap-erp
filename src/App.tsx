import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Diensten from "./pages/Diensten";
import KeukenWrappen from "./pages/KeukenWrappen";
import InterieurWrappen from "./pages/InterieurWrappen";
import Zakelijk from "./pages/Zakelijk";
import Configurator from "./pages/Configurator";
import OverOns from "./pages/OverOns";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/Admin/Login";
import AdminDashboard from "./pages/Admin/Dashboard";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/diensten" element={<Diensten />} />
        <Route path="/keuken-wrappen" element={<KeukenWrappen />} />
        <Route path="/interieur-wrappen" element={<InterieurWrappen />} />
        <Route path="/zakelijk" element={<Zakelijk />} />
        <Route path="/configurator" element={<Configurator />} />
        <Route path="/over-ons" element={<OverOns />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AnimatedRoutes />
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
