import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lock, Mail } from "lucide-react";

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

      if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: "Ingelogd!",
          description: "Welkom bij het admin dashboard",
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Inloggen mislukt",
        description: error.message || "Controleer uw inloggegevens",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-elegant">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-elegant">
              <Lock className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2 text-foreground">
              Admin Login
            </h1>
            <p className="text-muted-foreground text-sm">
              Log in om toegang te krijgen tot het dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@foxwrap.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
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
        </div>
        <div className="mt-8 text-center">
          <a 
            href="https://rootandlogic.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs text-muted-foreground/30 hover:text-muted-foreground transition-colors"
          >
            Powered by Root & Logic
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

