import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  // Suspended while signed in: the login page signs them out and shows the notice
  const session = await getServerSession(authOptions);
  if (session?.suspended) redirect("/login?suspended=1");

  return <DashboardShell role="student">{children}</DashboardShell>;
}
