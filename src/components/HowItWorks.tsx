import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import { CalendarCheck, Brush, Hammer, Star, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: CalendarCheck,
    title: "Gratis Inmeting",
    description: "Wij komen vrijblijvend langs om uw keuken of interieur op te meten en uw wensen te bespreken.",
    detail: "Binnen 48 uur contact",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800",
    gradientFrom: "from-amber-400",
    gradientTo: "to-orange-500",
  },
  {
    icon: Brush,
    title: "Kleur & Design",
    description: "Kies uit honderden kleuren en texturen. Van mat wit tot houtlook of marmeren afwerking.",
    detail: "500+ kleuren beschikbaar",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800",
    gradientFrom: "from-rose-400",
    gradientTo: "to-pink-500",
  },
  {
    icon: Hammer,
    title: "Vakkundige Montage",
    description: "Onze specialisten wrappen uw keuken of meubels met precisie. Meestal binnen één dag klaar.",
    detail: "Gemiddeld 1 werkdag",
    image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=800",
    gradientFrom: "from-emerald-400",
    gradientTo: "to-teal-500",
  },
  {
    icon: Star,
    title: "Genieten",
    description: "Geniet van uw volledig getransformeerde ruimte met 5 jaar garantie op al ons werk.",
    detail: "5 jaar garantie",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800",
    gradientFrom: "from-violet-400",
    gradientTo: "to-purple-500",
  },
];

const StepItem = ({ step, index, isLast }: { step: typeof steps[0]; index: number; isLast: boolean }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });
  const Icon = step.icon;
  const isEven = index % 2 === 0;

  return (
    <div ref={ref} className="relative">
      {/* Connector Line to next step */}
      {!isLast && (
        <div className="absolute left-1/2 top-full w-px h-24 -translate-x-1/2 bg-gradient-to-b from-border to-transparent z-0" />
      )}

      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 40 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${
          isEven ? "" : "lg:flex-row-reverse"
        }`}
      >
        {/* Image Side */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0.5, scale: 0.95 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex-1 w-full"
        >
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-elegant">
            <motion.img
              src={step.image}
              alt={step.title}
              className="w-full h-full object-cover"
              animate={isInView ? { scale: 1 } : { scale: 1.1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${step.gradientFrom}/20 ${step.gradientTo}/10 mix-blend-overlay`} />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
            
            {/* Step badge on image */}
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
              className={`absolute top-6 ${isEven ? 'left-6' : 'right-6'} px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20`}
            >
              <span className="text-white font-medium text-sm">Stap {index + 1}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Content Side */}
        <motion.div
          initial={{ opacity: 0, x: isEven ? 40 : -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0.5, x: isEven ? 20 : -20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`flex-1 w-full ${isEven ? 'lg:text-left' : 'lg:text-right'}`}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0.8, rotate: -90 }}
            transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
            className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradientFrom} ${step.gradientTo} shadow-lg mb-6`}
          >
            <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
          </motion.div>

          {/* Detail tag */}
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`inline-block px-4 py-1.5 rounded-full bg-gradient-to-r ${step.gradientFrom}/10 ${step.gradientTo}/10 text-foreground/70 text-xs font-medium tracking-wide uppercase mb-4`}
          >
            {step.detail}
          </motion.span>

          <h3 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {step.title}
          </h3>
          
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
            {step.description}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });
  
  const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="w-full py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card via-background to-card" />
      
      {/* Decorative blurs */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl translate-x-1/2" />

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
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-8"
          >
            <Sparkles className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </motion.div>
          
          <span className="inline-block text-primary font-medium text-sm tracking-[0.2em] uppercase mb-4">
            Uw Transformatie
          </span>
          
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            De Journey Naar Uw
            <br />
            <span className="text-gradient-primary">Droomkeuken</span>
          </h2>
          
          <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto">
            Van eerste contact tot uw droomkeuken — in vier doordachte stappen.
          </p>
        </motion.div>

        {/* Progress Bar - Fixed on left side */}
        <div className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-50">
          <div className="relative h-48 w-1 bg-border/30 rounded-full overflow-hidden">
            <motion.div
              style={{ height: progressHeight }}
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-primary via-primary to-primary/60 rounded-full"
            />
          </div>
          <div className="mt-4 text-xs text-muted-foreground font-medium tracking-wider uppercase">
            <motion.span style={{ opacity: scrollYProgress }}>
              Journey
            </motion.span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-32 lg:space-y-48">
          {steps.map((step, index) => (
            <StepItem 
              key={step.title} 
              step={step} 
              index={index} 
              isLast={index === steps.length - 1}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mt-32"
        >
          <p className="text-muted-foreground mb-8 text-lg">
            Klaar om te beginnen? Neem vandaag nog contact met ons op.
          </p>
          <Link to="/contact">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-primary via-primary to-primary/80 text-primary-foreground font-medium text-lg shadow-lg cursor-pointer group"
            >
              <span>Start Uw Transformatie</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" strokeWidth={1.5} />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};
