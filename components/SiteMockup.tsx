import Image from "next/image";

// A polished, modern restaurant-site mockup in a browser window - a concrete
// "here's what you get" visual. Rounded/soft-shadowed UI (it depicts a product,
// not the Starvega page itself). Static markup + real food imagery, lazy-loaded.
export function SiteMockup({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-2xl shadow-ink/10 ${className}`}
    >
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-line bg-paper px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-ash" />
        <span className="h-2.5 w-2.5 rounded-full bg-ash" />
        <span className="h-2.5 w-2.5 rounded-full bg-ash" />
        <span className="ml-2 flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-3 py-1 font-mono text-[10px] tracking-wide text-ink-soft">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="4" y="10" width="16" height="10" rx="2" fill="currentColor" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
          </svg>
          bellakitchen.com
        </span>
      </div>

      {/* site nav */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <span className="text-[15px] font-bold tracking-tight">
          bella<span className="text-amber-deep">.</span>
        </span>
        <div className="hidden items-center gap-5 text-[11px] font-medium text-ink-soft sm:flex">
          <span>Menu</span>
          <span>Catering</span>
          <span>About</span>
          <span className="rounded-full bg-ink px-3.5 py-1.5 font-semibold text-white">Order online</span>
        </div>
        <span className="rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold text-white sm:hidden">Order</span>
      </div>

      {/* hero */}
      <div className="relative mx-3 overflow-hidden rounded-xl">
        <div className="relative aspect-[16/9]">
          <Image
            src="/demo/bowl-salmon.jpg"
            alt="Example restaurant website hero"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
          {/* rating chip */}
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-ink shadow-sm">
            <span className="text-amber-deep">★</span> 4.9
            <span className="font-normal text-ink-soft">(320)</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
            <div className="text-white">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/80">Open now · 20 min</p>
              <p className="mt-0.5 max-w-[14ch] text-lg font-semibold leading-tight sm:text-xl">
                Wood-fired, made to order.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-amber px-3.5 py-2 text-xs font-semibold text-ink shadow-lg shadow-ink/20">
              Order →
            </span>
          </div>
        </div>
      </div>

      {/* menu row */}
      <div className="grid grid-cols-3 gap-2.5 p-3">
        {[
          { img: "/demo/bowl-curry.jpg", name: "Curry Bowl", price: "$12" },
          { img: "/demo/bowl-noodle.jpg", name: "Noodles", price: "$11" },
          { img: "/demo/bowl-buddha.jpg", name: "Buddha Bowl", price: "$13" },
        ].map((m) => (
          <div key={m.name} className="overflow-hidden rounded-xl border border-line bg-white">
            <div className="relative aspect-[4/3]">
              <Image src={m.img} alt={m.name} fill sizes="20vw" className="object-cover" loading="lazy" />
            </div>
            <div className="flex items-center justify-between gap-1 px-2 py-2">
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold leading-tight">{m.name}</p>
                <p className="text-[10px] font-medium text-ink-soft">{m.price}</p>
              </div>
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink text-[12px] leading-none text-white">
                +
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
