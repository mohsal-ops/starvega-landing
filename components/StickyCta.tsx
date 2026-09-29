"use client";

import { useEffect, useState } from "react";
import { openWidget } from "@/lib/widget-cta";

// Phones only: a bottom "Get my free mockup" bar that appears once the hero form
// has scrolled away (the header hides on scroll-down), and hides again whenever
// a lead form is on screen - so the ask is always one thumb-tap away without
// ever covering a form.
export default function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const forms = Array.from(document.querySelectorAll("[data-lead-form]"));
    if (!forms.length) return;
    const visible = new Set<Element>();
    const update = () => setShow(visible.size === 0 && window.scrollY > 400);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      update();
    });
    forms.forEach((f) => io.observe(f));
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[180] border-t border-line bg-white/95 p-3 backdrop-blur transition-transform duration-300 lg:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!show}
    >
      <button
        type="button"
        tabIndex={show ? 0 : -1}
        onClick={() => openWidget("sticky_nav")}
        className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-amber text-[16px] font-semibold text-ink"
      >
        Get my free mockup
      </button>
    </div>
  );
}
