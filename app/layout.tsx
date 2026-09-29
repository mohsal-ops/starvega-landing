import "./globals.css";
import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { buildMetadata } from "@/lib/seo";
import Header from "@/components/Header";
import Tracker from "@/components/Tracker";
import LazyEnhancements from "@/components/LazyEnhancements";
import { OrganizationJsonLd } from "@/components/SeoJsonLd";

// OFF+BRAND-adapted: a single geometric-sans voice. Inter is the doc's named
// substitute for Ataero Retina - monumental all-caps at display sizes, editorial
// at body sizes. Geist Mono stays only for tiny museum-signage labels.
// Speed: Inter as ONE variable-font file (not a file per weight), and
// display "optional" - the headline paints once, in whichever font is ready in
// the first ~100ms, with no late swap that re-paints it and shifts layout.
// Geist Mono is only for small labels, so it isn't preloaded at all.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "optional" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "optional", preload: false });

export const metadata: Metadata = buildMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body>
        {/* keyboard users can jump straight to the funnel content */}
        <a
          href="#hook"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        <OrganizationJsonLd />
        <Tracker />
        <Header />
        {children}
        {/* Smooth scroll, reveal animations, pricing popup, contact picker and the
            live-demo viewer - all loaded once the page is idle. */}
        <LazyEnhancements />
        {gaId && (
          <>
            {/*
              Owner exclusion: if THIS browser was flagged via /owner-mode, set
              GA's own kill-switch (window['ga-disable-<id>']=true) BEFORE the GA
              loader runs, so no page_view or event is ever collected. Reads the
              flag from localStorage/cookie on the client - no server cookie read,
              so the page stays statically rendered. See lib/owner.ts.
            */}
            <script
              dangerouslySetInnerHTML={{
                __html: `try{if(localStorage.getItem('starvega_owner')==='true'||document.cookie.indexOf('starvega_owner=true')>-1){window['ga-disable-${gaId}']=true;}}catch(e){}
window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments);};gtag('js',new Date());gtag('config','${gaId}');`,
              }}
            />
            {/* gtag.js itself waits for idle; the stub above queues events until then. */}
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="lazyOnload" />
          </>
        )}
      </body>
    </html>
  );
}
