import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { checkLoginCode, setAccountCookie } from "@/lib/account-auth";
import { clientIp, rateLimit } from "@/lib/rateLimit";

// POST /api/account/login/verify { email, code } - sign in with the emailed code.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { email, code } = (await req.json().catch(() => ({}))) as { email?: string; code?: string };
  const e = (email ?? "").trim().toLowerCase();
  if (!(await rateLimit(`acct-verify:${clientIp(req.headers)}`, 20, 3600))) {
    return NextResponse.json({ error: "Too many tries. Please wait a bit." }, { status: 429 });
  }
  const account = e ? await db.account.findUnique({ where: { email: e } }) : null;
  if (!account || !code || !(await checkLoginCode(account.id, code))) {
    return NextResponse.json({ error: "That code didn't work. Check it, or ask for a new one." }, { status: 400 });
  }
  await db.account.update({ where: { id: account.id }, data: { lastLoginAt: new Date() } });
  await setAccountCookie(account.id);
  return NextResponse.json({ ok: true });
}
