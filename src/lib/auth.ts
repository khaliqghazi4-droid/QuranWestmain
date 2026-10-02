import { redirect } from "next/navigation";
import { getServerSession, type NextAuthOptions, type Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Prisma, Role } from "@prisma/client";

// Students the admin has added. Website enroll submissions create passwordless
// STUDENT leads, and free-trial logins carry an accessExpiresAt; both stay hidden
// until the admin adds them as a student.
export const ACTIVE_STUDENT = {
  role: "STUDENT",
  NOT: { password: "" },
  accessExpiresAt: null,
} satisfies Prisma.UserWhereInput;

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        // The login page shows a dedicated popup for each of these
        if (user.suspendedAt) throw new Error("ACCOUNT_SUSPENDED");
        // Free-trial login past its end date
        if (user.accessExpiresAt && user.accessExpiresAt.getTime() <= Date.now()) {
          throw new Error("TRIAL_EXPIRED");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image ?? undefined,
          accessExpiresAt: user.accessExpiresAt,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
        token.accessExpiresAt = user.accessExpiresAt ? user.accessExpiresAt.getTime() : null;
      }
      return token;
    },
    async session({ session, token }) {
      // Trial access ended: no user, so every `session?.user` check treats them as signed out
      if (typeof token.accessExpiresAt === "number" && Date.now() >= token.accessExpiresAt) {
        return { expires: session.expires } as typeof session;
      }
      // Suspended after signing in: same, plus a flag the student layout turns into the popup
      if (token.role === "STUDENT" && token.id && (await isUserSuspended(token.id))) {
        return { expires: session.expires, suspended: true } as typeof session;
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
};

// Suspension happens after sign-in, so the JWT can't carry it. Look it up per user, at most
// once every 30 s per server instance; suspend/reactivate clear the entry right away.
const SUSPENSION_CHECK_MS = 30_000;
const suspensionCache = new Map<string, { suspended: boolean; at: number }>();

export async function isUserSuspended(userId: string): Promise<boolean> {
  const hit = suspensionCache.get(userId);
  if (hit && Date.now() - hit.at < SUSPENSION_CHECK_MS) return hit.suspended;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { suspendedAt: true } });
  const suspended = !!user?.suspendedAt;
  suspensionCache.set(userId, { suspended, at: Date.now() });
  return suspended;
}

export function forgetSuspension(userId: string) {
  suspensionCache.delete(userId);
}

export function isAdminSession(session: Session | null): boolean {
  return session?.user?.role === "ADMIN";
}

// The signed-in student the student pages are rendered for
export async function getStudentViewer(): Promise<{ id: string; name: string } | null> {
  const session = await getServerSession(authOptions);
  // Layouts don't re-run on in-app navigation, so the pages check suspension too
  if (session?.suspended) redirect("/login?suspended=1");
  if (!session?.user?.id) return null;
  return { id: session.user.id, name: session.user.name ?? "Student" };
}

export function roleHome(role: Role) {
  switch (role) {
    case "STUDENT":
      return "/app/student";
    case "TEACHER":
      return "/app/teacher";
    case "ADMIN":
      return "/app/admin";
    default:
      return "/app/student";
  }
}
