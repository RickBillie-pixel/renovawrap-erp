import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CTASection } from "@/components/CTASection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Hotel, Store, Briefcase, Check } from "lucide-react";

const sectors = [
  {
    icon: Hotel,
    title: "Horeca",
    description: "Restaurants, hotels en cafés - geef uw zaak een premium uitstraling.",
  },
  {
    icon: Store,
    title: "Retail",
    description: "Winkels en showrooms - creëer een unieke merkervaring.",
  },
  {
    icon: Building2,
    title: "Kantoren",
    description: "Werkruimtes en vergaderruimtes met een professionele look.",
  },
  {
    icon: Briefcase,
    title: "Overheid",
    description: "Scholen, zorginstellingen en gemeentelijke gebouwen.",
  },
];

const benefits = [
  "Minimale bedrijfsonderbreking",
  "Projectmanagement van A tot Z",
  "Flexibele planning (ook weekends)",
  "Volume kortingen",
  "Dedicated accountmanager",
  "Onderhoudscontracten beschikbaar",
];

const Zakelijk = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-primary font-medium text-sm tracking-wider uppercase mb-4 block">
                Zakelijke Diensten
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Professionele{" "}
                <span className="text-gradient-gold">B2B Oplossingen</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Van kantoren tot winkelruimtes - wij bieden op maat gemaakte wrap-oplossingen voor bedrijven. Minimale onderbreking, maximale impact.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <Link to="/contact">
                <Button variant="hero" size="xl">
                  Zakelijke Offerte
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200"
                  alt="Zakelijke ruimte"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-full h-full rounded-2xl bg-primary/10 -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sectors Section */}
      <section className="section-padding bg-charcoal-light">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Sectoren Waarin Wij Werken
            </h2>
            <p className="text-muted-foreground text-lg">
              Ervaring in diverse branches met specifieke oplossingen per sector.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sectors.map((sector, index) => (
              <motion.div
                key={sector.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <sector.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">
                  {sector.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {sector.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
};

export default Zakelijk;
