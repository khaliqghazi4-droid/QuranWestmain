import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const TOKEN_TTL_MINUTES = 60;

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalized } });

    // ALWAYS return same response — don't leak whether email exists
    const genericResponse = NextResponse.json({
      message:
        "If an account with that email exists, we've sent password reset instructions.",
    });

    if (!user) return genericResponse;

    // Don't allow reset for parent-managed children (auto-generated emails)
    if (normalized.endsWith("@child.local")) return genericResponse;

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

    // Invalidate any older unused tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: normalized, usedAt: null },
    });

    await prisma.passwordResetToken.create({
      data: { token, email: normalized, expiresAt },
    });

    const baseUrl =
      process.env.NEXTAUTH_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    const resetUrl = `${baseUrl}/reset-password/${token}`;

    const result = await sendPasswordResetEmail({
      to: normalized,
      name: user.name,
      resetUrl,
    });

    // In dev / when email not configured, include the link in response so admin can share it
    if (!result.sent && process.env.NODE_ENV !== "production") {
      return NextResponse.json({
        message: "Reset link generated (email service not configured).",
        debug_resetUrl: resetUrl,
      });
    }

    return genericResponse;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
