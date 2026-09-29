import Link from "next/link";
import { ProfitCalculator } from "@/components/ProfitCalculator";

// SECTION 2 - PROBLEM + FIX, as the owner's OWN number: an interactive
// calculator (red = what the apps take, green = what their own site gives back).
// Seeing their own money is what keeps a paid-ad visitor on the page.
export default function Problem() {
  return (
    <section id="problem" className="bg-ink px-4 py-20 text-bg sm:px-10 sm:py-28">
      <div className="mx-auto w-full max-w-4xl">
        <p data-reveal className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-amber">
          The math nobody shows you
        </p>
        <h2 data-reveal className="max-w-3xl text-[clamp(1.9rem,5.5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.02em]">
          See what the apps take from <span className="text-loss-bright">you</span>, and what you&apos;d{" "}
          <span className="text-gain-bright">keep</span>.
        </h2>
        <p data-reveal className="mt-4 max-w-2xl text-lg leading-relaxed text-white/70">
          Drag the slider to your real numbers. It takes five seconds.
        </p>

        <div data-reveal className="mt-10">
          <ProfitCalculator />
        </div>

        <Link
          href="/learn/delivery-app-commissions"
          className="mt-6 inline-flex min-h-[44px] items-center text-sm text-white/60 underline decoration-white/30 underline-offset-4 hover:text-white"
        >
          Where the commission rates come from →
        </Link>
      </div>
    </section>
  );
}
