"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Everything that isn't needed to read the page or use the hero form: the
// scroll-reveal layer, the pricing popup, the contact picker
// and the live-demo viewer. Their JS is only requested once the page has loaded
// and the browser is idle, so none of it competes with first paint or input.
const MotionLayer = dynamic(() => import("./MotionLayer"), { ssr: false });
const PreviewHost = dynamic(() => import("./PreviewHost"), { ssr: false });
const PackModalHost = dynamic(() => import("./packs/PackModalHost").then((m) => m.PackModalHost), { ssr: false });
const StickyCta = dynamic(() => import("./StickyCta"), { ssr: false });
const ContactHost = dynamic(() => import("./ContactHost").then((m) => m.ContactHost), { ssr: false });

export default function LazyEnhancements() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const go = () => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) w.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      else setTimeout(() => setReady(true), 200);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    // Any tap before then loads everything right away.
    const now = () => setReady(true);
    window.addEventListener("pointerdown", now, { once: true, passive: true });
    return () => window.removeEventListener("pointerdown", now);
  }, []);

  if (!ready) return null;
  return (
    <>
      <MotionLayer />
      <PreviewHost />
      <PackModalHost />
      <ContactHost />
      <StickyCta />
    </>
  );
}
