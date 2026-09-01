import Hook from "@/components/sections/Hook";
import Agitate from "@/components/sections/Agitate";
import Turn from "@/components/sections/Turn";
import Proof from "@/components/sections/Proof";
import Offer from "@/components/sections/Offer";
import Loyalty from "@/components/sections/Loyalty";
import Faq from "@/components/sections/Faq";
import InstantDemo from "@/components/sections/InstantDemo";
import { PreviewEmbed } from "@/components/PreviewEmbed";
import Footer from "@/components/Footer";
import FaqSchema from "@/components/FaqSchema";
import { ProductJsonLd } from "@/components/SeoJsonLd";
import ScrollTracker from "@/components/ScrollTracker";
import { InlineWidgetCta } from "@/components/WidgetCta";

// The funnel, in strict order - each section earns the right to the next:
// hook → agitate → the turn → proof → offer → objection-handling → single CTA.
export default function Home() {
  return (
    <main>
      <Hook />
      {/* Early door for anyone already convinced - no re-pitch, just a shortcut. */}
      <InlineWidgetCta entryPoint="post_hook" line="Already picturing it? Skip ahead." />
      <Agitate />
      <Turn />
      <Proof />
      {/* Let them EXPERIENCE the real product before they see a price. */}
      <PreviewEmbed />
      {/* Now that they've explored it, state the price. */}
      <Offer />
      <Loyalty />
      <Faq />
      {/* Personalized finale + lead capture: build a preview with THEIR details. */}
      <InlineWidgetCta entryPoint="post_proof" line="Want it with your name and menu? Build your own preview, free." />
      <InstantDemo />
      <Footer />

      <FaqSchema />
      <ProductJsonLd />
      <ScrollTracker />
    </main>
  );
}
