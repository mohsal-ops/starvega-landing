import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Breadcrumb, OfferCta } from "@/components/learn/parts";
import { buildMetadata } from "@/lib/seo";
import { pillarPages, clustersOf, learnHref } from "@/lib/learn";

export const metadata: Metadata = buildMetadata({
  title: "Learn: delivery fees, going direct & ordering platforms | Starvega",
  description:
    "Plain guides for restaurant owners: what DoorDash, Uber Eats and Grubhub really cost, how to move orders to a site you own, and how the main ordering platforms compare.",
  path: "/learn",
});

export default function LearnIndex() {
  const pillars = pillarPages();
  return (
    <>
      <main className="mx-auto max-w-[52rem] px-6 pb-16 pt-28 sm:pt-32">
        <Breadcrumb trail={[{ label: "Home", href: "/" }, { label: "Learn" }]} />

        <header>
          <h1 className="max-w-[18ch] font-display text-[clamp(2.25rem,6vw,4rem)] font-semibold uppercase leading-[0.95] tracking-[-0.015em] text-ink">
            The commission math, and the way out
          </h1>
          <p className="mt-6 max-w-[58ch] text-[19px] leading-[1.55] text-ink">
            Straight answers for restaurant owners weighing what delivery apps and ordering
            platforms actually cost — and what it takes to run ordering you own instead.
          </p>
        </header>

        <div className="mt-14 space-y-14">
          {pillars.map((pillar) => {
            const clusters = clustersOf(pillar.slug);
            return (
              <section key={pillar.slug}>
                <Link href={learnHref(pillar.slug)} className="group block">
                  <h2 className="font-display text-[1.75rem] font-semibold tracking-[-0.01em] text-ink group-hover:text-amber-deep">
                    {pillar.title} →
                  </h2>
                  <p className="mt-2 max-w-[62ch] text-[16px] leading-[1.55] text-ink-soft">
                    {pillar.description}
                  </p>
                </Link>
                {clusters.length > 0 && (
                  <ul className="mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-2">
                    {clusters.map((c) => (
                      <li key={c.slug}>
                        <Link href={learnHref(c.slug)} className="text-[15px] font-medium text-ink hover:text-amber-deep">
                          {c.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        <OfferCta />
      </main>
      <Footer />
    </>
  );
}
