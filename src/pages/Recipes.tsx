import { useEffect } from "react";
import { Link } from "react-router-dom";
import { recipes } from "@/lib/recipes";
import { PageTransition, FadeInSection, StaggerContainer, StaggerItem } from "@/components/AnimationWrappers";
import { Clock, ArrowRight } from "lucide-react";

const Recipes = () => {
  useEffect(() => {
    document.title = "Recipes & Pairings | CrunchCraft";
    const desc = document.querySelector('meta[name="description"]');
    const content = "Snack pairings, recipes and serving ideas for popped millet puffs — from peri-peri salsa to chai-time crunch.";
    if (desc) desc.setAttribute("content", content);
  }, []);

  const [hero, ...rest] = recipes;

  return (
    <PageTransition>
      <div className="container py-10 md:py-16">
        <header className="mb-10 md:mb-14 max-w-2xl">
          <p className="text-sm font-body text-secondary font-bold uppercase tracking-wider">The Crunch Journal</p>
          <h1 className="mt-2 text-3xl md:text-5xl">Recipes &amp; Snack Pairings</h1>
          <p className="mt-3 font-body text-muted-foreground">
            Quick ideas to make every pack of CrunchCraft puffs disappear faster.
          </p>
        </header>

        {/* Featured */}
        <FadeInSection>
          <Link
            to={`/recipes/${hero.slug}`}
            className="group grid gap-6 md:grid-cols-2 rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-[4/3] md:aspect-auto overflow-hidden bg-muted">
              <img
                src={hero.image}
                alt={hero.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="eager"
              />
            </div>
            <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
              <div className="flex flex-wrap gap-2">
                {hero.tags.map((t) => (
                  <span key={t} className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-body font-bold">
                    {t}
                  </span>
                ))}
              </div>
              <h2 className="text-2xl md:text-3xl">{hero.title}</h2>
              <p className="font-body text-muted-foreground">{hero.excerpt}</p>
              <div className="flex items-center gap-3 text-xs font-body text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {hero.readTime}
                <span>•</span>
                <span>Pairs with {hero.flavour}</span>
              </div>
              <span className="inline-flex items-center gap-1 font-heading text-sm text-primary group-hover:gap-2 transition-all">
                Read recipe <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </FadeInSection>

        {/* Grid */}
        <StaggerContainer className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((r) => (
            <StaggerItem key={r.slug}>
              <Link
                to={`/recipes/${r.slug}`}
                className="group flex flex-col rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow h-full"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={r.image}
                    alt={r.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-2 p-5 flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    {r.tags.slice(0, 2).map((t) => (
                      <span key={t} className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[11px] font-body">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-lg leading-tight">{r.title}</h3>
                  <p className="font-body text-sm text-muted-foreground line-clamp-2">{r.excerpt}</p>
                  <div className="mt-auto flex items-center gap-2 text-xs font-body text-muted-foreground pt-2">
                    <Clock className="h-3 w-3" /> {r.readTime}
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </PageTransition>
  );
};

export default Recipes;
