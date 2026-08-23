"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DemoNav, DemoHome, type Tab } from "./DemoHome";
import type { DemoConfig } from "@/lib/demo/generate";
import { SITE } from "@/lib/site";
import { track } from "@/lib/track-client";

// Menu + Catering only load when their tab is first opened (code-split).
const Spinner = () => <div className="grid place-items-center p-16 text-sm text-stone-400">Loading...</div>;
const DemoMenu = dynamic(() => import("./DemoMenu").then((m) => m.DemoMenu), { loading: Spinner });
const DemoCatering = dynamic(() => import("./DemoCatering").then((m) => m.DemoCatering), { loading: Spinner });

function slug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 30) || "your-restaurant";
}

export function DemoPreview({ config }: { config: DemoConfig }) {
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

      {/* go-live CTA (contact asked here, not before) */}
      <div className="mt-8 text-center">
        <p className="text-xl font-semibold text-bg sm:text-2xl">Want this live with your real menu and photos in 48 hours?</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
          Message me and I will build it out with your actual items, prices, and photos.
        </p>
        <a
          href={SITE.instagramDmUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("onboarding_clicked")}
          className="mt-5 inline-flex min-h-[56px] items-center justify-center rounded-xl bg-amber px-8 py-4 text-base font-semibold text-ink transition-transform hover:bg-[#f0904a] active:scale-[0.99]"
        >
          Let us build it for you
        </a>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-white/40">Opens a message on Instagram</p>
      </div>
    </div>
  );
}
