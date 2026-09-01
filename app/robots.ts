import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// /robots.txt — allow the public funnel + /learn, block everything private or
// transactional so it never gets crawled or indexed. Points crawlers at the
// sitemap. /owner-mode is listed so the analytics-exclusion route stays unindexed.
export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/owner-mode", "/checkout", "/onboard", "/api"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
