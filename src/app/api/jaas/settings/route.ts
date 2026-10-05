import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// JaaS SETTINGS_PROVISIONING webhook. JaaS calls this before every meeting
// (body: { fqn: "<appId>/<room>" }) and applies the settings we return.
// Every class room gets a lobby: students (non-moderators) knock and wait
// until the teacher admits them, even if they arrive before the teacher.
//
// Set it up once in the JaaS Console → Webhooks → Add endpoint →
// https://<domain>/api/jaas/settings → event SETTINGS_PROVISIONING.
//
// No signature check: the response is the same fixed, non-secret settings
// for everyone, so a stranger calling this learns or changes nothing.
export async function POST() {
  return NextResponse.json({ lobbyEnabled: true, lobbyType: "WAIT_FOR_APPROVAL" });
}
