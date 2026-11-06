import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { newLoginCode, LOGIN_CODE_MINUTES } from "@/lib/account-auth";
import { sendMail } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/rateLimit";

// POST /api/account/login/request { email } - email a 6-digit sign-in code.
// Always answers the same way, so nobody can test which emails are clients.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  const e = (email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return NextResponse.json({ error: "Enter the email you signed up with." }, { status: 400 });
  if (!(await rateLimit(`acct-code:${clientIp(req.headers)}`, 8, 3600)) || !(await rateLimit(`acct-code-mail:${e}`, 5, 3600))) {
    return NextResponse.json({ error: "Too many codes asked. Please wait a bit." }, { status: 429 });
  }
  const account = await db.account.findUnique({ where: { email: e } });
  if (account) {
    const code = await newLoginCode(account.id);
    await sendMail(
      e,
      `${code} is your Starvega sign-in code`,
      `Your sign-in code: ${code}\n\nIt works for ${LOGIN_CODE_MINUTES} minutes. If you didn't ask for it, ignore this email.\n\nStarvega`,
    ).catch((err) => console.error("[account/login] mail failed", err));
  }
  return NextResponse.json({ ok: true });
}
