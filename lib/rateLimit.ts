import db from "@/lib/db";

// Persistent rate limit (works across serverless instances, unlike an
// in-memory Map). One tiny table, created on first use. Returns true when the
// action is allowed. Fails OPEN on a DB hiccup so a real customer is never
// blocked by our own outage.
let ready: Promise<unknown> | null = null;
function ensure() {
  ready ??= (async () => {
    // one statement per call (prepared statements can't batch)
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "RateHit" ("key" TEXT NOT NULL, "at" TIMESTAMPTZ NOT NULL DEFAULT now())`);
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "RateHit_key_at" ON "RateHit" ("key","at")`);
  })().catch(() => (ready = null));
  return ready;
}

export async function rateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  try {
    await ensure();
    const rows = await db.$queryRawUnsafe<{ n: number }[]>(
      `SELECT count(*)::int AS n FROM "RateHit" WHERE "key" = $1 AND "at" > now() - ($2 || ' seconds')::interval`,
      key,
      String(windowSec),
    );
    if ((rows[0]?.n ?? 0) >= limit) return false;
    await db.$executeRawUnsafe(`INSERT INTO "RateHit" ("key") VALUES ($1)`, key);
    if (Math.random() < 0.02) await db.$executeRawUnsafe(`DELETE FROM "RateHit" WHERE "at" < now() - interval '2 days'`);
    return true;
  } catch {
    return true;
  }
}

/** Best-effort client IP from Vercel's headers. */
export function clientIp(h: Headers): string {
  return (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}
