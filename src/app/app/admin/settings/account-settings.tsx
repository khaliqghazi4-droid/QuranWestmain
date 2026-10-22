"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { AvatarInitial } from "@/components/avatar";
import { IconBadge } from "@/components/dashboard/icon-badge";
import { AdminModal, MODAL_FIELD, MODAL_LABEL, ModalError, ModalSubmit } from "@/components/admin/modal-frame";
import { PhotoCropper } from "@/components/profile/photo-cropper";
import {
  type ProfileUser,
  roleLabel,
  useProfileEditor,
  usePasswordChange,
} from "@/components/profile/profile-editor";

// The admin's own account on the Settings page, laid out tight: the profile
// card (photo, name, contact details, bio) beside Security & account, with
// editing and the password in pop-ups. The teacher and student profiles keep
// ProfileEditor's layout; both share its state and saving (useProfileEditor).
// Sizes written out: Bootstrap's .text-sm/.text-xs have no line height.
export function AccountSettings({ user: initialUser }: { user: ProfileUser }) {
  const p = useProfileEditor(initialUser);
  const { user } = p;
  const [pwOpen, setPwOpen] = React.useState(false);

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const created = new Date(user.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const details = [
    { icon: Mail, label: "Email", value: user.email },
    { icon: Phone, label: "Phone", value: user.phone },
    { icon: MapPin, label: "Country", value: user.country },
    { icon: Clock, label: "Timezone", value: user.timezone },
  ];

  return (
    <>
      <div className="grid gap-[20px] lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="adm-glass flex flex-col overflow-hidden rounded-2xl border-[1px] border-border bg-card">
          <div className="flex flex-wrap items-center gap-[16px] px-[20px] py-[20px] sm:px-[24px]">
            <div className="relative shrink-0">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- Blob URL, any size
                <img
                  src={user.image}
                  alt={user.name}
                  width={80}
                  height={80}
                  className="h-[80px] w-[80px] rounded-2xl object-cover shadow-[0_12px_26px_-14px_rgb(0_0_0/0.5)]"
                />
              ) : (
                <AvatarInitial name={user.name} size={80} className="rounded-2xl" />
              )}
              <button
                type="button"
                onClick={() => p.fileRef.current?.click()}
                disabled={p.photoBusy}
                aria-label={user.image ? "Change photo" : "Add a photo"}
                title={user.image ? "Change photo" : "Add a photo"}
                className="absolute -bottom-[6px] -right-[6px] grid h-[30px] w-[30px] place-items-center rounded-full border-[2px] border-card bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md transition-transform hover:scale-105 disabled:opacity-60"
              >
                {p.photoBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* min-w: on phones the button wraps under the name rather than
                squeezing it into a narrow column */}
            {/* h3: every h2 in a glass card gets the card-title bar */}
            <div className="min-w-[180px] flex-1">
              <h3 className="break-words text-[22px] font-bold leading-[28px]">{user.name}</h3>
              <div className="mt-[8px] flex flex-wrap items-center gap-[6px]">
                <Tag icon={ShieldCheck}>{roleLabel(user.role)}</Tag>
                <Tag icon={CalendarDays}>Member since {memberSince}</Tag>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-[10px]">
              {p.saved && (
                <span className="inline-flex items-center gap-[6px] text-[13px] font-semibold leading-[18px] text-emerald-600 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4" /> Profile updated
                </span>
              )}
              <button
                type="button"
                onClick={() => p.setEditing(true)}
                className="inline-flex items-center gap-[6px] rounded-full bg-gradient-to-r from-primary to-accent px-[16px] py-[9px] text-[13px] font-semibold leading-[18px] text-primary-foreground shadow-md transition-shadow hover:shadow-lg"
              >
                <Pencil className="h-4 w-4" /> Edit profile
              </button>
            </div>
          </div>

          {p.photoError && (
            <p className="mx-[20px] mb-[14px] flex items-center gap-[6px] text-[12.5px] leading-[18px] text-destructive sm:mx-[24px]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {p.photoError}
            </p>
          )}

          {/* Contact details, two to a row */}
          <div className="adm-rows grid border-t border-border sm:grid-cols-2">
            {details.map((d, i) => (
              <div
                key={d.label}
                className={`flex min-w-0 items-center gap-[12px] border-border px-[20px] py-[14px] sm:px-[24px] ${
                  i > 0 ? "border-t" : ""
                } ${i === 1 ? "sm:border-t-0" : ""} ${i % 2 === 1 ? "sm:border-l" : ""}`}
              >
                <span className="adm-icon grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                  <d.icon className="h-[17px] w-[17px]" />
                </span>
                {/* labels are spans: .adm-glass p.uppercase draws an eyebrow dash */}
                <div className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase leading-[16px] tracking-[0.06em] text-muted-foreground">
                    {d.label}
                  </span>
                  <p className="truncate pr-[2px] text-[14px] font-semibold leading-[20px]" title={d.value ?? undefined}>
                    {d.value?.trim() || <span className="font-normal italic text-muted-foreground">Not set</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto border-t border-border px-[20px] py-[14px] sm:px-[24px]">
            <span className="block text-[11px] font-semibold uppercase leading-[16px] tracking-[0.06em] text-muted-foreground">
              Bio
            </span>
            <p className="mt-[4px] whitespace-pre-line text-[13.5px] leading-[21px]">
              {user.bio?.trim() || <span className="italic text-muted-foreground">No bio yet</span>}
            </p>
          </div>
        </section>

        {/* flex-1 list: the card is stretched to the profile card's height */}
        <section className="adm-glass flex flex-col overflow-hidden rounded-2xl border-[1px] border-border bg-card">
          <div className="px-[20px] py-[16px]">
            <h2 className="text-[16px] font-bold leading-[22px]">Security &amp; account</h2>
          </div>
          <ul className="adm-rows flex-1 divide-y divide-border border-t border-border">
            <AccountRow icon={Lock} label="Password" sub="••••••••">
              <RowButton onClick={() => setPwOpen(true)}>Change</RowButton>
            </AccountRow>
            <AccountRow
              icon={ImageIcon}
              label="Profile photo"
              sub={user.image ? "Shown in the header" : "Initials until you add one"}
            >
              {user.image && (
                <button
                  type="button"
                  onClick={() => p.changePhoto(null)}
                  disabled={p.photoBusy}
                  aria-label="Remove photo"
                  title="Remove photo"
                  className="grid h-[28px] w-[28px] place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
                >
                  <Trash2 className="h-[15px] w-[15px]" />
                </button>
              )}
              <RowButton onClick={() => p.fileRef.current?.click()} disabled={p.photoBusy}>
                {user.image ? "Change" : "Add"}
              </RowButton>
            </AccountRow>
            <AccountRow icon={ShieldCheck} label="Account type" sub={`${roleLabel(user.role)} · full access`} />
            <AccountRow icon={CalendarDays} label="Account created" sub={created} />
          </ul>
        </section>
      </div>

      <input
        ref={p.fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => p.pickPhoto(e.target.files?.[0])}
      />

      {p.cropFile &&
        portal(
          <PhotoCropper
            file={p.cropFile}
            onCancel={p.closeCropper}
            onSave={(photo) => {
              p.closeCropper();
              p.changePhoto(photo);
            }}
          />
        )}
      {p.editing && <EditProfileModal editor={p} />}
      {pwOpen && <PasswordModal onClose={() => setPwOpen(false)} />}
    </>
  );
}

// The photo cropper goes into the dashboard shell, not inside the cards: a
// glass card's blur (backdrop-filter) would become the containing block of
// its fixed overlay and clip it (AdminModal does the same for the pop-ups).
// The shell keeps .admin-brand, so the admin colours apply.
function portal(node: React.ReactNode) {
  return createPortal(node, document.querySelector(".admin-dashboard") ?? document.body);
}

// A small rounded tag under the name, its icon in the gradient badge
function Tag({ icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-[6px] rounded-full bg-primary/10 py-[3px] pl-[3px] pr-[10px] text-[12px] font-semibold leading-[18px] text-primary">
      <IconBadge icon={icon} size={18} />
      {children}
    </span>
  );
}

function AccountRow({
  icon: Icon,
  label,
  sub,
  children,
}: {
  icon: LucideIcon;
  label: string;
  sub: string;
  children?: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-[12px] px-[20px] py-[12px]">
      <span className="adm-icon grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
        <Icon className="h-[17px] w-[17px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold leading-[19px]">{label}</p>
        <p className="truncate text-[12px] leading-[17px] text-muted-foreground">{sub}</p>
      </div>
      {children && <div className="flex shrink-0 items-center gap-[10px]">{children}</div>}
    </li>
  );
}

function RowButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border-[1px] border-border bg-background/70 px-[12px] py-[5px] text-[12.5px] font-semibold leading-[16px] transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function EditProfileModal({ editor: p }: { editor: ReturnType<typeof useProfileEditor> }) {
  return (
    <AdminModal
      icon={Pencil}
      title="Edit profile"
      sub={`${p.user.email} · the email can't be changed`}
      onClose={p.cancel}
      onSubmit={p.handleSave}
      footer={
        <ModalSubmit busy={p.saving} icon={Save}>
          Save changes
        </ModalSubmit>
      }
    >
      {p.error && <ModalError>{p.error}</ModalError>}
      <Input label="Full name" value={p.name} onChange={p.setName} required />
      <div className="grid gap-[16px] sm:grid-cols-2">
        <Input label="Phone" type="tel" value={p.phone} onChange={p.setPhone} placeholder="+92 300 0000000" />
        <Input label="Country" value={p.country} onChange={p.setCountry} placeholder="Pakistan" />
      </div>
      <Input label="Timezone" value={p.timezone} onChange={p.setTimezone} placeholder="PKT (UTC+5)" />
      <div>
        <label htmlFor="settings-bio" className={MODAL_LABEL}>
          Bio
        </label>
        <textarea
          id="settings-bio"
          value={p.bio}
          onChange={(e) => p.setBio(e.target.value)}
          rows={3}
          placeholder="A line or two about yourself"
          className={`${MODAL_FIELD} resize-none`}
        />
      </div>
    </AdminModal>
  );
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const f = usePasswordChange(onClose);
  return (
    <AdminModal
      icon={Lock}
      title="Change password"
      sub="At least 8 characters"
      onClose={onClose}
      onSubmit={f.handleSubmit}
      footer={
        !f.success && (
          <ModalSubmit busy={f.loading} icon={Lock}>
            Update password
          </ModalSubmit>
        )
      }
    >
      {f.success ? (
        <div className="py-[16px] text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <p className="mt-[14px] text-[14px] font-bold leading-[20px]">Password changed</p>
        </div>
      ) : (
        <>
          {f.error && <ModalError>{f.error}</ModalError>}
          <Input
            label="Current password"
            type={f.showPw ? "text" : "password"}
            value={f.current}
            onChange={f.setCurrent}
            required
          />
          <div className="grid gap-[16px] sm:grid-cols-2">
            <Input
              label="New password"
              type={f.showPw ? "text" : "password"}
              value={f.pw}
              onChange={f.setPw}
              minLength={8}
              required
            />
            <Input
              label="Confirm new password"
              type={f.showPw ? "text" : "password"}
              value={f.confirm}
              onChange={f.setConfirm}
              minLength={8}
              required
            />
          </div>
          <label className="mb-[0px] inline-flex cursor-pointer items-center gap-[8px] text-[13px] leading-[18px] text-muted-foreground">
            <input
              type="checkbox"
              checked={f.showPw}
              onChange={(e) => f.setShowPw(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
            />
            {f.showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            Show passwords
          </label>
        </>
      )}
    </AdminModal>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  const id = React.useId();
  return (
    <div>
      <label htmlFor={id} className={MODAL_LABEL}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={MODAL_FIELD}
      />
    </div>
  );
}
