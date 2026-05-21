import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin
  const adminPw = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@academy.com" },
    update: {},
    create: {
      name: "Academy Admin",
      email: "admin@academy.com",
      password: adminPw,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin:", admin.email);

  // Sample teachers
  const teacherPw = await bcrypt.hash("teacher123", 10);
  const teachers = [
    { email: "qari.abdullah@academy.com", name: "Qari Abdullah Rahman", country: "Pakistan", bio: "Senior Tajweed Instructor with 8+ years of experience. Ijazah in Hafs and Qaloon." },
    { email: "qari.yusuf@academy.com", name: "Qari Yusuf Ismail", country: "Egypt", bio: "Hafiz-e-Quran with specialization in Hifz program. Graduated from Al-Azhar University." },
    { email: "ustadh.hamza@academy.com", name: "Ustadh Hamza Ali", country: "Jordan", bio: "Native Arabic speaker, teacher of Arabic Language and Tafseer." },
  ];

  const teacherRecords = [];
  for (const t of teachers) {
    const teacher = await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: { ...t, password: teacherPw, role: "TEACHER" },
    });
    teacherRecords.push(teacher);
  }
  console.log(`✅ Teachers: ${teacherRecords.length}`);

  // Sample courses
  const courses = [
    {
      name: "Noorani Qaida",
      slug: "noorani-qaida",
      description: "Foundation course for kids and beginners to learn the Arabic alphabet, vowel marks, and basic recitation rules.",
      level: "Beginner",
      duration: "2-3 months",
      price: 25,
      image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?fm=jpg&q=80&w=800&auto=format&fit=crop",
      teacherEmail: "qari.abdullah@academy.com",
    },
    {
      name: "Nazra Quran",
      slug: "nazra-quran",
      description: "Learn to read the Holy Quran fluently with correct pronunciation and basic Tajweed rules.",
      level: "Beginner",
      duration: "4-6 months",
      price: 30,
      image: "https://images.unsplash.com/photo-1763965367087-589990c8f1a3?fm=jpg&q=80&w=800&auto=format&fit=crop",
      teacherEmail: "qari.abdullah@academy.com",
    },
    {
      name: "Tajweed Mastery",
      slug: "tajweed-mastery",
      description: "Perfect your pronunciation and mastery over the rules of Tajweed with audio examples and live correction.",
      level: "Intermediate",
      duration: "6-8 months",
      price: 40,
      image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?fm=jpg&q=80&w=800&auto=format&fit=crop",
      teacherEmail: "qari.abdullah@academy.com",
    },
    {
      name: "Hifz-ul-Quran",
      slug: "hifz-ul-quran",
      description: "Structured memorization program with daily Sabaq, Sabqi, and Manzil review under expert Hafiz teachers.",
      level: "Advanced",
      duration: "3-5 years",
      price: 60,
      image: "https://images.unsplash.com/photo-1763965367087-589990c8f1a3?fm=jpg&q=80&w=800&auto=format&fit=crop",
      teacherEmail: "qari.yusuf@academy.com",
    },
    {
      name: "Tafseer & Translation",
      slug: "tafseer-translation",
      description: "Deep understanding of the Quran with verse-by-verse Tafseer and translation in English/Urdu.",
      level: "Advanced",
      duration: "1 year",
      price: 45,
      image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?fm=jpg&q=80&w=800&auto=format&fit=crop",
      teacherEmail: "ustadh.hamza@academy.com",
    },
    {
      name: "Arabic Language",
      slug: "arabic-language",
      description: "Learn Arabic from basics to advanced conversation. Grammar, vocabulary, and practical speaking.",
      level: "All Levels",
      duration: "6 months",
      price: 35,
      image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?fm=jpg&q=80&w=800&auto=format&fit=crop",
      teacherEmail: "ustadh.hamza@academy.com",
    },
  ];

  for (const c of courses) {
    const { teacherEmail, ...data } = c;
    const teacher = teacherRecords.find((t) => t.email === teacherEmail);
    await prisma.course.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...data, teacherId: teacher?.id },
    });
  }
  console.log(`✅ Courses: ${courses.length}`);

  console.log("\n🎉 Seed complete!");
  console.log("Login: admin@academy.com / admin123");
  console.log("Teachers (all use password 'teacher123'):");
  teachers.forEach((t) => console.log(`  - ${t.email}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
