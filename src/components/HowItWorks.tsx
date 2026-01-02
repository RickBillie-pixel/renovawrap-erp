import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ClipboardCheck, Palette, Wrench, Sparkles } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Gratis Inmeting",
    description: "Wij komen vrijblijvend langs om uw keuken of interieur op te meten en uw wensen te bespreken.",
  },
  {
    icon: Palette,
    title: "Kleur & Design",
    description: "Kies uit honderden kleuren en texturen. Van mat wit tot houtlook of marmeren afwerking.",
  },
  {
    icon: Wrench,
    title: "Vakkundige Montage",
    description: "Onze specialisten wrappen uw keuken of meubels met precisie. Meestal binnen één dag klaar.",
  },
  {
    icon: Sparkles,
    title: "Genieten",
    description: "Geniet van uw volledig getransformeerde ruimte met 5 jaar garantie op al ons werk.",
  },
];

export const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section className="section-padding bg-charcoal-light relative overflow-hidden">
      {/* Background gradient accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-wide relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16 md:mb-20"
        >
          <span className="text-primary font-medium text-sm tracking-wider uppercase mb-4 block">
            Ons Proces
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Hoe Werkt Het?
          </h2>
          <p className="text-muted-foreground text-lg">
            In vier eenvoudige stappen naar uw droomkeuken of -interieur.
          </p>
        </motion.div>

        {/* Steps */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="relative group"
            >
              {/* Connector Line (except last) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-px bg-gradient-to-r from-border to-transparent" />
              )}

              <div className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-500 group-hover:shadow-gold">
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-sm">
                  {index + 1}
                </div>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5"
                >
                  <step.icon className="w-7 h-7 text-primary" />
                </motion.div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
