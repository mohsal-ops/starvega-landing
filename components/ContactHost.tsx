"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { track } from "@/lib/track-client";
import {
  subscribeContactMenu,
  openContactMenu,
  closeContactMenu,
  emailComposeUrl,
  instagramDmUrl,
  contactEmail,
  CONTACT_MESSAGE,
} from "@/lib/contact";

// The persistent "reach out" experience, mounted once in the layout:
//  - a floating pill (bottom-left) that stays with the visitor as they scroll,
//  - a channel-picker popover that pre-fills a ready-to-send message.
// Instagram DMs can't be prefilled from a link, so choosing Instagram copies the
// message to the clipboard and opens the DM — paste & send. Email opens a real
// prefilled Gmail compose. Both fire text_cta_clicked so they land in the funnel.
// The same popover is opened from the preview bar and pricing modal via
// openContactMenu(), so there's one contact surface everywhere.
export function ContactHost() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => subscribeContactMenu(setOpen), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeContactMenu();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const onInstagram = async () => {
    track("text_cta_clicked");
    try {
      await navigator.clipboard.writeText(CONTACT_MESSAGE);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      /* clipboard blocked — they can still type in the DM */
    }
    window.open(instagramDmUrl, "_blank", "noopener,noreferrer");
  };

  const onCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {/* Floating pill — hidden while the popover is open (the card replaces it). */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            onClick={openContactMenu}
            aria-label="Apply to work with me"
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 380, damping: 30, delay: reduce ? 0 : 1.2 }}
            whileHover={reduce ? undefined : { scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="group fixed bottom-5 left-5 z-[185] inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-ink py-3 pl-3 pr-4 text-white shadow-xl ring-1 ring-white/10 sm:pr-5"
          >
            {/* Brand echo: the hero's iridescent sphere, breathing behind the icon. */}
            <motion.span
              aria-hidden
              className="absolute -left-3 -top-3 h-14 w-14 rounded-full blur-md"
              style={{ backgroundImage: "var(--gradient-sphere)", opacity: 0.55 }}
              animate={reduce ? undefined : { scale: [1, 1.15, 1], rotate: [0, 360] }}
              transition={{ scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 30, repeat: Infinity, ease: "linear" } }}
            />
            <span className="relative grid h-8 w-8 place-items-center rounded-full bg-white/10">
              <SendIcon className="h-4 w-4 text-white" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber ring-2 ring-ink">
                {!reduce && <span className="absolute inset-0 animate-ping rounded-full bg-amber" />}
              </span>
            </span>
            <span className="relative whitespace-nowrap text-sm font-semibold">
              <span className="hidden sm:inline">Apply to work with me</span>
              <span className="sm:hidden">Apply</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[320] flex items-end justify-center bg-ink/50 p-3 backdrop-blur-sm sm:items-end sm:justify-start sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeContactMenu}
            role="dialog"
            aria-modal="true"
            aria-label="Get in touch"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 320, damping: 30 }}
              className="relative w-full max-w-sm overflow-hidden rounded-[18px] border border-ash bg-bg p-6 shadow-2xl sm:mb-2 sm:ml-2"
            >
              {/* corner iridescence */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl"
                style={{ backgroundImage: "var(--gradient-sphere)", opacity: 0.18 }}
              />

              <button
                type="button"
                onClick={closeContactMenu}
                aria-label="Close"
                className="absolute right-3.5 top-3.5 grid h-8 w-8 place-items-center rounded-full border border-ash text-ink transition-colors hover:bg-paper"
              >
                <span aria-hidden className="text-lg leading-none">&times;</span>
              </button>

              <p className="relative mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-amber">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber" />
                Apply to work with me
              </p>
              <h3 className="relative text-xl font-semibold tracking-[-0.01em] text-ink">
                Tell me about your spot.
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-ink-soft">
                I build and manage each site personally, so I take on a handful of restaurants at a
                time. Pick how you&apos;d rather reach me — the message is written for you.
              </p>

              <div className="relative mt-5 space-y-2.5">
                <ChannelButton
                  reduce={!!reduce}
                  index={0}
                  onClick={onInstagram}
                  icon={<InstagramIcon className="h-5 w-5" />}
                  title="Message me on Instagram"
                  sub={copied ? "Message copied — just paste & send ✓" : "Opens your DM, message ready to paste"}
                  highlight={copied}
                />
                <ChannelButton
                  reduce={!!reduce}
                  index={1}
                  href={emailComposeUrl()}
                  onClick={() => track("text_cta_clicked")}
                  icon={<MailIcon className="h-5 w-5" />}
                  title="Email me"
                  sub="Opens a ready-to-send email"
                />
              </div>

              <div className="relative mt-4 flex items-center justify-center gap-2 text-xs text-ink-soft">
                <span>or copy {contactEmail}</span>
                <button
                  type="button"
                  onClick={onCopyEmail}
                  className="rounded-md border border-ash px-2 py-0.5 text-ink transition-colors hover:bg-paper"
                >
                  {emailCopied ? "Copied" : "Copy"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ChannelButton({
  reduce,
  index,
  href,
  onClick,
  icon,
  title,
  sub,
  highlight,
}: {
  reduce: boolean;
  index: number;
  href?: string;
  onClick?: () => void;
  icon: ReactNode;
  title: string;
  sub: string;
  highlight?: boolean;
}) {
  const inner = (
    <>
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-colors ${highlight ? "border-amber bg-amber/10 text-amber" : "border-ash bg-paper text-ink group-hover:border-ink"}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className={`block truncate text-xs ${highlight ? "text-amber" : "text-ink-soft"}`}>{sub}</span>
      </span>
      <span aria-hidden className="text-ink-soft transition-transform group-hover:translate-x-0.5">→</span>
    </>
  );
  const cls =
    "group flex w-full items-center gap-3 rounded-2xl border border-ash bg-bg p-3 transition-colors hover:border-ink hover:bg-paper";
  const anim = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: reduce ? 0 : 0.08 + index * 0.07, type: "spring" as const, stiffness: 360, damping: 28 },
  };
  return href ? (
    <motion.a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={cls} {...anim}>
      {inner}
    </motion.a>
  ) : (
    <motion.button type="button" onClick={onClick} className={cls} {...anim}>
      {inner}
    </motion.button>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}
function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
