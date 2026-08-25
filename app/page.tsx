import Hook from "@/components/sections/Hook";
import Agitate from "@/components/sections/Agitate";
import Turn from "@/components/sections/Turn";
import Proof from "@/components/sections/Proof";
import Offer from "@/components/sections/Offer";
import Faq from "@/components/sections/Faq";
import InstantDemo from "@/components/sections/InstantDemo";
import Footer from "@/components/Footer";
import FaqSchema from "@/components/FaqSchema";
import ScrollTracker from "@/components/ScrollTracker";
import { InlineWidgetCta } from "@/components/WidgetCta";

// The funnel, in strict order — each section earns the right to the next:
// hook → agitate → the turn → proof → offer → objection-handling → single CTA.
export default function Home() {
  return (
    <main>
      <Hook />
      {/* Early door for anyone already convinced — no re-pitch, just a shortcut. */}
      <InlineWidgetCta entryPoint="post_hook" line="Already picturing it? Skip ahead." />
      <Agitate />
      <Turn />
      <Proof />
      {/* Natural decision point once credibility's established, before the long stretch. */}
      <InlineWidgetCta entryPoint="post_proof" line="Seen enough? Build yours now — free." />
      <Offer />
      <Faq />
      <InstantDemo />
      <Footer />

      <FaqSchema />
      <ScrollTracker />
    </main>
  );
}
