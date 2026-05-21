import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { BookOpen, Clock, PlayCircle, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentCourses() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session.user.id },
    include: {
      course: {
        include: { teacher: { select: { id: true, name: true } } },
      },
    },
    orderBy: { startedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses"
        description={
          enrollments.length === 0
            ? "Browse the catalog and enroll in your first course"
            : `${enrollments.length} enrolled · Continue learning`
        }
        action={
          <Link
            href="/app/student/catalog"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md"
          >
            <Filter className="h-4 w-4" /> Browse Catalog
          </Link>
        }
      />

      {enrollments.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold">No courses yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore our course catalog and enroll to start learning
          </p>
          <Link
            href="/app/student/catalog"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:shadow-lg"
          >
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrollments.map((e, i) => {
            const c = e.course;
            const tag = e.progress >= 80 ? "Almost Done" : e.progress > 0 ? "In Progress" : "Just Started";
            const tagColor = e.progress >= 80 ? "bg-[hsl(var(--gold))] text-[hsl(220_32%_10%)]" : "bg-primary text-primary-foreground";
            return (
              <div
                key={e.id}
                className="group overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all stagger-item"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {c.image && (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-card/20 to-transparent" />
                    <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] font-bold ${tagColor}`}>
                      {tag}
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-base font-bold tracking-tight group-hover:text-primary transition-colors">
                    {c.name}
                  </h3>
                  {c.teacher && (
                    <p className="text-xs text-muted-foreground mt-1">by {c.teacher.name}</p>
                  )}

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <span className="text-muted-foreground">{c.level}</span>
                      <span className="font-bold">{e.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                        style={{ width: `${e.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {c.duration ?? "Self-paced"}
                    </span>
                    <Link
                      href={`/app/student/courses/${c.id}`}
                      className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-accent"
                    >
                      <PlayCircle className="h-4 w-4" /> Continue
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
