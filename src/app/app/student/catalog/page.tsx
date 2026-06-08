import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { CatalogClient } from "./catalog-client";

export const revalidate = 30;

export default async function CatalogPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const [courses, enrollments, me] = await Promise.all([
    prisma.course.findMany({
      where: { isActive: true },
      include: {
        teacher: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.enrollment.findMany({
      where: { studentId: session.user.id },
      select: { courseId: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true, country: true },
    }),
  ]);

  const enrolledIds = new Set(enrollments.map((e) => e.courseId));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Catalog"
        description={`Browse ${courses.length} available courses and enroll`}
      />
      <CatalogClient
        courses={courses}
        enrolledIds={Array.from(enrolledIds)}
        prefill={{
          fullName: me?.name ?? "",
          email: me?.email ?? "",
          whatsapp: me?.phone ?? "",
          country: me?.country ?? "",
        }}
      />
    </div>
  );
}
