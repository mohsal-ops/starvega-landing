import type { Metadata } from "next";
import { SITE } from "./site";

// Same spirit as the client template's buildMetadata(): one place that generates
// title / description / OpenGraph / canonical so metadata can never drift. This
// page is public and SHOULD be indexed (unlike the client sites' preview routes).

const TITLE = "Restaurant websites with zero-commission online ordering | Vega Star Digital";
const DESCRIPTION =
  "Stop paying DoorDash 15-30% on every order. I build restaurants a fast website with their own online ordering and dashboard. One-time price, zero commission, you own it.";

export function buildMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE.url),
    title: TITLE,
    description: DESCRIPTION,
    keywords: [
      "restaurant website builder",
      "zero commission online ordering",
      "restaurant online ordering system",
      "commission free food ordering",
      "restaurant website with ordering",
    ],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: SITE.url,
      siteName: SITE.name,
      title: TITLE,
      description: DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
    },
    robots: { index: true, follow: true },
  };
}
