import { Suspense } from "react";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { Wallet, UserCheck, Receipt, Tag, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ACTIVE_STUDENT } from "@/lib/auth";
import { StatTiles, type StatTile } from "@/components/admin/stat-tiles";
import { PaymentsHeader, PaymentsShell } from "./shell";
import { FeesTable, type FeeRow } from "./fees-table";
import { money } from "./money";

// The academy doesn't record payments yet, so this page shows what is due:
// each active enrollment of an active student, at its course's monthly fee.
// The old page's transactions, revenue and refunds were made-up sample data.
const getCachedPaymentsData = unstable_cache(
  async () => {
    const [enrollments, courses] = await Promise.all([
      prisma.enrollment.findMany({
        where: { status: "active", student: ACTIVE_STUDENT },
        select: {
          startedAt: true,
          course: { select: { id: true, name: true, price: true } },
          student: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { startedAt: "asc" },
      }),
      prisma.course.findMany({
        where: { isActive: true },
        select: { id: true, name: true, price: true },
      }),
    ]);
    return { enrollments, courses };
  },
  ["admin-payments"],
  // short: enrollments change from several pages that don't refresh this one
  { revalidate: 60 }
);

// Rendered per request, not at build time (the build has no database)
export const dynamic = "force-dynamic";

export default function AdminPayments() {
  return (
    <div className="space-y-6">
      <PaymentsHeader />
      <Suspense fallback={<PaymentsShell />}>
        <PaymentsData />
      </Suspense>
    </div>
  );
}

async function PaymentsData() {
  const { enrollments, courses } = await getCachedPaymentsData();

  // One row per student, their courses inside (oldest enrollment first).
  // Dates come back from the cache as strings, hence new Date(…).
  const byStudent = new Map<string, FeeRow>();
  for (const e of enrollments) {
    const startedAt = new Date(e.startedAt).toISOString();
    const row = byStudent.get(e.student.id) ?? {
      ...e.student,
      since: startedAt,
      courses: [],
      total: 0,
    };
    row.courses.push({ id: e.course.id, name: e.course.name, fee: e.course.price, startedAt });
    row.total += e.course.price;
    byStudent.set(e.student.id, row);
  }
  const rows = Array.from(byStudent.values()).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

  const monthly = rows.reduce((sum, r) => sum + r.total, 0);
  const paying = rows.filter((r) => r.total > 0).length;
  const unpriced = enrollments.filter((e) => e.course.price <= 0).length;

  // Every active course, plus any inactive one that still has students
  const perCourse = new Map(courses.map((c) => [c.id, { ...c, students: 0 }]));
  for (const e of enrollments) {
    const c = perCourse.get(e.course.id) ?? { ...e.course, students: 0 };
    c.students++;
    perCourse.set(e.course.id, c);
  }
  const courseRows = Array.from(perCourse.values())
    .map((c) => ({ ...c, total: c.students * c.price }))
    .sort((a, b) => b.total - a.total || b.students - a.students || a.name.localeCompare(b.name));

  const stats: StatTile[] = [
    { icon: Wallet, label: "Monthly fees due", value: `$${money(monthly)}` },
    { icon: UserCheck, label: "Paying students", value: String(paying) },
    { icon: Receipt, label: "Average per student", value: paying ? `$${money(Math.round(monthly / paying))}` : "—" },
    { icon: Tag, label: "Enrollments with no fee", value: String(unpriced) },
  ];

  return (
    <>
      <StatTiles stats={stats} />

      {/* Side by side when there is room for both (sidebar open or not), stacked otherwise */}
      <div className="flex flex-wrap items-start gap-[16px]">
        <FeesTable rows={rows} />

        <div className="adm-glass min-w-0 flex-[1_1_280px] rounded-2xl border-[1px] border-border bg-card">
          <div className="border-b border-border px-[20px] py-[14px]">
            <h2 className="text-[15px] font-bold leading-[20px]">Fees by course</h2>
            <p className="text-[11.5px] leading-[16px] text-muted-foreground">Each course&apos;s share of the monthly total</p>
          </div>
          {courseRows.length === 0 ? (
            <p className="px-[20px] py-[28px] text-center text-[12.5px] leading-[18px] text-muted-foreground">No courses yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {courseRows.map((c) => {
                const share = monthly > 0 ? Math.round((c.total / monthly) * 100) : 0;
                return (
                  <li key={c.id} className="px-[20px] py-[14px]">
                    <div className="flex items-start justify-between gap-[12px]">
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-semibold leading-[19px]">{c.name.trim()}</p>
                        <p className="text-[11.5px] leading-[16px] text-muted-foreground">
                          {c.students} {c.students === 1 ? "student" : "students"} ·{" "}
                          {c.price > 0 ? `$${money(c.price)} each` : "no fee set"}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[15px] font-bold leading-[20px] tabular-nums">${money(c.total)}</p>
                        <p className="text-[11px] leading-[15px] tabular-nums text-muted-foreground">{share}%</p>
                      </div>
                    </div>
                    <div className="adm-track mt-[8px] h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    {c.price <= 0 && (
                      <Link
                        href="/app/admin/courses"
                        className="mt-[8px] inline-flex items-center gap-[4px] text-[11.5px] font-bold leading-[16px] text-primary hover:underline"
                      >
                        Set a fee <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
