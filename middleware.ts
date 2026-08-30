import { NextRequest, NextResponse } from "next/server";

// Edge guard for /admin/*: bounce anyone without a session cookie straight to
// the login page (fast, no DB). The cryptographic check still happens per-page
// via requireAuth() - this is just the first gate.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (!req.cookies.get("sv_admin")?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
