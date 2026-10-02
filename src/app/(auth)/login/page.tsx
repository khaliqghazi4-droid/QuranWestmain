"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, getSession } from "next-auth/react";
import { WHATSAPP_NUMBER } from "@/components/WhatsappButton";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  BookOpen,
  Ban,
  MessageCircle,
} from "lucide-react";

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginForm />
    </React.Suspense>
  );
}

const TRIAL_ENDED =
  "Your free trial access has ended. Please contact the academy to continue.";

function roleHome(role?: string) {
  switch ((role ?? "").toUpperCase()) {
    case "ADMIN":
      return "/app/admin";
    case "TEACHER":
      return "/app/teacher";
    case "STUDENT":
      return "/app/student";
    default:
      return "/app/student";
  }
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  // Only same-site paths; "//host", "/\host" and absolute URLs would send the user off-site
  const rawCallback = params.get("callbackUrl");
  const callbackUrl =
    rawCallback && /^\/(?![/\\])/.test(rawCallback) ? rawCallback : undefined;

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(
    params.get("expired") ? TRIAL_ENDED : null
  );
  const [suspendedNotice, setSuspendedNotice] = React.useState(!!params.get("suspended"));

  // Sent here because the account was suspended mid-session: drop that session
  React.useEffect(() => {
    if (params.get("suspended")) signOut({ redirect: false });
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!res || res.error) {
      setLoading(false);
      if (res?.error === "ACCOUNT_SUSPENDED") {
        setSuspendedNotice(true);
        return;
      }
      setError(res?.error === "TRIAL_EXPIRED" ? TRIAL_ENDED : "Invalid email or password");
      return;
    }

    // Detect the actual role from the session and redirect accordingly
    const session = await getSession();
    const target = callbackUrl ?? roleHome(session?.user?.role);
    router.push(target);
    router.refresh();
  }

  return (
    <>
    <div className="w-full max-w-md animate-fade-in">
      <div className="glass-card rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-7">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
            <BookOpen className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Online Quran <span className="text-gradient-primary">Academy</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>{error}</p>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-muted-foreground">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs font-medium text-primary hover:text-accent">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showPw ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-card pl-10 pr-11 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Toggle password visibility"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
            />
            Remember me for 30 days
          </label>

          <button
            type="submit"
            disabled={loading}
            className="group w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Accounts are created by the academy. Contact the admin if you need access.
        </div>
      </div>
    </div>

      {/* Outside the fade-in wrapper: its transform would anchor this fixed popup while animating */}
      {suspendedNotice && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="suspended-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-2xl">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
              <Ban className="h-7 w-7" />
            </div>
            <h2 id="suspended-title" className="mt-4 text-lg font-bold">
              Account suspended
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Quran West admin has suspended your account. Please contact the academy if you think
              this is a mistake.
            </p>
            <div className="mt-5 grid gap-2">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <MessageCircle className="h-4 w-4" /> Contact the academy
              </a>
              <button
                type="button"
                onClick={() => setSuspendedNotice(false)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
