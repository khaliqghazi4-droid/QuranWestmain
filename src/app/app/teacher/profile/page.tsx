import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileEditor } from "@/components/profile/profile-editor";

export const dynamic = "force-dynamic";

export default async function TeacherProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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
        description="Manage your teaching profile and credentials"
      />
      <ProfileEditor
        user={{
          ...user,
          createdAt: user.createdAt.toISOString(),
        }}
      />
    </div>
  );
}
