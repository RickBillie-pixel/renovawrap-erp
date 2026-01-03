import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEO
        title="404 - Pagina Niet Gevonden | FoxWrap.nl"
        description="De pagina die u zoekt bestaat niet. Ga terug naar de homepage of bekijk onze diensten voor keuken en interieur wrappen."
        noindex={true}
      />
      <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="text-center max-w-md">
        <h1 className="mb-4 text-3xl sm:text-4xl md:text-5xl font-bold">404</h1>
        <p className="mb-6 text-base sm:text-xl text-muted-foreground">Oops! Pagina niet gevonden</p>
        <a href="/" className="inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
          Terug naar Home
        </a>
      </div>
    </div>
    </>
  );
};

export default NotFound;
