// Runs after `vite build` via the postbuild npm hook; writes dist/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://snack-smart-shop.lovable.app";

// Kept in sync manually with src/lib/products.ts and src/lib/recipes.ts.
const flavours = [
  "Peri-Peri Fiesta",
  "Himalayan Pink Salt & Lime",
  "Dark Roast Chaat Masala",
  "Tangy Tomato Twist",
  "Cheesy Jalapeño",
  "Mint Coriander Chutney",
];

const recipes = [
  { slug: "peri-peri-mango-salsa", date: "2026-04-02" },
  { slug: "millet-charcuterie-board", date: "2026-03-21" },
  { slug: "mint-coriander-smoothie-bowl", date: "2026-03-08" },
  { slug: "chai-and-chaat-masala-pairing", date: "2026-02-19" },
];

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const today = new Date().toISOString().slice(0, 10);

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0", lastmod: today },
  { path: "/shop", changefreq: "weekly", priority: "0.9", lastmod: today },
  { path: "/product", changefreq: "weekly", priority: "0.8", lastmod: today },
  { path: "/our-story", changefreq: "monthly", priority: "0.6", lastmod: today },
  { path: "/subscription", changefreq: "monthly", priority: "0.7", lastmod: today },
  { path: "/recipes", changefreq: "weekly", priority: "0.8", lastmod: today },
  // Per-flavour product pages (filtered via query param)
  ...flavours.map((name) => ({
    path: `/product?flavour=${encodeURIComponent(name)}`,
    changefreq: "weekly" as const,
    priority: "0.7",
    lastmod: today,
  })),
  // Recipe posts
  ...recipes.map((r) => ({
    path: `/recipes/${r.slug}`,
    changefreq: "monthly" as const,
    priority: "0.6",
    lastmod: r.date,
  })),
];

function generateSitemap(items: SitemapEntry[]) {
  const urls = items.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("dist/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
