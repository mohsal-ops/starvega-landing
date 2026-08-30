"use client";

import { openPackModal } from "@/lib/pack-modal";

// Opens the pricing popup. Use anywhere a "see the plans" CTA is needed.
export function ChoosePlanButton({
  children = "Choose your plan",
  small = false,
  variant = "amber",
  className = "",
}: {
  children?: React.ReactNode;
  small?: boolean;
  variant?: "amber" | "outline" | "outlineOnInk";
  className?: string;
}) {
  const size = small ? "min-h-[40px] px-4 py-2 text-sm" : "min-h-[52px] px-6 py-3 text-base";
  const look =
    variant === "amber"
      ? "bg-amber text-ink hover:bg-[#f0904a]"
      : variant === "outlineOnInk"
        ? "border border-white/25 text-white hover:border-white/50"
        : "border border-ink/25 text-ink hover:border-ink/50";
  return (
    <button
      type="button"
      onClick={openPackModal}
      className={`inline-flex items-center justify-center rounded-[10px] font-semibold transition-transform active:scale-[0.99] ${size} ${look} ${className}`}
    >
      {children}
    </button>
  );
}
