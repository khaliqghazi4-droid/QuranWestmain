"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AlertCircle, Loader2, Trash2, type LucideIcon } from "lucide-react";

// The admin's "are you sure?" pop-up, in place of the browser's confirm():
// a red icon, the question, what will happen, then Cancel beside the red
// button (navy / gold with tone="primary"). It stays open while `busy` (the request running) and shows `error`
// if it failed. Cancel has the focus, so Enter never deletes by accident;
// Escape and a click outside cancel too.
// Rendered into the dashboard shell: inside a glass card, the card's blur
// (backdrop-filter) would trap this fixed overlay. Sizes written out:
// Bootstrap's .text-sm/.text-xs have no line height.
export function ConfirmDialog({
  title,
  children,
  confirmLabel = "Delete",
  icon: Icon = Trash2,
  tone = "danger",
  busy = false,
  error,
  onConfirm,
  onCancel,
}: {
  title: string;
  children: React.ReactNode;
  confirmLabel?: string;
  icon?: LucideIcon;
  // "primary": the brand gradient instead of red, for a step that undoes nothing
  tone?: "danger" | "primary";
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancel = React.useCallback(() => {
    if (!busy) onCancel();
  }, [busy, onCancel]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") cancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cancel]);

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 p-[16px] backdrop-blur-sm animate-fade-in"
      onClick={cancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-text"
        onClick={(e) => e.stopPropagation()}
        // adm-modal: white surfaces and navy edges in the light admin (globals.css)
        className="adm-modal w-full max-w-[420px] rounded-3xl border-[1px] border-border bg-card px-[24px] pb-[24px] pt-[28px] text-center shadow-2xl animate-[adm-pop-in_0.22s_ease-out_backwards]"
      >
        <span
          className={`mx-auto grid h-[64px] w-[64px] place-items-center rounded-full ring-[8px] ${
            tone === "danger"
              ? "bg-destructive/10 text-destructive ring-destructive/[0.05]"
              : "adm-icon bg-gradient-to-br from-primary/15 to-accent/15 text-primary ring-primary/[0.06]"
          }`}
        >
          <Icon className="h-[26px] w-[26px]" />
        </span>
        <h2 id="confirm-title" className="mt-[18px] text-[19px] font-bold leading-[26px]">
          {title}
        </h2>
        <div id="confirm-text" className="mt-[8px] text-[13.5px] leading-[21px] text-muted-foreground">
          {children}
        </div>

        {error && (
          <div className="mt-[16px] flex items-start gap-[8px] rounded-xl border-[1px] border-destructive/30 bg-destructive/10 p-[12px] text-left text-[12.5px] leading-[18px] text-destructive">
            <AlertCircle className="mt-[1px] h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* side by side on phones too */}
        <div className="mt-[24px] grid grid-cols-2 gap-[10px]">
          <button
            type="button"
            autoFocus
            onClick={cancel}
            disabled={busy}
            className="rounded-full border-[1px] border-border bg-background/70 px-[16px] py-[10px] text-[13.5px] font-semibold leading-[18px] transition-colors hover:bg-muted disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex items-center justify-center gap-[8px] whitespace-nowrap rounded-full px-[12px] py-[10px] text-[13.5px] font-semibold leading-[18px] transition-all hover:-translate-y-px disabled:translate-y-0 disabled:opacity-70 sm:px-[16px] ${
              tone === "danger"
                ? "bg-destructive text-destructive-foreground shadow-[0_10px_22px_-10px_hsl(var(--destructive)/0.8)] hover:bg-destructive/90"
                : "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md hover:shadow-lg"
            }`}
          >
            {/* phones: the label alone, so "Delete course" keeps to one line */}
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="hidden h-4 w-4 sm:block" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.querySelector(".admin-dashboard") ?? document.body
  );
}
