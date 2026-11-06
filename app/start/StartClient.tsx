"use client";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

type Plan = "founding" | "regulars";

// Two steps on one card: (1) plan + details, (2) PayPal Subscribe button.
// The server creates the account only after it confirms the subscription with
// PayPal (/api/billing/activate); the browser's "approved" alone never counts.
export function StartClient({
  initialPlan,
  foundingSpots,
  paypalClientId,
  prices,
}: {
  initialPlan: Plan;
  foundingSpots: number;
  paypalClientId: string;
  prices: { foundingMonthly: number; monthly: number; setup: number; foundingSpotsTotal: number };
}) {
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [form, setForm] = useState({ ownerName: "", restaurantName: "", email: "", phone: "", city: "" });
  const [step, setStep] = useState<"details" | "pay">("details");
  const [ids, setIds] = useState<{ planId: string; signupId: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const today = plan === "founding" ? prices.foundingMonthly : prices.setup + prices.monthly;
  const monthly = plan === "founding" ? prices.foundingMonthly : prices.monthly;
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function toPayment(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/billing/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, ...form }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setIds(data);
      setStep("pay");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full rounded-xl border border-line bg-bg px-4 py-3 text-[16px] outline-none focus:border-ink";

  return (
    <div className="rounded-3xl border border-line bg-bg p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] sm:p-8">
      {/* Plan choice */}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={foundingSpots === 0 || step === "pay"}
          onClick={() => setPlan("founding")}
          className={`relative rounded-2xl border-2 p-4 text-left transition-colors disabled:opacity-50 ${plan === "founding" ? "border-amber bg-amber/5" : "border-line hover:border-ash"}`}
        >
          <span className="text-sm text-ink-soft">Founding partner</span>
          <span className="mt-1 block text-2xl font-semibold tracking-tight">${prices.foundingMonthly}<span className="text-base text-ink-soft">/mo</span></span>
          <span className="mt-1 block text-xs font-medium text-gain">
            {foundingSpots > 0 ? `$0 setup · ${foundingSpots} of ${prices.foundingSpotsTotal} spots left` : "All spots taken"}
          </span>
        </button>
        <button
          type="button"
          disabled={step === "pay"}
          onClick={() => setPlan("regulars")}
          className={`rounded-2xl border-2 p-4 text-left transition-colors disabled:opacity-60 ${plan === "regulars" ? "border-amber bg-amber/5" : "border-line hover:border-ash"}`}
        >
          <span className="text-sm text-ink-soft">Regulars Engine</span>
          <span className="mt-1 block text-2xl font-semibold tracking-tight">${prices.monthly}<span className="text-base text-ink-soft">/mo</span></span>
          <span className="mt-1 block text-xs text-ink-soft">${prices.setup} setup · month to month</span>
        </button>
      </div>
      {plan === "founding" && (
        <p className="mt-3 rounded-xl bg-paper p-3 text-sm text-ink-soft">
          Founding price is locked for life. In return: a short video about your results once you have them, and ok to share your numbers.
        </p>
      )}

      {step === "details" ? (
        <form onSubmit={toPayment} className="mt-6 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input required placeholder="Your name" value={form.ownerName} onChange={set("ownerName")} className={input} autoComplete="name" />
            <input required placeholder="Restaurant name" value={form.restaurantName} onChange={set("restaurantName")} className={input} />
          </div>
          <input required type="email" placeholder="Email (your login code goes here)" value={form.email} onChange={set("email")} className={input} autoComplete="email" />
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Phone / WhatsApp" value={form.phone} onChange={set("phone")} className={input} autoComplete="tel" />
            <input placeholder="City" value={form.city} onChange={set("city")} className={input} />
          </div>
          <button disabled={busy} className="w-full rounded-full bg-amber py-4 text-[17px] font-semibold text-ink transition-colors hover:bg-amber-deep disabled:opacity-60">
            {busy ? "One moment…" : "Continue to payment"}
          </button>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </form>
      ) : (
        <div className="mt-6">
          <div className="mb-4 rounded-2xl bg-paper p-4 text-[15px]">
            <div className="flex justify-between"><span className="text-ink-soft">Today</span><span className="font-semibold">${today.toFixed(2)}</span></div>
            <div className="mt-1 flex justify-between"><span className="text-ink-soft">Then every month</span><span className="font-semibold">${monthly.toFixed(2)}</span></div>
            <p className="mt-2 text-xs text-ink-soft">For {form.restaurantName}. Stop any month from your dashboard.</p>
          </div>
          {!paypalClientId ? (
            <p className="rounded-xl border border-ash bg-stone-50 p-4 text-sm text-ink-soft">Payment isn&apos;t available right now. Please message us and we&apos;ll set it up.</p>
          ) : (
            <PayPalScriptProvider options={{ clientId: paypalClientId, vault: true, intent: "subscription", currency: "USD" }}>
              <PayPalButtons
                style={{ layout: "vertical", shape: "pill", label: "subscribe" }}
                createSubscription={(_data, actions) =>
                  actions.subscription.create({
                    plan_id: ids!.planId,
                    custom_id: ids!.signupId,
                    subscriber: { email_address: form.email, name: { given_name: form.ownerName.split(" ")[0] || form.ownerName, surname: form.ownerName.split(" ").slice(1).join(" ") || undefined } },
                    application_context: { brand_name: "Starvega", shipping_preference: "NO_SHIPPING", user_action: "SUBSCRIBE_NOW" },
                  } as Parameters<typeof actions.subscription.create>[0])
                }
                onApprove={async (data) => {
                  setBusy(true);
                  setError("");
                  try {
                    const res = await fetch("/api/billing/activate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ subscriptionId: data.subscriptionID, signupId: ids!.signupId }),
                    });
                    const out = await res.json().catch(() => ({}));
                    if (!res.ok || !out.ok) throw new Error(out.error || "We couldn't confirm your plan. Please message us.");
                    window.location.href = out.redirect || "/account";
                  } catch (err) {
                    setError((err as Error).message);
                    setBusy(false);
                  }
                }}
                onError={() => setError("Something went wrong with PayPal. Please try again.")}
              />
            </PayPalScriptProvider>
          )}
          {busy && <p className="mt-3 text-center text-sm text-ink-soft">Setting up your account…</p>}
          {error && <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="button" onClick={() => setStep("details")} className="mt-3 w-full text-center text-sm text-ink-soft underline underline-offset-4">
            Back
          </button>
          <p className="mt-4 text-center text-xs text-ink-soft">
            Pay by card or PayPal. By subscribing you agree to our <a href="/terms" target="_blank" rel="noreferrer" className="underline">Terms</a> and{" "}
            <a href="/privacy" target="_blank" rel="noreferrer" className="underline">Privacy Policy</a>.
          </p>
        </div>
      )}
    </div>
  );
}
