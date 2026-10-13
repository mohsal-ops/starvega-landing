import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Privacy Policy - Starvega",
  description: "What Starvega collects through this website and how it's used.",
  alternates: { canonical: "/privacy" },
};

// Privacy Policy for starvega.site, matching what the site actually does: the
// mockup form, PayPal checkout, the launch wizard uploads, Google Analytics and
// the site's own visit analytics.
export default function PrivacyPage() {
  const email = SITE.contactEmail;
  return (
    <LegalDoc title="Privacy Policy">
      <section>
        <p>
          This policy explains what Starvega (&quot;we&quot;) collects through {SITE.url}, how we use it and your choices. We
          collect only what we need to design, sell and build your restaurant website.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li><b>Mockup and contact forms:</b> your name, restaurant name, phone/WhatsApp and optional email.</li>
          <li><b>Checkout:</b> the plan you choose. Payment is handled by PayPal; we receive a confirmation, not your card details.</li>
          <li><b>Launch details:</b> after purchase, what you send to build your site (address, hours, logo, menu, photos, story, domain preference, login email).</li>
          <li><b>Usage data:</b> pages visited, device type and approximate location (from IP address), collected by Google Analytics and our own simple analytics, using cookies or similar storage.</li>
        </ul>
      </section>

      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To create your free mockup and reply to you (including by WhatsApp, text or email when you give us your number or email).</li>
          <li>To process your payment and build, launch and support your website.</li>
          <li>To understand which parts of this site are useful and improve it.</li>
          <li>To meet legal, tax and accounting obligations and prevent fraud.</li>
        </ul>
      </section>

      <section>
        <h2>Who we share it with</h2>
        <p>We do <b>not</b> sell your personal information. We share it only with providers that help us run the service:</p>
        <ul>
          <li>PayPal (payments)</li>
          <li>Vercel, Neon and Cloudflare (hosting, database and file storage)</li>
          <li>Google (analytics, and Gemini to read menu photos you upload when building your site)</li>
          <li>Email delivery providers (to send you messages)</li>
        </ul>
        <p>We may also disclose information if required by law.</p>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <p>
          Lead details are kept while we&apos;re in contact and for a reasonable period after. Customer and payment records are
          kept as long as needed for the service and for tax and legal purposes.
        </p>
      </section>

      <section>
        <h2>Your choices and rights</h2>
        <ul>
          <li>Ask us to see, correct or delete your information, or to stop contacting you, by emailing {email}.</li>
          <li>Residents of California and other places with privacy laws have these rights by law; we won&apos;t treat you differently for using them.</li>
          <li>You can block or clear cookies in your browser; the site still works without analytics cookies.</li>
        </ul>
      </section>

      <section>
        <h2>Security and children</h2>
        <p>
          The site is served over HTTPS and access to your information is limited to people who need it. No system is
          perfectly secure, but we take reasonable steps to protect your data. This site is for businesses and is not
          directed to children under 13.
        </p>
      </section>

      <section>
        <h2>Changes and contact</h2>
        <p>We may update this policy; the date above shows the latest version. Questions: {email}.</p>
      </section>
    </LegalDoc>
  );
}
