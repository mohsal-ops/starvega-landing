import Hook from "@/components/sections/Hook";
import Problem from "@/components/sections/Problem";
import Proof from "@/components/sections/Proof";
import Loyalty from "@/components/sections/Loyalty";
import Offer from "@/components/sections/Offer";
import Signup from "@/components/sections/Signup";
import Footer from "@/components/Footer";
import FaqSchema from "@/components/FaqSchema";
import { ProductJsonLd } from "@/components/SeoJsonLd";
import ScrollTracker from "@/components/ScrollTracker";

// The funnel, one ask ("Get my free mockup"): hero (pitch + form + live demo) →
// profit calculator (red loss / green gain) → proof (Southern Jerks) → loyalty
// club → offer (prices secondary) → FAQ + form. Most real visitors never leave the hero, so
// the form is there first; every other CTA scrolls back to the nearest form.
export default function Home() {
  return (
    <main>
      <Hook />
      <Problem />
      <Proof />
      <Loyalty />
      <Offer />
      <Signup />
      <Footer />

      <FaqSchema />
      <ProductJsonLd />
      <ScrollTracker />
    </main>
  );
}
