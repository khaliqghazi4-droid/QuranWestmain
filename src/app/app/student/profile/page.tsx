import { getStudentViewer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileEditor } from "@/components/profile/profile-editor";

export const revalidate = 30;

export default async function StudentProfile() {
  const viewer = await getStudentViewer();
  if (!viewer) return null;

  const user = await prisma.user.findUnique({
    where: { id: viewer.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      country: true,
      timezone: true,
      bio: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your personal information"
      />
      <ProfileEditor
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          country: user.country,
          timezone: user.timezone,
          bio: user.bio,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
        }}
      />
    </div>
  );
}
