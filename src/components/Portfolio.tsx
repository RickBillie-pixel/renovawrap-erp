import { motion } from "framer-motion";
import { useState } from "react";

const portfolioItems = [
  {
    id: 1,
    category: "keuken",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800",
    title: "Moderne Witte Keuken",
    location: "Amsterdam",
  },
  {
    id: 2,
    category: "keuken",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800",
    title: "Scandinavische Stijl",
    location: "Utrecht",
  },
  {
    id: 3,
    category: "interieur",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800",
    title: "Luxe Woonkamer",
    location: "Den Haag",
  },
  {
    id: 4,
    category: "zakelijk",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800",
    title: "Kantoor Renovatie",
    location: "Rotterdam",
  },
  {
    id: 5,
    category: "keuken",
    image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=800",
    title: "Zwarte Matte Keuken",
    location: "Haarlem",
  },
  {
    id: 6,
    category: "interieur",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800",
    title: "Minimalistische Slaapkamer",
    location: "Amstelveen",
  },
];

const categories = [
  { id: "all", label: "Alles" },
  { id: "keuken", label: "Keuken" },
  { id: "interieur", label: "Interieur" },
  { id: "zakelijk", label: "Zakelijk" },
];

export const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredItems =
    activeCategory === "all"
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeCategory);

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.03),transparent_50%)]" />
      
      <div className="container-wide relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block text-primary font-medium text-sm tracking-wider uppercase mb-6"
          >
            Portfolio
          </motion.span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Recente Projecten
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl">
            Bekijk onze meest recente transformaties en laat u inspireren.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={`px-8 py-3 rounded-full font-medium transition-all duration-500 ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-primary"
                  : "bg-card border border-border text-foreground hover:border-primary/30"
              }`}
            >
              {category.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Masonry Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer shadow-soft hover:shadow-elegant transition-shadow duration-500"
            >
              <motion.img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <span className="text-primary-foreground/80 text-sm font-medium uppercase tracking-wider">
                  {item.location}
                </span>
                <h3 className="font-display text-2xl font-semibold text-primary-foreground mt-2">
                  {item.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
