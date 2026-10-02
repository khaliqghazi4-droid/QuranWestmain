// Creates an ADMIN account with a random password (printed once).
// Usage: npm run create-admin -- <email> ["Full Name"]
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [rawEmail, name = "Academy Admin"] = process.argv.slice(2);
const email = rawEmail?.trim().toLowerCase();

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: npm run create-admin -- <email> ["Full Name"]');
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    console.error(`A user with the email ${email} already exists. Nothing was changed.`);
    process.exitCode = 1;
  } else {
    const password = randomBytes(12).toString("base64url"); // 16 chars
    await prisma.user.create({
      data: { email, name, role: "ADMIN", password: await bcrypt.hash(password, 10) },
    });
    console.log(`Admin created: ${email}`);
    console.log(`Password (shown once, change it after first login): ${password}`);
  }
} finally {
  await prisma.$disconnect();
}
