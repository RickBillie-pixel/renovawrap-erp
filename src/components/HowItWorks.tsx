import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ClipboardCheck, Palette, Wrench, Sparkles } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Gratis Inmeting",
    description: "Wij komen vrijblijvend langs om uw keuken of interieur op te meten en uw wensen te bespreken.",
    detail: "Binnen 48 uur contact",
  },
  {
    icon: Palette,
    title: "Kleur & Design",
    description: "Kies uit honderden kleuren en texturen. Van mat wit tot houtlook of marmeren afwerking.",
    detail: "500+ kleuren beschikbaar",
  },
  {
    icon: Wrench,
    title: "Vakkundige Montage",
    description: "Onze specialisten wrappen uw keuken of meubels met precisie. Meestal binnen één dag klaar.",
    detail: "Gemiddeld 1 werkdag",
  },
  {
    icon: Sparkles,
    title: "Genieten",
    description: "Geniet van uw volledig getransformeerde ruimte met 5 jaar garantie op al ons werk.",
    detail: "5 jaar garantie",
  },
];

export const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div className="w-full py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} />
      </div>

      <div className="container-wide relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-24"
        >
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
            De Journey
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto">
            Van eerste contact tot uw droomkeuken — in vier doordachte stappen.
          </p>
        </motion.div>

        {/* Journey Timeline */}
        <div ref={ref} className="relative max-w-5xl mx-auto">
          {/* Central Timeline Line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent origin-top hidden lg:block"
          />

          {/* Steps */}
          <div className="space-y-8 lg:space-y-0">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: isEven ? -60 : 60 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.2,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`relative flex items-center lg:items-start ${
                    isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  } lg:gap-16`}
                >
                  {/* Content Card */}
                  <div className={`flex-1 ${isEven ? 'lg:text-right' : 'lg:text-left'}`}>
                    <div className={`group relative p-8 lg:p-10 rounded-2xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-elegant transition-all duration-500 ${
                      isEven ? 'lg:mr-8' : 'lg:ml-8'
                    }`}>
                      {/* Step Number Badge */}
                      <div className={`absolute -top-4 ${isEven ? 'lg:right-8 left-8 lg:left-auto' : 'left-8'}`}>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-wide">
                          Stap {index + 1}
                        </span>
                      </div>

                      {/* Icon */}
                      <div className={`flex ${isEven ? 'lg:justify-end' : 'lg:justify-start'} mb-6`}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center"
                        >
                          <step.icon className="w-6 h-6 text-primary" />
                        </motion.div>
                      </div>

                      {/* Content */}
                      <h3 className="font-display text-2xl font-semibold mb-3 text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {step.description}
                      </p>
                      
                      {/* Detail Tag */}
                      <span className="inline-block text-xs font-medium text-primary/80 tracking-wide uppercase">
                        {step.detail}
                      </span>
                    </div>
                  </div>

                  {/* Timeline Node - Desktop Only */}
                  <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : {}}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.2, type: "spring" }}
                      className="w-4 h-4 rounded-full bg-primary shadow-primary"
                    />
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="hidden lg:block flex-1" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
