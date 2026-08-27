// Server-side PayPal Orders v2 helpers (REST via fetch — no SDK).
//
// Sandbox in development, live in production, selected by PAYPAL_ENV (falls back
// to NODE_ENV). The client SECRET is read only here, on the server; the browser
// only ever receives NEXT_PUBLIC_PAYPAL_CLIENT_ID (safe to expose). Never import
// this module into a client component.

const ENV = (
  process.env.PAYPAL_ENV ||
  (process.env.NODE_ENV === "production" ? "live" : "sandbox")
).toLowerCase();

const BASE =
  ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

function creds(): { clientId: string; secret: string } {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) {
    throw new Error(
      "PayPal is not configured — set NEXT_PUBLIC_PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in the environment.",
    );
  }
  return { clientId, secret };
}

async function accessToken(): Promise<string> {
  const { clientId, secret } = creds();
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`PayPal auth failed (${res.status}). Check the ${ENV} credentials.`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("PayPal auth returned no access token.");
  return data.access_token;
}

/** Create a CAPTURE-intent order for a fixed amount. Returns the PayPal order id. */
export async function createOrder(params: {
  amount: string; // e.g. "799.00"
  currency?: string;
  referenceId?: string;
  description?: string;
}): Promise<{ id: string; status: string }> {
  const token = await accessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.referenceId,
          description: params.description?.slice(0, 127),
          amount: { currency_code: params.currency ?? "USD", value: params.amount },
        },
      ],
    }),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.id) {
    throw new Error(data?.message || `PayPal create-order failed (${res.status}).`);
  }
  return { id: data.id, status: data.status };
}

/**
 * Capture a previously-created order, server-side. This is the ONLY thing that
 * proves payment — a client onApprove callback is never trusted on its own.
 * Returns the order status (expect "COMPLETED") and the captured amount.
 */
export async function captureOrder(orderId: string): Promise<{
  status: string;
  captureId?: string;
  amount?: string;
  currency?: string;
  raw: unknown;
}> {
  const token = await accessToken();
  const res = await fetch(
    `${BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `PayPal capture failed (${res.status}).`);
  }
  const cap = data?.purchase_units?.[0]?.payments?.captures?.[0];
  return {
    status: data.status,
    captureId: cap?.id,
    amount: cap?.amount?.value,
    currency: cap?.amount?.currency_code,
    raw: data,
  };
}

export const PAYPAL_ENV = ENV;
