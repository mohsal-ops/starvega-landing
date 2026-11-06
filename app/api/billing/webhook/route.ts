import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyWebhook, PLANS, isPlanKey } from "@/lib/billing";
import { sendMail, sendOwnerMail } from "@/lib/mail";
import { SITE } from "@/lib/site";

// POST /api/billing/webhook - PayPal tells us about monthly payments and
// subscription changes. Set it up once in the PayPal developer dashboard
// (Apps -> your app -> Webhooks -> Add): URL https://www.starvega.site/api/billing/webhook,
// events: PAYMENT.SALE.COMPLETED, BILLING.SUBSCRIPTION.* , then put the webhook
// id in PAYPAL_WEBHOOK_ID. Every event is signature-checked with PayPal first.
export const runtime = "nodejs";

type Evt = { event_type: string; resource: Record<string, unknown> };

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!process.env.PAYPAL_WEBHOOK_ID) {
    console.error("[billing/webhook] PAYPAL_WEBHOOK_ID is not set - event ignored");
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }
  if (!(await verifyWebhook(req.headers, raw))) return NextResponse.json({ error: "bad signature" }, { status: 400 });

  const evt = JSON.parse(raw) as Evt;
  const r = evt.resource;
  const subId = String(evt.event_type.startsWith("PAYMENT.") ? r.billing_agreement_id ?? "" : r.id ?? "");
  const sub = subId ? await db.subscription.findUnique({ where: { providerSubId: subId }, include: { account: true } }) : null;
  if (!sub) return NextResponse.json({ ok: true, ignored: true }); // not one of ours (e.g. a one-time order)

  const planName = isPlanKey(sub.plan) ? PLANS[sub.plan].name : sub.plan;
  const base = SITE.url.replace(/\/$/, "");

  switch (evt.event_type) {
    case "PAYMENT.SALE.COMPLETED": {
      const amount = r.amount as { total?: string; currency?: string } | undefined;
      const cents = Math.round(Number(amount?.total ?? 0) * 100);
      const paidAt = r.create_time ? new Date(String(r.create_time)) : new Date();
      const txn = String(r.id);
      const known = await db.invoice.findUnique({ where: { providerTxnId: txn } });
      if (!known) {
        await db.invoice.create({
          data: {
            accountId: sub.accountId,
            subscriptionId: sub.id,
            providerTxnId: txn,
            amountCents: cents,
            currency: amount?.currency ?? "USD",
            description: cents > sub.monthlyCents ? `${planName}: setup + first month` : `${planName}: monthly`,
            paidAt,
          },
        });
        await sendMail(
          sub.account.email,
          `Receipt: $${(cents / 100).toFixed(2)} for ${sub.account.restaurantName}`,
          `Thanks! We received $${(cents / 100).toFixed(2)} for your ${planName} plan on ${paidAt.toDateString()}.\n\nAll your receipts: ${base}/account\n\nStarvega`,
        ).catch(() => false);
      }
      await db.subscription.update({ where: { id: sub.id }, data: { lastPaymentAt: paidAt, failedPayments: 0, status: "active" } });
      break;
    }
    case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
      await db.subscription.update({ where: { id: sub.id }, data: { failedPayments: { increment: 1 } } });
      await Promise.allSettled([
        sendOwnerMail(`Payment failed: ${sub.account.restaurantName}`, `PayPal couldn't charge ${sub.account.restaurantName} (${planName}). PayPal retries; after 2 failures the plan pauses.\n${base}/admin/clients`),
        sendMail(sub.account.email, "Your Starvega payment didn't go through", `Hi, PayPal couldn't take this month's payment for ${sub.account.restaurantName}. Please check the card in your PayPal account. PayPal will try again.\n\n${base}/account`),
      ]);
      break;
    }
    case "BILLING.SUBSCRIPTION.ACTIVATED":
    case "BILLING.SUBSCRIPTION.RE-ACTIVATED":
    case "BILLING.SUBSCRIPTION.UPDATED":
    case "BILLING.SUBSCRIPTION.SUSPENDED":
    case "BILLING.SUBSCRIPTION.CANCELLED":
    case "BILLING.SUBSCRIPTION.EXPIRED": {
      const status = String(r.status ?? evt.event_type.split(".").pop()).toLowerCase();
      const info = r.billing_info as { next_billing_time?: string } | undefined;
      await db.subscription.update({
        where: { id: sub.id },
        data: {
          status,
          nextBillingAt: info?.next_billing_time ? new Date(info.next_billing_time) : undefined,
          cancelledAt: status === "cancelled" ? sub.cancelledAt ?? new Date() : undefined,
        },
      });
      if (["suspended", "cancelled", "expired"].includes(status) && sub.status !== status) {
        await sendOwnerMail(`Plan ${status}: ${sub.account.restaurantName}`, `${sub.account.restaurantName}'s ${planName} plan is now ${status}.\n${base}/admin/clients`).catch(() => false);
      }
      break;
    }
  }
  return NextResponse.json({ ok: true });
}
