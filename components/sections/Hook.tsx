import { MockupForm } from "@/components/MockupForm";
import { PreviewWindow, PreviewLink } from "@/components/PreviewWindow";

// SECTION 1 - HERO. Most real visitors never scroll past this screen, so the
// whole pitch AND the ask live here: headline, the two-part promise (orders
// without commission + regulars who come back), the 3-field mockup form, and a
// window onto the live demo. Server-rendered and paint-ready: no scroll/JS
// reveals gate the headline, so it is the fast LCP element.
export default function Hook() {
  return (
    <section id="hook" className="relative overflow-hidden bg-bg px-4 pb-16 pt-24 sm:px-10 sm:pb-24 sm:pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-[8%] -z-10 h-[46vh] w-[46vh] rounded-full opacity-20 blur-3xl"
        style={{ backgroundImage: "var(--gradient-sphere)" }}
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        <div>
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft">For independent restaurants</p>

          <h1 className="font-display text-[clamp(2.4rem,7vw,4.5rem)] font-semibold uppercase leading-[0.95] tracking-[-0.015em] text-ink">
            Stop giving DoorDash <span className="text-amber-deep">30%</span> of every order.
          </h1>

          <p className="mt-6 max-w-[46ch] text-[18px] leading-[1.5] text-ink-soft">
            Your own website with <strong className="font-semibold text-ink">commission-free online ordering</strong>, and an optional{" "}
            <strong className="font-semibold text-ink">loyalty club that brings customers back</strong>. The site is a one-time
            price, yours forever.
          </p>

          <div className="mt-8 rounded-2xl border border-line bg-paper p-4 sm:p-6">
            <p className="mb-4 text-[17px] font-semibold tracking-tight text-ink">
              I&apos;ll design a free mockup of <span className="text-amber-deep">your</span> restaurant&apos;s site.
            </p>
            <MockupForm placement="hero" />
          </div>

          <PreviewLink className="mt-4 lg:hidden" />
        </div>

        <div className="hidden lg:block">
          <PreviewWindow />
          <p className="mt-4 text-center text-sm text-ink-soft">
            A real, working site. Tap it: menu, ordering, loyalty and the owner dashboard.
          </p>
        </div>
      </div>
    </section>
  );
}
