import { Resend } from "resend";
import { siteConfig } from "@/lib/siteConfig";

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

// ── Contact page enquiries ──────────────────────────────────────────────────

// Where Contact page messages go (CONTACT_EMAIL overrides it)
const contactInbox = process.env.CONTACT_EMAIL ?? "info@quranwest.com";
const WHATSAPP_DISPLAY = "+44 7508 803086";

export type ContactEnquiry = {
  firstName: string;
  lastName: string;
  whatsapp: string;
  email: string;
  country: string;
  enquiry: string;
  learner: string;
  preferredTime: string;
  message: string;
  updates: boolean;
};

// Sends the enquiry to the Quran West inbox, then the family's automatic
// reply. Only the first counts: if the reply fails, the enquiry still arrived.
export async function sendContactEnquiryEmails(enquiry: ContactEnquiry) {
  if (!resend) {
    console.warn("⚠️ RESEND_API_KEY not set — contact enquiry not sent:", enquiry);
    return { sent: false, reason: "email_service_not_configured" as const };
  }

  try {
    const name = `${enquiry.firstName} ${enquiry.lastName}`.trim();
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: contactInbox,
      replyTo: enquiry.email || undefined,
      subject: `New enquiry: ${enquiry.enquiry} — ${name}`,
      html: contactEnquiryHtml(enquiry),
    });
    if (error) {
      console.error("Resend error (contact enquiry):", error);
      return { sent: false, reason: "send_failed" as const };
    }
  } catch (e) {
    console.error("Email send exception (contact enquiry):", e);
    return { sent: false, reason: "send_failed" as const };
  }

  if (enquiry.email) {
    try {
      const { error } = await resend.emails.send({
        from: fromAddress,
        to: enquiry.email,
        replyTo: contactInbox,
        subject: "We've received your message — Quran West",
        html: contactAutoReplyHtml(enquiry),
      });
      if (error) console.error("Resend error (contact auto-reply):", error);
    } catch (e) {
      console.error("Email send exception (contact auto-reply):", e);
    }
  }

  return { sent: true, reason: null };
}

function contactEnquiryHtml(e: ContactEnquiry) {
  const rows: [string, string][] = [
    ["Name", `${e.firstName} ${e.lastName}`.trim()],
    ["WhatsApp", e.whatsapp],
    ["Email", e.email],
    ["Country", e.country],
    ["Enquiry", e.enquiry],
    ["Who is learning", e.learner],
    ["Best time for lessons", e.preferredTime],
    ["Wants updates", e.updates ? "Yes" : "No"],
  ];
  const rowHtml = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;color:#6b7280;font-size:14px;white-space:nowrap;vertical-align:top;">${k}</td><td style="padding:8px 12px;color:#0B1A37;font-size:14px;font-weight:600;">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  const message = e.message
    ? `<p style="margin:20px 0 6px;color:#6b7280;font-size:14px;">Message</p><div style="background:#F3F5F9;border-radius:10px;padding:14px 16px;color:#1f2937;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(e.message)}</div>`
    : "";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New enquiry</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F3F5F9;padding:20px;margin:0;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;">
    <div style="background:#0B1A37;padding:24px 28px;color:white;">
      <div style="font-size:20px;font-weight:bold;">New Contact page enquiry</div>
      <div style="margin-top:4px;color:#EECC65;font-size:14px;">${escapeHtml(e.enquiry)}</div>
    </div>
    <div style="padding:20px 16px 28px;">
      <table style="border-collapse:collapse;width:100%;">${rowHtml}</table>
      <div style="padding:0 12px;">${message}</div>
    </div>
  </div>
</body>
</html>`;
}

// The automatic reply from the Contact page content brief
function contactAutoReplyHtml(e: ContactEnquiry) {
  // Opens the Contact page with the free-trial form already showing
  const trialUrl = `${siteConfig.url}/contact?trial=1`;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>We've received your message</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#F3F5F9;padding:20px;margin:0;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;">
    <div style="background:#0B1A37;padding:28px;text-align:center;color:white;font-size:22px;font-weight:bold;">Quran West</div>
    <div style="padding:28px;color:#1f2937;font-size:15px;line-height:1.7;">
      <p style="margin:0 0 14px;">Assalamu alaykum ${escapeHtml(e.firstName)},</p>
      <p style="margin:0 0 14px;">Thank you for contacting Quran West. We've received your message about ${escapeHtml(e.enquiry.toLowerCase())} and a member of our team will reply within 24 hours.</p>
      <p style="margin:0 0 14px;">If you'd like to book your free trial straight away, you can do it here: <a href="${trialUrl}" style="color:#9B7930;font-weight:600;">book a free trial</a></p>
      <p style="margin:0;">JazakAllahu khayran,<br>The Quran West team</p>
    </div>
    <div style="background:#F3F5F9;padding:16px;text-align:center;font-size:13px;color:#6b7280;">
      WhatsApp: ${WHATSAPP_DISPLAY} · ${contactInbox}
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
