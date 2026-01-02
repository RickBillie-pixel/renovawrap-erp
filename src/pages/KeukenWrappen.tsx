import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { CTASection } from "@/components/CTASection";
import { PageTransition } from "@/components/PageTransition";
import { SEO } from "@/components/SEO";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const benefits = [
  "Tot 70% goedkoper dan nieuwe keuken",
  "Klaar binnen 1 dag",
  "Geen rommel of overlast",
  "5 jaar garantie",
  "Premium 3M & Avery materialen",
  "Honderden kleuren en texturen",
];

const KeukenWrappen = () => {
  return (
    <PageTransition>
      <SEO
        title="Keuken Wrappen - Tot 70% Goedkoper | FoxWrap.nl"
        description="Transformeer uw verouderde keuken naar een moderne uitstraling zonder de kosten van een complete renovatie. Klaar binnen 1 dag, 5 jaar garantie. Gratis offerte!"
        keywords="keuken wrappen, keuken renovatie, keuken transformatie, kastdeuren wrappen, werkblad wrappen, goedkope keuken renovatie, keuken folie"
        canonical="https://foxwrap.nl/keuken-wrappen"
        ogTitle="Keuken Wrappen - Tot 70% Goedkoper Dan Nieuwe Keuken"
        ogDescription="Transformeer uw keuken in slechts één dag. Premium kwaliteit, 5 jaar garantie, geen rommel."
      />
      <main className="min-h-screen bg-background">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-soft">
          <div className="container-wide">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="text-primary font-medium text-sm tracking-wider uppercase mb-4 block">
                  Keuken Wrappen
                </span>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-foreground">
                  Geef Uw Keuken Een{" "}
                  <span className="text-gradient-primary">Nieuwe Look</span>
                </h1>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Transformeer uw verouderde keuken naar een moderne uitstraling zonder de kosten en rommel van een complete renovatie. Met hoogwaardige wrap-folie realiseren wij uw droomkeuken in slechts één dag.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-10">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-foreground">{benefit}</span>
                    </motion.div>
                  ))}
                </div>

                <Link to="/contact">
                  <Button variant="hero" size="xl">
                    Gratis Offerte Aanvragen
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <BeforeAfterSlider
                  beforeImage="https://images.unsplash.com/photo-1556909114-44e3e70034e2?q=80&w=1200"
                  afterImage="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1200"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="section-padding bg-secondary">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Wat Kunnen Wij Wrappen?
              </h2>
              <p className="text-muted-foreground text-lg">
                Van kastdeuren tot werkbladen - vrijwel elk oppervlak kan worden getransformeerd.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Kastdeuren & Fronten", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800" },
                { title: "Werkbladen", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800" },
                { title: "Apparatuur & Panelen", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=800" },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -10 }}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-elegant"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-display text-xl font-semibold text-card">{item.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <CTASection />
        <Footer />
      </main>
    </PageTransition>
  );
};

export default KeukenWrappen;
