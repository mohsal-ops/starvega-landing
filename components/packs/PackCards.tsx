"use client";

import { useState } from "react";
import { PACKAGES, CUSTOM_PACK, LOYALTY_ADDON_NOTE, formatUsd, type PackTier } from "@/lib/pricing";
import { startPackCheckout } from "@/lib/pack-checkout";
import { SITE } from "@/lib/site";

// The three product packs, rendered as on-brand cards (hairline borders, no
// shadow, amber only on the primary action). Shared by the Offer section and the
// pricing popup. "Choose" goes straight to that pack's checkout.
export function PackCards({ onInk = false }: { onInk?: boolean }) {
  const [busy, setBusy] = useState<PackTier | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(tier: PackTier) {
    setError(null);
    setBusy(tier);
    try {
      await startPackCheckout(tier);
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  const border = onInk ? "border-white/15" : "border-ash";
  const subtle = onInk ? "text-white/60" : "text-ink-soft";
  const body = onInk ? "text-white/85" : "text-ink";
  const panel = onInk ? "bg-white/[0.03]" : "bg-surface";

  return (
    <div>
      <div className="grid gap-5 md:grid-cols-3">
        {PACKAGES.map((p) => {
          const highlighted = p.popular;
          return (
            <div
              key={p.tier}
              className={`relative flex flex-col rounded-[10px] border p-6 ${
                highlighted ? "border-amber" : border
              } ${panel}`}
            >
              {highlighted && (
                <span className="absolute -top-3 left-6 rounded-full bg-amber px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-ink">
                  Most popular
                </span>
              )}

              <p className={`font-mono text-xs uppercase tracking-[0.18em] ${subtle}`}>{p.label}</p>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className={`text-4xl font-semibold tracking-[-0.02em] ${onInk ? "text-white" : "text-ink"}`}>
                  {formatUsd(p.price)}
                </span>
                <span className={`text-sm ${subtle}`}>one-time</span>
              </div>

              <p className={`mt-3 min-h-[2.5rem] text-sm leading-snug ${subtle}`}>{p.audience}</p>

              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map((f) => {
                  const heading = f.endsWith(":");
                  return (
                    <li
                      key={f}
                      className={`flex gap-2.5 text-sm leading-relaxed ${
                        heading ? `font-medium ${body}` : body
                      }`}
                    >
                      {!heading && (
                        <span aria-hidden className="mt-0.5 text-amber">
                          &#10003;
                        </span>
                      )}
                      <span className={heading ? "" : ""}>{f}</span>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={() => choose(p.tier)}
                disabled={busy !== null}
                className={`mt-6 inline-flex min-h-[48px] items-center justify-center rounded-[10px] px-5 py-3 text-sm font-semibold transition-transform active:scale-[0.99] disabled:opacity-60 ${
                  highlighted
                    ? "bg-amber text-ink hover:bg-[#f0904a]"
                    : onInk
                      ? "border border-white/25 text-white hover:border-white/50"
                      : "border border-ink/25 text-ink hover:border-ink/50"
                }`}
              >
                {busy === p.tier ? "Starting checkout…" : `Choose ${p.label}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom / bespoke - starts a conversation instead of self-serve checkout */}
      <div className={`mt-5 flex flex-col gap-4 rounded-[10px] border p-6 sm:flex-row sm:items-center sm:justify-between ${border} ${panel}`}>
        <div>
          <p className={`font-mono text-xs uppercase tracking-[0.18em] ${subtle}`}>{CUSTOM_PACK.label}</p>
          <p className={`mt-1.5 text-lg font-semibold ${onInk ? "text-white" : "text-ink"}`}>
            Something bespoke? Let&apos;s build it.
          </p>
          <p className={`mt-1 max-w-xl text-sm leading-snug ${subtle}`}>{CUSTOM_PACK.audience}</p>
        </div>
        <a
          href={SITE.instagramDmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-[10px] px-5 py-3 text-sm font-semibold transition-colors ${
            onInk ? "border border-white/25 text-white hover:border-white/50" : "border border-ink/25 text-ink hover:border-ink/50"
          }`}
        >
          Let&apos;s talk
        </a>
      </div>

      <p className={`mt-6 text-center text-xs leading-relaxed ${subtle}`}>{LOYALTY_ADDON_NOTE}</p>
      {error && <p className="mt-3 text-center text-sm text-amber">{error}</p>}
    </div>
  );
}
