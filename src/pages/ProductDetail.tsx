import { useEffect, useState } from "react";
import { flavours, sizeOptions, nutritionFacts, certifications, type Flavour, type Size } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShoppingCart, ShieldCheck } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { PageTransition, FadeInSection } from "@/components/AnimationWrappers";
import { motion, AnimatePresence } from "framer-motion";
import { injectBreadcrumbJsonLd } from "@/lib/breadcrumbs";

const ProductDetail = () => {
  const [selectedFlavour, setSelectedFlavour] = useState<Flavour>("Peri-Peri Fiesta");
  const [selectedSize, setSelectedSize] = useState<Size>("80g");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const { addItem } = useCart();

  const currentFlavour = flavours.find((f) => f.name === selectedFlavour)!;
  const currentPrice = sizeOptions.find((s) => s.label === selectedSize)!.price;
  const gallery = currentFlavour.gallery ?? [currentFlavour.image];

  // Reset to first image when flavour changes; auto-rotate every 4s
  useEffect(() => {
    setGalleryIndex(0);
  }, [selectedFlavour]);

  useEffect(() => {
    if (gallery.length <= 1) return;
    const id = window.setInterval(() => {
      setGalleryIndex((i) => (i + 1) % gallery.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [gallery.length, selectedFlavour]);

  const activeImage = gallery[galleryIndex] ?? currentFlavour.image;

  // SEO: title + Product/Offer JSON-LD
  useEffect(() => {
    document.title = `${selectedFlavour} — CrunchCraft Popped Millet`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute(
        "content",
        `${selectedFlavour} popped millet puffs — gluten-free, baked, FSSAI certified. Available in 30g, 80g and 200g packs.`,
      );
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: `CrunchCraft ${selectedFlavour} Popped Millet Puffs`,
      description: `${selectedFlavour} popped millet puffs by CrunchCraft Foods. Baked not fried, gluten-free, FSSAI certified, 100% compostable packaging.`,
      image: [`${window.location.origin}${currentFlavour.image}`],
      brand: { "@type": "Brand", name: "CrunchCraft Foods" },
      category: "Snacks",
      offers: sizeOptions.map((s) => ({
        "@type": "Offer",
        sku: `cc-${selectedFlavour.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${s.label}`,
        name: `${selectedFlavour} — ${s.label}`,
        price: s.price.toFixed(2),
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        url: `${window.location.origin}/product?flavour=${encodeURIComponent(selectedFlavour)}&size=${s.label}`,
      })),
    });
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [selectedFlavour, currentFlavour.image]);

  return (
    <PageTransition>
      <div className="container py-10 md:py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-xl bg-muted relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${currentFlavour.name}-${galleryIndex}`}
                  src={activeImage}
                  alt={`${currentFlavour.name} — view ${galleryIndex + 1}`}
                  className="w-full aspect-square object-cover"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                />
              </AnimatePresence>
              {gallery.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {gallery.map((_, i) => (
                    <button
                      key={i}
                      aria-label={`Show image ${i + 1}`}
                      onClick={() => setGalleryIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === galleryIndex ? "w-6 bg-primary" : "w-2 bg-background/70 hover:bg-background"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setGalleryIndex(i)}
                    className={`overflow-hidden rounded-lg border-2 transition-all ${
                      i === galleryIndex ? "border-primary" : "border-transparent hover:border-border"
                    }`}
                    aria-label={`Thumbnail ${i + 1}`}
                  >
                    <img src={src} alt="" className="w-full aspect-square object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm font-body text-secondary font-bold uppercase tracking-wider">MilLet's Pop</p>
              <h1 className="text-3xl md:text-4xl mt-1">{selectedFlavour}</h1>
              <p className="text-2xl font-heading text-primary mt-2">₹{currentPrice}</p>
            </div>

            <div>
              <p className="font-body text-sm font-bold mb-3">Flavour</p>
              <div className="flex flex-wrap gap-3">
                {flavours.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setSelectedFlavour(f.name)}
                    className={`rounded-full border px-4 py-2 text-sm font-body transition-all ${
                      selectedFlavour === f.name ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-body text-sm font-bold mb-3">Size</p>
              <div className="flex gap-3">
                {sizeOptions.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSelectedSize(s.label)}
                    className={`rounded-lg border px-5 py-3 text-center font-body transition-all ${
                      selectedSize === s.label ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary"
                    }`}
                  >
                    <span className="block text-sm font-bold">{s.label}</span>
                    <span className="block text-xs mt-0.5">₹{s.price}</span>
                  </button>
                ))}
              </div>
            </div>

            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-heading text-sm w-full md:w-auto"
                onClick={() => addItem(selectedFlavour, selectedSize)}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart — ₹{currentPrice}
              </Button>
            </motion.div>

            <div className="flex flex-wrap gap-3">
              {certifications.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-body text-muted-foreground">
                  <ShieldCheck className="h-3 w-3 text-primary" /> {c}
                </span>
              ))}
            </div>

            <FadeInSection>
              <Accordion type="single" collapsible className="border rounded-lg">
                <AccordionItem value="nutrition" className="border-0">
                  <AccordionTrigger className="px-4 font-heading text-sm">Nutrition Facts (per 30g)</AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 font-body text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ["Calories", `${nutritionFacts.calories} kcal`],
                        ["Protein", `${nutritionFacts.protein}g`],
                        ["Fibre", `${nutritionFacts.fibre}g`],
                        ["Fat", `${nutritionFacts.fat}g`],
                        ["Carbs", `${nutritionFacts.carbs}g`],
                        ["Sodium", `${nutritionFacts.sodium}mg`],
                      ].map(([label, val]) => (
                        <div key={label} className="flex justify-between border-b pb-2"><span>{label}</span><span className="font-bold">{val}</span></div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </FadeInSection>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ProductDetail;
