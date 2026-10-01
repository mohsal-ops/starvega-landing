import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import db from "@/lib/db";
import { PACKS_BY_TIER, type PackTier } from "@/lib/pricing";
import { LaunchWizard } from "./LaunchWizard";

// Gated launch wizard for the PAID ad-funnel path. Renders nothing unless the
// lead's payment is captured - an unpaid (or pending) visitor is bounced back
// to checkout. Submitting it makes the builder create the draft site
// automatically (builder lib/launchBuild).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Build your site - Starvega",
  robots: { index: false, follow: false },
};

export default async function PaidOnboardingPage({ params }: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await params;
  const lead = await db.instantDemoLead.findUnique({ where: { id: leadId } });
  if (!lead) notFound();

  // The gate: only a captured payment gets in. Anyone else → checkout.
  if (lead.paymentStatus !== "paid") redirect(`/checkout/${leadId}`);

  const tier = (lead.packTier && lead.packTier in PACKS_BY_TIER ? lead.packTier : "STARTER") as PackTier;
  const already = !!(lead.onboarding && typeof lead.onboarding === "object" && "version" in (lead.onboarding as object));

  return (
    <main className="min-h-screen bg-paper px-4 pb-12 pt-24 text-ink sm:px-6 sm:pb-16 sm:pt-28">
      <div className="mx-auto w-full max-w-2xl">
        {already ? (
          <div className="rounded-2xl border border-gain/30 bg-gain/5 p-8 text-center">
            <div className="mb-3 text-4xl">🚀</div>
            <h1 className="text-2xl font-semibold tracking-tight">{lead.businessName} is being built</h1>
            <p className="mx-auto mt-3 max-w-md text-ink-soft">
              I already have your details. You&apos;ll get a private link to review your site soon. Need to change
              something? Just message me.
            </p>
          </div>
        ) : (
          <LaunchWizard
            leadId={lead.id}
            businessName={lead.businessName}
            ownerName={lead.ownerName}
            phone={lead.contact}
            email={lead.email}
            city={lead.city}
            packTier={tier}
            packName={PACKS_BY_TIER[tier].label}
          />
        )}
      </div>
    </main>
  );
}
