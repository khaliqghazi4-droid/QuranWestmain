"use client";

import * as React from "react";
import Link from "next/link";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from "lucide-react";

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
    <div className="w-full max-w-md animate-fade-in">
      <div className="glass-card rounded-3xl p-8 shadow-2xl">
        {submitted ? (
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight">
              Check your <span className="text-gradient-primary">Email</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              If an account with <span className="font-semibold text-foreground">{email}</span>{" "}
              exists, we&apos;ve sent password reset instructions.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              The link will expire in 1 hour. Check your spam folder if you don&apos;t see it.
            </p>

            {debugUrl && (
              <div className="mt-5 rounded-xl border border-[hsl(var(--gold))]/30 bg-[hsl(var(--gold)/0.08)] p-4 text-left">
                <p className="text-[11px] font-bold text-[hsl(var(--gold))] uppercase">
                  ⚠️ Dev Mode (Email service not configured)
                </p>
                <p className="text-xs text-foreground mt-2">
                  Click here to reset:
                </p>
                <a
                  href={debugUrl}
                  className="mt-2 block text-xs font-mono text-primary break-all hover:underline"
                >
                  {debugUrl}
                </a>
              </div>
            )}

            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-7">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary mb-3">
                <KeyRound className="h-7 w-7" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Forgot <span className="text-gradient-primary">Password?</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email and we&apos;ll send you a reset link
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
