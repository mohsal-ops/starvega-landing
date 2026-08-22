"use client";

import { useEffect } from "react";

// Fires a one-shot beacon to /api/track-visit on the first load of a browser
// session. sessionStorage dedupe means refreshes/back-forward don't re-send;
// the server does the IP/geo lookup, opt-out check, and email. Failures are
// swallowed — this must never affect the visitor's experience.
export default function VisitTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("st_tracked")) return;
      sessionStorage.setItem("st_tracked", "1");
    } catch {
      /* private mode / storage blocked — still fire once */
    }
    fetch("/api/track-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: location.pathname, referrer: document.referrer || "" }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
