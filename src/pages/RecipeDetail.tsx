import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getRecipe, recipes } from "@/lib/recipes";
import { injectBreadcrumbJsonLd } from "@/lib/breadcrumbs";
import { PageTransition, FadeInSection } from "@/components/AnimationWrappers";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import NotFound from "./NotFound";

const RecipeDetail = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const recipe = getRecipe(slug);

  useEffect(() => {
    if (!recipe) return;
    document.title = `${recipe.title} | CrunchCraft Recipes`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", recipe.excerpt);

    // Recipe JSON-LD
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Recipe",
      name: recipe.title,
      image: [`${window.location.origin}${recipe.image}`],
      description: recipe.excerpt,
      datePublished: recipe.date,
      author: { "@type": "Organization", name: "CrunchCraft Foods" },
      recipeIngredient: recipe.ingredients,
      recipeInstructions: recipe.steps.map((s) => ({ "@type": "HowToStep", text: s })),
      keywords: recipe.tags.join(", "),
    });
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [recipe]);

  if (!recipe) return <NotFound />;

  const related = recipes.filter((r) => r.slug !== recipe.slug).slice(0, 3);

  return (
    <PageTransition>
      <article className="container py-10 md:py-16 max-w-3xl">
        <Link
          to="/recipes"
          className="inline-flex items-center gap-1 text-sm font-body text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> All recipes
        </Link>

        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-3">
            {recipe.tags.map((t) => (
              <span key={t} className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-body font-bold">
                {t}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-5xl leading-tight">{recipe.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-body text-muted-foreground">
            <Clock className="h-4 w-4" /> {recipe.readTime}
            <span>•</span>
            <span>Pairs with <span className="font-bold text-foreground">{recipe.flavour}</span></span>
          </div>
        </header>

        <div className="overflow-hidden rounded-2xl bg-muted mb-10">
          <img src={recipe.image} alt={recipe.title} className="w-full aspect-[16/10] object-cover" />
        </div>

        <FadeInSection>
          <p className="font-body text-lg text-muted-foreground mb-10">{recipe.excerpt}</p>
        </FadeInSection>

        <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
          <FadeInSection>
            <section>
              <h2 className="text-xl mb-4">Ingredients</h2>
              <ul className="space-y-2 font-body text-sm">
                {recipe.ingredients.map((i) => (
                  <li key={i} className="flex gap-2 border-b pb-2">
                    <span className="text-primary">•</span>
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            </section>
          </FadeInSection>

          <FadeInSection>
            <section>
              <h2 className="text-xl mb-4">Method</h2>
              <ol className="space-y-4 font-body">
                {recipe.steps.map((s, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-heading text-sm">
                      {i + 1}
                    </span>
                    <p className="pt-0.5 text-sm leading-relaxed">{s}</p>
                  </li>
                ))}
              </ol>

              {recipe.tip && (
                <aside className="mt-8 rounded-xl bg-secondary/10 border border-secondary/30 p-4 flex gap-3">
                  <Sparkles className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-heading text-sm text-secondary mb-1">Crunch Tip</p>
                    <p className="font-body text-sm text-foreground">{recipe.tip}</p>
                  </div>
                </aside>
              )}
            </section>
          </FadeInSection>
        </div>

        {/* Related */}
        <section className="mt-16 border-t pt-10">
          <h2 className="text-2xl mb-6">More to crunch on</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                to={`/recipes/${r.slug}`}
                className="group rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={r.image}
                    alt={r.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="p-3 font-heading text-sm leading-tight">{r.title}</p>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </PageTransition>
  );
};

export default RecipeDetail;
