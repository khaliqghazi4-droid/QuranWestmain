"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Lock, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
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

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [valid, setValid] = React.useState<boolean | null>(null);
  const [email, setEmail] = React.useState<string | null>(null);
  const [pw, setPw] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(`/api/auth/reset-password?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        setValid(!!data.valid);
        if (data.email) setEmail(data.email);
      })
      .catch(() => setValid(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (pw !== confirm) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: pw }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2500);
  }

  if (valid === null) {
    return (
      <AuthCard className="text-center">
        <Loader2 className="mx-auto h-[2rem] w-[2rem] animate-spin text-[#9B7930]" aria-hidden="true" />
        <p className="!mb-0 mt-[1rem] !text-[0.92rem] !text-[#0B1A37]/70">Validating reset link...</p>
      </AuthCard>
    );
  }

  if (!valid) {
    return (
      <AuthCard className="text-center">
        <AuthStatus tone="bad">
          <AlertCircle className="h-[1.9rem] w-[1.9rem]" aria-hidden="true" />
        </AuthStatus>
        <AuthHeading
          center
          title="Invalid or"
          accent="Expired Link"
          lead="This password reset link is no longer valid. It may have expired or already been used."
        />
        <Link
          href="/forgot-password"
          className="group flex h-[clamp(2.9rem,7vh,3.25rem)] w-full items-center justify-between rounded-full bg-[#0B1A37] pl-[1.5rem] pr-[0.4rem] text-[0.95rem] font-semibold !text-white !no-underline transition-[box-shadow,background-color] duration-300 hover:bg-[#13254A] hover:shadow-[0_12px_26px_-12px_rgba(11,26,55,0.75)]"
        >
          Request New Link
          <span className="grid aspect-square h-[calc(100%-0.8rem)] place-items-center rounded-full bg-[#EECC65] text-[#0B1A37] transition-transform duration-300 group-hover:-rotate-45">
            <ArrowRight className="h-[1rem] w-[1rem]" aria-hidden="true" />
          </span>
        </Link>
        <Link href="/login" className={`mt-[1.25rem] inline-flex text-[0.9rem] ${AUTH_LINK}`}>
          Back to Login
        </Link>
      </AuthCard>
    );
  }

  if (success) {
    return (
      <AuthCard className="text-center">
        <AuthStatus>
          <CheckCircle2 className="h-[1.9rem] w-[1.9rem]" aria-hidden="true" />
        </AuthStatus>
        <AuthHeading
          center
          title="Password"
          accent="Reset!"
          lead="Your password has been successfully reset. Redirecting to login..."
        />
        <Loader2 className="mx-auto -mt-[0.5rem] h-[1.25rem] w-[1.25rem] animate-spin text-[#9B7930]" aria-hidden="true" />
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthHeading
        eyebrow="Account help"
        title="Set New"
        accent="Password"
        lead={
          email ? (
            <>
              For <span className="font-semibold text-[#0B1A37]">{email}</span>
            </>
          ) : null
        }
      />

      {error && <AuthAlert>{error}</AuthAlert>}

      <form onSubmit={handleSubmit} className="space-y-[clamp(0.7rem,2vh,1.1rem)]">
        <div>
          <label htmlFor="reset-password" className={AUTH_LABEL}>
            New Password * (min 8 characters)
          </label>
          <div className="relative">
            <Lock className={AUTH_FIELD_ICON} aria-hidden="true" />
            <input
              id="reset-password"
              type={showPw ? "text" : "password"}
              required
              minLength={8}
              autoFocus
              autoComplete="new-password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Enter new password"
              className={`${AUTH_INPUT} !pr-[3rem]`}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-[0.5rem] top-1/2 grid h-[2.25rem] w-[2.25rem] -translate-y-1/2 place-items-center rounded-full !p-0 text-[#0B1A37]/55 transition-colors hover:bg-[#0B1A37]/5 hover:text-[#0B1A37]"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="h-[1.05rem] w-[1.05rem]" /> : <Eye className="h-[1.05rem] w-[1.05rem]" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="reset-confirm" className={AUTH_LABEL}>
            Confirm Password *
          </label>
          <div className="relative">
            <Lock className={AUTH_FIELD_ICON} aria-hidden="true" />
            <input
              id="reset-confirm"
              type={showPw ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className={AUTH_INPUT}
            />
          </div>
        </div>

        <AuthButton loading={loading} loadingText="Resetting...">
          Reset Password
        </AuthButton>
      </form>
    </AuthCard>
  );
}
