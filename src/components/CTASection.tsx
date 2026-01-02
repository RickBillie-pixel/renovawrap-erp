import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroWrapping from "@/assets/hero-wrapping.jpg";

export const CTASection = () => {
  return (
    <div className="relative min-h-screen flex items-center overflow-hidden">
      {/* Full-screen background */}
      <div className="absolute inset-0">
        <motion.div
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img
            src={heroWrapping}
            alt="Luxe keuken transformatie"
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-background/60 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/50" />
      </div>

      {/* Decorative elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.6, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5 }}
        className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"
      />

      <div className="container-wide relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block px-5 py-2.5 rounded-full glass text-primary text-sm font-medium mb-8"
          >
            Gratis & Vrijblijvend
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 leading-[0.95]"
          >
            Klaar Voor Uw
            <br />
            <span className="text-gradient-primary">Transformatie?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-muted-foreground text-lg md:text-xl mb-12 max-w-xl"
          >
            Vraag vandaag nog een gratis offerte aan en ontdek hoe wij uw keuken of interieur kunnen transformeren.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/contact">
              <Button variant="hero" size="xl" className="group shadow-primary">
                Vraag Offerte Aan
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
              </Button>
            </Link>
            <Link to="/keuken-wrappen">
              <Button variant="outline" size="xl" className="bg-card/50 backdrop-blur-sm border-border hover:bg-card">
                Bekijk Voorbeelden
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
