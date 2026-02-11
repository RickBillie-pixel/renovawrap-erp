import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import kitchenAfter from "@/assets/kitchen-after.jpg";

const testimonials = [
  {
    id: 1,
    name: "Maria van den Berg",
    location: "Amsterdam",
    rating: 5,
    text: "Onze oude eiken keuken is volledig getransformeerd naar een strakke, moderne witte keuken. Het resultaat is adembenemend en het team was ontzettend professioneel.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
  },
  {
    id: 2,
    name: "Peter de Groot",
    location: "Rotterdam",
    rating: 5,
    text: "Binnen één dag was onze keuken compleet vernieuwd. De kwaliteit van de wrap en de afwerking is uitstekend. Echt een aanrader!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
  },
  {
    id: 3,
    name: "Sophie Jansen",
    location: "Utrecht",
    rating: 5,
    text: "We hebben ons complete kantoor laten wrappen. Van bureaus tot kasten. Het ziet er fantastisch uit en onze medewerkers zijn enthousiast.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200",
  },
];

export const Testimonials = () => {
  return (
    <div className="w-full py-12 md:py-16 lg:py-24 relative overflow-hidden min-h-screen md:min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={kitchenAfter} 
          alt="Tevreden klanten keuken" 
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-foreground/60" />
      </div>
      
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container-wide relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-primary font-medium text-sm tracking-wider uppercase mb-4 block">
            Klantervaringen
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-white drop-shadow-lg">
            Wat Onze Klanten Zeggen
          </h2>
          <p className="text-white/90 text-base sm:text-lg drop-shadow-md">
            Ontdek waarom honderden tevreden klanten voor RenovaWrap kozen.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative p-8 rounded-2xl bg-card/90 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-500 group shadow-elegant"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/20" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-primary text-primary"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-muted-foreground leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                />
                <div>
                  <div className="font-display font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.location}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
