// Tiny helper for client-side CSV download (no extra dependency).

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  // Always quote and double up internal quotes — safe for commas, newlines, etc.
  return `"${s.replace(/"/g, '""')}"`;
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): void {
  if (typeof window === "undefined") return;
  const body = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  // BOM so Excel detects UTF-8 properly
  const csv = "﻿" + headers.map(csvEscape).join(",") + "\n" + body;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function safeFilename(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 64) || "export";
}
