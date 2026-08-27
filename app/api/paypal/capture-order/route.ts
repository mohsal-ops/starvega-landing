import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { captureOrder } from "@/lib/paypal";

// POST /api/paypal/capture-order  { leadId, orderId }
// Captures the order SERVER-SIDE and only marks the lead paid when PayPal
// reports status COMPLETED. A client-only success callback never unlocks
// access — this route is the single source of truth for "paid".
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

  // The order being captured must be the one we created for this lead.
  if (lead.paypalOrderId && lead.paypalOrderId !== orderId) {
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
    await db.instantDemoLead.update({
      where: { id: lead.id },
      data: {
        paymentStatus: "paid",
        paidAt: new Date(),
        amountPaid: result.amount ? Number(result.amount) : undefined,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message || "Payment capture failed." },
      { status: 502 },
    );
  }
}
