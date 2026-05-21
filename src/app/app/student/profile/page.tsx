import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileEditor } from "@/components/profile/profile-editor";
import Link from "next/link";
import { Calendar, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentProfile() {
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

      {/* Hint: availability is set per-course */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold">Set Your Class Availability</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Availability is set <span className="font-semibold text-foreground">per course</span> —
              so you can have different times for Tajweed vs Hifz vs Arabic.
              Go to <span className="font-semibold text-foreground">My Courses</span>
              and click <span className="font-semibold text-primary">&quot;Set My Times&quot;</span>
              on each course.
            </p>
            <Link
              href="/app/student/courses"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-xs font-bold text-primary-foreground shadow-md hover:shadow-lg transition-all"
            >
              <BookOpen className="h-3.5 w-3.5" /> Go to My Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
