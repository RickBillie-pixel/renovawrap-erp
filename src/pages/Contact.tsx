import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactWizard } from "@/components/ContactWizard";
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
    content: "info@qualitywrap.nl",
    href: "mailto:info@qualitywrap.nl",
  },
  {
    icon: Clock,
    title: "Openingstijden",
    content: "Ma-Vr: 8:00 - 18:00",
  },
];

const Contact = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-primary font-medium text-sm tracking-wider uppercase mb-4 block">
              Contact
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Vraag Een{" "}
              <span className="text-gradient-gold">Gratis Offerte</span> Aan
            </h1>
            <p className="text-muted-foreground text-lg">
              Vul het formulier in en ontvang binnen 24 uur een vrijblijvende offerte op maat.
            </p>
          </motion.div>

          {/* Contact Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border text-center"
              >
                <info.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="font-display font-semibold text-sm mb-1">
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
          </motion.div>

          {/* Wizard Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-card border border-border rounded-2xl p-8 md:p-12"
          >
            <ContactWizard />
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Contact;
