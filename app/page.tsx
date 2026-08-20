import Hook from "@/components/sections/Hook";
import Agitate from "@/components/sections/Agitate";
import Turn from "@/components/sections/Turn";
import Proof from "@/components/sections/Proof";
import Offer from "@/components/sections/Offer";
import Faq from "@/components/sections/Faq";
import Cta from "@/components/sections/Cta";
import FaqSchema from "@/components/FaqSchema";
import ScrollTracker from "@/components/ScrollTracker";

// The funnel, in strict order — each section earns the right to the next:
// hook → agitate → the turn → proof → offer → objection-handling → single CTA.
export default function Home() {
  return (
    <main>
      <Hook />
      <Agitate />
      <Turn />
      <Proof />
      <Offer />
      <Faq />
      <Cta />

      <FaqSchema />
      <ScrollTracker />
    </main>
  );
}
