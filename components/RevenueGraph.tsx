"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// An upward revenue/traffic line chart that draws itself on scroll - bars rise,
// the line traces from left to right, the area fills, and the leading dot lands.
// Pure SVG, amber on white, editorial. Reduced-motion renders the final state.
export function RevenueGraph({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const line = svg.querySelector<SVGPathElement>(".rg-line");
    const area = svg.querySelector<SVGPathElement>(".rg-area");
    const dot = svg.querySelector<SVGCircleElement>(".rg-dot");
    const bars = svg.querySelectorAll<SVGRectElement>(".rg-bar");
    if (!line) return;

    const len = line.getTotalLength();
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: reduce ? 0 : len });
    gsap.set(area, { opacity: reduce ? 1 : 0 });
    gsap.set(dot, { opacity: reduce ? 1 : 0 });
    gsap.set(bars, { scaleY: reduce ? 1 : 0, transformOrigin: "bottom" });
    if (reduce) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: "top 80%", once: true } });
      tl.to(bars, { scaleY: 1, duration: 0.7, ease: "power3.out", stagger: 0.06 })
        .to(line, { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut" }, 0.25)
        .to(area, { opacity: 1, duration: 0.9 }, 0.7)
        .to(dot, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(3)" }, 1.25);
    }, svg);
    return () => ctx.revert();
  }, []);

  // Baseline y=180. Points climb left→right.
  const pts = "20,168 78,150 136,156 194,120 252,104 310,66 392,34";
  const linePath = `M${pts.split(" ").join(" L")}`;
  const areaPath = `${linePath} L392,180 L20,180 Z`;
  const barXs = [20, 78, 136, 194, 252, 310, 392];
  const barYs = [168, 150, 156, 120, 104, 66, 34];

  return (
    <svg ref={ref} viewBox="0 0 412 210" className={className} role="img" aria-label="Organic traffic growing over time">
      <defs>
        <linearGradient id="rg-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-amber)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--color-amber)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* hairline gridlines */}
      {[40, 80, 120, 160].map((y) => (
        <line key={y} x1="20" y1={y} x2="392" y2={y} stroke="var(--color-line)" strokeWidth="1" />
      ))}
      <line x1="20" y1="180" x2="392" y2="180" stroke="var(--color-ash)" strokeWidth="1" />

      {/* faint rising bars behind the line */}
      {barXs.map((x, i) => (
        <rect
          key={x}
          className="rg-bar"
          x={x - 6}
          y={barYs[i]}
          width="12"
          height={180 - barYs[i]}
          fill="var(--color-amber)"
          opacity="0.1"
        />
      ))}

      <path className="rg-area" d={areaPath} fill="url(#rg-fill)" />
      <path
        className="rg-line"
        d={linePath}
        fill="none"
        stroke="var(--color-amber)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle className="rg-dot" cx="392" cy="34" r="5.5" fill="var(--color-amber)" />

      <text x="20" y="16" fontSize="11" fontFamily="var(--font-mono)" letterSpacing="1.5" fill="var(--color-ink-soft)">
        ORGANIC TRAFFIC ▲
      </text>
    </svg>
  );
}
