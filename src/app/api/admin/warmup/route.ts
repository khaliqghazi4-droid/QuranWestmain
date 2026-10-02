import { warmAllAdminCaches } from "@/app/app/admin/_caches";

// Called by Vercel Cron every 5 minutes to keep all admin caches hot.
// Protects against: Neon cold starts, Next.js cache expiry (10 min TTL).
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const start = Date.now();
  await warmAllAdminCaches();

  return Response.json({ ok: true, ms: Date.now() - start, ts: new Date().toISOString() });
}
