import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
    suspended?: boolean; // set (with no user) when the admin suspended this account
  }

  interface User {
    role: Role;
    accessExpiresAt?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    accessExpiresAt?: number | null; // ms epoch; free-trial logins only
  }
}
