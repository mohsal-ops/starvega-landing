// Owner-exclusion flag: keeps the developer's own visits out of analytics.
// The name is used as BOTH the cookie name and the localStorage key so the flag
// can be read client-side (localStorage, for the GA `ga-disable` switch and the
// /api/track beacon) AND server-side (the cookie, so /api/track can skip the DB
// write even if the beacon somehow fires). Set by visiting /owner-mode.
export const OWNER_FLAG = "starvega_owner";

// 2 years — effectively permanent for a dev machine, but not literally forever.
const MAX_AGE = 60 * 60 * 24 * 730;

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}

// True when THIS browser has been flagged as the owner. Checks localStorage
// first (survives cookie clears in some browsers) then the cookie. Guarded so it
// is safe to call during SSR (always false there — the server uses the cookie).
export function isOwner(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem(OWNER_FLAG) === "true") return true;
  } catch {
    /* localStorage can throw in private mode */
  }
  return readCookie(OWNER_FLAG) === "true";
}

export function setOwnerFlag(): void {
  try {
    window.localStorage.setItem(OWNER_FLAG, "true");
  } catch {
    /* ignore */
  }
  document.cookie = `${OWNER_FLAG}=true; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax`;
}

export function clearOwnerFlag(): void {
  try {
    window.localStorage.removeItem(OWNER_FLAG);
  } catch {
    /* ignore */
  }
  document.cookie = `${OWNER_FLAG}=; Max-Age=0; Path=/; SameSite=Lax`;
}
