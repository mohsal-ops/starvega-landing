"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";

// Client half of the checkout. The PayPal Buttons drive a SERVER create-order
// and a SERVER capture-order; the client never decides "paid" on its own. On a
// confirmed capture we move to the gated onboarding form. Any failure/denial
// shows an inline error and stays put — we never redirect on failure.
export function CheckoutClient({
  leadId,
  businessName,
  priceLabel,
  paypalClientId,
}: {
  leadId: string;
  businessName: string;
  priceLabel: string;
  paypalClientId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [finalizing, setFinalizing] = useState(false);

  if (!paypalClientId) {
    return (
      <p className="rounded-xl border border-ash bg-stone-50 p-4 text-sm text-ink-soft">
        Checkout isn&apos;t available right now. Please try again shortly, or message us and
        we&apos;ll sort it out.
      </p>
    );
  }

  return (
    <div>
      {finalizing && (
        <p className="mb-3 text-center text-sm text-ink-soft">Confirming your payment…</p>
      )}

      <PayPalScriptProvider
        options={{ clientId: paypalClientId, currency: "USD", intent: "capture" }}
      >
        <PayPalButtons
          style={{ layout: "vertical", label: "pay", shape: "rect" }}
          disabled={finalizing}
          createOrder={async () => {
            setError("");
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ leadId }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.orderId) {
              const msg = data.error || "Couldn't start checkout. Please try again.";
              setError(msg);
              throw new Error(msg);
            }
            return data.orderId as string;
          }}
          onApprove={async (data) => {
            setFinalizing(true);
            setError("");
            try {
              const res = await fetch("/api/paypal/capture-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leadId, orderId: data.orderID }),
              });
              const out = await res.json().catch(() => ({}));
              if (!res.ok || !out.ok) {
                throw new Error(out.error || "Your payment couldn't be completed.");
              }
              // Confirmed paid by the server — go to the gated onboarding form.
              router.push(`/onboard/paid/${leadId}`);
            } catch (e) {
              setError((e as Error).message);
              setFinalizing(false);
            }
          }}
          onError={() => {
            setError("Something went wrong with PayPal. Please try again.");
            setFinalizing(false);
          }}
          onCancel={() => {
            setError("");
            setFinalizing(false);
          }}
        />
      </PayPalScriptProvider>

      {error && (
        <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <p className="mt-3 text-center text-xs text-ink-soft">
        Paying {priceLabel} for {businessName}. Secure checkout via PayPal — card or PayPal balance.
      </p>
    </div>
  );
}
