import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, CalendarDays, Mail } from "lucide-react";
import { ReportAction, ReportCard, StudentReport } from "@/components/admin/student-report";
import { loadStudentReport } from "@/lib/student-report";
import { PrintButton } from "./print-button";
import { StudentRecordings, type StudentRecordingItem } from "./student-recordings";

export const dynamic = "force-dynamic";

// One student's page, opened from the Students list: their report (shared
// with the Reports page's pop-up) and their class recordings. "Print / Save
// as PDF" prints the report alone (globals.css, .adm-report).
export default async function StudentReportPage({
  params,
}: {
  params: { id: string };
}) {
  const report = await loadStudentReport(params.id);
  if (!report) notFound();

  // Class recordings of this student's booked classes (room id `booking-<slot id>`)
  const recordings = report.bookings.length
    ? await prisma.classRecording.findMany({
        where: { roomId: { in: report.bookings.map((b) => `booking-${b.id}`) } },
        orderBy: { createdAt: "desc" },
        include: { teacher: { select: { name: true } } },
      })
    : [];
  const recordingItems: StudentRecordingItem[] = recordings.map((r) => ({
    id: r.id,
    teacherName: r.teacher?.name ?? null,
    courseName: r.courseName,
    url: r.url,
    durationSec: r.durationSec,
    sizeBytes: r.sizeBytes,
    startedAt: r.startedAt.toISOString(),
    shared: !!r.sharedWithStudentAt,
  }));

  return (
    // adm-night: the black-and-gold dark mode (globals.css), page by page
    <div className="adm-night space-y-[20px]">
      <div className="flex items-center justify-between gap-[12px] print:hidden">
        <Link
          href="/app/admin/students"
          // a glass pill: it sits straight on the background video
          className="adm-glass inline-flex items-center gap-[8px] rounded-full border-[1px] border-border bg-card px-[14px] py-[7px] text-[13px] font-semibold leading-[18px] transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Students
        </Link>
        <PrintButton />
      </div>

      <StudentReport
        data={report}
        actions={
          <>
            <ReportAction href={`mailto:${report.student.email}`} icon={Mail}>
              Email
            </ReportAction>
            <ReportAction href={`/app/admin/classes/${report.student.id}`} icon={CalendarDays} primary>
              Schedule
            </ReportAction>
          </>
        }
      >
        {/* Recordings are admin-only until shared, so they stay off the printout */}
        <ReportCard
          title="Class recordings"
          count={recordingItems.length}
          className="print:hidden"
          action={
            <span className="hidden text-[12px] leading-[16px] text-muted-foreground sm:inline">
              The student sees only the ones you share
            </span>
          }
        >
          <div className="px-[20px] pb-[20px]">
            <StudentRecordings items={recordingItems} />
          </div>
        </ReportCard>
      </StudentReport>
    </div>
  );
}
