import { FAQS } from "@/lib/faq";

// FAQPage JSON-LD (same pattern as the client sites' FaqSchema) so the
// objection-handling section can earn rich-result visibility. Server-rendered.
export default function FaqSchema() {
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
