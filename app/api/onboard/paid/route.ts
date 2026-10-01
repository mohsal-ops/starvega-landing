import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { PACKS_BY_TIER } from "@/lib/pricing";

// POST /api/onboard/paid  { leadId, launch }
// Saves the paid customer's launch-wizard submission and hands it to the builder,
// which creates the Project AND builds the draft site automatically. Payment is
// re-verified SERVER-SIDE (never trust that the client was on the gated page).
// The builder re-validates every field (builder lib/launch.ts parseLaunchData).
export const runtime = "nodejs";

const MAX_BYTES = 60_000; // a wizard submission is a few KB; refuse anything silly

export async function POST(req: NextRequest) {
  const text = await req.text();
  if (text.length > MAX_BYTES) return NextResponse.json({ error: "That's too much data." }, { status: 413 });
  let b: Record<string, unknown> = {};
  try {
    b = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const leadId = typeof b.leadId === "string" ? b.leadId : "";
  if (!leadId) return NextResponse.json({ error: "Missing leadId." }, { status: 400 });

  const lead = await db.instantDemoLead.findUnique({ where: { id: leadId } });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  if (lead.paymentStatus !== "paid") return NextResponse.json({ error: "Payment required." }, { status: 402 });

  const launch = (b.launch && typeof b.launch === "object" ? b.launch : null) as Record<string, unknown> | null;
  if (!launch || launch.version !== 1) return NextResponse.json({ error: "Missing your details - refresh and try again." }, { status: 400 });
  // The plan is whatever they PAID for - never what the browser says.
  const packTier = lead.packTier && lead.packTier in PACKS_BY_TIER ? lead.packTier : "STARTER";
  const onboarding = { ...launch, packTier, submittedAt: new Date().toISOString() };

  // Save first: the customer's answers must never depend on the builder call.
  try {
    await db.instantDemoLead.update({ where: { id: lead.id }, data: { onboarding, status: "converted" } });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || "Couldn't save that." }, { status: 500 });
  }

  // Hand off to the builder (creates the Project + starts the automatic build).
  // Best-effort: the submission is saved on the lead either way, so a builder
  // hiccup never loses it - the owner can reconcile from a lead with onboarding
  // but no projectId. Idempotent via the lead's existing projectId.
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
          launch: onboarding,
          amountPaid: lead.amountPaid != null ? Number(lead.amountPaid) : null,
          leadRef: lead.id,
          projectId: lead.projectId ?? undefined,
        }),
        signal: AbortSignal.timeout(45000),
      });
      const out = (await res.json().catch(() => ({}))) as { projectId?: string };
      if (res.ok && out.projectId) projectId = out.projectId;
    } catch {
      /* leave projectId null; the submission is still saved below */
    }
  }

  if (projectId && projectId !== lead.projectId) {
    await db.instantDemoLead.update({ where: { id: lead.id }, data: { projectId } }).catch(() => {});
  }
  return NextResponse.json({ ok: true, projectLinked: !!projectId });
}
