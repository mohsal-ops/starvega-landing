import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Single-admin signed-cookie auth, ported from the builder panel's pattern.
export const SESSION_COOKIE = "sv_admin";
// Never a public default (anyone could forge an admin cookie with it). Without
// ADMIN_SECRET, derive the key from the admin password, which only you know.
const SECRET =
  process.env.ADMIN_SECRET ||
  (process.env.ADMIN_PASSWORD
    ? createHash("sha256").update(`admin-session:${process.env.ADMIN_PASSWORD}`).digest("hex")
    : process.env.NODE_ENV === "production"
      ? ""
      : "insecure-dev-secret-change-me");
export const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

export function makeToken(): string {
  if (!SECRET) throw new Error("ADMIN_SECRET is not set");
  const exp = String(Date.now() + MAX_AGE_SEC * 1000);
  const sig = createHmac("sha256", SECRET).update(exp).digest("hex");
  return `${exp}.${sig}`;
}

export function verifyToken(token?: string): boolean {
  if (!token || !SECRET) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  if (Date.now() > Number(exp)) return false;
  const expected = createHmac("sha256", SECRET).update(exp).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAuthed(): Promise<boolean> {
  return verifyToken((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function requireAuth(): Promise<void> {
  if (!(await isAuthed())) redirect("/admin/login");
}
