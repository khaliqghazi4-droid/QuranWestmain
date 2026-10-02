import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Free-trial students get a real login that works until TRIAL_ACCESS_DAYS after their trial
// class. The expiry lives in User.accessExpiresAt and is enforced at sign-in, in the session
// callback and in middleware (see auth.ts / middleware.ts).
export const TRIAL_ACCESS_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

export function trialAccessEnd(trialTime: Date): Date {
  return new Date(trialTime.getTime() + TRIAL_ACCESS_DAYS * DAY_MS);
}

function newPassword() {
  return randomBytes(9).toString("base64url"); // 12 chars
}

// Give the applicant a trial login (or move its expiry when the trial is rescheduled).
// Real accounts — full students, teachers, admins — are never touched.
export async function ensureTrialAccount(req: {
  email: string;
  fullName: string;
  whatsapp: string;
  country: string;
  trialTime: Date;
}): Promise<void> {
  const email = req.email.trim().toLowerCase();
  const accessExpiresAt = trialAccessEnd(req.trialTime);
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, password: true, accessExpiresAt: true },
  });

  if (!user) {
    const password = newPassword();
    await prisma.user.create({
      data: {
        email,
        name: req.fullName || email,
        phone: req.whatsapp || null,
        country: req.country || null,
        role: "STUDENT",
        password: await bcrypt.hash(password, 10),
        loginPassword: password,
        accessExpiresAt,
      },
    });
    return;
  }
  if (user.role !== "STUDENT") return;

  if (user.password === "") {
    const password = newPassword();
    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(password, 10), loginPassword: password, accessExpiresAt },
    });
  } else if (user.accessExpiresAt) {
    await prisma.user.update({ where: { id: user.id }, data: { accessExpiresAt } });
  }
}

// Only trial logins (accessExpiresAt set) are affected; full accounts keep their access.
export async function lockTrialAccount(email: string): Promise<void> {
  await prisma.user.updateMany({
    where: { email: email.trim().toLowerCase(), role: "STUDENT", NOT: { accessExpiresAt: null } },
    data: { accessExpiresAt: new Date() },
  });
}

export async function allowTrialAccount(email: string): Promise<number> {
  const { count } = await prisma.user.updateMany({
    where: { email: email.trim().toLowerCase(), role: "STUDENT", NOT: { accessExpiresAt: null } },
    data: { accessExpiresAt: new Date(Date.now() + TRIAL_ACCESS_DAYS * DAY_MS) },
  });
  return count;
}
