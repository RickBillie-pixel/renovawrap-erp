import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=2000')`,
          }}
        />
        <div className="absolute inset-0 bg-background/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/60" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />

      <div className="container-wide relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6"
          >
            Gratis & Vrijblijvend
          </motion.span>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight">
            Klaar Voor Uw{" "}
            <span className="text-gradient-gold">Transformatie?</span>
          </h2>

          <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Vraag vandaag nog een gratis offerte aan en ontdek hoe wij uw keuken of interieur kunnen transformeren.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button variant="hero" size="xl" className="group">
                Vraag Offerte Aan
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/keuken-wrappen">
              <Button variant="glass" size="xl">
                Bekijk Voorbeelden
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
