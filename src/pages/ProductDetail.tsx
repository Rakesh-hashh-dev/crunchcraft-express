import { useState } from "react";
import { flavours, sizeOptions, nutritionFacts, certifications, type Flavour, type Size } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShoppingCart, ShieldCheck } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { PageTransition, FadeInSection } from "@/components/AnimationWrappers";
import { motion, AnimatePresence } from "framer-motion";

const ProductDetail = () => {
  const [selectedFlavour, setSelectedFlavour] = useState<Flavour>("Peri-Peri Fiesta");
  const [selectedSize, setSelectedSize] = useState<Size>("80g");
  const { addItem } = useCart();

  const currentFlavour = flavours.find((f) => f.name === selectedFlavour)!;
  const currentPrice = sizeOptions.find((s) => s.label === selectedSize)!.price;

  return (
    <PageTransition>
      <div className="container py-10 md:py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl bg-muted">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentFlavour.name}
                src={currentFlavour.image}
                alt={currentFlavour.name}
                className="w-full aspect-square object-cover"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>
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
