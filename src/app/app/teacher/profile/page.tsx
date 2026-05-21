import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { AvailabilityEditor } from "@/components/availability/availability-editor";

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
      availability: {
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      },
    },
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your teaching profile and availability"
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
      <AvailabilityEditor
        teacherId={user.id}
        initialTimezone={user.timezone ?? "UTC"}
        initialSlots={user.availability.map((a) => ({
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
        }))}
      />
    </div>
  );
}
