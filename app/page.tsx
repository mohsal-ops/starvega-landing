import Hook from "@/components/sections/Hook";
import Problem from "@/components/sections/Problem";
import RegularsLoop from "@/components/sections/RegularsLoop";
import Proof from "@/components/sections/Proof";
import Loyalty from "@/components/sections/Loyalty";
import Toolkit from "@/components/sections/Toolkit";
import Offer from "@/components/sections/Offer";
import Steps from "@/components/sections/Steps";
import Signup from "@/components/sections/Signup";
import Footer from "@/components/Footer";
import FaqSchema from "@/components/FaqSchema";
import { ProductJsonLd } from "@/components/SeoJsonLd";
import ScrollTracker from "@/components/ScrollTracker";

// Offer v3 funnel (regulars, not commission). One ask ("Get my free mockup" =
// bag card + site sample): hero -> the loop (animated: app order -> bag card ->
// scan -> direct order -> text club -> slow-night text) -> repeat-order
// calculator -> proof -> toolkit -> loyalty -> plans (founding / regulars /
// own it, guarantee, dashboard preview, compare) -> 6 steps -> FAQ + form.
// Before v3:
// The funnel, one ask ("Get my free mockup"): hero (pitch + form + live demo) →
// profit calculator (red loss / green gain) → proof (Southern Jerks) → loyalty
// club → offer (prices secondary) → how it works (5 steps) → FAQ + form. Most real visitors never leave the hero, so
// the form is there first; every other CTA scrolls back to the nearest form.
// The founding-spots count on the plans is live data: rebuild at most every 5 min.
export const revalidate = 300;

export default function Home() {
  return (
    <main>
      <Hook />
      <RegularsLoop />
      <Problem />
      <Proof />
      <Toolkit />
      <Loyalty />
      <Offer />
      <Steps />
      <Signup />
      <Footer />

      <FaqSchema />
      <ProductJsonLd />
      <ScrollTracker />
    </main>
  );
}
