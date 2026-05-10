import periPeriImg from "@/assets/product-peri-peri.jpg";
import saltLimeImg from "@/assets/product-salt-lime.jpg";
import chaatMasalaImg from "@/assets/product-chaat-masala.jpg";
import tomatoTwistImg from "@/assets/product-tomato-twist.jpg";
import cheesyJalapenoImg from "@/assets/product-cheesy-jalapeno.jpg";
import mintCorianderImg from "@/assets/product-mint-coriander.jpg";

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

export const flavours: { name: Flavour; image: string; color: string }[] = [
  { name: "Peri-Peri Fiesta", image: periPeriImg, color: "bg-red-100" },
  { name: "Himalayan Pink Salt & Lime", image: saltLimeImg, color: "bg-green-100" },
  { name: "Dark Roast Chaat Masala", image: chaatMasalaImg, color: "bg-amber-100" },
  { name: "Tangy Tomato Twist", image: tomatoTwistImg, color: "bg-orange-100" },
  { name: "Cheesy Jalapeño", image: cheesyJalapenoImg, color: "bg-yellow-100" },
  { name: "Mint Coriander Chutney", image: mintCorianderImg, color: "bg-emerald-100" },
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
