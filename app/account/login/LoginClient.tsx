"use client";

import { useState } from "react";

export function LoginClient() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function post(url: string, body: object) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      return data;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full rounded-xl border border-line bg-bg px-4 py-3 text-[16px] outline-none focus:border-ink";

  return (
    <div className="mt-6">
      {!sent ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (await post("/api/account/login/request", { email })) setSent(true);
          }}
          className="space-y-3"
        >
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className={input} autoComplete="email" />
          <button disabled={busy} className="w-full rounded-full bg-ink py-3.5 font-semibold text-bg disabled:opacity-60">
            {busy ? "Sending…" : "Email me a code"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (await post("/api/account/login/verify", { email, code })) window.location.href = "/account";
          }}
          className="space-y-3"
        >
          <p className="text-sm text-ink-soft">If {email} has an account, a code is on its way. Check spam too.</p>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="6-digit code"
            className={`${input} text-center font-mono text-2xl tracking-[0.4em]`}
          />
          <button disabled={busy || code.length < 6} className="w-full rounded-full bg-ink py-3.5 font-semibold text-bg disabled:opacity-60">
            {busy ? "Checking…" : "Sign in"}
          </button>
          <button type="button" onClick={() => { setSent(false); setCode(""); }} className="w-full text-sm text-ink-soft underline underline-offset-4">
            Use another email
          </button>
        </form>
      )}
      {error && <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
