import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { USPSection } from "@/components/USPSection";
import { HowItWorks } from "@/components/HowItWorks";
import { Portfolio } from "@/components/Portfolio";
import { Testimonials } from "@/components/Testimonials";
import { CTASection } from "@/components/CTASection";
import { PageTransition } from "@/components/PageTransition";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <PageTransition>
      <SEO
        title="QualityWrap.nl - Premium Keuken & Interieur Wrappen | 5 Jaar Garantie"
        description="Transformeer uw keuken of interieur in slechts één dag met hoogwaardige wrap-folie van 3M en Avery. Premium kwaliteit, 5 jaar garantie. Vraag gratis offerte aan!"
        keywords="keuken wrappen, interieur wrappen, wrap folie, keuken renovatie, 3M wrap, Avery wrap, keuken transformatie, goedkope keuken renovatie"
        canonical="https://qualitywrap.nl"
        ogTitle="QualityWrap.nl - Premium Keuken & Interieur Wrappen"
        ogDescription="Transformeer uw keuken of interieur in slechts één dag. Professioneel resultaat, 5 jaar garantie."
      />
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
