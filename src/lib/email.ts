import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.EMAIL_FROM ?? "Online Quran Academy <onboarding@resend.dev>";

const resend = apiKey ? new Resend(apiKey) : null;

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  if (!resend) {
    console.warn("⚠️ RESEND_API_KEY not set — email not sent. Reset URL:", resetUrl);
    return { sent: false, reason: "email_service_not_configured" as const };
  }

  try {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to,
      subject: "Reset your password - Online Quran Academy",
      html: passwordResetHtml({ name, resetUrl }),
    });

    if (error) {
      console.error("Resend error:", error);
      return { sent: false, reason: "send_failed" as const };
    }

    return { sent: true, reason: null };
  } catch (e) {
    console.error("Email send exception:", e);
    return { sent: false, reason: "send_failed" as const };
  }
}

function passwordResetHtml({ name, resetUrl }: { name: string; resetUrl: string }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Reset Password</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0fdfa; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); padding: 32px; text-align: center; color: white;">
      <div style="font-size: 28px; font-weight: bold;">📖 Online Quran Academy</div>
      <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Password Reset Request</p>
    </div>
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #1f2937;">Assalamu Alaikum <strong>${escapeHtml(name)}</strong>,</p>
      <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
        We received a request to reset your password for your Online Quran Academy account.
        Click the button below to set a new password:
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); color: white; padding: 14px 32px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(15,118,110,0.3);">
          Reset Password
        </a>
      </div>
      <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">
        Or copy this link into your browser:<br>
        <a href="${resetUrl}" style="color: #0f766e; word-break: break-all;">${resetUrl}</a>
      </p>
      <p style="font-size: 13px; color: #6b7280; margin-top: 24px;">
        ⏰ This link will expire in <strong>1 hour</strong>.<br>
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        © Online Quran Academy · This is an automated message
      </p>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
