import Image from "next/image";
import { SITE } from "@/lib/site";

// SECTION 3 - PROOF (Southern Jerks). The real live site (screenshot of
// southernjerkshtx.com in a browser frame) next to its real Search Console /
// GA4 numbers, in green because they are gains. No stock photos, no invented
// charts; the visitor can click through and check it themselves.
// SCOPE: SJ is cited for search/traffic only, never ordering or commission.

// Headline stats (subset of SITE.proof.stats, same verified values).
const HEADLINE = ["Search impressions (30d)", "Visitors (30d)", "Avg. Google position"];

export default function Proof() {
  const { proof } = SITE;
  const stats = proof.verified ? proof.stats.filter((s) => HEADLINE.includes(s.label)) : [];
  const more = proof.verified ? proof.stats.filter((s) => !HEADLINE.includes(s.label)) : [];

  return (
    <section id="proof" className="overflow-hidden bg-paper px-4 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <p data-reveal className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
            Real restaurant · Houston, TX
          </p>
          <h2 data-reveal className="text-[clamp(2rem,5.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
            {proof.clientName} gets found on Google, on its own site.
          </h2>
          <p data-reveal className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
            Customers searching for fried chicken in Houston land on {proof.clientName}&apos;s own website, not on an app
            listing. Last 30 days:
          </p>

          <div data-reveal-stagger className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-line bg-bg p-3 sm:p-4">
                <p className="flex items-center gap-1 text-[clamp(1.2rem,5.2vw,2.25rem)] font-semibold leading-none tracking-[-0.02em] text-gain tabular-nums">
                  <span aria-hidden className="text-[0.55em]">▲</span>
                  {s.value}
                </p>
                <p className="mt-2 text-xs leading-snug text-ink-soft">{s.label.replace(" (30d)", "")}</p>
              </div>
            ))}
          </div>
          {more.length > 0 && (
            <p className="mt-4 text-sm text-ink-soft">
              {more.map((s) => `${s.value} ${s.label.replace(" (30d)", "").toLowerCase()}`).join(" · ")}
            </p>
          )}

          {proof.liveUrl && (
            <a
              href={proof.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-ink/20 bg-bg px-5 font-semibold text-ink transition-colors hover:border-ink"
            >
              Visit {proof.clientName} live ↗
            </a>
          )}
        </div>

        {/* the real site, framed */}
        <div data-reveal className="relative">
          <div
            aria-hidden
            className="absolute -inset-8 -z-10 rounded-[40px] opacity-25 blur-3xl"
            style={{ backgroundImage: "var(--gradient-sphere)" }}
          />
          <a
            href={proof.liveUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`${proof.clientName} live website`}
            className="block overflow-hidden rounded-[14px] border border-ash bg-surface shadow-[0_30px_80px_-30px_rgba(0,0,0,0.4)] transition-transform duration-500 hover:-translate-y-1"
          >
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-ash" />
              <span className="h-2.5 w-2.5 rounded-full bg-ash" />
              <span className="h-2.5 w-2.5 rounded-full bg-ash" />
              <span className="ml-3 truncate font-mono text-xs text-ink-soft">{proof.liveUrl?.replace(/^https?:\/\//, "")}</span>
            </div>
            <Image
              src="/proof/sj-desktop.jpg"
              alt={`${proof.clientName}'s website homepage`}
              width={1200}
              height={750}
              sizes="(min-width: 1024px) 640px, 100vw"
              className="h-auto w-full"
            />
          </a>
          <div className="absolute -bottom-6 left-4 flex items-center gap-2 rounded-full border border-line bg-bg px-4 py-2 text-sm font-medium shadow-lg sm:left-8">
            <span className="h-2 w-2 rounded-full bg-gain" />
            Live now · built by Starvega
          </div>
        </div>
      </div>
    </section>
  );
}
