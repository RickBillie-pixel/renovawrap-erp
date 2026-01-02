import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CTASection } from "@/components/CTASection";
import { PageTransition } from "@/components/PageTransition";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChefHat, Sofa, Building2, Check, ArrowRight } from "lucide-react";

const services = [
  {
    icon: ChefHat,
    title: "Keuken Wrappen",
    description: "Transformeer uw keuken met premium wrap-folie. Van kastdeuren tot werkbladen - alles kan worden getransformeerd.",
    path: "/keuken-wrappen",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1200",
    benefits: [
      "Tot 70% goedkoper dan nieuwe keuken",
      "Klaar binnen 1 dag",
      "Geen rommel of overlast",
      "5 jaar garantie",
    ],
  },
  {
    icon: Sofa,
    title: "Interieur Wrappen",
    description: "Geef elk interieuroppervlak een nieuwe uitstraling. Van meubels tot wandpanelen - de mogelijkheden zijn eindeloos.",
    path: "/interieur-wrappen",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200",
    benefits: [
      "Honderden kleuren en texturen",
      "Krasvast en duurzaam",
      "Eenvoudig te onderhouden",
      "Premium 3M & Avery materialen",
    ],
  },
  {
    icon: Building2,
    title: "Zakelijke Oplossingen",
    description: "Professionele wrap-oplossingen voor bedrijven. Van kantoren tot winkelruimtes - wij bieden op maat gemaakte oplossingen.",
    path: "/zakelijk",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200",
    benefits: [
      "Minimale bedrijfsonderbreking",
      "Projectmanagement van A tot Z",
      "Volume kortingen",
      "Dedicated accountmanager",
    ],
  },
];

const Diensten = () => {
  return (
    <PageTransition>
      <SEO
        title="Onze Diensten - Keuken, Interieur & Zakelijk Wrappen | FoxWrap.nl"
        description="Complete wrap-oplossingen voor elk oppervlak. Van keukens tot interieurs en zakelijke ruimtes - wij bieden professionele wrap-diensten met premium materialen. Bekijk alle diensten!"
        keywords="wrap diensten, keuken wrappen, interieur wrappen, zakelijk wrappen, wrap oplossingen, alle diensten"
        canonical="https://foxwrap.nl/diensten"
        ogTitle="Onze Diensten - Complete Wrap Oplossingen"
        ogDescription="Van keukens tot interieurs en zakelijke ruimtes - professionele wrap-diensten voor elk oppervlak."
      />
      <main className="min-h-screen bg-background">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-soft">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <span className="text-primary font-medium text-sm tracking-wider uppercase mb-4 block">
                Onze Diensten
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-foreground">
                Complete{" "}
                <span className="text-gradient-primary">Wrap Oplossingen</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Van keukens tot interieurs en zakelijke ruimtes - wij bieden professionele wrap-diensten voor elk oppervlak en elke behoefte.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="section-padding bg-background">
          <div className="container-wide">
            <div className="space-y-24">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <motion.div
                    className={index % 2 === 1 ? "lg:order-2" : ""}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-elegant">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
                    </div>
                  </motion.div>

                  <motion.div className={index % 2 === 1 ? "lg:order-1" : ""}>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                      className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6"
                    >
                      <service.icon className="w-8 h-8 text-primary" />
                    </motion.div>
                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
                      {service.title}
                    </h2>
                    <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      {service.benefits.map((benefit, benefitIndex) => (
                        <motion.div
                          key={benefit}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: benefitIndex * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-sm text-foreground">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>

                    <Link to={service.path}>
                      <Button variant="hero" size="lg" className="group">
                        Meer Informatie
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-secondary">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Klaar Om Te Beginnen?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Vraag een gratis offerte aan en ontdek wat wij voor u kunnen betekenen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button variant="hero" size="xl">
                    Gratis Offerte Aanvragen
                  </Button>
                </Link>
                <Link to="/configurator">
                  <Button variant="outline" size="xl">
                    Probeer De Configurator
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <CTASection />
        <Footer />
      </main>
    </PageTransition>
  );
};

export default Diensten;

