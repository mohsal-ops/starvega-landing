import type { ComponentPropsWithoutRef, ReactNode } from "react";

// Ghost text link with the OFF+BRAND scaleX wipe + arrow slide (see .link in
// globals.css). Text and destination are passed through unchanged - this only
// restyles the hover, never the copy or where the link goes. Use onInk on the
// dark (bg-ink) sections so the fill inverts correctly.
export function ArrowLink({
  children,
  arrow = "→",
  onInk = false,
  className = "",
  ...rest
}: {
  children: ReactNode;
  arrow?: string;
  onInk?: boolean;
} & ComponentPropsWithoutRef<"a">) {
  return (
    <a {...rest} className={`link ${onInk ? "link--on-ink" : ""} ${className}`}>
      <span className="link-fill" aria-hidden />
      <span className="link-label">{children}</span>
      <span className="link-arrow" aria-hidden>
        {arrow}
      </span>
    </a>
  );
}
