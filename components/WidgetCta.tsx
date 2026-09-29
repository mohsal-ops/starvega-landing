"use client";

import { openWidget, type EntryPoint } from "@/lib/widget-cta";

// The shared "Get my free mockup" button: scrolls to the nearest lead form (see
// lib/widget-cta). `entryPoint` records which placement was used.

const base =
  "inline-flex items-center justify-center rounded-xl bg-amber font-semibold text-ink transition-transform hover:bg-[#f0904a] active:scale-[0.99]";

export function WidgetCtaButton({
  entryPoint,
  children,
  small = false,
  className = "",
}: {
  entryPoint: EntryPoint;
  children: React.ReactNode;
  small?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => openWidget(entryPoint)}
      className={`${base} ${small ? "min-h-[48px] px-4 py-2 text-sm" : "min-h-[52px] px-6 py-3 text-base"} ${className}`}
    >
      {children}
    </button>
  );
}
