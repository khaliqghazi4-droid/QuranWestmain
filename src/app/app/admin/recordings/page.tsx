import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RECORDINGS_TAG } from "@/lib/recordings";
import { PageHeader } from "@/components/dashboard/page-header";
import { RecordingsList, type RecordingItem } from "./recordings-list";
import { AlertCircle } from "lucide-react";

const getCachedRecordings = unstable_cache(
  () => prisma.classRecording.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { teacher: { select: { id: true, name: true } } },
  }),
  ["admin-recordings"],
  { revalidate: 600, tags: [RECORDINGS_TAG] }
);

export const revalidate = 600;

export default function AdminRecordingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Class Recordings" description="Recorded lectures library" />
      <Suspense fallback={<RecordingsShell />}>
        <RecordingsData />
      </Suspense>
    </div>
  );
}

async function RecordingsData() {
  const session = await getServerSession(authOptions);
  const isAdmin = isAdminSession(session);
  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground text-center">
        Admin access required
      </div>
    );
  }

  let items: RecordingItem[] = [];
  let fetchError: string | null = null;

  try {
    const recs = await getCachedRecordings();
    items = recs.map((r) => ({
      id: r.id,
      teacherName: r.teacher.name,
      studentName: r.studentName,
      courseName: r.courseName,
      url: r.url,
      mimeType: r.mimeType,
      durationSec: r.durationSec,
      sizeBytes: r.sizeBytes,
      startedAt: new Date(r.startedAt).toISOString(),
      createdAt: new Date(r.createdAt).toISOString(),
      canShare: r.roomId.startsWith("booking-"),
      shared: !!r.sharedWithStudentAt,
    }));
  } catch (e) {
    fetchError = e instanceof Error ? e.message : "Could not load recordings";
  }

  if (fetchError) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm">
        <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-destructive" />
        <div>
          <p className="font-semibold text-destructive">Could not load recordings</p>
          <p className="text-muted-foreground mt-1 text-xs">{fetchError}</p>
        </div>
      </div>
    );
  }

  return <RecordingsList items={items} />;
}

function RecordingsShell() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="h-36 bg-muted/20 border-b border-border flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border border-border bg-muted/30" />
          </div>
          <div className="p-3 space-y-1">
            <div className="text-xs font-medium text-muted-foreground/40">—</div>
            <div className="text-[10px] text-muted-foreground/30">—</div>
            <div className="text-[10px] text-muted-foreground/30">—</div>
          </div>
        </div>
      ))}
    </div>
  );
}
