"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import {
  AUTH_FIELD_ICON,
  AUTH_INPUT,
  AUTH_LABEL,
  AUTH_LINK,
  AuthAlert,
  AuthButton,
  AuthCard,
  AuthHeading,
  AuthStatus,
} from "@/components/auth/auth-ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [debugUrl, setDebugUrl] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed");
      return;
    }

    setSubmitted(true);
    if (data.debug_resetUrl) setDebugUrl(data.debug_resetUrl);
  }

  return (
    <AuthCard>
      {submitted ? (
        <div className="text-center">
          <AuthStatus>
            <CheckCircle2 className="h-[1.9rem] w-[1.9rem]" aria-hidden="true" />
          </AuthStatus>
          <AuthHeading
            center
            title="Check your"
            accent="Email"
            lead={
              <>
                If an account with <span className="font-semibold text-[#0B1A37]">{email}</span> exists,
                we&apos;ve sent password reset instructions.
              </>
            }
          />
          <p className="!mb-0 -mt-[0.75rem] !text-[0.85rem] !text-[#0B1A37]/65">
            The link will expire in 1 hour. Check your spam folder if you don&apos;t see it.
          </p>

          {debugUrl && (
            <div className="mt-[1.25rem] rounded-[12px] border-[1px] border-[#D4AF37]/45 bg-[#FBF8F1] p-[1rem] text-left">
              <p className="!mb-0 !text-[0.72rem] font-bold uppercase tracking-[0.12em] !text-[#7E5F22]">
                ⚠️ Dev Mode (Email service not configured)
              </p>
              <p className="!mb-0 mt-[0.5rem] !text-[0.85rem] !text-[#0B1A37]">Click here to reset:</p>
              <a href={debugUrl} className="mt-[0.4rem] block break-all font-mono text-[0.8rem] !text-[#0B1A37] underline">
                {debugUrl}
              </a>
            </div>
          )}

          <Link href="/login" className={`mt-[1.5rem] inline-flex items-center gap-[0.4rem] text-[0.9rem] ${AUTH_LINK}`}>
            <ArrowLeft className="h-[1rem] w-[1rem]" aria-hidden="true" /> Back to Login
          </Link>
        </div>
      ) : (
        <>
          <AuthHeading
            eyebrow="Account help"
            title="Forgot"
            accent="Password?"
            lead="Enter your email and we will send you a reset link."
          />

          {error && <AuthAlert>{error}</AuthAlert>}

          <form onSubmit={handleSubmit} className="space-y-[clamp(0.7rem,2vh,1.1rem)]">
            <div>
              <label htmlFor="forgot-email" className={AUTH_LABEL}>
                Email
              </label>
              <div className="relative">
                <Mail className={AUTH_FIELD_ICON} aria-hidden="true" />
                <input
                  id="forgot-email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={AUTH_INPUT}
                />
              </div>
            </div>

            <AuthButton loading={loading} loadingText="Sending...">
              Send Reset Link
            </AuthButton>
          </form>

          <div className="mt-[clamp(0.9rem,2.5vh,1.5rem)] border-t-[1px] border-[#0B1A37]/10 pt-[clamp(0.8rem,2.2vh,1.25rem)] text-center">
            <Link href="/login" className={`inline-flex items-center gap-[0.4rem] text-[0.9rem] ${AUTH_LINK}`}>
              <ArrowLeft className="h-[1rem] w-[1rem]" aria-hidden="true" /> Back to Login
            </Link>
          </div>
        </>
      )}
    </AuthCard>
  );
}
