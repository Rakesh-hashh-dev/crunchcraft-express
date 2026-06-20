import { useEffect } from "react";
import milletFarmImg from "@/assets/millet-farm.jpg";
import { Leaf, Award, Recycle, Heart } from "lucide-react";
import { PageTransition, FadeInSection, StaggerContainer, StaggerItem } from "@/components/AnimationWrappers";
import { motion } from "framer-motion";
import Breadcrumbs from "@/components/Breadcrumbs";
import { injectBreadcrumbJsonLd } from "@/lib/breadcrumbs";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Our Story", path: "/our-story" },
];

const values = [
  { icon: Leaf, title: "Sustainably Sourced", desc: "Our millets come from small farms across Rajasthan and Karnataka, supporting 200+ farming families." },
  { icon: Award, title: "FSSAI Certified", desc: "Every batch is lab-tested for safety, nutrition, and consistency. Zero compromises." },
  { icon: Recycle, title: "Compostable Packaging", desc: "Our pouches break down in 90 days. No microplastics. Just soil-friendly materials." },
  { icon: Heart, title: "Community First", desc: "5% of profits go to millet-farmer cooperatives for fair pricing and agricultural training." },
];

const OurStory = () => {
  useEffect(() => injectBreadcrumbJsonLd(crumbs), []);
  return (
  <PageTransition>
    <div className="flex flex-col">
      <div className="container pt-6">
        <Breadcrumbs items={crumbs} />
      </div>
      <section className="relative h-[50vh] md:h-[60vh] flex items-end overflow-hidden">
        <motion.img
          src={milletFarmImg} alt="Millet farm at sunset" className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.2 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
        <div className="container relative z-10 pb-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h1 className="text-3xl md:text-5xl text-background">Our Story</h1>
            <p className="mt-2 text-lg text-background/80 font-body max-w-lg">From millet fields to your snack bowl — the CrunchCraft journey.</p>
          </motion.div>
        </div>
      </section>

      <FadeInSection>
        <section className="container py-16 md:py-24 max-w-3xl">
          <h2 className="text-2xl mb-6">It Started With a Question</h2>
          <div className="font-body text-muted-foreground space-y-4 leading-relaxed">
            <p>In 2023, our founder Meera Sharma asked herself a simple question: <em>"Why can't healthy snacks taste incredible?"</em></p>
            <p>Growing up in Jodhpur, millets were a staple — bajra rotis, ragi porridge, jowar khichdi. But in urban India, millets had been forgotten, replaced by ultra-processed snacks loaded with preservatives and empty calories.</p>
            <p>Meera partnered with food scientists and millet farmers to create something new: air-puffed millet snacks seasoned with bold Indian flavours. No frying. No artificial anything. Just clean ingredients and unapologetic taste.</p>
            <p>CrunchCraft Foods was born — a brand built on the belief that snacking should nourish, not compromise.</p>
          </div>
        </section>
      </FadeInSection>

      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container">
          <h2 className="text-2xl text-center mb-12">What We Stand For</h2>
          <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <StaggerItem key={v.title}>
                <div className="text-center">
                  <v.icon className="h-10 w-10 mx-auto mb-4 text-secondary" />
                  <h3 className="font-heading text-base mb-2">{v.title}</h3>
                  <p className="font-body text-sm opacity-80">{v.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </div>
  </PageTransition>
  );
};

export default OurStory;
