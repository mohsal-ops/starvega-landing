import nodemailer from "nodemailer";

// Shared owner-notification mailer. No-ops (returns false) when SMTP isn't
// configured, so a missing env var never throws in a request path. Used by the
// digest and by instant pack-selection / payment alerts.
export async function sendOwnerMail(subject: string, text: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const to = process.env.TRACK_NOTIFY_TO;
  if (!host || !to) return false;
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transport.sendMail({
    from: process.env.TRACK_NOTIFY_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });
  return true;
}
