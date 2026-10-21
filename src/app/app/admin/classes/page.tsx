import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { AlertCircle } from "lucide-react";
import { authOptions, isAdminSession } from "@/lib/auth";
import { ClassStudents } from "./class-students";
import { loadUpcomingClasses } from "./load-classes";
import { ClassesHeader, ClassesShell, WEEKS_AHEAD } from "./shell";

// Times are relative to "now", so this page is never cached
export const dynamic = "force-dynamic";

// One card per student with upcoming classes, A–Z; a card opens that
// student's schedule (classes/[student]). The old every-class list is still
// ClassesBoard in classes-board.tsx.
export default function AdminClassesPage() {
  return (
    <div className="space-y-6">
      <ClassesHeader />
      <Suspense fallback={<ClassesShell />}>
        <ClassesData />
      </Suspense>
    </div>
  );
}

async function ClassesData() {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Admin access required
      </div>
    );
  }

  const now = Date.now();
  try {
    const classes = await loadUpcomingClasses(now);
    return <ClassStudents classes={classes} generatedAt={now} weeksAhead={WEEKS_AHEAD} />;
  } catch (e) {
    console.error("[admin/classes] load failed", e);
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Couldn&apos;t load classes</p>
          <p className="mt-0.5 text-xs opacity-80">Refresh the page in a moment.</p>
        </div>
      </div>
    );
  }
}
