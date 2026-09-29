"use client";

import { isOwner } from "./owner";
import { sourceSignal } from "./source";

// Client analytics: a rolling 30-min sessionId (random, no PII) + a fire-and-
// forget track() that never blocks rendering. Server does geo + returning check.
const SID = "sv_sid";
const SESSION_MIN = 30;

function readCookie(name: string): string {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}

export function sessionId(): string {
  let id = readCookie(SID);
  if (!id) id = (crypto.randomUUID?.() ?? String(Math.random()).slice(2) + Date.now());
  // rolling: every call refreshes the 30-min window
  document.cookie = `${SID}=${id}; Max-Age=${SESSION_MIN * 60}; Path=/; SameSite=Lax`;
  return id;
}

// Returning visitor = this browser has been here before. Decided once per
// session (a long-lived localStorage flag, snapshotted in sessionStorage) so the
// server never has to look it up.
function isReturning(): boolean {
  try {
    const snap = sessionStorage.getItem("sv_ret");
    if (snap !== null) return snap === "1";
    const ret = localStorage.getItem("sv_seen") === "1";
    localStorage.setItem("sv_seen", "1");
    sessionStorage.setItem("sv_ret", ret ? "1" : "0");
    return ret;
  } catch {
    return false;
  }
}

export type TrackEvent =
  | "pageview" | "section_view" | "widget_opened"
  | "widget_submitted" | "preview_generated" | "onboarding_clicked"
  | "text_cta_clicked" | "preview_opened" | "preview_dashboard_opened" | "calc_used";

export function track(eventType: TrackEvent, extra?: { sectionId?: string; entryPoint?: string }) {
  if (isOwner()) return; // don't log the owner's own visits
  try {
    const body = JSON.stringify({
      sessionId: sessionId(),
      eventType,
      sectionId: extra?.sectionId,
      // Which door into the widget was used (only set on widget_opened).
      entryPoint: extra?.entryPoint,
      path: location.pathname,
      isReturning: isReturning(),
      // First-touch source: real referrer, or a "utm:<source>:<medium>" tag when
      // the landing URL carries UTM params (so outreach links are attributable).
      referrer: sourceSignal() || undefined,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  } catch {
    /* analytics must never break the page */
  }
}
