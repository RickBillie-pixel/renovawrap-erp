import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
    <section className="section-padding bg-background relative">
      <div className="container-wide">
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
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200"
                alt="Luxe keuken interieur"
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
            <span className="text-primary font-medium text-sm tracking-wider uppercase mb-4 block">
              Waarom QualityWrap?
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              De Slimste Manier Om{" "}
              <span className="text-gradient-gold">Te Renoveren</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
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
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">{usp}</span>
                </motion.div>
              ))}
            </div>

            <Link to="/over-ons">
              <Button variant="gold-outline" size="lg" className="group">
                Meer Over Ons
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
