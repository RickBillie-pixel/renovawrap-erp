import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

export const AfsprakenPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Afspraken</h2>
            <p className="text-muted-foreground">Beheer alle afspraken</p>
          </div>
        </div>
        
        <div className="text-center py-12 text-muted-foreground">
          <p>Afspraken overzicht komt hier binnenkort beschikbaar.</p>
        </div>
      </div>
    </div>
  );
};

