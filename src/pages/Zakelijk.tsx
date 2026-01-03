import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CTASection } from "@/components/CTASection";
import { PageTransition } from "@/components/PageTransition";
import { SEO } from "@/components/SEO";
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
    <PageTransition>
      <SEO
        title="Zakelijke Wrap Oplossingen - B2B Diensten | FoxWrap.nl"
        description="Professionele wrap-oplossingen voor bedrijven. Van kantoren tot winkelruimtes - minimale bedrijfsonderbreking, projectmanagement van A tot Z. Vraag zakelijke offerte aan!"
        keywords="zakelijk wrappen, B2B wrap, kantoor wrappen, winkel wrappen, horeca wrappen, retail wrappen, bedrijfsruimte wrappen"
        canonical="https://foxwrap.nl/zakelijk"
        ogTitle="Zakelijke Wrap Oplossingen - Professionele B2B Diensten"
        ogDescription="Minimale bedrijfsonderbreking, projectmanagement van A tot Z. Volume kortingen beschikbaar."
      />
      <main className="min-h-screen bg-background">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 lg:pt-40 md:pb-20 lg:pb-32 bg-gradient-soft">
          <div className="container-wide">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="text-primary font-medium text-sm tracking-wider uppercase mb-4 block">
                  Zakelijke Diensten
                </span>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight text-foreground">
                  Professionele{" "}
                  <span className="text-gradient-primary">B2B Oplossingen</span>
                </h1>
                <p className="text-muted-foreground text-base sm:text-lg mb-6 md:mb-8 leading-relaxed">
                  Van kantoren tot winkelruimtes - wij bieden op maat gemaakte wrap-oplossingen voor bedrijven. Minimale onderbreking, maximale impact.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 md:mb-10">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      </div>
                      <span className="text-xs sm:text-sm text-foreground">{benefit}</span>
                    </motion.div>
                  ))}
                </div>

                <Link to="/contact" className="inline-block w-full sm:w-auto">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto h-12">
                    Zakelijke Offerte
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="aspect-[4/3] rounded-2xl overflow-hidden shadow-elegant"
                >
                  <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200"
                    alt="Zakelijke ruimte"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="absolute -bottom-6 -right-6 w-full h-full rounded-2xl bg-primary/10 -z-10"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Sectors Section */}
        <section className="section-padding bg-secondary">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-foreground">
                Sectoren Waarin Wij Werken
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg">
                Ervaring in diverse branches met specifieke oplossingen per sector.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {sectors.map((sector, index) => (
                <motion.div
                  key={sector.title}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -8 }}
                  className="p-5 sm:p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-elegant transition-all group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-5"
                  >
                    <sector.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </motion.div>
                  <h3 className="font-display text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground">
                    {sector.title}
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
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
    </PageTransition>
  );
};

export default Zakelijk;
