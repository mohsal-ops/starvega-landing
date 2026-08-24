"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DemoNav, DemoHome, type Tab } from "./DemoHome";
import type { DemoConfig } from "@/lib/demo/generate";
import { track } from "@/lib/track-client";
import { EmailUsCta } from "./EmailUsCta";

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

      {/* primary conversion: click-to-text (contact asked here, not before) */}
      <EmailUsCta businessName={config.businessName} />
    </div>
  );
}
