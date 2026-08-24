"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";
import { track } from "@/lib/track-client";

// Primary conversion at the end of the generated preview: click-to-email.
// mailto: works on desktop AND mobile (unlike sms:, which is phone-only), so
// there's no dead-button-on-desktop problem. Prefilled subject + body reference
// the business name they just generated. A "Copy" fallback covers the rare case
// of a browser with no configured mail client. Fires text_cta_clicked so it
// lands in the admin widget funnel (kept the event name to avoid re-wiring).
export function EmailUsCta({ businessName }: { businessName: string }) {
  const [copied, setCopied] = useState(false);
  const email = SITE.contactEmail;
  const subject = `My ${businessName} preview on Starvega`;
  const body = `Hi! I just built my ${businessName} preview on Starvega, send me my link!`;
  const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const copyEmail = async () => {
    track("text_cta_clicked");
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the address is visible to copy manually */
    }
  };

  return (
    <div className="mt-8 text-center">
      <p className="text-xl font-semibold text-bg sm:text-2xl">Want this live with your real menu and photos in 48 hours?</p>

      <div className="mt-5">
        <a
          href={mailto}
          onClick={() => track("text_cta_clicked")}
          className="inline-flex min-h-[56px] items-center justify-center rounded-xl bg-amber px-8 py-4 text-base font-semibold text-ink transition-transform hover:bg-[#f0904a] active:scale-[0.99]"
        >
          Email us, get your link
        </a>
        <p className="mt-3 text-sm text-white/50">Takes 5 seconds, no forms.</p>

        <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-2 text-sm text-white/50">
          <span>or email {email}</span>
          <button onClick={copyEmail} className="rounded-md border border-white/15 px-2 py-0.5 text-xs text-white/70 transition-colors hover:bg-white/5">
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <a
        href={SITE.instagramProfileUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-block text-sm text-white/40 underline underline-offset-2 transition-colors hover:text-white/70"
      >
        Prefer Instagram? DM us instead
      </a>
    </div>
  );
}
