import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Instagram, Facebook, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  diensten: [
    { name: "Keuken Wrappen", path: "/keuken-wrappen" },
    { name: "Interieur Wrappen", path: "/interieur-wrappen" },
    { name: "Zakelijk", path: "/zakelijk" },
  ],
  bedrijf: [
    { name: "Over Ons", path: "/over-ons" },
    { name: "Contact", path: "/contact" },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-charcoal-dark border-t border-border">
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <div className="font-display text-2xl font-bold tracking-tight">
                <span className="text-foreground">Quality</span>
                <span className="text-gradient-gold">Wrap</span>
                <span className="text-muted-foreground text-sm">.nl</span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Premium keuken- en interieurbelettering. Transformeer uw ruimte met hoogwaardige wrap-oplossingen.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Linkedin].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-6">
              Diensten
            </h4>
            <ul className="space-y-3">
              {footerLinks.diensten.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-6">
              Bedrijf
            </h4>
            <ul className="space-y-3">
              {footerLinks.bedrijf.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-6">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Amsterdam, Nederland</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href="tel:+31612345678" className="hover:text-primary transition-colors">
                  +31 6 12 34 56 78
                </a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a href="mailto:info@qualitywrap.nl" className="hover:text-primary transition-colors">
                  info@qualitywrap.nl
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} QualityWrap.nl. Alle rechten voorbehouden.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Privacybeleid
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Algemene Voorwaarden
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
