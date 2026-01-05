
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import kitchenAfter from "@/assets/kitchen-after.jpg";

import wrapRollsV2 from "@/assets/wrap-rolls-v2.png";

const usps = [
  "Gratis vrijblijvende offerte",
  "Binnen 1 dag klaar",
  "5 jaar garantie",
  "Honderden kleuren",
  "Duurzaam alternatief",
  "Vakkundige montage",
];

export const USPSection = () => {
  return (
    <div className="w-full py-12 md:py-16 lg:py-24 relative min-h-screen md:min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={kitchenAfter}
          alt="Getransformeerde keuken"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-foreground/60" />
      </div>

      <div className="container-wide relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img
                src={wrapRollsV2}
                alt="Premium wrap folie in diverse kleuren"
                className="w-full h-full object-cover"
              />
              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute bottom-6 left-6 right-6 p-4 glass rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-foreground font-display font-semibold">
                      Kwaliteit Gegarandeerd
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Premium 3M & Avery materialen
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Decorative element */}
            <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-2xl bg-primary/10" />
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-white/90 font-medium text-sm tracking-wider uppercase mb-4 block">
              Waarom FoxWrap?
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight text-white drop-shadow-lg">
              De Slimste Manier Om{" "}
              <span className="text-white">Te Renoveren</span>
            </h2>
            <p className="text-white/90 text-base sm:text-lg mb-6 md:mb-8 leading-relaxed drop-shadow-md">
              Waarom duizenden euro's uitgeven aan een nieuwe keuken als u het zelfde resultaat kunt bereiken voor een fractie van de prijs? Met onze hoogwaardige wrap-folie transformeren we uw keuken of interieur in slechts één dag.
            </p>

            {/* USP List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {usps.map((usp, index) => (
                <motion.div
                  key={usp}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-medium">{usp}</span>
                </motion.div>
              ))}
            </div>

            <Link to="/over-ons">
              <Button variant="premium-outline" size="lg" className="group border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-white/5 backdrop-blur-sm">
                Meer Over Ons
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
