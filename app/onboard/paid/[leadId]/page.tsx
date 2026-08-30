import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import db from "@/lib/db";
import { PaidOnboardingForm } from "./PaidOnboardingForm";

// Gated onboarding form for the PAID ad-funnel path. Renders nothing unless the
// lead's payment is captured - an unpaid (or pending) visitor is bounced back
// to checkout. This is the paid counterpart to the builder's public
// /onboard/[slug]; that free/manual route is untouched.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Finish your site - Starvega",
  robots: { index: false, follow: false },
};

export default async function PaidOnboardingPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  const lead = await db.instantDemoLead.findUnique({ where: { id: leadId } });
  if (!lead) notFound();

  // The gate: only a captured payment gets in. Anyone else → checkout.
  if (lead.paymentStatus !== "paid") redirect(`/checkout/${leadId}`);

  return (
    <main className="min-h-screen bg-paper px-6 py-16 text-ink sm:py-20">
      <div className="mx-auto w-full max-w-2xl">
        <PaidOnboardingForm leadId={lead.id} businessName={lead.businessName} />
      </div>
    </main>
  );
}
