import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pingEnrollDb } from "@/lib/enroll-source";
import { isDailyConfigured } from "@/lib/daily";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Lightweight health endpoint used by UptimeRobot.
// Pings Postgres (Neon) and MongoDB (Atlas) so they don't suspend / cold-start.
export async function GET() {
  const start = Date.now();
  const [postgres, mongo] = await Promise.all([
    prisma
      .$queryRaw`SELECT 1`
      .then(() => true)
      .catch(() => false),
    pingEnrollDb(),
  ]);

  const ok = postgres; // Postgres is the critical one; Mongo is best-effort
  return NextResponse.json(
    {
      ok,
      postgres,
      mongo,
      // True iff DAILY_API_KEY + DAILY_DOMAIN env vars are set on the
      // serverless function — quick way to confirm the env was applied
      // after the Vercel redeploy without inspecting build logs.
      daily: isDailyConfigured(),
      ms: Date.now() - start,
      ts: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 }
  );
}
