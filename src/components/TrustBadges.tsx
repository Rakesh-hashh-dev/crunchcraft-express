import { ShieldCheck, Leaf, Recycle } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "FSSAI Certified" },
  { icon: Leaf, label: "Gluten-Free" },
  { icon: Recycle, label: "Compostable Packaging" },
];

const TrustBadges = () => (
  <section className="border-y bg-muted/50">
    <div className="container py-8 flex flex-wrap justify-center gap-8 md:gap-16">
      {badges.map((b) => (
        <div key={b.label} className="flex items-center gap-3">
          <b.icon className="h-8 w-8 text-primary" />
          <span className="font-body text-sm font-bold text-foreground">{b.label}</span>
        </div>
      ))}
    </div>
  </section>
);

export default TrustBadges;
