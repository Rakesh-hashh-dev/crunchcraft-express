import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Pause, RotateCcw, Star, Truck, Percent } from "lucide-react";
import { toast } from "sonner";
import { PageTransition, FadeInSection, StaggerContainer, StaggerItem } from "@/components/AnimationWrappers";

const perks = [
  { icon: Percent, title: "15% Off Every Box", desc: "Subscribers always pay less than retail." },
  { icon: Truck, title: "Free Delivery", desc: "No shipping charges, ever." },
  { icon: Star, title: "CrunchCoins", desc: "Earn loyalty points on every order. Redeem for free snacks!" },
  { icon: Gift, title: "Exclusive Drops", desc: "Early access to new flavours and limited editions." },
  { icon: Pause, title: "Pause Anytime", desc: "Life happens. Skip a month with one click." },
  { icon: RotateCcw, title: "Cancel Anytime", desc: "No contracts. No commitments. Just great snacks." },
];

const plans = [
  { name: "Starter Box", items: "3 × 80g pouches", price: 115, original: 135 },
  { name: "Family Box", items: "3 × 200g pouches", price: 280, original: 330, popular: true },
  { name: "Mega Box", items: "6 × 200g pouches", price: 530, original: 660 },
];

const Subscription = () => (
  <PageTransition>
    <div className="flex flex-col">
      <section className="bg-primary text-primary-foreground py-16 md:py-24 text-center">
        <div className="container max-w-2xl">
          <Badge className="bg-secondary text-secondary-foreground mb-6">Save 15%</Badge>
          <h1 className="text-3xl md:text-5xl mb-4">The Crunch Club</h1>
          <p className="font-body text-lg opacity-80">Your monthly supply of bold millet puffs — delivered to your door.</p>
        </div>
      </section>

      <FadeInSection>
        <section className="container py-16 md:py-24">
          <h2 className="text-2xl text-center mb-10">Choose Your Box</h2>
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => (
              <StaggerItem key={p.name}>
                <div className={`rounded-xl border p-6 flex flex-col ${p.popular ? "border-secondary bg-secondary/5 ring-2 ring-secondary" : "bg-card"}`}>
                  {p.popular && <Badge className="self-start bg-secondary text-secondary-foreground mb-3">Most Popular</Badge>}
                  <h3 className="font-heading text-xl">{p.name}</h3>
                  <p className="font-body text-sm text-muted-foreground mt-1">{p.items}</p>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-heading text-3xl text-primary">₹{p.price}</span>
                    <span className="font-body text-sm text-muted-foreground line-through">₹{p.original}</span>
                    <span className="font-body text-xs text-secondary font-bold">/month</span>
                  </div>
                  <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => toast.success(`${p.name} subscription started! 🎉`)}>
                    Subscribe Now
                  </Button>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </FadeInSection>

      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container">
          <h2 className="text-2xl text-center mb-12">Club Perks</h2>
          <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {perks.map((p) => (
              <StaggerItem key={p.title}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <p.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm">{p.title}</h3>
                    <p className="font-body text-sm text-muted-foreground mt-1">{p.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <FadeInSection>
        <section className="container py-16 md:py-24 text-center max-w-xl">
          <Star className="h-12 w-12 text-secondary mx-auto mb-4" />
          <h2 className="text-2xl mb-2">Earn CrunchCoins</h2>
          <p className="font-body text-muted-foreground mb-6">Every ₹1 spent = 1 CrunchCoin. Collect 500 coins for a free 200g pouch. Refer friends for bonus coins!</p>
          <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-heading text-sm">Join the Club</Button>
        </section>
      </FadeInSection>
    </div>
  </PageTransition>
);

export default Subscription;
