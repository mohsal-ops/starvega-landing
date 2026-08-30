import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// POST /api/onboard/paid  { leadId, story, hoursNote, menuChanges, requests, paymentReady, photos[] }
// Saves the paid customer's onboarding submission. Payment is re-verified
// SERVER-SIDE here (never trust that the client was on the gated page) - an
// unpaid lead is rejected. Phase 4 extends this to also create the builder
// Project. Mirrors the builder's /api/onboard field set.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const leadId = typeof b.leadId === "string" ? b.leadId : "";
  if (!leadId) return NextResponse.json({ error: "Missing leadId." }, { status: 400 });

  const lead = await db.instantDemoLead.findUnique({ where: { id: leadId } });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  if (lead.paymentStatus !== "paid") {
    // Not paid → refuse. The page also gates, but the API must not rely on that.
    return NextResponse.json({ error: "Payment required." }, { status: 402 });
  }

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const onboarding = {
    story: str(b.story),
    hoursNote: str(b.hoursNote),
    menuChanges: str(b.menuChanges),
    requests: str(b.requests),
    paymentReady: b.paymentReady === true,
    photos: Array.isArray(b.photos)
      ? b.photos.filter((u): u is string => typeof u === "string" && /^https?:\/\//.test(u)).slice(0, 20)
      : [],
    submittedAt: new Date().toISOString(),
  };

  // Hand off to the builder to create the Project so this shows up in the
  // Projects tab. Best-effort: the submission is already valid and about to be
  // saved on the lead, so a builder hiccup must not fail the customer's
  // thank-you - the owner can reconcile from a lead that has onboarding but no
  // projectId. Idempotent via the lead's existing projectId.
  let projectId: string | null = lead.projectId ?? null;
  const builderUrl = process.env.BUILDER_API_URL;
  const secret = process.env.PAID_HANDOFF_SECRET;
  if (builderUrl && secret) {
    try {
      const res = await fetch(`${builderUrl.replace(/\/$/, "")}/api/paid-onboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
        body: JSON.stringify({
          businessName: lead.businessName,
          onboarding,
          amountPaid: lead.amountPaid != null ? Number(lead.amountPaid) : null,
          leadRef: lead.id,
          projectId: lead.projectId ?? undefined,
        }),
      });
      const out = (await res.json().catch(() => ({}))) as { projectId?: string };
      if (res.ok && out.projectId) projectId = out.projectId;
    } catch {
      /* leave projectId null; the onboarding data is still saved below */
    }
  }

  try {
    await db.instantDemoLead.update({
      where: { id: lead.id },
      data: {
        onboarding,
        projectId: projectId ?? undefined,
        status: "converted",
      },
    });
    return NextResponse.json({ ok: true, projectLinked: !!projectId });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message || "Couldn't save that." },
      { status: 500 },
    );
  }
}
