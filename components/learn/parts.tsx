import Link from "next/link";
import { ArrowLink } from "@/components/ArrowLink";
import type { LearnTable } from "@/lib/learn-content";

// Small presentational pieces shared by the /learn index and article pages.
// Kept server-rendered (no "use client") so all article content is in the HTML.

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

export function DataTable({ table }: { table: LearnTable }) {
  return (
    <figure className="my-8">
      <div className="overflow-x-auto border border-ash">
        <table className="w-full border-collapse text-left text-[15px]">
          <thead>
            <tr className="border-b border-ash bg-paper">
              {table.head.map((h, i) => (
                <th key={i} className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, r) => (
              <tr key={r} className="border-b border-line last:border-0">
                {row.map((cell, c) => (
                  <td key={c} className={`px-4 py-3 align-top ${c === 0 ? "font-semibold text-ink" : "text-ink-soft"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
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
