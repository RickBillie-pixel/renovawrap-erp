import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/hero-wrapping.jpg";

export const Hero = () => {
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 80
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };
  return <section className="relative min-h-screen overflow-hidden flex items-center">
      {/* Full-screen image background */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Professioneel keuken wrappen met zwarte handschoenen" 
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-foreground/60 pointer-events-none" />
      </div>

      {/* Content - Centered */}
      <div className="relative z-10 container-wide text-center">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            
          </motion.div>

          {/* Headline */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight text-[#F5F0E8]">
              Transformeer
              <br />
              Uw Keuken
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-background/80 leading-relaxed mb-12 max-w-2xl mx-auto">
            Geef uw keuken of interieur een complete metamorfose met hoogwaardige wrap-folie. 
            Professioneel resultaat in slechts één dag.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button variant="hero" size="xl" className="group">
                Vraag Offerte Aan
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
              </Button>
            </Link>
            <Link to="/keuken-wrappen">
              <Button variant="outline" size="xl" className="group bg-background/10 backdrop-blur-sm border-background/30 text-background hover:bg-background/20">
                <Play className="w-5 h-5" />
                Bekijk Resultaten
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>;
};