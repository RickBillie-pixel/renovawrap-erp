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
      <main className="min-h-screen bg-background">
        <Navbar />
        <Hero />
        <USPSection />
        <HowItWorks />
        <Portfolio />
        <Testimonials />
        <CTASection />
        <Footer />
      </main>
    </PageTransition>
  );
};

export default Index;
