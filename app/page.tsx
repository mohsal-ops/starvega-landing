import Hook from "@/components/sections/Hook";
import Problem from "@/components/sections/Problem";
import Proof from "@/components/sections/Proof";
import Offer from "@/components/sections/Offer";
import Signup from "@/components/sections/Signup";
import Footer from "@/components/Footer";
import FaqSchema from "@/components/FaqSchema";
import { ProductJsonLd } from "@/components/SeoJsonLd";
import ScrollTracker from "@/components/ScrollTracker";

// The funnel, five sections, one ask ("Get my free mockup"):
// hero (pitch + form + live demo) → problem & fix → proof → offer (site + loyalty,
// prices secondary) → FAQ + form. Most real visitors never leave the hero, so
// the form is there first; every other CTA scrolls back to the nearest form.
export default function Home() {
  return (
    <main>
      <Hook />
      <Problem />
      <Proof />
      <Offer />
      <Signup />
      <Footer />

      <FaqSchema />
      <ProductJsonLd />
      <ScrollTracker />
    </main>
  );
}
