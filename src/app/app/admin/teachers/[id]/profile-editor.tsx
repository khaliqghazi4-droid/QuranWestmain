"use client";

import * as React from "react";
import { createPortal } from "react-dom";
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

// "Edit profile" in the page header, opening the edit form
export function EditProfileButton({ teacher }: { teacher: Teacher }) {
  const [editing, setEditing] = React.useState(false);
  return (
    <>
      <button
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-[6px] rounded-full bg-gradient-to-r from-primary to-accent px-[16px] py-[9px] text-[13px] font-semibold leading-[18px] text-primary-foreground shadow-md transition-shadow hover:shadow-lg"
      >
        <Pencil className="h-4 w-4" /> Edit profile
      </button>
      {editing && <EditProfileModal teacher={teacher} onClose={() => setEditing(false)} />}
    </>
  );
}

// The Documents card: resume, certificates and other files, each with Upload
export function TeacherDocuments({
  teacherId,
  files,
}: {
  teacherId: string;
  files: { resumes: TeacherFile[]; certificates: TeacherFile[]; others: TeacherFile[] };
}) {
  return (
    <section className="adm-glass overflow-hidden rounded-2xl border-[1px] border-border bg-card">
      <div className="flex items-center gap-[8px] px-[20px] py-[16px]">
        <h2 className="text-[16px] font-bold leading-[22px]">Documents</h2>
        <span className="rounded-full bg-primary/10 px-[8px] py-[1px] text-[11px] font-bold leading-[16px] text-primary">
          {files.resumes.length + files.certificates.length + files.others.length}
        </span>
      </div>
      <div className="space-y-[18px] px-[20px] pb-[20px]">
        <FilesSection label="Resume" kind="resume" teacherId={teacherId} files={files.resumes} single />
        <FilesSection label="Certificates" kind="certificate" teacherId={teacherId} files={files.certificates} />
        <FilesSection label="Other documents" kind="other" teacherId={teacherId} files={files.others} />
      </div>
    </section>
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
      <div className="mb-[8px] flex items-center justify-between gap-[8px]">
        {/* a span, not a p: the glass cards turn an uppercase p into an eyebrow */}
        <span className="text-[11px] font-bold uppercase leading-[16px] tracking-[0.08em] text-muted-foreground">
          {label}
        </span>
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
              className="inline-flex items-center gap-[6px] rounded-full border-[1px] border-border bg-background/70 px-[12px] py-[5px] text-[12px] font-semibold leading-[16px] transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Upload
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="mb-[8px] flex items-start gap-[8px] rounded-xl border-[1px] border-destructive/30 bg-destructive/10 p-[10px] text-[12px] leading-[18px] text-destructive">
          <AlertCircle className="mt-[1px] h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {files.length === 0 ? (
        <p className="rounded-xl border-[1px] border-dashed border-border px-[12px] py-[10px] text-[12.5px] leading-[18px] text-muted-foreground">
          Nothing uploaded yet
        </p>
      ) : (
        <div className="space-y-[6px]">
          {files.map((f) => (
            <div
              key={f.id}
              className="adm-tile flex items-center gap-[10px] rounded-xl border-[1px] border-border bg-background p-[10px]"
            >
              <div className="adm-icon grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold leading-[18px]">{f.name}</p>
                <p className="text-[11px] leading-[16px] text-muted-foreground">
                  {f.size ? `${(f.size / 1024).toFixed(0)} KB · ` : ""}
                  {new Date(f.uploadedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              {/* View and delete as one pill group, delete red on hover */}
              <div className="inline-flex shrink-0 items-center gap-[2px] rounded-full border-[1px] border-border bg-background/70 p-[3px] text-muted-foreground">
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-primary/10 hover:text-primary"
                  title="Open"
                  aria-label={`Open ${f.name}`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => remove(f.id)}
                  disabled={deleting === f.id}
                  className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  title="Delete"
                  aria-label={`Delete ${f.name}`}
                >
                  {deleting === f.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </div>
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

  // Rendered into the dashboard shell, not where the button sits: the header
  // card's glass blur (backdrop-filter) would become the containing block of
  // this fixed overlay, squeezing it into the card and clipping it. The shell
  // keeps .admin-brand, so the admin colours still apply.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-[16px] backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        // adm-modal: white fields and navy edges in the light admin (globals.css)
        className="adm-modal flex max-h-[min(90vh,720px)] w-full max-w-[560px] flex-col overflow-hidden rounded-3xl border-[1px] border-border bg-card shadow-2xl"
      >
        <div className="flex items-center gap-[12px] border-b border-border px-[24px] py-[18px]">
          <span className="adm-icon grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
            <Pencil className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-bold leading-[24px]">Edit teacher profile</h2>
            <p className="truncate text-[12.5px] leading-[18px] text-muted-foreground">
              {teacher.name} · {teacher.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* The fields scroll on short screens; header and buttons stay put */}
        <div className="min-h-0 flex-1 space-y-[16px] overflow-y-auto px-[24px] py-[20px]">
          {error && (
            <div className="flex items-start gap-[8px] rounded-xl border-[1px] border-destructive/30 bg-destructive/10 p-[12px] text-[12.5px] leading-[18px] text-destructive">
              <AlertCircle className="mt-[1px] h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <Input label="Full name" value={name} onChange={setName} required />
          <div className="grid gap-[16px] sm:grid-cols-2">
            <Input label="Phone / WhatsApp" value={phone} onChange={setPhone} placeholder="+92 300 0000000" />
            <Input label="Country" value={country} onChange={setCountry} placeholder="Pakistan" />
          </div>
          <Input label="Address" value={address} onChange={setAddress} placeholder="Street, city, postal code" />
          <div>
            <label htmlFor="teacher-bio" className={LABEL}>
              Bio
            </label>
            <textarea
              id="teacher-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Qualifications, experience, specializations..."
              className={`${FIELD} resize-none`}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-[8px] border-t border-border px-[24px] py-[16px]">
          {saved && (
            <span className="mr-auto inline-flex items-center gap-[6px] text-[13px] font-semibold leading-[18px] text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> Saved
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border-[1px] border-border bg-background/70 px-[20px] py-[9px] text-[13.5px] font-semibold leading-[18px] transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-[8px] rounded-full bg-gradient-to-r from-primary to-accent px-[20px] py-[9px] text-[13.5px] font-semibold leading-[18px] text-primary-foreground shadow-md disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
        </div>
      </form>
    </div>,
    document.querySelector(".admin-dashboard") ?? document.body
  );
}

// Sizes written out: the website's Bootstrap sheet overrides .text-sm/.text-xs
const LABEL = "mb-[6px] block text-[12.5px] font-semibold leading-[18px] text-muted-foreground";
const FIELD =
  "w-full rounded-xl border-[1px] border-border bg-background px-[14px] py-[10px] text-[14px] leading-[20px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

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
  const id = React.useId();
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      <input
        id={id}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={FIELD}
      />
    </div>
  );
}
