import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { createOrder } from "@/lib/paypal";
import { BUILD_PRICE_USD, packPriceUsd, PACKS_BY_TIER, type PackTier } from "@/lib/pricing";

// POST /api/paypal/create-order  { leadId }
// Creates a PayPal order server-side, records the returned orderId +
// paymentStatus="pending" on that lead, and returns the orderId so the PayPal
// Buttons can proceed. The amount is derived from the lead's chosen pack tier
// (via lib/pricing), NEVER from the client; pre-packs leads fall back to the
// legacy build price.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { leadId } = (await req.json().catch(() => ({}))) as { leadId?: string };
  if (!leadId) return NextResponse.json({ error: "Missing leadId." }, { status: 400 });

  const lead = await db.instantDemoLead.findUnique({ where: { id: leadId } });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  if (lead.paymentStatus === "paid") {
    return NextResponse.json({ error: "This preview has already been paid for." }, { status: 409 });
  }

  // Amount is trusted from the server side only: the pack price for the lead's
  // tier, or the legacy build price if this lead predates packs.
  const amountUsd = lead.packTier ? packPriceUsd(lead.packTier) ?? BUILD_PRICE_USD : BUILD_PRICE_USD;
  const planLabel = lead.packTier ? PACKS_BY_TIER[lead.packTier as PackTier]?.label ?? "Website" : "Website";

  try {
    const order = await createOrder({
      amount: amountUsd.toFixed(2),
      currency: "USD",
      referenceId: lead.id,
      description: `${planLabel} plan — ${lead.businessName}`,
    });
    await db.instantDemoLead.update({
      where: { id: lead.id },
      data: { paypalOrderId: order.id, paymentStatus: "pending" },
    });
    return NextResponse.json({ orderId: order.id });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message || "Could not start checkout." },
      { status: 502 },
    );
  }
}
