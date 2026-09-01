import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { LEARN_PAGES, learnHref } from "@/lib/learn";

// /sitemap.xml — the funnel page plus every /learn article. Public, indexable
// routes only; admin / owner-mode / checkout / onboard / api are excluded here
// and Disallow'd in robots.ts. URLs are built from lib/learn.ts so the sitemap
// can't drift from the pages that actually exist.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url.replace(/\/$/, "");
  const now = new Date();

  const home: MetadataRoute.Sitemap[number] = {
    url: `${base}/`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1,
  };

  const learn: MetadataRoute.Sitemap = LEARN_PAGES.map((p) => ({
    url: `${base}${learnHref(p.slug)}`,
    lastModified: now,
    changeFrequency: "monthly",
    // Pillars are the hubs authority flows to — rank them above clusters.
    priority: p.kind === "pillar" ? 0.8 : 0.6,
  }));

  const learnIndex: MetadataRoute.Sitemap[number] = {
    url: `${base}/learn`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  };

  return [home, learnIndex, ...learn];
}
