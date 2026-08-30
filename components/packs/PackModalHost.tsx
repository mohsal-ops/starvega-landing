"use client";

import { useEffect, useState } from "react";
import { PackCards } from "./PackCards";
import { closePackModal, subscribePackModal } from "@/lib/pack-modal";

// The pricing popup. Mounted once (in the root layout); opened from any CTA via
// openPackModal(). Shows all three packs with who-it's-for + what's included and
// a Choose button on each. Closes on backdrop click or Escape.
export function PackModalHost() {
  const [open, setOpen] = useState(false);

  useEffect(() => subscribePackModal(setOpen), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePackModal();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto bg-ink/70 p-4 backdrop-blur-sm sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Choose a plan"
      onClick={closePackModal}
    >
      <div
        className="relative my-auto w-full max-w-5xl rounded-[10px] border border-ash bg-bg p-6 sm:p-9"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closePackModal}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-ash text-ink transition-colors hover:bg-paper"
        >
          <span aria-hidden className="text-lg leading-none">&times;</span>
        </button>

        <p className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-amber">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
          Choose your plan
        </p>
        <h2 className="mb-1 text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl">
          One-time price. Yours forever.
        </h2>
        <p className="mb-7 max-w-2xl text-sm leading-relaxed text-ink-soft">
          No monthly platform fee, no commission on your orders. Pick the plan that fits - you can
          always move up later.
        </p>

        <PackCards />
      </div>
    </div>
  );
}
