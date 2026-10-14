"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut, getSession } from "next-auth/react";
import { WHATSAPP_NUMBER } from "@/components/WhatsappButton";
import { Mail, Lock, Eye, EyeOff, Ban, MessageCircle } from "lucide-react";
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
      <AuthCard>
        <AuthHeading
          eyebrow="Welcome back"
          title="Sign in to"
          accent="Quran West"
          // the error takes this line's place, so the page still fits one screen
          lead={error ? null : "Your classes, schedule and progress are waiting."}
        />

        {error && <AuthAlert>{error}</AuthAlert>}

        <form onSubmit={handleSubmit} className="space-y-[clamp(0.7rem,2vh,1.1rem)]">
          <div>
            <label htmlFor="login-email" className={AUTH_LABEL}>
              Email
            </label>
            <div className="relative">
              <Mail className={AUTH_FIELD_ICON} aria-hidden="true" />
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={AUTH_INPUT}
              />
            </div>
          </div>

          <div>
            <div className="mb-[0.4rem] flex items-center justify-between">
              <label htmlFor="login-password" className={`${AUTH_LABEL} !mb-0`}>
                Password
              </label>
              <Link href="/forgot-password" className={`text-[0.82rem] ${AUTH_LINK}`}>
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className={AUTH_FIELD_ICON} aria-hidden="true" />
              <input
                id="login-password"
                type={showPw ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          <label className="flex cursor-pointer items-center gap-[0.55rem] text-[0.85rem] text-[#0B1A37]/75">
            <input type="checkbox" className="h-[1rem] w-[1rem] cursor-pointer accent-[#0B1A37]" />
            Remember me for 30 days
          </label>

          <AuthButton loading={loading} loadingText="Signing in...">
            Sign In
          </AuthButton>
        </form>

        <p className="!mb-0 mt-[clamp(0.9rem,2.5vh,1.5rem)] border-t-[1px] border-[#0B1A37]/10 pt-[clamp(0.8rem,2.2vh,1.25rem)] text-center !text-[0.85rem] !leading-[1.6] !text-[#0B1A37]/65 [text-wrap:balance]">
          Need an account?{" "}
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className={AUTH_LINK}>
            Message us on WhatsApp
          </a>
        </p>
      </AuthCard>

      {/* Outside the card: its fade-in transform would anchor this fixed popup while animating */}
      {suspendedNotice && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="suspended-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1A37]/60 p-[1rem] backdrop-blur-sm"
        >
          <div className="w-full max-w-[24rem] rounded-[1.25rem] border-[1px] border-[#D4AF37]/40 bg-white p-[1.75rem] text-center shadow-[0_30px_60px_-24px_rgba(11,26,55,0.55)]">
            <AuthStatus tone="bad">
              <Ban className="h-[1.75rem] w-[1.75rem]" aria-hidden="true" />
            </AuthStatus>
            <h2 id="suspended-title" className="!mb-0 !text-[1.35rem] !font-extrabold !tracking-[-0.02em] text-[#0B1A37]">
              Account suspended
            </h2>
            <p className="!mb-0 mt-[0.6rem] !text-[0.92rem] !leading-[1.6] !text-[#0B1A37]/70">
              Quran West admin has suspended your account. Please contact the academy if you think
              this is a mistake.
            </p>
            <div className="mt-[1.4rem] grid gap-[0.6rem]">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-[0.5rem] rounded-full bg-[#25D366] px-[1rem] py-[0.75rem] text-[0.9rem] font-semibold !text-white !no-underline"
              >
                <MessageCircle className="h-[1rem] w-[1rem]" aria-hidden="true" /> Contact the academy
              </a>
              <button
                type="button"
                onClick={() => setSuspendedNotice(false)}
                className="!rounded-full border-[1px] border-[#0B1A37]/15 px-[1rem] py-[0.75rem] text-[0.9rem] font-semibold text-[#0B1A37] transition-colors hover:border-[#0B1A37]"
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
