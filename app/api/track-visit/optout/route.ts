import { NextResponse } from "next/server";

// Owner exclusion: open /api/track-visit/optout once in each browser you use to
// visit the site. It drops a long-lived cookie the tracker checks, so your own
// periodic visits never email you — regardless of your (changing) IP.
// Add ?off to undo (start tracking this browser again).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const off = new URL(req.url).searchParams.has("off");
  const res = new NextResponse(
    off
      ? "Tracking re-enabled for this browser."
      : "Done — this browser is excluded. Your visits won't email you anymore.",
    { headers: { "content-type": "text/plain; charset=utf-8" } },
  );
  if (off) {
    res.cookies.set("st_notrack", "", { path: "/", maxAge: 0 });
  } else {
    res.cookies.set("st_notrack", "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 2, // 2 years
      sameSite: "lax",
    });
  }
  return res;
}
