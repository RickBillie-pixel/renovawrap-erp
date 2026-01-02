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
    <section className="section-padding bg-background">
      <div className="container-wide">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="text-primary font-medium text-sm tracking-wider uppercase mb-4 block">
            Portfolio
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Recente Projecten
          </h2>
          <p className="text-muted-foreground text-lg">
            Bekijk onze meest recente transformaties en laat u inspireren.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-gold"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Masonry Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <span className="text-primary text-sm font-medium uppercase tracking-wider">
                  {item.location}
                </span>
                <h3 className="font-display text-xl font-semibold text-foreground mt-1">
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
