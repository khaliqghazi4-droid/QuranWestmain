import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { getTeacherProfile } from "../_caches";

export const revalidate = 30;

// Teaching hours / availability are controlled by the academy admin from
// the teacher's admin profile — so the teacher's own profile only shows
// editable personal info (name, contact, bio, etc.), no availability grid.
export default async function TeacherProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const user = await getTeacherProfile(session.user.id);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your personal teaching profile"
      />
      <ProfileEditor user={user} />
    </div>
  );
}
