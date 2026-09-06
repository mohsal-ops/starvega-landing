import Link from "next/link";
import { ArrowLink } from "@/components/ArrowLink";
import { CountUp } from "@/components/CountUp";
import type { LearnStat, LearnTable } from "@/lib/learn-content";

// Small presentational pieces shared by the /learn index and article pages.
// Kept server-rendered (composing the CountUp/Reveal client islands) so all
// article text stays in the HTML for crawlers.

export function Breadcrumb({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
        {trail.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {c.href ? (
              <Link href={c.href} className="hover:text-ink">
                {c.label}
              </Link>
            ) : (
              <span className="text-ink" aria-current="page">
                {c.label}
              </span>
            )}
            {i < trail.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Phase 4: whichever row or column IS Starvega gets a subtle amber wash + a
// solid amber edge, so the point of a competitor comparison lands at a glance.
const isStarvega = (s: string) => s.trim().toLowerCase() === "starvega";

export function DataTable({ table }: { table: LearnTable }) {
  const starvegaCol = table.head.findIndex(isStarvega);
  const wash = "bg-amber/[0.08]";

  return (
    <figure className="my-8">
      <div className="overflow-x-auto border border-ash">
        <table className="w-full border-collapse text-left text-[15px]">
          <thead>
            <tr className="border-b border-ash bg-paper">
              {table.head.map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] ${
                    i === starvegaCol
                      ? `${wash} border-x border-amber-deep/40 text-amber-deep`
                      : "text-ink-soft"
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, r) => {
              const starvegaRow = isStarvega(row[0]);
              const last = r === table.rows.length - 1;
              return (
                <tr
                  key={r}
                  className={`border-b border-line last:border-0 ${starvegaRow ? `${wash} border-y border-amber-deep/40` : ""}`}
                >
                  {row.map((cell, c) => {
                    const colHit = c === starvegaCol && !starvegaRow;
                    const strong = c === 0 || starvegaRow || c === starvegaCol;
                    return (
                      <td
                        key={c}
                        className={`px-4 py-3 align-top ${strong ? "font-semibold text-ink" : "text-ink-soft"} ${
                          colHit ? `${wash} border-x border-amber-deep/40 ${last ? "border-b" : ""}` : ""
                        }`}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {table.caption && (
        <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          {table.caption}
        </figcaption>
      )}
    </figure>
  );
}

// Phase 2: CountUp stat callout, reusing the Loyalty money-argument card look
// (bordered paper card, oversized counting figures). Entrance is handled by the
// section-level Reveal in the article template, so this is card-only.
export function StatCallout({ stats }: { stats: LearnStat[] }) {
  return (
    <div className="my-8 rounded-xl border border-ash bg-paper p-6 sm:p-8">
      <div className="flex flex-wrap gap-x-10 gap-y-6">
        {stats.map((s, i) => (
          <div key={i} className={i > 0 ? "sm:border-l sm:border-ash sm:pl-10" : ""}>
            <div className="text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">
              <CountUp to={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />
            </div>
            <p className="mt-1 max-w-[24ch] text-sm leading-snug text-ink-soft">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// The required conversion path: every /learn page links into the funnel's offer
// section (#offer) with a clear CTA.
export function OfferCta() {
  return (
    <aside className="my-12 border border-ink bg-paper p-8">
      <h2 className="font-display text-2xl font-semibold uppercase tracking-[-0.01em] text-ink">
        Own your ordering instead of renting it
      </h2>
      <p className="mt-3 max-w-[52ch] text-[17px] leading-[1.5] text-ink-soft">
        Starvega builds restaurants a fast website with their own online ordering and dashboard -
        a one-time price, zero commission, and you own it. See the packages and pricing.
      </p>
      <div className="mt-6">
        <ArrowLink href="/#offer" className="text-[15px] text-ink">
          See the packages
        </ArrowLink>
      </div>
    </aside>
  );
}
