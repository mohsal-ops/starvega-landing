import { MockupForm } from "@/components/MockupForm";
import { PreviewLink } from "@/components/PreviewWindow";
import { Showcase, ShowcaseStrip } from "@/components/Showcase";
import { REGULARS } from "@/lib/pricing";

// SECTION 1 - HERO (offer v3: regulars, not commission). Most real visitors never scroll past this screen, so the
// whole pitch AND the ask live here: headline, the two-part promise (orders
// without commission + regulars who come back), the 3-field mockup form, and four real client
// sites (one per design) cycling beside it. Server-rendered and paint-ready: no scroll/JS
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
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft">For restaurants on DoorDash, Uber Eats &amp; Grubhub</p>

          <h1 className="font-display text-[clamp(2.3rem,6.6vw,4.3rem)] font-semibold uppercase leading-[0.95] tracking-[-0.015em] text-ink">
            <span className="block">
              The apps bring them <span className="text-loss">once</span>.
            </span>
            <span className="block">
              We bring them <span className="hero-pop text-gain">back</span>.
            </span>
          </h1>

          <p className="mt-6 max-w-[48ch] text-[18px] leading-[1.5] text-ink-soft">
            A card in every delivery bag turns app customers into <strong className="font-semibold text-ink">regulars who order straight from you</strong>.
            Then I <strong className="font-semibold text-ink">text them on your slow nights</strong>. Your own site, no commission, all done for you.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-gain/30 bg-gain/10 px-4 py-2 text-[15px] font-medium text-gain">
            <span aria-hidden>✓</span> {REGULARS.guaranteeOrders} direct orders in {REGULARS.guaranteeDays} days, or you don&apos;t pay
          </div>

          <div className="mt-7 rounded-2xl border border-line bg-paper p-4 sm:p-6">
            <p className="mb-1 text-[17px] font-semibold tracking-tight text-ink">
              Get <span className="text-amber-deep">your</span> free bag card + site sample.
            </p>
            <p className="mb-4 text-sm text-ink-soft">With your logo and menu. I text it to you within 24 hours. No card, no catch.</p>
            <MockupForm placement="hero" />
          </div>

          <ShowcaseStrip className="mt-8 lg:hidden" />
          <PreviewLink className="mt-2 lg:hidden" />
        </div>

        <div className="hidden lg:block">
          <Showcase />
          <p className="mt-4 text-center text-sm text-ink-soft">
            Real restaurants, live now. Same system, 5 designs. Yours can wear any of them.
          </p>
        </div>
      </div>
    </section>
  );
}
