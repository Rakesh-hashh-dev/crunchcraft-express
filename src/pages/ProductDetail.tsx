import { useState } from "react";
import { flavours, sizeOptions, nutritionFacts, certifications, type Flavour, type Size } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShoppingCart, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const ProductDetail = () => {
  const [selectedFlavour, setSelectedFlavour] = useState<Flavour>("Peri-Peri Fiesta");
  const [selectedSize, setSelectedSize] = useState<Size>("80g");

  const currentFlavour = flavours.find((f) => f.name === selectedFlavour)!;
  const currentPrice = sizeOptions.find((s) => s.label === selectedSize)!.price;

  return (
    <div className="container py-10 md:py-16">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-xl bg-muted">
          <img src={currentFlavour.image} alt={currentFlavour.name} className="w-full aspect-square object-cover" />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm font-body text-secondary font-bold uppercase tracking-wider">MilLet's Pop</p>
            <h1 className="text-3xl md:text-4xl mt-1">{selectedFlavour}</h1>
            <p className="text-2xl font-heading text-primary mt-2">₹{currentPrice}</p>
          </div>

          {/* Flavour selector */}
          <div>
            <p className="font-body text-sm font-bold mb-3">Flavour</p>
            <div className="flex flex-wrap gap-3">
              {flavours.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setSelectedFlavour(f.name)}
                  className={`rounded-full border px-4 py-2 text-sm font-body transition-all ${
                    selectedFlavour === f.name
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary"
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div>
            <p className="font-body text-sm font-bold mb-3">Size</p>
            <div className="flex gap-3">
              {sizeOptions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSelectedSize(s.label)}
                  className={`rounded-lg border px-5 py-3 text-center font-body transition-all ${
                    selectedSize === s.label
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary"
                  }`}
                >
                  <span className="block text-sm font-bold">{s.label}</span>
                  <span className="block text-xs mt-0.5">₹{s.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add to cart */}
          <Button
            size="lg"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-heading text-sm w-full md:w-auto"
            onClick={() => toast.success(`${selectedFlavour} (${selectedSize}) added to cart!`)}
          >
            <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart — ₹{currentPrice}
          </Button>

          {/* Certifications strip */}
          <div className="flex flex-wrap gap-3">
            {certifications.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-body text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-primary" /> {c}
              </span>
            ))}
          </div>

          {/* Nutrition Accordion */}
          <Accordion type="single" collapsible className="border rounded-lg">
            <AccordionItem value="nutrition" className="border-0">
              <AccordionTrigger className="px-4 font-heading text-sm">Nutrition Facts (per 30g)</AccordionTrigger>
              <AccordionContent className="px-4 pb-4 font-body text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between border-b pb-2"><span>Calories</span><span className="font-bold">{nutritionFacts.calories} kcal</span></div>
                  <div className="flex justify-between border-b pb-2"><span>Protein</span><span className="font-bold">{nutritionFacts.protein}g</span></div>
                  <div className="flex justify-between border-b pb-2"><span>Fibre</span><span className="font-bold">{nutritionFacts.fibre}g</span></div>
                  <div className="flex justify-between border-b pb-2"><span>Fat</span><span className="font-bold">{nutritionFacts.fat}g</span></div>
                  <div className="flex justify-between border-b pb-2"><span>Carbs</span><span className="font-bold">{nutritionFacts.carbs}g</span></div>
                  <div className="flex justify-between border-b pb-2"><span>Sodium</span><span className="font-bold">{nutritionFacts.sodium}mg</span></div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
