"use client";

import { openWidget, type EntryPoint } from "@/lib/widget-cta";

// Shared buttons that open the single instant-preview widget. `entryPoint` is the
// only thing that differs between placements - the destination is always #cta.

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

// A low-key inline band placed between funnel sections - a short line + a button,
// no re-pitching the offer. Just a door for anyone already convinced.
export function InlineWidgetCta({
  entryPoint,
  line,
  cta = "See your site",
}: {
  entryPoint: EntryPoint;
  line: string;
  cta?: string;
}) {
  return (
    <section className="border-y border-line bg-paper px-6 py-8 sm:px-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="text-base font-medium text-ink sm:text-lg">{line}</p>
        <WidgetCtaButton entryPoint={entryPoint} small className="shrink-0">
          {cta}
        </WidgetCtaButton>
      </div>
    </section>
  );
}
