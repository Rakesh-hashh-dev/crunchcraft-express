import periPeriImg from "@/assets/product-peri-peri.jpg";
import periPeri2Img from "@/assets/product-peri-peri-2.jpg";
import saltLimeImg from "@/assets/product-salt-lime.jpg";
import saltLime2Img from "@/assets/product-salt-lime-2.jpg";
import chaatMasalaImg from "@/assets/product-chaat-masala.jpg";
import chaatMasala2Img from "@/assets/product-chaat-masala-2.jpg";
import tomatoTwistImg from "@/assets/product-tomato-twist.jpg";
import tomatoTwist2Img from "@/assets/product-tomato-twist-2.jpg";
import cheesyJalapenoImg from "@/assets/product-cheesy-jalapeno.jpg";
import cheesyJalapeno2Img from "@/assets/product-cheesy-jalapeno-2.jpg";
import mintCorianderImg from "@/assets/product-mint-coriander.jpg";
import mintCoriander2Img from "@/assets/product-mint-coriander-2.jpg";

export type Flavour =
  | "Peri-Peri Fiesta"
  | "Himalayan Pink Salt & Lime"
  | "Dark Roast Chaat Masala"
  | "Tangy Tomato Twist"
  | "Cheesy Jalapeño"
  | "Mint Coriander Chutney";
export type Size = "30g" | "80g" | "200g";

export const sizeOptions: { label: Size; price: number }[] = [
  { label: "30g", price: 20 },
  { label: "80g", price: 45 },
  { label: "200g", price: 110 },
];

export const flavours: { name: Flavour; image: string; gallery: string[]; color: string }[] = [
  { name: "Peri-Peri Fiesta", image: periPeriImg, gallery: [periPeriImg, periPeri2Img], color: "bg-red-100" },
  { name: "Himalayan Pink Salt & Lime", image: saltLimeImg, gallery: [saltLimeImg, saltLime2Img], color: "bg-green-100" },
  { name: "Dark Roast Chaat Masala", image: chaatMasalaImg, gallery: [chaatMasalaImg, chaatMasala2Img], color: "bg-amber-100" },
  { name: "Tangy Tomato Twist", image: tomatoTwistImg, gallery: [tomatoTwistImg, tomatoTwist2Img], color: "bg-orange-100" },
  { name: "Cheesy Jalapeño", image: cheesyJalapenoImg, gallery: [cheesyJalapenoImg, cheesyJalapeno2Img], color: "bg-yellow-100" },
  { name: "Mint Coriander Chutney", image: mintCorianderImg, gallery: [mintCorianderImg, mintCoriander2Img], color: "bg-emerald-100" },
];

export const nutritionFacts = {
  servingSize: "30g",
  calories: 118,
  protein: 4.2,
  fibre: 3.8,
  fat: 2.1,
  carbs: 20.5,
  sodium: 180,
};

export const certifications = ["Gluten-Free", "FSSAI Certified", "100% Compostable Packaging", "No Preservatives", "Baked, Not Fried"];
