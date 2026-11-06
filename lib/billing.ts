// Monthly billing through PayPal Subscriptions (offer v3 client platform).
// Server only. Stripe isn't available to us, PayPal already is: the same REST
// app (NEXT_PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET) runs both one-time
// checkout and subscriptions. The restaurant pays by card or PayPal; PayPal
// charges them every month and tells us through the webhook.
//
// Plans are created in PayPal automatically the first time someone picks them
// (and cached in the BillingPlan table per sandbox/live), so there's nothing to
// click in the PayPal dashboard. Prices come from lib/pricing.ts REGULARS.

import db from "@/lib/db";
import { accessToken, BASE, PAYPAL_ENV } from "@/lib/paypal";
import { REGULARS } from "@/lib/pricing";

export type PlanKey = "founding" | "regulars" | "care";

export type PlanDef = {
  key: PlanKey;
  name: string;
  monthlyCents: number;
  setupCents: number;
  /** Free months before the first charge (care plan for "own it" buyers). */
  trialMonths: number;
  description: string;
};

export const PLANS: Record<PlanKey, PlanDef> = {
  founding: {
    key: "founding",
    name: "Founding partner",
    monthlyCents: REGULARS.foundingMonthly * 100,
    setupCents: 0,
    trialMonths: 0,
    description: `Regulars Engine, founding partner price (first ${REGULARS.foundingSpots} restaurants, locked for life)`,
  },
  regulars: {
    key: "regulars",
    name: REGULARS.name,
    monthlyCents: REGULARS.monthly * 100,
    setupCents: REGULARS.setup * 100,
    trialMonths: 0,
    description: "Regulars Engine: ordering site, bag cards, text club, 2 texts a month, done for you",
  },
  care: {
    key: "care",
    name: "Hosting & care",
    monthlyCents: 39 * 100,
    setupCents: 0,
    trialMonths: 12,
    description: "Hosting, updates, fixes and small changes for an owned site (first 12 months free)",
  },
};

export const isPlanKey = (v: unknown): v is PlanKey => v === "founding" || v === "regulars" || v === "care";

const usd = (cents: number) => (cents / 100).toFixed(2);

async function pp<T = Record<string, unknown>>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await accessToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation", ...(init.headers || {}) },
    cache: "no-store",
  });
  if (res.status === 204) return {} as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = (data as { details?: { description?: string }[]; message?: string }).details?.[0]?.description;
    throw new Error(detail || (data as { message?: string }).message || `PayPal ${path} failed (${res.status})`);
  }
  return data as T;
}

async function ensureProduct(): Promise<string> {
  const key = `${PAYPAL_ENV}:product`;
  const row = await db.billingPlan.findUnique({ where: { key } });
  if (row) return row.paypalPlanId;
  const product = await pp<{ id: string }>("/v1/catalogs/products", {
    method: "POST",
    body: JSON.stringify({ name: "Starvega restaurant services", type: "SERVICE", category: "SOFTWARE" }),
  });
  await db.billingPlan.upsert({ where: { key }, create: { key, paypalPlanId: product.id }, update: { paypalPlanId: product.id } });
  return product.id;
}

/** The PayPal plan id for a plan, created on first use. */
export async function ensurePlan(plan: PlanKey): Promise<string> {
  const def = PLANS[plan];
  // The price is part of the key, so changing a price in lib/pricing.ts makes a
  // new PayPal plan automatically (existing subscribers keep their old price).
  const key = `${PAYPAL_ENV}:${plan}:${def.monthlyCents}:${def.setupCents}:${def.trialMonths}`;
  const row = await db.billingPlan.findUnique({ where: { key } });
  if (row) return row.paypalPlanId;
  const productId = await ensureProduct();
  const cycles: unknown[] = [];
  if (def.trialMonths > 0) {
    cycles.push({
      frequency: { interval_unit: "MONTH", interval_count: 1 },
      tenure_type: "TRIAL",
      sequence: 1,
      total_cycles: def.trialMonths,
      pricing_scheme: { fixed_price: { value: "0", currency_code: "USD" } },
    });
  }
  cycles.push({
    frequency: { interval_unit: "MONTH", interval_count: 1 },
    tenure_type: "REGULAR",
    sequence: cycles.length + 1,
    total_cycles: 0,
    pricing_scheme: { fixed_price: { value: usd(def.monthlyCents), currency_code: "USD" } },
  });
  const created = await pp<{ id: string }>("/v1/billing/plans", {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      name: def.name,
      description: def.description.slice(0, 127),
      status: "ACTIVE",
      billing_cycles: cycles,
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: { value: usd(def.setupCents), currency_code: "USD" },
        setup_fee_failure_action: "CANCEL",
        payment_failure_threshold: 2,
      },
    }),
  });
  await db.billingPlan.upsert({ where: { key }, create: { key, paypalPlanId: created.id }, update: { paypalPlanId: created.id } });
  return created.id;
}

