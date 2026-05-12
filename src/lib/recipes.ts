import mangoSalsa from "@/assets/recipe-mango-salsa.jpg";
import charcuterie from "@/assets/recipe-charcuterie.jpg";
import smoothieBowl from "@/assets/recipe-smoothie-bowl.jpg";
import chaiPairing from "@/assets/recipe-chai-pairing.jpg";

export interface Recipe {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  flavour: string;
  readTime: string;
  date: string;
  tags: string[];
  ingredients: string[];
  steps: string[];
  tip?: string;
}

export const recipes: Recipe[] = [
  {
    slug: "peri-peri-mango-salsa",
    title: "Snack Pairings with Peri-Peri Fiesta",
    excerpt:
      "Pair our boldest flavour with cool mango salsa for the perfect sweet-heat balance — ready in 5 minutes.",
    image: mangoSalsa,
    flavour: "Peri-Peri Fiesta",
    readTime: "5 min read",
    date: "2026-04-02",
    tags: ["Pairing", "Quick", "Party"],
    ingredients: [
      "1 pack CrunchCraft Peri-Peri Fiesta (80g)",
      "1 ripe mango, diced",
      "2 tbsp red onion, finely chopped",
      "1 tbsp fresh coriander, chopped",
      "Juice of half a lime",
      "A pinch of pink salt",
    ],
    steps: [
      "Combine mango, red onion, coriander, lime juice and salt in a bowl.",
      "Let the salsa rest for 2 minutes so the flavours mingle.",
      "Tip Peri-Peri puffs onto a serving plate, spoon salsa alongside.",
      "Scoop, crunch, repeat. Serve immediately for maximum crunch.",
    ],
    tip: "Cold mango cools the chilli without dulling it — this pairing is a crowd favourite at house parties.",
  },
  {
    slug: "millet-charcuterie-board",
    title: "Build a Better Charcuterie Board with Millet Puffs",
    excerpt:
      "Swap the usual crisps for crunchy popped millet — a high-protein, gluten-free upgrade your guests will notice.",
    image: charcuterie,
    flavour: "Himalayan Pink Salt & Lime",
    readTime: "8 min read",
    date: "2026-03-21",
    tags: ["Entertaining", "Gluten-Free"],
    ingredients: [
      "1 pack CrunchCraft Pink Salt & Lime (200g)",
      "Aged cheddar, cubed",
      "Fresh grapes",
      "Castelvetrano olives",
      "Whole-grain crackers",
      "Honey or fig jam (optional)",
    ],
    steps: [
      "Start with a large wooden board. Place small bowls for olives and jam.",
      "Pile millet puffs in two corners — they double as a crunchy crouton.",
      "Fan crackers in a curve, then tuck cheese cubes and grapes into the gaps.",
      "Garnish with rosemary sprigs. Serve with a chilled white wine.",
    ],
    tip: "The lime cuts beautifully through aged cheddar — much brighter than a typical cracker.",
  },
  {
    slug: "mint-coriander-smoothie-bowl",
    title: "Green Smoothie Bowl, Crunchier",
    excerpt:
      "A spoonful of Mint Coriander puffs adds savoury depth to your morning smoothie bowl. Try it once, never go back.",
    image: smoothieBowl,
    flavour: "Mint Coriander Chutney",
    readTime: "6 min read",
    date: "2026-03-08",
    tags: ["Breakfast", "Healthy"],
    ingredients: [
      "1 frozen banana",
      "1 cup spinach",
      "1/2 cup Greek yoghurt",
      "1/4 cup CrunchCraft Mint Coriander Chutney puffs",
      "1 tsp chia seeds",
      "Fresh mint to garnish",
    ],
    steps: [
      "Blend banana, spinach and yoghurt until thick and smooth.",
      "Pour into a bowl and smooth the top with a spoon.",
      "Sprinkle puffs along one side, banana slices on the other.",
      "Top with chia seeds and a sprig of mint. Eat immediately.",
    ],
    tip: "The savoury, herby crunch contrasts the sweet banana — surprisingly addictive.",
  },
  {
    slug: "chai-and-chaat-masala-pairing",
    title: "Chai + Chaat Masala = The Best Tea Break",
    excerpt:
      "Why reach for a biscuit when a handful of Dark Roast Chaat Masala puffs hits every note your chai is missing?",
    image: chaiPairing,
    flavour: "Dark Roast Chaat Masala",
    readTime: "4 min read",
    date: "2026-02-19",
    tags: ["Pairing", "Tea Break"],
    ingredients: [
      "1 cup masala chai (your favourite recipe)",
      "1 small bowl CrunchCraft Dark Roast Chaat Masala puffs",
      "Cardamom and cinnamon for garnish",
    ],
    steps: [
      "Brew chai strong — full-fat milk, a generous pinch of cardamom.",
      "Tip puffs into a small bowl beside your cup.",
      "Sip, crunch, repeat. The roasted notes echo the spices in chai beautifully.",
    ],
    tip: "Best enjoyed during the 4pm slump. Tag us on Instagram with your chai-and-crunch combo.",
  },
];

export const getRecipe = (slug: string) => recipes.find((r) => r.slug === slug);
