import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CTASection } from "@/components/CTASection";
import { PageTransition } from "@/components/PageTransition";
import { SEO } from "@/components/SEO";
import { Award, Users, Clock, Shield } from "lucide-react";

const stats = [
  { icon: Award, value: "10+", label: "Jaar Ervaring" },
  { icon: Users, value: "500+", label: "Tevreden Klanten" },
  { icon: Clock, value: "1 dag", label: "Gemiddelde Doorlooptijd" },
  { icon: Shield, value: "5 jaar", label: "Garantie" },
];

const OverOns = () => {
  return (
    <PageTransition>
      <SEO
        title="Over Ons - 10+ Jaar Ervaring in Keuken & Interieur Wrappen | FoxWrap.nl"
        description="Al meer dan 10 jaar transformeren wij keukens en interieurs door heel Nederland. Gecertificeerde specialisten met premium 3M en Avery materialen. 500+ tevreden klanten."
        keywords="over foxwrap, wrap specialist, gecertificeerd wrappen, ervaren wrap bedrijf, 3M gecertificeerd, Avery gecertificeerd"
        canonical="https://foxwrap.nl/over-ons"
        ogTitle="Over Ons - 10+ Jaar Ervaring in Premium Wrappen"
        ogDescription="Gecertificeerde specialisten met premium materialen. 500+ tevreden klanten, 5 jaar garantie."
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
                  Over Ons
                </span>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-foreground">
                  Passie Voor{" "}
                  <span className="text-gradient-primary">Perfectie</span>
                </h1>
                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                  FoxWrap is ontstaan uit een passie voor design en vakmanschap. Al meer dan 10 jaar transformeren wij keukens en interieurs door heel Nederland.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Ons team van gecertificeerde specialisten werkt uitsluitend met premium materialen van 3M en Avery. Wij geloven dat iedereen recht heeft op een prachtig interieur, zonder de hoge kosten van een volledige renovatie.
                </p>
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
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1200"
                    alt="Ons team"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="absolute -bottom-6 -left-6 w-full h-full rounded-2xl bg-primary/10 -z-10"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-secondary">
          <div className="container-wide">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <stat.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  </motion.div>
                  <div className="font-display text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="section-padding bg-background">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Onze Waarden
              </h2>
              <p className="text-muted-foreground text-lg">
                Deze kernwaarden vormen de basis van alles wat wij doen.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Kwaliteit",
                  description: "Wij gebruiken alleen de beste materialen en technieken. Geen compromissen.",
                },
                {
                  title: "Vakmanschap",
                  description: "Ons team bestaat uit gecertificeerde specialisten met jarenlange ervaring.",
                },
                {
                  title: "Klanttevredenheid",
                  description: "Uw tevredenheid is onze prioriteit. Wij rusten niet tot u 100% tevreden bent.",
                },
              ].map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -10 }}
                  className="p-8 rounded-2xl bg-card border border-border text-center shadow-soft hover:shadow-elegant transition-all"
                >
                  <h3 className="font-display text-xl font-semibold mb-4 text-primary">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
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

export default OverOns;
