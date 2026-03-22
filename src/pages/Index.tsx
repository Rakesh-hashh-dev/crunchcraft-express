import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TrustBadges from "@/components/TrustBadges";
import ProductCard from "@/components/ProductCard";
import { flavours } from "@/lib/products";
import heroImg from "@/assets/hero-snacks.jpg";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageTransition, FadeInSection, StaggerContainer, StaggerItem } from "@/components/AnimationWrappers";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <PageTransition>
      <div className="flex flex-col">
        {/* Hero */}
        <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <motion.img
              src={heroImg}
              alt="CrunchCraft millet puffs"
              className="h-full w-full object-cover"
              initial={{ scale: 1.15, filter: "blur(4px)" }}
              animate={{ scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/60 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            />
          </div>
          <div className="container relative z-10 py-16 md:py-20">
            <div className="max-w-lg">
              <motion.span
                className="inline-flex items-center gap-2 rounded-full bg-secondary/90 px-4 py-1.5 text-xs font-bold text-secondary-foreground mb-6"
                initial={{ opacity: 0, x: -30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              >
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </motion.span>
                New: Dark Roast Chaat Masala
              </motion.span>

              <motion.h1
                className="text-3xl sm:text-4xl md:text-6xl leading-tight text-background"
                initial={{ opacity: 0, y: 50, clipPath: "inset(0 0 100% 0)" }}
                animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                Snack Smart.<br />Crunch Bold.
              </motion.h1>

              <motion.p
                className="mt-4 text-base md:text-lg text-background/80 font-body"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.9, ease: "easeOut" }}
              >
                Millet puffs that pack flavour without the guilt. Baked, never fried. 100% compostable packaging.
              </motion.p>

              <motion.div
                className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
              >
                <Link to="/shop" className="w-full sm:w-auto">
                  <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                    <Button size="lg" className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-xl transition-shadow duration-300 font-heading text-sm">
                      Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/our-story" className="w-full sm:w-auto">
                  <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                    <Button size="lg" className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-xl transition-shadow duration-300 font-heading text-sm">
                      Our Story
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        <TrustBadges />

        {/* Product Carousel */}
        <section className="container py-12 md:py-24">
          <motion.h2
            className="text-2xl md:text-3xl text-center mb-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            MilLet's Pop
          </motion.h2>
          <motion.p
            className="text-center text-muted-foreground font-body mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Choose your crunch
          </motion.p>
          <motion.div
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.18 } } }}
          >
            {flavours.map((f) => (
              <motion.div
                key={f.name}
                variants={{
                  hidden: { opacity: 0, y: 40, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard name={f.name} image={f.image} price={20} tag="Bestseller" />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Why CrunchCraft */}
        <section className="bg-primary text-primary-foreground py-12 md:py-24 overflow-hidden">
          <div className="container text-center max-w-2xl">
            <motion.h2
              className="text-2xl md:text-3xl mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              Why CrunchCraft?
            </motion.h2>
            <motion.div
              className="grid gap-8 grid-cols-1 sm:grid-cols-3 font-body"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.2 } } }}
            >
              {[
                { val: "118", label: "kcal per 30g serving" },
                { val: "4.2g", label: "Protein per serving" },
                { val: "0%", label: "Preservatives" },
              ].map((s) => (
                <motion.div
                  key={s.val}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.9 },
                    visible: { opacity: 1, y: 0, scale: 1 },
                  }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="text-4xl font-heading mb-2">{s.val}</p>
                  <p className="text-sm opacity-80">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Index;
