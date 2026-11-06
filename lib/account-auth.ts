// Restaurant-owner login for the client dashboard (/account). No passwords: we
// email a 6-digit code (hashed in LoginCode, 15 minutes, 5 tries), then set a
// signed cookie. Separate cookie and key from the admin login.

import { createHash, createHmac, randomInt, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import db from "@/lib/db";

export const ACCOUNT_COOKIE = "sv_acct";
const MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days
const CODE_MINUTES = 15;
const MAX_TRIES = 5;

const BASE_SECRET =
  process.env.ADMIN_SECRET ||
  (process.env.ADMIN_PASSWORD
    ? createHash("sha256").update(`admin-session:${process.env.ADMIN_PASSWORD}`).digest("hex")
    : process.env.NODE_ENV === "production"
      ? ""
      : "insecure-dev-secret-change-me");
// Derived so an account cookie can never be used as an admin cookie (or back).
const SECRET = BASE_SECRET ? createHash("sha256").update(`account:${BASE_SECRET}`).digest("hex") : "";

const sign = (v: string) => createHmac("sha256", SECRET).update(v).digest("hex");

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function makeAccountToken(accountId: string): string {
  if (!SECRET) throw new Error("ADMIN_SECRET is not set");
  const exp = String(Date.now() + MAX_AGE_SEC * 1000);
  return `${accountId}.${exp}.${sign(`${accountId}.${exp}`)}`;
}

export function readAccountToken(token?: string): string | null {
  if (!token || !SECRET) return null;
  const [id, exp, sig] = token.split(".");
  if (!id || !exp || !sig || Date.now() > Number(exp)) return null;
  return safeEqual(sig, sign(`${id}.${exp}`)) ? id : null;
}

export async function setAccountCookie(accountId: string) {
  (await cookies()).set(ACCOUNT_COOKIE, makeAccountToken(accountId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function clearAccountCookie() {
  (await cookies()).delete(ACCOUNT_COOKIE);
}

export async function currentAccountId(): Promise<string | null> {
  return readAccountToken((await cookies()).get(ACCOUNT_COOKIE)?.value);
}

/** The signed-in account, or a redirect to the login page. */
export async function requireAccount() {
  const id = await currentAccountId();
  const account = id ? await db.account.findUnique({ where: { id } }) : null;
  if (!account) redirect("/account/login");
  return account;
}

const hashCode = (code: string) => createHash("sha256").update(`${SECRET}:${code}`).digest("hex");

/** New 6-digit code for an account (older unused codes stop working). */
export async function newLoginCode(accountId: string): Promise<string> {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.loginCode.updateMany({ where: { accountId, usedAt: null }, data: { usedAt: new Date() } });
  await db.loginCode.create({
    data: { accountId, codeHash: hashCode(code), expiresAt: new Date(Date.now() + CODE_MINUTES * 60_000) },
  });
  return code;
}

/** Check a typed code. Returns true and burns it on success. */
export async function checkLoginCode(accountId: string, code: string): Promise<boolean> {
  const row = await db.loginCode.findFirst({
    where: { accountId, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!row || row.attempts >= MAX_TRIES) return false;
  const ok = safeEqual(row.codeHash, hashCode(code.replace(/\D/g, "")));
  await db.loginCode.update({
    where: { id: row.id },
    data: ok ? { usedAt: new Date() } : { attempts: { increment: 1 } },
  });
  return ok;
}

export const LOGIN_CODE_MINUTES = CODE_MINUTES;
