"use client";

import * as React from "react";
import { X, KeyRound, AlertCircle, MessageCircle, Mail, Copy, Loader2, RefreshCw } from "lucide-react";

export type LoginTarget = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  password: string | null;
};

// The dashboard scrolls <main>, so lock it along with the page while a modal is open
export function useLockPageScroll() {
  React.useLayoutEffect(() => {
    const main = document.querySelector("main") as HTMLElement | null;
    const html = document.documentElement;
    if (main) main.style.overflow = "hidden";
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      if (main) main.style.overflow = "";
      html.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);
}

// Admin view of a student's or teacher's login: show, share, or generate a new password
export function LoginCredentialsModal({
  target,
  onClose,
  onUpdated,
}: {
  target: LoginTarget;
  onClose: () => void;
  onUpdated: (newPassword: string) => void;
}) {
  const [copied, setCopied] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useLockPageScroll();

  const password = target.password;

  const loginUrl =
    typeof window !== "undefined" ? `${window.location.origin}/login` : "/login";

  const message =
    `Assalamu Alaikum ${target.name},\n\n` +
    `Your Online Quran Academy account is ready. Login details:\n\n` +
    `Login page: ${loginUrl}\n` +
    `Email: ${target.email}\n` +
    `Password: ${password ?? ""}\n\n` +
    `Please change your password after your first login. JazakAllah Khair.`;

  function copyAll() {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function generate() {
    if (
      password &&
      !confirm(
        `Generate a NEW password for ${target.name}? Their current password will stop working.`
      )
    )
      return;
    setError(null);
    setGenerating(true);
    const res = await fetch(`/api/users/${target.id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setGenerating(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to generate password");
      return;
    }
    const data = await res.json();
    onUpdated(data.newPassword);
  }

  const waDigits = (target.phone ?? "").replace(/[^\d]/g, "");
  const waHref = `https://wa.me/${waDigits}?text=${encodeURIComponent(message)}`;
  const mailHref = `mailto:${target.email}?subject=${encodeURIComponent(
    "Your Online Quran Academy Login"
  )}&body=${encodeURIComponent(message)}`;

  return (
    // !m-0: callers render this inside space-y-* containers, whose child margin would offset the overlay
    <div className="fixed inset-0 z-50 !m-0 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 px-5 py-4 text-white rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/15 backdrop-blur-md hover:bg-white/25"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-white/20 backdrop-blur-md">
              <KeyRound className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold">Login Credentials</h2>
          </div>
          <p className="text-xs text-white/80">
            Share with <span className="font-semibold">{target.name}</span>
          </p>
        </div>

        <div className="p-4 space-y-2.5">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <div className="rounded-xl border border-border bg-background p-3">
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Email</p>
            <p className="text-sm font-mono mt-1 break-all">{target.email}</p>
          </div>

          {password ? (
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Password</p>
              <p className="text-sm font-mono mt-1 font-bold tracking-wider">{password}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-[hsl(var(--gold))]/30 bg-[hsl(var(--gold)/0.08)] p-3 text-xs text-foreground">
              No saved password for this account (it was never issued here, or the user changed it
              themselves). Click <span className="font-semibold">Generate password</span> below to
              create one you can share.
            </div>
          )}

          {password && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {waDigits && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-bold text-white shadow-md"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
              )}
              <a
                href={mailHref}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold hover:bg-muted"
              >
                <Mail className="h-3 w-3" /> Email
              </a>
              <button
                onClick={copyAll}
                className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold hover:bg-muted ${
                  waDigits ? "col-span-2" : ""
                }`}
              >
                <Copy className="h-3 w-3" /> {copied ? "Copied!" : "Copy message"}
              </button>
            </div>
          )}

          <button
            onClick={generate}
            disabled={generating}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-60"
          >
            {generating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {password ? "Generate new password" : "Generate password"}
          </button>

          <button
            onClick={onClose}
            className="w-full rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
