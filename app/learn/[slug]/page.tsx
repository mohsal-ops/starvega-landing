import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { Breadcrumb, DataTable, OfferCta } from "@/components/learn/parts";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import {
  LEARN_PAGES,
  getLearnPage,
  clustersOf,
  learnHref,
  type LearnPage,
} from "@/lib/learn";
import { getArticle } from "@/lib/learn-content";

// One static page per /learn article. Content comes from lib/learn-content.tsx,
// metadata from lib/learn.ts - both keyed by the same slug, so nothing drifts.
export function generateStaticParams() {
  return LEARN_PAGES.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false; // only the registered slugs; anything else 404s

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getLearnPage(slug);
  if (!page) return {};
  return buildMetadata({
    title: `${page.title} | Starvega`,
    description: page.description,
    path: learnHref(slug),
  });
}

function ArticleJsonLd({ page }: { page: LearnPage }) {
  const article = getArticle(page.slug);
  const base = SITE.url.replace(/\/$/, "");
  const url = `${base}${learnHref(page.slug)}`;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: page.title,
          description: page.description,
          datePublished: article?.updated,
          dateModified: article?.updated,
          author: { "@type": "Organization", name: "Starvega", url: base },
          publisher: {
            "@type": "Organization",
            name: "Starvega",
            logo: { "@type": "ImageObject", url: `${base}/starvega.png` },
          },
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
        }),
      }}
    />
  );
}

// Cluster -> pillar, and pillar -> its clusters. This is the internal linking
// that concentrates authority on the pillar and moves it toward the funnel.
function RelatedLinks({ page }: { page: LearnPage }) {
  if (page.kind === "cluster") {
    const pillar = getLearnPage(page.pillarSlug);
    const siblings = clustersOf(page.pillarSlug).filter((c) => c.slug !== page.slug);
    if (!pillar) return null;
    return (
      <nav aria-label="Related" className="mt-12 border-t border-line pt-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">Part of</p>
        <Link href={learnHref(pillar.slug)} className="mt-2 block text-[17px] font-semibold text-ink hover:text-amber-deep">
          {pillar.title} →
        </Link>
        {siblings.length > 0 && (
          <ul className="mt-5 space-y-2">
            {siblings.map((s) => (
              <li key={s.slug}>
                <Link href={learnHref(s.slug)} className="text-[15px] text-ink-soft hover:text-ink">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>
    );
  }
  const clusters = clustersOf(page.slug);
  if (clusters.length === 0) return null;
  return (
    <nav aria-label="In this guide" className="mt-12 border-t border-line pt-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">Go deeper</p>
      <ul className="mt-4 space-y-3">
        {clusters.map((c) => (
          <li key={c.slug}>
            <Link href={learnHref(c.slug)} className="text-[17px] font-semibold text-ink hover:text-amber-deep">
              {c.title} →
            </Link>
            <p className="mt-1 max-w-[60ch] text-[14px] leading-[1.5] text-ink-soft">{c.description}</p>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default async function LearnArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getLearnPage(slug);
  const article = getArticle(slug);
  if (!page || !article) notFound();

  return (
    <>
      <main className="mx-auto max-w-[46rem] px-6 pb-16 pt-28 sm:pt-32">
        <ArticleJsonLd page={page} />
        <Breadcrumb
          trail={[
            { label: "Home", href: "/" },
            { label: "Learn", href: "/learn" },
            { label: page.kind === "pillar" ? "Guide" : "Breakdown" },
          ]}
        />

        <article>
          <header>
            <h1 className="max-w-[20ch] font-display text-[clamp(2rem,5vw,3.25rem)] font-semibold uppercase leading-[0.98] tracking-[-0.015em] text-ink">
              {page.title}
            </h1>
            {/* AEO: the plain-language direct answer, right under the H1. */}
            <p className="mt-6 max-w-[60ch] text-[19px] leading-[1.55] text-ink">{article.lead}</p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft">
              Updated {new Date(article.updated).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </header>

          {article.sections.map((s, i) => (
            <section key={i} className="mt-10">
              <h2 className="font-display text-[1.55rem] font-semibold tracking-[-0.01em] text-ink">{s.h}</h2>
              {s.body?.map((p, j) => (
                <p key={j} className="mt-4 max-w-[62ch] text-[17px] leading-[1.6] text-ink-soft">
                  {p}
                </p>
              ))}
              {s.bullets && (
                <ul className="mt-4 max-w-[62ch] space-y-2">
                  {s.bullets.map((b, j) => (
                    <li key={j} className="flex gap-3 text-[17px] leading-[1.55] text-ink-soft">
                      <span aria-hidden className="mt-[0.55em] h-[6px] w-[6px] shrink-0 bg-amber-deep" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {s.table && <DataTable table={s.table} />}
            </section>
          ))}

          <OfferCta />
          <RelatedLinks page={page} />
        </article>
      </main>
      <Footer />
    </>
  );
}
