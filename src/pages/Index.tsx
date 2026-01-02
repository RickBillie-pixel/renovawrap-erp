import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { USPSection } from "@/components/USPSection";
import { HowItWorks } from "@/components/HowItWorks";
import { Portfolio } from "@/components/Portfolio";
import { Testimonials } from "@/components/Testimonials";
import { CTASection } from "@/components/CTASection";
import { PageTransition } from "@/components/PageTransition";

const Index = () => {
  return (
    <PageTransition>
      <main className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
        <Navbar />
        <section className="snap-start snap-always">
          <Hero />
        </section>
        <section className="snap-start snap-always min-h-screen flex items-center">
          <USPSection />
        </section>
        <section className="snap-start snap-always min-h-screen flex items-center">
          <HowItWorks />
        </section>
        <section className="snap-start snap-always min-h-screen flex items-center">
          <Portfolio />
        </section>
        <section className="snap-start snap-always min-h-screen flex items-center">
          <Testimonials />
        </section>
        <section className="snap-start snap-always">
          <CTASection />
        </section>
        <section className="snap-start snap-always">
          <Footer />
        </section>
      </main>
    </PageTransition>
  );
};

export default Index;
