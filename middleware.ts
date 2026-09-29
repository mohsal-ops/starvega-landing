import { NextRequest, NextResponse } from "next/server";
import { OWNER_FLAG } from "@/lib/owner";

// 2 years, same as lib/owner.ts.
const OWNER_MAX_AGE = 60 * 60 * 24 * 730;

// Edge guard for /admin/*: bounce anyone without a session cookie straight to
// the login page (fast, no DB). The cryptographic check still happens per-page
// via requireAuth() - this is just the first gate.
//
// Any browser that opens the admin is the owner's, so it also gets the
// owner-exclusion flag here automatically - no need to remember /owner-mode.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (!req.cookies.get("sv_admin")?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  if (req.cookies.get(OWNER_FLAG)?.value !== "true") {
    res.cookies.set(OWNER_FLAG, "true", { maxAge: OWNER_MAX_AGE, path: "/", sameSite: "lax" });
  }
  return res;
}

export const config = { matcher: ["/admin/:path*"] };
