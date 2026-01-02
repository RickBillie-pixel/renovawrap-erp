import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CTASection } from "@/components/CTASection";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sofa, DoorOpen, Table2, Tv } from "lucide-react";

const services = [
  {
    icon: Sofa,
    title: "Meubels",
    description: "Van kasten tot tafels, geef uw meubels een volledig nieuwe uitstraling met wrap-folie.",
  },
  {
    icon: DoorOpen,
    title: "Deuren & Kozijnen",
    description: "Transformeer uw binnendeuren en kozijnen naar elke gewenste kleur of houtlook.",
  },
  {
    icon: Table2,
    title: "Tafels & Werkbladen",
    description: "Vernieuw uw tafels en werkoppervlakken met duurzame, krasvaste wrap-folie.",
  },
  {
    icon: Tv,
    title: "Wandpanelen & Accent",
    description: "Creëer unieke accentmuren en wandpanelen voor een luxe uitstraling.",
  },
];

const InterieurWrappen = () => {
  return (
    <PageTransition>
      <main className="min-h-screen bg-background">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden bg-gradient-soft">
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.3, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="absolute top-1/4 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.2, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="absolute bottom-0 right-0 w-72 h-72 bg-secondary rounded-full blur-3xl"
            />
          </div>
          
          <div className="container-wide relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <span className="text-primary font-medium text-sm tracking-wider uppercase mb-4 block">
                Interieur Wrappen
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-foreground">
                Elk Oppervlak,{" "}
                <span className="text-gradient-primary">Elke Stijl</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-10">
                Van meubels tot wandpanelen - wij transformeren elk interieuroppervlak met hoogwaardige wrap-folie. Vernieuw uw ruimte zonder dure vervangingen.
              </p>
              <Link to="/contact">
                <Button variant="hero" size="xl">
                  Gratis Adviesgesprek
                </Button>
              </Link>
            </motion.div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-elegant transition-all group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5"
                  >
                    <service.icon className="w-7 h-7 text-primary" />
                  </motion.div>
                  <h3 className="font-display text-xl font-semibold mb-3 text-foreground">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {service.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
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
                Inspiratie Galerij
              </h2>
              <p className="text-muted-foreground text-lg">
                Bekijk onze recente interieur projecten en laat u inspireren.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800",
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800",
                "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800",
                "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=800",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800",
              ].map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-soft"
                >
                  <img
                    src={image}
                    alt={`Interieur project ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
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

export default InterieurWrappen;
