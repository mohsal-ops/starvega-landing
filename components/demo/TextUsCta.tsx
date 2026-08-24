"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import { track } from "@/lib/track-client";

// Primary conversion at the end of the generated preview: click-to-text.
// - iOS uses `sms:<num>&body=`, Android uses `sms:<num>?body=` (real, documented
//   platform inconsistency) — detected via UA, not hardcoded.
// - Desktop (sms: doesn't work): show the number + Copy button + instruction.
// - Secondary, visually quieter: "Prefer Instagram? DM us instead".
// Fires a text_cta_clicked PageEvent so it lands in the admin widget funnel.

type Plat = "ios" | "android" | "desktop";

function detectPlatform(): Plat {
  const ua = navigator.userAgent || "";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  // touch + narrow viewport that isn't iOS/Android → treat as mobile (Android-style body param)
  if ("ontouchstart" in window && window.matchMedia("(max-width: 767px)").matches) return "android";
  return "desktop";
}

export function TextUsCta({ businessName }: { businessName: string }) {
  const [plat, setPlat] = useState<Plat | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => setPlat(detectPlatform()), []);

  const msg = `Hi! I just built my ${businessName} preview on Starvega, send me my link!`;
  const num = SITE.textNumber; // pretty, for display
  const tel = num.replace(/[^+\d]/g, ""); // clean E.164 for the sms: URI + copy
  const smsHref = `sms:${tel}${plat === "ios" ? "&" : "?"}body=${encodeURIComponent(msg)}`;

  const copyNumber = async () => {
    track("text_cta_clicked");
    try {
      await navigator.clipboard.writeText(tel);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked; the number is visible to copy manually */
    }
  };

  return (
    <div className="mt-8 text-center">
      <p className="text-xl font-semibold text-bg sm:text-2xl">Want this live with your real menu and photos in 48 hours?</p>

      {plat === null ? (
        <div className="mt-5 h-14" /> /* reserve space until platform is known */
      ) : plat === "desktop" ? (
        <div className="mt-5">
          <p className="text-sm text-white/60">Text this number from your phone:</p>
          <div className="mt-2 inline-flex flex-wrap items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 px-5 py-3">
            <span className="text-lg font-semibold tracking-wide text-bg">{num}</span>
            <button onClick={copyNumber} className="rounded-lg bg-amber px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-[#f0904a]">
              {copied ? "Copied" : "Copy number"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <a
            href={smsHref}
            onClick={() => track("text_cta_clicked")}
            className="inline-flex min-h-[56px] items-center justify-center rounded-xl bg-amber px-8 py-4 text-base font-semibold text-ink transition-transform hover:bg-[#f0904a] active:scale-[0.99]"
          >
            Text us, get your link
          </a>
          <p className="mt-3 text-sm text-white/50">Takes 5 seconds, no forms.</p>
        </div>
      )}

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
