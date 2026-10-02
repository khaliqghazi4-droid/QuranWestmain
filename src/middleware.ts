import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ROLE_HOMES = ["student", "teacher", "admin"] as const;

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const role = (token?.role as string | undefined)?.toLowerCase();
  if (!token || !role || !ROLE_HOMES.includes(role as (typeof ROLE_HOMES)[number])) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Free-trial login has ended: sign them out and explain on the login page
  if (typeof token.accessExpiresAt === "number" && Date.now() >= token.accessExpiresAt) {
    const res = NextResponse.redirect(new URL("/login?expired=1", req.url));
    res.cookies.delete("next-auth.session-token");
    res.cookies.delete("__Secure-next-auth.session-token");
    return res;
  }

  if (pathname === "/app" || pathname === "/app/") {
    return NextResponse.redirect(new URL(`/app/${role}`, req.url));
  }

  // Route protection by role
  if (pathname.startsWith("/app/student") && role !== "student") {
    return NextResponse.redirect(new URL(`/app/${role}`, req.url));
  }
  if (pathname.startsWith("/app/teacher") && role !== "teacher") {
    return NextResponse.redirect(new URL(`/app/${role}`, req.url));
  }
  if (pathname.startsWith("/app/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(`/app/${role}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
