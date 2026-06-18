// Helper to inject BreadcrumbList JSON-LD into document head.
// Returns a cleanup function for use in useEffect.
export interface Crumb {
  name: string;
  path: string; // root-relative, e.g. "/shop"
}

export function injectBreadcrumbJsonLd(crumbs: Crumb[]): () => void {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute("data-breadcrumb", "true");
  script.text = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${window.location.origin}${c.path}`,
    })),
  });
  document.head.appendChild(script);
  return () => {
    if (script.parentNode) script.parentNode.removeChild(script);
  };
}
