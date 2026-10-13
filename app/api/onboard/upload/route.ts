import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import db from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";

// Browser → Vercel Blob uploads for the paid launch wizard (logo, menu photos /
// PDF, food photos). Files go straight from the browser to Blob (no 4.5MB
// serverless body limit); this route only mints the upload token - and only for
// a lead whose payment is captured. Needs BLOB_READ_WRITE_TOKEN (Vercel env).
export const runtime = "nodejs";

// No SVG: it can carry script.
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/gif", "application/pdf"];

export async function POST(req: NextRequest) {
  const body = (await req.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let leadId = "";
        try {
          leadId = String((JSON.parse(clientPayload || "{}") as { leadId?: string }).leadId || "");
        } catch {
          /* fall through */
        }
        const lead = leadId ? await db.instantDemoLead.findUnique({ where: { id: leadId }, select: { paymentStatus: true } }) : null;
        if (!lead || lead.paymentStatus !== "paid") throw new Error("Uploads open after payment.");
        if (!pathname.startsWith(`launch/${leadId}/`)) throw new Error("Bad upload path.");
        // 60 files per lead per day is plenty (logo + 12 menu + 15 photos, with retries)
        if (!(await rateLimit(`upload:${leadId}`, 60, 86400))) throw new Error("Upload limit reached - message us.");
        return {
          allowedContentTypes: TYPES,
          maximumSizeInBytes: 20 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ leadId }),
        };
      },
      onUploadCompleted: async () => {
        // URLs come back through the wizard's own submit - nothing to do here.
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
