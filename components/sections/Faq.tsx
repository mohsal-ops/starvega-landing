"use client";

import Link from "next/link";
import { FAQS } from "@/lib/faq";
import { track } from "@/lib/track";

// Objection handling. Native <details> accordion - keyboard/screen-reader ready
// with zero animation JS. Each open fires a GA event so we see which doubts
// people actually have. Rendered inside the Signup section (id="signup").
export default function Faq() {
  return (
    <div id="faq" className="bg-bg px-4 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto w-full max-w-3xl">
        <p data-reveal className="mb-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
          Before you ask
        </p>
        <h2 data-reveal className="text-[clamp(2rem,6vw,3.25rem)] font-semibold leading-[1.06] tracking-[-0.02em]">
          The honest answers.
        </h2>

        <div className="mt-12 sm:mt-16">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group border-t border-line last:border-b"
              onToggle={(e) => {
                if ((e.currentTarget as HTMLDetailsElement).open) track("faq_open", { question: f.q });
              }}
            >
              <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-4 py-5 text-left [&::-webkit-details-marker]:hidden">
                <h3 className="text-lg font-medium leading-snug tracking-tight">{f.q}</h3>
                <span
                  aria-hidden
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-xl leading-none text-ink-soft transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="max-w-2xl pb-6">
                <p className="text-base leading-relaxed text-ink-soft">{f.a}</p>
                {f.href && (
                  <Link href={f.href} className="mt-3 inline-block text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline">
                    {f.linkText ?? "Learn more"} →
                  </Link>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
