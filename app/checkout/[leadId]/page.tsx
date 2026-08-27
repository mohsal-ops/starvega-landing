import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import db from "@/lib/db";
import { BUILD_PRICE_LABEL } from "@/lib/pricing";
import { CheckoutClient } from "./CheckoutClient";

// Paid ad-funnel checkout, reached from the instant-demo preview's final CTA.
// Business name is pre-filled from the lead so they never retype it.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout — Starvega",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  const lead = await db.instantDemoLead.findUnique({ where: { id: leadId } });
  if (!lead) notFound();

  // Already paid → straight to the gated onboarding form, no double charge.
  if (lead.paymentStatus === "paid") redirect(`/onboard/paid/${lead.id}`);

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  return (
    <main className="min-h-screen bg-paper px-6 py-16 text-ink sm:py-24">
      <div className="mx-auto w-full max-w-lg">
        <p className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-amber">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
          Almost there
        </p>
        <h1 className="text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
          Get {lead.businessName} built
        </h1>
        <p className="mt-3 text-ink-soft">
          You already saw your live preview. Pay once and we&apos;ll build it out with your
          real menu, photos, and content — then hand it over.
        </p>

        <div className="mt-8 rounded-2xl border border-ash bg-white p-6 shadow-sm">
          <div className="flex items-baseline justify-between border-b border-ash pb-4">
            <span className="font-medium">Website build</span>
            <span className="text-2xl font-semibold">{BUILD_PRICE_LABEL}</span>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            {[
              "Your full site built from the preview you just saw",
              "Real menu, photos, hours, and story added for you",
              "Online ordering + catering pages included",
              "Delivered ready to go live in ~7 business days",
              "It's yours to keep once delivered",
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden className="mt-0.5 text-amber">✓</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <CheckoutClient
              leadId={lead.id}
              businessName={lead.businessName}
              priceLabel={BUILD_PRICE_LABEL}
              paypalClientId={paypalClientId}
            />
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-ink-soft">
          Refunds available within 3 days if the delivered site doesn&apos;t match your preview.
          Once your content is added and the site is delivered, the build is complete and
          non-refundable (standard for custom work).
        </p>
      </div>
    </main>
  );
}
