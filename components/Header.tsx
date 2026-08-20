"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Minimal fixed header — logo ONLY, no nav (the single-CTA funnel stays intact).
// Transparent over the white hero; once scrolled it gains a white blurred bar so
// the black wordmark stays legible over the dark Agitate/Offer sections.
export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-line bg-white/80 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center px-6 py-3 sm:px-10">
        <a href="#hook" aria-label="Starvega — home">
          <Image
            src="/starvega.png"
            alt="Starvega"
            width={210}
            height={70}
            priority
            className="h-8 w-auto sm:h-10"
          />
        </a>
      </div>
    </header>
  );
}
