import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ScrollToTop } from "@/components/ScrollToTop";
import AdminLogin from "./pages/Admin/Login";
import AdminDashboard from "./pages/Admin/Dashboard";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();



const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AnimatePresence mode="wait" initial={false}>
          <Routes>
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Navigate to="/" replace />} />
            <Route path="/admin/*" element={<Navigate to="/" replace />} />
            <Route path="/*" element={<AdminDashboard />} />
          </Routes>
        </AnimatePresence>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
