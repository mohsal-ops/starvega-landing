import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { ensurePlan, getSubscription, isPlanKey, PLANS } from "@/lib/billing";
import { setAccountCookie } from "@/lib/account-auth";
import { sendMail, sendOwnerMail } from "@/lib/mail";
import { SITE } from "@/lib/site";

// POST /api/billing/activate  { subscriptionId, signupId }
// Step 2: PayPal approved the subscription in the browser. We never trust that
// on its own: we ask PayPal for the subscription, check it's ours (plan + the
// signup id we gave it) and approved/active, then create the Account, the
// Subscription and the onboarding record, and sign the owner in. Safe to call
// twice (a retry just signs them in again).
export const runtime = "nodejs";

const OK = new Set(["APPROVED", "ACTIVE"]);

export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as { subscriptionId?: string; signupId?: string };
  if (!b.subscriptionId || !b.signupId) return NextResponse.json({ error: "Missing subscription." }, { status: 400 });

  // Already activated (double click / retry): sign in and go.
  const existing = await db.subscription.findUnique({ where: { providerSubId: b.subscriptionId } });
  if (existing) {
    await setAccountCookie(existing.accountId);
    return NextResponse.json({ ok: true, redirect: "/account" });
  }

  const signup = await db.pendingSignup.findUnique({ where: { id: b.signupId } });
  if (!signup || !isPlanKey(signup.plan)) return NextResponse.json({ error: "Sign-up not found. Please start again." }, { status: 404 });

  let sub;
  try {
    sub = await getSubscription(b.subscriptionId);
  } catch (e) {
    console.error("[billing/activate]", e);
    return NextResponse.json({ error: "We couldn't confirm your subscription with PayPal. You weren't signed up twice; message us and we'll sort it out." }, { status: 502 });
  }
  const expectedPlan = await ensurePlan(signup.plan);
  if (sub.plan_id !== expectedPlan || sub.custom_id !== signup.id || !OK.has(sub.status)) {
    return NextResponse.json({ error: "This subscription doesn't match your sign-up. Please message us." }, { status: 400 });
  }

  const def = PLANS[signup.plan];
  const account = await db.account.upsert({
    where: { email: signup.email },
    create: {
      email: signup.email,
      restaurantName: signup.restaurantName,
      ownerName: signup.ownerName,
      phone: signup.phone,
      city: signup.city,
    },
    update: { restaurantName: signup.restaurantName, ownerName: signup.ownerName ?? undefined, phone: signup.phone ?? undefined },
  });

  await db.subscription.create({
    data: {
      accountId: account.id,
      plan: def.key,
      providerSubId: sub.id,
      status: sub.status.toLowerCase(),
      monthlyCents: def.monthlyCents,
      setupCents: def.setupCents,
      nextBillingAt: sub.billing_info?.next_billing_time ? new Date(sub.billing_info.next_billing_time) : null,
    },
  });

  // The onboarding form (/onboard/paid/[leadId]) is reused as-is: it opens for a
  // "paid" lead and hands the answers to the builder panel.
  if (!account.leadId) {
    const lead = await db.instantDemoLead.create({
      data: {
        businessName: account.restaurantName,
        ownerName: account.ownerName,
        email: account.email,
        contact: account.phone,
        source: "subscription",
        packTier: "PRO",
        paymentStatus: "paid",
        paidAt: new Date(),
        status: "converted",
      },
    });
    await db.account.update({ where: { id: account.id }, data: { leadId: lead.id } });
  }

  await db.clientUpdate.create({
    data: { accountId: account.id, kind: "note", title: `Welcome to Starvega! Your ${def.name} plan is active.`, body: "Next step: send me your basics (menu, photos, hours). It takes about 10 minutes." },
  });
  await db.pendingSignup.delete({ where: { id: signup.id } }).catch(() => {});
  await setAccountCookie(account.id);

  const base = SITE.url.replace(/\/$/, "");
  await Promise.allSettled([
    sendOwnerMail(
      `New client: ${account.restaurantName} (${def.name})`,
      `${account.restaurantName} signed up for ${def.name}.\nOwner: ${account.ownerName ?? "-"}\nEmail: ${account.email}\nPhone: ${account.phone ?? "-"}\nCity: ${account.city ?? "-"}\nPayPal subscription: ${sub.id}\n\nManage: ${base}/admin/clients`,
    ),
    sendMail(
      account.email,
      `Welcome to Starvega, ${account.restaurantName}`,
      `Hi${account.ownerName ? " " + account.ownerName : ""},\n\nYour ${def.name} plan is active. Thank you!\n\nYour dashboard: ${base}/account\nSign in any time with this email; we send you a code, no password.\n\nNext step: send me your basics (menu, photos, hours). It takes about 10 minutes, and the link is on your dashboard.\n\nBen, Starvega`,
    ),
  ]);

  return NextResponse.json({ ok: true, redirect: "/account?welcome=1" });
}