export type PaypalSub = {
  id: string;
  status: string;
  plan_id: string;
  custom_id?: string;
  subscriber?: { email_address?: string; name?: { given_name?: string; surname?: string } };
  billing_info?: { next_billing_time?: string; last_payment?: { time?: string; amount?: { value: string } }; failed_payments_count?: number };
};

export const getSubscription = (id: string) => pp<PaypalSub>(`/v1/billing/subscriptions/${encodeURIComponent(id)}`);

export async function cancelSubscription(id: string, reason: string) {
  await pp(`/v1/billing/subscriptions/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason: reason.slice(0, 127) || "Cancelled by the customer" }),
  });
}

/** Copy PayPal's view of a subscription into our row (status, dates, failures). */
export async function syncSubscription(sub: { id: string; providerSubId: string }) {
  const s = await getSubscription(sub.providerSubId);
  const status = s.status.toLowerCase();
  return db.subscription.update({
    where: { id: sub.id },
    data: {
      status,
      nextBillingAt: s.billing_info?.next_billing_time ? new Date(s.billing_info.next_billing_time) : null,
      lastPaymentAt: s.billing_info?.last_payment?.time ? new Date(s.billing_info.last_payment.time) : undefined,
      failedPayments: s.billing_info?.failed_payments_count ?? 0,
      cancelledAt: status === "cancelled" ? new Date() : undefined,
    },
  });
}

// The webhook is registered with PayPal by the site itself (ensureWebhook), using
// the live keys already on Vercel, and its id is kept in the BillingPlan table.
// PAYPAL_WEBHOOK_ID in the environment still wins if it's set.
const WEBHOOK_URL = "https://www.starvega.site/api/billing/webhook";
const WEBHOOK_EVENTS = [
  "PAYMENT.SALE.COMPLETED",
  "BILLING.SUBSCRIPTION.ACTIVATED",
  "BILLING.SUBSCRIPTION.RE-ACTIVATED",
  "BILLING.SUBSCRIPTION.UPDATED",
  "BILLING.SUBSCRIPTION.SUSPENDED",
  "BILLING.SUBSCRIPTION.CANCELLED",
  "BILLING.SUBSCRIPTION.EXPIRED",
  "BILLING.SUBSCRIPTION.PAYMENT.FAILED",
];

export async function getWebhookId(): Promise<string | null> {
  if (process.env.PAYPAL_WEBHOOK_ID) return process.env.PAYPAL_WEBHOOK_ID;
  const row = await db.billingPlan.findUnique({ where: { key: `${PAYPAL_ENV}:webhook` } }).catch(() => null);
  return row?.paypalPlanId ?? null;
}

/** Register (or find) our webhook in PayPal once; cached. Safe to call often. */
export async function ensureWebhook(): Promise<string | null> {
  const known = await getWebhookId();
  if (known) return known;
  if (PAYPAL_ENV !== "live") return null; // localhost can't receive webhooks
  const list = await pp<{ webhooks?: { id: string; url: string }[] }>("/v1/notifications/webhooks");
  let id = list.webhooks?.find((w) => w.url === WEBHOOK_URL)?.id;
  if (!id) {
    const created = await pp<{ id: string }>("/v1/notifications/webhooks", {
      method: "POST",
      body: JSON.stringify({ url: WEBHOOK_URL, event_types: WEBHOOK_EVENTS.map((name) => ({ name })) }),
    });
    id = created.id;
  }
  const key = `${PAYPAL_ENV}:webhook`;
  await db.billingPlan.upsert({ where: { key }, create: { key, paypalPlanId: id }, update: { paypalPlanId: id } });
  return id;
}

/** True when PayPal signed this webhook. */
export async function verifyWebhook(headers: Headers, rawBody: string): Promise<boolean> {
  const webhookId = await getWebhookId();
  if (!webhookId) return false;
  const h = (k: string) => headers.get(k) || "";
  const out = await pp<{ verification_status?: string }>("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: JSON.stringify({
      auth_algo: h("paypal-auth-algo"),
      cert_url: h("paypal-cert-url"),
      transmission_id: h("paypal-transmission-id"),
      transmission_sig: h("paypal-transmission-sig"),
      transmission_time: h("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  }).catch(() => ({ verification_status: "FAILURE" }));
  return out.verification_status === "SUCCESS";
}

/** Founding-partner spots still open (real count of live founding subscriptions). */
export async function foundingSpotsLeft(): Promise<number> {
  try {
    const taken = await db.subscription.count({
      where: { plan: "founding", status: { in: ["approved", "active", "suspended"] } },
    });
    return Math.max(0, REGULARS.foundingSpots - taken);
  } catch {
    // Tables not created yet (or DB down): never break the public page over it.
    return REGULARS.foundingSpots;
  }
}

/** Statuses that mean "this restaurant is a paying client". */
export const LIVE_STATUSES = ["approved", "active"];
