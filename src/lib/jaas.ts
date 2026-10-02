// JaaS (Jitsi as a Service, 8x8.vc) helpers.
//
// The public meet.jit.si server can't be told who the moderator is. JaaS can:
// we sign a short-lived JWT per person joining, with `moderator: "true"` for
// the class's teacher and `"false"` for the student. Keys come from env:
//   JAAS_APP_ID       vpaas-magic-cookie-...
//   JAAS_KEY_ID       vpaas-magic-cookie-.../xxxxxx   (JWT `kid`)
//   JAAS_PRIVATE_KEY  the downloaded .pk key; with or without BEGIN/END lines,
//                     real newlines or literal \n
// When any of them is missing or invalid, getJaasConfig() returns null and the
// class room keeps using public meet.jit.si.

import crypto from "crypto";

export type JaasConfig = {
  appId: string;
  keyId: string;
  privateKey: crypto.KeyObject;
};

let cached: JaasConfig | null | undefined;

// Accept the key however it was pasted into .env and rebuild a proper PEM
function parsePrivateKey(raw: string): crypto.KeyObject {
  const body = raw
    .replace(/\\n/g, "\n")
    .replace(/-----[A-Z ]+-----/g, "")
    .replace(/\s+/g, "");
  const lines = body.match(/.{1,64}/g)?.join("\n") ?? "";
  try {
    return crypto.createPrivateKey(`-----BEGIN PRIVATE KEY-----\n${lines}\n-----END PRIVATE KEY-----\n`);
  } catch {
    return crypto.createPrivateKey(
      `-----BEGIN RSA PRIVATE KEY-----\n${lines}\n-----END RSA PRIVATE KEY-----\n`
    );
  }
}

export function getJaasConfig(): JaasConfig | null {
  if (cached !== undefined) return cached;
  const appId = process.env.JAAS_APP_ID?.trim();
  const keyId = process.env.JAAS_KEY_ID?.trim();
  const rawKey = process.env.JAAS_PRIVATE_KEY?.trim();
  if (!appId || !keyId || !rawKey) {
    cached = null;
    return cached;
  }
  try {
    cached = { appId, keyId, privateKey: parsePrivateKey(rawKey) };
  } catch (e) {
    console.error("[jaas] JAAS_PRIVATE_KEY is not a valid private key; using meet.jit.si", e);
    cached = null;
  }
  return cached;
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

// Token for one person joining a class room. Valid for 6 hours, so a long
// class or a page left open still rejoins without a reload.
export function createJaasJwt(
  config: JaasConfig,
  {
    user,
    moderator,
  }: {
    user: { id: string; name: string; email?: string | null };
    moderator: boolean;
  }
): { appId: string; jwt: string } {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT", kid: config.keyId };
  const payload = {
    aud: "jitsi",
    iss: "chat",
    sub: config.appId,
    room: "*",
    iat: now,
    nbf: now - 10,
    exp: now + 6 * 60 * 60,
    context: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email ?? "",
        avatar: "",
        moderator: moderator ? "true" : "false",
      },
      // The academy records classes with its own recorder
      features: {
        livestreaming: "false",
        recording: "false",
        transcription: "false",
        "outbound-call": "false",
      },
    },
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(unsigned), config.privateKey);
  return { appId: config.appId, jwt: `${unsigned}.${base64url(signature)}` };
}
