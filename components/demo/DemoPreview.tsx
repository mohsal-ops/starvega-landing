"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DemoNav, DemoHome, type Tab } from "./DemoHome";
import type { DemoConfig } from "@/lib/demo/generate";
import { track } from "@/lib/track-client";
import { EmailUsCta } from "./EmailUsCta";
import { ChoosePlanButton } from "@/components/packs/ChoosePlanButton";
import { SITE } from "@/lib/site";

// Menu + Catering only load when their tab is first opened (code-split).
const Spinner = () => <div className="grid place-items-center p-16 text-sm text-stone-400">Loading...</div>;
const DemoMenu = dynamic(() => import("./DemoMenu").then((m) => m.DemoMenu), { loading: Spinner });
const DemoCatering = dynamic(() => import("./DemoCatering").then((m) => m.DemoCatering), { loading: Spinner });

function slug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 30) || "your-restaurant";
}

export function DemoPreview({ config, leadId }: { config: DemoConfig; leadId?: string | null }) {
  const [tab, setTab] = useState<Tab>("home");

  useEffect(() => {
    track("preview_generated");
  }, []);

  return (
    <div>
      {/* framed mini-site */}
      <div className="overflow-hidden rounded-2xl border border-white/15 bg-white text-stone-900 shadow-2xl">
        <div className="flex items-center gap-1.5 border-b border-stone-100 bg-stone-50 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
          <span className="ml-3 truncate font-mono text-[11px] text-stone-400">{slug(config.businessName)}.com</span>
        </div>
        <div className="max-h-[78vh] overflow-y-auto">
          <DemoNav config={config} active={tab} onNav={setTab} />
          {tab === "home" && <DemoHome config={config} onNav={setTab} />}
          {tab === "menu" && <DemoMenu config={config} />}
          {tab === "catering" && <DemoCatering config={config} />}
        </div>
      </div>

      {/* primary conversion: pay to get the real site built (ad-funnel path).
          The leadId (created when the preview was generated) is carried into the
          gated checkout so nothing is retyped. Falls back to the click-to-email
          path when there's no lead id (e.g. a reloaded preview). */}
      {leadId ? (
        <div className="mt-8 text-center">
          <p className="text-xl font-semibold text-bg sm:text-2xl">
            Love it? Get {config.businessName} built for real.
          </p>
          <div className="mt-5">
            <ChoosePlanButton>Choose your plan</ChoosePlanButton>
            <p className="mt-3 text-sm text-white/50">One-time price, yours to keep. Live in ~7 business days.</p>
          </div>
          <a
            href={SITE.instagramProfileUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-sm text-white/40 underline underline-offset-2 transition-colors hover:text-white/70"
          >
            Questions first? DM us
          </a>
        </div>
      ) : (
        <EmailUsCta businessName={config.businessName} />
      )}
    </div>
  );
}
