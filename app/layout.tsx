import "./globals.css";
import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { buildMetadata } from "@/lib/seo";
import SmoothScroll from "@/components/SmoothScroll";
import MotionLayer from "@/components/MotionLayer";
import CustomCursor from "@/components/CustomCursor";
import Header from "@/components/Header";
import Tracker from "@/components/Tracker";

// OFF+BRAND-adapted: a single geometric-sans voice. Inter is the doc's named
// substitute for Ataero Retina — monumental all-caps at display sizes, editorial
// at body sizes. Geist Mono stays only for tiny museum-signage labels.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["400", "500", "600", "700"], display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

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
        <SmoothScroll />
        <MotionLayer />
        <CustomCursor />
        <Tracker />
        <Header />
        {children}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
