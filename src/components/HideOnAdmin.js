"use client";

import { usePathname } from "next/navigation";

// Shows its children everywhere except the admin dashboard (/app/admin…).
// Used for the floating WhatsApp button, which is for visitors, students and
// teachers: the admin didn't want it over their dashboard.
export default function HideOnAdmin({ children }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/app/admin")) return null;
  return children;
}
