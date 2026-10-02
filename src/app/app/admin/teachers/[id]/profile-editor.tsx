"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Save,
  Loader2,
  Upload,
  FileText,
  ExternalLink,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

type Teacher = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  address: string | null;
  bio: string | null;
};

type TeacherFile = {
  id: string;
  kind: string;
  name: string;
  url: string;
  mimeType: string | null;
  size: number | null;
  uploadedAt: string;
};

export function TeacherProfileEditor({
  teacher,
  files,
}: {
  teacher: Teacher;
  files: { resumes: TeacherFile[]; certificates: TeacherFile[]; others: TeacherFile[] };
}) {
  const [editing, setEditing] = React.useState(false);
  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-bold">Profile & Documents</h2>
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit profile
          </button>
        </div>

        <ProfileGrid teacher={teacher} />

        <div className="pt-4 border-t border-border space-y-5">
          <FilesSection
            label="Resume"
            kind="resume"
            teacherId={teacher.id}
            files={files.resumes}
            single
          />
          <FilesSection
            label="Certificates"
            kind="certificate"
            teacherId={teacher.id}
            files={files.certificates}
          />
          <FilesSection
            label="Other documents"
            kind="other"
            teacherId={teacher.id}
            files={files.others}
          />
        </div>
      </div>

      {editing && (
        <EditProfileModal
          teacher={teacher}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}

function ProfileGrid({ teacher }: { teacher: Teacher }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3 text-sm">
      <Field label="Phone / WhatsApp" value={teacher.phone} />
      <Field label="Email" value={teacher.email} />
      <Field label="Country" value={teacher.country} />
      <Field label="Address" value={teacher.address} className="sm:col-span-2" />
      <Field label="Bio" value={teacher.bio} className="sm:col-span-2" />
    </div>
  );
}

function Field({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | null;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border bg-background p-3 ${className}`}>
      <p className="text-[10px] uppercase font-semibold text-muted-foreground">{label}</p>
      <p className="text-sm mt-1 break-words">
        {value && value.trim() ? value : <span className="text-muted-foreground italic">Not set</span>}
      </p>
    </div>
  );
}

function FilesSection({
  label,
  kind,
  teacherId,
  files,
  single = false,
}: {
  label: string;
  kind: "resume" | "certificate" | "other";
  teacherId: string;
  files: TeacherFile[];
  single?: boolean;
}) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleFile(file: File, name: string) {
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    fd.append("name", name);
    const res = await fetch(`/api/admin/teachers/${teacherId}/files`, {
      method: "POST",
      body: fd,
    });
    setUploading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Upload failed");
      return;
    }
    router.refresh();
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    handleFile(file, baseName);
  }

  async function remove(id: string) {
    if (!confirm("Delete this file? This cannot be undone.")) return;
    setError(null);
    setDeleting(id);
    const res = await fetch(`/api/admin/teachers/${teacherId}/files/${id}`, {
      method: "DELETE",
    });
    setDeleting(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Delete failed");
      return;
    }
    router.refresh();
  }

  const canAddMore = !single || files.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          {label} ({files.length})
        </p>
        {canAddMore && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,image/*"
              onChange={onPick}
              className="hidden"
            />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-md disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              Upload PDF
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive mb-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {files.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No files uploaded yet.</p>
      ) : (
        <div className="space-y-1.5">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-2 rounded-xl border border-border bg-background p-2.5"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{f.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {f.size ? `${(f.size / 1024).toFixed(0)} KB · ` : ""}
                  {new Date(f.uploadedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold hover:bg-muted"
              >
                <ExternalLink className="h-3 w-3" /> View
              </a>
              <button
                onClick={() => remove(f.id)}
                disabled={deleting === f.id}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                title="Delete"
              >
                {deleting === f.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditProfileModal({
  teacher,
  onClose,
}: {
  teacher: Teacher;
  onClose: () => void;
}) {
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

  const router = useRouter();
  const [name, setName] = React.useState(teacher.name);
  const [phone, setPhone] = React.useState(teacher.phone ?? "");
  const [country, setCountry] = React.useState(teacher.country ?? "");
  const [address, setAddress] = React.useState(teacher.address ?? "");
  const [bio, setBio] = React.useState(teacher.bio ?? "");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch(`/api/users/${teacher.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone: phone || null,
        country: country || null,
        address: address || null,
        bio: bio || null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Save failed");
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(onClose, 800);
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-foreground/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="flex min-h-full items-start sm:items-center justify-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl my-auto"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card">
            <h2 className="text-base font-bold">Edit Teacher Profile</h2>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={submit} className="p-5 space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
              </div>
            )}
            {saved && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> Saved
              </div>
            )}

            <Input label="Full Name *" value={name} onChange={setName} required />
            <Input
              label="Phone / WhatsApp"
              value={phone}
              onChange={setPhone}
              placeholder="+92 300 0000000"
            />
            <Input
              label="Country"
              value={country}
              onChange={setCountry}
              placeholder="Pakistan"
            />
            <Input
              label="Address"
              value={address}
              onChange={setAddress}
              placeholder="Street, city, postal code"
            />
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Qualifications, experience, specializations..."
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{label}</label>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
