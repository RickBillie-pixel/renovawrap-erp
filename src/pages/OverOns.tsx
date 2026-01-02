import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CTASection } from "@/components/CTASection";
import { Award, Users, Clock, Shield } from "lucide-react";

const stats = [
  { icon: Award, value: "10+", label: "Jaar Ervaring" },
  { icon: Users, value: "500+", label: "Tevreden Klanten" },
  { icon: Clock, value: "1 dag", label: "Gemiddelde Doorlooptijd" },
  { icon: Shield, value: "5 jaar", label: "Garantie" },
];

const OverOns = () => {
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
                Over Ons
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Passie Voor{" "}
                <span className="text-gradient-gold">Perfectie</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                QualityWrap is ontstaan uit een passie voor design en vakmanschap. Al meer dan 10 jaar transformeren wij keukens en interieurs door heel Nederland.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Ons team van gecertificeerde specialisten werkt uitsluitend met premium materialen van 3M en Avery. Wij geloven dat iedereen recht heeft op een prachtig interieur, zonder de hoge kosten van een volledige renovatie.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1200"
                  alt="Ons team"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 w-full h-full rounded-2xl bg-primary/10 -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-charcoal-light">
        <div className="container-wide">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                <div className="font-display text-4xl font-bold text-gradient-gold mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-card border border-border text-center"
              >
                <h3 className="font-display text-xl font-semibold mb-4 text-gradient-gold">
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
  );
};

export default OverOns;
