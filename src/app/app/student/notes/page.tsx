import { getStudentViewer } from "@/lib/auth";
import { studentSharedNotes } from "@/lib/note-shares";
import { PageHeader } from "@/components/dashboard/page-header";
import { SharedNotesList } from "./shared-notes-list";

export const dynamic = "force-dynamic";

export default async function StudentNotesPage() {
  const viewer = await getStudentViewer();
  if (!viewer) return null;

  const notes = await studentSharedNotes(viewer.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Notes" description="Notes your teachers have shared with you" />
      <SharedNotesList notes={notes} />
    </div>
  );
}
