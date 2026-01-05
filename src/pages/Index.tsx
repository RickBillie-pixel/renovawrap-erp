import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { USPSection } from "@/components/USPSection";
import { HowItWorks } from "@/components/HowItWorks";
import { Portfolio } from "@/components/Portfolio";
import { Testimonials } from "@/components/Testimonials";

import { PageTransition } from "@/components/PageTransition";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <PageTransition>
      <SEO
        title="FoxWrap.nl - Premium Keuken & Interieur Wrappen | 5 Jaar Garantie"
        description="Transformeer uw keuken of interieur in slechts één dag met hoogwaardige wrap-folie van 3M en Avery. Premium kwaliteit, 5 jaar garantie. Vraag gratis offerte aan!"
        keywords="keuken wrappen, interieur wrappen, wrap folie, keuken renovatie, 3M wrap, Avery wrap, keuken transformatie, goedkope keuken renovatie"
        canonical="https://foxwrap.nl"
        ogTitle="FoxWrap.nl - Premium Keuken & Interieur Wrappen"
        ogDescription="Transformeer uw keuken of interieur in slechts één dag. Professioneel resultaat, 5 jaar garantie."
      />
      <main className="h-screen overflow-y-scroll md:snap-y md:snap-mandatory scroll-smooth">
        <Navbar />
        <section className="md:snap-start md:snap-always">
          <Hero />
        </section>
        <section className="md:snap-start md:snap-always min-h-screen md:min-h-screen flex items-center">
          <USPSection />
        </section>
        <section className="md:snap-start md:snap-always min-h-screen md:min-h-screen flex items-center">
          <HowItWorks />
        </section>
        <section className="md:snap-start md:snap-always min-h-screen md:min-h-screen flex items-center">
          <Portfolio />
        </section>
        <section className="md:snap-start md:snap-always min-h-screen md:min-h-screen flex items-center">
          <Testimonials />
        </section>

        <section className="md:snap-start md:snap-always">
          <Footer />
        </section>
      </main>
    </PageTransition>
  );
};

export default Index;
