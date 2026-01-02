import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import foxwrapLogo from "@/assets/Ontwerp zonder titel (4).png";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Diensten", path: "/diensten" },
  { name: "Zakelijk", path: "/zakelijk" },
  { name: "Configurator", path: "/configurator" },
  { name: "Over Ons", path: "/over-ons" },
  { name: "Contact", path: "/contact" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Check if we're on the homepage (hero has dark background)
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const mainElement = document.querySelector('main');
    
    const handleScroll = () => {
      const scrollY = mainElement ? mainElement.scrollTop : window.scrollY;
      setIsScrolled(scrollY > 50);
    };
    
    // Listen to scroll on main element (for snap scroll) and window
    if (mainElement) {
      mainElement.addEventListener("scroll", handleScroll);
    }
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      if (mainElement) {
        mainElement.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "glass-strong py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="container-wide flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="relative z-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-4 md:gap-5"
            >
              <img
                src={foxwrapLogo}
                alt="FoxWrap"
                className={`h-16 md:h-20 w-auto object-contain transition-all duration-300 ${
                  isHomePage && !isScrolled 
                    ? 'brightness-0 invert drop-shadow-lg' 
                    : 'drop-shadow-sm'
                }`}
              />
              <span className={`font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide transition-colors duration-300 ${
                isHomePage && !isScrolled 
                  ? "text-white drop-shadow-lg" 
                  : "text-foreground"
              }`}>
                FoxWraps
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative font-medium text-sm tracking-wide transition-colors duration-300 ${
                  location.pathname === link.path
                    ? "text-primary"
                    : isHomePage && !isScrolled
                      ? "text-white/90 hover:text-white"
                      : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Link to="/contact">
              <Button variant="premium" size="default">
                Offerte Aanvragen
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden relative z-10 p-2"
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 transition-colors duration-300 ${
                isHomePage && !isScrolled ? "text-white" : "text-foreground"
              }`} />
            ) : (
              <Menu className={`w-6 h-6 transition-colors duration-300 ${
                isHomePage && !isScrolled ? "text-white" : "text-foreground"
              }`} />
            )}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          opacity: isMobileMenuOpen ? 1 : 0,
          pointerEvents: isMobileMenuOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-40 lg:hidden"
      >
        <motion.div
          initial={false}
          animate={{ opacity: isMobileMenuOpen ? 1 : 0 }}
          className="absolute inset-0 bg-background/98 backdrop-blur-xl"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <motion.div
          initial={false}
          animate={{
            y: isMobileMenuOpen ? 0 : -30,
            opacity: isMobileMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative pt-28 px-6"
        >
          <div className="flex flex-col gap-2">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, x: -40 }}
                animate={{
                  opacity: isMobileMenuOpen ? 1 : 0,
                  x: isMobileMenuOpen ? 0 : -40,
                }}
                transition={{ duration: 0.4, delay: 0.15 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  to={link.path}
                  className={`block font-display text-3xl font-semibold py-4 transition-colors ${
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: isMobileMenuOpen ? 1 : 0,
                y: isMobileMenuOpen ? 0 : 30,
              }}
              transition={{ duration: 0.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="pt-8"
            >
              <Link to="/contact">
                <Button variant="hero" className="w-full">
                  Offerte Aanvragen
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};
