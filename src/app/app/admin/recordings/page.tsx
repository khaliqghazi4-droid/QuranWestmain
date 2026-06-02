import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { RecordingsList, type RecordingItem } from "./recordings-list";

export const dynamic = "force-dynamic";

// Admin's library of every class recording uploaded by any teacher.
// Newest first; click a row to watch in-page, or open in a new tab to download.
export default async function AdminRecordingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/app");

  const recs = await prisma.classRecording.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { teacher: { select: { id: true, name: true } } },
  });

  const items: RecordingItem[] = recs.map((r) => ({
    id: r.id,
    teacherName: r.teacher.name,
    studentName: r.studentName,
    courseName: r.courseName,
    url: r.url,
    mimeType: r.mimeType,
    durationSec: r.durationSec,
    sizeBytes: r.sizeBytes,
    startedAt: r.startedAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Recordings"
        description={
          items.length === 0
            ? "Recordings uploaded by teachers will appear here automatically"
            : `${items.length} recorded ${items.length === 1 ? "lecture" : "lectures"} — newest first`
        }
      />
      <RecordingsList items={items} />
    </div>
  );
}
