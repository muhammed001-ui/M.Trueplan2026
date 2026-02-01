import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, CheckCircle2, Shield } from "lucide-react";

export default function LandingPage() {
  const { isLoading } = useAuth();

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Nav */}
      <nav className="container mx-auto px-6 py-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-xl">
            26
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">Plan2026</span>
        </div>
        <Button onClick={handleLogin} variant="outline" className="rounded-full px-6 font-semibold">
          Log In
        </Button>
      </nav>

      {/* Hero */}
      <main className="container mx-auto px-6 flex-1 flex flex-col md:flex-row items-center gap-12 lg:gap-20 relative z-10 py-12 lg:py-24">
        {/* Text Content */}
        <div className="flex-1 space-y-8 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight">
            Master your year,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              one day at a time.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto md:mx-0">
            The minimal, elegant daily planner for 2026. Visualize your entire year, track habits, and never miss a beat.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <Button 
              onClick={handleLogin} 
              size="lg" 
              className="w-full sm:w-auto px-8 h-14 rounded-full text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <div className="pt-8 flex items-center justify-center md:justify-start gap-8 text-sm font-medium text-muted-foreground/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Full 2026 Grid</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Auto-save</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span>Secure & Private</span>
            </div>
          </div>
        </div>

        {/* Visual Preview */}
        <div className="flex-1 w-full max-w-xl perspective-1000">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-card rounded-2xl p-6 border border-border/50 shadow-2xl transform transition-transform duration-500 hover:rotate-1 hover:scale-[1.02]">
              {/* Mock Interface */}
              <div className="flex gap-4 overflow-hidden mask-image-linear-to-r">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-48 space-y-3 opacity-80">
                    <div className="h-4 w-12 bg-primary/20 rounded-full" />
                    <div className="h-8 w-24 bg-foreground/10 rounded-lg" />
                    <div className="space-y-2 pt-2">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <div key={j} className="h-10 w-full bg-muted/50 rounded border border-dashed border-border/50" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
        © 2025 Schedule Manager. Built for the future.
      </footer>
    </div>
  );
}
