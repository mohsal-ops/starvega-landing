import Image from "next/image";

// A stylized browser window showing the kind of clean restaurant site we build —
// a concrete "here's what you get" visual next to the pitch. Static markup +
// real food imagery (lazy-loaded); given data-parallax by the caller so it drifts.
export function SiteMockup({ className = "" }: { className?: string }) {
  return (
    <div className={`overflow-hidden border border-ink bg-bg ${className}`}>
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-line bg-paper px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-ash" />
        <span className="h-2.5 w-2.5 rounded-full bg-ash" />
        <span className="h-2.5 w-2.5 rounded-full bg-ash" />
        <span className="ml-2 flex-1 rounded-md bg-bg px-3 py-1 text-center font-mono text-[10px] tracking-wide text-ink-soft">
          bellakitchen.com
        </span>
      </div>

      {/* site nav */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="text-sm font-semibold tracking-tight">BELLA KITCHEN</span>
        <div className="hidden items-center gap-4 text-[11px] text-ink-soft sm:flex">
          <span>Menu</span>
          <span>Catering</span>
          <span>About</span>
          <span className="rounded-md bg-amber px-2.5 py-1 font-semibold text-ink">Order Online</span>
        </div>
        <span className="rounded-md bg-amber px-2.5 py-1 text-[11px] font-semibold text-ink sm:hidden">Order</span>
      </div>

      {/* hero */}
      <div className="relative aspect-[16/10]">
        <Image
          src="/demo/bowl-salmon.jpg"
          alt="Example restaurant website hero"
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 text-bg sm:p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/80">Fresh · Fast · Yours</p>
          <p className="mt-1 max-w-[16ch] text-xl font-semibold leading-tight sm:text-2xl">
            Order straight from us.
          </p>
          <span className="mt-3 inline-block rounded-md bg-amber px-3 py-1.5 text-xs font-semibold text-ink">
            Order Online →
          </span>
        </div>
      </div>

      {/* mini menu row */}
      <div className="grid grid-cols-3 gap-2 p-3">
        {[
          { img: "/demo/bowl-curry.jpg", name: "Curry Bowl", price: "$12" },
          { img: "/demo/bowl-noodle.jpg", name: "Noodles", price: "$11" },
          { img: "/demo/bowl-buddha.jpg", name: "Buddha Bowl", price: "$13" },
        ].map((m) => (
          <div key={m.name} className="border border-line">
            <div className="relative aspect-square">
              <Image src={m.img} alt={m.name} fill sizes="20vw" className="object-cover" loading="lazy" />
            </div>
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="truncate text-[10px] font-medium">{m.name}</span>
              <span className="text-[10px] font-semibold text-amber-deep">{m.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
