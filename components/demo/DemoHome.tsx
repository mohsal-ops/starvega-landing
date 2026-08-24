"use client";

import { useState } from "react";
import { formatCents, type DemoConfig } from "@/lib/demo/generate";

export type Tab = "home" | "menu" | "catering";

// Nav: business monogram + name, standard links (Home/Menu/Catering/Rewards/Our
// Story), Order now, cart icon (visual only). Matches the client-site nav.
export function DemoNav({ config, active, onNav }: { config: DemoConfig; active: Tab; onNav: (t: Tab) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links: [string, Tab | null][] = [
    ["Home", "home"], ["Menu", "menu"], ["Catering", "catering"], ["Rewards", null], ["Our Story", null],
  ];
  const initial = config.businessName.trim()[0]?.toUpperCase() || "R";
  const go = (tab: Tab | null) => {
    if (tab) onNav(tab);
    setMenuOpen(false);
  };
  return (
    <div className="sticky top-0 z-20 border-b border-stone-100 bg-white">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <button onClick={() => go("home")} className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-500 text-sm font-bold text-white">{initial}</span>
          <span className="max-w-[160px] truncate text-sm font-semibold text-stone-900">{config.businessName}</span>
        </button>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(([label, tab]) => (
            <button
              key={label}
              onClick={() => tab && onNav(tab)}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                tab && active === tab ? "bg-stone-100 font-medium text-stone-900" : "text-stone-600 hover:text-stone-900"
              } ${!tab ? "cursor-default" : ""}`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => onNav("menu")} className="hidden rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 sm:block">Order now</button>
          <span className="grid h-9 w-9 place-items-center rounded-full border border-stone-200 text-stone-600" aria-label="Cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39A2 2 0 0 0 7.66 16h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
          </span>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="grid h-9 w-9 place-items-center rounded-lg border border-stone-200 text-stone-700 md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
            </svg>
          </button>
        </div>
      </div>
      {/* mobile menu */}
      {menuOpen && (
        <nav className="border-t border-stone-100 px-2 py-2 md:hidden">
          {links.map(([label, tab]) => (
            <button
              key={label}
              onClick={() => go(tab)}
              className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm ${
                tab && active === tab ? "bg-stone-100 font-medium text-stone-900" : "text-stone-700"
              } ${!tab ? "text-stone-400" : ""}`}
            >
              {label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

function Hero({ config, onNav }: { config: DemoConfig; onNav: (t: Tab) => void }) {
  return (
    <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-2 md:items-center">
      <div>
        <p className="text-2xl font-extrabold leading-tight text-orange-600 sm:text-3xl">{config.hero.lead}</p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight text-stone-900 sm:text-4xl">{config.businessName}</h1>
        <p className="mt-3 max-w-md text-stone-600">{config.hero.sub}</p>
        <button onClick={() => onNav("menu")} className="mt-5 rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-700">Order now</button>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={config.hero.image} alt={`${config.businessName} hero`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      </div>
    </div>
  );
}

function Featured({ config, onNav }: { config: DemoConfig; onNav: (t: Tab) => void }) {
  return (
    <div className="border-t border-stone-100 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-900">Featured</h2>
        <button onClick={() => onNav("menu")} className="rounded-full border border-stone-200 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-50">Order now</button>
      </div>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
        {config.featured.map((it, i) => (
          <div key={i} className="w-40 shrink-0">
            <div className="aspect-square overflow-hidden rounded-xl bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.image} alt={it.name} loading="lazy" className="h-full w-full object-cover" />
            </div>
            <p className="mt-2 text-sm font-medium text-stone-900">{it.name}</p>
            <p className="text-sm text-stone-500">{formatCents(it.priceCents)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Gallery({ config }: { config: DemoConfig }) {
  return (
    <div className="border-t border-stone-100 p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-stone-900">{config.businessName}</h2>
      {config.city && <p className="mt-1 text-stone-500">Serving {config.city}</p>}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {config.gallery.slice(0, 6).map((src, i) => (
          <div key={i} className="aspect-square overflow-hidden rounded-xl bg-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Faq({ config }: { config: DemoConfig }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="border-t border-stone-100 p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-stone-900">Good to know</h2>
      <div className="mt-4">
        {config.faq.map((f, i) => (
          <div key={i} className="border-b border-stone-100">
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 py-4 text-left">
              <span className="font-medium text-stone-900">{f.q}</span>
              <span className="text-stone-400">{open === i ? "-" : "+"}</span>
            </button>
            {open === i && <p className="pb-4 text-sm leading-relaxed text-stone-600">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DemoHome({ config, onNav }: { config: DemoConfig; onNav: (t: Tab) => void }) {
  return (
    <div>
      <Hero config={config} onNav={onNav} />
      <Featured config={config} onNav={onNav} />
      <Gallery config={config} />
      {config.city && (
        <div className="border-t border-stone-100 p-6 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-stone-400">Serving</p>
          <p className="mt-1 text-xl font-semibold text-stone-900">{config.city}</p>
        </div>
      )}
      <Faq config={config} />
    </div>
  );
}
