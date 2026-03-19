import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TrustBadges from "@/components/TrustBadges";
import ProductCard from "@/components/ProductCard";
import { flavours } from "@/lib/products";
import heroImg from "@/assets/hero-snacks.jpg";
import { ArrowRight, Sparkles } from "lucide-react";

const Index = () => {
  const [email, setEmail] = useState("");

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="CrunchCraft millet puffs" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </div>
        <div className="container relative z-10 py-20">
          <div className="max-w-lg animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary/90 px-4 py-1.5 text-xs font-bold text-secondary-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5" /> New: Dark Roast Chaat Masala
            </span>
            <h1 className="text-4xl md:text-6xl leading-tight text-background">
              Snack Smart.<br />Crunch Bold.
            </h1>
            <p className="mt-4 text-lg text-background/80 font-body">
              Millet puffs that pack flavour without the guilt. Baked, never fried. 100% compostable packaging.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/shop">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-heading text-sm">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/our-story">
                <Button size="lg" variant="outline" className="border-background/40 text-background hover:bg-background/10">
                  Our Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <TrustBadges />

      {/* Product Carousel */}
      <section className="container py-16 md:py-24">
        <h2 className="text-3xl text-center mb-2">MilLet's Pop</h2>
        <p className="text-center text-muted-foreground font-body mb-10">Choose your crunch</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {flavours.map((f) => (
            <ProductCard key={f.name} name={f.name} image={f.image} price={20} tag="Bestseller" />
          ))}
        </div>
      </section>

      {/* Why CrunchCraft */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container text-center max-w-2xl">
          <h2 className="text-3xl mb-6">Why CrunchCraft?</h2>
          <div className="grid gap-8 sm:grid-cols-3 font-body">
            <div>
              <p className="text-4xl font-heading mb-2">118</p>
              <p className="text-sm opacity-80">kcal per 30g serving</p>
            </div>
            <div>
              <p className="text-4xl font-heading mb-2">4.2g</p>
              <p className="text-sm opacity-80">Protein per serving</p>
            </div>
            <div>
              <p className="text-4xl font-heading mb-2">0%</p>
              <p className="text-sm opacity-80">Preservatives</p>
            </div>
          </div>
        </div>
      </section>

      {/* Email Signup */}
      <section className="container py-16 md:py-24 max-w-xl text-center">
        <h2 className="text-2xl mb-2">Join the Crunch Club</h2>
        <p className="font-body text-muted-foreground mb-6">Get 10% off your first order + snack drops straight to your inbox.</p>
        <form onSubmit={(e) => e.preventDefault()} className="flex gap-3">
          <Input
            placeholder="your@email.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-card"
          />
          <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Subscribe</Button>
        </form>
      </section>
    </div>
  );
};

export default Index;
