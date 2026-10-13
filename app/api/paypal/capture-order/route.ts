import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { captureOrder } from "@/lib/paypal";
import { sendOwnerMail } from "@/lib/mail";
import { BUILD_PRICE_USD, packPriceUsd } from "@/lib/pricing";

// POST /api/paypal/capture-order  { leadId, orderId }
// Captures the order SERVER-SIDE and only marks the lead paid when PayPal
// reports status COMPLETED. A client-only success callback never unlocks
// access - this route is the single source of truth for "paid".
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { leadId, orderId } = (await req.json().catch(() => ({}))) as {
    leadId?: string;
    orderId?: string;
  };
  if (!leadId || !orderId) {
    return NextResponse.json({ ok: false, error: "Missing leadId or orderId." }, { status: 400 });
  }

  const lead = await db.instantDemoLead.findUnique({ where: { id: leadId } });
  if (!lead) return NextResponse.json({ ok: false, error: "Lead not found." }, { status: 404 });

  // The order being captured must be the one WE created for this lead (via
  // create-order, at the server-side price). No stored order = nothing to capture.
  if (!lead.paypalOrderId || lead.paypalOrderId !== orderId) {
    return NextResponse.json({ ok: false, error: "Order does not match this checkout." }, { status: 409 });
  }
  if (lead.paymentStatus === "paid") {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }

  try {
    const result = await captureOrder(orderId);
    if (result.status !== "COMPLETED") {
      // Do NOT flip to paid. Surface a clear error; the client shows it and
      // never redirects to the gated form.
      return NextResponse.json(
        { ok: false, error: `Payment was not completed (status: ${result.status}).` },
        { status: 402 },
      );
    }
    // Never trust the order blindly: the captured money must be exactly this
    // lead's price, in USD, on an order made for this lead. (A browser-made
    // $0.01 order or another lead's cheaper order must never unlock a build.)
    const expected = (lead.packTier ? packPriceUsd(lead.packTier) : null) ?? BUILD_PRICE_USD;
    const ref = (result.raw as { purchase_units?: { reference_id?: string }[] })?.purchase_units?.[0]?.reference_id;
    if (result.currency !== "USD" || Number(result.amount) !== expected || ref !== lead.id) {
      sendOwnerMail(
        `Starvega: PAYMENT MISMATCH - ${lead.businessName}`,
        `Captured ${result.amount} ${result.currency} (ref ${ref}) for lead ${lead.id}, expected ${expected} USD. NOT marked paid - check PayPal and refund if needed.`,
      ).catch(() => {});
      return NextResponse.json({ ok: false, error: "Payment amount didn't match your plan. Contact us and we'll sort it out." }, { status: 409 });
    }
    await db.instantDemoLead.updateMany({
      where: { id: lead.id, paymentStatus: { not: "paid" } },
      data: {
        paymentStatus: "paid",
        paidAt: new Date(),
        amountPaid: result.amount ? Number(result.amount) : undefined,
      },
    });

    // Owner notification: a payment actually completed (best-effort).
    sendOwnerMail(
      `Starvega: PAID - ${lead.businessName}${lead.packTier ? ` (${lead.packTier})` : ""}`,
      [
        `Payment completed.`,
        `Business: ${lead.businessName}`,
        lead.packTier ? `Plan: ${lead.packTier}` : "",
        result.amount ? `Amount: $${result.amount}` : "",
        lead.contact ? `Contact: ${lead.contact}` : "",
        `Lead: ${lead.id}`,
      ]
        .filter(Boolean)
        .join("\n"),
    ).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Payment capture failed. Try again, or contact us." },
      { status: 502 },
    );
  }
}
