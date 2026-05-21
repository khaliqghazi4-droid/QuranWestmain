import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. For each course with a primary teacher, add a CourseTeacher record
  const courses = await prisma.course.findMany({
    where: { teacherId: { not: null } },
    include: { courseTeachers: true },
  });

  let courseTeachersAdded = 0;
  for (const c of courses) {
    if (!c.teacherId) continue;
    const exists = c.courseTeachers.some((ct) => ct.teacherId === c.teacherId);
    if (!exists) {
      await prisma.courseTeacher.create({
        data: { courseId: c.id, teacherId: c.teacherId },
      });
      courseTeachersAdded++;
    }
  }
  console.log(`✅ CourseTeacher records added: ${courseTeachersAdded}`);

  // 2. For each enrollment with no teacherId, set to the course's primary teacher
  const enrollments = await prisma.enrollment.findMany({
    where: { teacherId: null },
    include: { course: { select: { teacherId: true } } },
  });

  let enrollmentsUpdated = 0;
  for (const e of enrollments) {
    if (e.course.teacherId) {
      await prisma.enrollment.update({
        where: { id: e.id },
        data: { teacherId: e.course.teacherId },
      });
      enrollmentsUpdated++;
    }
  }
  console.log(`✅ Enrollments updated with teacherId: ${enrollmentsUpdated}`);

  console.log("\n🎉 Backfill complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
