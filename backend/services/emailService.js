import nodemailer from "nodemailer";

/**
 * Sends email if SMTP is configured; otherwise logs reset link to console (dev-friendly).
 */
export async function sendPasswordResetEmail(to, subject, html) {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.info("[emailService] SMTP not configured. Would send to:", to, "\n", html);
    return { sent: false, mock: true };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: EMAIL_FROM || SMTP_USER,
    to,
    subject,
    html,
  });

  return { sent: true };
}
