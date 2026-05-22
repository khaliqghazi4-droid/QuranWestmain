import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Dummy students simulating enrollments from the external website's "Join Academy" form
const dummyStudents = [
  { name: "Hassan Ahmed", email: "hassan.ahmed@example.com", phone: "+1 312 555 0142", country: "USA", timezone: "America/Chicago", courses: ["Tajweed Mastery"] },
  { name: "Fatima Noor", email: "fatima.noor@example.com", phone: "+44 7700 900123", country: "UK", timezone: "Europe/London", courses: ["Hifz-ul-Quran", "Tafseer & Translation"] },
  { name: "Yusuf Ibrahim", email: "yusuf.ibrahim@example.com", phone: "+1 416 555 0188", country: "Canada", timezone: "America/Toronto", courses: ["Noorani Qaida"] },
  { name: "Maryam Saleh", email: "maryam.saleh@example.com", phone: "+61 412 345 678", country: "Australia", timezone: "Australia/Sydney", courses: ["Nazra Quran"] },
  { name: "Bilal Khan", email: "bilal.khan@example.com", phone: "+92 300 1234567", country: "Pakistan", timezone: "Asia/Karachi", courses: ["Tajweed Mastery", "Arabic Language"] },
  { name: "Aisha Rahman", email: "aisha.rahman@example.com", phone: "+971 50 123 4567", country: "UAE", timezone: "Asia/Dubai", courses: ["Hifz-ul-Quran"] },
  { name: "Omar Farooq", email: "omar.farooq@example.com", phone: "+1 718 555 0199", country: "USA", timezone: "America/New_York", courses: ["Arabic Language"] },
  { name: "Zainab Ali", email: "zainab.ali@example.com", phone: "+44 7911 123456", country: "UK", timezone: "Europe/London", courses: ["Noorani Qaida", "Nazra Quran"] },
];

async function main() {
  // Fetch all courses to map names -> ids
  const courses = await prisma.course.findMany({ select: { id: true, name: true } });
  const courseByName = new Map(courses.map((c) => [c.name, c.id]));

  let created = 0;
  let enrolled = 0;

  for (const s of dummyStudents) {
    // Skip if already exists
    const existing = await prisma.user.findUnique({ where: { email: s.email } });
    if (existing) {
      console.log(`⏭️  Skipped (exists): ${s.email}`);
      continue;
    }

    // Default password for dummy students
    const password = await bcrypt.hash("student123", 10);

    const student = await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        phone: s.phone,
        country: s.country,
        timezone: s.timezone,
        password,
        role: "STUDENT",
      },
    });
    created++;

    // Enroll in their courses
    for (const courseName of s.courses) {
      const courseId = courseByName.get(courseName);
      if (!courseId) {
        console.log(`   ⚠️  Course not found: ${courseName}`);
        continue;
      }
      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          courseId,
          // teacherId left null - admin will assign later
        },
      });
      enrolled++;
    }

    console.log(`✅ ${s.name} (${s.country}) → ${s.courses.join(", ")}`);
  }

  console.log(`\n🎉 Done! Created ${created} students with ${enrolled} enrollments.`);
  console.log("All dummy students use password: student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
