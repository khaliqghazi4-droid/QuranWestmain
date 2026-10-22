"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AlertCircle, Loader2, X, type LucideIcon } from "lucide-react";

// The admin pop-up form's parts (as on the teacher profile's Edit pop-up):
// an icon square and title, the fields, then Cancel beside the main button.
// Sizes written out: the website's Bootstrap sheet overrides .text-sm/.text-xs
// and .p-*/.px-* spacing.
export const MODAL_LABEL = "mb-[6px] block text-[12.5px] font-semibold leading-[18px] text-muted-foreground";
export const MODAL_FIELD =
  "w-full rounded-xl border-[1px] border-border bg-background px-[14px] py-[10px] text-[14px] leading-[20px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

// Rendered into the dashboard shell: inside a glass card, the card's blur
// (backdrop-filter) would become the containing block of the fixed overlay
// and clip it. The shell keeps .admin-brand, so the admin colours apply.
export function AdminModal({
  icon: Icon,
  title,
  sub,
  onClose,
  onSubmit,
  footer,
  cancel,
  closeOnBackdrop = true,
  maxWidth = "max-w-[520px]",
  children,
}: {
  icon: LucideIcon;
  title: string;
  sub: React.ReactNode;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  // the main button(s), after Cancel
  footer: React.ReactNode;
  // in place of Cancel (e.g. Discard changes, once the form is edited)
  cancel?: React.ReactNode;
  // off for long forms, where a stray click would lose what was typed
  closeOnBackdrop?: boolean;
  maxWidth?: string;
  children: React.ReactNode;
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-[16px] backdrop-blur-sm animate-fade-in"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <form
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
        // adm-modal: white fields and navy edges in the light admin (globals.css)
        className={`adm-modal flex max-h-[min(90vh,760px)] w-full flex-col overflow-hidden rounded-3xl border-[1px] border-border bg-card shadow-2xl ${maxWidth}`}
      >
        <div className="flex items-center gap-[12px] border-b border-border px-[24px] py-[18px]">
          <span className="adm-icon grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-bold leading-[24px]">{title}</h2>
            <p className="text-[12.5px] leading-[18px] text-muted-foreground">{sub}</p>
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
        <div className="min-h-0 flex-1 space-y-[16px] overflow-y-auto px-[24px] py-[20px]">{children}</div>

        <div className="flex items-center justify-end gap-[8px] border-t border-border px-[24px] py-[16px]">
          {cancel ?? (
            <ModalSecondary onClick={onClose}>Cancel</ModalSecondary>
          )}
          {footer}
        </div>
      </form>
    </div>,
    document.querySelector(".admin-dashboard") ?? document.body
  );
}

// Footer buttons: on phones the pair shares the row evenly, one line each,
// labels without their icons (a spinner still shows while busy). Both 38px
// tall: the outlined one is 9px + its 1px edge, the filled one 10px.
const FOOTER_BUTTON =
  "inline-flex items-center justify-center gap-[8px] whitespace-nowrap rounded-full px-[14px] text-[13.5px] font-semibold leading-[18px] max-sm:flex-1 sm:px-[20px]";

// The outlined footer button: Cancel, or what a form puts in its place
export function ModalSecondary({
  onClick,
  icon: Icon,
  children,
}: {
  onClick: () => void;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${FOOTER_BUTTON} border-[1px] border-border bg-background/70 py-[9px] transition-colors hover:bg-muted`}
    >
      {Icon && <Icon className="hidden h-4 w-4 sm:block" />}
      {children}
    </button>
  );
}

export function ModalError({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-[8px] rounded-xl border-[1px] border-destructive/30 bg-destructive/10 p-[12px] text-[12.5px] leading-[18px] text-destructive">
      <AlertCircle className="mt-[1px] h-4 w-4 shrink-0" /> {children}
    </div>
  );
}

export function ModalSubmit({
  busy,
  icon: Icon,
  children,
}: {
  busy: boolean;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={busy}
      className={`${FOOTER_BUTTON} bg-gradient-to-r from-primary to-accent py-[10px] text-primary-foreground shadow-md disabled:opacity-60`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon && <Icon className="hidden h-4 w-4 sm:block" />}
      {children}
    </button>
  );
}
