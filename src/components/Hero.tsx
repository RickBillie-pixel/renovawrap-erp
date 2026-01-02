import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";

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

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.1, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 1.4,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-soft">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-secondary to-transparent blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container-wide py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-8">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Premium Keuken & Interieur Wrappen
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-8 text-foreground"
            >
              Transformeer Uw Keuken{" "}
              <span className="text-gradient-primary">Zonder Verbouwing</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 max-w-xl"
            >
              Geef uw keuken of interieur een complete metamorfose met hoogwaardige wrap-folie. Professioneel resultaat in slechts één dag.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/contact">
                <Button variant="hero" size="xl" className="group">
                  Vraag Offerte Aan
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                </Button>
              </Link>
              <Link to="/keuken-wrappen">
                <Button variant="outline" size="xl" className="group">
                  <Play className="w-5 h-5" />
                  Bekijk Resultaten
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="mt-16 grid grid-cols-3 gap-8 max-w-md"
            >
              {[
                { value: "500+", label: "Projecten" },
                { value: "10+", label: "Jaar Ervaring" },
                { value: "100%", label: "Garantie" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                >
                  <div className="font-display text-3xl md:text-4xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground text-sm mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-elegant">
              <motion.img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1200&auto=format&fit=crop"
                alt="Moderne keuken met wrap"
                className="w-full aspect-[4/5] object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, y: 30, x: -30 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-8 left-8 right-8 p-6 glass rounded-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-foreground font-display font-semibold text-lg">
                      Kwaliteit Gegarandeerd
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Premium 3M & Avery materialen
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Decorative elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="absolute -z-10 -bottom-8 -right-8 w-full h-full rounded-3xl bg-primary/10"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="absolute -z-20 -bottom-16 -right-16 w-full h-full rounded-3xl bg-secondary"
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-8 h-12 rounded-full border-2 border-primary/30 flex justify-center pt-3"
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-2 h-3 bg-primary rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};
