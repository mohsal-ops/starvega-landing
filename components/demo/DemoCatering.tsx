"use client";

import { useRef } from "react";
import { formatCents, type DemoConfig } from "@/lib/demo/generate";

// Catering page: hero banner with CTA buttons, a "why choose us" 4-card grid,
// and a catering menu grid reusing the placeholder items. Buttons are UI only.
export function DemoCatering({ config }: { config: DemoConfig }) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="p-4 sm:p-6">
      {/* hero banner */}
      <div className="grid overflow-hidden rounded-2xl md:grid-cols-2">
        <div className="relative aspect-[4/3] md:aspect-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={config.hero.image} alt="Catering spread" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-center bg-stone-900 p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold leading-tight text-orange-500 sm:text-3xl">
            Bring {config.businessName} to your event
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            From corporate events to private parties, make your event memorable with our food.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-full bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700">Request a quote</button>
            <button
              onClick={() => menuRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-stone-900 hover:bg-stone-100"
            >
              See catering menu
            </button>
          </div>
        </div>
      </div>

      {/* why choose us */}
      <div className="mt-10 text-center">
        <h3 className="text-2xl font-bold text-stone-900">Why choose {config.businessName}?</h3>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {config.catering.cards.map((c) => (
            <div key={c.title} className="rounded-2xl border border-stone-200 p-5 text-center">
              <p className="font-semibold text-stone-900">{c.title}</p>
              <p className="mt-1.5 text-sm text-stone-500">{c.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* catering menu */}
      <div ref={menuRef} className="mt-10 scroll-mt-4">
        <h3 className="text-center text-2xl font-bold text-stone-900">Catering menu</h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {config.catering.items.map((it, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-stone-200">
              <div className="aspect-[4/3] bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.image} alt={it.name} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center justify-between p-3">
                <p className="font-medium text-stone-900">{it.name}</p>
                <p className="text-sm text-stone-500">{formatCents(it.priceCents)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
