"use client";

import { useState } from "react";
import { track, sessionId } from "@/lib/track-client";
import { takeEntryPoint, type EntryPoint } from "@/lib/widget-cta";
import { getPickedStyle } from "@/lib/showcase";
import { openPackModal } from "@/lib/pack-modal";

// The landing's one real ask: "Get your free mockup". Name, restaurant and a
// WhatsApp/phone number; email is optional and tucked behind a link so the form
// stays three fields. Rendered twice (hero + final section) - both are
// [data-lead-form] targets for every "Get my free mockup" button on the page.
export function MockupForm({ placement, onInk = false }: { placement: EntryPoint; onInk?: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [opened, setOpened] = useState(false);
  const [firstName, setFirstName] = useState("");

  const markOpened = () => {
    if (opened) return;
    setOpened(true);
    track("widget_opened", { entryPoint: takeEntryPoint(placement) });
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setError("");
    setState("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          restaurant: f.get("restaurant"),
          phone: f.get("phone"),
          email: f.get("email") || "",
          company: f.get("company") || "",
          sessionId: sessionId(),
          entryPoint: placement,
          design: getPickedStyle(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Try again.");
      setFirstName(String(f.get("name") || "").split(" ")[0]);
      setState("done");
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
    }
  };

  const soft = onInk ? "text-white/60" : "text-ink-soft";
  const field = onInk
    ? "w-full min-h-[52px] rounded-xl border border-white/15 bg-white/[0.06] px-4 text-[16px] text-white placeholder:text-white/40 outline-none transition-colors focus:border-amber"
    : "w-full min-h-[52px] rounded-xl border border-ash bg-white px-4 text-[16px] text-ink placeholder:text-ink-soft/70 outline-none transition-colors focus:border-ink";

  if (state === "done") {
    return (
      <div
        data-lead-form
        role="status"
        className={`rounded-2xl border p-6 ${onInk ? "border-amber/40 bg-amber/10 text-white" : "border-amber/50 bg-amber/10 text-ink"}`}
      >
        <p className="text-xl font-semibold tracking-tight">Got it{firstName ? `, ${firstName}` : ""}.</p>
        <p className={`mt-2 leading-relaxed ${onInk ? "text-white/75" : "text-ink-soft"}`}>
          I&apos;ll build your mockup and message you within 24 hours. Nothing to pay, nothing to sign.
        </p>
        <ol className={`mt-4 space-y-1.5 text-sm ${onInk ? "text-white/75" : "text-ink-soft"}`}>
          <li>
            <span className="font-semibold text-amber">1.</span> I message you with your mockup link
          </li>
          <li>
            <span className="font-semibold text-amber">2.</span> You pick a plan and pay once, only if you love it
          </li>
          <li>
            <span className="font-semibold text-amber">3.</span> Send your logo, menu &amp; photos, and I take it live
          </li>
        </ol>
        <button
          type="button"
          onClick={openPackModal}
          className={`mt-4 min-h-[44px] text-sm font-semibold underline underline-offset-4 ${onInk ? "text-white" : "text-ink"}`}
        >
          Ready now? See plans →
        </button>
      </div>
    );
  }

  return (
    <form data-lead-form onSubmit={submit} onFocus={markOpened} className="space-y-3" noValidate={false}>
      {/* honeypot */}
      <div aria-hidden className="absolute left-[-9999px] top-[-9999px]">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="sr-only">Your name</span>
          <input name="name" required maxLength={60} autoComplete="name" placeholder="Your name" className={field} />
        </label>
        <label className="block">
          <span className="sr-only">Restaurant name</span>
          <input name="restaurant" required maxLength={80} autoComplete="organization" placeholder="Restaurant name" className={field} />
        </label>
      </div>
      <label className="block">
        <span className="sr-only">WhatsApp or phone number</span>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          required
          maxLength={30}
          autoComplete="tel"
          placeholder="WhatsApp or phone number"
          className={field}
        />
      </label>
      {showEmail ? (
        <label className="block">
          <span className="sr-only">Email (optional)</span>
          <input name="email" type="email" maxLength={120} autoComplete="email" placeholder="Email (optional)" className={field} autoFocus />
        </label>
      ) : (
        <button type="button" onClick={() => setShowEmail(true)} className={`min-h-[44px] text-sm underline underline-offset-4 ${soft}`}>
          + Add email (optional)
        </button>
      )}

      {error && <p className={`text-sm ${onInk ? "text-amber" : "text-amber-deep"}`}>{error}</p>}

      <button
        type="submit"
        disabled={state === "sending"}
        className="flex min-h-[56px] w-full items-center justify-center rounded-xl bg-amber px-6 text-[17px] font-semibold text-ink transition-colors hover:bg-[#f0904a] active:scale-[0.99] disabled:opacity-60"
      >
        {state === "sending" ? "Sending..." : "Get my free mockup"}
      </button>
      <p className={`text-center text-[13px] ${soft}`}>I&apos;ll message you within 24h. No payment, no obligation.</p>
    </form>
  );
}
