import type { Metadata } from "next";
import { SITE } from "./site";

// Same spirit as the client template's buildMetadata(): one place that generates
// title / description / OpenGraph / canonical so metadata can never drift. This
// page is public and SHOULD be indexed (unlike the client sites' preview routes).

const TITLE = "Restaurant websites with zero-commission online ordering | Starvega";
const DESCRIPTION =
  "Stop paying DoorDash 15-30% on every order. I build restaurants a fast website with their own online ordering and dashboard. One-time price, zero commission, you own it.";

// Social share image. The existing brand wordmark (2172x724). A dedicated
// 1200x630 card would crop cleaner in some social previews - swap the path here
// if one is ever produced; declaring the true dimensions keeps crawlers honest.
const OG_IMAGE = {
  url: "/starvega.png",
  width: 2172,
  height: 724,
  alt: "Starvega - restaurant websites with zero-commission online ordering",
};

// Per-page override hook so /learn articles can set their own title/description/
// canonical while inheriting all the OG/Twitter/robots defaults from one place.
export function buildMetadata(opts?: {
  title?: string;
  description?: string;
  path?: string; // canonical path, e.g. "/learn/doordash-fees"
}): Metadata {
  const title = opts?.title ?? TITLE;
  const description = opts?.description ?? DESCRIPTION;
  const path = opts?.path ?? "/";
  return {
    metadataBase: new URL(SITE.url),
    title,
    description,
    keywords: [
      "restaurant website builder",
      "zero commission online ordering",
      "restaurant online ordering system",
      "commission free food ordering",
      "restaurant website with ordering",
    ],
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: new URL(path, SITE.url).toString(),
      siteName: SITE.name,
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
    robots: { index: true, follow: true },
    // Set GOOGLE_SITE_VERIFICATION in the env to render the
    // <meta name="google-site-verification"> tag Search Console asks for.
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
      : {}),
  };
}
