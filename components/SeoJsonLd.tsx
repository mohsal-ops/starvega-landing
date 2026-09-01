import { SITE } from "@/lib/site";
import { PACKAGES } from "@/lib/pricing";

// Structured data (JSON-LD). Two schemas live here:
//   • OrganizationJsonLd - site-wide identity (rendered once in the root layout).
//   • ProductJsonLd       - the actual offer, one Offer per pack, prices pulled
//                           from lib/pricing.ts so they can never drift from the
//                           pricing popup / checkout.
// FAQPage schema is separate (components/FaqSchema.tsx). None of these still
// produce a visible Google rich-result dropdown (FAQ rich results were
// deprecated May 2026) - they're here for AI answer-engine parsing and general
// machine readability, not for a SERP widget. Don't build UI expecting one.

function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inline; no user input flows in here.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const BASE = SITE.url.replace(/\/$/, "");

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Starvega",
        url: BASE,
        logo: `${BASE}/starvega.png`,
        description: SITE.tagline,
        sameAs: [SITE.instagramProfileUrl],
      }}
    />
  );
}

export function ProductJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Restaurant website with zero-commission online ordering",
        description:
          "A fast restaurant website with its own online ordering and dashboard, built for a one-time price. No commission on orders, no monthly platform fee - the restaurant owns it.",
        brand: { "@type": "Brand", name: "Starvega" },
        url: BASE,
        image: `${BASE}/starvega.png`,
        // One Offer per pack tier - priced straight from lib/pricing.ts.
        offers: PACKAGES.map((p) => ({
          "@type": "Offer",
          name: `${p.label} package`,
          description: p.audience,
          price: p.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${BASE}/#offer`,
        })),
      }}
    />
  );
}
