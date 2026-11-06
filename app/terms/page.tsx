import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { LegalDoc } from "@/components/LegalDoc";
import { REGULARS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Terms of Service - Starvega",
  description: "The terms for buying a restaurant website or monthly plan from Starvega.",
  alternates: { canonical: "/terms" },
};

// Terms of Service for Starvega's own customers (restaurants buying a website).
// Plain-language and honest about what's included, what depends on the client,
// and what third parties (PayPal, Stripe, hosting) control.
export default function TermsPage() {
  const email = SITE.contactEmail;
  return (
    <LegalDoc title="Terms of Service">
      <section>
        <p>
          These terms apply when you request a mockup from, or buy a website or related service from, Starvega
          (&quot;Starvega&quot;, &quot;we&quot;) through {SITE.url} or by message. By paying for a plan you agree to them.
        </p>
      </section>

      <section>
        <h2>What you get</h2>
        <ul>
          <li>The free mockup is a design preview. There is no obligation to buy.</li>
          <li>When you buy a plan, we build your restaurant website with the features listed for that plan at the time of purchase, set it up on hosting, and connect it to your own payment account so online orders are paid to you directly.</li>
          <li>Timelines we give are estimates and depend on you sending the information and approvals we need.</li>
          <li>Any ongoing fee (for example a care or hosting plan) only applies if it is shown at checkout or you agree to it in writing.</li>
        </ul>
      </section>

      <section>
        <h2>Payment</h2>
        <p>
          Prices are in US dollars and are charged in full at checkout through PayPal. We never receive your full card number.
          The plan is the one you paid for; upgrades are charged separately.
        </p>
      </section>

      <section>
        <h2>Refunds</h2>
        <ul>
          <li>Full refund if you cancel before we start building your site, or if we can&apos;t deliver what your plan includes.</li>
          <li>After building has started, we&apos;ll work with you on revisions first; a partial refund for work not yet done is at our discretion.</li>
          <li>No refund once you have approved the site or it has gone live.</li>
          <li>To ask for a refund, email {email}.</li>
        </ul>
      </section>

      <section>
        <h2>Monthly plans (Founding partner and Regulars Engine)</h2>
        <ul>
          <li>Monthly plans are billed through PayPal by card or PayPal balance, on the same day each month, until you cancel. A setup fee, if your plan has one, is charged with the first month.</li>
          <li>There is no contract. You can cancel any time from your Starvega account (or by emailing us). Billing stops right away; your site and services stay on until the end of the month you already paid for. Months already paid are not refunded, except under the guarantee below.</li>
          <li>Each month we write and send up to {REGULARS.textCampaignsPerMonth} text campaigns to your club, only after you approve them, and only to people who opted in. We also keep your site running and make reasonable small changes you ask for.</li>
          <li>The founding partner price stays the same for as long as your plan stays active. If you cancel and come back later, the current price applies.</li>
          <li>If a payment fails, PayPal tries again. After 2 failed tries the plan is paused until the payment goes through.</li>
        </ul>
      </section>

      <section>
        <h2>The {REGULARS.guaranteeOrders}-order guarantee</h2>
        <ul>
          <li>If your site does not bring you {REGULARS.guaranteeOrders} paid direct orders within {REGULARS.guaranteeDays} days of going live, we refund your setup fee and keep providing the service at no monthly charge until it does.</li>
          <li>It applies while you: put a bag card in every delivery and takeout bag, keep the QR code on your counter or tables, and approve or reply to each text campaign within 24 hours. A direct order is a paid order placed on your own Starvega site.</li>
          <li>To use it, message us within 14 days after the {REGULARS.guaranteeDays} days end. Your order count is the one shown in your restaurant&apos;s order dashboard.</li>
        </ul>
      </section>

      <section>
        <h2>Your responsibilities</h2>
        <ul>
          <li>You confirm you have the right to use the logos, photos, text and menu you send us, and you are responsible for their accuracy, including prices, allergen and dietary information.</li>
          <li>You are responsible for running your restaurant lawfully: food safety, taxes, licenses, honoring orders, refunds to your customers, and the rules for texting or emailing your customers.</li>
          <li>Your payment account (Stripe), your domain and your third-party accounts are yours; keep their logins secure. Card fees charged by Stripe are paid by you to Stripe.</li>
          <li>We provide standard Terms, Privacy and Accessibility pages on your site as a starting point; they are not legal advice, and you should review them for your business.</li>
        </ul>
      </section>

      <section>
        <h2>Ownership</h2>
        <ul>
          <li>You own your content, brand, menu, customer and order data, and your domain.</li>
          <li>Once paid in full, you may use the website we build for your restaurant. Our underlying code, templates and tools remain ours and are licensed to you for that use.</li>
          <li>We may show your site (name, screenshots, link) in our portfolio and marketing. Tell us at {email} if you&apos;d rather we didn&apos;t.</li>
        </ul>
      </section>

      <section>
        <h2>Hosting and third-party services</h2>
        <p>
          Your site relies on services we don&apos;t control (such as hosting, databases, payments, maps, couriers and messaging).
          We pick reliable providers and fix problems on our side promptly, but we can&apos;t guarantee uninterrupted availability,
          and their own terms and fees apply.
        </p>
      </section>

      <section>
        <h2>Limits of liability</h2>
        <p>
          Services are provided &quot;as is&quot;. To the extent the law allows, our total liability for any claim is limited to
          the amount you paid us for the service in question, and we are not liable for lost profits, lost orders or other
          indirect losses.
        </p>
      </section>

      <section>
        <h2>Ending the service</h2>
        <p>
          You can stop working with us at any time. We may end the service if these terms are seriously broken (for example
          unlawful use or non-payment). If the service ends, we&apos;ll help you take your content and data with you.
        </p>
      </section>

      <section>
        <h2>Changes and contact</h2>
        <p>
          We may update these terms; the version on this page applies to new purchases. If something goes wrong, contact us
          first at {email} and we&apos;ll work in good faith to fix it.
        </p>
      </section>
    </LegalDoc>
  );
}
