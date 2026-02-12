import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lock, Mail } from "lucide-react";
import renovaLogo from "@/assets/renova-logo.png";
import heroImage from "@/assets/wrapped-kitchen.png";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.25 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Vul alle velden in",
        description: "Email en wachtwoord zijn verplicht",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Ingelogd!",
          description: "Welkom bij het admin dashboard",
        });
        navigate("/");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Controleer uw inloggegevens";
      toast({
        title: "Inloggen mislukt",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden flex items-center justify-center p-4">
      {/* Zelfde hero-achtergrond als renovawrap.nl */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt=""
          className="w-full h-full object-cover"
          aria-hidden
        />
        <div className="absolute inset-0 bg-foreground/50 pointer-events-none" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        <motion.div
          variants={itemVariants}
          className="glass-strong rounded-2xl p-8 shadow-elegant border border-border/50"
        >
          <div className="text-center mb-8">
            <img
              src={renovaLogo}
              alt="RenovaWrap"
              className="h-14 mx-auto mb-4 w-auto object-contain drop-shadow-sm"
            />
            <h1 className="font-display text-3xl font-bold mb-2 text-foreground">
              Admin Login
            </h1>
            <p className="text-muted-foreground text-sm">
              Log in om toegang te krijgen tot het dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@renovawrap.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-foreground">
                <Lock className="w-4 h-4" />
                Wachtwoord
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              variant="hero"
              className="w-full h-11"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Inloggen...
                </>
              ) : (
                "Inloggen"
              )}
            </Button>
          </form>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-8 text-center"
        >
          <a
            href="https://rootandlogic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/50 hover:text-white/80 transition-colors duration-300"
          >
            Powered by Root & Logic
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Login;

