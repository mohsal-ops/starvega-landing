"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { WidgetCtaButton } from "@/components/WidgetCta";

// Minimal fixed header — logo + one small CTA that opens the instant-preview
// widget (entry point "sticky_nav"), for visitors ready to act immediately.
// Banner behavior: hides when scrolling down, reappears when scrolling up.
// Transparent at the top; gains a white blurred bar once scrolled. Not rendered
// on /admin (that route has its own dashboard header).
export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // hide on downward scroll past the header; show on any upward scroll / near top
      if (y > lastY.current && y > 80) setHidden(true);
      else if (y < lastY.current) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-transform transition-colors duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${scrolled ? "border-b border-line bg-white/80 backdrop-blur-md" : "border-b border-transparent"}`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 sm:px-10">
        <a href="#hook" aria-label="Starvega home">
          <Image
            src="/starvega.png"
            alt="Starvega"
            width={210}
            height={210}
            priority
            className="h-8 w-auto sm:h-10"
          />
        </a>
        <WidgetCtaButton entryPoint="sticky_nav" small>
          See your site
        </WidgetCtaButton>
      </div>
    </header>
  );
}
