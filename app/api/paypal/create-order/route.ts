import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { createOrder } from "@/lib/paypal";
import { BUILD_PRICE_USD } from "@/lib/pricing";

// POST /api/paypal/create-order  { leadId }
// Creates a PayPal order server-side for the single fixed price, records the
// returned orderId + paymentStatus="pending" on that lead, and returns the
// orderId to the client so the PayPal Buttons can proceed. The amount is taken
// from the server constant, never from the client.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { leadId } = (await req.json().catch(() => ({}))) as { leadId?: string };
  if (!leadId) return NextResponse.json({ error: "Missing leadId." }, { status: 400 });

  const lead = await db.instantDemoLead.findUnique({ where: { id: leadId } });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  if (lead.paymentStatus === "paid") {
    return NextResponse.json({ error: "This preview has already been paid for." }, { status: 409 });
  }

  try {
    const order = await createOrder({
      amount: BUILD_PRICE_USD.toFixed(2),
      currency: "USD",
      referenceId: lead.id,
      description: `Website build — ${lead.businessName}`,
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
