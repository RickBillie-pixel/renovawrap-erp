import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import heroVideo from "@/assets/kitchen-wrap-hero.mp4";

export const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 80 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Full-screen video background */}
      <div className="absolute inset-0">
        <motion.div
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        </motion.div>
        {/* Elegant light overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      {/* Decorative accent lines */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-8 md:left-16 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent origin-top"
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container-wide py-32">
          <div className="max-w-3xl">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Badge */}
              <motion.div variants={itemVariants} className="mb-8">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/80 backdrop-blur-sm border border-border text-primary text-sm font-medium shadow-soft">
                  <Sparkles className="w-4 h-4" />
                  Premium Keuken & Interieur Wrappen
                </span>
              </motion.div>

              {/* Headline */}
              <motion.div variants={itemVariants} className="overflow-hidden mb-8">
                <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight text-foreground">
                  Transformeer
                  <br />
                  <span className="text-gradient-primary">Uw Keuken</span>
                </h1>
              </motion.div>

              {/* Subheadline */}
              <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 max-w-xl"
              >
                Geef uw keuken of interieur een complete metamorfose met hoogwaardige wrap-folie. 
                Professioneel resultaat in slechts één dag.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link to="/contact">
                  <Button variant="hero" size="xl" className="group shadow-primary">
                    Vraag Offerte Aan
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                  </Button>
                </Link>
                <Link to="/keuken-wrappen">
                  <Button variant="outline" size="xl" className="group bg-card/50 backdrop-blur-sm border-border hover:bg-card">
                    <Play className="w-5 h-5" />
                    Bekijk Resultaten
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Refined Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-0 right-0 z-10"
      >
        <div className="container-wide">
          <div className="flex items-center gap-12 md:gap-16 py-8 border-t border-border/50">
            {[
              { value: "500+", label: "Projecten" },
              { value: "10+", label: "Jaar Ervaring" },
              { value: "100%", label: "Garantie" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.1, duration: 0.6 }}
                className="flex items-baseline gap-2"
              >
                <span className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                  {stat.value}
                </span>
                <span className="text-muted-foreground text-sm tracking-wide uppercase">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Minimal Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-28 right-8 md:right-16 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs tracking-widest uppercase text-muted-foreground rotate-90 origin-center">
            Scroll
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-muted-foreground/50 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
};
