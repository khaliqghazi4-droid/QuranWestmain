"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Loader2,
  Lock,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
} from "lucide-react";
import { Avatar } from "@/components/avatar";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  timezone: string | null;
  bio: string | null;
  role: string;
  createdAt: string;
};

export function ProfileEditor({ user: initialUser }: { user: User }) {
  const router = useRouter();
  const [user, setUser] = React.useState(initialUser);
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState(user.name);
  const [phone, setPhone] = React.useState(user.phone ?? "");
  const [country, setCountry] = React.useState(user.country ?? "");
  const [timezone, setTimezone] = React.useState(user.timezone ?? "");
  const [bio, setBio] = React.useState(user.bio ?? "");
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pwOpen, setPwOpen] = React.useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, country, timezone, bio }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Save failed");
      return;
    }
    const data = await res.json();
    setUser({ ...user, ...data.user });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    router.refresh();
  }

  function cancel() {
    setName(user.name);
    setPhone(user.phone ?? "");
    setCountry(user.country ?? "");
    setTimezone(user.timezone ?? "");
    setBio(user.bio ?? "");
    setEditing(false);
    setError(null);
  }

  return (
    <div className="space-y-6">
      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 animate-fade-in">
          <CheckCircle2 className="h-4 w-4" /> Profile updated successfully!
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-primary via-accent to-primary relative">
          <div className="absolute -bottom-12 left-6 sm:left-8">
            <Avatar
              name={user.name}
              size={96}
              style={user.role === "TEACHER" ? "micah" : "avataaars"}
              className="rounded-2xl border-4 border-card shadow-xl"
            />
          </div>
        </div>

        <div className="pt-16 pb-6 px-6 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold inline-flex items-center gap-2">
                {user.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {user.role === "TEACHER" ? "Teacher" : "Student"} · Member since{" "}
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md"
              >
                <Edit2 className="h-4 w-4" /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h3 className="text-base font-bold mb-5 inline-flex items-center gap-2">
            <UserIcon className="h-4 w-4" /> Personal Information
          </h3>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" icon={UserIcon}>
                {editing ? (
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                ) : (
                  <ReadField value={user.name} />
                )}
              </Field>

              <Field label="Email (cannot change)" icon={Mail}>
                <ReadField value={user.email} muted />
              </Field>

              <Field label="Phone" icon={Phone}>
                {editing ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 890"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                ) : (
                  <ReadField value={user.phone ?? "—"} />
                )}
              </Field>

              <Field label="Country" icon={MapPin}>
                {editing ? (
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Pakistan"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                ) : (
                  <ReadField value={user.country ?? "—"} />
                )}
              </Field>

              <Field label="Timezone" icon={Calendar}>
                {editing ? (
                  <input
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="e.g. PKT (UTC+5)"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                ) : (
                  <ReadField value={user.timezone ?? "—"} />
                )}
              </Field>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Bio
              </p>
              {editing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              ) : (
                <p className="text-sm leading-relaxed text-foreground">
                  {user.bio ?? <span className="text-muted-foreground italic">No bio yet</span>}
                </p>
              )}
            </div>

            {editing && (
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={cancel}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-muted"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-2 text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Security</h3>
                <p className="text-[11px] text-muted-foreground">Manage your account security</p>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setPwOpen(true)}
                className="w-full inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-left hover:bg-muted transition-colors"
              >
                <Lock className="h-3.5 w-3.5" /> Change Password
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-6">
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Account Type</p>
            <p className="mt-1 text-base font-bold">
              {user.role === "TEACHER" ? "Teacher" : "Student"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Account created on{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {pwOpen && <PasswordModal onClose={() => setPwOpen(false)} />}
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 inline-flex items-center gap-1">
        <Icon className="h-3 w-3" /> {label}
      </p>
      {children}
    </div>
  );
}

function ReadField({ value, muted }: { value: string; muted?: boolean }) {
  return (
    <p className={`text-sm font-medium py-2 ${muted ? "text-muted-foreground" : ""}`}>{value}</p>
  );
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (pw !== confirm) {
      setError("New passwords don't match");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/users/me/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: pw }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed");
      return;
    }

    setSuccess(true);
    setTimeout(onClose, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold inline-flex items-center gap-2">
            <Lock className="h-5 w-5" /> Change Password
          </h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success ? (
            <div className="text-center py-6">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <p className="mt-4 text-sm font-bold">Password changed successfully!</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Current Password *
                </label>
                <input
                  required
                  type={showPw ? "text" : "password"}
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  New Password * (min 8 chars)
                </label>
                <input
                  required
                  minLength={8}
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Confirm New Password *
                </label>
                <input
                  required
                  minLength={8}
                  type={showPw ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPw}
                  onChange={(e) => setShowPw(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                />
                {showPw ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                Show passwords
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-muted">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-2 text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update Password
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
