"use client";

import { useRef, useState } from "react";
import { formatCents, type DemoConfig } from "@/lib/demo/generate";

// Full-fidelity menu page: search + category sidebar, delivery/pickup toggle
// (UI only), a Popular row, and category sections with item cards. Add buttons
// are visual only (no real cart/checkout). No fake open/closed status or hours.
export function DemoMenu({ config }: { config: DemoConfig }) {
  const [mode, setMode] = useState<"delivery" | "pickup">("pickup");
  const [active, setActive] = useState(config.menu[0]?.name ?? "");
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  const goTo = (name: string) => {
    setActive(name);
    refs.current[name]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const popular = config.featured.slice(0, 6);

  return (
    <div className="p-4 sm:p-6">
      {/* header */}
      <h2 className="text-xl font-bold text-stone-900">{config.hero.lead}</h2>
      {config.city && <p className="mt-0.5 text-sm text-stone-500">Serving {config.city}</p>}
      <div className="mt-3 inline-flex rounded-full bg-stone-100 p-1 text-sm">
        {(["delivery", "pickup"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full px-4 py-1.5 capitalize ${mode === m ? "bg-white font-medium text-stone-900 shadow-sm" : "text-stone-500"}`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="mt-5 gap-6 md:flex">
        {/* sidebar (desktop) / chips (mobile) */}
        <aside className="md:w-52 md:shrink-0">
          <input
            placeholder="Search menu"
            className="mb-3 hidden w-full rounded-lg border border-stone-200 px-3 py-2 text-sm md:block"
          />
          <div className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:gap-0.5 md:overflow-visible md:pb-0">
            {config.menu.map((c) => (
              <button
                key={c.name}
                onClick={() => goTo(c.name)}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm md:w-full ${
                  active === c.name ? "bg-stone-900 font-medium text-white" : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </aside>

        {/* main */}
        <div className="min-w-0 flex-1">
          {/* Popular */}
          <h3 className="text-lg font-semibold text-stone-900">Popular</h3>
          <div className="mt-3 flex gap-4 overflow-x-auto pb-2">
            {popular.map((it, i) => (
              <div key={i} className="w-36 shrink-0">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.image} alt={it.name} loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 right-1 grid h-7 w-7 place-items-center rounded-full bg-white text-lg leading-none text-stone-700 shadow">+</span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-stone-900">{it.name}</p>
                <p className="text-sm text-stone-500">{formatCents(it.priceCents)}</p>
              </div>
            ))}
          </div>

          {/* categories */}
          {config.menu.map((cat) => (
            <div
              key={cat.name}
              ref={(el) => { refs.current[cat.name] = el; }}
              className="mt-8 scroll-mt-4"
            >
              <h3 className="text-lg font-semibold text-stone-900">{cat.name}</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {cat.items.map((it, i) => (
                  <div key={i} className="flex items-stretch gap-3 rounded-xl border border-stone-200 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-stone-900">{it.name}</p>
                      {it.desc && <p className="mt-0.5 line-clamp-2 text-xs text-stone-500">{it.desc}</p>}
                      <p className="mt-1 text-sm text-stone-700">{formatCents(it.priceCents)}</p>
                    </div>
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={it.image} alt={it.name} loading="lazy" className="h-full w-full object-cover" />
                      <span className="absolute bottom-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-white text-base leading-none text-stone-700 shadow">+</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
