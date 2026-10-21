﻿import { Suspense } from "react";
import { StudentsHeader, StudentsShell } from "./shell";
import { StudentsTable } from "./students-table";
import { getCachedStudentsData } from "../_caches";

export const revalidate = 600;

export default function AdminStudentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="space-y-6">
      <StudentsHeader />
      <Suspense fallback={<StudentsShell />}>
        <StudentsData searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function StudentsData({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

  const { students, courseRows } = await getCachedStudentsData();

  const allCourses = courseRows.map((c) => {
    const map = new Map<string, { id: string; name: string; gender: "MALE" | "FEMALE" | null }>();
    if (c.teacher) {
      map.set(c.teacher.id, {
        id: c.teacher.id,
        name: c.teacher.name,
        gender: (c.teacher.gender as "MALE" | "FEMALE" | null) ?? null,
      });
    }
    for (const ct of c.courseTeachers) {
      map.set(ct.teacher.id, {
        id: ct.teacher.id,
        name: ct.teacher.name,
        gender: (ct.teacher.gender as "MALE" | "FEMALE" | null) ?? null,
      });
    }
    return { id: c.id, name: c.name, teachers: Array.from(map.values()) };
  });

  const addCourseName = str(searchParams.addCourse);
  const matchedCourse = addCourseName
    ? allCourses.find(
        (c) => c.name.trim().toLowerCase() === addCourseName.trim().toLowerCase()
      ) ?? null
    : null;

  const prefill =
    str(searchParams.addName) ||
    str(searchParams.addEmail) ||
    str(searchParams.addPhone) ||
    addCourseName
      ? {
          name: str(searchParams.addName) ?? "",
          email: str(searchParams.addEmail) ?? "",
          phone: str(searchParams.addPhone) ?? "",
          country: str(searchParams.addCountry) ?? "",
          courseId: matchedCourse?.id ?? "",
          courseName: addCourseName ?? "",
          requestId: str(searchParams.addRequest) ?? "",
        }
      : null;

  const displayStudents = students.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    country: s.country,
    loginPassword: s.loginPassword,
    suspended: !!s.suspendedAt,
    createdAt: new Date(s.createdAt).toISOString(),
    courses: s.studentEnrollments.map((e) => ({
      id: e.course.id,
      name: e.course.name,
      duration: e.course.duration,
      teacherId: e.teacher?.id ?? null,
      teacherName: e.teacher?.name ?? null,
    })),
  }));

  return (
    <StudentsTable initialStudents={displayStudents} allCourses={allCourses} prefill={prefill} />
  );
}
