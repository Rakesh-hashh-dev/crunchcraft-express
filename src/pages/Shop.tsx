import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { flavours, sizeOptions, type Flavour } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageTransition, FadeInSection, StaggerContainer, StaggerItem } from "@/components/AnimationWrappers";

const Shop = () => {
  const [activeFilter, setActiveFilter] = useState<Flavour | "All">("All");
  const [subscription, setSubscription] = useState(false);

  const filtered = activeFilter === "All" ? flavours : flavours.filter((f) => f.name === activeFilter);

  return (
    <PageTransition>
      <div className="container py-8 md:py-16">
        <h1 className="text-2xl md:text-4xl mb-2">Shop MilLet's Pop</h1>
        <p className="font-body text-muted-foreground mb-8">Baked millet puffs in bold Indian flavours</p>

        <FadeInSection>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-8">
            {["All", ...flavours.map((f) => f.name)].map((f) => (
              <Button key={f} size="sm" variant={activeFilter === f ? "default" : "outline"}
                onClick={() => setActiveFilter(f as Flavour | "All")}
                className={`transition-all duration-200 text-xs md:text-sm ${activeFilter === f ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-primary/10"}`}>
                {f === "All" ? "All Flavours" : f}
              </Button>
            ))}
          </div>
        </FadeInSection>

        <div className="flex items-center gap-3 mb-8 p-4 rounded-lg bg-muted/60 border">
          <Switch id="sub-toggle" checked={subscription} onCheckedChange={setSubscription} />
          <Label htmlFor="sub-toggle" className="font-body cursor-pointer text-sm">Subscribe & Save 15% — delivered monthly</Label>
        </div>

        <StaggerContainer className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) =>
            sizeOptions.map((s) => (
              <StaggerItem key={`${f.name}-${s.label}`}>
                <ProductCard name={`${f.name} — ${s.label}`} image={f.image}
                  price={subscription ? Math.round(s.price * 0.85) : s.price}
                  tag={subscription ? "15% Off" : undefined} />
              </StaggerItem>
            ))
          )}
        </StaggerContainer>

        <FadeInSection>
          <section className="mt-16 rounded-xl border bg-card p-6 md:p-8 text-center">
            <h2 className="text-xl md:text-2xl mb-2">Build Your Own Bundle</h2>
            <p className="font-body text-muted-foreground mb-6 text-sm md:text-base">Pick any 3 flavours × 200g and save ₹30</p>
            <Button size="lg" className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-lg transition-all duration-200">
              Start Building →
            </Button>
          </section>
        </FadeInSection>
      </div>
    </PageTransition>
  );
};

export default Shop;
