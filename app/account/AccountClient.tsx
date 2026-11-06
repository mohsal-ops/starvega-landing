"use client";

import { useState, useTransition } from "react";
import { sendRequest, cancelPlan } from "./_actions";

export function RequestBox() {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="mt-3"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await sendRequest(text);
          if (r.ok) {
            setText("");
            setMsg({ ok: true, t: "Got it. I'll take care of it and reply here." });
          } else setMsg({ ok: false, t: r.error });
        });
      }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="e.g. Add the lamb platter at $18.99"
        className="w-full rounded-2xl border border-line bg-bg p-3 text-[15px] outline-none focus:border-ink"
      />
      <button disabled={pending || text.trim().length < 3} className="mt-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50">
        {pending ? "Sending…" : "Send"}
      </button>
      {msg && <p className={`mt-2 text-sm ${msg.ok ? "text-gain" : "text-red-600"}`}>{msg.t}</p>}
    </form>
  );
}

export function CancelPlan({ subscriptionId }: { subscriptionId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-full px-4 py-2 text-sm text-ink-soft underline-offset-4 hover:underline">
        Cancel plan
      </button>
    );
  }
  return (
    <div className="mt-2 w-full rounded-2xl border border-line p-4">
      <p className="font-medium">Sorry to see you go. What made you stop?</p>
      <p className="mt-1 text-sm text-ink-soft">PayPal stops charging right away. Your site stays up until the month you paid for ends.</p>
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="mt-3 w-full rounded-xl border border-line p-2 text-sm" placeholder="Optional, but it helps me get better" />
      <div className="mt-2 flex gap-2">
        <button
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await cancelPlan(subscriptionId, reason);
              if (!r.ok) setError(r.error);
            })
          }
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Cancelling…" : "Yes, cancel my plan"}
        </button>
        <button onClick={() => setOpen(false)} className="rounded-full border border-line px-4 py-2 text-sm">Keep my plan</button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
