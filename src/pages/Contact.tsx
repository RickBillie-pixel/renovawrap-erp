import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactWizard } from "@/components/ContactWizard";
import { PageTransition } from "@/components/PageTransition";
import { SEO } from "@/components/SEO";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    title: "Adres",
    content: "Amsterdam, Nederland",
  },
  {
    icon: Phone,
    title: "Telefoon",
    content: "+31 6 12 34 56 78",
    href: "tel:+31612345678",
  },
  {
    icon: Mail,
    title: "E-mail",
    content: "info@foxwrap.nl",
    href: "mailto:info@foxwrap.nl",
  },
  {
    icon: Clock,
    title: "Openingstijden",
    content: "Ma-Vr: 8:00 - 18:00",
  },
];

const Contact = () => {
  return (
    <PageTransition>
      <SEO
        title="Contact - Gratis Offerte Aanvragen | FoxWrap.nl"
        description="Vraag een gratis offerte aan voor uw keuken of interieur wrappen. Vul het formulier in en ontvang binnen 24 uur een vrijblijvende offerte op maat. Neem contact met ons op!"
        keywords="gratis offerte, contact foxwrap, offerte aanvragen, keuken offerte, interieur offerte, wrap offerte"
        canonical="https://foxwrap.nl/contact"
        ogTitle="Contact - Vraag Gratis Offerte Aan"
        ogDescription="Ontvang binnen 24 uur een vrijblijvende offerte op maat. Gratis inmeting beschikbaar."
      />
      <main className="min-h-screen bg-background">
        <Navbar />
        
        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 lg:pt-40 md:pb-20 lg:pb-32 bg-gradient-soft">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <span className="text-primary font-medium text-sm tracking-wider uppercase mb-4 block">
                Contact
              </span>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight text-foreground">
                Vraag Een{" "}
                <span className="text-gradient-primary">Gratis Offerte</span> Aan
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg">
                Vul het formulier in en ontvang binnen 24 uur een vrijblijvende offerte op maat.
              </p>
            </motion.div>

            {/* Contact Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-12 md:mb-16">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="p-4 sm:p-6 rounded-xl bg-card border border-border text-center shadow-soft hover:shadow-elegant transition-all"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <info.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  </motion.div>
                  <div className="font-display font-semibold text-sm mb-1 text-foreground">
                    {info.title}
                  </div>
                  {info.href ? (
                    <a
                      href={info.href}
                      className="text-muted-foreground text-sm hover:text-primary transition-colors"
                    >
                      {info.content}
                    </a>
                  ) : (
                    <div className="text-muted-foreground text-sm">{info.content}</div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Wizard Form */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="bg-card border border-border rounded-3xl p-6 sm:p-8 md:p-12 shadow-elegant"
            >
              <ContactWizard />
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </PageTransition>
  );
};

export default Contact;
