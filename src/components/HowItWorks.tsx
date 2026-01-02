import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ClipboardCheck, Palette, Wrench, Sparkles, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Gratis Inmeting",
    description: "Wij komen vrijblijvend langs om uw keuken of interieur op te meten en uw wensen te bespreken.",
    detail: "Binnen 48 uur contact",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800",
    accent: "from-amber-500/20 to-orange-500/20",
  },
  {
    icon: Palette,
    title: "Kleur & Design",
    description: "Kies uit honderden kleuren en texturen. Van mat wit tot houtlook of marmeren afwerking.",
    detail: "500+ kleuren beschikbaar",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800",
    accent: "from-rose-500/20 to-pink-500/20",
  },
  {
    icon: Wrench,
    title: "Vakkundige Montage",
    description: "Onze specialisten wrappen uw keuken of meubels met precisie. Meestal binnen één dag klaar.",
    detail: "Gemiddeld 1 werkdag",
    image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=800",
    accent: "from-emerald-500/20 to-teal-500/20",
  },
  {
    icon: Sparkles,
    title: "Genieten",
    description: "Geniet van uw volledig getransformeerde ruimte met 5 jaar garantie op al ons werk.",
    detail: "5 jaar garantie",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800",
    accent: "from-violet-500/20 to-purple-500/20",
  },
];

const StepCard = ({ step, index, isActive, onClick }: { 
  step: typeof steps[0]; 
  index: number; 
  isActive: boolean;
  onClick: () => void;
}) => {
  const Icon = step.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <motion.div
        whileHover={{ scale: 1.02, y: -8 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`relative overflow-hidden rounded-3xl transition-all duration-500 ${
          isActive 
            ? "ring-2 ring-primary shadow-elegant" 
            : "ring-1 ring-border/50 hover:ring-primary/30"
        }`}
      >
        {/* Image Background */}
        <div className="relative h-64 overflow-hidden">
          <motion.img
            src={step.image}
            alt={step.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t ${step.accent} mix-blend-multiply`} />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
          
          {/* Step Number */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 + index * 0.1, type: "spring" }}
            className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center"
          >
            <span className="font-display text-xl font-bold text-white">
              {String(index + 1).padStart(2, '0')}
            </span>
          </motion.div>

          {/* Icon Badge */}
          <motion.div
            whileHover={{ rotate: 12 }}
            className="absolute top-4 right-4 w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-primary"
          >
            <Icon className="w-6 h-6 text-primary-foreground" />
          </motion.div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-xs font-medium mb-3"
            >
              {step.detail}
            </motion.span>
            <h3 className="font-display text-2xl font-bold text-white mb-2">
              {step.title}
            </h3>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 bg-card">
          <p className="text-muted-foreground leading-relaxed mb-4">
            {step.description}
          </p>
          
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: isActive ? 1 : 0.6, x: isActive ? 0 : -10 }}
            className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all"
          >
            <span>Meer informatie</span>
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const HowItWorks = () => {
  const containerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div ref={containerRef} className="w-full py-24 md:py-32 relative overflow-hidden">
      {/* Rich Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card via-background to-card" />
      
      {/* Animated Background Elements */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} 
        />
      </div>

      <div className="container-wide relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-8"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block text-primary font-medium text-sm tracking-[0.2em] uppercase mb-4"
          >
            Uw Transformatie
          </motion.span>
          
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            De Journey Naar Uw
            <br />
            <span className="text-gradient-primary">Droomkeuken</span>
          </h2>
          
          <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto">
            Van eerste contact tot uw droomkeuken — in vier doordachte stappen naar een complete transformatie.
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center gap-3 mb-16"
        >
          {steps.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setActiveStep(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`relative h-2 rounded-full transition-all duration-500 ${
                index === activeStep 
                  ? "w-12 bg-primary" 
                  : "w-2 bg-border hover:bg-primary/50"
              }`}
            />
          ))}
        </motion.div>

        {/* Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <StepCard 
              key={step.title} 
              step={step} 
              index={index}
              isActive={index === activeStep}
              onClick={() => setActiveStep(index)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-6">
            Klaar om te beginnen? Neem vandaag nog contact met ons op.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium shadow-primary cursor-pointer group"
          >
            <span>Start Uw Transformatie</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
